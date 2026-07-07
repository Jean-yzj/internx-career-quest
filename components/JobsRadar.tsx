'use client';

/**
 * components/JobsRadar.tsx
 * 職缺雷達卡片——掛在戰情室頁頂部
 * 依 profile.v1.goalRoleId 顯示對應職缺；未設 → 顯示職位選單；無資料 → 引導文案
 */

import { useState, useEffect } from 'react';
import { getProfile } from '@/lib/profile';
import { ROLES } from '@/lib/roles';

interface JobItem {
  id: string;
  role_id: string;
  source: string;
  title: string;
  company: string;
  url: string;
  location: string | null;
  salary_text: string | null;
  fetched_at: string;
}

interface JobsRadarProps {
  /** war-room 頁傳入：預填職缺並打開確認卡 */
  onAddJob?: (prefill: { company: string; title: string; link: string; location?: string; salaryText?: string }) => void;
}

const ROLE_LABELS: Record<string, string> = {
  product_manager:  '產品經理',
  business_analyst: '商業分析師',
  marketing:        '行銷企劃',
  hr:               '人資',
  business_dev:     '業務開發',
  consultant:       '顧問',
  software_eng:     '軟體工程師',
  data_analyst:     '數據分析師',
  ux_researcher:    'UX 研究員',
  finance:          '金融實習',
};

export default function JobsRadar({ onAddJob }: JobsRadarProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dbAvailable, setDbAvailable] = useState(true);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  // 從 profile 讀取目標職位
  useEffect(() => {
    const profile = getProfile();
    const roleId = profile?.goalRoleId ?? null;
    setSelectedRole(roleId);
  }, []);

  // 拉職缺
  useEffect(() => {
    if (!selectedRole) return;
    setLoading(true);
    setError(null);

    fetch(`/api/jobs?role=${encodeURIComponent(selectedRole)}&limit=20`)
      .then(async (res) => {
        if (res.status === 503) {
          setDbAvailable(false);
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json() as { ok: boolean; jobs: JobItem[] };
        setJobs(data.jobs ?? []);
      })
      .catch(() => setError('載入職缺時發生錯誤，請稍後再試'))
      .finally(() => setLoading(false));
  }, [selectedRole]);

  // DB 不可用時，靜默隱藏（前端降級）
  if (!dbAvailable) return null;

  const roleLabel = selectedRole ? (ROLE_LABELS[selectedRole] ?? selectedRole) : null;

  return (
    <section className="card" style={{ marginBottom: 20 }} aria-label="職缺雷達">
      {/* 標頭 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <circle cx="9" cy="9" r="7" stroke="var(--brand)" strokeWidth="1.5" />
            <circle cx="9" cy="9" r="4" stroke="var(--brand)" strokeWidth="1.5" opacity=".5" />
            <circle cx="9" cy="9" r="1.5" fill="var(--brand)" />
            <path d="M9 2V1M9 17v-1M2 9H1M17 9h-1" stroke="var(--brand)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--ink)' }}>
            職缺雷達
            {roleLabel && (
              <span style={{ fontWeight: 500, color: 'var(--ink-2)', marginLeft: 6 }}>
                ——現在正在開的{roleLabel}職缺
              </span>
            )}
          </span>
        </div>

        {/* 未設職位時顯示選單 */}
        {!selectedRole && (
          <select
            value=""
            onChange={(e) => setSelectedRole(e.target.value || null)}
            style={{
              fontSize: '0.8125rem', border: '1.5px solid var(--line)',
              borderRadius: 8, padding: '4px 8px', background: 'var(--card)',
              color: 'var(--ink)', cursor: 'pointer',
            }}
            aria-label="選擇職位以查看職缺"
          >
            <option value="">選擇職位查看職缺</option>
            {ROLES.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        )}

        {/* 已選職位時顯示換職位連結 */}
        {selectedRole && (
          <button
            type="button"
            onClick={() => { setSelectedRole(null); setJobs([]); }}
            style={{
              fontSize: '0.75rem', color: 'var(--ink-2)', background: 'none',
              border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0,
            }}
          >
            換職位
          </button>
        )}
      </div>

      {/* 無職位選擇時的引導 */}
      {!selectedRole && (
        <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', lineHeight: 1.6 }}>
          選擇目標職位後，雷達會自動掃描 Yourator 上的最新職缺，讓你一鍵收進戰情室。
        </p>
      )}

      {/* 載入中 */}
      {selectedRole && loading && (
        <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', textAlign: 'center', padding: '16px 0' }}>
          雷達掃描中...
        </p>
      )}

      {/* 錯誤 */}
      {selectedRole && !loading && error && (
        <p style={{ fontSize: '0.875rem', color: 'var(--danger)' }}>{error}</p>
      )}

      {/* 無資料引導 */}
      {selectedRole && !loading && !error && jobs.length === 0 && (
        <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', lineHeight: 1.6 }}>
          雷達掃描中，先貼職缺網址手動收；最新資料每 12 小時更新一次。
        </p>
      )}

      {/* 職缺列表 */}
      {!loading && jobs.length > 0 && (
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(showAll ? jobs : jobs.slice(0, 5)).map((job) => (
            <li key={job.id} style={{
              border: '1.5px solid var(--line)',
              borderRadius: 12,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 10,
              flexWrap: 'wrap',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--ink)', marginBottom: 2 }}>
                  {job.title}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--ink-2)' }}>
                  {job.company}
                  {job.location && <span style={{ marginLeft: 6 }}>· {job.location}</span>}
                  {job.salary_text && <span style={{ marginLeft: 6, color: 'var(--ok)' }}>· {job.salary_text}</span>}
                </div>
                <div style={{ marginTop: 4 }}>
                  <span style={{
                    fontSize: '0.6875rem',
                    background: 'var(--sky-soft)', color: 'var(--brand-ink)',
                    borderRadius: 6, padding: '1px 6px', fontWeight: 600,
                  }}>
                    {job.source === 'yourator' ? 'Yourator' : job.source}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-small"
                  style={{ textDecoration: 'none', fontSize: '0.75rem' }}
                  aria-label={`看原文：${job.title} — ${job.company}`}
                >
                  看原文
                </a>
                {onAddJob && (
                  <button
                    type="button"
                    className={`btn-small${addedIds.has(job.id) ? '' : ''}`}
                    disabled={addedIds.has(job.id)}
                    onClick={() => {
                      onAddJob({
                        company: job.company,
                        title: job.title,
                        link: job.url,
                        location: job.location ?? undefined,
                        salaryText: job.salary_text ?? undefined,
                      });
                      setAddedIds((prev) => new Set([...prev, job.id]));
                    }}
                    aria-label={`收進戰情室：${job.title}`}
                    style={{ fontSize: '0.75rem' }}
                  >
                    {addedIds.has(job.id) ? '已收' : '收進戰情室'}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && jobs.length > 5 && (
        <button type="button" onClick={() => setShowAll((v) => !v)}
          style={{ marginTop: 10, background: 'none', border: 'none', color: 'var(--brand-dark)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
          {showAll ? '收合' : `顯示全部 ${jobs.length} 筆`}
        </button>
      )}

      {/* 免責聲明 */}
      <p style={{ fontSize: '0.6875rem', color: 'var(--ink-2)', marginTop: 10, lineHeight: 1.5 }}>
        資料來自公開頁面（Yourator），正確性以原站為準。每 12 小時更新一次。
      </p>
    </section>
  );
}
