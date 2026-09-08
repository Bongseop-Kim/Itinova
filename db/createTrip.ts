import { datesBetween } from '../lib/calendar';

import { db, newId } from './index';
import { checklistItems, tripDays, trips } from './schema';
import { CHECKLIST_TEMPLATE } from './templates';

export type NewTrip = {
  cityName: string;
  countryCode: string;
  currency: string;
  lat: number;
  lng: number;
  startDate: string;
  endDate: string;
  companion?: string;
  styles?: string[];
  origin: 'manual' | 'ai';
};

/**
 * 여행 1건과 그 골격(일차 · 체크리스트)을 한 트랜잭션으로 만든다.
 * expo-sqlite 는 sync 드라이버라 콜백은 async 일 수 없고 각 문장을 .run() 으로 실행한다.
 */
export function createTrip(input: NewTrip): string {
  const tripId = newId();
  const dates = datesBetween(input.startDate, input.endDate);

  db.transaction((tx) => {
    tx.insert(trips)
      .values({
        id: tripId,
        title: `${input.cityName} 여행`, // design.md §4 — 기본값 {도시} 여행
        cityName: input.cityName,
        countryCode: input.countryCode,
        lat: input.lat,
        lng: input.lng,
        startDate: input.startDate,
        endDate: input.endDate,
        companion: input.companion,
        styles: input.styles,
        currency: input.currency,
        origin: input.origin,
        createdAt: new Date().toISOString(),
      })
      .run();

    dates.forEach((date, i) => {
      tx.insert(tripDays)
        .values({ id: newId(), tripId, dayIndex: i + 1, date })
        .run();
    });

    let order = 0;
    for (const [category, labels] of CHECKLIST_TEMPLATE) {
      for (const label of labels) {
        tx.insert(checklistItems)
          .values({ id: newId(), tripId, category, label, sortOrder: (order += 1000) })
          .run();
      }
    }
  });

  return tripId;
}
