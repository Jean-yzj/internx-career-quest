'use client';

import { useEffect, useState } from 'react';
import SiteNav from '@/components/SiteNav';
import Footer from '@/components/Footer';
import { loadQuest, saveQuest, getLevel, TASK_DEFS, getDailyPool, bridgeWarRoomEvents, markDailyDone } from '@/lib/quest-store';
import type { QuestData } from '@/lib/types';
import { getTodayStr } from '@/lib/types';
import { getRoleById } from '@/lib/roles';
import { GUILD_DEFS } from '@/lib/guilds';

const ZONE_ICONS: Record<string, React.ReactNode> = {
  '探索島': (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 6 L12 10 L16 10 L13 12.5 L14 16.5 L10 14 L6 16.5 L7 12.5 L4 10 L8 10 Z" fill="currentColor" opacity=".5"/>
    </svg>
  ),
  '履歷工坊': (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="4" y="2" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 7h6M7 10h4M7 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  '訓練場': (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="5" cy="10" r="2" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="15" cy="10" r="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 10h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M3 10h2M15 10h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  '戰情室': (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 9h3M6 12h8M11 9h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  '升級島': (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 3l1.5 4.5h4.5l-3.5 2.5 1.5 4.5L10 12l-4 2.5 1.5-4.5L4 7.5h4.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  ),
};

const ZONES = ['探索島', '履歷工坊', '訓練場', '戰情室', '升級島'];

export default function IslandPage() {
  const [questData, setQuestData] = useState<QuestData | null>(null);
  const [expandedZones, setExpandedZones] = useState<Set<string>>(new Set(['探索島']));

  const [joinedGuildIds, setJoinedGuildIds] = useState<string[]>([]);

  useEffect(() => {
    bridgeWarRoomEvents();
    // Load joined guilds from localStorage
    try {
      const raw = localStorage.getItem('guild.joined');
      if (raw) setJoinedGuildIds(JSON.parse(raw));
    } catch { /* ignore */ }
    const data = loadQuest();
    // Ensure daily tasks are set
    const today = getTodayStr();
    if (data.daily.date !== today || data.daily.taskCodes.length === 0) {
      const pool = getDailyPool(data.profile?.careerStatus ?? 'exploring');
      data.daily = { date: today, taskCodes: pool.map((t) => t.code), doneCodes: data.daily.date === today ? data.daily.doneCodes : [] };
      saveQuest(data);
    }
    setQuestData(data);
  }, []);

  function toggleZone(zone: string) {
    setExpandedZones((prev) => {
      const next = new Set(prev);
      if (next.has(zone)) next.delete(zone);
      else next.add(zone);
      return next;
    });
  }

  function handleCompleteDaily(code: string) {
    const data = loadQuest();
    const updated = markDailyDone(code, data);
    setQuestData({ ...updated });
  }

  if (!questData) return null;

  const { level, name: levelName, nextAt } = getLevel(questData.totalPoints);
  const progressPct = nextAt
    ? ((questData.totalPoints - (level > 1 ? [0, 100, 300, 700, 1500, 3000, 6000][level - 1] : 0)) /
       (nextAt - (level > 1 ? [0, 100, 300, 700, 1500, 3000, 6000][level - 1] : 0))) * 100
    : 100;

  const targetRole = questData.profile?.targetRoleId ? getRoleById(questData.profile.targetRoleId) : null;

  // Daily tasks
  const dailyPool = getDailyPool(questData.profile?.careerStatus ?? 'exploring');
  const today = getTodayStr();
  const doneCodes = questData.daily.date === today ? questData.daily.doneCodes : [];

  // Zone task breakdown
  const zoneTaskMap: Record<string, typeof TASK_DEFS> = {};
  for (const zone of ZONES) {
    zoneTaskMap[zone] = TASK_DEFS.filter((t) => t.zone === zone || t.zone === '全');
  }

  function getTaskProgress(zone: string) {
    const tasks = TASK_DEFS.filter((t) => t.zone === zone || (zone === '探索島' && t.zone === '全'));
    const done = tasks.filter((t) => (questData!.tasks[t.code]?.count ?? 0) >= (typeof t.limit === 'number' ? t.limit : 1)).length;
    return { done, total: tasks.length };
  }

  return (
    <div className="site-wrapper">
      <SiteNav activePath="/island" />
      <main className="site-main" id="main-content">
        {/* Level summary */}
        <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="level-badge">Lv.{level} {levelName}</span>
              {questData.streak.days > 0 && (
                <span style={{ fontSize: '0.8125rem', color: 'var(--amber)', fontWeight: 600 }}>
                  連續 {questData.streak.days} 天
                </span>
              )}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)' }}>
              {questData.totalPoints} <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--ink-2)' }}>點</span>
            </div>
            <div style={{ height: 6, background: 'var(--line)', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--brand)', width: `${Math.min(100, progressPct)}%`, borderRadius: 3, transition: 'width 0.4s' }} />
            </div>
            {nextAt && <p style={{ fontSize: '0.75rem', color: 'var(--ink-2)', marginTop: 4 }}>距離下一等級 {nextAt - questData.totalPoints} 點</p>}
          </div>
          {targetRole && (
            <div style={{ fontSize: '0.875rem', color: 'var(--ink-2)', textAlign: 'right' }}>
              <div style={{ fontWeight: 600, color: 'var(--ink)' }}>目標：{targetRole.name}</div>
              <a href="/onboarding" style={{ fontSize: '0.75rem', color: 'var(--brand-dark)', textDecoration: 'underline' }}>更換</a>
            </div>
          )}
        </div>

        {/* Daily tasks */}
        <div className="card" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>今日任務（{doneCodes.length}/3）</h2>
          {dailyPool.map((t) => {
            const done = doneCodes.includes(t.code);
            return (
              <div key={t.code} className="task-item">
                <button
                  type="button"
                  className={`task-check${done ? ' task-check-done' : ''}`}
                  onClick={() => !done && handleCompleteDaily(t.code)}
                  aria-label={done ? '已完成' : '標記完成'}
                >
                  {done && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
                <div className="task-info">
                  <p className={`task-name${done ? ' task-name-done' : ''}`}>{t.name}</p>
                  <p className="task-meta">{t.type === 'ext' ? '外連 internx.me' : t.type === 'self' ? '自報' : '自動'}</p>
                </div>
                <span className="task-pts">+10</span>
              </div>
            );
          })}
        </div>

        {/* Guild card */}
        <div className="card" style={{ marginBottom: 16, background: 'var(--island-sand)', border: '1px solid #F0D980' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <circle cx="14" cy="14" r="13" stroke="#7A5C00" strokeWidth="1.5"/>
              <path d="M9 19c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="#7A5C00" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="14" cy="11" r="3" stroke="#7A5C00" strokeWidth="1.5"/>
            </svg>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#7A5C00' }}>你的公會</div>
              {joinedGuildIds.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  {joinedGuildIds.slice(0, 3).map((id) => {
                    const g = GUILD_DEFS.find((d) => d.id === id);
                    return g ? (
                      <a key={id} href={`/guilds/${id}`} style={{ fontSize: '0.8125rem', color: '#7A5C00', fontWeight: 600, textDecoration: 'underline' }}>{g.name}</a>
                    ) : null;
                  })}
                </div>
              ) : (
                <div style={{ fontSize: '0.8125rem', color: '#7A5C00', opacity: 0.7, marginTop: 2 }}>還沒加入公會——同職涯目標的夥伴在這裡討論</div>
              )}
            </div>
            <a href="/guilds" style={{ fontSize: '0.8125rem', color: '#7A5C00', fontWeight: 600, textDecoration: 'underline' }}>
              {joinedGuildIds.length > 0 ? '公會大廳' : '去看看'}
            </a>
          </div>
        </div>

        {/* Zone cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ZONES.map((zone) => {
            const { done, total } = getTaskProgress(zone);
            const expanded = expandedZones.has(zone);
            const zoneTasks = TASK_DEFS.filter((t) => t.zone === zone || (zone === '探索島' && t.zone === '全'));

            return (
              <div key={zone} className="zone-card">
                <button type="button" className="zone-card-header" onClick={() => toggleZone(zone)} aria-expanded={expanded}>
                  <div className="zone-card-icon" style={{ color: 'var(--brand-dark)' }}>
                    {ZONE_ICONS[zone]}
                  </div>
                  <span className="zone-card-title">{zone}</span>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--ink-2)' }}>{done}/{total}</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div className="zone-card-progress-bar">
                  <div className="zone-card-progress-fill" style={{ width: total > 0 ? `${(done / total) * 100}%` : '0%' }} />
                </div>
                {expanded && (
                  <div className="zone-card-body">
                    {zoneTasks.map((t) => {
                      const count = questData!.tasks[t.code]?.count ?? 0;
                      const maxCount = typeof t.limit === 'number' ? t.limit : 1;
                      const isDone = count >= maxCount;
                      return (
                        <div key={t.code} className="task-item">
                          <div className={`task-check${isDone ? ' task-check-done' : ''}`} aria-hidden="true">
                            {isDone && (
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                          <div className="task-info">
                            <p className={`task-name${isDone ? ' task-name-done' : ''}`}>{t.name}</p>
                            <p className="task-meta">
                              {t.type === 'ext' ? '外連' : t.type === 'self' ? '自報' : '自動'}
                              {typeof t.limit !== 'number' && ` · ${t.limit.replace(/_/g, ' ')}`}
                            </p>
                          </div>
                          <span className="task-pts">+{t.points}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Badges */}
        {questData.badges.length > 0 && (
          <div className="card" style={{ marginTop: 16 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>已獲得的徽章（{questData.badges.length}/6）</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {questData.badges.map((b) => (
                <span key={b.id} className="level-badge" style={{ padding: '6px 12px' }}>{b.id}</span>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
