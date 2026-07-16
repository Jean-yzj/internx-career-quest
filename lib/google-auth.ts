// lib/google-auth.ts — 手刻 Google OAuth 2.0 authorization code flow，不裝套件。
// 啟用條件：GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET + SESSION_SECRET 都存在。
// 未設定時上層一律隱藏登入入口（isGoogleAuthEnabled() === false）。

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

export function isGoogleAuthEnabled(): boolean {
  return !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.SESSION_SECRET
  );
}

/** 優先用環境變數指定的 redirect（正式站建議設定，才不依賴 Host 標頭）。 */
export function resolveRedirectUri(origin: string): string {
  return process.env.GOOGLE_REDIRECT_URI || `${origin}/api/auth/google/callback`;
}

/**
 * 解析對外可見的 origin，供所有跳轉使用。
 * Zeabur/Cloudflare 代理下 req.nextUrl.origin 會是容器內部的 http://localhost:8080，
 * 直接拿來組跳轉會把使用者導去 localhost。優先序：
 *   1) GOOGLE_REDIRECT_URI 的 origin（單一事實來源；啟用登入時本來就要設）
 *   2) proxy 轉發標頭 x-forwarded-host / x-forwarded-proto
 *   3) 請求本身的 origin（保底）
 */
export function resolvePublicOrigin(
  reqOrigin: string,
  forwardedHost?: string | null,
  forwardedProto?: string | null
): string {
  const rd = process.env.GOOGLE_REDIRECT_URI;
  if (rd) {
    try {
      return new URL(rd).origin;
    } catch {
      /* malformed env, fall through */
    }
  }
  if (forwardedHost) return `${forwardedProto || 'https'}://${forwardedHost}`;
  return reqOrigin;
}

export function buildAuthUrl(state: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account',
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export interface GoogleIdentity {
  sub: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
}

/** 用 authorization code 換 id_token，解出使用者身分。 */
export async function exchangeCodeForIdentity(code: string, redirectUri: string): Promise<GoogleIdentity> {
  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`token exchange failed: ${res.status} ${t.slice(0, 200)}`);
  }
  const json = (await res.json()) as { id_token?: string };
  if (!json.id_token) throw new Error('no id_token in token response');
  return decodeIdToken(json.id_token);
}

// id_token 由 Google token endpoint 直接經 TLS + client_secret 取得，內容可信任；
// 這裡只解 payload，不做 JWKS 簽章驗證（server-side code flow 的標準做法）。
export function decodeIdToken(idToken: string): GoogleIdentity {
  const parts = idToken.split('.');
  if (parts.length !== 3) throw new Error('malformed id_token');
  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  return {
    sub: String(payload.sub || ''),
    email: payload.email ?? null,
    emailVerified: payload.email_verified === true || payload.email_verified === 'true',
    name: payload.name ?? null,
  };
}
