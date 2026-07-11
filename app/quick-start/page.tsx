'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import Mascot from '@/components/Mascot';
import SiteNav from '@/components/SiteNav';
import { loadQuest, saveQuest } from '@/lib/quest-store';
import { ROLES, type RoleId } from '@/lib/roles';

type PathId = 'explore' | 'resume' | 'apply';

const PATHS: Record<PathId, {
  title: string;
  desc: string;
  status: 'exploring' | 'targeting' | 'applying';
  href: string;
  cta: string;
}> = {
  explore: {
    title: '我還不知道適合什麼',
    desc: '先用 18 題找出興趣組合，再推薦 3 個可以探索的方向。',
    status: 'exploring',
    href: '/quiz/interest',
    cta: '開始方向測驗',
  },
  resume: {
    title: '我有方向，但履歷很空',
    desc: '選目標職位後貼上履歷，先找出最值得補強的缺口。',
    status: 'targeting',
    href: '/analysis',
    cta: '檢查履歷缺口',
  },
  apply: {
    title: '我正在投，但進度很亂',
    desc: '把職缺貼進戰情室，先整理截止日、狀態與下一步。',
    status: 'applying',
    href: '/war-room',
    cta: '整理投遞進度',
  },
};

function PathIcon({ id }: { id: PathId }) {
  if (id === 'explore') {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="2"/>
        <path d="M17.5 10.5l-2.2 5.1-4.8 1.9 2.2-5.1 4.8-1.9z" fill="currentColor" opacity=".45"/>
      </svg>
    );
  }
  if (id === 'resume') {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect x="7" y="4" width="14" height="20" rx="3" stroke="currentColor" strokeWidth="2"/>
        <path d="M10 11h8M10 15h6M10 19h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  }
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="5" y="7" width="18" height="15" rx="3" stroke="currentColor" strokeWidth="2"/>
      <path d="M10 7V5h8v2M9 13h10M9 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export default function QuickStartPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<PathId>('explore');
  const [roleId, setRoleId] = useState<RoleId>('product_manager');

  function start() {
    const path = PATHS[selected];
    const data = loadQuest();
    data.profile = {
      careerStatus: path.status,
      targetRoleId: selected === 'explore' ? null : roleId,
      customRoleLabel: null,
      createdAt: data.profile?.createdAt ?? new Date().toISOString(),
    };
    saveQuest(data);
    router.push(path.href);
  }

  const current = PATHS[selected];

  return (
    <div className="site-wrapper">
      <SiteNav activePath="/quick-start" />
      <main className="site-main" id="main-content">
        <div className="quick-start-shell">
          <section className="quick-start-hero">
            <Mascot size={76} variant="think" className="mascot-idle" />
            <div>
              <p className="share-card-eyebrow">3 分鐘職涯健檢</p>
              <h1 className="quick-start-title">先選你現在卡在哪</h1>
              <p className="quick-start-copy">不用先懂整套闖關規則。選一個最像你的狀態，職涯闖關島會把下一步縮成一個可完成的動作。</p>
            </div>
          </section>

          <section className="quick-path-grid" aria-label="選擇目前狀態">
            {(Object.keys(PATHS) as PathId[]).map((id) => {
              const path = PATHS[id];
              const active = selected === id;
              return (
                <button
                  type="button"
                  key={id}
                  className={`quick-path-card${active ? ' quick-path-card-active' : ''}`}
                  onClick={() => setSelected(id)}
                >
                  <span className="quick-path-icon"><PathIcon id={id} /></span>
                  <span className="quick-path-title">{path.title}</span>
                  <span className="quick-path-desc">{path.desc}</span>
                </button>
              );
            })}
          </section>

          {selected !== 'explore' && (
            <section className="card quick-role-card">
              <label className="field-label" htmlFor="quick-role">目標職位</label>
              <select id="quick-role" value={roleId} onChange={(e) => setRoleId(e.target.value as RoleId)}>
                {ROLES.map((role) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </section>
          )}

          <section className="quick-next-card">
            <div>
              <p className="quick-next-label">你的下一步</p>
              <h2>{current.cta}</h2>
              <p>{current.desc}</p>
            </div>
            <button type="button" className="btn-game" onClick={start}>{current.cta}</button>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
