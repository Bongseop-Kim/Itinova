import { desc } from 'drizzle-orm';
import { Redirect, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomCtaBar } from '../components/ui';
import { db } from '../db';
import { appSettings, trips } from '../db/schema';
import { ONBOARDED, settingsQuery } from '../db/settings';
import { todayISO } from '../lib/calendar';
import { ddayLabel, tripBucket, type Bucket } from '../lib/date';
import { useDbQuery } from '../lib/useDbQuery';
import { colors, elevation, rounded, spacing, type as t } from '../theme';

type Trip = { id: string; title: string; startDate: string; endDate: string; cityName: string };

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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

  const today = todayISO();
  const buckets = useMemo(() => {
    const out: Record<Bucket, Trip[]> = { ongoing: [], upcoming: [], past: [] };
    for (const trip of rows ?? []) out[tripBucket(trip.startDate, trip.endDate, today)].push(trip);
    // 다가오는 여행은 가까운 순서로
    out.upcoming.reverse();
    return out;
  }, [rows, today]);

  const empty = !rows?.length;

  if (!settings) return <View style={s.screen} />;
  if (!onboarded) return <Redirect href="/onboarding" />;

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Text style={s.brand}>Itinova</Text>
        <Pressable
          onPress={() => router.push('/settings')}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="앱 설정"
        >
          <Text style={s.headerAction}>설정</Text>
        </Pressable>
      </View>

      {empty ? (
        // E01 — 일러스트 자리를 확보해 둔다 (design-system §자산 로드맵 2번)
        <View style={s.empty}>
          <View style={s.emptyFigure} />
          <Text style={s.emptyTitle}>아직 여행이 없어요</Text>
          <Text style={s.emptyBody}>
            도시와 날짜만 정하면{'\n'}일차별 일정이 바로 만들어집니다
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.content}>
          {buckets.ongoing.map((trip) => (
            <ActiveTripCard
              key={trip.id}
              trip={trip}
              today={today}
              onPress={() => router.push(`/trip/${trip.id}/itinerary`)}
            />
          ))}

          <Section title="다가오는 여행" trips={buckets.upcoming} today={today} router={router} />
          <Section title="지난 여행" trips={buckets.past} today={today} router={router} />
        </ScrollView>
      )}

      <BottomCtaBar label="여행 일정짜기" onPress={() => router.push('/create')} />
    </View>
  );
}

function Section({
  title,
  trips: list,
  today,
  router,
}: {
  title: string;
  trips: Trip[];
  today: string;
  router: ReturnType<typeof useRouter>;
}) {
  if (!list.length) return null;
  return (
    <View style={s.section}>
      <Text style={s.sectionLabel}>{title}</Text>
      {list.map((trip) => (
        <Pressable
          key={trip.id}
          onPress={() => router.push(`/trip/${trip.id}/itinerary`)}
          accessibilityRole="button"
          style={s.card}
        >
          <Text style={s.cardTitle}>{trip.title}</Text>
          <Text style={s.cardMeta}>
            {ddayLabel(trip.startDate, today)} · {trip.startDate} ~ {trip.endDate}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

/** 진행중 1건만 채도 카드로 승격한다 — 화면에서 눈이 갈 곳을 하나로 고정 (design-system §카드). */
function ActiveTripCard({
  trip,
  today,
  onPress,
}: {
  trip: Trip;
  today: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={s.activeCard}>
      <Text style={s.activeDday}>{ddayLabel(trip.startDate, today)}</Text>
      <Text style={s.activeTitle}>{trip.title}</Text>
      <Text style={s.activeMeta}>
        {trip.startDate} ~ {trip.endDate}
      </Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.gutter,
    minHeight: 56,
  },
  brand: { ...t.titleLg, color: colors.ink, flexGrow: 1 },
  headerAction: { ...t.button, color: colors.muted, minHeight: 44, lineHeight: 44 },

  content: { paddingHorizontal: spacing.gutter, paddingBottom: spacing.xl, gap: spacing.sm },

  activeCard: {
    backgroundColor: colors.brandTeal,
    borderRadius: rounded.xl,
    padding: spacing.lg,
    gap: spacing.xxs,
    marginTop: spacing.xs,
  },
  activeDday: { ...t.caption, color: colors.onDarkSoft },
  activeTitle: { ...t.displaySm, color: colors.onDark },
  activeMeta: { ...t.caption, color: colors.onDarkSoft },

  section: { paddingTop: spacing.lg, gap: spacing.xs },
  sectionLabel: { ...t.captionUpper, color: colors.muted },
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: rounded.lg,
    padding: spacing.md,
    gap: 2,
    boxShadow: elevation.card,
  },
  cardTitle: { ...t.titleLg, color: colors.ink },
  cardMeta: { ...t.caption, color: colors.muted },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.gutter,
  },
  emptyFigure: {
    width: 160,
    height: 160,
    borderRadius: rounded.xl,
    backgroundColor: colors.surfaceCard,
    marginBottom: spacing.xs,
  },
  emptyTitle: { ...t.titleMd, color: colors.ink },
  emptyBody: { ...t.bodySm, color: colors.muted, textAlign: 'center' },
});
