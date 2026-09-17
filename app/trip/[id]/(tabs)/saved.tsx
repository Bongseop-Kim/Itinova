import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { ClayFigure, categoryFigure } from '../../../../components/ClayFigure';
import DayPickerSheet from '../../../../components/DayPickerSheet';
import { BottomCtaBar, IconButton, ListRow, ScreenHeader, Tabs } from '../../../../components/ui';
import { savedPlacesQuery } from '../../../../db/places';
import { places, savedPlaces } from '../../../../db/schema';
import { categoryLabel, type Category } from '../../../../lib/category';
import { useDbQuery } from '../../../../lib/useDbQuery';
import { useTripId } from '../../../../lib/useTripId';
import { colors, illustration, spacing, type as t } from '../../../../theme';

// 전체 + 인벤토리와 같은 어휘 (design.md §2.4 S11)
const FILTERS = [
  { label: '전체', match: null },
  { label: '관광', match: 'attraction' },
  { label: '맛집', match: 'food' },
  { label: '숙소', match: 'stay' },
] as const;

export default function Saved() {
  const id = useTripId();
  const router = useRouter();
  const [adding, setAdding] = useState<{ placeId: string; name: string }>();
  const [filter, setFilter] = useState<string>('전체');

  const data = useDbQuery(() => savedPlacesQuery(id), [savedPlaces, places], [id]);
  const all = useMemo(() => data ?? [], [data]);

  const options = useMemo(
    () => FILTERS.map((f) => ({ value: f.label, count: f.match ? all.filter((p) => p.category === f.match).length : all.length })),
    [all],
  );

  const active = FILTERS.find((f) => f.label === filter)!;
  const list = active.match ? all.filter((p) => p.category === active.match) : all;

  return (
    <View style={s.screen}>
      <ScreenHeader title="저장" back={false} />
      <Tabs options={options} value={filter} onChange={setFilter} />

      <FlatList
        data={list}
        keyExtractor={(p) => p.placeId}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          <View style={s.empty}>
            <ClayFigure name="saved" size={illustration.large} />
            <Text style={s.emptyTitle}>저장한 장소가 없어요</Text>
            <Text style={s.emptyBody}>
              가고 싶은 곳을 저장해두면{'\n'}일차에 담을 때 바로 꺼내 씁니다
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <ListRow
            title={item.name}
            subtitle={[categoryLabel(item.category as Category), item.region].filter(Boolean).join(' · ')}
            leading={<ClayFigure name={categoryFigure(item.category)} size={illustration.thumb} />}
            trailingAction={<IconButton icon="calendar" label={`${item.name} 일정에 추가`} onPress={() => setAdding(item)} />}
            accessibilityLabel={`${item.name} 상세`}
            onPress={() => router.push(`/place/${item.placeId}?tripId=${id}`)}
          />
        )}
      />

      {adding && <DayPickerSheet tripId={id} placeId={adding.placeId} name={adding.name} onClose={() => setAdding(undefined)} />}
      <BottomCtaBar label="장소 찾기" onPress={() => router.push(`/trip/${id}/add-place`)} />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  list: { paddingTop: spacing.xs, paddingBottom: spacing.xxl },

  empty: { alignItems: 'center', gap: spacing.xs, paddingTop: spacing.xxl, paddingHorizontal: spacing.gutter },
  emptyTitle: { ...t.titleMd, color: colors.ink },
  emptyBody: { ...t.bodySm, color: colors.muted, textAlign: 'center' },
});
