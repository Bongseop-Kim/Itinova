// S17 가계부 · S18 비용 입력. 단일 주체 모델이라 분담 개념이 없다 (design.md §1.3-1).

export const EXPENSE_CATEGORIES = ['교통', '식비', '카페', '숙박', '관광', '쇼핑', '기타'] as const;
export const PAYMENT_METHODS = ['카드', '현금'] as const;

export type Expense = {
  id: string;
  title: string;
  category: string;
  currency: string;
  amount: number;
  dayIndex: number | null; // 일차가 삭제되면 null — '미지정' 그룹 (§4.1)
};

/** 통화별 합계. 해외 여행은 현지 통화와 원화가 섞인다. */
export function sumByCurrency(rows: readonly Expense[]): { currency: string; amount: number }[] {
  const map = new Map<string, number>();
  for (const r of rows) map.set(r.currency, (map.get(r.currency) ?? 0) + r.amount);
  return [...map.entries()]
    .map(([currency, amount]) => ({ currency, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export type Group = { key: string; label: string; rows: Expense[] };

/** 일차별. 일차 없는 항목은 맨 뒤 '미지정' 으로 모은다. */
export function groupByDay(rows: readonly Expense[]): Group[] {
  const byDay = new Map<number, Expense[]>();
  const unassigned: Expense[] = [];
  for (const r of rows) {
    if (r.dayIndex == null) unassigned.push(r);
    else byDay.set(r.dayIndex, [...(byDay.get(r.dayIndex) ?? []), r]);
  }
  const groups: Group[] = [...byDay.entries()]
    .sort(([a], [b]) => a - b)
    .map(([dayIndex, list]) => ({ key: `day-${dayIndex}`, label: `day ${dayIndex}`, rows: list }));
  if (unassigned.length) groups.push({ key: 'unassigned', label: '미지정', rows: unassigned });
  return groups;
}

/** 카테고리별. EXPENSE_CATEGORIES 순서를 따르고, 목록에 없는 값은 뒤로 보낸다. */
export function groupByCategory(rows: readonly Expense[]): Group[] {
  const map = new Map<string, Expense[]>();
  for (const r of rows) map.set(r.category, [...(map.get(r.category) ?? []), r]);
  const order = (c: string) => {
    const i = (EXPENSE_CATEGORIES as readonly string[]).indexOf(c);
    return i === -1 ? EXPENSE_CATEGORIES.length : i;
  };
  return [...map.entries()]
    .sort(([a], [b]) => order(a) - order(b) || a.localeCompare(b))
    .map(([category, list]) => ({ key: category, label: category, rows: list }));
}

const NO_DECIMAL = new Set(['KRW', 'JPY', 'VND']);

/** 통화별 소수 자리. 원·엔·동은 소수점을 쓰지 않는다. */
export function formatAmount(amount: number, currency: string): string {
  const digits = NO_DECIMAL.has(currency) ? 0 : 2;
  return amount.toLocaleString('ko-KR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}
