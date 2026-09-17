import { eq } from 'drizzle-orm';
import { Link, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';

import { ClayFigure, categoryFigure } from '../../../../components/ClayFigure';
import PlaceMap from '../../../../components/PlaceMap';
import PlaceQuickActions from '../../../../components/PlaceQuickActions';
import { useTripWeather } from '../../../../lib/useTravelData';
import { weatherSummary } from '../../../../lib/travelTools';
import { mapData } from '../../../../lib/map';
import { Chip, Icon, IconButton, ScreenHeader } from '../../../../components/ui';
import { db } from '../../../../db';
import { appSettings, dayItems, places, tripDays, trips } from '../../../../db/schema';
import { DATE_FORMAT, settingsQuery } from '../../../../db/settings';
import { categoryLabel } from '../../../../lib/category';
import { dayMeta } from '../../../../lib/date';
import { formatKm, haversineKm } from '../../../../lib/geo';
import { groupByDay, type DaySection, type Item } from '../../../../lib/itinerary';
import { useDbQuery } from '../../../../lib/useDbQuery';
import { colors, illustration, mapStyle, rounded, sizing, spacing, type as t } from '../../../../theme';
import { useTripId } from '../../../../lib/useTripId';

export default function Itinerary() {
  const id = useTripId();
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<string>();
  const [mapExpanded, setMapExpanded] = useState(false);
  const settings = useDbQuery(settingsQuery, [appSettings], []);
  const dateFormat = settings?.find((row) => row.key === DATE_FORMAT)?.value === 'md' ? 'md' : 'ymd';

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
      <View style={s.screen}>
        <ScreenHeader title="일정" backLabel="홈으로" onBack={() => router.navigate('/')} />
        <View style={s.centered}>
          <Text style={s.emptyTitle}>여행을 찾을 수 없어요</Text>
          <Text style={s.emptyBody}>홈에서 여행을 다시 선택해 주세요.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.screen}>
      {/* 탭 화면에서 router.back() 은 이전 '탭' 으로 돌아간다. 홈으로 나가려면 명시적으로 이동한다. */}
      <ScreenHeader
        title={trip.title}
        backLabel="홈으로"
        onBack={() => router.navigate('/')}
        actions={[{ icon: 'edit', label: '일정 편집', onPress: () => router.push(`/trip/${id}/edit`) }]}
      />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.content}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View style={s.listHeader}>
            <View style={[s.mapPreview, { height: mapExpanded ? mapStyle.expandedHeight : mapStyle.collapsedHeight }]}>
              <PlaceMap {...mapData(sections)} center={trip.lat != null && trip.lng != null ? { lat: trip.lat, lng: trip.lng } : null} onPinPress={setSelectedItem} />
              <View style={s.mapActions}>
                <IconButton icon="map" label="전체 지도" floating onPress={() => router.push(`/trip/${id}/map`)} />
                <IconButton icon={mapExpanded ? 'chevron-up' : 'chevron-down'} label={mapExpanded ? '지도 접기' : '지도 펼치기'} floating onPress={() => setMapExpanded((v) => !v)} />
              </View>
            </View>

            <Link href={`/trip/${id}/tools`} style={s.dayMeta} accessibilityRole="link">{weather.error ? '날씨 연결 실패 · 도구에서 다시 시도' : '날씨: Open-Meteo · 예보와 출처 보기'}</Link>
            <View style={s.quickChips}>
              <Chip label="체크리스트" leadingIcon="check" onPress={() => router.push(`/trip/${id}/checklist`)} />
              <Chip label="가계부" leadingIcon="wallet" onPress={() => router.push(`/trip/${id}/budget`)} />
              <Chip label="AI에게 묻기" onPress={() => router.push(`/trip/${id}/chat`)} />
            </View>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={s.dayHeader}>
            <Text style={s.dayLabel}>day {section.dayIndex}</Text>
            <Text style={s.dayMeta}>{dayMeta(section.date, dateFormat)}</Text>
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
              <Icon name="plus" size={sizing.iconMd} color={colors.muted} />
              <Text style={s.addLabel}>장소 추가</Text>
            </Pressable>
          </Link>
        )}
      />
      {selectedItem && <PlaceQuickActions key={selectedItem} itemId={selectedItem} onClose={() => setSelectedItem(undefined)} />}
    </View>
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
      <ClayFigure name={categoryFigure(item.category)} size={illustration.thumb} />
      <View style={s.cardBody}>
        <Text style={s.cardTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={s.cardMeta} numberOfLines={1}>
          {[categoryLabel(item.category), item.region].filter(Boolean).join(' · ')}
        </Text>
      </View>
      {item.startTime ? (
        <View style={s.time}>
          <Icon name="clock" size={sizing.iconSm} color={colors.muted} />
          <Text style={s.cardTime}>{item.startTime}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  centered: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.gutter, gap: spacing.xxs },
  emptyTitle: { ...t.titleMd, color: colors.ink },
  emptyBody: { ...t.bodySm, color: colors.muted },

  content: { paddingHorizontal: spacing.gutter, paddingBottom: spacing.xxl },
  listHeader: { gap: spacing.sm },

  mapPreview: {
    backgroundColor: colors.surfaceCard,
    borderRadius: rounded.lg,
    overflow: 'hidden',
  },
  mapActions: { position: 'absolute', right: spacing.xs, top: spacing.xs, gap: spacing.xs },

  quickChips: { flexDirection: 'row', gap: spacing.xs },

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
  cardBody: { flexGrow: 1, flexShrink: 1 },
  cardTitle: { ...t.titleSm, color: colors.ink },
  cardMeta: { ...t.caption, color: colors.muted },
  time: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
  cardTime: { ...t.numeric, color: colors.ink },

  addRow: {
    marginTop: spacing.sm,
    minHeight: sizing.touchMin,
    borderRadius: rounded.md,
    borderWidth: sizing.hairline,
    borderColor: colors.hairline,
    borderStyle: 'dashed',
    flexDirection: 'row',
    gap: spacing.xxs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addLabel: { ...t.button, color: colors.muted },
});
