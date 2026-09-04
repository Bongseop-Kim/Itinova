import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';

const sqlite = SQLite.openDatabaseSync('itinova.db');
// SQLite는 연결마다 FK 강제가 기본 OFF다. 켜지 않으면 schema.ts의 onDelete cascade가 조용히 무시된다.
sqlite.execSync('PRAGMA foreign_keys = ON');

export const db = drizzle(sqlite);

// ponytail: uuid 의존성 대신 시간 + 난수. 단일 기기 앱이고, 기기 간에는 JSON 가져오기로만 섞인다.
export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
