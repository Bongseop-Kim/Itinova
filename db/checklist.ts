import { and, asc, eq } from 'drizzle-orm';
import { categoryAppendOrders } from '../lib/checklist';
import { sortOrders } from '../lib/reorder';

import { db, newId } from './index';
import { checklistItems } from './schema';

export const checklistQuery = (tripId: string) =>
  db
    .select()
    .from(checklistItems)
    .where(eq(checklistItems.tripId, tripId))
    .orderBy(asc(checklistItems.sortOrder));

export function toggleChecklistItem(id: string, done: boolean): void {
  db.update(checklistItems).set({ done }).where(eq(checklistItems.id, id)).run();
}

export function addChecklistItem(tripId: string, category: string, label: string): void {
  const trimmed = label.trim();
  if (!trimmed) return;

  // 같은 카테고리 맨 뒤에 붙인다. 정수 간격은 §4 의 sort_order 규약과 같다.
  const last = db
    .select({ sortOrder: checklistItems.sortOrder })
    .from(checklistItems)
    .where(and(eq(checklistItems.tripId, tripId), eq(checklistItems.category, category)))
    .orderBy(asc(checklistItems.sortOrder))
    .all()
    .at(-1);

  db.insert(checklistItems)
    .values({
      id: newId(),
      tripId,
      category,
      label: trimmed,
      sortOrder: (last?.sortOrder ?? 0) + 1000,
    })
    .run();
}

export function removeChecklistItem(id: string): void {
  db.delete(checklistItems).where(eq(checklistItems.id, id)).run();
}

export function renameChecklistItem(id: string, label: string): void {
  const trimmed = label.trim();
  if (trimmed) db.update(checklistItems).set({ label: trimmed }).where(eq(checklistItems.id, id)).run();
}

export function reorderChecklistItems(ids: string[]): void {
  const orders = sortOrders(ids.length);
  db.transaction((tx) => {
    ids.forEach((id, index) => {
      tx.update(checklistItems).set({ sortOrder: orders[index] }).where(eq(checklistItems.id, id)).run();
    });
  });
}

export function renameCategory(tripId: string, from: string, to: string): void {
  const trimmed = to.trim();
  if (!trimmed || trimmed === from) return;
  db.transaction((tx) => {
    const rows = tx.select().from(checklistItems).where(eq(checklistItems.tripId, tripId))
      .orderBy(asc(checklistItems.sortOrder)).all();
    const source = rows.filter((row) => row.category === from);
    const orders = categoryAppendOrders(source.length, rows.filter((row) => row.category === trimmed).map((row) => row.sortOrder));
    source.forEach((row, index) => {
      tx.update(checklistItems).set({ category: trimmed, sortOrder: orders[index] })
        .where(eq(checklistItems.id, row.id)).run();
    });
  });
}

export function deleteCategory(tripId: string, category: string): void {
  db.transaction((tx) => {
    tx.delete(checklistItems).where(and(eq(checklistItems.tripId, tripId), eq(checklistItems.category, category))).run();
  });
}
