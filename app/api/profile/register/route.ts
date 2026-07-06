import { NextRequest, NextResponse } from 'next/server';
import { isDbAvailable, getPool, initProfileDb } from '@/lib/db';

const UNAVAILABLE = NextResponse.json({ error: 'PROFILE_UNAVAILABLE' }, { status: 503 });

// Sensitive words (same list as guild)
const SENSITIVE_WORDS = ['色情', '賭博', '詐騙', '援交', '開槍', '炸彈', 'fuck', 'shit'];
function containsSensitive(text: string): boolean {
  return SENSITIVE_WORDS.some((w) => text.toLowerCase().includes(w.toLowerCase()));
}

// In-memory rate limiter: key -> [timestamp, ...]
const rateLimits: Map<string, number[]> = new Map();
function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const cutoff = now - windowMs;
  const existing = rateLimits.get(key)?.filter((t) => t > cutoff) ?? [];
  if (existing.length >= max) return false;
  existing.push(now);
  rateLimits.set(key, existing);
  return true;
}

function generateTransferCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  for (const b of arr) code += chars[b % chars.length];
  return code;
}

const VALID_GRADES = new Set(['y1', 'y2', 'y3', 'y4', 'grad', 'fresh']);
const VALID_AVATAR_IDS = new Set([1, 2, 3, 4, 5, 6]);

export async function POST(req: NextRequest) {
  if (!isDbAvailable()) return UNAVAILABLE;

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!checkRateLimit(`register::${ip}`, 3, 24 * 60 * 60 * 1000)) {
    return NextResponse.json({ error: '今日註冊次數已達上限，請明天再試' }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: '請求格式錯誤' }, { status: 400 });
  }

  const {
    deviceId, nickname, avatarId, grade,
    hasResume, hasClubExp, hasApplied,
    birthYear, goalRoleId,
  } = body as Record<string, unknown>;

  if (!deviceId || typeof deviceId !== 'string') {
    return NextResponse.json({ error: '缺少 deviceId' }, { status: 400 });
  }
  if (!nickname || typeof nickname !== 'string' || nickname.length < 2 || nickname.length > 12) {
    return NextResponse.json({ error: '暱稱需 2–12 字' }, { status: 400 });
  }
  if (containsSensitive(nickname)) {
    return NextResponse.json({ error: '暱稱含有不允許的詞彙' }, { status: 400 });
  }
  if (!VALID_AVATAR_IDS.has(Number(avatarId))) {
    return NextResponse.json({ error: '無效頭像' }, { status: 400 });
  }
  if (!grade || typeof grade !== 'string' || !VALID_GRADES.has(grade)) {
    return NextResponse.json({ error: '無效年級' }, { status: 400 });
  }

  const transferCode = generateTransferCode();

  try {
    await initProfileDb();
    const pool = getPool();

    // Upsert: if deviceId already exists, return existing transferCode
    const existing = await pool.query(
      'SELECT transfer_code FROM profiles WHERE device_id = $1',
      [deviceId]
    );
    if (existing.rows.length > 0) {
      return NextResponse.json({ ok: true, transferCode: existing.rows[0].transfer_code });
    }

    await pool.query(
      `INSERT INTO profiles
        (device_id, nickname, avatar_id, grade, has_resume, has_club, has_applied,
         birth_year, goal_role, transfer_code)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        deviceId,
        nickname,
        Number(avatarId),
        grade,
        !!hasResume,
        !!hasClubExp,
        !!hasApplied,
        birthYear ? Number(birthYear) : null,
        goalRoleId ?? null,
        transferCode,
      ]
    );

    return NextResponse.json({ ok: true, transferCode });
  } catch (err) {
    console.error('[profile/register]', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
