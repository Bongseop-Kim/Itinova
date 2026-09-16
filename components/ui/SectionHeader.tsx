import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, sizing, spacing, type as t } from '../../theme';
import type { IconName } from '../Icon';
import { IconButton } from './IconButton';

/** 템플릿 Section Header. 제목 + 오른쪽 텍스트 액션(`모두 보기`) 또는 아이콘 액션. */
export function SectionHeader({
  title,
  meta,
  action,
  actionIcon,
  onAction,
}: {
  title: string;
  /** 제목 옆 보조 텍스트 (합계 등). */
  meta?: string;
  action?: string;
  actionIcon?: IconName;
  onAction?: () => void;
}) {
  return (
    <View style={s.row}>
      <Text style={s.title} numberOfLines={1}>
        {title}
      </Text>
      {meta ? <Text style={s.meta} numberOfLines={1}>{meta}</Text> : <View style={s.spacer} />}
      {actionIcon && onAction ? <IconButton icon={actionIcon} label={action ?? title} onPress={onAction} /> : null}
      {action && !actionIcon ? (
        <Pressable onPress={onAction} hitSlop={8} accessibilityRole="button" style={s.action}>
          <Text style={s.actionLabel}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
    minHeight: sizing.touchMin,
  },
  title: { ...t.titleMd, color: colors.ink, flexShrink: 1 },
  meta: { ...t.caption, color: colors.muted, flex: 1, textAlign: 'right' },
  spacer: { flex: 1 },
  action: { minHeight: sizing.touchMin, justifyContent: 'center' },
  actionLabel: { ...t.caption, color: colors.muted },
});
