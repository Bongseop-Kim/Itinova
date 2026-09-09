import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenHeader, SegmentTabs } from '../../components/ui';
import AppleSearchBar from '../../components/AppleSearchBar';
import { useAppleSearch } from '../../lib/useAppleSearch';
import { DOMESTIC, OVERSEAS, type City } from '../../lib/cities';
import { colors, sizing, spacing, type as t } from '../../theme';

const TABS = ['국내', '해외'] as const;

export default function Destination() {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]>('국내');
  const cities = tab === '국내' ? DOMESTIC : OVERSEAS;
  const search = useAppleSearch(true);
  const results = search.results.filter((p) => tab === '국내' ? p.countryCode === 'KR' : p.countryCode !== 'KR');

  return (
    <View style={s.screen}>
      <ScreenHeader title="어디로 떠나세요?" />
      <SegmentTabs options={TABS} value={tab} onChange={setTab} />
      <AppleSearchBar search={search} placeholder="도시 이름 검색" />

      <FlatList
        data={search.searched ? results : cities}
        keyboardShouldPersistTaps="handled"
        keyExtractor={(c) => `${c.countryCode}|${c.region}|${c.name}`}
        contentContainerStyle={s.list}
        ListHeaderComponent={
          <View style={s.listHeader}>
            <Text style={s.sectionLabel}>{search.searched ? '검색 결과' : '인기 도시'}</Text>
          </View>
        }
        ListEmptyComponent={!search.loading && !search.error ? <Text style={s.cityRegion}>검색 결과가 없어요. 다른 도시 이름이나 국내·해외 탭을 확인해 주세요.</Text> : null}
        renderItem={({ item }) => (
          <CityRow city={item} onPress={() => router.push({ pathname: '/create/dates', params: {
            name: item.name, region: item.region, countryCode: item.countryCode,
            currency: item.currency, lat: item.lat, lng: item.lng,
          } })} />
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
