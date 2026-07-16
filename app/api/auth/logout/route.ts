import { NextResponse } from 'next/server';

// 清除 session cookie。本機遊戲資料不受影響（仍在 localStorage）。
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('icq_session', '', { path: '/', maxAge: 0 });
  return res;
}
