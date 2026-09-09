import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { useAppleSearch } from '../lib/useAppleSearch';
import { colors, rounded, sizing, spacing, type as t } from '../theme';

export default function AppleSearchBar({ search, placeholder }: { search: ReturnType<typeof useAppleSearch>; placeholder: string }) {
  const submit = () => { Keyboard.dismiss(); void search.search(); };
  return <View style={s.container}>
    {search.available ? <>
      <View style={s.row}>
        <TextInput style={s.input} value={search.query} onChangeText={search.changeQuery}
          placeholder={placeholder} accessibilityLabel={placeholder} placeholderTextColor={colors.mutedSoft}
          maxLength={120} returnKeyType="search" onSubmitEditing={submit} autoCorrect={false} />
        <Pressable style={s.button} accessibilityRole="button" accessibilityLabel="검색"
          disabled={!search.query.trim() || search.loading} onPress={submit}>
          <Text style={[s.label, (!search.query.trim() || search.loading) && s.disabled]}>검색</Text>
        </Pressable>
      </View>
      <Text style={s.meta}>Apple 지도 · {search.loading ? '검색 중…' : '장소 정보를 검색해요'}</Text>
      {search.error && <Text accessibilityRole="alert" style={s.error}>{search.error}</Text>}
    </> : <Text style={s.meta}>현재 기기에서는 검색을 사용할 수 없어요.</Text>}
  </View>;
}
const s = StyleSheet.create({
  container: { gap: spacing.xs, paddingHorizontal: spacing.gutter, paddingVertical: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  input: { ...t.bodyMd, flex: 1, color: colors.ink, minHeight: sizing.controlH, borderRadius: rounded.pill, backgroundColor: colors.surfaceCard, paddingHorizontal: spacing.md },
  button: { minHeight: sizing.touchMin, minWidth: sizing.touchMin, alignItems: 'center', justifyContent: 'center' },
  label: { ...t.button, color: colors.ink }, disabled: { color: colors.muted },
  meta: { ...t.caption, color: colors.muted }, error: { ...t.caption, color: colors.error },
});
