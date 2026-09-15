// 여행 날짜는 'YYYY-MM-DD' 문자열이고 "현지 달력상의 날"이다 (docs/design.md §4).
// 타임존 변환 대상이 아니므로 UTC 파싱을 쓰지 않고 로컬 달력으로만 다룬다.

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export type DateFormat = 'ymd' | 'md';
export const DEFAULT_DATE_FORMAT: DateFormat = 'ymd';

const parse = (date: string) => {
  const [y, m, d] = date.split('-').map(Number);
  return { y, m, d, js: new Date(y, m - 1, d) };
};

/** '2026-09-09' → '2026.9.9' 또는 '9/9'. */
export function dateLabel(date: string, format: DateFormat = DEFAULT_DATE_FORMAT): string {
  const { y, m, d } = parse(date);
  return format === 'md' ? `${m}/${d}` : `${y}.${m}.${d}`;
}

export function dateRangeLabel(start: string, end: string, format: DateFormat = DEFAULT_DATE_FORMAT): string {
  return `${dateLabel(start, format)} ~ ${dateLabel(end, format)}`;
}

/** S10 일차 헤더. */
export function dayMeta(date: string, format: DateFormat = DEFAULT_DATE_FORMAT): string {
  const { js } = parse(date);
  return `${dateLabel(date, format)}/${WEEKDAYS[js.getDay()]}`;
}

/** 오늘로부터 며칠 남았는지. 음수면 지난 여행. */
export function daysUntil(date: string): number {
  const { js } = parse(date);
  const today = new Date();
  const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((js.getTime() - midnight.getTime()) / 86_400_000);
}

export type Bucket = 'ongoing' | 'upcoming' | 'past';

/** 오늘이 여행 기간 안이면 진행중, 아직이면 다가오는, 지났으면 지난 여행. */
export function tripBucket(start: string, end: string, today: string): Bucket {
  if (today < start) return 'upcoming';
  if (today > end) return 'past';
  return 'ongoing';
}

/** D-5 · D-day · D+3 */
export function ddayLabel(start: string, today: string): string {
  const diff = Math.round((parse(start).js.getTime() - parse(today).js.getTime()) / 86_400_000);
  if (diff === 0) return 'D-day';
  return diff > 0 ? `D-${diff}` : `D+${-diff}`;
}
