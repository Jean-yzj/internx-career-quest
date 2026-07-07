/**
 * GET /api/jobs?role=product_manager&limit=20
 * 回傳 active 職缺列表；無 DATABASE_URL → 503
 */

import { NextRequest, NextResponse } from 'next/server';
import { isDbAvailable } from '@/lib/db';
import { getJobs, initJobsTable, startJobsScheduler } from '@/lib/jobs';

export const dynamic = 'force-dynamic';

// 啟動排程（module-level singleton，僅 server 端執行一次）
if (typeof window === 'undefined' && isDbAvailable()) {
  initJobsTable()
    .then(() => startJobsScheduler())
    .catch((e) => console.error('[jobs] init error:', e));
}

export async function GET(req: NextRequest) {
  if (!isDbAvailable()) {
    return NextResponse.json({ error: 'JOBS_UNAVAILABLE' }, { status: 503 });
  }

  const { searchParams } = req.nextUrl;
  const roleId = searchParams.get('role') ?? 'product_manager';
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50);

  try {
    const jobs = await getJobs(roleId, limit);
    return NextResponse.json({ ok: true, role: roleId, jobs });
  } catch (err) {
    console.error('[GET /api/jobs]', err);
    return NextResponse.json({ error: 'QUERY_FAILED' }, { status: 500 });
  }
}
