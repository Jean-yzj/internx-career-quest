import { NextRequest, NextResponse } from 'next/server';
import { isDbAvailable, getPool, initProfileDb } from '@/lib/db';

const UNAVAILABLE = NextResponse.json({ error: 'PROFILE_UNAVAILABLE' }, { status: 503 });

export async function GET(req: NextRequest) {
  if (!isDbAvailable()) return UNAVAILABLE;

  const deviceId = req.nextUrl.searchParams.get('deviceId');
  if (!deviceId) {
    return NextResponse.json({ error: '缺少 deviceId' }, { status: 400 });
  }

  try {
    await initProfileDb();
    const pool = getPool();

    const result = await pool.query(
      'SELECT * FROM profiles WHERE device_id = $1',
      [deviceId]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    }

    const row = result.rows[0];

    // Compute rank
    const rankRes = await pool.query(
      'SELECT COUNT(*)+1 AS rank FROM profiles WHERE total_points > $1',
      [row.total_points]
    );
    const rank = Number(rankRes.rows[0]?.rank ?? 1);

    return NextResponse.json({
      deviceId: row.device_id,
      nickname: row.nickname,
      avatarId: row.avatar_id,
      grade: row.grade,
      hasResume: row.has_resume,
      hasClubExp: row.has_club,
      hasApplied: row.has_applied,
      birthYear: row.birth_year ?? null,
      goalRoleId: row.goal_role ?? null,
      transferCode: row.transfer_code,
      totalPoints: row.total_points,
      level: row.level,
      streak: row.streak,
      badgeCount: row.badge_count,
      registeredAt: row.created_at,
      rank,
    });
  } catch (err) {
    console.error('[profile/me]', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
