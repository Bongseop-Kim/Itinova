import { StyleSheet, Text, View } from 'react-native';

import { colors, rounded, spacing, type as t } from '../../theme';

/** 개수·상태 pill (템플릿 Badge). `tone="accent"` 는 진행중 같은 한 곳에만. */
export function Badge({ count, label, tone = 'neutral' }: { count?: number; label?: string; tone?: 'neutral' | 'accent' | 'dark' }) {
  const text = label ?? String(count ?? '');
  if (!text) return null;
  return (
    <View style={[s.badge, tone === 'accent' && s.accent, tone === 'dark' && s.dark]}>
      <Text style={[s.label, tone === 'dark' && s.labelDark]} allowFontScaling={false}>
        {text}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  badge: {
    minWidth: 20,
    minHeight: 20,
    paddingHorizontal: spacing.xs,
    borderRadius: rounded.pill,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accent: { backgroundColor: colors.brandPeach },
  dark: { backgroundColor: colors.brandTeal },
  label: { ...t.caption, color: colors.ink, lineHeight: 16 },
  labelDark: { color: colors.onDark },
});
