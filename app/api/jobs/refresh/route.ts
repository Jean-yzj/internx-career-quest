/**
 * POST /api/jobs/refresh
 * 手動觸發全職位抓取。需 x-admin-key header 對應 env ADMIN_KEY。
 * 無 DATABASE_URL 或 ADMIN_KEY 未設 → 503/401
 */

import { NextRequest, NextResponse } from 'next/server';
import { isDbAvailable } from '@/lib/db';
import { initJobsTable, refreshAllJobs } from '@/lib/jobs';

export const dynamic = 'force-dynamic';
// 抓完整批 10 職位每輪 2s 間隔，最多 20s + 請求時間，設 60s
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (!isDbAvailable()) {
    return NextResponse.json({ error: 'JOBS_UNAVAILABLE' }, { status: 503 });
  }

  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) {
    return NextResponse.json({ error: 'ADMIN_KEY_NOT_SET' }, { status: 503 });
  }

  const incomingKey = req.headers.get('x-admin-key') ?? '';
  if (incomingKey !== adminKey) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  try {
    await initJobsTable();
    const results = await refreshAllJobs();
    const total = Object.values(results).filter((n) => n > 0).reduce((s, n) => s + n, 0);
    const errors = Object.entries(results).filter(([, n]) => n < 0).map(([r]) => r);

    return NextResponse.json({
      ok: true,
      total_upserted: total,
      by_role: results,
      errors: errors.length > 0 ? errors : undefined,
      fetched_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[POST /api/jobs/refresh]', err);
    return NextResponse.json({ error: 'REFRESH_FAILED' }, { status: 500 });
  }
}
