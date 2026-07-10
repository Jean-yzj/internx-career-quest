/**
 * GET /api/jobs/counts
 * 回傳各 roleId 的 active 實習數 { ok, counts: { product_manager: 4, ... } }
 * 無 DATABASE_URL → counts 為空物件（前端降級顯示，不報錯）
 */

import { NextResponse } from 'next/server';
import { getJobCounts, initJobsTable } from '@/lib/jobs';
import { isDbAvailable } from '@/lib/db';

export async function GET() {
  if (!isDbAvailable()) return NextResponse.json({ ok: true, counts: {} });
  try {
    await initJobsTable();
    const counts = await getJobCounts();
    return NextResponse.json({ ok: true, counts });
  } catch {
    return NextResponse.json({ ok: true, counts: {} });
  }
}
