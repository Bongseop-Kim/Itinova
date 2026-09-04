// docs/design.md §4 데이터 모델. 로컬 SQLite 단독, 계정 없음.
// 시간은 UTC ISO 문자열, 날짜는 'YYYY-MM-DD' 문자열.
// 파생값(장소 간 거리, D-day)은 저장하지 않는다 — 렌더 시 계산.
import { sqliteTable, text, integer, real, unique } from 'drizzle-orm/sqlite-core';

// ponytail: 정수 PK + import 시 id 재매핑 대신 문자열 id. S21의 "이 여행만 JSON 내보내기"를
// 다른 기기로 가져올 때 충돌 처리 코드가 아예 필요 없어진다. 생성기는 db/index.ts의 newId().
const id = () => text('id').primaryKey();
const createdAt = () => text('created_at').notNull();

export const trips = sqliteTable('trips', {
  id: id(),
  title: text('title').notNull(),                     // 기본값 '{도시} 여행'
  cityName: text('city_name').notNull(),
  cityPlaceId: text('city_place_id'),
  countryCode: text('country_code'),
  lat: real('lat'),
  lng: real('lng'),
  startDate: text('start_date').notNull(),            // 날짜 필수 (§3.2 · 초안 상태 없음)
  endDate: text('end_date').notNull(),
  companion: text('companion'),                       // 혼자·친구·연인·가족·아이와
  styles: text('styles', { mode: 'json' }).$type<string[]>(),
  pace: text('pace', { enum: ['packed', 'relaxed'] }),
  currency: text('currency').notNull(),
  origin: text('origin', { enum: ['manual', 'ai'] }).notNull(),
  createdAt: createdAt(),
});

// 여행 생성 시 날짜 범위로 일괄 생성. 날짜 변경 규칙은 design.md §4.1.
export const tripDays = sqliteTable('trip_days', {
  id: id(),
  tripId: text('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  dayIndex: integer('day_index').notNull(),           // 1-based
  date: text('date').notNull(),
  title: text('title'),
}, (t) => [unique().on(t.tripId, t.dayIndex)]);

export const dayItems = sqliteTable('day_items', {
  id: id(),
  tripDayId: text('trip_day_id').notNull().references(() => tripDays.id, { onDelete: 'cascade' }),
  placeId: text('place_id').notNull().references(() => places.id, { onDelete: 'cascade' }),
  sortOrder: integer('sort_order').notNull(),         // 정수 간격 배치. 재정렬은 이 값만 갱신
  startTime: text('start_time'),                      // 'HH:mm' 현지 시각
  memo: text('memo'),
  visited: integer('visited', { mode: 'boolean' }).notNull().default(false),
});

// Google Places 응답 캐시. 오프라인 조회 + API 호출 절감.
export const places = sqliteTable('places', {
  id: id(),
  googlePlaceId: text('google_place_id').unique(),    // is_custom 장소는 null
  name: text('name').notNull(),
  category: text('category', { enum: ['attraction', 'food', 'cafe', 'stay', 'transport', 'etc'] }),
  address: text('address'),
  region: text('region'),
  lat: real('lat'),
  lng: real('lng'),
  rating: real('rating'),
  ratingCount: integer('rating_count'),
  photoUrl: text('photo_url'),
  openingHours: text('opening_hours', { mode: 'json' }).$type<string[]>(),
  summary: text('summary'),
  isCustom: integer('is_custom', { mode: 'boolean' }).notNull().default(false),
  fetchedAt: text('fetched_at'),
});

// 여행별 보관함 (전역 목록이 아니라 여행 맥락). §4.1의 일차 축소 시 여기로 밀린다.
export const savedPlaces = sqliteTable('saved_places', {
  id: id(),
  tripId: text('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  placeId: text('place_id').notNull().references(() => places.id, { onDelete: 'cascade' }),
  createdAt: createdAt(),
}, (t) => [unique().on(t.tripId, t.placeId)]);

export const expenses = sqliteTable('expenses', {
  id: id(),
  tripId: text('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  tripDayId: text('trip_day_id').references(() => tripDays.id, { onDelete: 'set null' }),
  placeId: text('place_id').references(() => places.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  category: text('category').notNull(),
  currency: text('currency').notNull(),
  amount: real('amount').notNull(),
  paymentMethod: text('payment_method'),
  splitWith: text('split_with'),                      // 스키마에만 존재, UI 미노출 (§1.3-1)
  createdAt: createdAt(),
});

export const checklistItems = sqliteTable('checklist_items', {
  id: id(),
  tripId: text('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  category: text('category').notNull(),               // 필수 준비물 · 기본 짐싸기
  label: text('label').notNull(),
  done: integer('done', { mode: 'boolean' }).notNull().default(false),
  sortOrder: integer('sort_order').notNull(),
});

export const chatMessages = sqliteTable('chat_messages', {
  id: id(),
  tripId: text('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['user', 'assistant'] }).notNull(),
  content: text('content').notNull(),
  createdAt: createdAt(),
});

// 단일 행 KV. 언어·단위·기본 통화.
export const appSettings = sqliteTable('app_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

// ponytail: 보조 인덱스 없음. FK 컬럼 조회는 여행 하나당 수백 행 규모라 SQLite가
// 테이블 스캔으로 충분히 처리한다. 느려지면 day_items(trip_day_id)부터 붙인다.
