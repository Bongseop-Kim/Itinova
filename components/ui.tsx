// docs/design-system.md 의 컴포넌트 토큰을 그대로 옮긴 조각들.
// 값은 theme.ts 에서만 온다 — 화면에서 hex 를 인라인하지 않는다.
import type { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, rounded, sizing, spacing, type as t } from '../theme';

/** expo-router 의 typed route 문자열. `href` prop 을 받는 곳에서 함께 쓴다. */
export type Href = React.ComponentProps<typeof Link>['href'];

export function ScreenHeader({
  title,
  action,
  onAction,
}: {
  title?: string;
  action?: string;
  onAction?: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.header, { paddingTop: insets.top }]}>
      <Text style={s.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={10} accessibilityRole="button">
          <Text style={s.headerAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** 하단 고정 액션. paddingBottom 에 bottom inset 을 더한다 (design-system §Safe area). */
export function BottomCtaBar({
  label,
  onPress,
  disabled,
  hint,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  hint?: string;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.ctaBar, { paddingBottom: spacing.sm + insets.bottom }]}>
      {hint ? <Text style={s.ctaHint}>{hint}</Text> : null}
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled }}
        style={({ pressed }) => [
          s.cta,
          pressed && !disabled && s.ctaPressed,
          disabled && s.ctaDisabled,
        ]}
      >
        <Text style={[s.ctaLabel, disabled && s.ctaLabelDisabled]}>{label}</Text>
      </Pressable>
    </View>
  );
}

/** 36dp 칩. 시각 크기는 36 이지만 터치 영역은 44 를 확보한다. */
export function Chip({
  label,
  selected,
  onPress,
  style,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 4, bottom: 4 }}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={[s.chip, selected && s.chipSelected, style]}
    >
      <Text style={[s.chipLabel, selected && s.chipLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

export function SegmentTabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={s.segments}>
      {options.map((o) => {
        const active = o === value;
        return (
          <Pressable
            key={o}
            onPress={() => onChange(o)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[s.segment, active && s.segmentActive]}
          >
            <Text style={[s.segmentLabel, active && s.segmentLabelActive]}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Question({ children }: { children: string }) {
  return <Text style={s.question}>{children}</Text>;
}

const s = StyleSheet.create({
  header: {
    backgroundColor: colors.canvas,
    paddingHorizontal: spacing.gutter,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: { ...t.titleLg, color: colors.ink, flexGrow: 1, minHeight: sizing.headerH, lineHeight: sizing.headerH },
  headerAction: { ...t.button, color: colors.ink, minHeight: sizing.touchMin, lineHeight: sizing.touchMin },

  ctaBar: {
    backgroundColor: colors.canvas,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    borderTopWidth: sizing.hairline,
    borderTopColor: colors.hairline,
    gap: spacing.xs,
  },
  ctaHint: { ...t.caption, color: colors.muted, textAlign: 'center' },
  cta: {
    minHeight: sizing.controlH,
    borderRadius: rounded.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  ctaPressed: { backgroundColor: colors.primaryActive },
  ctaDisabled: { backgroundColor: colors.primaryDisabled },
  ctaLabel: { ...t.button, color: colors.onPrimary },
  ctaLabelDisabled: { color: colors.muted },

  chip: {
    minHeight: sizing.controlHSm,
    paddingHorizontal: spacing.md,
    borderRadius: rounded.pill,
    borderWidth: sizing.hairline,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipLabel: { ...t.caption, color: colors.muted },
  chipLabelSelected: { color: colors.onPrimary },

  segments: { flexDirection: 'row', gap: spacing.xs, paddingHorizontal: spacing.gutter },
  segment: {
    minHeight: sizing.controlHSm,
    paddingHorizontal: spacing.md,
    borderRadius: rounded.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: { backgroundColor: colors.surfaceCard },
  segmentLabel: { ...t.titleSm, color: colors.muted },
  segmentLabelActive: { color: colors.ink },

  question: { ...t.displaySm, color: colors.ink },
});
