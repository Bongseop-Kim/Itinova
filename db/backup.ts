import { eq, inArray } from 'drizzle-orm';

import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  planImport,
  type Existing,
  type TripPayload,
} from '../lib/backup';

import { db, newId } from './index';
import { checklistItems, dayItems, expenses, places, savedPlaces, tripDays, trips } from './schema';

function collectTrip(tripId: string): TripPayload | null {
  const trip = db.select().from(trips).where(eq(trips.id, tripId)).all()[0];
  if (!trip) return null;

  const days = db.select().from(tripDays).where(eq(tripDays.tripId, tripId)).all();
  const dayIds = days.map((d) => d.id);
  const items = dayIds.length
    ? db.select().from(dayItems).where(inArray(dayItems.tripDayId, dayIds)).all()
    : [];
  const saved = db.select().from(savedPlaces).where(eq(savedPlaces.tripId, tripId)).all();

  // 일정과 저장함이 참조하는 장소만 담는다 — 전역 캐시를 통째로 내보내지 않는다
  const placeIds = [...new Set([...items.map((i) => i.placeId), ...saved.map((sp) => sp.placeId)])];

  return {
    trip: trip as never,
    tripDays: days as never,
    dayItems: items as never,
    places: (placeIds.length
      ? db.select().from(places).where(inArray(places.id, placeIds)).all()
      : []) as never,
    savedPlaces: saved as never,
    expenses: db.select().from(expenses).where(eq(expenses.tripId, tripId)).all() as never,
    checklistItems: db
      .select()
      .from(checklistItems)
      .where(eq(checklistItems.tripId, tripId))
      .all() as never,
    // chat_messages 는 내보내지 않는다 — 대화는 여행 데이터가 아니다
  };
}

const envelope = (payloads: TripPayload[]) =>
  JSON.stringify(
    { format: BACKUP_FORMAT, version: BACKUP_VERSION, exportedAt: new Date().toISOString(), trips: payloads },
    null,
    2,
  );

/** 여행 1건 (S21). */
export function exportTripJson(tripId: string): string | null {
  const payload = collectTrip(tripId);
  return payload ? envelope([payload]) : null;
}

/** 전체 (S02). */
export function exportAllJson(): string {
  const ids = db.select({ id: trips.id }).from(trips).all().map((r) => r.id);
  return envelope(ids.map(collectTrip).filter((p): p is TripPayload => !!p));
}

function readExisting(): Existing {
  const cached = db
    .select({ id: places.id, googlePlaceId: places.googlePlaceId })
    .from(places)
    .all();
  return {
    tripIds: new Set(db.select({ id: trips.id }).from(trips).all().map((r) => r.id)),
    placeByGoogleId: new Map(
      cached.filter((p) => p.googlePlaceId).map((p) => [p.googlePlaceId!, p.id]),
    ),
  };
}

/** 백업 하나를 적재한다. 여행별로 트랜잭션을 나눠 하나가 실패해도 나머지는 남는다. */
export function importTrips(payloads: TripPayload[]): { imported: number; remapped: number } {
  let imported = 0;
  let remapped = 0;

  for (const payload of payloads) {
    // 여행마다 다시 읽는다 — 앞 여행이 넣은 장소를 뒤 여행이 재사용해야 한다
    const plan = planImport(payload, readExisting(), newId);
    db.transaction((tx) => {
      for (const place of plan.places) tx.insert(places).values(place as never).run();
      tx.insert(trips).values(plan.trip as never).run();
      for (const row of plan.tripDays) tx.insert(tripDays).values(row as never).run();
      for (const row of plan.dayItems) tx.insert(dayItems).values(row as never).run();
      for (const row of plan.savedPlaces) tx.insert(savedPlaces).values(row as never).run();
      for (const row of plan.expenses) tx.insert(expenses).values(row as never).run();
      for (const row of plan.checklistItems) tx.insert(checklistItems).values(row as never).run();
    });
    imported += 1;
    if (plan.remapped) remapped += 1;
  }

  return { imported, remapped };
}
