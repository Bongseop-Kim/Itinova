import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { cellState, months, pickDate, todayISO, type Cell, type Month } from '../lib/calendar';
import { colors, rounded, sizing, spacing, type as t } from '../theme';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export type Range = { start?: string; end?: string };

/** S05 여행 생성과 S21 날짜 변경이 함께 쓴다. */
export default function RangeCalendar({
  range,
  onChange,
  monthCount = 12,
  scrollEnabled = true,
}: {
  range: Range;
  onChange: (next: Range) => void;
  monthCount?: number;
  scrollEnabled?: boolean;
}) {
  const data = months(monthCount);
  const today = todayISO();

  return (
    <View style={s.wrap}>
      <View style={s.weekdays}>
        {WEEKDAYS.map((w) => (
          <Text key={w} style={s.weekday}>
            {w}
          </Text>
        ))}
      </View>
      <FlatList
        data={data}
        scrollEnabled={scrollEnabled}
        keyExtractor={(m) => m.label}
        contentContainerStyle={s.list}
        renderItem={({ item }) => (
          <MonthBlock
            month={item}
            range={range}
            today={today}
            onPick={(date) => onChange(pickDate(range, date))}
          />
        )}
      />
    </View>
  );
}

function MonthBlock({
  month,
  range,
  today,
  onPick,
}: {
  month: Month;
  range: Range;
  today: string;
  onPick: (date: string) => void;
}) {
  return (
    <View style={s.month}>
      <Text style={s.monthLabel}>{month.label}</Text>
      {month.weeks.map((week, wi) => (
        <View key={wi} style={s.week}>
          {week.map((cell, ci) => (
            <DayCell key={ci} cell={cell} range={range} today={today} onPick={onPick} />
          ))}
        </View>
      ))}
    </View>
  );
}

function DayCell({
  cell,
  range,
  today,
  onPick,
}: {
  cell: Cell;
  range: Range;
  today: string;
  onPick: (date: string) => void;
}) {
  if (!cell) return <View style={s.cell} />;

  const past = cell.date < today;
  const state = cellState(range, cell.date);
  const filled = state === 'start' || state === 'end' || state === 'single';

  return (
    <Pressable
      disabled={past}
      onPress={() => onPick(cell.date)}
      accessibilityRole="button"
      accessibilityState={{ disabled: past, selected: state !== 'none' }}
      style={[s.cell, state === 'middle' && s.cellMiddle, filled && s.cellFilled]}
    >
      <Text
        style={[
          s.cellLabel,
          past && s.cellLabelPast,
          filled && s.cellLabelFilled,
        ]}
      >
        {cell.day}
      </Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1 },
  weekdays: {
    flexDirection: 'row',
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.xs,
    borderBottomWidth: sizing.hairline,
    borderBottomColor: colors.hairlineSoft,
  },
  weekday: { ...t.caption, color: colors.muted, flexGrow: 1, flexBasis: 0, textAlign: 'center' },

  list: { paddingHorizontal: spacing.gutter, paddingBottom: spacing.lg },
  month: { paddingTop: spacing.lg, gap: spacing.xxs },
  monthLabel: { ...t.titleMd, color: colors.ink, paddingBottom: spacing.xs },
  week: { flexDirection: 'row' },

  cell: {
    flexGrow: 1,
    flexBasis: 0,
    minHeight: sizing.touchMin,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellMiddle: { backgroundColor: colors.surfaceCard },
  cellFilled: { backgroundColor: colors.primary, borderRadius: rounded.sm },
  cellLabel: { ...t.bodySm, color: colors.ink },
  cellLabelPast: { color: colors.mutedSoft },
  cellLabelFilled: { color: colors.onPrimary },
});
