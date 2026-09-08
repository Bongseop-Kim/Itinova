import { eq } from 'drizzle-orm';

import { db } from './index';
import { appSettings } from './schema';

/** 단일 행 KV (design.md §4 `app_settings`). 언어·단위·기본 통화·온보딩 완료 여부. */
export const settingsQuery = () => db.select().from(appSettings);

export function setSetting(key: string, value: string): void {
  const existing = db.select().from(appSettings).where(eq(appSettings.key, key)).all()[0];
  if (existing) db.update(appSettings).set({ value }).where(eq(appSettings.key, key)).run();
  else db.insert(appSettings).values({ key, value }).run();
}

export const ONBOARDED = 'onboarded';
