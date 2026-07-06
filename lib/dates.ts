export function formatMonthYear(year: number, month: number): string {
  return `${year} 年 ${month} 月`;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// Returns 0=Sun..6=Sat for the first day of the month
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

// Generate calendar grid: weeks array, each week is 7 cells (null = empty)
export interface CalendarCell {
  day: number;
  dateStr: string;
  isToday: boolean;
  isOtherMonth: boolean;
}

export function buildCalendarGrid(year: number, month: number): (CalendarCell | null)[][] {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Convert Sunday=0 to Monday=0 offset
  const startOffset = (firstDay + 6) % 7;

  const cells: (CalendarCell | null)[] = [];

  // Padding before
  for (let i = 0; i < startOffset; i++) {
    cells.push(null);
  }

  // Days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({
      day: d,
      dateStr,
      isToday: dateStr === todayStr,
      isOtherMonth: false,
    });
  }

  // Pad to complete last week
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const weeks: (CalendarCell | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return weeks;
}

export const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];
