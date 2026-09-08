import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenHeader, SegmentTabs } from '../../components/ui';
import { DOMESTIC, OVERSEAS, type City } from '../../lib/cities';
import { colors, rounded, sizing, spacing, type as t } from '../../theme';

const TABS = ['국내', '해외'] as const;

export default function Destination() {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]>('국내');
  const cities = tab === '국내' ? DOMESTIC : OVERSEAS;

  return (
    <View style={s.screen}>
      <ScreenHeader title="어디로 떠나세요?" />
      <SegmentTabs options={TABS} value={tab} onChange={setTab} />

      <FlatList
        data={cities}
        keyExtractor={(c) => c.name}
        contentContainerStyle={s.list}
        ListHeaderComponent={
          <View style={s.listHeader}>
            {/* Places 검색은 API 키가 붙은 뒤에 연다 (design.md §6) */}
            <View style={s.searchDisabled}>
              <Text style={s.searchLabel}>도시 검색은 준비 중이에요</Text>
            </View>
            <Text style={s.sectionLabel}>인기 도시</Text>
          </View>
        }
        renderItem={({ item }) => (
          <CityRow city={item} onPress={() => router.push({ pathname: '/create/dates', params: { ...item } })} />
        )}
      />
    </View>
  );
}

function CityRow({ city, onPress }: { city: City; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [s.row, pressed && s.rowPressed]}
    >
      <Text style={s.cityName}>{city.name}</Text>
      <Text style={s.cityRegion}>{city.region}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  list: { paddingHorizontal: spacing.gutter, paddingBottom: spacing.xxl },
  listHeader: { gap: spacing.sm, paddingTop: spacing.md, paddingBottom: spacing.xs },
  searchDisabled: {
    minHeight: sizing.controlH,
    borderRadius: rounded.pill,
    backgroundColor: colors.surfaceCard,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  searchLabel: { ...t.bodyMd, color: colors.mutedSoft },
  sectionLabel: { ...t.captionUpper, color: colors.muted },
  row: {
    minHeight: sizing.touchMin,
    paddingVertical: spacing.sm,
    borderBottomWidth: sizing.hairline,
    borderBottomColor: colors.hairlineSoft,
    justifyContent: 'center',
  },
  rowPressed: { backgroundColor: colors.surfaceCard },
  cityName: { ...t.titleSm, color: colors.ink },
  cityRegion: { ...t.bodySm, color: colors.muted },
});
