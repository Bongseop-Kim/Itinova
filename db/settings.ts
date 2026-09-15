import { eq } from 'drizzle-orm';

import { db } from './index';
import { appSettings } from './schema';

/** 단일 행 KV (design.md §4 `app_settings`). 온보딩·코치마크·날짜 형식. */
export const settingsQuery = () => db.select().from(appSettings);

export function setSetting(key: string, value: string): void {
  const existing = db.select().from(appSettings).where(eq(appSettings.key, key)).all()[0];
  if (existing) db.update(appSettings).set({ value }).where(eq(appSettings.key, key)).run();
  else db.insert(appSettings).values({ key, value }).run();
}

export const ONBOARDED = 'onboarded';
export const DATE_FORMAT = 'date_format';
export type { DateFormat } from '../lib/date';
