import { NextRequest, NextResponse } from 'next/server';
import { isDbAvailable, getPool, initProfileDb } from '@/lib/db';

const UNAVAILABLE = NextResponse.json({ error: 'PROFILE_UNAVAILABLE' }, { status: 503 });

export async function POST(req: NextRequest) {
  if (!isDbAvailable()) return UNAVAILABLE;

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: '請求格式錯誤' }, { status: 400 });
  }

  const { transferCode, newDeviceId } = body as Record<string, unknown>;

  if (!transferCode || typeof transferCode !== 'string') {
    return NextResponse.json({ error: '缺少引繼碼' }, { status: 400 });
  }
  if (!newDeviceId || typeof newDeviceId !== 'string') {
    return NextResponse.json({ error: '缺少 newDeviceId' }, { status: 400 });
  }

  try {
    await initProfileDb();
    const pool = getPool();

    // Find profile by transferCode
    const result = await pool.query(
      'SELECT * FROM profiles WHERE transfer_code = $1',
      [transferCode.toUpperCase()]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: '引繼碼無效或已使用' }, { status: 404 });
    }

    const row = result.rows[0];

    // Check new deviceId doesn't already have a profile
    const existing = await pool.query(
      'SELECT device_id FROM profiles WHERE device_id = $1',
      [newDeviceId]
    );
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: '此裝置已有帳號' }, { status: 409 });
    }

    // Update device_id to newDeviceId, old device_id becomes orphaned
    await pool.query(
      'UPDATE profiles SET device_id = $1, updated_at = now() WHERE transfer_code = $2',
      [newDeviceId, transferCode.toUpperCase()]
    );

    return NextResponse.json({
      ok: true,
      profile: {
        deviceId: newDeviceId,
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
        registeredAt: row.created_at,
      },
    });
  } catch (err) {
    console.error('[profile/transfer]', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
