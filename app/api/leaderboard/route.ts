import { NextRequest, NextResponse } from 'next/server';
import { isDbAvailable, getPool, initProfileDb } from '@/lib/db';

const UNAVAILABLE = NextResponse.json({ error: 'PROFILE_UNAVAILABLE' }, { status: 503 });

// In-memory rate limiter
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

export async function GET(req: NextRequest) {
  if (!isDbAvailable()) return UNAVAILABLE;

  const deviceId = req.nextUrl.searchParams.get('deviceId') ?? '';
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  if (!checkRateLimit(`lb::${ip}`, 30, 60 * 1000)) {
    return NextResponse.json({ error: '請求太頻繁，請稍後再試' }, { status: 429 });
  }

  try {
    await initProfileDb();
    const pool = getPool();

    // Top 20
    const topResult = await pool.query(
      `SELECT device_id, nickname, avatar_id, level, total_points
       FROM profiles
       ORDER BY total_points DESC, created_at ASC
       LIMIT 20`
    );

    const top20 = topResult.rows.map((r, i) => ({
      rank: i + 1,
      deviceId: r.device_id,
      nickname: r.nickname,
      avatarId: r.avatar_id,
      level: r.level,
      totalPoints: r.total_points,
    }));

    // Self rank
    let selfRank: number | null = null;
    let selfPoints: number | null = null;
    if (deviceId) {
      const selfResult = await pool.query(
        'SELECT total_points FROM profiles WHERE device_id = $1',
        [deviceId]
      );
      if (selfResult.rows.length > 0) {
        selfPoints = selfResult.rows[0].total_points;
        const rankResult = await pool.query(
          'SELECT COUNT(*)+1 AS rank FROM profiles WHERE total_points > $1',
          [selfPoints]
        );
        selfRank = Number(rankResult.rows[0]?.rank ?? 1);
      }
    }

    return NextResponse.json({ top20, selfRank, selfPoints });
  } catch (err) {
    console.error('[leaderboard]', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
