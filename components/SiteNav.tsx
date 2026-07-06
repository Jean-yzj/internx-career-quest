'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadQuest, getLevel } from '@/lib/quest-store';

export default function SiteNav({ activePath }: { activePath?: string }) {
  const [points, setPoints] = useState<number | null>(null);
  const [levelName, setLevelName] = useState('');

  useEffect(() => {
    const data = loadQuest();
    setPoints(data.totalPoints);
    const { name } = getLevel(data.totalPoints);
    setLevelName(name);
  }, []);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-logo">職涯闖關島</Link>
        <nav className="site-nav" aria-label="主導覽">
          <Link href="/island" className={`nav-link${activePath === '/island' ? ' nav-link-active' : ''}`}>
            <span className="nav-label">闖關島</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M5 8h6M8 5v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </Link>
          <Link href="/war-room" className={`nav-link${activePath === '/war-room' ? ' nav-link-active' : ''}`}>
            <span className="nav-label">戰情室</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M5 7h2M5 10h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </Link>
          <Link href="/analysis" className={`nav-link${activePath === '/analysis' ? ' nav-link-active' : ''}`}>
            <span className="nav-label">履歷分析</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 13V8M7 13V5M11 13V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </Link>
          <Link href="/quiz/interest" className={`nav-link${activePath?.startsWith('/quiz') ? ' nav-link-active' : ''}`}>
            <span className="nav-label">測驗</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M8 5v3.5L10.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <Link href="/guilds" className={`nav-link${activePath?.startsWith('/guilds') ? ' nav-link-active' : ''}`}>
            <span className="nav-label">公會</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 12c0-2.2 1.8-4 4-4h4c2.2 0 4 1.8 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5"/></svg>
          </Link>
        </nav>
        {points !== null && (
          <div className="nav-points-badge" aria-label={`點數：${points}`}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><circle cx="6" cy="6" r="5" fill="#0182FD"/><path d="M4 6l1.5 1.5L8 4" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {points} pt
            {levelName && <span className="level-badge" style={{ marginLeft: 6 }}>{levelName}</span>}
          </div>
        )}
      </div>
    </header>
  );
}
