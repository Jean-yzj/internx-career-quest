'use client';

import { useState } from 'react';
import type { Application } from '@/lib/types';
import { formatAbsoluteDate } from '@/lib/types';
import { buildCalendarGrid, formatMonthYear, WEEKDAY_LABELS } from '@/lib/dates';
import { IconChevronLeft, IconChevronRight } from './Icons';

interface CalendarViewProps {
  applications: Application[];
  onOpenCard: (id: string) => void;
}

interface DotEvent {
  appId: string;
  company: string;
  title: string;
  kind: 'deadline' | 'interview' | 'offer';
}

function buildEventMap(apps: Application[]): Map<string, DotEvent[]> {
  const map = new Map<string, DotEvent[]>();

  function add(date: string, ev: DotEvent) {
    const existing = map.get(date) ?? [];
    existing.push(ev);
    map.set(date, existing);
  }

  for (const app of apps) {
    if (app.deadline) {
      add(app.deadline, { appId: app.id, company: app.company, title: app.title, kind: 'deadline' });
    }
    for (const iv of app.interviews) {
      add(iv.date, { appId: app.id, company: app.company, title: app.title, kind: 'interview' });
    }
    if (app.offerDeadline) {
      add(app.offerDeadline, { appId: app.id, company: app.company, title: app.title, kind: 'offer' });
    }
  }

  return map;
}

const DOT_COLORS: Record<DotEvent['kind'], string> = {
  deadline: 'var(--danger)',
  interview: 'var(--brand)',
  offer: 'var(--amber)',
};

const KIND_LABELS: Record<DotEvent['kind'], string> = {
  deadline: '投遞截止',
  interview: '面試',
  offer: 'Offer 期限',
};

export default function CalendarView({ applications, onOpenCard }: CalendarViewProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const eventMap = buildEventMap(applications);
  const weeks = buildCalendarGrid(year, month);

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  }

  function goToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
    setSelectedDate(null);
  }

  function handleDayClick(dateStr: string) {
    const events = eventMap.get(dateStr);
    if (events && events.length > 0) {
      setSelectedDate(dateStr === selectedDate ? null : dateStr);
    }
  }

  const selectedEvents = selectedDate ? (eventMap.get(selectedDate) ?? []) : [];

  return (
    <div className="calendar-view">
      <div className="calendar-nav">
        <button type="button" className="btn-icon" onClick={prevMonth} aria-label="上一月">
          <IconChevronLeft />
        </button>
        <span className="calendar-month-label">{formatMonthYear(year, month)}</span>
        <button type="button" className="btn-icon" onClick={nextMonth} aria-label="下一月">
          <IconChevronRight />
        </button>
        <button type="button" className="btn-small calendar-today-btn" onClick={goToday}>
          今天
        </button>
      </div>

      <div className="calendar-grid" role="grid" aria-label={`${year} 年 ${month} 月行事曆`}>
        <div className="calendar-weekdays" role="row">
          {WEEKDAY_LABELS.map((d) => (
            <div key={d} className="calendar-weekday" role="columnheader">{d}</div>
          ))}
        </div>

        {weeks.map((week, wi) => (
          <div key={wi} className="calendar-week" role="row">
            {week.map((cell, ci) => {
              if (!cell) {
                return <div key={ci} className="calendar-cell calendar-cell-empty" role="gridcell" />;
              }
              const events = eventMap.get(cell.dateStr) ?? [];
              const isSelected = selectedDate === cell.dateStr;
              const MAX_DOTS = 3;
              const extraCount = events.length > MAX_DOTS ? events.length - MAX_DOTS : 0;
              const visibleEvents = events.slice(0, MAX_DOTS);

              // Deduplicate dot kinds for display
              const dotKinds = Array.from(new Set(visibleEvents.map(e => e.kind)));

              return (
                <div
                  key={ci}
                  className={`calendar-cell ${cell.isToday ? 'calendar-cell-today' : ''} ${isSelected ? 'calendar-cell-selected' : ''} ${events.length > 0 ? 'calendar-cell-has-events' : ''}`}
                  role="gridcell"
                  aria-label={`${cell.dateStr}${events.length > 0 ? ` ${events.length} 個事件` : ''}`}
                  onClick={() => handleDayClick(cell.dateStr)}
                  tabIndex={events.length > 0 ? 0 : -1}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleDayClick(cell.dateStr); }}
                >
                  <span className="calendar-day-num">{cell.day}</span>
                  {dotKinds.length > 0 && (
                    <div className="calendar-dots">
                      {dotKinds.map((kind) => (
                        <span
                          key={kind}
                          className="calendar-dot"
                          style={{ background: DOT_COLORS[kind] }}
                          title={KIND_LABELS[kind]}
                        />
                      ))}
                      {extraCount > 0 && (
                        <span className="calendar-dot-extra">+{extraCount}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {selectedDate && selectedEvents.length > 0 && (
        <div className="calendar-event-list" aria-live="polite">
          <p className="calendar-event-date-label">{formatAbsoluteDate(selectedDate)} 事件</p>
          {selectedEvents.map((ev, i) => (
            <button
              key={i}
              type="button"
              className="calendar-event-item"
              onClick={() => onOpenCard(ev.appId)}
            >
              <span className="calendar-event-dot" style={{ background: DOT_COLORS[ev.kind] }} />
              <span className="calendar-event-company">{ev.company}</span>
              <span className="calendar-event-title">{ev.title}</span>
              <span className="calendar-event-kind">{KIND_LABELS[ev.kind]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
