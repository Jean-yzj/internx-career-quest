import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/session';
import { isGoogleAuthEnabled } from '@/lib/google-auth';
import { isDbAvailable, getPool, initProfileDb } from '@/lib/db';

// 回傳登入狀態 + 正規 profile（供前端在跨裝置找回時採用）。
export async function GET(req: NextRequest) {
  if (!isGoogleAuthEnabled()) {
    return NextResponse.json({ enabled: false, authenticated: false });
  }

  const session = verifyToken<{ did: string; gid: string }>(req.cookies.get('icq_session')?.value);
  if (!session?.did) {
    return NextResponse.json({ enabled: true, authenticated: false });
  }
  if (!isDbAvailable()) {
    return NextResponse.json({ enabled: true, authenticated: false });
  }

  try {
    await initProfileDb();
    const r = await getPool().query('SELECT * FROM profiles WHERE device_id = $1', [session.did]);
    if (r.rows.length === 0) {
      // session 指向已不存在的檔案 → 視為未登入
      return NextResponse.json({ enabled: true, authenticated: false });
    }
    const row = r.rows[0];
    return NextResponse.json({
      enabled: true,
      authenticated: true,
      email: row.email ?? null,
      profile: {
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
        registeredAt: row.created_at,
      },
    });
  } catch (e) {
    console.error('[auth/me]', e);
    return NextResponse.json({ enabled: true, authenticated: false });
  }
}
