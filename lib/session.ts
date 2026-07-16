// lib/session.ts — 無依賴的 HMAC 簽章 token（session cookie + OAuth state 共用）
// 只用 Node 內建 crypto，不裝任何套件。
// token 格式：base64url(payloadJSON) + "." + base64url(HMAC-SHA256(payload))

import { createHmac, timingSafeEqual } from 'crypto';

function secret(): string {
  return process.env.SESSION_SECRET || '';
}

export function hasSessionSecret(): boolean {
  return !!process.env.SESSION_SECRET;
}

function sign(payloadB64: string): string {
  return createHmac('sha256', secret()).update(payloadB64).digest('base64url');
}

/** 對物件簽章，maxAgeSec 給定時寫入 exp（秒）。 */
export function signToken(obj: Record<string, unknown>, maxAgeSec?: number): string {
  const now = Math.floor(Date.now() / 1000);
  const body: Record<string, unknown> = { ...obj, iat: now };
  if (maxAgeSec) body.exp = now + maxAgeSec;
  const payloadB64 = Buffer.from(JSON.stringify(body)).toString('base64url');
  return `${payloadB64}.${sign(payloadB64)}`;
}

/** 驗簽 + 檢查 exp，通過回傳 payload，否則 null。 */
export function verifyToken<T = Record<string, unknown>>(token: string | undefined | null): T | null {
  if (!token || !secret()) return null;
  const dot = token.indexOf('.');
  if (dot < 0) return null;
  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(payloadB64);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const obj = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (typeof obj.exp === 'number' && Math.floor(Date.now() / 1000) > obj.exp) return null;
    return obj as T;
  } catch {
    return null;
  }
}
