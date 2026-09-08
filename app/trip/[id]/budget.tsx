import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';

import { BottomCtaBar, ScreenHeader, SegmentTabs } from '../../../components/ui';
import { expensesQuery, removeExpense } from '../../../db/expenses';
import { expenses as expensesTable, tripDays } from '../../../db/schema';
import {
  formatAmount,
  groupByCategory,
  groupByDay,
  sumByCurrency,
  type Expense,
} from '../../../lib/expense';
import { useDbQuery } from '../../../lib/useDbQuery';
import { useTripId } from '../../../lib/useTripId';
import { colors, rounded, sizing, spacing, type as t } from '../../../theme';

const MODES = ['일차별', '카테고리별'] as const;

export default function Budget() {
  const id = useTripId();
  const router = useRouter();
  const [mode, setMode] = useState<(typeof MODES)[number]>('일차별');

  const rows = useDbQuery(() => expensesQuery(id), [expensesTable, tripDays], [id]);
  const list = useMemo<Expense[]>(() => rows ?? [], [rows]);

  const totals = useMemo(() => sumByCurrency(list), [list]);
  const sections = useMemo(
    () =>
      (mode === '일차별' ? groupByDay(list) : groupByCategory(list)).map((g) => ({
        title: g.label,
        subtotal: sumByCurrency(g.rows),
        data: g.rows,
      })),
    [list, mode],
  );

  return (
    <View style={s.screen}>
      <ScreenHeader title="가계부" />

      <View style={s.totals}>
        {totals.length ? (
          totals.map((tot) => (
            <Text key={tot.currency} style={s.total}>
              {tot.currency} {formatAmount(tot.amount, tot.currency)}
            </Text>
          ))
        ) : (
          <Text style={s.total}>0</Text>
        )}
        <Text style={s.totalsLabel}>통화별 합계</Text>
      </View>

      <SegmentTabs options={MODES} value={mode} onChange={setMode} />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          // E04 — 일러스트 자리를 확보해 둔다
          <View style={s.empty}>
            <View style={s.emptyFigure} />
            <Text style={s.emptyTitle}>기록한 비용이 없어요</Text>
            <Text style={s.emptyBody}>
              결제할 때마다 넣어두면{'\n'}일차별 · 카테고리별로 알아서 묶입니다
            </Text>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={s.groupHeader}>
            <Text style={s.groupLabel}>{section.title}</Text>
            <Text style={s.groupSum}>
              {section.subtotal
                .map((x) => `${formatAmount(x.amount, x.currency)} ${x.currency}`)
                .join('  ')}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <Pressable
            onLongPress={() => removeExpense(item.id)}
            accessibilityRole="button"
            accessibilityHint="길게 누르면 삭제됩니다"
            style={s.row}
          >
            <View style={s.rowBody}>
              <Text style={s.rowTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={s.rowMeta}>{item.category}</Text>
            </View>
            <Text style={s.amount}>
              {formatAmount(item.amount, item.currency)} {item.currency}
            </Text>
          </Pressable>
        )}
      />

      <BottomCtaBar label="비용 추가" onPress={() => router.push(`/trip/${id}/expense/new`)} />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  totals: { paddingHorizontal: spacing.gutter, paddingBottom: spacing.md, gap: 2 },
  total: { ...t.displayMd, color: colors.ink, fontVariant: ['tabular-nums'] },
  totalsLabel: { ...t.caption, color: colors.muted },

  list: { paddingHorizontal: spacing.gutter, paddingBottom: spacing.lg },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
  },
  groupLabel: { ...t.titleMd, color: colors.ink, flexGrow: 1 },
  groupSum: { ...t.caption, color: colors.muted, fontVariant: ['tabular-nums'] },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: sizing.touchMin,
    paddingVertical: spacing.xs,
    borderBottomWidth: sizing.hairline,
    borderBottomColor: colors.hairlineSoft,
  },
  rowBody: { flexGrow: 1, flexShrink: 1 },
  rowTitle: { ...t.titleSm, color: colors.ink },
  rowMeta: { ...t.caption, color: colors.muted },
  amount: { ...t.numeric, color: colors.ink },

  empty: { alignItems: 'center', gap: spacing.xs, paddingTop: spacing.xxl },
  emptyFigure: {
    width: 160,
    height: 160,
    borderRadius: rounded.xl,
    backgroundColor: colors.surfaceCard,
    marginBottom: spacing.xs,
  },
  emptyTitle: { ...t.titleMd, color: colors.ink },
  emptyBody: { ...t.bodySm, color: colors.muted, textAlign: 'center' },
});
