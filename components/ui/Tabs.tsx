import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, rounded, sizing, spacing, type as t } from '../../theme';
import { Badge } from './Badge';

export type TabOption<T extends string> = { value: T; label?: string; count?: number };

function normalize<T extends string>(options: readonly (T | TabOption<T>)[]): TabOption<T>[] {
  return options.map((o) => (typeof o === 'string' ? { value: o } : o));
}

/** 밑줄 인디케이터 탭 (템플릿 Tab). 4개 이상·가로 스크롤·개수 배지. 저장함 필터, 장소 추가 소스, 지도 일차. */
export function Tabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly (T | TabOption<T>)[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={s.tabsWrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabs} keyboardShouldPersistTaps="handled">
        {normalize(options).map((o) => {
          const active = o.value === value;
          return (
            <Pressable
              key={o.value}
              onPress={() => onChange(o.value)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={s.tab}
            >
              <View style={s.tabInner}>
                <Text style={[s.tabLabel, active && s.tabLabelActive]}>{o.label ?? o.value}</Text>
                {o.count != null ? <Badge count={o.count} /> : null}
              </View>
              <View style={[s.indicator, active && s.indicatorActive]} />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

/** 필 컨테이너 세그먼트 (템플릿 Segmented Controls). 2~3개 균등폭. 가계부 모드, 지도뷰/리스트. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  style,
}: {
  options: readonly (T | TabOption<T>)[];
  value: T;
  onChange: (v: T) => void;
  style?: object;
}) {
  return (
    <View style={[s.segments, style]}>
      {normalize(options).map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[s.segment, active && s.segmentActive]}
          >
            <Text style={[s.segmentLabel, active && s.segmentLabelActive]}>{o.label ?? o.value}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  tabsWrap: { borderBottomWidth: sizing.hairline, borderBottomColor: colors.hairlineSoft },
  tabs: { paddingHorizontal: spacing.gutter - spacing.sm, flexDirection: 'row' },
  tab: { minHeight: sizing.controlH, justifyContent: 'flex-end' },
  tabInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs, paddingHorizontal: spacing.sm, paddingBottom: spacing.xs },
  tabLabel: { ...t.titleSm, color: colors.muted },
  tabLabelActive: { color: colors.ink },
  indicator: { height: 2, marginHorizontal: spacing.sm, backgroundColor: 'transparent', borderRadius: 1 },
  indicatorActive: { backgroundColor: colors.ink },

  segments: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceCard,
    borderRadius: rounded.pill,
    padding: 2,
    marginHorizontal: spacing.gutter,
  },
  segment: { flex: 1, minHeight: sizing.controlHSm - 4, borderRadius: rounded.pill, alignItems: 'center', justifyContent: 'center' },
  segmentActive: { backgroundColor: colors.canvas, boxShadow: '0px 1px 3px rgba(10,10,10,0.08)' },
  segmentLabel: { ...t.caption, color: colors.muted },
  segmentLabelActive: { color: colors.ink },
});
