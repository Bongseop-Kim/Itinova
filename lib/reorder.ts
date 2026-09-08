// S14 일정 편집의 재정렬 로직.
import { haversineKm, type LatLng } from './geo.ts';

/** from 위치의 항목을 to 위치로 옮긴 새 배열. 범위를 벗어나면 원본 그대로. */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) {
    return [...list];
  }
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

type Positioned = { coord: LatLng | null };

/**
 * 첫 장소를 고정하고 그다음부터 가장 가까운 곳을 차례로 고른다.
 * 좌표가 없는 항목은 원래 순서대로 맨 뒤에 붙인다.
 *
 * ponytail: 최근접 이웃 휴리스틱이다. 최적 경로가 아니다 —
 * 하루 장소가 5~6개 규모라 충분하고, 2-opt 는 실제로 어색해지면 얹는다.
 */
export function sortByDistance<T extends Positioned>(items: readonly T[]): T[] {
  const located = items.filter((i) => i.coord);
  const unlocated = items.filter((i) => !i.coord);
  if (located.length < 3) return [...items];

  const remaining = located.slice(1);
  const out: T[] = [located[0]];

  while (remaining.length) {
    const from = out[out.length - 1].coord!;
    let best = 0;
    let bestKm = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const km = haversineKm(from, remaining[i].coord!);
      if (km < bestKm) {
        bestKm = km;
        best = i;
      }
    }
    out.push(remaining.splice(best, 1)[0]);
  }

  return [...out, ...unlocated];
}

/** 재정렬 결과를 sort_order 값으로 바꾼다. 정수 간격은 §4 규약과 같다. */
export const sortOrders = (count: number) =>
  Array.from({ length: count }, (_, i) => (i + 1) * 1000);
