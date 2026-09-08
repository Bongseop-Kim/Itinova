import { asc, eq } from 'drizzle-orm';

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
    .where(eq(checklistItems.tripId, tripId))
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
