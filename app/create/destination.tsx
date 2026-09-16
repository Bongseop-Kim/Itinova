import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import AppleSearchBar from '../../components/AppleSearchBar';
import { Chip, ChipRow, ListRow, ScreenHeader, SectionHeader } from '../../components/ui';
import { DOMESTIC, OVERSEAS, type City } from '../../lib/cities';
import { useAppleSearch } from '../../lib/useAppleSearch';
import { colors, spacing, type as t } from '../../theme';

// S04. 템플릿 "여행지 찾기": 검색바 + 지역별 섹션 헤더 + 도시 pill 칩. 검색하면 결과 목록으로 바뀐다.
export default function Destination() {
  const router = useRouter();
  const search = useAppleSearch(true);
  const go = (c: City) =>
    router.push({
      pathname: '/create/dates',
      params: { name: c.name, region: c.region, countryCode: c.countryCode, currency: c.currency, lat: c.lat, lng: c.lng },
    });

  return (
    <View style={s.screen}>
      <ScreenHeader title="어디로 떠나세요?" />
      <AppleSearchBar search={search} placeholder="도시 이름 검색" />

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.list}>
        {search.searched ? (
          <>
            <SectionHeader title="검색 결과" />
            {search.results.map((c) => (
              <ListRow key={`${c.countryCode}|${c.region}|${c.name}`} title={c.name} subtitle={c.region} leading="location" trailing="chevron" onPress={() => go(c)} />
            ))}
            {!search.loading && !search.error && !search.results.length ? (
              <Text style={s.emptyBody}>검색 결과가 없어요. 다른 도시 이름으로 다시 검색해 주세요.</Text>
            ) : null}
          </>
        ) : (
          <>
            <CityChips title="국내 인기" cities={DOMESTIC} onPick={go} />
            <CityChips title="해외 인기" cities={OVERSEAS} onPick={go} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

function CityChips({ title, cities, onPick }: { title: string; cities: City[]; onPick: (c: City) => void }) {
  return (
    <View>
      <SectionHeader title={title} />
      <View style={s.chips}>
        <ChipRow>
          {cities.map((c) => (
            <Chip key={c.name} label={c.name} onPress={() => onPick(c)} />
          ))}
        </ChipRow>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  list: { paddingBottom: spacing.xxl },
  chips: { paddingHorizontal: spacing.gutter },
  emptyBody: { ...t.bodySm, color: colors.muted, paddingHorizontal: spacing.gutter },
});
