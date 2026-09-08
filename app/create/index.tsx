import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, elevation, rounded, sizing, spacing, type as t } from '../../theme';

// S03 = BS2 생성 방식. 바텀시트 2행.
export default function CreateMethod() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={s.root}>
      <Pressable
        style={s.scrim}
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="닫기"
      />
      <View style={[s.sheet, { paddingBottom: spacing.lg + insets.bottom }]}>
        <View style={s.handle} />
        <Text style={s.title}>어떻게 만들까요?</Text>
        <Row
          label="직접 일정 만들기"
          sub="도시와 날짜를 고르고 일차별로 채웁니다"
          onPress={() => router.push('/create/destination')}
        />
        <Row
          label="AI 일정 추천받기"
          sub="다섯 가지만 답하면 초안을 만들어 드려요"
          onPress={() => router.push('/ai/ask')}
        />
      </View>
    </View>
  );
}

function Row({ label, sub, onPress }: { label: string; sub: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [s.row, pressed && s.rowPressed]}
    >
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.rowSub}>{sub}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: { flex: 1, backgroundColor: colors.scrim },
  sheet: {
    backgroundColor: colors.canvas,
    borderTopLeftRadius: rounded.sheet,
    borderTopRightRadius: rounded.sheet,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    gap: spacing.sm,
    boxShadow: elevation.sheet,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: rounded.pill,
    backgroundColor: colors.hairline,
    alignSelf: 'center',
    marginBottom: spacing.xs,
  },
  title: { ...t.titleLg, color: colors.ink, marginBottom: spacing.xxs },
  row: {
    minHeight: sizing.touchMin,
    paddingVertical: spacing.sm,
    borderRadius: rounded.md,
    gap: 2,
  },
  rowPressed: { backgroundColor: colors.surfaceCard },
  rowLabel: { ...t.titleSm, color: colors.ink },
  rowSub: { ...t.caption, color: colors.muted },
});
