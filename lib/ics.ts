import type { Application } from './types';

function icsEscape(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function dateToIcsDate(dateStr: string): string {
  return dateStr.replace(/-/g, '');
}

function dateTimeToIcs(dateStr: string, time?: string): string {
  const d = dateStr.replace(/-/g, '');
  if (!time) return `${d}T090000`;
  const t = time.replace(/:/g, '').padEnd(6, '0');
  return `${d}T${t}`;
}

function makeVEVENT(
  uid: string,
  summary: string,
  dtstart: string,
  isAllDay: boolean,
  description?: string
): string {
  const lines: string[] = [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `SUMMARY:${icsEscape(summary)}`,
  ];

  if (isAllDay) {
    lines.push(`DTSTART;VALUE=DATE:${dtstart}`);
    lines.push(`DTEND;VALUE=DATE:${dtstart}`);
  } else {
    lines.push(`DTSTART:${dtstart}`);
    lines.push(`DTEND:${dtstart}`); // Same start/end for simplicity
  }

  if (description) {
    lines.push(`DESCRIPTION:${icsEscape(description)}`);
  }

  lines.push('BEGIN:VALARM');
  lines.push('TRIGGER:-P1D');
  lines.push('ACTION:DISPLAY');
  lines.push('DESCRIPTION:提醒');
  lines.push('END:VALARM');
  lines.push('END:VEVENT');

  return lines.join('\r\n');
}

export function generateIcs(apps: Application[]): string {
  const events: string[] = [];

  for (const app of apps) {
    const label = `${app.company} ${app.title}`;

    if (app.deadline) {
      events.push(
        makeVEVENT(
          `warroom-${app.id}-deadline-0`,
          `投遞截止｜${label}`,
          dateToIcsDate(app.deadline),
          true,
          `狀態：${app.status}`
        )
      );
    }

    for (let i = 0; i < app.interviews.length; i++) {
      const iv = app.interviews[i];
      const dtstart = dateTimeToIcs(iv.date, iv.time);
      events.push(
        makeVEVENT(
          `warroom-${app.id}-interview-${i}`,
          `第 ${iv.round} 輪面試｜${label}`,
          dtstart,
          !iv.time,
          iv.note
        )
      );
    }

    if (app.offerDeadline) {
      events.push(
        makeVEVENT(
          `warroom-${app.id}-offer-0`,
          `Offer 回覆截止｜${label}`,
          dateToIcsDate(app.offerDeadline),
          true
        )
      );
    }
  }

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//InternX War Room//ZH',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events,
    'END:VCALENDAR',
  ];

  return lines.join('\r\n');
}

export function downloadIcs(content: string, filename = 'internx-war-room.ics'): void {
  if (typeof window === 'undefined') return;

  const canBlob =
    typeof Blob !== 'undefined' &&
    typeof URL !== 'undefined' &&
    typeof URL.createObjectURL === 'function';

  if (canBlob) {
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  } else {
    const encoded = encodeURIComponent(content);
    window.open(`data:text/calendar;charset=utf-8,${encoded}`);
  }
}

export function generateWeeklyReviewIcs(): string {
  const next = new Date();
  const daysUntilSunday = (7 - next.getDay()) % 7 || 7;
  next.setDate(next.getDate() + daysUntilSunday);
  const date = `${next.getFullYear()}${String(next.getMonth() + 1).padStart(2, '0')}${String(next.getDate()).padStart(2, '0')}`;
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//InternX Weekly Review//ZH', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT', 'UID:internx-weekly-review', 'SUMMARY:職涯闖關島｜每週投遞回顧',
    `DTSTART:${date}T190000`, `DTEND:${date}T193000`, 'RRULE:FREQ=WEEKLY;BYDAY=SU',
    'DESCRIPTION:回顧本週投遞、更新狀態，選出下週最重要的一步。https://quest.lazybearlife.com/war-room',
    'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', 'DESCRIPTION:今晚花 10 分鐘回顧本週投遞',
    'END:VALARM', 'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
}
