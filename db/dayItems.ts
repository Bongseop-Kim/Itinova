import { and, desc, eq, inArray } from 'drizzle-orm';

import { validTime } from '../lib/map';
import { sortOrders } from '../lib/reorder';

import { db } from './index';
import { dayItems, tripDays } from './schema';

/** 한 일차의 순서를 통째로 다시 쓴다. sort_order 만 갱신한다 (design.md §4). */
export function reorderDay(itemIdsInOrder: string[]): void {
  const orders = sortOrders(itemIdsInOrder.length);
  db.transaction((tx) => {
    itemIdsInOrder.forEach((id, i) => {
      tx.update(dayItems).set({ sortOrder: orders[i] }).where(eq(dayItems.id, id)).run();
    });
  });
}

export function toggleVisited(id: string, visited: boolean): void {
  db.update(dayItems).set({ visited }).where(eq(dayItems.id, id)).run();
}

/** 선택한 항목들을 다른 일차 맨 뒤로 옮긴다. */
export function moveItemsToDay(tripId: string, itemIds: string[], targetDayIndex: number): void {
  if (!itemIds.length) return;

  const target = db
    .select({ id: tripDays.id })
    .from(tripDays)
    .where(and(eq(tripDays.tripId, tripId), eq(tripDays.dayIndex, targetDayIndex)))
    .all()[0];
  if (!target) return;

  const last = db
    .select({ sortOrder: dayItems.sortOrder })
    .from(dayItems)
    .where(eq(dayItems.tripDayId, target.id))
    .orderBy(desc(dayItems.sortOrder))
    .all()[0];

  let order = last?.sortOrder ?? 0;
  db.transaction((tx) => {
    for (const id of itemIds) {
      tx.update(dayItems)
        .set({ tripDayId: target.id, sortOrder: (order += 1000) })
        .where(eq(dayItems.id, id))
        .run();
    }
  });
}

export function deleteItems(itemIds: string[]): void {
  if (!itemIds.length) return;
  db.delete(dayItems).where(inArray(dayItems.id, itemIds)).run();
}

export function updateItemDetails(id: string, startTime: string, memo: string): void {
  if (!validTime(startTime)) throw new Error('시간은 HH:mm 형식으로 입력해 주세요.');
  db.update(dayItems).set({ startTime: startTime.trim() || null, memo: memo.trim() || null }).where(eq(dayItems.id, id)).run();
}
