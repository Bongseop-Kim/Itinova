import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import PlaceMap from '../../../components/PlaceMap';
import AppleSearchBar from '../../../components/AppleSearchBar';
import { useAppleSearch } from '../../../lib/useAppleSearch';
import { appleCategory, type ApplePlace } from '../../../lib/applePlaces';
import { db } from '../../../db';
import type { LatLng } from '../../../lib/geo';
import { validCoord } from '../../../lib/map';
import { BottomCtaBar, Chip, ScreenHeader, SegmentTabs } from '../../../components/ui';
import { addPlacesToDay, createCustomPlace, storeApplePlace, savePlaces, savedPlacesQuery } from '../../../db/places';
import { places as placesTable, savedPlaces, trips } from '../../../db/schema';
import { CATEGORY_LABEL, categoryLabel, type Category } from '../../../lib/category';
import { useDbQuery } from '../../../lib/useDbQuery';
import { useTripId } from '../../../lib/useTripId';
import { colors, mapStyle, rounded, sizing, spacing, type as t } from '../../../theme';

const SOURCES = ['장소 검색', '최근 저장', '나만의 장소'] as const;
const CATEGORIES = Object.keys(CATEGORY_LABEL) as Category[];

export default function AddPlace() {
  const id = useTripId();
  const router = useRouter();
  const { day } = useLocalSearchParams<{ day?: string }>();
  const dayIndex = day ? Number(day) : undefined;

  const [coord, setCoord] = useState<LatLng | null>(null);
  const trip = useDbQuery(() => db.select().from(trips).where(eq(trips.id, id)), [trips], [id])?.[0];
  const [source, setSource] = useState<(typeof SOURCES)[number]>('장소 검색');
  const [selected, setSelected] = useState<string[]>([]);
  const [picked, setPicked] = useState<ApplePlace[]>([]);
  const confirming = useRef(false);
  const search = useAppleSearch(false, trip?.lat != null && trip.lng != null ? { lat: trip.lat, lng: trip.lng } : null);
  const toggleApple = (place: ApplePlace) => setPicked((cur) => cur.some((p) => p.applePlaceId === place.applePlaceId)
    ? cur.filter((p) => p.applePlaceId !== place.applePlaceId) : [...cur, place]);

  const saved = useDbQuery(() => savedPlacesQuery(id), [savedPlaces, placesTable], [id]);
  const pickedKeys = new Set(picked.map((p) => p.applePlaceId));
  const count = picked.length + selected.filter((key) => !pickedKeys.has(saved?.find((p) => p.placeId === key)?.applePlaceId ?? '')).length;

  const toggle = (placeId: string) =>
    setSelected((cur) => (cur.includes(placeId) ? cur.filter((x) => x !== placeId) : [...cur, placeId]));

  const confirm = () => {
    if (confirming.current || !count) return;
    confirming.current = true;
    try {
      const ids = [...new Set([...selected, ...picked.map(storeApplePlace)])];
      if (dayIndex) addPlacesToDay(id, dayIndex, ids);
      else savePlaces(id, ids);
      if (router.canGoBack()) router.back();
      else router.replace(dayIndex ? `/trip/${id}/itinerary` : `/trip/${id}/saved`);
    } catch {
      confirming.current = false;
      Alert.alert('장소를 담지 못했어요', '다시 시도해 주세요.');
    }
  };

  return (
    <View style={s.screen}>
      <ScreenHeader title={dayIndex ? `day ${dayIndex}에 담기` : '저장함에 담기'} />

      <View style={s.map}>
        <PlaceMap
          pins={source === '장소 검색' ? search.results.map((p, i) => ({ id: p.applePlaceId, title: p.name, order: i + 1, coord: { lat: p.lat, lng: p.lng } })) : source === '나만의 장소' ? (coord ? [{ id: 'custom', title: '선택한 위치', order: 1, coord }] : []) : (saved ?? []).flatMap((p, i) => validCoord(p.lat, p.lng) ? [{ id: p.placeId, title: p.name, order: i + 1, coord: { lat: p.lat!, lng: p.lng! } }] : [])}
          center={trip?.lat != null && trip.lng != null ? { lat: trip.lat, lng: trip.lng } : null}
          selectedIds={source === '장소 검색' ? picked.map((p) => p.applePlaceId) : source === '나만의 장소' ? ['custom'] : selected}
          onPinPress={source === '장소 검색' ? (key) => { const p = search.results.find((p) => p.applePlaceId === key); if (p) toggleApple(p); } : source === '최근 저장' ? toggle : undefined}
          onPick={source === '나만의 장소' ? setCoord : undefined}
        />
      </View>
      <SegmentTabs options={SOURCES} value={source} onChange={setSource} />

      {source === '장소 검색' ? (
        <>
          <AppleSearchBar search={search} placeholder={`${trip?.cityName ?? '여행지'} 장소 검색`} />
          {!!picked.length && <View>
            <ScrollView horizontal contentContainerStyle={s.picked} showsHorizontalScrollIndicator={false}>
              {picked.map((p) => <Chip key={p.applePlaceId} label={`${p.name} · 해제`} selected onPress={() => toggleApple(p)} />)}
            </ScrollView>
          </View>}
          <FlatList
            data={search.results}
            keyExtractor={(p) => p.applePlaceId}
            contentContainerStyle={s.list}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={!search.loading && !search.error ? <Text style={s.emptyBody}>
              {search.searched ? '검색 결과가 없어요. 다른 이름으로 검색해 주세요.' : '관광지, 식당, 숙소 이름을 검색해 주세요.'}
            </Text> : null}
            renderItem={({ item }) => {
              const checked = picked.some((p) => p.applePlaceId === item.applePlaceId);
              return <Pressable onPress={() => toggleApple(item)} style={s.row}
                accessibilityRole="checkbox" accessibilityState={{ checked }}>
                <View style={s.rowBody}>
                  <Text style={s.rowTitle}>{item.name}</Text>
                  <Text style={s.rowMeta}>{categoryLabel(appleCategory(item.poiCategory))} · {item.address}</Text>
                </View>
                <Text style={[s.pick, checked && s.pickOn]}>{checked ? '선택됨' : '선택'}</Text>
              </Pressable>;
            }}
          />
        </>
      ) : source === '최근 저장' ? (
        <FlatList
          data={saved ?? []}
          keyExtractor={(p) => p.placeId}
          contentContainerStyle={s.list}
          ListEmptyComponent={
            <View style={s.empty}>
              <View style={s.emptyFigure} />
              <Text style={s.emptyTitle}>저장한 장소가 없어요</Text>
              <Text style={s.emptyBody}>나만의 장소 탭에서 직접 추가할 수 있어요</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => toggle(item.placeId)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected.includes(item.placeId) }}
              style={s.row}
            >
              <View style={s.rowBody}>
                <Text style={s.rowTitle}>{item.name}</Text>
                <Text style={s.rowMeta}>
                  {[categoryLabel(item.category), item.region].filter(Boolean).join(' · ')}
                </Text>
              </View>
              <Text style={[s.pick, selected.includes(item.placeId) && s.pickOn]}>
                {selected.includes(item.placeId) ? '선택됨' : '선택'}
              </Text>
            </Pressable>
          )}
        />
      ) : (
        <CustomPlaceForm
          coord={coord}
          onClearCoord={() => setCoord(null)}
          onCreate={(placeId) => {
            setSelected((cur) => [...cur, placeId]);
            setSource('최근 저장');
            setCoord(null);
            savePlaces(id, [placeId]); // 만든 장소는 보관함에도 남긴다
          }}
        />
      )}

      <BottomCtaBar
        label={
          dayIndex
            ? `day ${dayIndex} 일정에 ${count}개 담기`
            : `저장함에 ${count}개 담기`
        }
        disabled={!count}
        onPress={confirm}
      />
    </View>
  );
}

function CustomPlaceForm({ onCreate, coord, onClearCoord }: { onCreate: (placeId: string) => void; coord: LatLng | null; onClearCoord: () => void }) {
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [category, setCategory] = useState<Category>('attraction');

  const submit = () => {
    if (!name.trim()) return;
    try {
      onCreate(createCustomPlace({ name, category, region, coord }));
      setName('');
      setRegion('');
    } catch { Alert.alert('장소를 만들지 못했어요', '입력 내용을 확인하고 다시 시도해 주세요.'); }
  };

  return (
    <ScrollView contentContainerStyle={s.form} keyboardShouldPersistTaps="handled">
      <Text style={s.rowMeta}>{coord ? `선택한 위치: ${coord.lat.toFixed(5)}, ${coord.lng.toFixed(5)}` : '위 지도를 눌러 장소의 위치를 선택해 주세요 (선택)'}</Text>
      {coord && <Pressable style={s.add} onPress={onClearCoord} accessibilityRole="button"><Text style={s.addLabel}>위치 선택 해제</Text></Pressable>}
      <TextInput
        style={s.input}
        value={name}
        onChangeText={setName}
        placeholder="장소 이름"
        placeholderTextColor={colors.mutedSoft}
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      <TextInput
        style={s.input}
        value={region}
        onChangeText={setRegion}
        placeholder="지역 (선택)"
        placeholderTextColor={colors.mutedSoft}
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      <View style={s.chips}>
        {CATEGORIES.map((c) => (
          <Chip
            key={c}
            label={CATEGORY_LABEL[c]}
            selected={category === c}
            onPress={() => setCategory(c)}
          />
        ))}
      </View>
      <Pressable
        onPress={submit}
        disabled={!name.trim()}
        accessibilityRole="button"
        style={[s.add, !name.trim() && s.addDisabled]}
      >
        <Text style={[s.addLabel, !name.trim() && s.addLabelDisabled]}>장소 만들기</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  map: { height: mapStyle.collapsedHeight, marginHorizontal: spacing.gutter, borderRadius: rounded.lg, overflow: 'hidden', marginBottom: spacing.sm },
  screen: { flex: 1, backgroundColor: colors.canvas },

  list: { paddingHorizontal: spacing.gutter, paddingTop: spacing.sm, paddingBottom: spacing.lg },
  picked: { paddingHorizontal: spacing.gutter, gap: spacing.xs, paddingBottom: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: sizing.touchMin,
    paddingVertical: spacing.sm,
    borderBottomWidth: sizing.hairline,
    borderBottomColor: colors.hairlineSoft,
  },
  rowBody: { flexGrow: 1, flexShrink: 1 },
  rowTitle: { ...t.titleSm, color: colors.ink },
  rowMeta: { ...t.caption, color: colors.muted },
  pick: {
    ...t.caption,
    color: colors.muted,
    borderWidth: sizing.hairline,
    borderColor: colors.hairline,
    borderRadius: rounded.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    overflow: 'hidden',
  },
  pickOn: { backgroundColor: colors.primary, borderColor: colors.primary, color: colors.onPrimary },

  empty: { alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingTop: spacing.xxl },
  emptyFigure: {
    width: 160,
    height: 160,
    borderRadius: rounded.xl,
    backgroundColor: colors.surfaceCard,
    marginBottom: spacing.xs,
  },
  emptyTitle: { ...t.titleMd, color: colors.ink },
  emptyBody: { ...t.bodySm, color: colors.muted, textAlign: 'center' },

  form: { flexGrow: 1, paddingHorizontal: spacing.gutter, paddingTop: spacing.md, gap: spacing.sm },
  input: {
    ...t.bodyMd,
    color: colors.ink,
    minHeight: sizing.controlH,
    borderRadius: rounded.md,
    borderWidth: sizing.hairline,
    borderColor: colors.hairline,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.canvas,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  add: {
    minHeight: sizing.controlH,
    borderRadius: rounded.md,
    borderWidth: sizing.hairline,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  addDisabled: { borderColor: colors.hairlineSoft },
  addLabel: { ...t.button, color: colors.ink },
  addLabelDisabled: { color: colors.mutedSoft },
});
