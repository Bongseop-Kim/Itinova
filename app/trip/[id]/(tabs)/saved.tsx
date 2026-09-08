import { Link, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { savedPlacesQuery } from '../../../../db/places';
import { places, savedPlaces } from '../../../../db/schema';
import { categoryLabel, type Category } from '../../../../lib/category';
import { useDbQuery } from '../../../../lib/useDbQuery';
import { useTripId } from '../../../../lib/useTripId';
import { colors, rounded, sizing, spacing, type as t } from '../../../../theme';

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
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<string>('전체');

  const data = useDbQuery(() => savedPlacesQuery(id), [savedPlaces, places], [id]);
  const all = useMemo(() => data ?? [], [data]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const f of FILTERS) {
      map.set(f.label, f.match ? all.filter((p) => p.category === f.match).length : all.length);
    }
    return map;
  }, [all]);

  const active = FILTERS.find((f) => f.label === filter)!;
  const list = active.match ? all.filter((p) => p.category === active.match) : all;

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Text style={s.headerTitle}>저장</Text>
      </View>

      <View style={s.filters}>
        {FILTERS.map((f) => {
          const on = f.label === filter;
          return (
            <Pressable
              key={f.label}
              onPress={() => setFilter(f.label)}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              style={[s.filter, on && s.filterActive]}
            >
              <Text style={[s.filterLabel, on && s.filterLabelActive]}>
                {f.label} {counts.get(f.label) ?? 0}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={list}
        keyExtractor={(p) => p.placeId}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          // E03 — 일러스트 자리를 확보해 둔다 (design-system §자산 로드맵 1번)
          <View style={s.empty}>
            <View style={s.emptyFigure} />
            <Text style={s.emptyTitle}>저장한 장소가 없어요</Text>
            <Text style={s.emptyBody}>
              가고 싶은 곳을 저장해두면{'\n'}일차에 담을 때 바로 꺼내 씁니다
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={s.row}>
            <View style={s.thumb} />
            <View style={s.rowBody}>
              <Text style={s.rowTitle} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={s.rowMeta} numberOfLines={1}>
                {[categoryLabel(item.category as Category), item.region].filter(Boolean).join(' · ')}
              </Text>
            </View>
            {/* BS3(일차 선택) 은 아직 없다 — 지금은 장소 추가 화면으로 보낸다 */}
            <Link href={`/trip/${id}/add-place`} asChild>
              <Pressable style={s.action} accessibilityRole="button">
                <Text style={s.actionLabel}>일정에 추가</Text>
              </Pressable>
            </Link>
          </View>
        )}
      />

      <View style={s.ctaBar}>
        <Pressable
          onPress={() => router.push(`/trip/${id}/add-place`)}
          accessibilityRole="button"
          style={({ pressed }) => [s.cta, pressed && s.ctaPressed]}
        >
          <Text style={s.ctaLabel}>장소 찾기</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  header: { paddingHorizontal: spacing.gutter, minHeight: sizing.headerH, justifyContent: 'center' },
  headerTitle: { ...t.titleLg, color: colors.ink },

  filters: { flexDirection: 'row', gap: spacing.xs, paddingHorizontal: spacing.gutter },
  filter: {
    minHeight: sizing.controlHSm,
    paddingHorizontal: spacing.md,
    borderRadius: rounded.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterActive: { backgroundColor: colors.surfaceCard },
  filterLabel: { ...t.titleSm, color: colors.muted },
  filterLabelActive: { color: colors.ink },

  list: { paddingHorizontal: spacing.gutter, paddingTop: spacing.sm, paddingBottom: spacing.xxl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: sizing.touchMin,
    paddingVertical: spacing.sm,
    borderBottomWidth: sizing.hairline,
    borderBottomColor: colors.hairlineSoft,
  },
  thumb: { width: 44, height: 44, borderRadius: rounded.md, backgroundColor: colors.surfaceCard },
  rowBody: { flexGrow: 1, flexShrink: 1 },
  rowTitle: { ...t.titleSm, color: colors.ink },
  rowMeta: { ...t.caption, color: colors.muted },
  action: {
    minHeight: sizing.touchMin,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  actionLabel: { ...t.caption, color: colors.ink },

  empty: { alignItems: 'center', gap: spacing.xs, paddingTop: spacing.xxl },
  emptyFigure: {
    width: 160,
    height: 160,
    borderRadius: rounded.xl,
    backgroundColor: colors.surfaceCard,
    marginBottom: spacing.xs,
  },
  emptyTitle: { ...t.titleMd, color: colors.ink },
  emptyBody: { ...t.bodySm, color: colors.muted, textAlign: 'center' },

  ctaBar: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderTopWidth: sizing.hairline,
    borderTopColor: colors.hairline,
  },
  cta: {
    minHeight: sizing.controlH,
    borderRadius: rounded.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPressed: { backgroundColor: colors.primaryActive },
  ctaLabel: { ...t.button, color: colors.onPrimary },
});
