import { eq } from 'drizzle-orm';
import { Link, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PlaceMap from '../../../../components/PlaceMap';
import PlaceQuickActions from '../../../../components/PlaceQuickActions';
import { useTripWeather } from '../../../../lib/useTravelData';
import { weatherSummary } from '../../../../lib/travelTools';
import { mapData } from '../../../../lib/map';
import { type Href } from '../../../../components/ui';
import { db } from '../../../../db';
import { dayItems, places, tripDays, trips } from '../../../../db/schema';
import { categoryLabel } from '../../../../lib/category';
import { dayMeta } from '../../../../lib/date';
import { formatKm, haversineKm } from '../../../../lib/geo';
import { groupByDay, type DaySection, type Item } from '../../../../lib/itinerary';
import { useDbQuery } from '../../../../lib/useDbQuery';
import { colors, mapStyle, rounded, sizing, spacing, type as t } from '../../../../theme';
import { useTripId } from '../../../../lib/useTripId';

export default function Itinerary() {
  const id = useTripId();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedItem, setSelectedItem] = useState<string>();
  const [mapExpanded, setMapExpanded] = useState(false);

  const tripRows = useDbQuery(() => db.select().from(trips).where(eq(trips.id, id)), [trips], [id]);
  const rows = useDbQuery(
    () =>
      db
      .select({
        dayId: tripDays.id,
        dayIndex: tripDays.dayIndex,
        date: tripDays.date,
        itemId: dayItems.id,
        startTime: dayItems.startTime,
        visited: dayItems.visited,
        name: places.name,
        category: places.category,
        region: places.region,
        lat: places.lat,
        lng: places.lng,
      })
      .from(tripDays)
      .leftJoin(dayItems, eq(dayItems.tripDayId, tripDays.id))
      .leftJoin(places, eq(places.id, dayItems.placeId))
      .where(eq(tripDays.tripId, id))
      .orderBy(tripDays.dayIndex, dayItems.sortOrder),
    [tripDays, dayItems, places],
    [id],
  );

  const trip = tripRows?.[0];
  const weather = useTripWeather(trip);

  const sections = useMemo<DaySection[]>(() => groupByDay(rows ?? []), [rows]);

  if (!trip) {
    return (
      <View style={[s.screen, s.centered, { paddingTop: insets.top }]}>
        <Text style={s.emptyTitle}>여행을 찾을 수 없어요</Text>
        <Text style={s.emptyBody}>홈에서 여행을 다시 선택해 주세요.</Text>
      </View>
    );
  }

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.header}>
        {/* 탭 화면에서 router.back() 은 이전 '탭' 으로 돌아간다. 홈으로 나가려면 명시적으로 이동한다. */}
        <Pressable onPress={() => router.navigate('/')} hitSlop={10} accessibilityRole="button" accessibilityLabel="홈으로">
          <Text style={s.headerBack}>홈</Text>
        </Pressable>
        <Text style={s.headerTitle} numberOfLines={1}>
          {trip.title}
        </Text>
        <Link href={`/trip/${id}/edit`} style={s.headerAction} accessibilityRole="link">
          편집
        </Link>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.content}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View style={s.listHeader}>
            <View style={[s.mapPreview, { height: mapExpanded ? mapStyle.expandedHeight : mapStyle.collapsedHeight }]}>
              <PlaceMap {...mapData(sections)} center={trip.lat != null && trip.lng != null ? { lat: trip.lat, lng: trip.lng } : null} onPinPress={setSelectedItem} />
            </View>
            <View style={s.quickChips}>
              <QuickChip href={`/trip/${id}/map`} label="전체 지도" />
              <Pressable accessibilityRole="button" onPress={() => setMapExpanded((v) => !v)} style={s.chip}>
                <Text style={s.chipLabel}>{mapExpanded ? '지도 접기' : '지도 펼치기'}</Text>
              </Pressable>
            </View>

            <Link href={`/trip/${id}/tools`} style={s.dayMeta} accessibilityRole="link">{weather.error ? '날씨 연결 실패 · 도구에서 다시 시도' : '날씨: Open-Meteo · 예보와 출처 보기'}</Link>
            <View style={s.quickChips}>
              <QuickChip href={`/trip/${id}/checklist`} label="체크리스트" />
              <QuickChip href={`/trip/${id}/budget`} label="가계부" />
              <QuickChip href={`/trip/${id}/chat`} label="AI에게 묻기" />
            </View>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={s.dayHeader}>
            <Text style={s.dayLabel}>day {section.dayIndex}</Text>
            <Text style={s.dayMeta}>{dayMeta(section.date)}</Text>
            {weather.data?.days.find((day) => day.date === section.date) && <Text style={s.dayMeta}>{weatherSummary(weather.data.days.find((day) => day.date === section.date)!)}</Text>}
          </View>
        )}
        renderItem={({ item, index, section }) => {
          const prev = index > 0 ? section.data[index - 1] : undefined;
          const gap =
            prev?.coord && item.coord ? formatKm(haversineKm(prev.coord, item.coord)) : null;
          return (
            <View>
              {gap ? <Text style={s.distance}>{gap}</Text> : null}
              <ItineraryCard item={item} order={index + 1} onPress={() => setSelectedItem(item.id)} />
            </View>
          );
        }}
        renderSectionFooter={({ section }) => (
          <Link href={`/trip/${id}/add-place?day=${section.dayIndex}`} asChild>
            <Pressable style={s.addRow} accessibilityRole="button">
              <Text style={s.addLabel}>장소 추가</Text>
            </Pressable>
          </Link>
        )}
      />
      {selectedItem && <PlaceQuickActions key={selectedItem} itemId={selectedItem} onClose={() => setSelectedItem(undefined)} />}
    </View>
  );
}

function QuickChip({ href, label }: { href: Href; label: string }) {
  return (
    <Link href={href} asChild>
      <Pressable style={s.chip} accessibilityRole="button">
        <Text style={s.chipLabel}>{label}</Text>
      </Pressable>
    </Link>
  );
}

function ItineraryCard({ item, order, onPress }: { item: Item; order: number; onPress: () => void }) {
  return (
    <Pressable style={s.card} onPress={onPress} accessibilityRole="button">
      <View style={s.badge}>
        <Text style={s.badgeLabel} allowFontScaling={false}>
          {order}
        </Text>
      </View>
      <View style={s.thumb} />
      <View style={s.cardBody}>
        <Text style={s.cardTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={s.cardMeta} numberOfLines={1}>
          {[categoryLabel(item.category), item.region].filter(Boolean).join(' · ')}
        </Text>
      </View>
      {item.startTime ? <Text style={s.cardTime}>{item.startTime}</Text> : null}
    </Pressable>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  centered: { justifyContent: 'center', paddingHorizontal: spacing.gutter, gap: spacing.xxs },
  emptyTitle: { ...t.titleMd, color: colors.ink },
  emptyBody: { ...t.bodySm, color: colors.muted },

  header: {
    minHeight: sizing.headerH,
    paddingHorizontal: spacing.gutter,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerBack: { ...t.button, color: colors.muted, minHeight: sizing.touchMin, lineHeight: sizing.touchMin },
  headerTitle: { ...t.titleLg, color: colors.ink, flexGrow: 1 },
  headerAction: { ...t.button, color: colors.ink, minHeight: sizing.touchMin, lineHeight: sizing.touchMin },

  content: { paddingHorizontal: spacing.gutter, paddingBottom: spacing.xxl },
  listHeader: { gap: spacing.sm },

  mapPreview: {
    backgroundColor: colors.surfaceCard,
    borderRadius: rounded.lg,
    overflow: 'hidden',
  },

  quickChips: { flexDirection: 'row', gap: spacing.xs },
  chip: {
    minHeight: sizing.controlHSm,
    paddingHorizontal: spacing.md,
    borderRadius: rounded.pill,
    borderWidth: sizing.hairline,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipLabel: { ...t.caption, color: colors.muted },

  dayHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: spacing.xs,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  dayLabel: { ...t.titleMd, color: colors.ink },
  dayMeta: { ...t.caption, color: colors.muted },

  // 카드 사이 여백에 텍스트만. 배경 없음 — 이게 이 화면의 시그니처다.
  distance: { ...t.caption, color: colors.muted, paddingVertical: spacing.xs, paddingLeft: spacing.md },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.canvas,
    borderRadius: rounded.lg,
    borderWidth: sizing.hairline,
    borderColor: colors.hairline,
    padding: spacing.sm,
    minHeight: sizing.touchMin,
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLabel: { ...t.caption, color: colors.onPrimary },
  thumb: { width: 44, height: 44, borderRadius: rounded.md, backgroundColor: colors.surfaceCard },
  cardBody: { flexGrow: 1, flexShrink: 1 },
  cardTitle: { ...t.titleSm, color: colors.ink },
  cardMeta: { ...t.caption, color: colors.muted },
  cardTime: { ...t.numeric, color: colors.ink },

  addRow: {
    marginTop: spacing.sm,
    minHeight: sizing.touchMin,
    borderRadius: rounded.md,
    borderWidth: sizing.hairline,
    borderColor: colors.hairline,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addLabel: { ...t.button, color: colors.muted },
});
