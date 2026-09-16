import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, rounded, sizing, spacing, type as t } from '../../theme';
import { Icon } from '../Icon';

/**
 * 템플릿 Text Field / Textarea. 라벨 위 · 입력 · 헬퍼/에러 아래(에러는 색 + 문구). 값이 있으면 지우기 아이콘.
 * 포커스 시 테두리 잉크 1.5dp (design-system text-input-focused).
 */
export function TextField({
  label,
  helper,
  error,
  value,
  onChangeText,
  multiline,
  clearable = true,
  style,
  inputStyle,
  ...rest
}: TextInputProps & {
  label?: string;
  helper?: string;
  error?: string;
  clearable?: boolean;
  inputStyle?: TextInputProps['style'];
}) {
  const [focused, setFocused] = useState(false);
  const showClear = clearable && !!value && !multiline && rest.editable !== false;
  return (
    <View style={[s.field, style as object]}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <View style={[s.box, multiline && s.boxMultiline, focused && s.boxFocused, !!error && s.boxError]}>
        <TextInput
          {...rest}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
          placeholderTextColor={colors.mutedSoft}
          style={[s.input, multiline && s.inputMultiline, inputStyle]}
          accessibilityLabel={rest.accessibilityLabel ?? label}
        />
        {showClear && focused ? (
          <Pressable onPress={() => onChangeText?.('')} hitSlop={8} accessibilityRole="button" accessibilityLabel={`${label ?? '입력'} 지우기`}>
            <Icon name="close-small" size={sizing.iconMd} color={colors.mutedSoft} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text style={s.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : helper ? (
        <Text style={s.helper}>{helper}</Text>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  field: { gap: spacing.xxs },
  label: { ...t.caption, color: colors.muted },
  box: {
    minHeight: sizing.controlH,
    borderRadius: rounded.md,
    borderWidth: sizing.hairline,
    borderColor: colors.hairline,
    backgroundColor: colors.canvas,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  boxMultiline: { minHeight: 96, alignItems: 'flex-start', paddingVertical: spacing.sm },
  boxFocused: { borderColor: colors.ink, borderWidth: 1.5 },
  boxError: { borderColor: colors.error },
  input: { ...t.bodyMd, color: colors.ink, flex: 1, paddingVertical: 0 },
  inputMultiline: { minHeight: 72, textAlignVertical: 'top' },
  helper: { ...t.caption, color: colors.muted },
  error: { ...t.caption, color: colors.error },
});
