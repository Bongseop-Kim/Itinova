// §4.1 여행 날짜 변경 규칙. 세 경우(이동 · 증가 · 감소)를 한 계산으로 처리한다.
import { datesBetween } from './calendar.ts';

export type CurrentDay = { dayIndex: number; date: string };

export type DateChangePlan = {
  /** 날짜만 바뀌는 일차. day_index 는 유지된다. */
  shifted: { dayIndex: number; date: string }[];
  /** 뒤에 새로 붙는 일차. */
  added: { dayIndex: number; date: string }[];
  /** 사라지는 일차. 여기 담긴 장소는 저장함으로 옮긴 뒤 삭제한다. */
  removed: CurrentDay[];
};

/**
 * 새 날짜 범위에 맞춰 일차를 어떻게 바꿀지 계산한다.
 * 앞에서부터 짝지으므로 기간이 같으면 전부 shifted, 늘면 added, 줄면 removed 가 생긴다.
 */
export function planDateChange(
  current: readonly CurrentDay[],
  startDate: string,
  endDate: string,
): DateChangePlan {
  const dates = datesBetween(startDate, endDate);
  const sorted = [...current].sort((a, b) => a.dayIndex - b.dayIndex);

  const shifted: DateChangePlan['shifted'] = [];
  const added: DateChangePlan['added'] = [];

  dates.forEach((date, i) => {
    const existing = sorted[i];
    if (existing) {
      // 날짜가 그대로면 갱신할 필요가 없다
      if (existing.date !== date) shifted.push({ dayIndex: existing.dayIndex, date });
    } else {
      added.push({ dayIndex: i + 1, date });
    }
  });

  return { shifted, added, removed: sorted.slice(dates.length) };
}

/** 저장 전 확인 문구. 사라지는 일차가 없으면 확인이 필요 없다. */
export function dateChangeWarning(
  removed: readonly CurrentDay[],
  itemCount: number,
): string | null {
  if (!removed.length) return null;
  const days = removed.map((d) => `day ${d.dayIndex}`).join(', ');
  if (!itemCount) return `${days} 가 사라집니다.`;
  return `${days} 의 장소 ${itemCount}개가 저장함으로 이동합니다.`;
}
