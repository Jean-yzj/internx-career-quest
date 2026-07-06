'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import SiteNav from '@/components/SiteNav';
import Footer from '@/components/Footer';
import Mascot from '@/components/Mascot';
import {
  loadQuest, saveQuest, getLevel, TASK_DEFS, getDailyPool,
  bridgeWarRoomEvents, markDailyDone, BADGES, regenerateQuestLine,
} from '@/lib/quest-store';
import type { QuestData } from '@/lib/types';
import { getTodayStr } from '@/lib/types';
import { generateQuestLine, buildCompletedSet, getCurrentStage } from '@/lib/quest-line';
import type { QuestLine, Chapter, Stage, ProfileV1 } from '@/lib/quest-line';
import { GUILD_DEFS } from '@/lib/guilds';
import styles from './island.module.css';

// ──────────────────────────────────────────────
// 小圖示元件
// ──────────────────────────────────────────────
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

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <polygon
        points="12,3 14.5,8.5 21,9.5 16.5,14 17.5,20.5 12,17.5 6.5,20.5 7.5,14 3,9.5 9.5,8.5"
        fill={filled ? 'var(--sand-deep)' : 'none'}
        stroke={filled ? 'var(--sand-deep)' : 'var(--line-strong)'}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 藍藍小角色（站在節點上）
function BlueBlue({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <path d="M60 18c22 0 34 16 34 36 0 22-14 38-34 38S26 76 26 54c0-20 12-36 34-36z" fill="#4DA3FF" stroke="#1861A8" strokeWidth="3"/>
      <path d="M60 46c12 0 20 9 20 20 0 12-8 20-20 20s-20-8-20-20c0-11 8-20 20-20z" fill="#EAF4FF"/>
      <circle cx="48" cy="50" r="4" fill="#1A2733"/><circle cx="72" cy="50" r="4" fill="#1A2733"/>
      <circle cx="50" cy="48" r="1.5" fill="#fff"/><circle cx="74" cy="48" r="1.5" fill="#fff"/>
      <path d="M54 59c3 3 9 3 12 0" stroke="#1A2733" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="40" cy="57" r="4" fill="#FF9FB0" opacity=".7"/><circle cx="80" cy="57" r="4" fill="#FF9FB0" opacity=".7"/>
    </svg>
  );
}

// 章旗 SVG
function FlagIcon({ color = 'var(--brand)' }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 2v12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M3 2l8 3-8 3" fill={color} opacity=".8"/>
    </svg>
  );
}

// ──────────────────────────────────────────────
// 節點狀態型別
// ──────────────────────────────────────────────
type NodeState = 'cleared' | 'current' | 'locked';

interface StageWithState extends Stage {
  cleared?: boolean;
  state: NodeState;
}

interface ChapterWithState extends Omit<Chapter, 'stages'> {
  stages: StageWithState[];
}

// ──────────────────────────────────────────────
// 關卡展開卡片
// ──────────────────────────────────────────────
function StageCard({
  stage,
  questData,
  onClose,
  onComplete,
}: {
  stage: StageWithState;
  questData: QuestData;
  onClose: () => void;
  onComplete: (code: string) => void;
}) {
  const [selfInputs, setSelfInputs] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  const taskDefs = stage.taskCodes.map((tc) => TASK_DEFS.find((t) => t.code === tc)).filter(Boolean);

  function isTaskDone(code: string) {
    return (questData.tasks[code]?.count ?? 0) >= 1;
  }

  function handleSelfSubmit(code: string, minLen: number) {
    const text = (selfInputs[code] ?? '').trim();
    if (text.length < minLen) return;
    setSubmitting(code);
    setTimeout(() => {
      onComplete(code);
      setSubmitting(null);
    }, 300);
  }

  // 任務的最小字數（根據 §4.2）
  const MIN_CHARS: Record<string, number> = {
    linkedin_create: 10,
    club_join: 50,
    senior_interview: 80,
    exp_inventory: 30,
    semester_plan: 20,
    goal_set: 2,
    weekly_review: 30,
    learn_resource: 50,
  };

  return (
    <div className={styles.stageCardOverlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.stageCard} role="dialog" aria-modal="true" aria-label={`關卡 ${stage.code}：${stage.title}`}>
        <div className={styles.stageCardHandle} />
        <div className={styles.stageCardTitle}>關卡 {stage.code}：{stage.title}</div>
        <div className={styles.stageCardMeta}>完成所有任務，關卡亮星！</div>
        <div className={styles.stageTaskList}>
          {taskDefs.map((t) => {
            if (!t) return null;
            const done = isTaskDone(t.code);
            const isSelf = t.type === 'self';
            const minLen = MIN_CHARS[t.code] ?? 10;
            const inputVal = selfInputs[t.code] ?? '';
            const canSubmit = inputVal.trim().length >= minLen;

            return (
              <div
                key={t.code}
                className={`${styles.stageTaskItem} ${done ? styles.stageTaskItemDone : ''}`}
              >
                <div className={`${styles.stageTaskCheck} ${done ? styles.stageTaskCheckDone : ''}`} aria-hidden="true">
                  {done && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div className={styles.stageTaskInfo}>
                  <p className={`${styles.stageTaskName} ${done ? styles.stageTaskNameDone : ''}`}>{t.name}</p>
                  <p className={styles.stageTaskMeta}>
                    {t.type === 'ext' ? '外連 internx.me' : t.type === 'self' ? '自報' : '自動'}
                  </p>
                  {/* self 任務：附輸入框（未完成時顯示） */}
                  {isSelf && !done && (
                    <>
                      <textarea
                        className={styles.selfInput}
                        placeholder={
                          t.code === 'linkedin_create' ? '貼上你的 LinkedIn profile 連結' :
                          t.code === 'club_join' ? '寫下你加入了什麼，以及想在這裡學什麼（至少 50 字）' :
                          t.code === 'senior_interview' ? '寫下 3 個你問的問題與 1 個收穫（至少 80 字）' :
                          t.code === 'exp_inventory' ? '列出 3 段經歷：做了什麼、學到什麼' :
                          t.code === 'semester_plan' ? '寫下本學期的 3 個目標' :
                          t.code === 'goal_set' ? '輸入你的目標職位（例：PM、UI 設計師）' :
                          '填寫內容'
                        }
                        value={inputVal}
                        onChange={(e) => setSelfInputs((prev) => ({ ...prev, [t.code]: e.target.value }))}
                        rows={3}
                      />
                      <p className={styles.selfInputHint}>
                        {inputVal.trim().length}/{minLen} 字{inputVal.trim().length < minLen ? `（再 ${minLen - inputVal.trim().length} 字）` : ' 達標'}
                      </p>
                      <button
                        type="button"
                        className={styles.selfSubmitBtn}
                        disabled={!canSubmit || submitting === t.code}
                        onClick={() => handleSelfSubmit(t.code, minLen)}
                      >
                        {submitting === t.code ? '送出中…' : '完成回報'}
                      </button>
                    </>
                  )}
                </div>
                <span className={styles.stageTaskPts}><CoinIcon size={12} />+{t.points}</span>
              </div>
            );
          })}
        </div>
        <button type="button" className={styles.stageCardClose} onClick={onClose}>關閉</button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// 主頁
// ──────────────────────────────────────────────
export default function IslandPage() {
  const [questData, setQuestData] = useState<QuestData | null>(null);
  const [questLine, setQuestLine] = useState<QuestLine | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null); // null=尚未確定
  const [openStage, setOpenStage] = useState<StageWithState | null>(null);
  const [joinedGuildIds, setJoinedGuildIds] = useState<string[]>([]);
  const [poppingTask, setPoppingTask] = useState<string | null>(null);
  const [flyingPts, setFlyingPts] = useState<Record<string, boolean>>({});
  const [allTasksOpen, setAllTasksOpen] = useState(false);
  const popTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // 初始化
  useEffect(() => {
    bridgeWarRoomEvents();

    // 讀公會
    try {
      const raw = localStorage.getItem('guild.joined');
      if (raw) setJoinedGuildIds(JSON.parse(raw));
    } catch { /* ignore */ }

    // 讀 quest.v1
    const data = loadQuest();
    const today = getTodayStr();
    if (data.daily.date !== today || data.daily.taskCodes.length === 0) {
      const pool = getDailyPool(data.profile?.careerStatus ?? 'exploring');
      data.daily = {
        date: today,
        taskCodes: pool.map((t) => t.code),
        doneCodes: data.daily.date === today ? data.daily.doneCodes : [],
      };
      saveQuest(data);
    }
    setQuestData(data);

    // 讀 profile.v1（不 import lib/profile.ts，直接讀 localStorage）
    let profileV1: ProfileV1 | null = null;
    try {
      const raw = localStorage.getItem('profile.v1');
      if (raw) profileV1 = JSON.parse(raw) as ProfileV1;
    } catch { /* ignore */ }

    setHasProfile(profileV1 !== null);

    if (!profileV1) return; // 無 profile → 顯示 CTA，地圖隱藏

    // quest.v1 沒有 questLine 且 profile.v1 存在 → 生成並存檔
    if (!data.questLine) {
      const completed = buildCompletedSet(data.tasks);
      const ql = generateQuestLine(profileV1, completed, new Date().toISOString());
      data.questLine = ql;
      saveQuest(data);
      setQuestLine(ql);
    } else {
      setQuestLine(data.questLine);
    }
  }, []);

  // 完成自報任務的回呼
  const handleSelfComplete = useCallback((code: string) => {
    const data = loadQuest();
    // 給點數
    if (!data.tasks[code] || data.tasks[code].count < 1) {
      const def = TASK_DEFS.find((t) => t.code === code);
      const pts = def?.points ?? 20;
      const today = getTodayStr();
      const dayTotal = data.pointsLedger
        .filter((e) => e.at.startsWith(today))
        .reduce((s, e) => s + e.delta, 0);
      const actualDelta = Math.min(pts, 200 - dayTotal);
      if (actualDelta > 0) {
        data.totalPoints += actualDelta;
        data.pointsLedger.push({
          id: Math.random().toString(36),
          delta: actualDelta,
          reason: def?.name ?? code,
          at: new Date().toISOString(),
          balanceAfter: data.totalPoints,
        });
      }
    }
    data.tasks[code] = { count: (data.tasks[code]?.count ?? 0) + 1, lastAt: new Date().toISOString() };

    // 重算 questLine cleared 狀態
    if (data.questLine) {
      const completed = buildCompletedSet(data.tasks);
      for (const ch of data.questLine.chapters) {
        for (const stage of ch.stages) {
          (stage as Stage & { cleared?: boolean }).cleared =
            stage.taskCodes.every((tc) => completed.has(tc));
        }
      }
      setQuestLine({ ...data.questLine });
    }

    saveQuest(data);
    setQuestData({ ...data });
    setOpenStage(null);
  }, []);

  // 今日任務完成
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

  if (!questData || hasProfile === null) return null;

  const { level, name: levelName, nextAt } = getLevel(questData.totalPoints);
  const thresholds = [0, 100, 300, 700, 1500, 3000, 6000];
  const levelBase = level > 1 ? thresholds[level - 1] : 0;
  const levelTop = nextAt ?? questData.totalPoints;
  const progressPct = nextAt
    ? ((questData.totalPoints - levelBase) / (levelTop - levelBase)) * 100
    : 100;

  const dailyPool = getDailyPool(questData.profile?.careerStatus ?? 'exploring');
  const today = getTodayStr();
  const doneCodes = questData.daily.date === today ? questData.daily.doneCodes : [];
  const allDone = doneCodes.length >= dailyPool.length;

  const ALL_BADGES = BADGES.map((b) => ({ id: b.id, name: b.name }));
  const earnedIds = new Set(questData.badges.map((b) => b.id));

  // 建立帶狀態的章節
  let chaptersWithState: ChapterWithState[] = [];
  let currentStageCode: string | null = null;
  if (questLine) {
    const current = getCurrentStage(questLine);
    currentStageCode = current?.stageCode ?? null;

    let passedCurrent = false;
    chaptersWithState = questLine.chapters.map((ch) => ({
      ...ch,
      stages: ch.stages.map((stage) => {
        const cleared = !!(stage as Stage & { cleared?: boolean }).cleared;
        let state: NodeState;
        if (cleared) {
          state = 'cleared';
        } else if (!passedCurrent && stage.code === currentStageCode) {
          state = 'current';
          passedCurrent = true;
        } else if (!passedCurrent) {
          // 未 cleared 且還沒遇到 current → 這不應該發生，但防禦性處理
          state = 'current';
          passedCurrent = true;
        } else {
          state = 'locked';
        }
        return { ...stage, state } as StageWithState;
      }),
    }));
  }

  return (
    <div className="site-wrapper">
      <SiteNav activePath="/island" />
      <main className="site-main" id="main-content">

        {/* Game HUD */}
        <div className="game-hud">
          <div className="hud-avatar">
            <BlueBlue size={44} />
          </div>
          <div className="hud-info">
            <div className="hud-level-row">
              <span className="level-badge">Lv.{level} {levelName}</span>
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

        {/* 今日任務 */}
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

        {/* 無 profile → 顯示 CTA */}
        {!hasProfile && (
          <div className={styles.registerCta}>
            <div className={styles.registerCtaTitle}>完成註冊，生成你的冒險地圖</div>
            <div className={styles.registerCtaDesc}>
              告訴我你的年級與目標，藍藍幫你規劃專屬的職涯關卡路線。
            </div>
            <a href="/onboarding" className={styles.registerCtaBtn}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M10 2l2.5 5h5.5l-4.5 3.5 1.5 5L10 13l-5 2.5 1.5-5L2 7h5.5Z" fill="#fff" opacity=".9"/>
              </svg>
              開始生成地圖
            </a>
          </div>
        )}

        {/* 關卡地圖 */}
        {hasProfile && questLine && (
          <div className={styles.questMapSection}>
            <div className={styles.questMapTitle}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M3 17l4-11 7 4 3-8" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="3" cy="17" r="1.5" fill="var(--brand)"/>
                <circle cx="17" cy="2" r="1.5" fill="var(--brand)"/>
              </svg>
              你的冒險地圖
              <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--ink-2)' }}>
                {questLine.trackId === 'explorer' ? '探索軌' : questLine.trackId === 'builder' ? '準備軌' : '衝刺軌'}
              </span>
            </div>

            <div className={styles.questMap}>
              {chaptersWithState.map((ch, chIdx) => (
                <div key={ch.id} style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {/* 章旗橫幅 */}
                  <div className={styles.chapterBanner}>
                    <div className={styles.chapterBannerLine} />
                    <div className={styles.chapterBannerFlag}><FlagIcon color="var(--brand)" /></div>
                    <div className={styles.chapterBannerText}>{ch.title}</div>
                    <div className={styles.chapterBannerFlag}><FlagIcon color="var(--brand)" /></div>
                    <div className={styles.chapterBannerLine} />
                  </div>

                  {/* 節點路徑 */}
                  <div className={styles.pathContainer}>
                    {ch.stages.map((stage, stageIdx) => {
                      const isLeft = stageIdx % 2 === 0;
                      const isLast = stageIdx === ch.stages.length - 1 && chIdx === chaptersWithState.length - 1;
                      const nodeState = stage.state;
                      const isCurrent = nodeState === 'current';
                      const isCleared = nodeState === 'cleared';
                      const isLocked = nodeState === 'locked';

                      return (
                        <div key={stage.code} style={{ width: '100%', position: 'relative' }}>
                          <div
                            className={`${styles.nodeRow} ${isLeft ? styles.alignLeft : styles.alignRight}`}
                          >
                            <div
                              className={`${styles.stageNode} ${isCurrent ? styles.nodeCurrent : isCleared ? styles.nodeCleared : styles.nodeLocked} ${isCurrent ? styles.clickable : ''}`}
                              onClick={() => isCurrent && setOpenStage(stage)}
                              role={isCurrent ? 'button' : undefined}
                              tabIndex={isCurrent ? 0 : undefined}
                              onKeyDown={(e) => isCurrent && e.key === 'Enter' && setOpenStage(stage)}
                              aria-label={isCurrent ? `關卡 ${stage.code}：${stage.title}（點擊展開）` : undefined}
                            >
                              {/* 脈動圈 */}
                              {isCurrent && <div className={styles.pulseRing} aria-hidden="true" />}

                              <div className={styles.nodeCircle}>
                                {isCleared ? <StarIcon filled={true} /> : isCurrent ? <BlueBlue size={32} /> : <LockIcon />}
                              </div>
                              <span className={`${styles.nodeLabel} ${isCurrent ? styles.nodeLabelCurrent : isCleared ? styles.nodeLabelCleared : ''}`}>
                                {stage.code}
                              </span>
                              <span className={`${styles.nodeLabel}`} style={{ fontSize: '0.625rem', maxWidth: 72 }}>
                                {stage.title}
                              </span>
                            </div>
                          </div>

                          {/* 虛線連線（非最後一個節點） */}
                          {!isLast && (
                            <div style={{ display: 'flex', justifyContent: isLeft ? 'flex-start' : 'flex-end', paddingLeft: isLeft ? 50 : 0, paddingRight: isLeft ? 0 : 50, marginBottom: 0 }}>
                              <svg width="2" height="20" aria-hidden="true" style={{ display: 'block' }}>
                                <line x1="1" y1="0" x2="1" y2="20" stroke="var(--line)" strokeWidth="2" strokeDasharray="4 4"/>
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 公會卡 */}
        <div className="guild-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
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

        {/* 全部任務（折疊） */}
        <div className="card" style={{ marginTop: 16, overflow: 'hidden' }}>
          <button type="button" className={styles.allTasksToggle} onClick={() => setAllTasksOpen((v) => !v)} aria-expanded={allTasksOpen}>
            全部任務（{Object.values(questData.tasks).filter((t) => t.count >= 1).length}/{TASK_DEFS.filter((t) => typeof t.limit === 'number').length} 已完成）
            <svg
              width="16" height="16" viewBox="0 0 16 16" fill="none"
              className={`${styles.allTasksToggleChevron} ${allTasksOpen ? styles.allTasksToggleChevronOpen : ''}`}
              aria-hidden="true"
            >
              <path d="M4 6l4 4 4-4" stroke="var(--ink-2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {allTasksOpen && (
            <div style={{ padding: '0 4px 8px' }}>
              {['探索島', '履歷工坊', '訓練場', '戰情室', '升級島'].map((zone) => {
                const zoneTasks = TASK_DEFS.filter((t) => t.zone === zone || (zone === '探索島' && t.zone === '全'));
                return (
                  <div key={zone} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--ink-2)', margin: '10px 12px 6px' }}>{zone}</div>
                    {zoneTasks.map((t) => {
                      const count = questData.tasks[t.code]?.count ?? 0;
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
                );
              })}
            </div>
          )}
        </div>

      </main>
      <Footer />

      {/* 關卡展開卡片 */}
      {openStage && questData && (
        <StageCard
          stage={openStage}
          questData={questData}
          onClose={() => setOpenStage(null)}
          onComplete={handleSelfComplete}
        />
      )}
    </div>
  );
}
