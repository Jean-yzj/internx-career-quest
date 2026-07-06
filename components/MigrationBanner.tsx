'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * Shows a sticky banner when user has quest.v1 (played before) but no profile.v1 yet.
 * Renders null otherwise, and on server.
 */
export default function MigrationBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const hasQuest = !!localStorage.getItem('quest.v1');
      const hasProfile = !!localStorage.getItem('profile.v1');
      setShow(hasQuest && !hasProfile);
    } catch { /* ignore */ }
  }, []);

  if (!show) return null;

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, var(--sky-soft), #fff)',
        borderBottom: '2px solid var(--brand)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
        position: 'relative',
        zIndex: 99,
      }}
      role="banner"
      aria-label="完成註冊提示"
    >
      <div style={{ flex: 1, minWidth: 200 }}>
        <span style={{ fontWeight: 700, color: 'var(--brand-ink)', fontSize: '0.9375rem' }}>
          解鎖排行榜與專屬關卡
        </span>
        <span style={{ fontSize: '0.875rem', color: 'var(--ink-2)', marginLeft: 8 }}>
          完成兩分鐘的角色設定
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link href="/onboarding" className="btn-game" style={{ padding: '8px 18px', fontSize: '0.875rem' }}>
          完成註冊
        </Link>
        <button
          type="button"
          className="btn-icon"
          onClick={() => setShow(false)}
          aria-label="關閉提示"
          style={{ width: 28, height: 28 }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 2l10 10M12 2L2 12" stroke="var(--ink-2)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
