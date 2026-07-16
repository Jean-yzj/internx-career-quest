'use client';

import type { RoleId } from './roles';

const STORAGE_KEY = 'action-plan-work.v1';

export interface ActionPlanTaskWork {
  values: Record<string, string>;
  updatedAt: string;
}

interface ActionPlanWorkStore {
  schemaVersion: 1;
  roleId: RoleId;
  tasks: Record<string, ActionPlanTaskWork>;
}

function loadStore(roleId: RoleId): ActionPlanWorkStore {
  const empty: ActionPlanWorkStore = { schemaVersion: 1, roleId, tasks: {} };
  if (typeof window === 'undefined') return empty;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as ActionPlanWorkStore;
    if (parsed.schemaVersion !== 1 || parsed.roleId !== roleId || !parsed.tasks) return empty;
    return parsed;
  } catch {
    return empty;
  }
}

export function loadActionPlanTaskWork(roleId: RoleId, taskId: string): ActionPlanTaskWork | null {
  return loadStore(roleId).tasks[taskId] ?? null;
}

export function saveActionPlanTaskWork(
  roleId: RoleId,
  taskId: string,
  values: Record<string, string>,
): ActionPlanTaskWork {
  const store = loadStore(roleId);
  const work = { values, updatedAt: new Date().toISOString() };
  store.tasks[taskId] = work;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  return work;
}

export function getActionPlanWorkTaskIds(roleId: RoleId): Set<string> {
  return new Set(Object.keys(loadStore(roleId).tasks));
}
