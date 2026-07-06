import { NextRequest, NextResponse } from 'next/server';
import { ParseRequestSchema, ParsedJobSchema } from '@/lib/parse-schema';
import { fallbackParse } from '@/lib/fallback-parser';

export const dynamic = 'force-dynamic';

// In-memory rate limiter (resets on restart — acceptable per spec)
interface RateBucket {
  minuteCount: number;
  minuteResetAt: number;
  dayCount: number;
  dayResetAt: number;
}

const rateLimitStore = new Map<string, RateBucket>();

const RATE_PER_MIN = 10;
const RATE_PER_DAY = 100;

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

function checkRateLimit(ip: string): { ok: boolean; message?: string } {
  const now = Date.now();
  let bucket = rateLimitStore.get(ip);

  if (!bucket) {
    bucket = {
      minuteCount: 0,
      minuteResetAt: now + 60_000,
      dayCount: 0,
      dayResetAt: now + 86_400_000,
    };
  }

  if (now > bucket.minuteResetAt) {
    bucket.minuteCount = 0;
    bucket.minuteResetAt = now + 60_000;
  }

  if (now > bucket.dayResetAt) {
    bucket.dayCount = 0;
    bucket.dayResetAt = now + 86_400_000;
  }

  if (bucket.minuteCount >= RATE_PER_MIN) {
    rateLimitStore.set(ip, bucket);
    return { ok: false, message: '每分鐘上限 10 次，請稍後再試。' };
  }

  if (bucket.dayCount >= RATE_PER_DAY) {
    rateLimitStore.set(ip, bucket);
    return { ok: false, message: '今日辨識次數已達上限（100 次），明天再來吧。' };
  }

  bucket.minuteCount++;
  bucket.dayCount++;
  rateLimitStore.set(ip, bucket);
  return { ok: true };
}

function errorEnvelope(code: string, message: string, status: number) {
  return NextResponse.json({ ok: false, error: { code, message } }, { status });
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimitResult = checkRateLimit(ip);

  if (!rateLimitResult.ok) {
    return errorEnvelope('RATE_LIMIT', rateLimitResult.message!, 429);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorEnvelope('INVALID_JSON', '請求格式錯誤', 400);
  }

  const validation = ParseRequestSchema.safeParse(body);
  if (!validation.success) {
    const msg = validation.error.errors[0]?.message ?? '輸入驗證失敗';
    return errorEnvelope('VALIDATION', msg, 400);
  }

  const { text } = validation.data;
  const startAt = Date.now();

  const apiKey = process.env.OPENAI_API_KEY;

  // Use fallback if no API key
  if (!apiKey || apiKey.trim() === '') {
    const result = fallbackParse(text);
    const elapsed = Date.now() - startAt;
    // Log only metrics, no content
    console.log(`[parse] engine=fallback len=${text.length} elapsed=${elapsed}ms ok=true`);
    return NextResponse.json({ ok: true, data: { ...result, engine: 'fallback' } });
  }

  // Try LLM with 1 retry
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { default: OpenAI } = await import('openai');
      const client = new OpenAI({ apiKey });
      const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 18_000);

      const prompt = `你是台灣職缺辨識助手。請從以下職缺文字中提取結構化欄位。
規則：
1. 找不到的欄位請回 null，絕不編造（截止日寧缺勿錯）
2. 日期格式統一 YYYY-MM-DD，無年份時取「未過期的最近那一年」
3. industryGuess 必須從：科技/金融/顧問/快消/電商/新創/教育/媒體/醫療/傳產/非營利/其他 中選一，或 null
4. sourceGuess 從：104/cakeresume/yourator/linkedin/company_site/other 中選一
5. fieldConfidence 中 company/title/deadline 各填 h（高）/m（中）/l（低）
6. 以 JSON 直接回覆，不要 markdown code block

職缺文字：
${text}

JSON 格式：
{
  "company": string|null,
  "title": string|null,
  "location": string|null,
  "salaryText": string|null,
  "deadline": string|null,
  "weeklyDaysText": string|null,
  "gradeRequirement": string|null,
  "skillsRequired": string[],
  "skillsNice": string[],
  "industryGuess": string|null,
  "sourceGuess": string|null,
  "fieldConfidence": {"company":"h"|"m"|"l","title":"h"|"m"|"l","deadline":"h"|"m"|"l"}
}`;

      const completion = await client.chat.completions.create(
        {
          model,
          temperature: 0,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
        },
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      const content = completion.choices[0]?.message?.content ?? '';
      const parsed = JSON.parse(content);
      const validated = ParsedJobSchema.safeParse(parsed);

      if (!validated.success) {
        if (attempt < 1) continue;
        // Both attempts failed validation — use fallback
        const result = fallbackParse(text);
        const elapsed = Date.now() - startAt;
        console.log(`[parse] engine=fallback len=${text.length} elapsed=${elapsed}ms ok=true reason=validation_fail`);
        return NextResponse.json({ ok: true, data: { ...result, engine: 'fallback' } });
      }

      const elapsed = Date.now() - startAt;
      console.log(`[parse] engine=ai len=${text.length} elapsed=${elapsed}ms ok=true`);
      return NextResponse.json({ ok: true, data: { ...validated.data, engine: 'ai' } });
    } catch (err: unknown) {
      const elapsed = Date.now() - startAt;
      const isAbort = err instanceof Error && err.name === 'AbortError';
      console.log(`[parse] engine=ai len=${text.length} elapsed=${elapsed}ms ok=false attempt=${attempt} abort=${isAbort}`);
      if (attempt < 1) continue;
      // Fall through to fallback
    }
  }

  // LLM failed both attempts — use fallback
  const result = fallbackParse(text);
  const elapsed = Date.now() - startAt;
  console.log(`[parse] engine=fallback len=${text.length} elapsed=${elapsed}ms ok=true reason=llm_fail`);
  return NextResponse.json({ ok: true, data: { ...result, engine: 'fallback' } });
}
