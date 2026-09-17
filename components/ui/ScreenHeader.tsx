import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, sizing, spacing, type as t } from '../../theme';
import type { IconName } from '../Icon';
import { IconButton } from './IconButton';

export type HeaderAction = { icon: IconName; label: string; onPress: () => void };

/**
 * 템플릿 Navigation Bar. 왼쪽 뒤로 셰브론(이력이 없으면 홈으로), 중앙 제목, 오른쪽 아이콘 1~2개 또는 텍스트 액션 하나.
 * `largeTitle` 은 위 줄에 아이콘만, 아래 줄에 display-md 제목 (설정·홈).
 */
export function ScreenHeader({
  title,
  overline,
  largeTitle,
  back = true,
  backLabel = '뒤로',
  onBack,
  actions = [],
  action,
  onAction,
}: {
  title?: string;
  /** `largeTitle` 위 한 줄 (홈의 오늘 날짜). 제목만으로 맥락이 안 서는 화면에만. */
  overline?: string;
  largeTitle?: boolean;
  back?: boolean;
  backLabel?: string;
  onBack?: () => void;
  actions?: HeaderAction[];
  /** 텍스트 액션 (`완료` 같은 것). 아이콘 액션과 함께 쓰면 맨 오른쪽. */
  action?: string;
  onAction?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const right = (
    <View style={s.right}>
      {actions.map((a) => (
        <IconButton key={a.icon + a.label} icon={a.icon} label={a.label} onPress={a.onPress} />
      ))}
      {action ? (
        <Pressable onPress={onAction} hitSlop={10} accessibilityRole="button" style={s.textAction}>
          <Text style={s.textActionLabel}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
  // 딥링크로 바로 들어오면 되돌아갈 이력이 없다 — router.back() 이 아무것도 하지 않아 화면에 갇힌다.
  const goBack = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')));
  const left = back ? (
    <IconButton icon="chevron-left" label={backLabel} onPress={goBack} />
  ) : (
    <View style={s.spacer} />
  );
  return (
    <View style={{ paddingTop: insets.top, backgroundColor: colors.canvas }}>
      <View style={s.bar}>
        {left}
        {largeTitle ? <View style={s.flex} /> : (
          <Text style={s.title} numberOfLines={1}>
            {title}
          </Text>
        )}
        {right}
      </View>
      {largeTitle ? (
        <View style={s.largeWrap}>
          {overline ? <Text style={s.overline}>{overline}</Text> : null}
          <Text style={s.large} numberOfLines={1}>
            {title}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    minHeight: sizing.headerH,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    gap: spacing.xxs,
  },
  flex: { flex: 1 },
  spacer: { width: sizing.controlHMd },
  title: { ...t.titleLg, color: colors.ink, flex: 1, textAlign: 'center' },
  right: { flexDirection: 'row', alignItems: 'center', minWidth: sizing.controlHMd, justifyContent: 'flex-end' },
  textAction: { minHeight: sizing.touchMin, justifyContent: 'center', paddingHorizontal: spacing.sm },
  textActionLabel: { ...t.button, color: colors.ink },
  largeWrap: { paddingHorizontal: spacing.gutter, paddingBottom: spacing.sm },
  overline: { ...t.caption, color: colors.muted, paddingBottom: spacing.xxs },
  large: { ...t.displayMd, color: colors.ink },
});
