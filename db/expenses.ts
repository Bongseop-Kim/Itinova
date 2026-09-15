import { and, desc, eq, exists, or } from 'drizzle-orm';

import { db, newId } from './index';
import { dayItems, expenses, places, savedPlaces, tripDays } from './schema';

export const expensePlaceQuery = (tripId: string, placeId: string | undefined) =>
  db.select({ id: places.id, name: places.name }).from(places).where(and(
    eq(places.id, placeId ?? ''),
    or(
      exists(db.select().from(savedPlaces).where(and(eq(savedPlaces.tripId, tripId), eq(savedPlaces.placeId, places.id)))),
      exists(db.select().from(dayItems).innerJoin(tripDays, eq(dayItems.tripDayId, tripDays.id))
        .where(and(eq(tripDays.tripId, tripId), eq(dayItems.placeId, places.id)))),
    ),
  ));

/** dayIndex 는 trip_days 를 통해 얻는다. 일차가 삭제되면 trip_day_id 가 null 이 되어 '미지정' 이 된다. */
export const expensesQuery = (tripId: string) =>
  db
    .select({
      id: expenses.id,
      title: expenses.title,
      category: expenses.category,
      currency: expenses.currency,
      amount: expenses.amount,
      dayIndex: tripDays.dayIndex,
      date: tripDays.date,
    })
    .from(expenses)
    .leftJoin(tripDays, eq(tripDays.id, expenses.tripDayId))
    .where(eq(expenses.tripId, tripId))
    .orderBy(desc(expenses.createdAt));

export function createExpense(input: {
  tripId: string;
  dayIndex?: number;
  placeId?: string;
  title: string;
  category: string;
  currency: string;
  amount: number;
  paymentMethod?: string;
}): void {
  const day =
    input.dayIndex != null
      ? db
          .select({ id: tripDays.id })
          .from(tripDays)
          .where(and(eq(tripDays.tripId, input.tripId), eq(tripDays.dayIndex, input.dayIndex)))
          .all()[0]
      : undefined;

  db.insert(expenses)
    .values({
      id: newId(),
      tripId: input.tripId,
      tripDayId: day?.id ?? null,
      placeId: expensePlaceQuery(input.tripId, input.placeId).all()[0]?.id ?? null,
      title: input.title.trim(),
      category: input.category,
      currency: input.currency,
      amount: input.amount,
      paymentMethod: input.paymentMethod,
      createdAt: new Date().toISOString(),
    })
    .run();
}

export function removeExpense(id: string): void {
  db.delete(expenses).where(eq(expenses.id, id)).run();
}

export const tripDaysQuery = (tripId: string) =>
  db
    .select({ dayIndex: tripDays.dayIndex, date: tripDays.date })
    .from(tripDays)
    .where(eq(tripDays.tripId, tripId))
    .orderBy(tripDays.dayIndex);
