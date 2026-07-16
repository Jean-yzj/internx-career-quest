'use client';

import type { QuestData } from './types';
import { getRoleById, type RoleId } from './roles';
import { getRoleGuide, ROLE_PROOF_IDEAS } from './role-guide';

const STORAGE_KEY = 'action-plan.v1';

export interface ActionPlanTask {
  id: string;
  day: number;
  title: string;
  detail: string;
  href?: string;
  completedAt: string | null;
}

export interface ActionPlan {
  schemaVersion: 1;
  roleId: RoleId;
  createdAt: string;
  updatedAt: string;
  tasks: ActionPlanTask[];
}

function isClient(): boolean {
  return typeof window !== 'undefined';
}

export function loadActionPlan(): ActionPlan | null {
  if (!isClient()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActionPlan;
    if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.tasks)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveActionPlan(plan: ActionPlan): void {
  if (!isClient()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
}

export function buildActionPlan(roleId: RoleId, quest: QuestData, previous?: ActionPlan | null): ActionPlan {
  const role = getRoleById(roleId);
  const guide = getRoleGuide(roleId);
  if (!role || !guide) throw new Error('INVALID_ROLE');

  const completed = new Map(
    (previous?.roleId === roleId ? previous.tasks : []).map((task) => [task.id, task.completedAt]),
  );
  const topGap = quest.analysis?.roleId === roleId ? quest.analysis.gaps[0]?.label : null;
  const proofIdea = ROLE_PROOF_IDEAS[roleId]?.[0] ?? guide.entryPath[0];
  const now = new Date().toISOString();
  const definitions = [
    {
      title: `看懂 ${role.name} 的一天`,
      detail: `讀完職位圖鑑，記下你最想嘗試的一項工作：${guide.dayInLife[0]}`,
      href: `/roles/${roleId}`,
    },
    {
      title: '盤點一段可用經歷',
      detail: '挑一段社團、課堂、打工或專案經歷，寫下你解決的問題、行動與結果。',
      href: '/island',
    },
    {
      title: `補一個「${topGap ?? role.skills[0]?.label ?? '核心能力'}」證據`,
      detail: topGap
        ? `履歷分析顯示這是目前最值得補的缺口。先找一個真實例子，不用急著修排版。`
        : `用一段具體經歷證明這項能力，避免只在技能欄寫「熟悉」。`,
      href: quest.analysis ? '/analysis' : '/quiz/ability',
    },
    {
      title: '做一份可展示的小作品',
      detail: proofIdea,
      href: `/roles/${roleId}`,
    },
    {
      title: '把成果改成履歷句子',
      detail: '用「做了什麼、怎麼做、結果如何」寫成一到兩句，至少補上一個數字或可驗證成果。',
      href: '/analysis',
    },
    {
      title: '收藏 3 個真實職缺',
      detail: `從實習雷達挑 3 個 ${role.name} 職缺，記下共同要求與截止日。`,
      href: `/roles/${roleId}`,
    },
    {
      title: '完成本週回顧',
      detail: '確認哪些證據已補齊、哪一步卡住，選出下週唯一最重要的行動。',
      href: '/war-room',
    },
  ];

  return {
    schemaVersion: 1,
    roleId,
    createdAt: previous?.roleId === roleId ? previous.createdAt : now,
    updatedAt: now,
    tasks: definitions.map((definition, index) => {
      const id = `${roleId}-day-${index + 1}`;
      return {
        id,
        day: index + 1,
        ...definition,
        completedAt: completed.get(id) ?? null,
      };
    }),
  };
}

export function createActionPlan(roleId: RoleId, quest: QuestData): ActionPlan {
  const plan = buildActionPlan(roleId, quest, loadActionPlan());
  saveActionPlan(plan);
  return plan;
}

export function toggleActionPlanTask(taskId: string): ActionPlan | null {
  const plan = loadActionPlan();
  if (!plan) return null;
  const task = plan.tasks.find((item) => item.id === taskId);
  if (!task) return plan;
  task.completedAt = task.completedAt ? null : new Date().toISOString();
  plan.updatedAt = new Date().toISOString();
  saveActionPlan(plan);
  return plan;
}
