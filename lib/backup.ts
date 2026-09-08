// §1.3-2 — 로그인이 없으므로 JSON 내보내기/가져오기가 유일한 백업·기기 이전 수단이다.
// 가져오기는 데이터 손실 영역이라 검증과 id 재매핑을 순수 함수로 분리해 둔다.

export const BACKUP_FORMAT = 'itinova.backup';
export const BACKUP_VERSION = 1;

export type Row = Record<string, unknown> & { id: string };
export type PlaceRow = Row & { googlePlaceId?: string | null };

export type TripPayload = {
  trip: Row;
  tripDays: Row[];
  dayItems: Row[];
  places: PlaceRow[];
  savedPlaces: Row[];
  expenses: Row[];
  checklistItems: Row[];
};

export type Backup = { format: string; version: number; exportedAt?: string; trips: TripPayload[] };

const KEYS = ['tripDays', 'dayItems', 'places', 'savedPlaces', 'expenses', 'checklistItems'] as const;

/** 파싱 + 형식 검증. 실패 사유는 사용자에게 보여줄 문장으로 돌려준다. */
export function parseBackup(text: string): { backup: Backup } | { error: string } {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { error: 'JSON 형식이 아니에요. 내보내기로 만든 내용을 그대로 붙여넣어 주세요.' };
  }

  const b = data as Partial<Backup>;
  if (b?.format !== BACKUP_FORMAT) return { error: 'Itinova 백업 파일이 아니에요.' };
  if (typeof b.version !== 'number' || b.version > BACKUP_VERSION) {
    return { error: '더 새로운 버전에서 만든 백업이에요. 앱을 업데이트해 주세요.' };
  }
  if (!Array.isArray(b.trips) || !b.trips.length) return { error: '가져올 여행이 없어요.' };

  for (const trip of b.trips) {
    if (!trip?.trip?.id) return { error: '백업이 손상됐어요.' };
    for (const key of KEYS) if (!Array.isArray(trip[key])) return { error: '백업이 손상됐어요.' };
  }

  return { backup: b as Backup };
}

export type Existing = {
  /** 이미 있는 여행 id — 겹치면 새 id 로 가져와 기존 여행을 덮지 않는다. */
  tripIds: ReadonlySet<string>;
  /** google_place_id → 기존 place id. 같은 장소를 중복 저장하지 않는다. */
  placeByGoogleId: ReadonlyMap<string, string>;
};

export type ImportPlan = {
  /** 새로 넣을 장소. 기존에 있던 장소는 여기에 없다. */
  places: PlaceRow[];
  trip: Row;
  tripDays: Row[];
  dayItems: Row[];
  savedPlaces: Row[];
  expenses: Row[];
  checklistItems: Row[];
  /** 기존 여행과 겹쳐 새 id 로 가져왔는지 */
  remapped: boolean;
};

/**
 * 가져올 행들을 만든다.
 *
 * - 여행 id 가 이미 있으면 **모든 id 를 새로 발급**한다. 덮어쓰지 않는다 —
 *   같은 백업을 두 번 가져오면 여행이 둘 생기는 게, 기존 여행이 사라지는 것보다 낫다.
 * - `google_place_id` 가 있고 이미 캐시된 장소는 그걸 재사용한다.
 */
export function planImport(payload: TripPayload, existing: Existing, newId: () => string): ImportPlan {
  const remapped = existing.tripIds.has(payload.trip.id);
  const map = new Map<string, string>();
  const id = (old: string) => {
    if (!remapped) return old;
    let next = map.get(old);
    if (!next) map.set(old, (next = newId()));
    return next;
  };

  const placeMap = new Map<string, string>();
  const places: PlaceRow[] = [];
  for (const place of payload.places) {
    const gid = place.googlePlaceId;
    const cached = gid ? existing.placeByGoogleId.get(gid) : undefined;
    if (cached) {
      placeMap.set(place.id, cached);
    } else {
      const fresh = remapped ? newId() : place.id;
      placeMap.set(place.id, fresh);
      places.push({ ...place, id: fresh });
    }
  }
  const placeId = (old: string) => placeMap.get(old) ?? old;

  return {
    remapped,
    places,
    trip: { ...payload.trip, id: id(payload.trip.id) },
    tripDays: payload.tripDays.map((d) => ({ ...d, id: id(d.id), tripId: id(payload.trip.id) })),
    dayItems: payload.dayItems.map((i) => ({
      ...i,
      id: id(i.id),
      tripDayId: id(i.tripDayId as string),
      placeId: placeId(i.placeId as string),
    })),
    savedPlaces: payload.savedPlaces.map((sp) => ({
      ...sp,
      id: id(sp.id),
      tripId: id(payload.trip.id),
      placeId: placeId(sp.placeId as string),
    })),
    expenses: payload.expenses.map((e) => ({
      ...e,
      id: id(e.id),
      tripId: id(payload.trip.id),
      tripDayId: e.tripDayId ? id(e.tripDayId as string) : null,
      placeId: e.placeId ? placeId(e.placeId as string) : null,
    })),
    checklistItems: payload.checklistItems.map((c) => ({
      ...c,
      id: id(c.id),
      tripId: id(payload.trip.id),
    })),
  };
}
