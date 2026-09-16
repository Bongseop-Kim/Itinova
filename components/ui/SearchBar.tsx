import { useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, elevation, rounded, sizing, spacing, type as t } from '../../theme';
import { Icon } from '../Icon';

/**
 * 템플릿 Search Bar. 선행 검색 아이콘, surface-card pill 40dp, 값이 있으면 지우기, 포커스 시 `취소`.
 * 제출은 키보드 search 키. `elevated` 는 지도 위 흰 배경 + 그림자.
 */
export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  onCancel,
  placeholder,
  elevated,
  style,
  ...rest
}: Omit<TextInputProps, 'style'> & {
  value: string;
  onChangeText: (v: string) => void;
  onSubmit?: () => void;
  onCancel?: () => void;
  elevated?: boolean;
  style?: object;
}) {
  const [focused, setFocused] = useState(false);
  const cancel = () => {
    onChangeText('');
    Keyboard.dismiss();
    onCancel?.();
  };
  return (
    <View style={[s.row, style]}>
      <View style={[s.box, elevated && s.elevated]}>
        <Icon name="search" size={sizing.iconMd} color={colors.muted} />
        <TextInput
          {...rest}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedSoft}
          returnKeyType="search"
          onSubmitEditing={onSubmit}
          onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
          autoCorrect={false}
          style={s.input}
          accessibilityLabel={rest.accessibilityLabel ?? placeholder}
        />
        {value ? (
          <Pressable onPress={() => onChangeText('')} hitSlop={8} accessibilityRole="button" accessibilityLabel="검색어 지우기">
            <Icon name="close" size={sizing.iconMd} color={colors.mutedSoft} />
          </Pressable>
        ) : null}
      </View>
      {focused || (value && onCancel) ? (
        <Pressable onPress={cancel} hitSlop={8} accessibilityRole="button" style={s.cancel}>
          <Text style={s.cancelLabel}>취소</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.gutter },
  box: {
    flex: 1,
    minHeight: sizing.controlHMd,
    borderRadius: rounded.pill,
    backgroundColor: colors.surfaceCard,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  elevated: { backgroundColor: colors.canvas, boxShadow: elevation.card },
  input: { ...t.bodyMd, color: colors.ink, flex: 1, paddingVertical: 0 },
  cancel: { minHeight: sizing.touchMin, justifyContent: 'center' },
  cancelLabel: { ...t.button, color: colors.ink },
});
