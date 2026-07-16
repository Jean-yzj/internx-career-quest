import type { Application } from './types';
import { getTodayStr } from './types';

export interface WeeklyReviewData {
  added: number;
  submitted: number;
  interviews: number;
  offers: number;
  responseRate: number;
  dueSoon: number;
  actions: string[];
}

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calendarDaysUntil(dateStr: string, now: Date): number {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [year, month, day] = dateStr.split('-').map(Number);
  const target = new Date(year, month - 1, day);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function buildWeeklyReview(apps: Application[], now = new Date()): WeeklyReviewData {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - 7);
  const cutoffIso = cutoff.toISOString();
  const cutoffDate = dateKey(cutoff);
  const today = dateKey(now);
  const added = apps.filter((app) => app.createdAt >= cutoffIso).length;
  const submittedApps = apps.filter((app) => app.statusHistory.some((entry) => ['submitted', 'screening', 'interviewing', 'offer'].includes(entry.to)));
  const submitted = submittedApps.filter((app) => app.statusHistory.some((entry) => entry.at >= cutoffIso && ['submitted', 'screening'].includes(entry.to))).length;
  const interviews = apps.filter((app) => app.interviews.some(
    (interview) => interview.date >= cutoffDate && interview.date <= today,
  )).length;
  const offers = apps.filter((app) => app.status === 'offer').length;
  const responses = submittedApps.filter((app) => ['screening', 'interviewing', 'offer', 'rejected'].includes(app.status)).length;
  const responseRate = submittedApps.length > 0 ? Math.round((responses / submittedApps.length) * 100) : 0;
  const dueSoon = apps.filter((app) => {
    if (!app.deadline) return false;
    const days = calendarDaysUntil(app.deadline, now);
    return days >= 0 && days <= 7;
  }).length;
  const actions: string[] = [];
  const noDeadline = apps.filter((app) => ['wishlist', 'preparing'].includes(app.status) && !app.deadline).length;
  const stale = apps.filter((app) => ['wishlist', 'preparing', 'submitted', 'screening'].includes(app.status) && app.updatedAt < cutoffIso).length;
  if (dueSoon > 0) actions.push(`先處理 ${dueSoon} 個 7 天內截止的職缺`);
  if (noDeadline > 0) actions.push(`替 ${noDeadline} 張職缺補上截止日，避免錯過投遞`);
  if (stale > 0) actions.push(`更新 ${stale} 張超過一週沒動的職缺狀態`);
  if (apps.length === 0) actions.push('收藏第一個想投的職缺');
  if (actions.length === 0) actions.push('從實習雷達再挑 3 個符合目標的職缺');
  return { added, submitted, interviews, offers, responseRate, dueSoon, actions: actions.slice(0, 3) };
}

export function getReviewWeekLabel(): string {
  return `截至 ${getTodayStr()}`;
}
