import { desc } from 'drizzle-orm';
import { Redirect, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';

import { ClayFigure } from '../components/ClayFigure';
import { Badge, BottomCtaBar, ScreenHeader, SectionHeader, Tabs } from '../components/ui';
import { db } from '../db';
import { appSettings, trips } from '../db/schema';
import { DATE_FORMAT, ONBOARDED, settingsQuery } from '../db/settings';
import { todayISO, tripLength } from '../lib/calendar';
import { dateRangeLabel, dayMeta, ddayLabel, tripBucket, type Bucket, type DateFormat } from '../lib/date';
import { useDbQuery } from '../lib/useDbQuery';
import { colors, illustration, elevation, rounded, spacing, type as t } from '../theme';

type Trip = { id: string; title: string; startDate: string; endDate: string; cityName: string };
const TABS = ['다가오는', '지난'] as const;

export default function Home() {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]>('다가오는');

  const settings = useDbQuery(() => settingsQuery(), [appSettings], []);

  const rows = useDbQuery(
    () =>
      db
        .select({
          id: trips.id,
          title: trips.title,
          startDate: trips.startDate,
          endDate: trips.endDate,
          cityName: trips.cityName,
        })
        .from(trips)
        .orderBy(desc(trips.startDate)),
    [trips],
    [],
  );

  // 첫 실행이면 온보딩으로. settings 가 undefined 인 동안은 아무것도 그리지 않는다
  // (로컬 SQLite 는 즉시 반환하므로 깜빡임이 없다).
  const onboarded = settings?.some((row) => row.key === ONBOARDED && row.value === '1');
  const dateFormat: DateFormat = settings?.find((row) => row.key === DATE_FORMAT)?.value === 'md' ? 'md' : 'ymd';

  const today = todayISO();
  const buckets = useMemo(() => {
    const out: Record<Bucket, Trip[]> = { ongoing: [], upcoming: [], past: [] };
    for (const trip of rows ?? []) out[tripBucket(trip.startDate, trip.endDate, today)].push(trip);
    // 다가오는 여행은 가까운 순서로
    out.upcoming.reverse();
    return out;
  }, [rows, today]);

  // 템플릿 "나의 여행": 연도 그룹 헤더 + 날짜 라벨 + 카드
  const sections = useMemo(() => {
    const list = tab === '다가오는' ? buckets.upcoming : buckets.past;
    const byYear = new Map<string, Trip[]>();
    for (const trip of list) {
      const year = trip.startDate.slice(0, 4);
      byYear.set(year, [...(byYear.get(year) ?? []), trip]);
    }
    return [...byYear].map(([year, data]) => ({ title: `${year}년`, data }));
  }, [buckets, tab]);

  const empty = !rows?.length;

  if (!settings) return <View style={s.screen} />;
  if (!onboarded) return <Redirect href="/onboarding" />;

  return (
    <View style={s.screen}>
      <ScreenHeader
        title="Itinova"
        largeTitle
        back={false}
        actions={[{ icon: 'settings', label: '앱 설정', onPress: () => router.push('/settings') }]}
      />

      {empty ? (
        <View style={s.empty}>
          <ClayFigure name="hero" size={illustration.hero} />
          <Text style={s.emptyTitle}>아직 여행이 없어요</Text>
          <Text style={s.emptyBody}>
            도시와 날짜만 정하면{'\n'}일차별 일정이 바로 만들어집니다
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(trip) => trip.id}
          contentContainerStyle={s.content}
          stickySectionHeadersEnabled={false}
          ListHeaderComponent={
            <View style={s.listHeader}>
              {buckets.ongoing.map((trip) => (
                <ActiveTripCard
                  key={trip.id}
                  trip={trip}
                  today={today}
                  onPress={() => router.push(`/trip/${trip.id}/itinerary`)}
                  dateFormat={dateFormat}
                />
              ))}
              <Tabs
                options={[
                  { value: TABS[0], count: buckets.upcoming.length },
                  { value: TABS[1], count: buckets.past.length },
                ]}
                value={tab}
                onChange={setTab}
              />
            </View>
          }
          renderSectionHeader={({ section }) => <SectionHeader title={section.title} />}
          renderItem={({ item: trip }) => (
            <View style={s.cardWrap}>
              {/* 연도는 섹션 헤더가 이미 말한다 — 행 라벨은 월/일만 */}
              <Text style={s.dateLabel}>{dayMeta(trip.startDate, 'md')}</Text>
              <Pressable
                onPress={() => router.push(`/trip/${trip.id}/itinerary`)}
                accessibilityRole="button"
                style={({ pressed }) => [s.card, pressed && s.cardPressed]}
              >
                <View style={s.cardTop}>
                  <Badge label={tab === '다가오는' ? ddayLabel(trip.startDate, today) : '지난 여행'} />
                  <Text style={s.cardCity} numberOfLines={1}>
                    {trip.cityName}
                  </Text>
                </View>
                <Text style={s.cardTitle} numberOfLines={1}>
                  {trip.title}
                </Text>
                <Text style={s.cardMeta}>
                  {dateRangeLabel(trip.startDate, trip.endDate, dateFormat)} · {tripLength(trip.startDate, trip.endDate)}
                </Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={
            <Text style={s.tabEmpty}>{tab === '다가오는' ? '다가오는 여행이 없어요.' : '지난 여행이 없어요.'}</Text>
          }
        />
      )}

      <BottomCtaBar label="여행 일정짜기" onPress={() => router.push('/create')} />
    </View>
  );
}

/** 진행중 1건만 채도 카드로 승격한다 — 화면에서 눈이 갈 곳을 하나로 고정 (design-system §카드). */
function ActiveTripCard({
  trip,
  today,
  onPress,
  dateFormat,
}: {
  trip: Trip;
  today: string;
  onPress: () => void;
  dateFormat: DateFormat;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={s.activeCard}>
      <Badge label="여행 중" tone="accent" />
      <Text style={s.activeTitle}>{trip.title}</Text>
      <Text style={s.activeMeta}>
        {trip.cityName} · {dateRangeLabel(trip.startDate, trip.endDate, dateFormat)} · {ddayLabel(trip.startDate, today)}
      </Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },

  content: { paddingBottom: spacing.xl },
  listHeader: { gap: spacing.sm },

  activeCard: {
    backgroundColor: colors.brandTeal,
    borderRadius: rounded.xl,
    padding: spacing.lg,
    gap: spacing.xxs,
    marginHorizontal: spacing.gutter,
    alignItems: 'flex-start',
  },
  activeTitle: { ...t.displaySm, color: colors.onDark, paddingTop: spacing.xxs },
  activeMeta: { ...t.caption, color: colors.onDarkSoft },

  cardWrap: { paddingHorizontal: spacing.gutter, paddingBottom: spacing.sm, gap: spacing.xxs },
  dateLabel: { ...t.caption, color: colors.muted },
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: rounded.lg,
    padding: spacing.md,
    gap: spacing.xxs,
    boxShadow: elevation.card,
  },
  cardPressed: { backgroundColor: colors.surfaceStrong },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  cardCity: { ...t.caption, color: colors.muted, flexShrink: 1 },
  cardTitle: { ...t.titleLg, color: colors.ink },
  cardMeta: { ...t.caption, color: colors.muted },
  tabEmpty: { ...t.bodySm, color: colors.muted, paddingHorizontal: spacing.gutter, paddingTop: spacing.lg },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.gutter,
  },
  emptyTitle: { ...t.displayLg, color: colors.ink, textAlign: 'center' },
  emptyBody: { ...t.bodySm, color: colors.muted, textAlign: 'center' },
});
