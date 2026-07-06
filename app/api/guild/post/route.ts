import { NextRequest, NextResponse } from 'next/server';
import { isDbAvailable, getPool, initDb } from '@/lib/db';
import { GUILD_DEFS } from '@/lib/guilds';

const UNAVAILABLE = NextResponse.json({ error: 'GUILD_UNAVAILABLE' }, { status: 503 });

// 敏感詞最小清單
const SENSITIVE_WORDS = ['色情', '賭博', '詐騙', '援交', '開槍', '炸彈', 'fuck', 'shit'];

// 聯絡方式 pattern（手機號、LINE ID）
const CONTACT_PATTERNS = [
  /09\d{8}/,
  /line\s*[id：:]\s*\S+/i,
  /line\.me\/ti\/p\//i,
  /linetc|lineid/i,
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
