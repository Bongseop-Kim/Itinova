import { desc } from 'drizzle-orm';
import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CityScene } from '../components/CityScene';
import { ClayFigure } from '../components/ClayFigure';
import { Badge, BottomCtaBar, IconButton, ListRow, ScreenHeader, SectionHeader } from '../components/ui';
import { db } from '../db';
import { appSettings, expenses as expenseTable, trips } from '../db/schema';
import { DATE_FORMAT, ONBOARDED, settingsQuery } from '../db/settings';
import { todayISO, tripDayNumber, tripLength } from '../lib/calendar';
import { dateRangeLabel, ddayLabel, tripBucket, weekdayLabel, type Bucket, type DateFormat } from '../lib/date';
import { formatAmount, sumByCurrency } from '../lib/expense';
import { useDbQuery } from '../lib/useDbQuery';
import { colors, illustration, rounded, spacing, type as t } from '../theme';

type Trip = { id: string; title: string; startDate: string; endDate: string; cityName: string };

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const settings = useDbQuery(() => settingsQuery(), [appSettings], []);
  const rows = useDbQuery(
    () => db.select({ id: trips.id, title: trips.title, startDate: trips.startDate, endDate: trips.endDate, cityName: trips.cityName })
      .from(trips).orderBy(desc(trips.startDate)),
    [trips],
    [],
  );
  const expenseRows = useDbQuery(
    () => db.select({ tripId: expenseTable.tripId, currency: expenseTable.currency, amount: expenseTable.amount }).from(expenseTable),
    [expenseTable],
    [],
  );

  const onboarded = settings?.some((row) => row.key === ONBOARDED && row.value === '1');
  const dateFormat: DateFormat = settings?.find((row) => row.key === DATE_FORMAT)?.value === 'md' ? 'md' : 'ymd';
  const today = todayISO();
  const buckets = useMemo(() => {
    const out: Record<Bucket, Trip[]> = { ongoing: [], upcoming: [], past: [] };
    for (const trip of rows ?? []) out[tripBucket(trip.startDate, trip.endDate, today)].push(trip);
    out.upcoming.reverse();
    return out;
  }, [rows, today]);
  const totals = useMemo(() => {
    const grouped = new Map<string, { currency: string; amount: number }[]>();
    for (const row of expenseRows ?? []) grouped.set(row.tripId, [...(grouped.get(row.tripId) ?? []), row]);
    return new Map([...grouped].map(([tripId, list]) => [tripId, sumByCurrency(list)]));
  }, [expenseRows]);

  const [activeTrip, ...alsoOngoing] = buckets.ongoing;
  const heroTrip = activeTrip ?? buckets.upcoming[0];
  const upcoming = activeTrip ? [...alsoOngoing, ...buckets.upcoming] : [...alsoOngoing, ...buckets.upcoming.slice(1)];
  const empty = !rows?.length;

  if (!settings) return <View style={s.screen} />;
  if (!onboarded) return <Redirect href="/onboarding" />;

  const openTrip = (trip: Trip) => router.push(`/trip/${trip.id}/itinerary`);
  return (
    <View style={s.screen}>
      <StatusBar style={heroTrip ? 'light' : 'dark'} />
      {empty ? (
        <>
          <ScreenHeader title="내 여행" overline={weekdayLabel(today)} largeTitle back={false}
            actions={[{ icon: 'settings', label: '앱 설정', onPress: () => router.push('/settings') }]} />
          <View style={s.empty}>
            <ClayFigure name="hero" size={illustration.hero} />
            <Text style={s.emptyTitle}>아직 여행이 없어요</Text>
            <Text style={s.emptyBody}>도시와 날짜만 정하면{`\n`}일차별 일정이 바로 만들어집니다</Text>
          </View>
        </>
      ) : (
        <>
          {!heroTrip ? (
            <ScreenHeader title="내 여행" overline={weekdayLabel(today)} largeTitle back={false}
              actions={[{ icon: 'settings', label: '앱 설정', onPress: () => router.push('/settings') }]} />
          ) : null}
          <FlatList
            data={buckets.past}
            keyExtractor={(trip) => trip.id}
            contentContainerStyle={s.content}
            ListHeaderComponent={
              <>
                {heroTrip ? (
                  <Hero trip={heroTrip} label={activeTrip ? `여행 중 · ${tripDayNumber(heroTrip.startDate, today)}일차` : ddayLabel(heroTrip.startDate, today)}
                    dateFormat={dateFormat} topInset={insets.top} onPress={() => openTrip(heroTrip)}
                    onSettings={() => router.push('/settings')} />
                ) : null}
                <SectionHeader title="다가오는 여행" meta={String(upcoming.length)} />
                {upcoming.length ? (
                  <FlatList horizontal data={upcoming} keyExtractor={(trip) => trip.id} showsHorizontalScrollIndicator={false}
                    contentContainerStyle={s.carousel} renderItem={({ item, index }) => (
                      <SceneCard trip={item} label={index < alsoOngoing.length ? '여행 중' : ddayLabel(item.startDate, today)}
                        onPress={() => openTrip(item)} />
                    )} />
                ) : <Text style={s.sectionEmpty}>추가로 다가오는 여행이 없어요.</Text>}
                <SectionHeader title="지난 여행" meta={String(buckets.past.length)} />
              </>
            }
            renderItem={({ item }) => {
              const spend = totals.get(item.id) ?? [];
              const spendLabel = spend.length
                ? spend.map(({ currency, amount }) => `${currency} ${formatAmount(amount, currency)}`).join(' · ')
                : '지출 없음';
              return (
                <ListRow title={item.title}
                  subtitle={`${dateRangeLabel(item.startDate, item.endDate, dateFormat)} · ${spendLabel}`}
                  leading={<CityScene slot="thumb" cityName={item.cityName} />} trailing="chevron"
                  onPress={() => openTrip(item)} />
              );
            }}
            ListEmptyComponent={<Text style={s.sectionEmpty}>지난 여행이 없어요.</Text>}
          />
        </>
      )}
      <BottomCtaBar label="여행 일정짜기" onPress={() => router.push('/create')} />
    </View>
  );
}

function Hero({ trip, label, dateFormat, topInset, onPress, onSettings }: {
  trip: Trip; label: string; dateFormat: DateFormat; topInset: number; onPress: () => void; onSettings: () => void;
}) {
  return (
    <View style={s.hero}>
      <Pressable onPress={onPress} accessibilityRole="button" style={StyleSheet.absoluteFill}>
        <CityScene slot="hero" cityName={trip.cityName} />
        <View style={s.heroScrim} />
        <View style={s.heroCopy}>
          <Badge label={label} tone="accent" />
          <Text style={s.heroTitle} numberOfLines={2}>{trip.title}</Text>
          <Text style={s.heroMeta} numberOfLines={1}>
            {trip.cityName} · {dateRangeLabel(trip.startDate, trip.endDate, dateFormat)} · {tripLength(trip.startDate, trip.endDate)}
          </Text>
        </View>
      </Pressable>
      <View style={[s.heroSettings, { top: topInset + spacing.xs }]}>
        <IconButton icon="settings" label="앱 설정" onPress={onSettings} floating />
      </View>
    </View>
  );
}

function SceneCard({ trip, label, onPress }: { trip: Trip; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [s.sceneCard, pressed && s.pressed]}>
      <CityScene slot="card" cityName={trip.cityName} />
      <View style={s.cardScrim} />
      <View style={s.cardBadge}><Badge label={label} /></View>
      <View style={s.cardCopy}>
        <Text style={s.cardTitle} numberOfLines={2}>{trip.title}</Text>
        <Text style={s.cardMeta} numberOfLines={1}>{trip.cityName}</Text>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingBottom: spacing.xl },
  hero: { height: illustration.cityScene.hero.height, overflow: 'hidden' },
  heroScrim: {
    position: 'absolute', left: 0, right: 0, bottom: 0, height: 190,
    experimental_backgroundImage: 'linear-gradient(0deg, rgba(10,26,26,0.96) 0%, rgba(10,26,26,0.86) 62%, rgba(10,26,26,0) 100%)',
  },
  heroCopy: { position: 'absolute', left: spacing.gutter, right: spacing.gutter, bottom: spacing.lg, gap: spacing.xxs, alignItems: 'flex-start' },
  heroTitle: { ...t.displayMd, color: colors.onDark },
  heroMeta: { ...t.caption, color: 'rgba(255,255,255,0.78)' },
  heroSettings: { position: 'absolute', right: spacing.sm, backgroundColor: colors.canvas, borderRadius: rounded.pill },
  carousel: { paddingHorizontal: spacing.gutter, gap: spacing.sm },
  sceneCard: { width: illustration.cityScene.card.width, height: illustration.cityScene.card.height, borderRadius: rounded.lg, overflow: 'hidden' },
  pressed: { opacity: 0.82 },
  cardScrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 112, backgroundColor: 'rgba(10,26,26,0.62)' },
  cardBadge: { position: 'absolute', top: spacing.xs, right: spacing.xs },
  cardCopy: { position: 'absolute', left: spacing.sm, right: spacing.sm, bottom: spacing.sm, gap: 2 },
  cardTitle: { ...t.titleMd, color: colors.onDark },
  cardMeta: { ...t.caption, color: 'rgba(255,255,255,0.78)' },
  sectionEmpty: { ...t.bodySm, color: colors.muted, paddingHorizontal: spacing.gutter, paddingVertical: spacing.md },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingHorizontal: spacing.gutter },
  emptyTitle: { ...t.displayLg, color: colors.ink, textAlign: 'center' },
  emptyBody: { ...t.bodySm, color: colors.muted, textAlign: 'center' },
});
