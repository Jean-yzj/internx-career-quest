/**
 * lib/jobs.ts — 實習雷達核心邏輯
 * 來源：internship-radar JSON（Jean-yzj/internx.internship-radar，每日三次 GH Actions 更新）
 * 端點：raw.githubusercontent.com，一次請求取全部 230 筆三平台實習
 * 策源日期：2026-07-11
 */

import { getPool, isDbAvailable } from './db';

// ===== radar category → roleId 對映（涵蓋 radar 全部 21 種 category）=====
const CATEGORY_TO_ROLE: Record<string, string> = {
  tech:           'software_eng',
  engineering:    'software_eng',
  healthcare:     'software_eng',     // 醫療資訊實習多為工程類
  biotech:        'software_eng',
  data:           'data_analyst',
  research:       'data_analyst',
  pm:             'product_manager',
  design:         'ux_researcher',
  marketing:      'marketing',
  content:        'marketing',
  hr:             'hr',
  education:      'hr',
  bd_sales:       'business_dev',
  hospitality:    'business_dev',
  finance:        'finance',
  accounting:     'finance',
  operations:     'business_analyst',
  manufacturing:  'business_analyst',
  supply_chain:   'business_analyst',
  other:          'business_analyst', // 通用桶
  consultant:     'consultant',
  consulting:     'consultant',
  legal:          'consultant',       // 法務實習歸顧問
};

// radar JSON 頂層結構
interface RadarJob {
  platform: string;   // '104' | 'cakeresume' | 'Yourator'
  title: string;
  company: string;
  location: string;
  salary: string;
  salary_min: number | null;
  salary_type: string;
  posted_at: string;
  url: string;
  category: string;
  first_seen: string;
  last_seen: string;
  deadline: string;
}

interface RadarData {
  generated_at: string;
  jobs: RadarJob[];
}

export interface JobRow {
  id: string;
  role_id: string;
  source: string;
  title: string;
  company: string;
  url: string;
  location: string | null;
  salary_text: string | null;
  deadline: string | null;
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
        source text NOT NULL DEFAULT 'radar',
        title text NOT NULL,
        company text NOT NULL,
        url text UNIQUE NOT NULL,
        location text,
        salary_text text,
        deadline text,
        posted_at timestamptz,
        fetched_at timestamptz NOT NULL DEFAULT now(),
        active boolean NOT NULL DEFAULT true
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS jobs_role_active_idx ON jobs (role_id, active, fetched_at DESC)
    `);
    // 補 deadline 欄（舊表可能沒有，冪等加）
    await client.query(`
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS deadline text
    `);
  } finally {
    client.release();
  }
}

// ===== 抓取實習雷達 JSON =====
const RADAR_URL =
  'https://raw.githubusercontent.com/Jean-yzj/internx.internship-radar/main/data/internships.json';

async function fetchRadarJobs(): Promise<RadarJob[]> {
  const ua = 'InternXCareerQuest/1.0 (+https://internx.me)';
  const resp = await fetch(RADAR_URL, {
    headers: { 'User-Agent': ua, 'Accept': 'application/json' },
    signal: AbortSignal.timeout(20000),
  });

  if (!resp.ok) throw new Error(`radar fetch ${resp.status}`);
  const data = await resp.json() as RadarData;
  return data.jobs ?? [];
}

// 正規化平台名稱 → source 欄位
function normSource(platform: string): string {
  const p = platform.toLowerCase();
  if (p === '104') return '104';
  if (p === 'cakeresume') return 'cakeresume';
  if (p === 'yourator') return 'yourator';
  return p;
}

// ===== 全量 upsert（一次 fetch，按 category 分 roleId）=====
export async function refreshAllJobs(): Promise<Record<string, number>> {
  if (!isDbAvailable()) return {};

  const radarJobs = await fetchRadarJobs();
  if (radarJobs.length === 0) return {};

  const results: Record<string, number> = {};
  const seenUrls = new Set<string>();

  const client = await getPool().connect();
  try {
    for (const j of radarJobs) {
      if (!j.url || !j.title || !j.company) continue;
      if (seenUrls.has(j.url)) continue;
      seenUrls.add(j.url);

      const roleId = CATEGORY_TO_ROLE[j.category] ?? 'business_analyst';
      const source = normSource(j.platform);
      const postedAt = j.posted_at || null;

      const res = await client.query(
        `INSERT INTO jobs (role_id, source, title, company, url, location, salary_text, deadline, posted_at, fetched_at, active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now(), true)
         ON CONFLICT (url) DO UPDATE SET
           role_id    = EXCLUDED.role_id,
           title      = EXCLUDED.title,
           company    = EXCLUDED.company,
           location   = EXCLUDED.location,
           salary_text= EXCLUDED.salary_text,
           deadline   = EXCLUDED.deadline,
           fetched_at = now(),
           active     = true
         RETURNING id`,
        [
          roleId,
          source,
          j.title,
          j.company,
          j.url,
          j.location || null,
          j.salary || null,
          j.deadline || null,
          postedAt,
        ]
      );
      if (res.rows.length > 0) {
        results[roleId] = (results[roleId] ?? 0) + 1;
      }
    }

    // 7 天沒再出現（fetched_at 未更新）→ inactive
    await client.query(
      `UPDATE jobs SET active = false
       WHERE fetched_at < now() - interval '7 days'`
    );
  } finally {
    client.release();
  }
  return results;
}

// 標題相關性（display 排序用）
const ROLE_TITLE_PATTERNS: Record<string, RegExp> = {
  product_manager: /\bpm\b|product\s*(manager|owner)|產品經理|產品企劃/i,
  business_analyst: /\bba\b|business\s*analyst|商業分析/i,
  marketing: /行銷|marketing|社群|品牌/i,
  hr: /人資|\bhr\b|人力資源|招募|recruit/i,
  business_dev: /\bbd\b|業務|business\s*develop|sales/i,
  consultant: /顧問|consult|法務|legal/i,
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
              deadline, posted_at, fetched_at, active
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
      const total = Object.values(results).reduce((s, n) => s + n, 0);
      console.log(`[jobs] scheduler run done, upserted ${total} rows across ${Object.keys(results).length} roles`);
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
