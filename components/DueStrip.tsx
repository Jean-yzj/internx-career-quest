'use client';

import type { Application } from '@/lib/types';
import { getTodayStr, parseLocalDate, formatAbsoluteDate, daysUntil } from '@/lib/types';

interface DueStripProps {
  applications: Application[];
  onOpenCard: (id: string) => void;
}

interface DueItem {
  app: Application;
  date: string;
  label: string;
}

export default function DueStrip({ applications, onOpenCard }: DueStripProps) {
  const today = getTodayStr();
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
  const sevenDaysStr = `${sevenDaysLater.getFullYear()}-${String(sevenDaysLater.getMonth() + 1).padStart(2, '0')}-${String(sevenDaysLater.getDate()).padStart(2, '0')}`;

  const items: DueItem[] = [];

  for (const app of applications) {
    if (app.status === 'rejected' || app.status === 'withdrawn') continue;

    if (app.deadline && app.deadline >= today && app.deadline <= sevenDaysStr) {
      items.push({ app, date: app.deadline, label: '投遞截止' });
    }

    for (const iv of app.interviews) {
      if (iv.date >= today && iv.date <= sevenDaysStr) {
        items.push({ app, date: iv.date, label: `第 ${iv.round} 輪面試` });
      }
    }

    if (app.offerDeadline && app.offerDeadline >= today && app.offerDeadline <= sevenDaysStr) {
      items.push({ app, date: app.offerDeadline, label: 'Offer 回覆截止' });
    }
  }

  items.sort((a, b) => a.date.localeCompare(b.date));

  if (items.length === 0) return null;

  return (
    <div className="due-strip" role="region" aria-label="7 天內到期事項">
      <span className="due-strip-label">7 天內到期</span>
      <div className="due-strip-items">
        {items.map((item, i) => {
          const days = daysUntil(item.date);
          const isToday = days === 0;
          return (
            <button
              key={`${item.app.id}-${item.date}-${i}`}
              type="button"
              className={`due-chip ${isToday ? 'due-chip-today' : ''}`}
              onClick={() => onOpenCard(item.app.id)}
              title={`${item.app.company} ${item.app.title}`}
            >
              <span className="due-chip-date">{formatAbsoluteDate(item.date)}</span>
              <span className="due-chip-company">{item.app.company}</span>
              <span className="due-chip-kind">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
