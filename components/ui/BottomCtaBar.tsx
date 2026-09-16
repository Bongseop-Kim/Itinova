import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, rounded, semantic, sizing, spacing, type as t } from '../../theme';

/**
 * 하단 고정 액션 (템플릿 Button-fixed). paddingBottom 에 bottom inset 을 더한다.
 * 변형: `secondaryLabel` — 왼쪽 tertiary + 오른쪽 primary (1:2). `info` — 왼쪽 정보 두 줄 + 오른쪽 버튼.
 */
export function BottomCtaBar({
  label,
  onPress,
  disabled,
  hint,
  secondaryLabel,
  onSecondary,
  secondaryDestructive,
  info,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  hint?: string;
  secondaryLabel?: string;
  onSecondary?: () => void;
  /** 보조 액션이 삭제처럼 되돌릴 수 없을 때. 주 버튼(검정)으로 올리지 않고 error 색 텍스트만 쓴다. */
  secondaryDestructive?: boolean;
  info?: { title: string; sub?: string };
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.bar, { paddingBottom: spacing.sm + insets.bottom }]}>
      {hint ? <Text style={s.hint}>{hint}</Text> : null}
      <View style={s.row}>
        {info ? (
          <View style={s.info}>
            <Text style={s.infoTitle} numberOfLines={1}>{info.title}</Text>
            {info.sub ? <Text style={s.infoSub} numberOfLines={1}>{info.sub}</Text> : null}
          </View>
        ) : null}
        {secondaryLabel ? (
          <Pressable
            onPress={onSecondary}
            accessibilityRole="button"
            style={({ pressed }) => [s.button, s.tertiary, pressed && s.tertiaryPressed]}
          >
            <Text style={[s.tertiaryLabel, secondaryDestructive && s.destructiveLabel]}>{secondaryLabel}</Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={onPress}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityState={{ disabled: !!disabled }}
          style={({ pressed }) => [
            s.button,
            s.primary,
            secondaryLabel ? s.grow2 : s.grow1,
            pressed && !disabled && s.primaryPressed,
            disabled && s.disabled,
          ]}
        >
          <Text style={[s.primaryLabel, disabled && s.disabledLabel]}>{label}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    backgroundColor: colors.canvas,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    borderTopWidth: sizing.hairline,
    borderTopColor: colors.hairline,
    gap: spacing.xs,
  },
  hint: { ...t.caption, color: colors.muted, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  info: { flex: 1, gap: 2 },
  infoTitle: { ...t.titleMd, color: colors.ink },
  infoSub: { ...t.caption, color: colors.muted },
  button: {
    minHeight: sizing.controlH,
    borderRadius: rounded.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  grow1: { flex: 1 },
  grow2: { flex: 2 },
  primary: { backgroundColor: semantic.button.primary.bg },
  primaryPressed: { backgroundColor: semantic.button.primary.bgPressed },
  primaryLabel: { ...t.button, color: semantic.button.primary.text },
  disabled: { backgroundColor: semantic.button.disabled.bg },
  disabledLabel: { color: semantic.button.disabled.text },
  tertiary: {
    flex: 1,
    backgroundColor: semantic.button.tertiary.bg,
    borderWidth: sizing.hairline,
    borderColor: semantic.button.tertiary.border,
  },
  tertiaryPressed: { backgroundColor: semantic.button.tertiary.bgPressed },
  tertiaryLabel: { ...t.button, color: semantic.button.tertiary.text },
  destructiveLabel: { color: colors.error },
});
