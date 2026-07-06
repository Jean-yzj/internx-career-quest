'use client';

// lib/profile.ts — profile.v1 localStorage 層 + 伺服器 sync
// Agent A 擁有；B/C 只能 import getProfile/saveProfile/syncProfile

export type Grade = 'y1' | 'y2' | 'y3' | 'y4' | 'grad' | 'fresh';

export interface Profile {
  deviceId: string;
  nickname: string;
  avatarId: 1 | 2 | 3 | 4 | 5 | 6;
  grade: Grade;
  hasResume: boolean;
  hasClubExp: boolean;
  hasApplied: boolean;
  birthYear: number | null;
  goalRoleId: string | null;
  transferCode: string;
  registeredAt: string;
}

const PROFILE_KEY = 'profile.v1';

function isClient(): boolean {
  return typeof window !== 'undefined';
}

export function getProfile(): Profile | null {
  if (!isClient()) return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Profile;
  } catch {
    return null;
  }
}

export function saveProfile(profile: Profile): void {
  if (!isClient()) return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

// Returns existing deviceId from guild or profile, or creates new
export function getOrCreateDeviceId(): string {
  if (!isClient()) return '';
  // Try existing profile first
  const p = getProfile();
  if (p?.deviceId) return p.deviceId;
  // Try guild deviceId
  try {
    const raw = localStorage.getItem('guild.deviceId');
    if (raw) return raw;
  } catch { /* ignore */ }
  // Create new
  const id = crypto.randomUUID();
  try { localStorage.setItem('guild.deviceId', id); } catch { /* ignore */ }
  return id;
}

// ---- sync debounce ----
let syncTimer: ReturnType<typeof setTimeout> | null = null;

export function syncProfile(): void {
  if (!isClient()) return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    syncTimer = null;
    const profile = getProfile();
    if (!profile) return;
    // Load quest data for points/level/streak/badges
    let totalPoints = 0;
    let level = 1;
    let streak = 0;
    let badgeCount = 0;
    try {
      const raw = localStorage.getItem('quest.v1');
      if (raw) {
        const q = JSON.parse(raw);
        totalPoints = q.totalPoints ?? 0;
        streak = q.streak?.days ?? 0;
        badgeCount = q.badges?.length ?? 0;
        // compute level from thresholds
        const thresholds = [0, 100, 300, 700, 1500, 3000, 6000];
        let lv = 0;
        for (let i = thresholds.length - 1; i >= 0; i--) {
          if (totalPoints >= thresholds[i]) { lv = i; break; }
        }
        level = lv + 1;
      }
    } catch { /* ignore */ }

    try {
      await fetch('/api/profile/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: profile.deviceId,
          totalPoints,
          level,
          streak,
          badgeCount,
        }),
      });
    } catch { /* network error — local game unaffected */ }
  }, 10_000);
}
