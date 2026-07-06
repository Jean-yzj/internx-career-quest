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

function getTodayTaipei(): string {
  return new Date().toLocaleDateString('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).replace(/\//g, '-');
}

const DAY_POINTS_MAX = 240;
const LEVEL_MAX = 7;
const STREAK_MAX = 999;

export async function POST(req: NextRequest) {
  if (!isDbAvailable()) return UNAVAILABLE;

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: '請求格式錯誤' }, { status: 400 });
  }

  const { deviceId, totalPoints, level, streak, badgeCount } = body as Record<string, unknown>;

  if (!deviceId || typeof deviceId !== 'string') {
    return NextResponse.json({ error: '缺少 deviceId' }, { status: 400 });
  }

  // Rate limit: 60/hour per deviceId
  if (!checkRateLimit(`sync::${deviceId}::${ip}`, 60, 60 * 60 * 1000)) {
    return NextResponse.json({ error: '同步太頻繁，請稍後再試' }, { status: 429 });
  }

  const newPoints = Math.max(0, Math.floor(Number(totalPoints) || 0));
  const newLevel = Math.min(LEVEL_MAX, Math.max(1, Math.floor(Number(level) || 1)));
  const newStreak = Math.min(STREAK_MAX, Math.max(0, Math.floor(Number(streak) || 0)));
  const newBadgeCount = Math.max(0, Math.floor(Number(badgeCount) || 0));

  try {
    await initProfileDb();
    const pool = getPool();

    const result = await pool.query(
      'SELECT total_points, level, streak, last_sync_date, day_points FROM profiles WHERE device_id = $1',
      [deviceId]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    }

    const row = result.rows[0];
    const currentPoints: number = row.total_points;
    const today = getTodayTaipei();

    // Reset day_points if new day
    let currentDayPoints: number = row.last_sync_date === today ? row.day_points : 0;

    // Clamp: cannot decrease
    const effectivePoints = Math.max(newPoints, currentPoints);

    // Day increment cap
    const increment = effectivePoints - currentPoints;
    if (increment > 0) {
      const allowed = Math.min(increment, DAY_POINTS_MAX - currentDayPoints);
      const actualPoints = currentPoints + Math.max(0, allowed);
      currentDayPoints = Math.min(DAY_POINTS_MAX, currentDayPoints + increment);

      await pool.query(
        `UPDATE profiles
         SET total_points = $1,
             level = $2,
             streak = $3,
             badge_count = $4,
             last_sync_date = $5,
             day_points = $6,
             updated_at = now()
         WHERE device_id = $7`,
        [actualPoints, newLevel, newStreak, newBadgeCount, today, currentDayPoints, deviceId]
      );

      return NextResponse.json({ ok: true, totalPoints: actualPoints });
    }

    // No increment or clamped — just update level/streak/badge
    await pool.query(
      `UPDATE profiles
       SET total_points = $1,
           level = $2,
           streak = $3,
           badge_count = $4,
           last_sync_date = $5,
           day_points = $6,
           updated_at = now()
       WHERE device_id = $7`,
      [currentPoints, newLevel, newStreak, newBadgeCount, today, currentDayPoints, deviceId]
    );

    return NextResponse.json({ ok: true, totalPoints: currentPoints });
  } catch (err) {
    console.error('[profile/sync]', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
