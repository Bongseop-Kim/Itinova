import { appleCategory, uniqueApplePlaces, type ApplePlace } from './applePlaces.ts';
import { cityTimeZone } from './cities.ts';
import { convertAmount, parseRate, parseWeather, timeDifference, tripForecast, weatherLabel, weatherSummary } from './travelTools.ts';
// node lib/check.ts — 프레임워크 없는 자체 점검. RN 을 import 하지 않는 순수 로직만 다룬다.
import { dashedRoutes, directionsUrl, mapCamera, mapData, validCoord, validTime } from './map.ts';
import { BACKUP_FORMAT, parseBackup, planImport, type TripPayload } from './backup.ts';
import { cellState, datesBetween, dayDiff, monthGrid, months, pickDate, toISO, tripLength } from './calendar.ts';
import { dayMeta, daysUntil, ddayLabel, tripBucket } from './date.ts';
import { formatAmount, groupByCategory, groupByDay as groupExpensesByDay, sumByCurrency, type Expense } from './expense.ts';
import { formatKm, haversineKm } from './geo.ts';
import { groupByDay, type JoinedRow } from './itinerary.ts';
import { moveItem, sortByDistance, sortOrders } from './reorder.ts';
import { dateChangeWarning, planDateChange, type CurrentDay } from './tripDates.ts';

// ponytail: @types/node 를 끌어오지 않기 위한 최소 어서션. 프레임워크 없음.
const fail = (msg: string): never => {
  throw new Error(msg);
};
const eq = (got: unknown, want: unknown, msg = '') =>
  got === want || fail(`${msg} — got ${String(got)}, want ${String(want)}`);
const same = (got: unknown, want: unknown, msg = '') =>
  JSON.stringify(got) === JSON.stringify(want) ||
  fail(`${msg} — got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
const ok = (cond: boolean, msg: string) => cond || fail(msg);

// ── 거리 ──
const busanStation = { lat: 35.1151, lng: 129.0403 };
const gwangalli = { lat: 35.1533, lng: 129.1183 };

const km = haversineKm(busanStation, gwangalli);
ok(km > 8 && km < 8.5, `부산역→광안리 ≈ 8.2km 여야 함, 실제 ${km}`);
eq(haversineKm(busanStation, busanStation), 0, '같은 좌표는 0');
// 대칭성 — 인수 순서가 결과를 바꾸면 재정렬에서 거리가 흔들린다
eq(haversineKm(gwangalli, busanStation).toFixed(9), km.toFixed(9));

eq(formatKm(8.147), '8.1km');
eq(formatKm(0.42), '420m', '1km 미만은 m 단위');
eq(formatKm(1), '1.0km', '경계값 1km 는 km 단위');

// ── 날짜 ──
eq(dayMeta('2026-09-09'), '9.9/수');
eq(dayMeta('2026-09-11'), '9.11/금');
eq(dayMeta('2026-01-01'), '1.1/목', '한 자리 월도 앞자리 0 없이');

const today = new Date();
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
eq(daysUntil(iso(today)), 0, '오늘은 0');
eq(daysUntil(iso(new Date(today.getTime() + 5 * 86_400_000))), 5);
ok(daysUntil('2020-01-01') < 0, '지난 날짜는 음수');

// ── 일차 그룹핑 ──
const row = (over: Partial<JoinedRow>): JoinedRow => ({
  dayId: 'd1', dayIndex: 1, date: '2026-09-09',
  itemId: null, startTime: null, visited: null,
  name: null, category: null, region: null, lat: null, lng: null,
  ...over,
});

const sections = groupByDay([
  row({ itemId: 'i1', name: '부산역', lat: 35.1151, lng: 129.0403 }),
  row({ itemId: 'i2', name: '광안리', lat: 35.1533, lng: 129.1183 }),
  row({ dayId: 'd2', dayIndex: 2, date: '2026-09-10' }),              // 빈 일차
  row({ dayId: 'd3', dayIndex: 3, date: '2026-09-11', itemId: 'i3', name: '좌표 없는 장소' }),
]);

eq(sections.length, 3, '빈 일차도 섹션으로 남아야 점선 장소 추가가 나온다');
same(sections.map((s) => s.data.length), [2, 0, 1]);
eq(sections[1].dayIndex, 2);
eq(sections[2].data[0].coord, null, '좌표 없으면 coord = null (거리 배지 생략)');
eq(sections[0].data[0].visited, false, 'visited null 은 false 로');

// ── 캘린더 ──
const sep = monthGrid(2026, 9);
eq(sep.label, '2026년 9월');
eq(sep.weeks.length, 5, '2026-09 는 5주 그리드');
eq(sep.weeks[0][0], null, '9/1 은 화요일이라 앞 두 칸이 빈칸');
eq(sep.weeks[0][2]?.date, '2026-09-01');
eq(sep.weeks[4][3]?.date, '2026-09-30', '마지막 날');
eq(sep.weeks[4][4], null, '월말 뒤도 null 로 채운다');
eq(sep.weeks.every((w) => w.length === 7), true, '모든 주가 7칸');

// 윤년·월말 경계
eq(monthGrid(2028, 2).weeks.flat().filter(Boolean).length, 29, '2028 은 윤년');
eq(monthGrid(2026, 2).weeks.flat().filter(Boolean).length, 28);

eq(months(3, new Date(2026, 10, 1)).map((m) => m.label).join(' / '), '2026년 11월 / 2026년 12월 / 2027년 1월', '연말을 넘어간다');

// 범위
eq(dayDiff('2026-09-09', '2026-09-11'), 2);
eq(dayDiff('2026-09-11', '2026-09-09'), -2);
eq(dayDiff('2026-02-28', '2026-03-01'), 1, '월 경계');
same(datesBetween('2026-09-09', '2026-09-11'), ['2026-09-09', '2026-09-10', '2026-09-11']);
same(datesBetween('2026-09-09', '2026-09-09'), ['2026-09-09'], '같은 날이면 하루');
eq(datesBetween('2026-12-30', '2027-01-02').length, 4, '연 경계');

eq(tripLength('2026-09-09', '2026-09-11'), '2박 3일');
eq(tripLength('2026-09-09', '2026-09-09'), '당일치기');

// 선택 전이
same(pickDate({}, '2026-09-09'), { start: '2026-09-09' }, '첫 탭은 시작');
same(pickDate({ start: '2026-09-09' }, '2026-09-11'), { start: '2026-09-09', end: '2026-09-11' });
same(pickDate({ start: '2026-09-09' }, '2026-09-05'), { start: '2026-09-05' }, '시작보다 앞을 누르면 새 시작');
same(pickDate({ start: '2026-09-09' }, '2026-09-09'), { start: '2026-09-09', end: '2026-09-09' }, '같은 날 두 번은 당일치기');
same(pickDate({ start: '2026-09-09', end: '2026-09-11' }, '2026-09-20'), { start: '2026-09-20' }, '완성된 범위에서 누르면 다시 시작');

const r = { start: '2026-09-09', end: '2026-09-11' };
eq(cellState(r, '2026-09-09'), 'start');
eq(cellState(r, '2026-09-10'), 'middle');
eq(cellState(r, '2026-09-11'), 'end');
eq(cellState(r, '2026-09-12'), 'none');
eq(cellState({ start: '2026-09-09' }, '2026-09-09'), 'single', '종료 미정이면 시작이 단독으로 보인다');
eq(cellState({ start: '2026-09-09', end: '2026-09-09' }, '2026-09-09'), 'single');
eq(cellState({}, '2026-09-09'), 'none');

eq(toISO(2026, 1, 5), '2026-01-05', '한 자리 월·일은 0 패딩');

// ── 여행 분류 · D-day ──
eq(tripBucket('2026-09-09', '2026-09-11', '2026-09-05'), 'upcoming');
eq(tripBucket('2026-09-09', '2026-09-11', '2026-09-09'), 'ongoing', '시작 당일도 진행중');
eq(tripBucket('2026-09-09', '2026-09-11', '2026-09-11'), 'ongoing', '종료 당일도 진행중');
eq(tripBucket('2026-09-09', '2026-09-11', '2026-09-12'), 'past');

eq(ddayLabel('2026-09-09', '2026-09-05'), 'D-4');
eq(ddayLabel('2026-09-09', '2026-09-09'), 'D-day');
eq(ddayLabel('2026-09-09', '2026-09-12'), 'D+3', '지난 여행은 D+');

// ── 가계부 ──
const ex = (over: Partial<Expense>): Expense => ({
  id: 'e' + Math.random(), title: '항목', category: '식비',
  currency: 'KRW', amount: 1000, dayIndex: 1, ...over,
});

const spend: Expense[] = [
  ex({ amount: 59800, category: '교통', dayIndex: 1 }),
  ex({ amount: 11000, category: '식비', dayIndex: 1 }),
  ex({ amount: 8500, category: '카페', dayIndex: 2 }),
  ex({ amount: 12400, currency: 'JPY', category: '식비', dayIndex: 2 }),
  ex({ amount: 3000, category: '기타', dayIndex: null }),
];

same(sumByCurrency(spend), [
  { currency: 'KRW', amount: 82300 },
  { currency: 'JPY', amount: 12400 },
], '통화별로 합치고 큰 금액 순');
same(sumByCurrency([]), [], '비었으면 빈 배열');

const byDay = groupExpensesByDay(spend);
same(byDay.map((g) => g.label), ['day 1', 'day 2', '미지정'], '미지정은 맨 뒤');
eq(byDay[0].rows.length, 2);
eq(byDay[2].rows.length, 1);
same(groupExpensesByDay(spend.filter((r) => r.dayIndex != null)).map((g) => g.label), ['day 1', 'day 2'], '미지정이 없으면 그룹도 없다');

same(groupByCategory(spend).map((g) => g.label), ['교통', '식비', '카페', '기타'], 'EXPENSE_CATEGORIES 순서를 따른다');
same(groupByCategory([ex({ category: '알수없음' }), ex({ category: '교통' })]).map((g) => g.label), ['교통', '알수없음'], '목록 밖 값은 뒤로');

eq(formatAmount(59800, 'KRW'), '59,800', '원화는 소수점 없음');
eq(formatAmount(12400, 'JPY'), '12,400');
eq(formatAmount(12.5, 'USD'), '12.50', '그 외 통화는 두 자리');

// ── 재정렬 ──
same(moveItem(['a', 'b', 'c', 'd'], 0, 2), ['b', 'c', 'a', 'd'], '뒤로 이동');
same(moveItem(['a', 'b', 'c', 'd'], 3, 1), ['a', 'd', 'b', 'c'], '앞으로 이동');
same(moveItem(['a', 'b', 'c'], 1, 1), ['a', 'b', 'c'], '제자리는 그대로');
same(moveItem(['a', 'b', 'c'], 0, -1), ['a', 'b', 'c'], '범위 밖은 원본');
same(moveItem(['a', 'b', 'c'], 0, 9), ['a', 'b', 'c'], '범위 밖은 원본');

const at = (name: string, lat: number, lng: number) => ({ name, coord: { lat, lng } });
// 부산역에서 출발. 광안리(멀다) → 서면(가깝다) 순으로 넣으면 서면이 먼저 와야 한다.
const route = sortByDistance([
  at('부산역', 35.1151, 129.0403),
  at('광안리', 35.1533, 129.1183),
  at('서면', 35.1580, 129.0596),
]);
same(route.map((r) => r.name), ['부산역', '서면', '광안리'], '첫 장소 고정 후 최근접 순');

const withNull = sortByDistance([
  at('부산역', 35.1151, 129.0403),
  { name: '좌표없음', coord: null },
  at('광안리', 35.1533, 129.1183),
  at('서면', 35.1580, 129.0596),
]);
same(withNull.map((r) => r.name), ['부산역', '서면', '광안리', '좌표없음'], '좌표 없는 항목은 맨 뒤');

same(sortByDistance([at('a', 0, 0), at('b', 1, 1)]).map((r) => r.name), ['a', 'b'], '2개 이하는 건드리지 않는다');
eq(sortByDistance([] as { coord: { lat: number; lng: number } | null }[]).length, 0, '빈 목록');

same(sortOrders(3), [1000, 2000, 3000]);

// ── §4.1 날짜 변경 ──
const days3: CurrentDay[] = [
  { dayIndex: 1, date: '2026-09-09' },
  { dayIndex: 2, date: '2026-09-10' },
  { dayIndex: 3, date: '2026-09-11' },
];

// 기간 동일, 날짜만 이동
const moved = planDateChange(days3, '2026-09-16', '2026-09-18');
same(moved.shifted, [
  { dayIndex: 1, date: '2026-09-16' },
  { dayIndex: 2, date: '2026-09-17' },
  { dayIndex: 3, date: '2026-09-18' },
], 'day_index 는 유지하고 date 만 갱신');
eq(moved.added.length, 0);
eq(moved.removed.length, 0);

// 아무것도 안 바뀌면 갱신할 것도 없다
const same0 = planDateChange(days3, '2026-09-09', '2026-09-11');
eq(same0.shifted.length, 0, '같은 날짜면 shifted 도 비어야 한다');
eq(same0.added.length + same0.removed.length, 0);

// 기간 증가
const longer = planDateChange(days3, '2026-09-09', '2026-09-13');
eq(longer.shifted.length, 0, '앞 3일은 그대로');
same(longer.added, [
  { dayIndex: 4, date: '2026-09-12' },
  { dayIndex: 5, date: '2026-09-13' },
], '뒤에 빈 일차 추가');
eq(longer.removed.length, 0);

// 기간 감소
const shorter = planDateChange(days3, '2026-09-09', '2026-09-10');
eq(shorter.added.length, 0);
same(shorter.removed, [{ dayIndex: 3, date: '2026-09-11' }], '초과 일차 삭제');

// 앞으로 당기면서 줄이는 경우 — 이동과 감소가 함께
const both = planDateChange(days3, '2026-09-05', '2026-09-06');
same(both.shifted, [
  { dayIndex: 1, date: '2026-09-05' },
  { dayIndex: 2, date: '2026-09-06' },
]);
same(both.removed, [{ dayIndex: 3, date: '2026-09-11' }]);

eq(dateChangeWarning([], 0), null, '사라지는 일차가 없으면 확인 불필요');
eq(dateChangeWarning([{ dayIndex: 3, date: 'x' }], 2), 'day 3 의 장소 2개가 저장함으로 이동합니다.');
eq(dateChangeWarning([{ dayIndex: 3, date: 'x' }], 0), 'day 3 가 사라집니다.', '빈 일차면 장소 얘기를 하지 않는다');
eq(dateChangeWarning([{ dayIndex: 2, date: 'x' }, { dayIndex: 3, date: 'y' }], 5), 'day 2, day 3 의 장소 5개가 저장함으로 이동합니다.');

// ── 백업 · 가져오기 ──
const payload: TripPayload = {
  trip: { id: 'T1', title: '부산 여행' },
  tripDays: [{ id: 'D1', tripId: 'T1', dayIndex: 1 }],
  dayItems: [{ id: 'I1', tripDayId: 'D1', placeId: 'P1' }],
  places: [
    { id: 'P1', name: '부산역', googlePlaceId: 'g-busan' },
    { id: 'P2', name: '나만의 장소', googlePlaceId: null },
  ],
  savedPlaces: [{ id: 'S1', tripId: 'T1', placeId: 'P2' }],
  expenses: [{ id: 'E1', tripId: 'T1', tripDayId: 'D1', placeId: 'P1' }],
  checklistItems: [{ id: 'C1', tripId: 'T1' }],
};

const backup = { format: BACKUP_FORMAT, version: 1, trips: [payload] };

ok('error' in parseBackup('not json'), 'JSON 아님');
ok('error' in parseBackup('{"format":"other","version":1,"trips":[]}'), '다른 포맷');
ok('error' in parseBackup(JSON.stringify({ format: BACKUP_FORMAT, version: 99, trips: [payload] })), '더 새 버전');
ok('error' in parseBackup(JSON.stringify({ format: BACKUP_FORMAT, version: 1, trips: [] })), '여행 없음');
ok('error' in parseBackup(JSON.stringify({ format: BACKUP_FORMAT, version: 1, trips: [{ trip: { id: 'x' } }] })), '자식 배열 누락');
ok('backup' in parseBackup(JSON.stringify(backup)), '정상 백업');

// 겹치지 않으면 id 를 그대로 — 기기 이전에서 원본과 같은 상태가 된다
let seq = 0;
const nid = () => `N${++seq}`;
const clean = planImport(payload, { tripIds: new Set(), placeByGoogleId: new Map() }, nid);
eq(clean.remapped, false);
eq(clean.trip.id, 'T1');
eq(clean.dayItems[0].tripDayId, 'D1');
eq(clean.places.length, 2, '캐시에 없으면 둘 다 새로 넣는다');

// 여행 id 가 겹치면 전부 새 id — 기존 여행을 덮지 않는다
seq = 0;
const dup = planImport(payload, { tripIds: new Set(['T1']), placeByGoogleId: new Map() }, nid);
eq(dup.remapped, true);
ok(dup.trip.id !== 'T1', '여행 id 가 바뀐다');
eq(dup.tripDays[0].tripId, dup.trip.id, '자식이 새 여행을 가리킨다');
eq(dup.dayItems[0].tripDayId, dup.tripDays[0].id, '일차 참조도 따라간다');
eq(dup.checklistItems[0].tripId, dup.trip.id);
eq(dup.expenses[0].tripId, dup.trip.id);
ok(dup.dayItems[0].placeId === dup.places[0].id, '장소 참조도 새 id 로');

// 이미 캐시된 장소는 재사용한다
seq = 0;
const shared = planImport(
  payload,
  { tripIds: new Set(), placeByGoogleId: new Map([['g-busan', 'EXISTING']]) },
  nid,
);
eq(shared.places.length, 1, '캐시된 장소는 다시 넣지 않는다');
eq(shared.places[0].id, 'P2', '커스텀 장소만 새로 들어간다');
eq(shared.dayItems[0].placeId, 'EXISTING', '참조는 기존 장소를 가리킨다');

// 일차 없는 비용(§4.1 미지정)은 null 을 유지한다
seq = 0;
const noDay = planImport(
  { ...payload, expenses: [{ id: 'E1', tripId: 'T1', tripDayId: null, placeId: null }] },
  { tripIds: new Set(['T1']), placeByGoogleId: new Map() },
  nid,
);
eq(noDay.expenses[0].tripDayId, null, 'null 은 그대로 null');
eq(noDay.expenses[0].placeId, null);

console.log('lib check: 통과');

// ── 지도: 일차·순번·누락 좌표·날짜변경선·입력 검증 ──
const mapped = mapData(sections);
same(mapped.pins.map((p) => [p.id, p.order]), [['i1', 1], ['i2', 2]]);
eq(mapped.routes.length, 1);
eq(mapData(sections, 2).pins.length, 0, '빈 일차 필터');
eq(mapData(sections, 3).pins.length, 0, '좌표 없는 일차');
const gapSection = [{ ...sections[0], data: [sections[0].data[0], sections[2].data[0], sections[0].data[1]] }];
same(mapData(gapSection).pins.map((p) => p.order), [1, 3], '좌표 없는 방문도 순번 유지');
eq(mapData(gapSection).routes.length, 0, '좌표 없는 방문을 가로질러 연결하지 않음');
ok(validCoord(0, 0), '적도·본초자오선 좌표');
ok(!validCoord(null, 0) && !validCoord(NaN, 0) && !validCoord(91, 0) && !validCoord(0, 181), '유효하지 않은 좌표 제외');
const across = mapCamera([{ lat: 0, lng: 179 }, { lat: 0, lng: -179 }], null, 360, 320);
ok(Math.abs(across.coordinates.longitude) === 180 && across.zoom > 6, '날짜변경선 주변은 좁게 맞춤');
eq(mapCamera([], busanStation, 360, 320).coordinates.latitude, busanStation.lat);
eq(mapCamera([], null, 360, 320).zoom, 1);
eq(mapCamera([busanStation], null, 360, 320).zoom, 15, '핀 하나의 최대 확대');
const dashed = dashedRoutes(mapped.routes, 12, [4, 6]);
ok(dashed.length > 1 && dashed.length <= 512, '점선은 유한 개의 짧은 선분');
ok(dashed.flatMap((p) => p.coordinates).every((p) => validCoord(p.latitude, p.longitude)), '점선 좌표 범위');
eq(dashedRoutes([{ id: 'same', coordinates: [busanStation, busanStation] }], 15, [4, 6]).length, 0);
ok(validTime('') && validTime('00:00') && validTime('23:59') && !validTime('24:00') && !validTime('9:30'), '시간 입력 검증');
ok(directionsUrl({ name: '장소 & 입구', lat: null, lng: null }).includes(encodeURIComponent('장소 & 입구')), '길찾기 검색어 인코딩');
console.log('map check: 통과');

// ── 여행 도구 ──
const weatherPayload = { timezone: 'Asia/Tokyo', daily: { time: ['2026-09-09', '2026-09-10'], weather_code: [0, 63], temperature_2m_min: [20, null], temperature_2m_max: [29, 25], precipitation_probability_max: [0, null] } };
const weather = parseWeather(weatherPayload);
eq(weather.days.length, 2);
eq(weather.days[1].low, null, '누락된 온도를 0으로 만들지 않는다');
eq(weather.days[1].rain, null, '누락된 강수 확률을 0으로 만들지 않는다');
eq(tripForecast(weather, '2026-09-10', '2026-09-15').length, 1, '여행 날짜와 예보의 교집합');
eq(tripForecast(weather, '2026-10-01', '2026-10-03').length, 0, '예보 범위 밖은 추측하지 않음');
eq(weatherSummary(weather.days[0]), '맑음 · 20° / 29°');
eq(weatherLabel(99), '뇌우');
eq(weatherLabel(null), '날씨 정보 없음');
const rejects = (run: () => unknown) => { try { run(); return false; } catch { return true; } };
ok(rejects(() => parseWeather({})), '잘못된 날씨 응답 거절');
ok(rejects(() => parseWeather({ ...weatherPayload, timezone: 'Unknown/City' })), '잘못된 시간대 거절');
ok(rejects(() => parseWeather({ ...weatherPayload, daily: { ...weatherPayload.daily, temperature_2m_min: [] } })), '일별 배열 길이 불일치 거절');
eq(parseRate({ date: '2026-09-07', base: 'JPY', quote: 'KRW', rate: 9.5 }, 'JPY', 'KRW').rate, 9.5);
ok(rejects(() => parseRate({ date: '2026-09-07', base: 'USD', quote: 'KRW', rate: 9.5 }, 'JPY', 'KRW')), '다른 통화쌍 응답 거절');
ok(rejects(() => parseRate({ date: '2026-02-30', base: 'JPY', quote: 'KRW', rate: -1 }, 'JPY', 'KRW')), '잘못된 날짜와 음수 환율 거절');
eq(convertAmount('100.50', 9.5), 954.75);
eq(convertAmount('0', 9.5), 0);
eq(convertAmount('-1', 9.5), null);
eq(convertAmount('12abc', 9.5), null);
eq(convertAmount('', 9.5), null);
eq(convertAmount('10', Infinity), null);
eq(timeDifference(new Date('2026-07-01T12:00:00Z'), 'Europe/Paris'), '한국보다 7시간 느려요', '여름 서머타임');
eq(timeDifference(new Date('2026-01-01T12:00:00Z'), 'Europe/Paris'), '한국보다 8시간 느려요', '겨울 시차');
eq(timeDifference(new Date('2026-01-01T12:00:00Z'), 'Asia/Kolkata'), '한국보다 3시간 30분 느려요');
eq(timeDifference(new Date(), 'Asia/Tokyo'), '한국과 시차가 없어요');
eq(cityTimeZone('파리', 'FR'), 'Europe/Paris');
eq(cityTimeZone('모르는 도시', 'FR'), undefined, '도시를 모르면 국가만으로 시간대를 추측하지 않음');
console.log('travel tools check: 통과');

// Apple 결과의 유효성, 카테고리, 중복 및 백업 참조 유지.
const applePlace: ApplePlace = { applePlaceId: 'apple-1', name: '카페', address: '주소', region: '도쿄', countryCode: 'JP', currency: 'JPY', lat: 35, lng: 139, poiCategory: 'MKPOICategoryCafe' };
eq(appleCategory(applePlace.poiCategory), 'cafe');
eq(appleCategory('MKPOICategoryPublicTransport'), 'transport');
eq(appleCategory('unknown'), 'etc');
eq(uniqueApplePlaces([applePlace, applePlace, { ...applePlace, lat: NaN }], false).length, 1);
eq(uniqueApplePlaces([applePlace, { ...applePlace, applePlaceId: 'apple-2' }], true).length, 1);
eq(uniqueApplePlaces([applePlace, { ...applePlace, applePlaceId: 'apple-2', region: '다른 지역' }], true).length, 2);
const applePayload: TripPayload = { trip: { id: 'apple-trip' }, tripDays: [{ id: 'apple-day', tripId: 'apple-trip' }], dayItems: [{ id: 'apple-item', tripDayId: 'apple-day', placeId: 'old-apple' }], savedPlaces: [{ id: 'apple-saved', tripId: 'apple-trip', placeId: 'old-apple' }], expenses: [], checklistItems: [], places: [{ id: 'old-apple', applePlaceId: 'apple-1', name: '카페' }] };
const applePlan = planImport(applePayload, { tripIds: new Set(['apple-trip']), placeByGoogleId: new Map(), placeByAppleId: new Map([['apple-1', 'cached-apple']]) }, () => 'fresh-apple');
eq(applePlan.places.length, 0);
eq(applePlan.dayItems[0].placeId, 'cached-apple');
eq(applePlan.savedPlaces[0].placeId, 'cached-apple');
console.log('apple places check: 통과');
