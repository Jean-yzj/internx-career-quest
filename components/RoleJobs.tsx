'use client';

// 職位圖鑑詳情頁的「現在的實習」區塊。
// 必須是 client component：詳情頁是 SSG 靜態生成，若在 server 端 await getJobs()
// 會把 build 當下的實習數烤死（build 無 DB=0，且之後 12h refresh 不會更新靜態頁）。
// 改為 mount 後 fetch，即時反映資料庫。

import { useEffect, useState } from 'react';
import styles from '../app/roles/roles.module.css';

interface Job {
  id: string;
  title: string;
  company: string;
  url: string;
  source: string;
}

function sourceBadgeLabel(source: string): string {
  if (source === '104') return '104';
  if (source === 'cakeresume') return 'CakeResume';
  if (source === 'yourator') return 'Yourator';
  return source;
}

// 各職位實習數，module 級快取——列表頁 10 張卡共用一次 fetch
let countsPromise: Promise<Record<string, number>> | null = null;
function loadCounts(): Promise<Record<string, number>> {
  if (!countsPromise) {
    countsPromise = fetch('/api/jobs/counts')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.counts ?? {})
      .catch(() => ({}));
  }
  return countsPromise;
}

// 職位圖鑑列表頁的「現有 N 個實習」小標（client，避免 SSG 烤死）
export function RoleCount({ roleId }: { roleId: string }) {
  const [n, setN] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    loadCounts().then((c) => { if (alive) setN(c[roleId] ?? 0); });
    return () => { alive = false; };
  }, [roleId]);
  if (n === null || n === 0) return null;
  return <p className={styles.roleJobCount}>現有 {n} 個實習開缺</p>;
}

export default function RoleJobs({ roleId }: { roleId: string }) {
  const [jobs, setJobs] = useState<Job[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/jobs?role=${roleId}&limit=5`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive) setJobs(d?.jobs ?? []); })
      .catch(() => { if (alive) setJobs([]); });
    return () => { alive = false; };
  }, [roleId]);

  // 載入中或無資料（無 DB / 該職位 0 筆）→ 不顯示這塊
  if (!jobs || jobs.length === 0) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>現在的實習 · {jobs.length} 個開缺中</h2>
      <div className={styles.jobsList}>
        {jobs.map((job) => (
          <a
            key={job.id}
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.jobCard}
          >
            <div className={styles.jobInfo}>
              <span className={styles.jobTitle}>{job.title}</span>
              <span className={styles.jobCompany}>{job.company}</span>
            </div>
            <span className={styles.sourceBadge}>{sourceBadgeLabel(job.source)}</span>
            <svg className={styles.externalIcon} width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M12 4h4v4M15.5 4.5L9 11M5 7H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        ))}
      </div>
      <p className={styles.jobsSourceNote}>資料來自公開頁面（104、CakeResume、Yourator），正確性以原站為準</p>
    </section>
  );
}
