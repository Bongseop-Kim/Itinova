import { and, eq, inArray } from 'drizzle-orm';

import { planDateChange, type CurrentDay } from '../lib/tripDates';

import { db, newId } from './index';
import { dayItems, savedPlaces, tripDays, trips } from './schema';

export const tripQuery = (tripId: string) =>
  db.select().from(trips).where(eq(trips.id, tripId));

export function updateTripBasics(
  tripId: string,
  patch: { title?: string; companion?: string | null; styles?: string[] | null; currency?: string },
): void {
  db.update(trips).set(patch).where(eq(trips.id, tripId)).run();
}

/** 사라질 일차에 담긴 장소 수. 확인 문구에 쓴다. */
export function countItemsInDays(dayIds: string[]): number {
  if (!dayIds.length) return 0;
  return db.select({ id: dayItems.id }).from(dayItems).where(inArray(dayItems.tripDayId, dayIds)).all()
    .length;
}

export function currentDays(tripId: string): (CurrentDay & { id: string })[] {
  return db
    .select({ id: tripDays.id, dayIndex: tripDays.dayIndex, date: tripDays.date })
    .from(tripDays)
    .where(eq(tripDays.tripId, tripId))
    .orderBy(tripDays.dayIndex)
    .all();
}

/**
 * §4.1 — 날짜를 바꾸고 일차를 맞춘다.
 * 기간이 줄면 사라지는 일차의 장소를 saved_places 로 옮긴 뒤 일차를 지운다
 * (일차 삭제 시 day_items 는 cascade, expenses.trip_day_id 는 SET NULL 로 '미지정' 이 된다).
 */
export function changeTripDates(tripId: string, startDate: string, endDate: string): void {
  const days = currentDays(tripId);
  const plan = planDateChange(days, startDate, endDate);
  const removedIds = plan.removed.map((r) => days.find((d) => d.dayIndex === r.dayIndex)!.id);

  // 옮길 장소 — 이미 저장함에 있으면 건너뛴다 ((trip_id, place_id) unique)
  const doomed = removedIds.length
    ? db
        .select({ placeId: dayItems.placeId })
        .from(dayItems)
        .where(inArray(dayItems.tripDayId, removedIds))
        .all()
        .map((r) => r.placeId)
    : [];
  const already = new Set(
    db
      .select({ placeId: savedPlaces.placeId })
      .from(savedPlaces)
      .where(eq(savedPlaces.tripId, tripId))
      .all()
      .map((r) => r.placeId),
  );
  const toSave = [...new Set(doomed)].filter((id) => !already.has(id));

  const now = new Date().toISOString();
  db.transaction((tx) => {
    tx.update(trips).set({ startDate, endDate }).where(eq(trips.id, tripId)).run();

    for (const { dayIndex, date } of plan.shifted) {
      tx.update(tripDays)
        .set({ date })
        .where(and(eq(tripDays.tripId, tripId), eq(tripDays.dayIndex, dayIndex)))
        .run();
    }

    for (const { dayIndex, date } of plan.added) {
      tx.insert(tripDays).values({ id: newId(), tripId, dayIndex, date }).run();
    }

    for (const placeId of toSave) {
      tx.insert(savedPlaces).values({ id: newId(), tripId, placeId, createdAt: now }).run();
    }

    if (removedIds.length) {
      tx.delete(tripDays).where(inArray(tripDays.id, removedIds)).run();
    }
  });
}

export function deleteTrip(tripId: string): void {
  // trips 삭제로 trip_days · day_items · saved_places · checklist_items · chat_messages 가 cascade 된다
  db.delete(trips).where(eq(trips.id, tripId)).run();
}
