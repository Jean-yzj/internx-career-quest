'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadQuest, getLevel } from '@/lib/quest-store';
import { getProfile } from '@/lib/profile';

// Gold coin SVG (inline, no emoji)
function CoinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="#FFC93C" stroke="#E8A800" strokeWidth="1.5"/>
      <circle cx="10" cy="10" r="6" fill="none" stroke="#E8A800" strokeWidth="1"/>
      <path d="M10 6l1.2 2.5h2.6l-2.1 1.6.8 2.6L10 11.3l-2.5 1.4.8-2.6L6.2 8.5h2.6Z" fill="#E8A800" opacity=".8"/>
    </svg>
  );
}

// Medal chip SVG
function MedalChip({ label }: { label: string }) {
  return (
    <span className="nav-level-chip" aria-label={`等級：${label}`}>
      <svg width="10" height="10" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <polygon points="10,2 12.5,7.5 18,8.5 14,12.5 15,18 10,15.5 5,18 6,12.5 2,8.5 7.5,7.5" fill="#7A4F00"/>
      </svg>
      {label}
    </span>
  );
}

export default function SiteNav({ activePath }: { activePath?: string }) {
  const [points, setPoints] = useState<number | null>(null);
  const [levelName, setLevelName] = useState('');
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const data = loadQuest();
    setPoints(data.totalPoints);
    const { name } = getLevel(data.totalPoints);
    setLevelName(name);
    setStreak(data.streak.days);
  }, []);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-logo">
          {/* 24px mascot head */}
          <svg width="24" height="24" viewBox="0 0 120 120" fill="none" aria-hidden="true">
            <path d="M60 18c22 0 34 16 34 36 0 22-14 38-34 38S26 76 26 54c0-20 12-36 34-36z" fill="#4DA3FF" stroke="#1861A8" strokeWidth="3"/>
            <path d="M60 46c12 0 20 9 20 20 0 12-8 20-20 20s-20-8-20-20c0-11 8-20 20-20z" fill="#EAF4FF"/>
            <circle cx="48" cy="50" r="4" fill="#1A2733"/><circle cx="72" cy="50" r="4" fill="#1A2733"/>
            <path d="M54 59c3 3 9 3 12 0" stroke="#1A2733" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          職涯闖關島
        </Link>
        <nav className="site-nav" aria-label="主導覽">
          <Link href="/island" className={`nav-link${activePath === '/island' ? ' nav-link-active' : ''}`}>
            <span className="nav-label">闖關島</span>
          </Link>
          <Link href="/roles" className={`nav-link${activePath?.startsWith('/roles') ? ' nav-link-active' : ''}`}>
            <span className="nav-label">職位圖鑑</span>
          </Link>
          <Link href="/plan" className={`nav-link${activePath === '/plan' ? ' nav-link-active' : ''}`}>
            <span className="nav-label">7 天計畫</span>
          </Link>
          <Link href="/war-room" className={`nav-link${activePath === '/war-room' ? ' nav-link-active' : ''}`}>
            <span className="nav-label">戰情室</span>
          </Link>
          <Link href="/analysis" className={`nav-link${activePath === '/analysis' ? ' nav-link-active' : ''}`}>
            <span className="nav-label">履歷分析</span>
          </Link>
          <Link href="/quiz/interest" className={`nav-link${activePath?.startsWith('/quiz') ? ' nav-link-active' : ''}`}>
            <span className="nav-label">測驗</span>
          </Link>
          <Link href="/guilds" className={`nav-link${activePath?.startsWith('/guilds') ? ' nav-link-active' : ''}`}>
            <span className="nav-label">公會</span>
          </Link>
        </nav>
        {points !== null && (
          <Link href="/profile" className="nav-points-badge" aria-label={`等級與點數，點擊進入個人頁`} style={{ textDecoration: 'none' }}>
            <CoinIcon size={14} />
            {points}
            {streak > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }} aria-label={`連續 ${streak} 天`}>
                {/* flame */}
                <svg width="13" height="13" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M10 2c0 4-6 6-6 11a6 6 0 0012 0c0-3-2-5-2-8-1 2-3 3-4 4 0-3 0-5 0-7z" fill="#FF7A45"/>
                  <path d="M10 9c0 2-2 3-2 5a2 2 0 004 0c0-1-.5-2-.5-3-.5 1-1 1.5-1.5 2 0-1.5 0-3 0-4z" fill="#FFC93C"/>
                </svg>
                {streak}
              </span>
            )}
            {levelName && <MedalChip label={levelName} />}
          </Link>
        )}
      </div>
    </header>
  );
}
