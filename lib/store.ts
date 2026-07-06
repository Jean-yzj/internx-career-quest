import type { Application, WarRoomData, Status } from './types';
import { getTodayStr } from './types';

const STORAGE_KEY = 'warroom.v1';
const SIZE_WARN_BYTES = 4.5 * 1024 * 1024;

function isClient(): boolean {
  return typeof window !== 'undefined';
}

export function loadData(): WarRoomData {
  if (!isClient()) return { schemaVersion: 1, applications: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { schemaVersion: 1, applications: [] };
    const parsed = JSON.parse(raw) as WarRoomData;
    return migrateData(parsed);
  } catch {
    return { schemaVersion: 1, applications: [] };
  }
}

export function saveData(data: WarRoomData): { ok: boolean; sizeWarning?: boolean } {
  if (!isClient()) return { ok: false };
  try {
    const serialized = JSON.stringify(data);
    if (serialized.length > SIZE_WARN_BYTES) {
      return { ok: true, sizeWarning: true };
    }
    localStorage.setItem(STORAGE_KEY, serialized);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

function migrateData(data: WarRoomData): WarRoomData {
  // v1 only, no migration needed yet
  if (data.schemaVersion === 1) return data;
  return { schemaVersion: 1, applications: data.applications ?? [] };
}

export function addApplication(app: Application): WarRoomData {
  const data = loadData();
  data.applications.push(app);
  saveData(data);
  return data;
}

export function updateApplication(updated: Application): WarRoomData {
  const data = loadData();
  const idx = data.applications.findIndex((a) => a.id === updated.id);
  if (idx >= 0) {
    data.applications[idx] = updated;
    saveData(data);
  }
  return data;
}

export function deleteApplication(id: string): WarRoomData {
  const data = loadData();
  data.applications = data.applications.filter((a) => a.id !== id);
  saveData(data);
  return data;
}

export function changeStatus(app: Application, newStatus: Status): Application {
  const updated: Application = {
    ...app,
    status: newStatus,
    updatedAt: new Date().toISOString(),
    statusHistory: [
      ...app.statusHistory,
      { from: app.status, to: newStatus, at: new Date().toISOString() },
    ],
  };
  updateApplication(updated);
  return updated;
}

export function mergeImport(incoming: WarRoomData): WarRoomData {
  const current = loadData();
  const map = new Map<string, Application>();

  for (const app of current.applications) {
    map.set(app.id, app);
  }

  for (const app of incoming.applications) {
    const existing = map.get(app.id);
    if (!existing || app.updatedAt > existing.updatedAt) {
      map.set(app.id, app);
    }
  }

  const merged: WarRoomData = {
    schemaVersion: 1,
    applications: Array.from(map.values()),
  };

  saveData(merged);
  return merged;
}

export function clearAll(): void {
  if (!isClient()) return;
  localStorage.removeItem(STORAGE_KEY);
}

export function exportJSON(): string {
  const data = loadData();
  const today = getTodayStr().replace(/-/g, '');
  const filename = `war-room-backup-${today}.json`;
  return JSON.stringify({ filename, data: JSON.stringify(data, null, 2) });
}
