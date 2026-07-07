/**
 * lib/jobs.ts — 職缺雷達核心邏輯
 * 來源：Yourator API v4（公開列表，低頻輪詢，12h 排程）
 * 策展日期：2026-07-07
 */

import { getPool, isDbAvailable } from './db';

// ===== 職位關鍵字對映（10 職位）=====
export const ROLE_QUERY_MAP: Record<string, string[]> = {
  product_manager:   ['PM', '實習'],
  business_analyst:  ['商業分析', 'Business Analyst'],
  marketing:         ['行銷企劃', '實習'],
  hr:                ['人資', 'HR', '實習'],
  business_dev:      ['業務', 'BD', '實習'],
  consultant:        ['顧問', '實習'],
  software_eng:      ['軟體工程師', '實習', 'SWE'],
  data_analyst:      ['數據分析', '實習'],
  ux_researcher:     ['UX', '使用者研究', '實習'],
  finance:           ['金融', '實習'],
};

export interface JobRow {
  id: string;
  role_id: string;
  source: string;
  title: string;
  company: string;
  url: string;
  location: string | null;
  salary_text: string | null;
  posted_at: string | null;
  fetched_at: string;
  active: boolean;
}

// ===== DB init（追加 jobs 表，冪等）=====
export async function initJobsTable(): Promise<void> {
  if (!isDbAvailable()) return;
  const client = await getPool().connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        role_id text NOT NULL,
        source text NOT NULL DEFAULT 'yourator',
        title text NOT NULL,
        company text NOT NULL,
        url text UNIQUE NOT NULL,
        location text,
        salary_text text,
        posted_at timestamptz,
        fetched_at timestamptz NOT NULL DEFAULT now(),
        active boolean NOT NULL DEFAULT true
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS jobs_role_active_idx ON jobs (role_id, active, fetched_at DESC)
    `);
  } finally {
    client.release();
  }
}

// ===== Yourator 抓取函式 =====
async function fetchYouratorJobs(terms: string[]): Promise<{
  title: string; company: string; url: string; location: string | null; salary_text: string | null;
}[]> {
  const params = new URLSearchParams();
  for (const t of terms) params.append('term[]', t);

  const ua = 'InternXCareerQuest/1.0 (+https://internx.me)';
  const resp = await fetch(`https://www.yourator.co/api/v4/jobs?${params.toString()}`, {
    headers: { 'User-Agent': ua, 'Accept': 'application/json' },
    signal: AbortSignal.timeout(15000),
  });

  if (!resp.ok) throw new Error(`Yourator API ${resp.status}`);
  const data = await resp.json() as {
    payload: {
      jobs: {
        id: number; name: string; path: string;
        salary: string; location: string;
        company: { brand: string };
      }[];
    };
  };

  return (data.payload?.jobs ?? []).map((j) => ({
    title: j.name,
    company: j.company?.brand ?? '',
    url: `https://www.yourator.co${j.path}`,
    location: j.location ?? null,
    salary_text: j.salary ?? null,
  }));
}

// ===== 單一角色抓取並 upsert =====
async function refreshRoleJobs(roleId: string): Promise<number> {
  if (!isDbAvailable()) return 0;
  const terms = ROLE_QUERY_MAP[roleId];
  if (!terms) return 0;

  const jobs = await fetchYouratorJobs(terms);
  if (jobs.length === 0) return 0;

  const client = await getPool().connect();
  let upserted = 0;
  try {
    for (const j of jobs) {
      if (!j.url || !j.title || !j.company) continue;
      const res = await client.query(
        `INSERT INTO jobs (role_id, source, title, company, url, location, salary_text, fetched_at, active)
         VALUES ($1, 'yourator', $2, $3, $4, $5, $6, now(), true)
         ON CONFLICT (url) DO UPDATE SET
           title = EXCLUDED.title,
           company = EXCLUDED.company,
           location = EXCLUDED.location,
           salary_text = EXCLUDED.salary_text,
           fetched_at = now(),
           active = true
         RETURNING id`,
        [roleId, j.title, j.company, j.url, j.location, j.salary_text]
      );
      if (res.rows.length > 0) upserted++;
    }

    // 7 天沒再出現 → inactive
    await client.query(
      `UPDATE jobs SET active = false
       WHERE role_id = $1 AND fetched_at < now() - interval '7 days'`,
      [roleId]
    );
  } finally {
    client.release();
  }
  return upserted;
}

// ===== 全職位批次抓取（每輪間隔 2s）=====
export async function refreshAllJobs(): Promise<Record<string, number>> {
  const results: Record<string, number> = {};
  const roles = Object.keys(ROLE_QUERY_MAP);

  for (const roleId of roles) {
    try {
      await new Promise((r) => setTimeout(r, 2000)); // 禮貌間隔
      results[roleId] = await refreshRoleJobs(roleId);
    } catch (err) {
      console.error(`[jobs] refresh ${roleId} failed:`, err instanceof Error ? err.message : err);
      results[roleId] = -1;
    }
  }
  return results;
}

// 標題相關性（display 排序用；查詢詞含通用「實習」會撈進鄰近職缺，靠這裡把對題的排前面）
const ROLE_TITLE_PATTERNS: Record<string, RegExp> = {
  product_manager: /\bpm\b|product\s*(manager|owner)|產品經理|產品企劃/i,
  business_analyst: /\bba\b|business\s*analyst|商業分析/i,
  marketing: /行銷|marketing|社群|品牌/i,
  hr: /人資|\bhr\b|人力資源|招募|recruit/i,
  business_dev: /\bbd\b|業務|business\s*develop|sales/i,
  consultant: /顧問|consult/i,
  software_eng: /工程師|engineer|developer|軟體|前端|後端|full\s*stack/i,
  data_analyst: /數據|資料分析|data\s*(analyst|scien)/i,
  ux_researcher: /\bux\b|使用者研究|user\s*research|產品設計/i,
  finance: /金融|財務|finance|投資|銀行/i,
};

function titleScore(roleId: string, title: string): number {
  let score = 0;
  const pat = ROLE_TITLE_PATTERNS[roleId];
  if (pat && pat.test(title)) score += 2;
  if (/實習|intern/i.test(title)) score += 1;
  return score;
}

// ===== 查詢 =====
export async function getJobs(roleId: string, limit = 20): Promise<JobRow[]> {
  if (!isDbAvailable()) return [];
  const client = await getPool().connect();
  try {
    const res = await client.query<JobRow>(
      `SELECT id, role_id, source, title, company, url, location, salary_text,
              posted_at, fetched_at, active
       FROM jobs
       WHERE role_id = $1 AND active = true
       ORDER BY fetched_at DESC, posted_at DESC NULLS LAST
       LIMIT $2`,
      [roleId, Math.min(limit * 3, 60)]
    );
    return res.rows
      .map((r) => ({ r, s: titleScore(roleId, r.title) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, limit)
      .map((x) => x.r);
  } finally {
    client.release();
  }
}

// ===== 12h 定時排程（server-side singleton）=====
let intervalHandle: ReturnType<typeof setInterval> | null = null;

export function startJobsScheduler(): void {
  if (intervalHandle !== null) return; // 已啟動
  if (!isDbAvailable()) return;

  const INTERVAL_MS = 12 * 60 * 60 * 1000; // 12h

  async function run() {
    try {
      await initJobsTable();
      const results = await refreshAllJobs();
      const total = Object.values(results).filter((n) => n > 0).reduce((s, n) => s + n, 0);
      console.log(`[jobs] scheduler run done, upserted ${total} rows`);
    } catch (err) {
      console.error('[jobs] scheduler error:', err instanceof Error ? err.message : err);
    }
  }

  // 立即跑一次（容器重啟後資料不空）
  run().catch(() => {});

  intervalHandle = setInterval(() => {
    run().catch(() => {});
  }, INTERVAL_MS);
}
