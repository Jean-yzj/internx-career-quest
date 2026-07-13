'use client';

import type { QuestData, CareerStatus, AbilityLevel, Dimension } from './types';
import { getTodayStr, formatDateStr } from './types';
import { syncProfile } from './profile';
import { generateQuestLine, buildCompletedSet } from './quest-line';
import type { ProfileV1 } from './quest-line';

const QUEST_KEY = 'quest.v1';

function isClient(): boolean {
  return typeof window !== 'undefined';
}

export function loadQuest(): QuestData {
  if (!isClient()) return defaultQuest();
  try {
    const raw = localStorage.getItem(QUEST_KEY);
    if (!raw) return defaultQuest();
    return JSON.parse(raw) as QuestData;
  } catch {
    return defaultQuest();
  }
}

export function saveQuest(data: QuestData): void {
  if (!isClient()) return;
  localStorage.setItem(QUEST_KEY, JSON.stringify(data));
}

function defaultQuest(): QuestData {
  return {
    schemaVersion: 1,
    profile: null,
    interest: null,
    ability: null,
    analysis: null,
    analysisPrev: null,
    tasks: {},
    daily: { date: '', taskCodes: [], doneCodes: [] },
    pointsLedger: [],
    totalPoints: 0,
    badges: [],
    streak: { days: 0, lastDate: '' },
    questLine: null,
  };
}

/**
 * 生成並存回 questLine（由 island 頁或整合階段呼叫）
 * profileV1: 從 localStorage 'profile.v1' 讀到的物件
 * generatedAt: 由呼叫端傳入（預設 now，可覆寫以便測試）
 * analysis: 選用，傳入可觸發特訓班章插入
 */
export function regenerateQuestLine(
  profileV1: ProfileV1,
  generatedAt: string = new Date().toISOString(),
  analysis?: { checklist: Record<string, boolean>; overall: number },
): QuestData {
  const data = loadQuest();
  const completed = buildCompletedSet(data.tasks);
  data.questLine = generateQuestLine(profileV1, completed, generatedAt, analysis);
  saveQuest(data);
  return data;
}

// Level thresholds: Lv1-7
export const LEVEL_THRESHOLDS = [0, 100, 300, 700, 1500, 3000, 6000];
export const LEVEL_NAMES = ['職涯新手村村民', '履歷工坊學徒', '技能訓練生', '投遞小勇者', '面試挑戰者', '實習通關者', '職涯分享官'];

export function getLevel(points: number): { level: number; name: string; nextAt: number | null } {
  let lv = 0;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i]) { lv = i; break; }
  }
  return {
    level: lv + 1,
    name: LEVEL_NAMES[lv],
    nextAt: lv < LEVEL_THRESHOLDS.length - 1 ? LEVEL_THRESHOLDS[lv + 1] : null,
  };
}

// Task definitions
export interface TaskDef {
  code: string;
  name: string;
  zone: string;
  type: 'auto' | 'self' | 'ext';
  points: number;
  limit: number | 'daily' | 'weekly_2' | 'weekly_3' | 'monthly_2' | 'quarterly_2' | 'weekly_1' | 'monthly_1';
  comingSoon?: boolean; // 公會相關任務暫隱藏，待 §11 實作
}

export const TASK_DEFS: TaskDef[] = [
  { code: 'onboarding_done', name: '完成闖關啟程', zone: '全', type: 'auto', points: 20, limit: 1 },
  { code: 'interest_quiz', name: '完成興趣方向測驗', zone: '探索島', type: 'auto', points: 30, limit: 1 },
  { code: 'ability_quiz', name: '完成能力水平測驗', zone: '探索島', type: 'auto', points: 30, limit: 1 },
  { code: 'role_explore_3', name: '認識 3 個職位模板', zone: '探索島', type: 'auto', points: 20, limit: 1 },
  { code: 'read_review_3roles', name: '去實習通看 3 篇不同職位心得', zone: '探索島', type: 'ext', points: 30, limit: 1 },
  { code: 'resume_analyzed', name: '完成第一次 AI 履歷分析', zone: '履歷工坊', type: 'auto', points: 50, limit: 1 },
  { code: 'resume_improve', name: '依建議修改履歷後重新分析', zone: '履歷工坊', type: 'auto', points: 40, limit: 3 },
  { code: 'portfolio_added', name: '新版履歷補上了作品集連結', zone: '履歷工坊', type: 'auto', points: 20, limit: 1 },
  { code: 'quantified_added', name: '新版履歷補上了量化成果', zone: '履歷工坊', type: 'auto', points: 20, limit: 1 },
  { code: 'read_target_3', name: '去實習通看 3 篇目標職位心得', zone: '訓練場', type: 'ext', points: 30, limit: 1 },
  { code: 'learn_resource', name: '完成一個學習資源（50 字心得）', zone: '訓練場', type: 'self', points: 30, limit: 'weekly_2' },
  { code: 'mini_artifact', name: '交一份小型實作（貼連結）', zone: '訓練場', type: 'self', points: 60, limit: 'monthly_2' },
  { code: 'activity_join', name: '報名一場相關活動', zone: '訓練場', type: 'ext', points: 40, limit: 'monthly_1' },
  { code: 'coffee_chat', name: '約一次 Coffee Chat', zone: '訓練場', type: 'ext', points: 60, limit: 'quarterly_2' },
  { code: 'app_first', name: '戰情室建立第一個職缺', zone: '戰情室', type: 'auto', points: 50, limit: 1 },
  { code: 'app_five', name: '戰情室累積 5 個職缺', zone: '戰情室', type: 'auto', points: 30, limit: 1 },
  { code: 'app_deadline_set', name: '為職缺設定截止日', zone: '戰情室', type: 'auto', points: 10, limit: 1 },
  { code: 'app_submit_first', name: '完成第一次投遞', zone: '戰情室', type: 'auto', points: 80, limit: 1 },
  { code: 'interview_log', name: '記錄一場面試', zone: '戰情室', type: 'auto', points: 30, limit: 'weekly_3' },
  { code: 'weekly_review', name: '完成一週投遞回顧', zone: '戰情室', type: 'self', points: 30, limit: 'weekly_1' },
  { code: 'share_story', name: '把上岸經驗寫成心得發回實習通', zone: '升級島', type: 'ext', points: 100, limit: 'quarterly_2' },
  { code: 'help_newbie', name: '公會內回覆他人', zone: '升級島', type: 'auto', points: 20, limit: 'weekly_2' },
  { code: 'join_guild', name: '加入一個公會', zone: '升級島', type: 'auto', points: 20, limit: 1 },
  { code: 'guild_intro', name: '公會首貼自我介紹', zone: '升級島', type: 'auto', points: 30, limit: 1 },
  // §4.2 新任務（Agent B 追加）
  { code: 'linkedin_create', name: '建立你的 LinkedIn（附 profile 連結）', zone: '探索島', type: 'self', points: 40, limit: 1 },
  { code: 'club_join', name: '加入一個社團／專案並寫下想學什麼（50 字）', zone: '探索島', type: 'self', points: 40, limit: 1 },
  { code: 'senior_interview', name: '訪談一位學長姐（附 3 個提問與 1 個收穫，80 字）', zone: '訓練場', type: 'self', points: 50, limit: 1 },
  { code: 'exp_inventory', name: '完成經歷盤點表（列 3 段經歷：做了什麼/學到什麼）', zone: '履歷工坊', type: 'self', points: 40, limit: 1 },
  { code: 'semester_plan', name: '擬一份本學期行動計畫（3 個目標）', zone: '探索島', type: 'self', points: 30, limit: 1 },
  { code: 'goal_set', name: '設定目標職位', zone: '探索島', type: 'self', points: 20, limit: 1 },
];

const DAILY_TASK_POOL = {
  exploring: [
    { code: 'daily_read_review', name: '看 1 篇心得', type: 'ext' as const },
    { code: 'daily_role_learn', name: '認識 1 個職位模板', type: 'auto' as const },
    { code: 'daily_pref_question', name: '回答 1 題職涯偏好題', type: 'auto' as const },
  ],
  preparing: [
    { code: 'daily_resume_tip', name: '領取今日履歷修改提示並回報', type: 'self' as const },
    { code: 'daily_role_review', name: '看 1 篇目標職位心得', type: 'ext' as const },
    { code: 'daily_skills_evidence', name: '為履歷技能清單想 1 個新證據', type: 'self' as const },
  ],
  applying: [
    { code: 'daily_new_app', name: '新增 1 個職缺', type: 'auto' as const },
    { code: 'daily_update_status', name: '更新 1 個投遞狀態', type: 'auto' as const },
    { code: 'daily_interview_q', name: '記錄 1 個面試問題', type: 'auto' as const },
    { code: 'radar_check', name: '看看今天有什麼新職缺', type: 'auto' as const },
  ],
};

export function getDailyPool(status: CareerStatus): { code: string; name: string; type: 'auto' | 'self' | 'ext' }[] {
  if (status === 'exploring' || status === 'narrowing') return DAILY_TASK_POOL.exploring;
  if (status === 'targeting' || status === 'applying' || status === 'leveling') return DAILY_TASK_POOL.applying;
  return DAILY_TASK_POOL.preparing;
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Badge definitions
export const BADGES = [
  { id: 'onboarding', name: '啟程', check: (d: QuestData) => d.profile !== null },
  { id: 'resume_first', name: '履歷啟動', check: (d: QuestData) => d.analysis !== null },
  { id: 'review_explore', name: '心得探索', check: (d: QuestData) => (d.tasks['read_review_3roles']?.count ?? 0) >= 1 || (d.tasks['read_target_3']?.count ?? 0) >= 1 || (d.tasks['learn_resource']?.count ?? 0) >= 10 },
  { id: 'warroom_first', name: '投遞啟動', check: (d: QuestData) => (d.tasks['app_first']?.count ?? 0) >= 1 },
  { id: 'first_submit', name: '首投', check: (d: QuestData) => (d.tasks['app_submit_first']?.count ?? 0) >= 1 },
  { id: 'weekly_streak', name: '週週打卡', check: (d: QuestData) => d.streak.days >= 7 },
  { id: 'guild_icebreaker', name: '社群破冰', check: (d: QuestData) => (d.tasks['guild_intro']?.count ?? 0) >= 1 },
];

function checkAndGrantBadges(data: QuestData): void {
  const existing = new Set(data.badges.map((b) => b.id));
  for (const badge of BADGES) {
    if (!existing.has(badge.id) && badge.check(data)) {
      data.badges.push({ id: badge.id, at: new Date().toISOString() });
    }
  }
}

const DAILY_LIMIT = 30;
const DAY_TOTAL_LIMIT = 200;

/**
 * award() — idempotent point grant
 * oneTime: if true, only grants once (tasks with limit=1)
 */
export function award(code: string, delta: number, reason: string, oneTime = false): QuestData {
  const data = loadQuest();
  const today = getTodayStr();

  // Idempotency check for one-time tasks
  if (oneTime) {
    const existing = data.tasks[code];
    if (existing && existing.count >= 1) return data;
  }

  // Daily pool limit (10 pts per daily task, max 30/day)
  const isDailyPool = code.startsWith('daily_');
  if (isDailyPool) {
    const dailyEarned = data.pointsLedger
      .filter((e) => formatDateStr(new Date(e.at)) === today && e.reason.includes('[daily]'))
      .reduce((s, e) => s + e.delta, 0);
    if (dailyEarned >= DAILY_LIMIT) return data;
  }

  // Day total limit
  const dayTotal = data.pointsLedger
    .filter((e) => formatDateStr(new Date(e.at)) === today)
    .reduce((s, e) => s + e.delta, 0);
  if (dayTotal >= DAY_TOTAL_LIMIT) return data;

  const actualDelta = Math.min(delta, DAY_TOTAL_LIMIT - dayTotal);
  const balanceAfter = data.totalPoints + actualDelta;

  data.totalPoints = balanceAfter;
  data.pointsLedger.push({
    id: generateId(),
    delta: actualDelta,
    reason: isDailyPool ? `${reason} [daily]` : reason,
    at: new Date().toISOString(),
    balanceAfter,
  });

  // Update task record
  const existing = data.tasks[code];
  data.tasks[code] = {
    count: (existing?.count ?? 0) + 1,
    lastAt: new Date().toISOString(),
  };

  // Streak: complete any daily task
  if (isDailyPool || code === 'onboarding_done' || code === 'interest_quiz' || code === 'ability_quiz') {
    if (data.streak.lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = formatDateStrLocal(yesterday);
      if (data.streak.lastDate === yStr) {
        data.streak.days += 1;
      } else {
        data.streak.days = 1;
      }
      data.streak.lastDate = today;
    }
  }

  checkAndGrantBadges(data);
  saveQuest(data);
  syncProfile();
  return data;
}

function formatDateStrLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function markDailyDone(code: string, data: QuestData): QuestData {
  const today = getTodayStr();
  if (data.daily.date !== today) {
    data.daily = { date: today, taskCodes: data.daily.taskCodes, doneCodes: [] };
  }
  if (!data.daily.doneCodes.includes(code)) {
    data.daily.doneCodes.push(code);
    // Update streak
    if (data.streak.lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = formatDateStrLocal(yesterday);
      data.streak.days = data.streak.lastDate === yStr ? data.streak.days + 1 : 1;
      data.streak.lastDate = today;
    }
    checkAndGrantBadges(data);
    saveQuest(data);
    syncProfile();
  }
  return data;
}

/**
 * Bridge: read warroom.v1 and award matching tasks (idempotent)
 */
// 回傳這次新發放的點數（0=沒有新點數），供 war-room 當下顯示「+X XP」回饋
export function bridgeWarRoomEvents(): number {
  if (!isClient()) return 0;
  const before = loadQuest().totalPoints;
  try {
    const raw = localStorage.getItem('warroom.v1');
    if (!raw) return 0;
    const wr = JSON.parse(raw) as { schemaVersion: number; applications: Array<{
      id: string; deadline?: string; interviews?: Array<unknown>;
      statusHistory?: Array<{ to: string; at: string }>;
    }> };
    if (!wr.applications?.length) return 0;

    const apps = wr.applications;
    const total = apps.length;

    if (total >= 1) award('app_first', 50, '戰情室建立第一個職缺', true);
    if (total >= 5) award('app_five', 30, '戰情室累積 5 個職缺', true);

    const hasDeadline = apps.some((a) => a.deadline);
    if (hasDeadline) award('app_deadline_set', 10, '為職缺設定截止日', true);

    const hasSubmit = apps.some((a) =>
      a.statusHistory?.some((h) => h.to === 'submitted' || h.to === 'screening' || h.to === 'interviewing' || h.to === 'offer')
    );
    if (hasSubmit) award('app_submit_first', 80, '完成第一次投遞', true);
  } catch {
    // ignore
  }
  return loadQuest().totalPoints - before;
}
