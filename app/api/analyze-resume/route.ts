import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getRoleById } from '@/lib/roles';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// In-memory rate limiter: 5 requests/day/IP
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const DAILY_LIMIT = 5;

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  let bucket = rateLimitStore.get(ip);
  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + 86_400_000 };
  }
  if (bucket.count >= DAILY_LIMIT) {
    rateLimitStore.set(ip, bucket);
    return false;
  }
  bucket.count++;
  rateLimitStore.set(ip, bucket);
  return true;
}

// PII masking — per spec §6 (03 §9 rules)
function maskPII(text: string): string {
  return text
    // Taiwan ID
    .replace(/[A-Z][12]\d{8}/g, '[MASKED-ID]')
    // Phone numbers
    .replace(/09\d{8}/g, '[MASKED-PHONE]')
    .replace(/\+886\s*9\d{8}/g, '[MASKED-PHONE]')
    // Email account part
    .replace(/[\w.+-]+@([\w-]+\.)+[\w]{2,}/g, '[MASKED-EMAIL]')
    // Address lines (heuristic)
    .replace(/([\d一二三四五六七八九十百千萬]+)([路街道巷弄號樓室])/g, '[MASKED-ADDR]$2');
}

// Forbidden phrases linter
const FORBIDDEN_PATTERNS = [
  /你一定/g,
  /保證(錄取|上)/g,
  /絕對(會|能)/g,
  /錄取率\s*\d+%/g,
  /你不適合/g,
  /放棄(這個)?(職位|方向)/g,
];

const REPLACEMENT = '建議可以針對這個方向持續補強。';

function lintForbidden(text: string): string {
  let result = text;
  for (const pat of FORBIDDEN_PATTERNS) {
    result = result.replace(pat, REPLACEMENT);
  }
  return result;
}

function lintOutput(obj: unknown): unknown {
  if (typeof obj === 'string') return lintForbidden(obj);
  if (Array.isArray(obj)) return obj.map(lintOutput);
  if (obj && typeof obj === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = lintOutput(v);
    }
    return out;
  }
  return obj;
}

const AnalysisResultSchema = z.object({
  dimensions: z.object({
    relevance: z.number().min(1).max(5),
    evidence: z.number().min(1).max(5),
    completeness: z.number().min(1).max(5),
    readability: z.number().min(1).max(5),
    credibility: z.number().min(1).max(5),
    industry_fit: z.number().min(1).max(5),
  }),
  overall: z.number().min(0).max(100),
  issues: z.array(z.object({
    category: z.string(),
    severity: z.enum(['紅線', '警告', '微調']),
    quote: z.string().optional(),
    suggestion: z.string(),
  })).max(6),
  strengths: z.array(z.string()).max(3),
  skillEvidence: z.array(z.object({
    skillKey: z.string(),
    strength: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  })),
  checklist: z.record(z.boolean()),
  confidence: z.enum(['high', 'medium', 'low']),
});

const RequestSchema = z.object({
  text: z.string().min(100).max(20000),
  roleId: z.string(),
});

// 回傳改為 SSE 串流：等 OpenAI 的 10-14 秒期間持續送心跳，避免 Cloudflare/Zeabur
// 對長閒置請求回 502（gateway idle timeout）。前端讀 stream、過濾心跳、取最終 data。
// AI 呼叫、PII 遮罩、zod 驗證、禁語過濾、rate limit 邏輯完全不變，只改傳輸方式。
export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let hb: ReturnType<typeof setInterval> | null = null;
      let closed = false;
      const finish = (obj: unknown) => {
        if (hb) { clearInterval(hb); hb = null; }
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
        } catch { /* controller 已關閉，忽略 */ }
        closed = true;
        try { controller.close(); } catch { /* ignore */ }
      };

      try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey || apiKey.trim() === '') {
          finish({ ok: false, error: { code: 'AI_UNAVAILABLE', message: 'AI 分析功能目前未啟用，請稍後再試。' } });
          return;
        }

        const ip = getClientIp(req);
        if (!checkRateLimit(ip)) {
          finish({ ok: false, error: { code: 'RATE_LIMIT', message: '今日分析次數已達上限（5 次），明天再來吧。' } });
          return;
        }

        let body: unknown;
        try {
          body = await req.json();
        } catch {
          finish({ ok: false, error: { code: 'INVALID_JSON', message: '請求格式錯誤' } });
          return;
        }

        const validation = RequestSchema.safeParse(body);
        if (!validation.success) {
          finish({ ok: false, error: { code: 'VALIDATION', message: validation.error.errors[0]?.message ?? '輸入驗證失敗' } });
          return;
        }

        const { text, roleId } = validation.data;
        const role = getRoleById(roleId);
        if (!role) {
          finish({ ok: false, error: { code: 'INVALID_ROLE', message: '不支援的職位類型' } });
          return;
        }

        const maskedText = maskPII(text);
        const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

        // Industry-specific rules
        const industryRules: Record<string, string> = {
          consultant: '金融/顧問特例：GPA 4.0 以上是明顯優勢；無個案競賽經驗要在 issues 中提及。',
          finance: '金融特例：缺少證照進度（金研院/CFA L1）需在 issues 中說明；GPA 是重要指標。',
          software_eng: '軟體工程特例：應有 GitHub 連結；無 side project 或 GitHub 要在 issues 中提及。',
          marketing: '行銷特例：作品集連結非常重要；無量化成效數字要標為警告。',
          ux_researcher: 'UXR 特例：需有研究方法論的正確使用；訪談場次或研究對象數量很重要。',
        };

        const industrySpecific = industryRules[roleId] ?? '';
        const skillsStr = role.skills.map((s) => `${s.key}(${s.label}, 權重${s.weight})`).join('、');

        const systemPrompt = `你是台灣新創與外商的資深人資，專門評估大學生求職履歷。你的任務是針對「${role.name}」職位分析以下履歷文字，輸出嚴格的 JSON。

## 六維評分 rubric（各 1-5 分）
- relevance（相關性）：過去經歷與 ${role.name} 的契合程度
- evidence（具體度）：成果有無量化數字、引用或具體細節
- completeness（完整性）：基本資料/學歷/經歷/技能/作品是否完整
- readability（可讀性）：排版清晰、無錯字、一鍵掃描的容易度
- credibility（可信度）：陳述是否合理一致、有無誇大包裝
- industry_fit（行業適合度）：是否展現對 ${role.name} 行業的了解

## 技能評估（strength: 0=無跡象 / 1=提及無證據 / 2=有具體成果）
職位技能：${skillsStr}

## 三色規則
紅線（人資秒刷）：有錯字、無任何量化成果、履歷超過 2 頁（明顯）、不專業信箱（cute**/xxx** 等）
警告（明顯弱點）：技能與職位不相關、無實習或專案、格式混亂
微調（小改善）：排版可優化、用詞可更精準、可增加關鍵字

${industrySpecific}

## 行為要求
- 找不到資訊就給低分並在 issues 說明，禁止腦補補值
- 每個 issue 必須有具體 suggestion（一句話可做的改善）
- strengths 最多 3 條，每條附原文依據
- 輸出純 JSON，不要 markdown code block`;

        const userPrompt = `目標職位：${role.name}

履歷文字：
${maskedText}

請輸出符合格式的 JSON 分析結果。`;

        // 進 AI 前開始送心跳，保持 origin→CF→前端 連線活躍
        hb = setInterval(() => {
          if (!closed) {
            try { controller.enqueue(encoder.encode(`: keep-alive\n\n`)); } catch { /* ignore */ }
          }
        }, 3000);

        // Try with 1 retry on validation failure
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const { default: OpenAI } = await import('openai');
            const client = new OpenAI({ apiKey });

            const controller2 = new AbortController();
            const timeoutId = setTimeout(() => controller2.abort(), 30_000);

            const completion = await client.chat.completions.create(
              {
                model,
                temperature: 0,
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: userPrompt },
                ],
                response_format: { type: 'json_object' },
              },
              { signal: controller2.signal }
            );

            clearTimeout(timeoutId);

            const content = completion.choices[0]?.message?.content ?? '';
            const parsed = JSON.parse(content);
            const validated = AnalysisResultSchema.safeParse(parsed);

            if (!validated.success) {
              if (attempt < 1) continue;
              finish({ ok: false, error: { code: 'AI_OUTPUT_INVALID', message: 'AI 回傳格式異常，請重試。' }, _debug: { zerr: validated.error.errors.slice(0, 6), sample: content.slice(0, 500) } });
              return;
            }

            // Deterministic post-processing: compute gaps
            const result = validated.data;
            const gaps = role.skills.map((s) => {
              const ev = result.skillEvidence.find((e) => e.skillKey === s.key);
              const strength = ev?.strength ?? 0;
              return {
                skillKey: s.key,
                label: s.label,
                weight: s.weight,
                strength,
                gapScore: s.weight * (2 - strength),
              };
            }).sort((a, b) => b.gapScore - a.gapScore).slice(0, 5);

            // Recommended task codes based on gaps
            const recommendedTaskCodes = Array.from(new Set(
              gaps.slice(0, 3).flatMap((g) => {
                if (g.strength === 0) return ['resume_analyzed', 'learn_resource'];
                if (g.strength === 1) return ['resume_improve', 'mini_artifact'];
                return ['read_target_3'];
              })
            )).slice(0, 5);

            const finalResult = {
              ...result,
              gaps,
              recommendedTaskCodes,
            };

            // Apply forbidden linter
            const linted = lintOutput(finalResult) as typeof finalResult;

            console.log(`[analyze-resume] roleId=${roleId} len=${text.length} overall=${result.overall} confidence=${result.confidence}`);
            finish({ ok: true, data: linted });
            return;
          } catch (err) {
            const isAbort = err instanceof Error && err.name === 'AbortError';
            console.log(`[analyze-resume] attempt=${attempt} abort=${isAbort} err=${String(err).slice(0, 100)}`);
            if (attempt < 1) continue;
            finish({ ok: false, error: { code: 'AI_ERROR', message: 'AI 服務暫時無法使用，請稍後再試。' } });
            return;
          }
        }

        finish({ ok: false, error: { code: 'AI_ERROR', message: 'AI 服務暫時無法使用，請稍後再試。' } });
      } catch {
        finish({ ok: false, error: { code: 'AI_ERROR', message: 'AI 服務暫時無法使用，請稍後再試。' } });
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      // 阻止 nginx/proxy 緩衝，確保心跳即時 flush 到前端
      'X-Accel-Buffering': 'no',
    },
  });
}
