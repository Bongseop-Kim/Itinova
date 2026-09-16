import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';

import DayPickerSheet from '../../../../components/DayPickerSheet';
import { Chip, ChipRow, IconButton, ListRow, ScreenHeader, SearchBar, SectionHeader } from '../../../../components/ui';
import { db } from '../../../../db';
import { savedPlacesQuery } from '../../../../db/places';
import { appSettings, dayItems, places, savedPlaces, tripDays, trips } from '../../../../db/schema';
import { DATE_FORMAT, settingsQuery } from '../../../../db/settings';
import { categoryLabel } from '../../../../lib/category';
import { dateRangeLabel, ddayLabel } from '../../../../lib/date';
import { useClock } from '../../../../lib/useTravelData';
import { useDbQuery } from '../../../../lib/useDbQuery';
import { useTripId } from '../../../../lib/useTripId';
import { colors, rounded, sizing, spacing, type as t } from '../../../../theme';

const FILTERS = [{ label: '전체', category: null }, { label: '관광', category: 'attraction' }, { label: '맛집', category: 'food' }, { label: '숙소', category: 'stay' }] as const;
export default function TripHome() {
  const id = useTripId();
  const router = useRouter();
  const now = useClock();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState<{ placeId: string; name: string }>();
  const settings = useDbQuery(settingsQuery, [appSettings], []);
  const dateFormat = settings?.find((row) => row.key === DATE_FORMAT)?.value === 'md' ? 'md' : 'ymd';
  const trip = useDbQuery(() => db.select().from(trips).where(eq(trips.id, id)), [trips], [id])?.[0];
  const saved = useDbQuery(() => savedPlacesQuery(id), [savedPlaces, places], [id]);
  const scheduled = useDbQuery(() => db.selectDistinct({ placeId: places.id, name: places.name, category: places.category, region: places.region, photoUrl: places.photoUrl }).from(places)
    .innerJoin(dayItems, eq(dayItems.placeId, places.id)).innerJoin(tripDays, eq(tripDays.id, dayItems.tripDayId)).where(eq(tripDays.tripId, id)), [places, dayItems, tripDays], [id]);
  const all = [...new Map([...(saved ?? []), ...(scheduled ?? [])].map((p) => [p.placeId, p])).values()];
  const shown = all.filter((p) => (!category || p.category === category || (category === 'food' && p.category === 'cafe')) && `${p.name} ${p.region ?? ''}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
  return (
    <View style={s.screen}>
      <ScreenHeader
        title={trip?.title ?? '여행 홈'}
        backLabel="홈으로"
        onBack={() => router.navigate('/')}
        actions={[{ icon: 'settings', label: '여행 설정', onPress: () => router.push(`/trip/${id}/settings`) }]}
      />
      <FlatList data={shown} keyExtractor={(place) => place.placeId} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled"
        ListHeaderComponent={<View>
        {trip ? <>
          <View style={s.gutter}>
            <View style={s.hero}>
              <Text style={s.heroTitle}>{today > trip.endDate ? '다녀온 여행' : today >= trip.startDate ? '지금 여행 중이에요' : `두근두근, 여행 ${ddayLabel(trip.startDate, today)}`}</Text>
              <Text style={s.heroBody}>{trip.cityName} · {dateRangeLabel(trip.startDate, trip.endDate, dateFormat)}</Text>
            </View>
            <View style={s.quick}>
              <Chip label="일정 보기" leadingIcon="calendar" onPress={() => router.navigate(`/trip/${id}/itinerary`)} />
              <Chip label="전체 지도" leadingIcon="map" onPress={() => router.push(`/trip/${id}/map`)} />
              <Chip label="장소 추가" leadingIcon="plus" onPress={() => router.push(`/trip/${id}/add-place`)} />
            </View>
          </View>
          <SectionHeader title="이 여행의 장소" meta="일정과 저장함에 담아 둔 장소" />
          <SearchBar value={search} onChangeText={setSearch} placeholder="내 여행 장소 검색" />
          <View style={[s.gutter, s.filters]}>
            <ChipRow>{FILTERS.map((filter) => <Chip key={filter.label} label={filter.label} selected={category === filter.category} onPress={() => setCategory(filter.category)} />)}</ChipRow>
          </View>
        </> : <Text style={[s.body, s.gutter]}>여행을 찾을 수 없어요.</Text>}
        </View>}
        renderItem={({ item: place }) => (
          <ListRow
            title={place.name}
            subtitle={[categoryLabel(place.category), place.region].filter(Boolean).join(' · ')}
            leading={place.photoUrl ? <Image source={{ uri: place.photoUrl }} style={s.thumb} /> : <View style={s.thumb} />}
            trailingAction={<IconButton icon="calendar" label={`${place.name} 일정에 추가`} onPress={() => setAdding(place)} />}
            accessibilityLabel={`${place.name} 상세`}
            onPress={() => router.push(`/place/${place.placeId}?tripId=${id}`)}
          />
        )}
        ListEmptyComponent={trip ? <View style={[s.empty, s.gutter]}><Text style={s.title}>{all.length ? '조건에 맞는 장소가 없어요' : '아직 담은 장소가 없어요'}</Text><Text style={s.body}>{all.length ? '검색어나 카테고리를 바꿔 보세요.' : '장소 추가에서 나만의 여행지를 담아 보세요.'}</Text></View> : null}
      />
      {adding && <DayPickerSheet tripId={id} placeId={adding.placeId} name={adding.name} onClose={() => setAdding(undefined)} />}
    </View>
  );
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas }, content: { paddingBottom: spacing.xxl },
  gutter: { paddingHorizontal: spacing.gutter },
  hero: { backgroundColor: colors.brandTeal, borderRadius: rounded.xl, padding: spacing.lg, gap: spacing.xs }, heroTitle: { ...t.displaySm, color: colors.onDark }, heroBody: { ...t.bodyMd, color: colors.onDark },
  quick: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, paddingTop: spacing.sm },
  filters: { paddingTop: spacing.sm, paddingBottom: spacing.xxs },
  title: { ...t.titleMd, color: colors.ink }, body: { ...t.bodySm, color: colors.muted },
  thumb: { width: sizing.touchMin, height: sizing.touchMin, borderRadius: rounded.md, backgroundColor: colors.surfaceCard }, empty: { paddingVertical: spacing.lg, gap: spacing.sm },
});
