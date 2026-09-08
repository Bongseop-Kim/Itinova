import { and, desc, eq } from 'drizzle-orm';

import type { Category } from '../lib/category';

import { db, newId } from './index';
import { dayItems, places, savedPlaces, tripDays } from './schema';

/** 사용자가 직접 만든 "나만의 장소". Places 를 거치지 않으므로 google_place_id 가 없다. */
export function createCustomPlace(input: { name: string; category: Category; region?: string }): string {
  const id = newId();
  db.insert(places)
    .values({
      id,
      name: input.name.trim(),
      category: input.category,
      region: input.region?.trim() || null,
      isCustom: true,
    })
    .run();
  return id;
}

/**
 * 선택한 장소들을 특정 일차 뒤에 붙인다.
 * sort_order 는 기존 최대값 뒤로 1000 간격 — 나중에 사이에 끼울 여지를 남긴다.
 */
export function addPlacesToDay(tripId: string, dayIndex: number, placeIds: string[]): void {
  if (!placeIds.length) return;

  const day = db
    .select({ id: tripDays.id })
    .from(tripDays)
    .where(and(eq(tripDays.tripId, tripId), eq(tripDays.dayIndex, dayIndex)))
    .all()[0];
  if (!day) return;

  const last = db
    .select({ sortOrder: dayItems.sortOrder })
    .from(dayItems)
    .where(eq(dayItems.tripDayId, day.id))
    .orderBy(desc(dayItems.sortOrder))
    .all()[0];

  let order = last?.sortOrder ?? 0;
  db.transaction((tx) => {
    for (const placeId of placeIds) {
      tx.insert(dayItems)
        .values({ id: newId(), tripDayId: day.id, placeId, sortOrder: (order += 1000) })
        .run();
    }
  });
}

/** 저장함에 담는다. 이미 있으면 건너뛴다 ((trip_id, place_id) unique 이므로 넣으면 터진다). */
export function savePlaces(tripId: string, placeIds: string[]): void {
  if (!placeIds.length) return;

  const existing = new Set(
    db
      .select({ placeId: savedPlaces.placeId })
      .from(savedPlaces)
      .where(eq(savedPlaces.tripId, tripId))
      .all()
      .map((r) => r.placeId),
  );
  const fresh = placeIds.filter((id) => !existing.has(id));
  if (!fresh.length) return;

  const now = new Date().toISOString();
  db.transaction((tx) => {
    for (const placeId of fresh) {
      tx.insert(savedPlaces).values({ id: newId(), tripId, placeId, createdAt: now }).run();
    }
  });
}

export function unsavePlace(tripId: string, placeId: string): void {
  db.delete(savedPlaces)
    .where(and(eq(savedPlaces.tripId, tripId), eq(savedPlaces.placeId, placeId)))
    .run();
}

/** 여행별 보관함 목록 (S11 · S15 '최근 저장' 탭이 함께 쓴다). */
export const savedPlacesQuery = (tripId: string) =>
  db
    .select({
      placeId: places.id,
      name: places.name,
      category: places.category,
      region: places.region,
    })
    .from(savedPlaces)
    .innerJoin(places, eq(places.id, savedPlaces.placeId))
    .where(eq(savedPlaces.tripId, tripId))
    .orderBy(desc(savedPlaces.createdAt));
