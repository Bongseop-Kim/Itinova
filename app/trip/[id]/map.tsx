import { eq } from 'drizzle-orm';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PlaceMap from '../../../components/PlaceMap';
import PlaceQuickActions from '../../../components/PlaceQuickActions';
import { IconButton, ListRow, ScreenHeader, SegmentedControl, Tabs } from '../../../components/ui';
import { db } from '../../../db';
import { settingsQuery, setSetting } from '../../../db/settings';
import { appSettings, dayItems, places, tripDays, trips } from '../../../db/schema';
import { categoryLabel } from '../../../lib/category';
import { groupByDay, type Item } from '../../../lib/itinerary';
import { mapData } from '../../../lib/map';
import { useDbQuery } from '../../../lib/useDbQuery';
import { useTripId } from '../../../lib/useTripId';
import { colors, elevation, rounded, sizing, spacing, type as t } from '../../../theme';

const ALL = '전체';
const VIEWS = ['지도뷰', '리스트'] as const;

// S13 전체 지도. 템플릿 "지도-여행-지도뷰": 일차 탭 · 순번 핀 + 동선 · 지도 위 지도뷰/리스트 · 하단 가로 카드.
export default function TripMap() {
  const id = useTripId();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [day, setDay] = useState<number>();
  const [view, setView] = useState<(typeof VIEWS)[number]>('지도뷰');
  const [selected, setSelected] = useState<string>();
  const [cameraKey, setCameraKey] = useState(0);
  const cards = useRef<FlatList<Item & { dayIndex: number; order: number }>>(null);
  const trip = useDbQuery(() => db.select().from(trips).where(eq(trips.id, id)), [trips], [id])?.[0];
  const settings = useDbQuery(settingsQuery, [appSettings], []);
  const rows = useDbQuery(() => db.select({ dayId: tripDays.id, dayIndex: tripDays.dayIndex, date: tripDays.date, itemId: dayItems.id, startTime: dayItems.startTime, visited: dayItems.visited, name: places.name, category: places.category, region: places.region, lat: places.lat, lng: places.lng }).from(tripDays)
    .leftJoin(dayItems, eq(dayItems.tripDayId, tripDays.id)).leftJoin(places, eq(places.id, dayItems.placeId))
    .where(eq(tripDays.tripId, id)).orderBy(tripDays.dayIndex, dayItems.sortOrder), [tripDays, dayItems, places], [id]);
  const sections = useMemo(() => groupByDay(rows ?? []), [rows]);
  const data = mapData(sections, day);
  const shown = sections.filter((s) => day == null || s.dayIndex === day);
  const items = shown.flatMap((section) => section.data.map((item, i) => ({ ...item, dayIndex: section.dayIndex, order: i + 1 })));
  const count = items.length;
  const cardWidth = Math.round(width * 0.7);

  // 핀을 누르면 카드가 따라간다. 카드 스크롤 → 핀 선택은 onMomentumScrollEnd 에서.
  useEffect(() => {
    const index = items.findIndex((i) => i.id === selected);
    if (index >= 0) cards.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
  }, [selected]);

  const pick = (value: string) => { setDay(value === ALL ? undefined : Number(value.replace('day ', ''))); setSelected(undefined); };
  const tabs = [ALL, ...sections.map((section) => `day ${section.dayIndex}`)];
  const center = trip?.lat != null && trip.lng != null ? { lat: trip.lat, lng: trip.lng } : null;
  const tipSeen = !settings || settings.some((r) => r.key === 'tip_map' && r.value === '1');

  return (
    <View style={s.screen}>
      <ScreenHeader title={trip?.title ?? '전체 지도'} backLabel="닫기" />
      <Tabs options={tabs} value={day == null ? ALL : `day ${day}`} onChange={pick} />

      {view === '지도뷰' ? (
        <View style={s.map}>
          <PlaceMap key={cameraKey} {...data} center={center} selectedIds={selected ? [selected] : []} onPinPress={setSelected} />
          <View style={s.overlayTop} pointerEvents="box-none">
            <SegmentedControl options={VIEWS} value={view} onChange={setView} style={s.segment} />
          </View>
          <View style={s.overlayRight} pointerEvents="box-none">
            <IconButton icon="gps" label="여행 도시로 이동" floating onPress={() => setCameraKey((k) => k + 1)} />
          </View>
          {!tipSeen && (
            <View style={s.tipWrap} pointerEvents="box-none">
              <View style={s.tip}>
                <Text style={s.body}>일차를 고르면 그날의 장소와 동선만 보여요. 핀이나 아래 카드를 눌러 시간·메모·길찾기를 열어 보세요.</Text>
                <Pressable onPress={() => setSetting('tip_map', '1')} style={s.action} accessibilityRole="button"><Text style={s.button}>알겠어요</Text></Pressable>
              </View>
            </View>
          )}
          {rows && !data.pins.length && (
            <View style={s.emptyWrap} pointerEvents="box-none">
              <View style={s.tip}>
                <Text style={s.title}>{count ? '위치가 등록된 장소가 없어요' : '아직 담은 장소가 없어요'}</Text>
                <Text style={s.body}>{count ? '장소 상세에서 지도 위치를 등록해 주세요.' : '장소를 추가하면 지도에 동선이 나타나요.'}</Text>
                <Pressable style={s.action} accessibilityRole="button" onPress={() => router.push(`/trip/${id}/add-place?day=${day ?? 1}`)}><Text style={s.button}>장소 추가</Text></Pressable>
              </View>
            </View>
          )}
          <View style={[s.cards, { paddingBottom: insets.bottom + spacing.sm }]} pointerEvents="box-none">
            <View style={s.captionWrap}>
              <Text style={s.caption}>점선은 방문 순서에 따른 직선 동선이에요{count > data.pins.length ? ` · 위치 없는 장소 ${count - data.pins.length}개` : ''}</Text>
            </View>
            <FlatList
              ref={cards}
              horizontal
              data={items}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              snapToInterval={cardWidth + spacing.xs}
              decelerationRate="fast"
              contentContainerStyle={s.cardList}
              getItemLayout={(_, index) => ({ length: cardWidth + spacing.xs, offset: (cardWidth + spacing.xs) * index, index })}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / (cardWidth + spacing.xs));
                const item = items[index];
                if (item && item.id !== selected) setSelected(item.id);
              }}
              renderItem={({ item }) => (
                <Pressable
                  style={[s.card, { width: cardWidth }, item.id === selected && s.cardSelected]}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.name} 퀵 액션`}
                  onPress={() => (item.id === selected ? setSelected(undefined) : setSelected(item.id))}
                  onLongPress={() => setSelected(item.id)}
                >
                  <View style={s.cardTop}>
                    <View style={s.badge}><Text style={s.badgeLabel} allowFontScaling={false}>{item.order}</Text></View>
                    {day == null ? <Text style={s.cardMeta}>day {item.dayIndex}</Text> : null}
                    {item.startTime ? <Text style={s.cardMeta}>{item.startTime}</Text> : null}
                  </View>
                  <Text style={s.cardTitle} numberOfLines={1}>{item.name}</Text>
                  <Text style={s.cardMeta} numberOfLines={1}>{[categoryLabel(item.category), item.region, !item.coord ? '위치 없음' : null].filter(Boolean).join(' · ')}</Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      ) : (
        <View style={s.map}>
          <SegmentedControl options={VIEWS} value={view} onChange={setView} style={s.segmentList} />
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: insets.bottom + spacing.lg }}
            renderItem={({ item }) => (
              <ListRow
                title={item.name}
                subtitle={[day == null ? `day ${item.dayIndex}` : null, categoryLabel(item.category), item.startTime, !item.coord ? '위치 없음' : null].filter(Boolean).join(' · ')}
                leading={<View style={s.badge}><Text style={s.badgeLabel} allowFontScaling={false}>{item.order}</Text></View>}
                trailing="chevron"
                onPress={() => setSelected(item.id)}
              />
            )}
          />
        </View>
      )}
      {selected && view === '지도뷰' && items.some((i) => i.id === selected) && <QuickActionGate itemId={selected} onClose={() => setSelected(undefined)} />}
      {selected && view === '리스트' && <PlaceQuickActions key={selected} itemId={selected} onClose={() => setSelected(undefined)} />}
    </View>
  );
}

/** 지도뷰에서는 카드 한 번 탭이 "선택", 같은 카드를 다시 탭하면 퀵 액션. 핀 선택만으로 시트가 뜨면 지도가 가려진다. */
function QuickActionGate({ itemId, onClose }: { itemId: string; onClose: () => void }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [itemId]);
  if (!open) {
    return (
      <View style={s.gate} pointerEvents="box-none">
        <Pressable style={s.gateButton} accessibilityRole="button" onPress={() => setOpen(true)}>
          <Text style={s.gateLabel}>시간 · 메모 · 길찾기</Text>
        </Pressable>
      </View>
    );
  }
  return <PlaceQuickActions key={itemId} itemId={itemId} onClose={onClose} />;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  map: { flex: 1 },
  overlayTop: { position: 'absolute', top: spacing.sm, left: 0, right: 0, alignItems: 'center' },
  segment: { width: 200, marginHorizontal: 0, backgroundColor: colors.canvas, boxShadow: elevation.card },
  segmentList: { marginVertical: spacing.sm },
  overlayRight: { position: 'absolute', right: spacing.gutter, bottom: 190 },
  tipWrap: { position: 'absolute', top: sizing.controlH + spacing.md, left: 0, right: 0 },
  emptyWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center' },
  tip: { marginHorizontal: spacing.gutter, padding: spacing.md, gap: spacing.xs, backgroundColor: colors.canvas, borderRadius: rounded.lg, boxShadow: elevation.card },
  title: { ...t.titleMd, color: colors.ink }, body: { ...t.bodySm, color: colors.muted },
  captionWrap: { alignSelf: 'flex-start', marginHorizontal: spacing.gutter, marginBottom: spacing.xs, paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs, borderRadius: rounded.pill, backgroundColor: colors.canvas, boxShadow: elevation.card },
  caption: { ...t.caption, color: colors.muted },
  action: { minHeight: sizing.touchMin, justifyContent: 'center' }, button: { ...t.button, color: colors.ink },

  cards: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  cardList: { paddingHorizontal: spacing.gutter, gap: spacing.xs },
  card: { backgroundColor: colors.canvas, borderRadius: rounded.lg, padding: spacing.md, gap: spacing.xxs, boxShadow: elevation.raised, borderWidth: sizing.hairline, borderColor: 'transparent' },
  cardSelected: { borderColor: colors.ink },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  badge: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  badgeLabel: { ...t.caption, color: colors.onPrimary },
  cardTitle: { ...t.titleSm, color: colors.ink }, cardMeta: { ...t.caption, color: colors.muted },

  gate: { position: 'absolute', left: 0, right: 0, bottom: 150, alignItems: 'center' },
  gateButton: { minHeight: sizing.controlHSm, paddingHorizontal: spacing.md, borderRadius: rounded.pill, backgroundColor: colors.primary, justifyContent: 'center', boxShadow: elevation.raised },
  gateLabel: { ...t.caption, color: colors.onPrimary },
});
