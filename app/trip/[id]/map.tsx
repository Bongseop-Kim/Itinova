import { eq } from 'drizzle-orm';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PlaceMap from '../../../components/PlaceMap';
import PlaceQuickActions from '../../../components/PlaceQuickActions';
import { Chip, ScreenHeader } from '../../../components/ui';
import { db } from '../../../db';
import { settingsQuery, setSetting } from '../../../db/settings';
import { appSettings, dayItems, places, tripDays, trips } from '../../../db/schema';
import { groupByDay } from '../../../lib/itinerary';
import { mapData } from '../../../lib/map';
import { useDbQuery } from '../../../lib/useDbQuery';
import { useTripId } from '../../../lib/useTripId';
import { colors, rounded, sizing, spacing, type as t } from '../../../theme';

export default function TripMap() {
  const id = useTripId();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [day, setDay] = useState<number>();
  const [selected, setSelected] = useState<string>();
  const trip = useDbQuery(() => db.select().from(trips).where(eq(trips.id, id)), [trips], [id])?.[0];
  const settings = useDbQuery(settingsQuery, [appSettings], []);
  const rows = useDbQuery(() => db.select({ dayId: tripDays.id, dayIndex: tripDays.dayIndex, date: tripDays.date, itemId: dayItems.id, startTime: dayItems.startTime, visited: dayItems.visited, name: places.name, category: places.category, region: places.region, lat: places.lat, lng: places.lng }).from(tripDays)
    .leftJoin(dayItems, eq(dayItems.tripDayId, tripDays.id)).leftJoin(places, eq(places.id, dayItems.placeId))
    .where(eq(tripDays.tripId, id)).orderBy(tripDays.dayIndex, dayItems.sortOrder), [tripDays, dayItems, places], [id]);
  const sections = groupByDay(rows ?? []);
  const data = mapData(sections, day);
  const shown = sections.filter((s) => day == null || s.dayIndex === day);
  const count = shown.reduce((n, s) => n + s.data.length, 0);
  return (
    <View style={[s.screen, { paddingBottom: insets.bottom }]}>
      <ScreenHeader title="전체 지도" action="닫기" onAction={() => router.back()} />
      <ScrollView horizontal style={s.filters} contentContainerStyle={s.chips} showsHorizontalScrollIndicator={false}>
        <Chip label="전체" selected={day == null} onPress={() => { setDay(undefined); setSelected(undefined); }} />
        {sections.map((section) => <Chip key={section.dayId} label={`day ${section.dayIndex}`} selected={day === section.dayIndex} onPress={() => { setDay(section.dayIndex); setSelected(undefined); }} />)}
      </ScrollView>
      {settings && !settings.some((r) => r.key === 'tip_map' && r.value === '1') && (
        <View style={s.tip}><Text style={s.body}>일차를 고르면 그날의 장소와 동선만 보여요. 핀이나 아래 장소를 눌러 시간·메모·길찾기를 열어 보세요.</Text>
          <Pressable onPress={() => setSetting('tip_map', '1')} style={s.action} accessibilityRole="button"><Text style={s.button}>알겠어요</Text></Pressable></View>
      )}
      <View style={s.map}>
        <PlaceMap {...data} center={trip?.lat != null && trip.lng != null ? { lat: trip.lat, lng: trip.lng } : null} selectedIds={selected ? [selected] : []} onPinPress={setSelected} />
        {rows && !data.pins.length && <View style={s.empty} pointerEvents="box-none"><View style={s.tip}>
          <Text style={s.title}>{count ? '위치가 등록된 장소가 없어요' : '아직 담은 장소가 없어요'}</Text>
          <Text style={s.body}>{count ? '장소 상세에서 지도 위치를 등록해 주세요.' : '장소를 추가하면 지도에 동선이 나타나요.'}</Text>
          <Pressable style={s.action} accessibilityRole="button" onPress={() => router.push(`/trip/${id}/add-place?day=${day ?? 1}`)}><Text style={s.button}>장소 추가</Text></Pressable>
        </View></View>}
      </View>
      <Text style={s.caption}>점선은 방문 순서에 따른 직선 동선이에요{count > data.pins.length ? ` · 위치 없는 장소 ${count - data.pins.length}개` : ''}</Text>
      <ScrollView style={s.places} contentContainerStyle={s.list}>
        {shown.flatMap((section) => section.data.map((item, i) => <Pressable key={item.id} style={s.action} accessibilityRole="button" onPress={() => setSelected(item.id)}><Text style={s.button}>day {section.dayIndex} · {i + 1}. {item.name}{!item.coord ? ' · 위치 없음' : ''}</Text></Pressable>))}
      </ScrollView>
      {selected && <PlaceQuickActions key={selected} itemId={selected} onClose={() => setSelected(undefined)} />}
    </View>
  );
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas }, filters: { flexGrow: 0 }, chips: { paddingHorizontal: spacing.gutter, paddingVertical: spacing.xs, gap: spacing.xs },
  map: { flex: 1 }, tip: { marginHorizontal: spacing.gutter, padding: spacing.md, gap: spacing.xs, backgroundColor: colors.canvas, borderRadius: rounded.lg },
  empty: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center' }, title: { ...t.titleMd, color: colors.ink }, body: { ...t.bodySm, color: colors.muted },
  caption: { ...t.caption, color: colors.muted, padding: spacing.sm }, action: { minHeight: sizing.touchMin, justifyContent: 'center' }, button: { ...t.button, color: colors.ink },
  places: { flexGrow: 0, maxHeight: '25%' }, list: { paddingHorizontal: spacing.gutter, paddingBottom: spacing.sm },
});
