'use client';

import { useEffect, useState, useRef } from 'react';
import SiteNav from '@/components/SiteNav';
import Footer from '@/components/Footer';
import Mascot from '@/components/Mascot';
import { loadQuest, saveQuest, getLevel, TASK_DEFS, getDailyPool, bridgeWarRoomEvents, markDailyDone, BADGES } from '@/lib/quest-store';
import type { QuestData } from '@/lib/types';
import { getTodayStr } from '@/lib/types';
import { getRoleById } from '@/lib/roles';
import { GUILD_DEFS } from '@/lib/guilds';

// ---- helpers ----
function CoinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="#FFC93C" stroke="#E8A800" strokeWidth="1.5"/>
      <circle cx="10" cy="10" r="6" fill="none" stroke="#E8A800" strokeWidth="1"/>
      <path d="M10 6l1.2 2.5h2.6l-2.1 1.6.8 2.6L10 11.3l-2.5 1.4.8-2.6L6.2 8.5h2.6Z" fill="#E8A800" opacity=".8"/>
    </svg>
  );
}

function FlameIcon({ lit }: { lit: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2c0 4-6 6-6 11a6 6 0 0012 0c0-3-2-5-2-8-1 2-3 3-4 4 0-3 0-5 0-7z"
        fill={lit ? '#FF7A45' : '#ccc'}/>
      <path d="M10 9c0 2-2 3-2 5a2 2 0 004 0c0-1-.5-2-.5-3-.5 1-1 1.5-1.5 2 0-1.5 0-3 0-4z"
        fill={lit ? '#FFC93C' : '#ddd'}/>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3" y="7" width="10" height="8" rx="2" stroke="var(--ink-2)" strokeWidth="1.5"/>
      <path d="M5 7V5a3 3 0 016 0v2" stroke="var(--ink-2)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// Zone scene badges (64px circle)
const ZONE_SCENE: Record<string, React.ReactNode> = {
  '探索島': (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <circle cx="18" cy="18" r="15" stroke="var(--sky-deep)" strokeWidth="1.5" opacity=".4"/>
      <path d="M18 8l2 6.5h6.5l-5.5 4 2 6.5L18 21l-5 4 2-6.5-5.5-4H16.5Z" fill="var(--sky-deep)" opacity=".6"/>
    </svg>
  ),
  '履歷工坊': (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <rect x="7" y="4" width="22" height="28" rx="4" stroke="var(--sand-deep)" strokeWidth="1.5" opacity=".5"/>
      <path d="M12 13h12M12 18h8M12 23h10" stroke="var(--sand-deep)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  '訓練場': (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <circle cx="7" cy="18" r="4" stroke="var(--mint-deep)" strokeWidth="1.5" opacity=".5"/>
      <circle cx="29" cy="18" r="4" stroke="var(--mint-deep)" strokeWidth="1.5" opacity=".5"/>
      <path d="M11 18h14" stroke="var(--mint-deep)" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M5 18h2M29 18h2" stroke="var(--mint-deep)" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  '戰情室': (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <rect x="4" y="8" width="28" height="18" rx="3" stroke="var(--coral-deep)" strokeWidth="1.5" opacity=".5"/>
      <path d="M10 16h5M10 21h16M17 16h9" stroke="var(--coral-deep)" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M16 26v4M20 26v4" stroke="var(--coral-deep)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  '升級島': (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <path d="M18 4l3 9h9l-7 5 3 9-8-5-8 5 3-9-7-5h9Z" stroke="var(--grape-deep)" strokeWidth="1.5" fill="var(--grape-deep)" fillOpacity=".18" strokeLinejoin="round"/>
    </svg>
  ),
};

const ZONE_COLORS: Record<string, { soft: string; main: string; deep: string }> = {
  '探索島':  { soft: 'var(--sky-soft)',   main: 'var(--sky)',   deep: 'var(--sky-deep)' },
  '履歷工坊': { soft: 'var(--sand-soft)',  main: 'var(--sand)',  deep: 'var(--sand-deep)' },
  '訓練場':  { soft: 'var(--mint-soft)',  main: 'var(--mint)',  deep: 'var(--mint-deep)' },
  '戰情室':  { soft: 'var(--coral-soft)', main: 'var(--coral)', deep: 'var(--coral-deep)' },
  '升級島':  { soft: 'var(--grape-soft)', main: 'var(--grape)', deep: 'var(--grape-deep)' },
};

const ZONES = ['探索島', '履歷工坊', '訓練場', '戰情室', '升級島'];

export default function IslandPage() {
  const [questData, setQuestData] = useState<QuestData | null>(null);
  const [expandedZones, setExpandedZones] = useState<Set<string>>(new Set(['探索島']));
  const [joinedGuildIds, setJoinedGuildIds] = useState<string[]>([]);
  const [poppingTask, setPoppingTask] = useState<string | null>(null);
  const [flyingPts, setFlyingPts] = useState<Record<string, boolean>>({});
  const popTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    bridgeWarRoomEvents();
    try {
      const raw = localStorage.getItem('guild.joined');
      if (raw) setJoinedGuildIds(JSON.parse(raw));
    } catch { /* ignore */ }
    const data = loadQuest();
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
    if (poppingTask) return;
    const data = loadQuest();
    const updated = markDailyDone(code, data);
    setQuestData({ ...updated });
    setPoppingTask(code);
    setFlyingPts((p) => ({ ...p, [code]: true }));
    popTimers.current[code] = setTimeout(() => {
      setPoppingTask(null);
      setFlyingPts((p) => { const n = { ...p }; delete n[code]; return n; });
    }, 950);
  }

  if (!questData) return null;

  const { level, name: levelName, nextAt } = getLevel(questData.totalPoints);
  const thresholds = [0, 100, 300, 700, 1500, 3000, 6000];
  const levelBase = level > 1 ? thresholds[level - 1] : 0;
  const levelTop = nextAt ?? questData.totalPoints;
  const progressPct = nextAt
    ? ((questData.totalPoints - levelBase) / (levelTop - levelBase)) * 100
    : 100;

  const targetRole = questData.profile?.targetRoleId ? getRoleById(questData.profile.targetRoleId) : null;

  const dailyPool = getDailyPool(questData.profile?.careerStatus ?? 'exploring');
  const today = getTodayStr();
  const doneCodes = questData.daily.date === today ? questData.daily.doneCodes : [];
  const allDone = doneCodes.length >= dailyPool.length;

  function getTaskProgress(zone: string) {
    const tasks = TASK_DEFS.filter((t) => t.zone === zone || (zone === '探索島' && t.zone === '全'));
    const done = tasks.filter((t) => (questData!.tasks[t.code]?.count ?? 0) >= (typeof t.limit === 'number' ? t.limit : 1)).length;
    return { done, total: tasks.length };
  }

  // All badges (shown + locked)
  const ALL_BADGES = BADGES.map((b) => ({ id: b.id, name: b.name }));
  const earnedIds = new Set(questData.badges.map((b) => b.id));

  return (
    <div className="site-wrapper">
      <SiteNav activePath="/island" />
      <main className="site-main" id="main-content">

        {/* Game HUD */}
        <div className="game-hud">
          {/* avatar with mascot */}
          <div className="hud-avatar">
            <svg width="44" height="44" viewBox="0 0 120 120" fill="none" aria-hidden="true">
              <path d="M60 18c22 0 34 16 34 36 0 22-14 38-34 38S26 76 26 54c0-20 12-36 34-36z" fill="#4DA3FF" stroke="#1861A8" strokeWidth="3"/>
              <path d="M60 46c12 0 20 9 20 20 0 12-8 20-20 20s-20-8-20-20c0-11 8-20 20-20z" fill="#EAF4FF"/>
              <circle cx="48" cy="50" r="4" fill="#1A2733"/><circle cx="72" cy="50" r="4" fill="#1A2733"/>
              <circle cx="50" cy="48" r="1.5" fill="#fff"/><circle cx="74" cy="48" r="1.5" fill="#fff"/>
              <path d="M54 59c3 3 9 3 12 0" stroke="#1A2733" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="40" cy="57" r="4" fill="#FF9FB0" opacity=".7"/><circle cx="80" cy="57" r="4" fill="#FF9FB0" opacity=".7"/>
            </svg>
          </div>

          {/* XP info */}
          <div className="hud-info">
            <div className="hud-level-row">
              <span className="level-badge">Lv.{level} {levelName}</span>
              {targetRole && (
                <span style={{ fontSize: '0.8125rem', color: 'var(--ink-2)' }}>
                  目標：<a href="/onboarding" style={{ color: 'var(--brand-dark)', fontWeight: 600 }}>{targetRole.name}</a>
                </span>
              )}
            </div>
            <div className="hud-xp-bar-wrap">
              <div className="hud-xp-bar-fill" style={{ width: `${Math.min(100, progressPct)}%` }} />
            </div>
            {nextAt && (
              <div className="hud-xp-label">
                {questData.totalPoints} / {nextAt} XP，距升級 {nextAt - questData.totalPoints} 點
              </div>
            )}
          </div>

          {/* coins + streak */}
          <div className="hud-right">
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: '1rem', color: 'var(--sand-deep)' }}>
              <CoinIcon size={20} />
              {questData.totalPoints}
            </div>
            {questData.streak.days > 0 && (
              <div className="streak-flame">
                <FlameIcon lit={true} />
                {questData.streak.days}
              </div>
            )}
          </div>
        </div>

        {/* Daily tasks */}
        <div className="daily-card">
          <div className="daily-card-title">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect x="2" y="4" width="16" height="14" rx="3" stroke="var(--sky-deep)" strokeWidth="1.8"/>
              <path d="M6 1v4M14 1v4" stroke="var(--sky-deep)" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M6 10l2.5 2.5L14 8" stroke="var(--sky-deep)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            今日任務（{doneCodes.length}/{dailyPool.length}）
          </div>
          {dailyPool.map((t) => {
            const done = doneCodes.includes(t.code);
            const isPopping = poppingTask === t.code;
            const showFly = flyingPts[t.code];
            return (
              <div key={t.code} className={`task-item${isPopping ? ' task-item-popping' : ''}`} style={{ position: 'relative' }}>
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
                <span className="task-pts"><CoinIcon size={13} />+10</span>
                {showFly && <span className="pts-fly">+10</span>}
              </div>
            );
          })}
          {allDone && (
            <div className="all-done-banner">
              <Mascot size={36} variant="cheer" />
              今日達成！明天繼續加油
            </div>
          )}
        </div>

        {/* Guild card */}
        <div className="guild-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {/* teal guild icon */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <circle cx="16" cy="16" r="14" stroke="var(--teal)" strokeWidth="2"/>
              <path d="M10 22c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="var(--teal)" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="16" cy="12" r="3.5" stroke="var(--teal)" strokeWidth="1.8"/>
            </svg>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--teal-deep)' }}>你的公會</div>
              {joinedGuildIds.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  {joinedGuildIds.slice(0, 3).map((id) => {
                    const g = GUILD_DEFS.find((d) => d.id === id);
                    return g ? (
                      <a key={id} href={`/guilds/${id}`} style={{ fontSize: '0.8125rem', color: 'var(--teal-deep)', fontWeight: 700, textDecoration: 'underline' }}>{g.name}</a>
                    ) : null;
                  })}
                </div>
              ) : (
                <div style={{ fontSize: '0.8125rem', color: 'var(--teal-deep)', opacity: 0.75, marginTop: 2 }}>還沒加入公會——同職涯目標的夥伴在這裡討論</div>
              )}
            </div>
            <a href="/guilds" className="btn-game-teal" style={{ padding: '8px 18px', fontSize: '0.8125rem' }}>
              {joinedGuildIds.length > 0 ? '公會大廳' : '去看看'}
            </a>
          </div>
        </div>

        {/* Zone cards with path connector */}
        <div className="zone-path" style={{ gap: 0 }}>
          {ZONES.map((zone, idx) => {
            const { done, total } = getTaskProgress(zone);
            const expanded = expandedZones.has(zone);
            const zoneTasks = TASK_DEFS.filter((t) => t.zone === zone || (zone === '探索島' && t.zone === '全'));
            const colors = ZONE_COLORS[zone];

            return (
              <div key={zone} className={`zone-path-item${idx > 0 ? '' : ''}`} style={{ marginBottom: 10, marginTop: idx > 0 ? 10 : 0 }}>
                {/* dashed path line between cards */}
                {idx > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 38, marginBottom: 4 }}>
                    <svg width="2" height="16" aria-hidden="true">
                      <line x1="1" y1="0" x2="1" y2="16" stroke="var(--line)" strokeWidth="2" strokeDasharray="3,3"/>
                    </svg>
                  </div>
                )}
                <div className="zone-card">
                  <button type="button" className="zone-card-header" onClick={() => toggleZone(zone)} aria-expanded={expanded}>
                    {/* scene icon */}
                    <div className="zone-card-icon" style={{ background: colors.soft, borderColor: colors.main }}>
                      {ZONE_SCENE[zone]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="zone-card-title">{zone}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        {/* mini XP bar */}
                        <div style={{ flex: 1, height: 6, background: 'var(--line)', borderRadius: 99 }}>
                          <div style={{ height: '100%', borderRadius: 99, background: colors.main, width: total > 0 ? `${(done / total) * 100}%` : '0%', transition: 'width .3s' }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--ink-2)', fontWeight: 600 }}>{done}/{total}</span>
                      </div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--ink-2)' }}>
                      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  {/* full progress bar */}
                  <div className="zone-card-progress-bar">
                    <div className="zone-card-progress-fill" style={{ width: total > 0 ? `${(done / total) * 100}%` : '0%', background: `linear-gradient(90deg, ${colors.main}, ${colors.deep})` }} />
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
                            <span className="task-pts"><CoinIcon size={12} />+{t.points}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Badges */}
        <div className="card" style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>
            獎章（{questData.badges.length}/{ALL_BADGES.length}）
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {ALL_BADGES.map(({ id, name }) => {
              const earned = earnedIds.has(id);
              return (
                <div key={id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    border: `3px solid ${earned ? 'var(--sand-deep)' : 'var(--line)'}`,
                    background: earned ? 'var(--sand-soft)' : 'var(--bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    filter: earned ? 'none' : 'grayscale(1)',
                    opacity: earned ? 1 : 0.5,
                    position: 'relative',
                  }}>
                    {earned ? (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <polygon points="10,2 12.5,7.5 18,8.5 14,12.5 15,18 10,15.5 5,18 6,12.5 2,8.5 7.5,7.5" fill="var(--sand-deep)" stroke="var(--sand-deep)" strokeWidth="1" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <LockIcon />
                    )}
                  </div>
                  <span style={{ fontSize: '0.6875rem', color: earned ? 'var(--ink)' : 'var(--ink-2)', fontWeight: 600, textAlign: 'center' }}>
                    {name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
