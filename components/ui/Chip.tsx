import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { colors, elevation, rounded, sizing, spacing, type as t } from '../../theme';
import { Icon, type IconName } from '../Icon';

/** 36dp 칩 (템플릿 Chips). 시각 36, 터치 44. `leadingIcon` 16dp, `onDismiss` 는 닫기 아이콘, `elevated` 는 지도 위 흰 칩. */
export function Chip({
  label,
  selected,
  onPress,
  leadingIcon,
  onDismiss,
  elevated,
  style,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
  leadingIcon?: IconName;
  onDismiss?: () => void;
  elevated?: boolean;
  style?: ViewStyle;
}) {
  const fg = selected ? colors.onPrimary : colors.ink;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 4, bottom: 4 }}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={[s.chip, elevated && s.elevated, selected && s.selected, style]}
    >
      {leadingIcon ? <Icon name={leadingIcon} size={sizing.iconSm} color={fg} /> : null}
      <Text style={[s.label, selected && s.labelSelected]}>{label}</Text>
      {onDismiss ? (
        <Pressable onPress={onDismiss} hitSlop={8} accessibilityRole="button" accessibilityLabel={`${label} 해제`}>
          <Icon name="close-small" size={sizing.iconSm} color={fg} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

/** 가로 스크롤 칩 행의 공통 여백. */
export const chipRow: ViewStyle = { flexDirection: 'row', gap: spacing.xs, paddingHorizontal: spacing.gutter };

export function ChipRow({ children }: { children: React.ReactNode }) {
  return <View style={s.row}>{children}</View>;
}

const s = StyleSheet.create({
  chip: {
    minHeight: sizing.controlHSm,
    paddingHorizontal: spacing.md,
    borderRadius: rounded.pill,
    borderWidth: sizing.hairline,
    borderColor: colors.hairline,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  elevated: { backgroundColor: colors.canvas, borderColor: 'transparent', boxShadow: elevation.card },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { ...t.caption, color: colors.ink },
  labelSelected: { color: colors.onPrimary },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
});
