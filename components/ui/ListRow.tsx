import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, sizing, spacing, type as t } from '../../theme';
import { Icon, type IconName } from '../Icon';

/**
 * 템플릿 Menu List / Lists 행. 높이 56 (부제 있으면 64). 행 구분선 없이 그룹 간격으로 나눈다 (설정 화면 예시).
 * `trailing`: 'chevron' | 텍스트 | 노드. `leading`: 아이콘 이름 또는 노드(썸네일 슬롯).
 */
export function ListRow({
  title,
  subtitle,
  leading,
  trailing,
  trailingAction,
  onPress,
  onLongPress,
  destructive,
  accessibilityLabel,
}: {
  title: string;
  subtitle?: string;
  leading?: IconName | ReactNode;
  /** 장식 전용. 행 전체가 하나의 접근성 요소가 되므로 여기에 버튼을 넣지 않는다. */
  trailing?: 'chevron' | string | ReactNode;
  /** 누를 수 있는 트레일링. 행 밖 형제로 그려 VoiceOver 가 따로 읽는다. */
  trailingAction?: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  destructive?: boolean;
  accessibilityLabel?: string;
}) {
  const color = destructive ? colors.error : colors.ink;
  const trail =
    trailing === 'chevron' ? (
      <Icon name="chevron-right" size={sizing.iconMd} color={colors.mutedSoft} />
    ) : typeof trailing === 'string' ? (
      <Text style={s.value}>{trailing}</Text>
    ) : (
      trailing
    );
  const main = (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={!onPress && !onLongPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [s.row, !!trailingAction && s.rowInner, pressed && !!onPress && s.pressed]}
    >
      {typeof leading === 'string' ? <Icon name={leading as IconName} color={colors.muted} /> : leading}
      <View style={s.body}>
        <Text style={[s.title, { color }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={s.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trail}
    </Pressable>
  );
  // 누를 수 있는 트레일링은 행 밖 형제다. 행 안에 두면 iOS 가 행 하나로 합쳐 버튼을 숨긴다.
  if (!trailingAction) return main;
  return (
    <View style={s.rowOuter}>
      {main}
      {trailingAction}
    </View>
  );
}

/** 행 묶음. 그룹 사이 spacing.lg 로 구분한다. */
export function ListGroup({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <View style={s.group}>
      {title ? <Text style={s.groupTitle}>{title}</Text> : null}
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.xs,
  },
  rowOuter: { flexDirection: 'row', alignItems: 'center', paddingRight: spacing.xs },
  rowInner: { flex: 1, paddingRight: 0 },
  pressed: { backgroundColor: colors.surfaceSoft },
  body: { flex: 1, gap: 2 },
  title: { ...t.titleSm },
  subtitle: { ...t.bodySm, color: colors.muted },
  value: { ...t.bodySm, color: colors.muted },
  group: { paddingTop: spacing.md },
  groupTitle: { ...t.captionUpper, color: colors.muted, paddingHorizontal: spacing.gutter, paddingBottom: spacing.xxs },
});
