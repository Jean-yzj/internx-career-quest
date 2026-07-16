import { NextRequest, NextResponse } from 'next/server';
import { isGoogleAuthEnabled, exchangeCodeForIdentity, resolveRedirectUri } from '@/lib/google-auth';
import { signToken, verifyToken } from '@/lib/session';
import { isDbAvailable, getPool, initProfileDb } from '@/lib/db';

const SESSION_MAX_AGE = 180 * 24 * 3600; // 180 天

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const back = (q: string) => NextResponse.redirect(new URL(`/profile?login=${q}`, origin));

  if (!isGoogleAuthEnabled()) return NextResponse.redirect(new URL('/profile', origin));

  const url = req.nextUrl;
  if (url.searchParams.get('error')) return back('denied');
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (!code || !state) return back('error');

  // 驗 state：cookie 對照 + 簽章 + 效期
  const cookieState = req.cookies.get('icq_oauth_state')?.value;
  if (!cookieState || cookieState !== state) return back('error');
  const stateData = verifyToken<{ did: string; n: string }>(state);
  if (!stateData) return back('error');

  // 換 token → 拿到 Google 身分
  let identity;
  try {
    identity = await exchangeCodeForIdentity(code, resolveRedirectUri(origin));
  } catch (e) {
    console.error('[auth/callback] exchange', e);
    return back('error');
  }
  if (!identity.sub) return back('error');

  if (!isDbAvailable()) return back('error');

  let canonicalDeviceId = stateData.did;
  try {
    await initProfileDb();
    const pool = getPool();

    // 1) 已有綁定同一 Google 的檔案 → 找回（跨裝置）
    const byGoogle = await pool.query(
      'SELECT device_id FROM profiles WHERE google_id = $1 LIMIT 1',
      [identity.sub]
    );
    if (byGoogle.rows.length > 0) {
      canonicalDeviceId = byGoogle.rows[0].device_id;
      await pool.query(
        'UPDATE profiles SET email = COALESCE($2, email), updated_at = now() WHERE device_id = $1',
        [canonicalDeviceId, identity.email]
      );
    } else if (stateData.did) {
      // 2) 目前裝置已有檔案 → 綁定 Google 到它
      const byDevice = await pool.query(
        'SELECT device_id FROM profiles WHERE device_id = $1',
        [stateData.did]
      );
      if (byDevice.rows.length === 0) return back('noprofile');
      await pool.query(
        'UPDATE profiles SET google_id = $2, email = COALESCE($3, email), updated_at = now() WHERE device_id = $1',
        [stateData.did, identity.sub, identity.email]
      );
      canonicalDeviceId = stateData.did;
    } else {
      return back('noprofile');
    }
  } catch (e) {
    console.error('[auth/callback] db', e);
    return back('error');
  }

  const session = signToken({ did: canonicalDeviceId, gid: identity.sub }, SESSION_MAX_AGE);
  const res = NextResponse.redirect(new URL('/profile?login=ok', origin));
  res.cookies.set('icq_session', session, {
    httpOnly: true,
    secure: url.protocol === 'https:',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
  res.cookies.set('icq_oauth_state', '', { path: '/', maxAge: 0 });
  return res;
}
