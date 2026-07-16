import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { isGoogleAuthEnabled, buildAuthUrl, resolveRedirectUri, resolvePublicOrigin } from '@/lib/google-auth';
import { signToken } from '@/lib/session';

// 導向 Google 授權頁。state 內綁定目前裝置 id（用來事後綁定），HMAC 簽章 + 10 分鐘效期。
export async function GET(req: NextRequest) {
  const origin = resolvePublicOrigin(
    req.nextUrl.origin,
    req.headers.get('x-forwarded-host'),
    req.headers.get('x-forwarded-proto')
  );
  if (!isGoogleAuthEnabled()) {
    return NextResponse.redirect(new URL('/profile', origin));
  }

  const device = req.nextUrl.searchParams.get('device') || '';
  const nonce = randomBytes(8).toString('hex');
  const state = signToken({ did: device, n: nonce }, 600);
  const redirectUri = resolveRedirectUri(origin);

  const res = NextResponse.redirect(buildAuthUrl(state, redirectUri));
  // 對照用的 state cookie（CSRF 防護）
  res.cookies.set('icq_oauth_state', state, {
    httpOnly: true,
    secure: origin.startsWith('https'),
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });
  return res;
}
