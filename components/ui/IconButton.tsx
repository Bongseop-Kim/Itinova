import { Pressable, StyleSheet } from 'react-native';

import { colors, elevation, sizing } from '../../theme';
import { Icon, type IconName } from '../Icon';

/** 44dp 터치 · 40dp 시각 · 아이콘 24. 템플릿 Icon Button. `floating` 은 지도 위 흰 원 + 그림자. */
export function IconButton({
  icon,
  label,
  onPress,
  color = colors.ink,
  floating,
  disabled,
}: {
  icon: IconName;
  /** 스크린리더 라벨. 아이콘만 있는 버튼이라 필수. */
  label: string;
  onPress: () => void;
  color?: string;
  floating?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={(sizing.touchMin - sizing.controlHMd) / 2}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [s.button, floating && s.floating, pressed && s.pressed]}
    >
      <Icon name={icon} color={disabled ? colors.mutedSoft : color} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  button: {
    width: sizing.controlHMd,
    height: sizing.controlHMd,
    borderRadius: sizing.controlHMd / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floating: { backgroundColor: colors.canvas, boxShadow: elevation.card },
  pressed: { backgroundColor: colors.surfaceCard },
});
