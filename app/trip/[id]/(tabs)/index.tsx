import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import DayPickerSheet from '../../../../components/DayPickerSheet';
import { Chip, ScreenHeader } from '../../../../components/ui';
import { db } from '../../../../db';
import { savedPlacesQuery } from '../../../../db/places';
import { dayItems, places, savedPlaces, tripDays, trips } from '../../../../db/schema';
import { categoryLabel } from '../../../../lib/category';
import { ddayLabel } from '../../../../lib/date';
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
  const trip = useDbQuery(() => db.select().from(trips).where(eq(trips.id, id)), [trips], [id])?.[0];
  const saved = useDbQuery(() => savedPlacesQuery(id), [savedPlaces, places], [id]);
  const scheduled = useDbQuery(() => db.selectDistinct({ placeId: places.id, name: places.name, category: places.category, region: places.region, photoUrl: places.photoUrl }).from(places)
    .innerJoin(dayItems, eq(dayItems.placeId, places.id)).innerJoin(tripDays, eq(tripDays.id, dayItems.tripDayId)).where(eq(tripDays.tripId, id)), [places, dayItems, tripDays], [id]);
  const all = [...new Map([...(saved ?? []), ...(scheduled ?? [])].map((p) => [p.placeId, p])).values()];
  const shown = all.filter((p) => (!category || p.category === category || (category === 'food' && p.category === 'cafe')) && `${p.name} ${p.region ?? ''}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
  return (
    <View style={s.screen}>
      <ScreenHeader title={trip?.title ?? '여행 홈'} action="홈" onAction={() => router.navigate('/')} />
      <FlatList data={shown} keyExtractor={(place) => place.placeId} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled"
        ListHeaderComponent={<View style={s.contentHeader}>
        {trip ? <>
          <View style={s.hero}><Text style={s.heroTitle}>{today > trip.endDate ? '다녀온 여행' : today >= trip.startDate ? '지금 여행 중이에요' : `두근두근, 여행 ${ddayLabel(trip.startDate, today)}`}</Text><Text style={s.heroBody}>{trip.cityName}</Text></View>
          <Pressable style={s.action} onPress={() => router.push(`/trip/${id}/settings`)} accessibilityRole="button" accessibilityLabel="여행 날짜와 설정 편집"><Text style={s.button}>{trip.startDate} ~ {trip.endDate} · 편집</Text></Pressable>
          <View style={s.chips}><Chip label="일정 보기" onPress={() => router.navigate(`/trip/${id}/itinerary`)} /><Chip label="전체 지도" onPress={() => router.push(`/trip/${id}/map`)} /><Chip label="장소 추가" onPress={() => router.push(`/trip/${id}/add-place`)} /></View>
          <Text style={s.title}>이 여행의 장소</Text>
          <Text style={s.body}>일정과 저장함에 담아 둔 장소예요.</Text>
          <TextInput style={s.search} value={search} onChangeText={setSearch} accessibilityLabel="내 여행 장소 검색" placeholder="내 여행 장소 검색" placeholderTextColor={colors.mutedSoft} returnKeyType="search" />
          <View style={s.chips}>{FILTERS.map((filter) => <Chip key={filter.label} label={filter.label} selected={category === filter.category} onPress={() => setCategory(filter.category)} />)}</View>
        </> : <Text style={s.body}>여행을 찾을 수 없어요.</Text>}
        </View>}
        renderItem={({ item: place }) => <View style={s.card}>
          <Pressable style={s.place} accessibilityRole="button" accessibilityLabel={`${place.name} 상세`} onPress={() => router.push(`/place/${place.placeId}?tripId=${id}`)}>
            {place.photoUrl && <Image source={{ uri: place.photoUrl }} style={s.thumb} />}
            <View style={s.placeBody}><Text style={s.placeTitle}>{place.name}</Text><Text style={s.body}>{[categoryLabel(place.category), place.region].filter(Boolean).join(' · ')}</Text></View>
          </Pressable>
          <Pressable style={s.action} onPress={() => setAdding(place)} accessibilityRole="button" accessibilityLabel={`${place.name} 일정에 추가`}><Text style={s.button}>일정에 추가</Text></Pressable>
        </View>}
        ListEmptyComponent={trip ? <View style={s.empty}><Text style={s.title}>{all.length ? '조건에 맞는 장소가 없어요' : '아직 담은 장소가 없어요'}</Text><Text style={s.body}>{all.length ? '검색어나 카테고리를 바꿔 보세요.' : '장소 추가에서 나만의 여행지를 담아 보세요.'}</Text></View> : null}
      />
      {adding && <DayPickerSheet tripId={id} placeId={adding.placeId} name={adding.name} onClose={() => setAdding(undefined)} />}
    </View>
  );
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas }, content: { paddingHorizontal: spacing.gutter, paddingBottom: spacing.xxl, gap: spacing.md },
  contentHeader: { gap: spacing.md },
  hero: { backgroundColor: colors.brandTeal, borderRadius: rounded.xl, padding: spacing.lg, gap: spacing.xs }, heroTitle: { ...t.displaySm, color: colors.onDark }, heroBody: { ...t.bodyMd, color: colors.onDark },
  title: { ...t.titleLg, color: colors.ink }, body: { ...t.bodySm, color: colors.muted }, button: { ...t.button, color: colors.ink }, action: { minHeight: sizing.touchMin, justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }, search: { ...t.bodyMd, color: colors.ink, minHeight: sizing.controlH, borderRadius: rounded.pill, backgroundColor: colors.surfaceCard, paddingHorizontal: spacing.md },
  card: { borderWidth: sizing.hairline, borderColor: colors.hairline, borderRadius: rounded.lg, padding: spacing.sm, gap: spacing.xs }, place: { flexDirection: 'row', gap: spacing.sm, minHeight: sizing.touchMin, alignItems: 'center' }, placeBody: { flex: 1, gap: spacing.xxs }, placeTitle: { ...t.titleSm, color: colors.ink },
  thumb: { width: sizing.touchMin, height: sizing.touchMin, borderRadius: rounded.md }, empty: { paddingVertical: spacing.lg, gap: spacing.sm },
});
