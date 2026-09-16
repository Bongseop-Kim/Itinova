import { Keyboard, StyleSheet, Text, View } from 'react-native';

import type { useAppleSearch } from '../lib/useAppleSearch';
import { colors, elevation, rounded, spacing, type as t } from '../theme';
import { SearchBar } from './ui';

/** Apple 지도 검색 입력. 제출은 키보드 search 키 (템플릿 Search Bar — 별도 검색 버튼 없음). */
export default function AppleSearchBar({ search, placeholder, elevated }: { search: ReturnType<typeof useAppleSearch>; placeholder: string; elevated?: boolean }) {
  const submit = () => { Keyboard.dismiss(); void search.search(); };
  if (!search.available) return <Text style={[s.meta, s.gutter]}>현재 기기에서는 검색을 사용할 수 없어요.</Text>;
  return (
    <View style={s.container}>
      <SearchBar value={search.query} onChangeText={search.changeQuery} onSubmit={submit} placeholder={placeholder} maxLength={120} elevated={elevated} />
      {/* 지도 위에서는 지도 라벨과 겹쳐 안 읽히므로 배경 있는 칩으로 감싼다 */}
      <View style={elevated ? s.noteElevated : s.gutter}>
        <Text style={s.meta}>Apple 지도 · {search.loading ? '검색 중…' : '장소 정보를 검색해요'}</Text>
        {search.error && <Text accessibilityRole="alert" style={s.error}>{search.error}</Text>}
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  container: { gap: spacing.xxs, paddingVertical: spacing.xs },
  gutter: { paddingHorizontal: spacing.gutter },
  noteElevated: {
    alignSelf: 'flex-start',
    marginHorizontal: spacing.gutter,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: rounded.pill,
    backgroundColor: colors.canvas,
    boxShadow: elevation.card,
  },
  meta: { ...t.caption, color: colors.muted }, error: { ...t.caption, color: colors.error },
});
