import { NextRequest, NextResponse } from 'next/server';
import { isDbAvailable, getPool, initDb } from '@/lib/db';
import { GUILD_DEFS } from '@/lib/guilds';

const UNAVAILABLE = NextResponse.json({ error: 'GUILD_UNAVAILABLE' }, { status: 503 });

// 敏感詞最小清單
const SENSITIVE_WORDS = ['色情', '賭博', '詐騙', '援交', '開槍', '炸彈', 'fuck', 'shit'];

// 聯絡方式 pattern：目標是擋「在公開版留下可被私下聯絡的帳號」，
// 但放行單純提及平台的正常討論（例：「我在 LINE 群看到」「用 IG 經營品牌」）。
const CONTACT_PATTERNS = [
  // 手機號（容許 - 或空白分隔）：0912345678 / 0912-345-678 / 0912 345 678
  /09\d{2}[\s-]?\d{3}[\s-]?\d{3}/,
  // LINE 帳號索取：line id/：帳號、line 直接接帳號、line.me 連結、賴/加賴/賴我/賴 + 帳號
  /line\s*(?:id|＠|@|[：:])?\s*[a-z0-9._-]{3,}/i,
  /line\.me\/(?:ti\/p|R\/)/i,
  /(?:賴|加賴|賴我|給賴|密賴)\s*(?:id|：|:|＠|@)?\s*[a-z0-9._-]{2,}/i,
  // IG / instagram 帳號索取（@帳號 或 明講私訊索取），放行單純提到 ig
  /(?:ig|instagram|限動)\s*(?:id|：|:|＠|@)?\s*@?[a-z0-9._]{3,}/i,
  // 其他即時通：微信/wechat、telegram/tg、whatsapp、skype、discord + 帳號
  /(?:微信|wechat|威信)\s*(?:id|：|:)?\s*[a-z0-9._-]{3,}/i,
  /(?:telegram|tg|whatsapp|skype|discord)\s*(?:id|：|:|＠|@)?\s*[a-z0-9._@-]{3,}/i,
  // 明講索取/給予聯絡方式：加我/密我/私我/聯絡我 + 賴/line/ig/微信/電話
  /(?:加我|密我|私我|聯絡我|傳我|寄我)\s*(?:的)?\s*(?:賴|line|ig|微信|wechat|電話|手機|信箱|email|mail)/i,
];

function containsContact(text: string): boolean {
  return CONTACT_PATTERNS.some((p) => p.test(text));
}

function containsSensitive(text: string): boolean {
  return SENSITIVE_WORDS.some((w) => text.toLowerCase().includes(w.toLowerCase()));
}

function countLinks(text: string): number {
  const urlPattern = /https?:\/\/\S+/g;
  const matches = text.match(urlPattern);
  return matches ? matches.length : 0;
}

// In-memory rate limiter: key -> [timestamp, ...]
const rateLimits: Map<string, number[]> = new Map();

function checkRateLimit(key: string, maxPerHour: number): boolean {
  const now = Date.now();
  const hourAgo = now - 60 * 60 * 1000;
  const existing = rateLimits.get(key)?.filter((t) => t > hourAgo) ?? [];
  if (existing.length >= maxPerHour) return false;
  existing.push(now);
  rateLimits.set(key, existing);
  return true;
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

export async function POST(req: NextRequest) {
  if (!isDbAvailable()) return UNAVAILABLE;

  let body: {
    guildId?: string;
    deviceId?: string;
    nickname?: string;
    content?: string;
    replyTo?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '請求格式錯誤' }, { status: 400 });
  }

  const { guildId, deviceId, nickname, content, replyTo } = body;

  if (!guildId || !deviceId || !nickname || !content) {
    return NextResponse.json({ error: '缺少必填欄位' }, { status: 400 });
  }

  if (!GUILD_DEFS.find((g) => g.id === guildId)) {
    return NextResponse.json({ error: '公會不存在' }, { status: 400 });
  }

  const isReply = !!replyTo;
  const maxLen = isReply ? 300 : 500;
  const minLen = 1;

  if (content.length < minLen || content.length > maxLen) {
    return NextResponse.json(
      { error: `內容需 ${minLen}–${maxLen} 字` },
      { status: 400 }
    );
  }

  if (countLinks(content) > 1) {
    return NextResponse.json({ error: '最多只能包含一個連結' }, { status: 400 });
  }

  if (containsContact(content)) {
    return NextResponse.json(
      { error: '保護自己，公開版面請不要留聯絡方式' },
      { status: 400 }
    );
  }

  if (containsSensitive(content)) {
    return NextResponse.json({ error: '內容含有不允許的詞彙，請修改後再試' }, { status: 400 });
  }

  // 限流：主貼 5/時，回覆 10/時，裝置 + IP 雙鍵
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const limitKey = `${deviceId}::${ip}`;
  const maxPerHour = isReply ? 10 : 5;
  if (!checkRateLimit(`${isReply ? 'reply' : 'post'}::${limitKey}`, maxPerHour)) {
    return NextResponse.json(
      { error: `發文太頻繁，請稍後再試（${isReply ? '回覆' : '主貼'}每小時上限 ${maxPerHour} 則）` },
      { status: 429 }
    );
  }

  try {
    await initDb();
    const pool = getPool();

    // 驗證 deviceId 是否為公會成員
    const memberRes = await pool.query(
      'SELECT nickname FROM guild_members WHERE guild_id=$1 AND device_id=$2',
      [guildId, deviceId]
    );
    if (memberRes.rows.length === 0) {
      return NextResponse.json({ error: '請先加入公會才能發文' }, { status: 403 });
    }

    // 若是回覆，驗證 replyTo 存在且屬於同一公會
    if (isReply) {
      const parentRes = await pool.query(
        'SELECT id FROM guild_posts WHERE id=$1 AND guild_id=$2 AND reply_to IS NULL',
        [replyTo, guildId]
      );
      if (parentRes.rows.length === 0) {
        return NextResponse.json({ error: '找不到要回覆的貼文' }, { status: 400 });
      }
    }

    const id = generateUUID();
    await pool.query(
      `INSERT INTO guild_posts (id, guild_id, device_id, nickname, content, reply_to)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, guildId, deviceId, nickname, content, replyTo ?? null]
    );

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error('[guild/post]', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
