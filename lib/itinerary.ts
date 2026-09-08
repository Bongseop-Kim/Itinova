// S10 의 유일한 비자명 로직: leftJoin 결과를 일차별로 묶는다.
// 장소가 없는 일차도 행 하나로 돌아오므로(itemId = null) 그 행은 섹션만 만들고 항목은 만들지 않는다.
import type { LatLng } from './geo';

export type JoinedRow = {
  dayId: string;
  dayIndex: number;
  date: string;
  itemId: string | null;
  startTime: string | null;
  visited: boolean | null;
  name: string | null;
  category: string | null;
  region: string | null;
  lat: number | null;
  lng: number | null;
};

export type Item = {
  id: string;
  name: string;
  category: string | null;
  region: string | null;
  startTime: string | null;
  visited: boolean;
  coord: LatLng | null;
};

export type DaySection = { dayId: string; dayIndex: number; date: string; data: Item[] };

export function groupByDay(rows: readonly JoinedRow[]): DaySection[] {
  const byDay = new Map<string, DaySection>();
  for (const r of rows) {
    let section = byDay.get(r.dayId);
    if (!section) {
      section = { dayId: r.dayId, dayIndex: r.dayIndex, date: r.date, data: [] };
      byDay.set(r.dayId, section);
    }
    if (!r.itemId || !r.name) continue;
    section.data.push({
      id: r.itemId,
      name: r.name,
      category: r.category,
      region: r.region,
      startTime: r.startTime,
      visited: r.visited ?? false,
      coord: r.lat != null && r.lng != null ? { lat: r.lat, lng: r.lng } : null,
    });
  }
  return [...byDay.values()];
}
