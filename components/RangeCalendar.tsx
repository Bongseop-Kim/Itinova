import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { cellState, months, pickDate, todayISO, type Cell, type Month } from '../lib/calendar';
import { colors, sizing, spacing, type as t } from '../theme';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const CIRCLE = 36;

export type Range = { start?: string; end?: string };
export const CALENDAR_MONTHS = 6;

/**
 * S05 여행 생성과 S21 날짜 변경이 함께 쓴다.
 * 템플릿 Date Picker: 범위는 연속 밴드(양끝 둥글게), 시작·끝은 잉크 원 + 흰 숫자, 오늘은 숫자 위 점.
 */
export default function RangeCalendar({
  range,
  onChange,
  monthCount = CALENDAR_MONTHS,
  embedded = false,
}: {
  range: Range;
  onChange: (next: Range) => void;
  monthCount?: number;
  embedded?: boolean;
}) {
  const data = months(monthCount);
  const today = todayISO();
  const content = data.map((month) => (
    <MonthBlock
      key={month.label}
      month={month}
      range={range}
      today={today}
      onPick={(date) => onChange(pickDate(range, date))}
    />
  ));

  return (
    <View style={embedded ? undefined : s.wrap}>
      <View style={s.weekdays}>
        {WEEKDAYS.map((w) => (
          <Text key={w} style={s.weekday}>
            {w}
          </Text>
        ))}
      </View>
      {embedded ? <View style={s.list}>{content}</View> : <ScrollView contentContainerStyle={s.list}>{content}</ScrollView>}
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
  const banded = state === 'middle' || state === 'start' || state === 'end';

  return (
    <Pressable
      disabled={past}
      onPress={() => onPick(cell.date)}
      accessibilityRole="button"
      accessibilityState={{ disabled: past, selected: state !== 'none' }}
      style={s.cell}
    >
      {/* 밴드: 셀 절반씩 칠해 시작·끝에서 둥글게 끊긴다 */}
      {banded ? <View style={[s.band, state === 'start' && s.bandStart, state === 'end' && s.bandEnd]} /> : null}
      <View style={[s.circle, filled && s.circleFilled]}>
        <Text style={[s.cellLabel, past && s.cellLabelPast, filled && s.cellLabelFilled]}>{cell.day}</Text>
      </View>
      {cell.date === today ? <View style={[s.todayDot, filled && s.todayDotFilled]} /> : null}
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
  band: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: (sizing.touchMin - CIRCLE) / 2,
    height: CIRCLE,
    backgroundColor: colors.surfaceCard,
  },
  bandStart: { left: '50%' },
  bandEnd: { right: '50%' },
  circle: { width: CIRCLE, height: CIRCLE, borderRadius: CIRCLE / 2, alignItems: 'center', justifyContent: 'center' },
  circleFilled: { backgroundColor: colors.primary },
  cellLabel: { ...t.bodySm, color: colors.ink },
  cellLabelPast: { color: colors.mutedSoft },
  cellLabelFilled: { color: colors.onPrimary },
  todayDot: { position: 'absolute', top: 1, width: 4, height: 4, borderRadius: 2, backgroundColor: colors.ink },
  todayDotFilled: { backgroundColor: colors.onPrimary, top: (sizing.touchMin - CIRCLE) / 2 + 4 },
});
