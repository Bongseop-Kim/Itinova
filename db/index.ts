import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';

const sqlite = SQLite.openDatabaseSync('itinova.db');

export const db = drizzle(sqlite);
