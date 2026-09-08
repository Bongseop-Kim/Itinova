// S05 날짜 범위 선택. 날짜는 'YYYY-MM-DD' 문자열이고 로컬 달력으로만 다룬다 (design.md §4).

export type Cell = { date: string; day: number } | null;
export type Month = { year: number; month: number; label: string; weeks: Cell[][] };

const pad = (n: number) => String(n).padStart(2, '0');
export const toISO = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;

export function todayISO(now = new Date()): string {
  return toISO(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

/** 한 달치 7열 그리드. 앞뒤 빈칸은 null. */
export function monthGrid(year: number, month: number): Month {
  const first = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const weeks: Cell[][] = [];
  let week: Cell[] = Array(first.getDay()).fill(null);

  for (let d = 1; d <= daysInMonth; d++) {
    week.push({ date: toISO(year, month, d), day: d });
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) weeks.push([...week, ...Array(7 - week.length).fill(null)]);

  return { year, month, label: `${year}년 ${month}월`, weeks };
}

/** from 달부터 count 개월. S05 는 세로로 스크롤하며 두 달씩 보인다. */
export function months(count: number, from = new Date()): Month[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(from.getFullYear(), from.getMonth() + i, 1);
    return monthGrid(d.getFullYear(), d.getMonth() + 1);
  });
}

const parse = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const dayDiff = (a: string, b: string) =>
  Math.round((parse(b).getTime() - parse(a).getTime()) / 86_400_000);

/** 시작~종료 사이의 모든 날짜. trip_days 생성에 그대로 쓴다. */
export function datesBetween(start: string, end: string): string[] {
  const out: string[] = [];
  const d = parse(start);
  const last = parse(end);
  while (d <= last) {
    out.push(toISO(d.getFullYear(), d.getMonth() + 1, d.getDate()));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

/** 하단 CTA 요약. 같은 날이면 당일치기. */
export function tripLength(start: string, end: string): string {
  const nights = dayDiff(start, end);
  return nights === 0 ? '당일치기' : `${nights}박 ${nights + 1}일`;
}

/**
 * 범위 선택 상태 전이. 시작만 있으면 그 뒤 날짜가 종료가 되고,
 * 시작보다 앞을 누르면 그 날이 새 시작이 된다. 범위가 완성된 상태에서 누르면 다시 시작부터.
 */
export function pickDate(
  range: { start?: string; end?: string },
  date: string,
): { start?: string; end?: string } {
  if (!range.start || range.end) return { start: date };
  if (dayDiff(range.start, date) < 0) return { start: date };
  return { start: range.start, end: date };
}

export type CellState = 'none' | 'start' | 'end' | 'middle' | 'single';

export function cellState(range: { start?: string; end?: string }, date: string): CellState {
  if (!range.start) return 'none';
  if (date === range.start && date === range.end) return 'single';
  if (date === range.start) return range.end ? 'start' : 'single';
  if (date === range.end) return 'end';
  if (range.end && dayDiff(range.start, date) > 0 && dayDiff(date, range.end) > 0) return 'middle';
  return 'none';
}
