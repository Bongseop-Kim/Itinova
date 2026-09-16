import { Pressable, StyleSheet } from 'react-native';

import { colors, rounded, sizing } from '../../theme';
import { Icon } from '../Icon';

/** 24dp 체크박스 (템플릿 Checkboxes). on 이면 잉크 채움 + check. hitSlop 10 (design-system checkbox). */
export function Checkbox({ checked, onPress, label }: { checked: boolean; onPress: () => void; label: string }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      style={[s.box, checked && s.checked]}
    >
      {checked ? <Icon name="check" size={sizing.iconSm} color={colors.onPrimary} /> : null}
    </Pressable>
  );
}

const s = StyleSheet.create({
  box: {
    width: 24,
    height: 24,
    borderRadius: rounded.xs,
    borderWidth: 1.5,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: { backgroundColor: colors.primary, borderColor: colors.primary },
});
