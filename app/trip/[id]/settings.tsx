import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';

import RangeCalendar, { type Range } from '../../../components/RangeCalendar';
import { Chip, ScreenHeader } from '../../../components/ui';
import { db } from '../../../db';
import { exportTripJson } from '../../../db/backup';
import { dayItems, savedPlaces, tripDays, trips } from '../../../db/schema';
import {
  changeTripDates,
  countItemsInDays,
  currentDays,
  deleteTrip,
  tripQuery,
  updateTripBasics,
} from '../../../db/updateTrip';
import { tripLength } from '../../../lib/calendar';
import { dateChangeWarning, planDateChange } from '../../../lib/tripDates';
import { COMPANIONS, CURRENCIES, STYLES } from '../../../lib/tripStyle';
import { useDbQuery } from '../../../lib/useDbQuery';
import { useTripId } from '../../../lib/useTripId';
import { colors, rounded, sizing, spacing, type as t } from '../../../theme';

export default function TripSettings() {
  const id = useTripId();
  const router = useRouter();

  const rows = useDbQuery(() => tripQuery(id), [trips], [id]);
  const trip = rows?.[0];

  const [title, setTitle] = useState('');
  const [editingDates, setEditingDates] = useState(false);
  const [range, setRange] = useState<Range>({});

  useEffect(() => {
    if (trip) setTitle(trip.title);
  }, [trip?.id]);

  // 사라질 일차와 그 안의 장소 수 — 저장 전 확인 문구에 쓴다 (§4.1)
  const warning = useMemo(() => {
    if (!trip || !range.start || !range.end) return null;
    const days = currentDays(id);
    const plan = planDateChange(days, range.start, range.end);
    const ids = plan.removed.map((r) => days.find((d) => d.dayIndex === r.dayIndex)!.id);
    return dateChangeWarning(plan.removed, countItemsInDays(ids));
  }, [id, trip?.id, range.start, range.end]);

  if (!trip) {
    return (
      <View style={s.screen}>
        <ScreenHeader title="여행 설정" />
      </View>
    );
  }

  const styles: string[] = trip.styles ?? [];

  const toggleStyle = (v: string) =>
    updateTripBasics(id, {
      styles: styles.includes(v) ? styles.filter((x) => x !== v) : [...styles, v],
    });

  const applyDates = () => {
    if (!range.start || !range.end) return;
    changeTripDates(id, range.start, range.end);
    setEditingDates(false);
    setRange({});
  };

  const confirmDelete = () =>
    Alert.alert('여행을 삭제할까요?', `${trip.title} 의 일정 · 저장함 · 가계부가 함께 사라집니다.`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          deleteTrip(id);
          router.dismissAll?.();
          router.replace('/');
        },
      },
    ]);

  const exportJson = async () => {
    const json = exportTripJson(id);
    if (!json) return;
    // ponytail: RN 내장 Share. expo-sharing / file-system 을 붙이지 않는다.
    await Share.share({ message: json, title: `${trip.title}.json` });
  };

  return (
    <View style={s.screen}>
      <ScreenHeader title="여행 설정" />
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Field label="제목">
          <TextInput
            style={s.input}
            value={title}
            onChangeText={setTitle}
            onEndEditing={() => updateTripBasics(id, { title: title.trim() || trip.title })}
            placeholder="여행 제목"
            placeholderTextColor={colors.mutedSoft}
          />
        </Field>

        <Field label="날짜">
          <Pressable
            onPress={() => {
              setEditingDates((v) => !v);
              setRange({});
            }}
            accessibilityRole="button"
            style={s.row}
          >
            <Text style={s.rowValue}>
              {trip.startDate} ~ {trip.endDate}
            </Text>
            <Text style={s.rowAction}>{editingDates ? '접기' : '변경'}</Text>
          </Pressable>
          <Text style={s.rowMeta}>{tripLength(trip.startDate, trip.endDate)}</Text>
        </Field>

        {editingDates ? (
          <View style={s.calendar}>
            <RangeCalendar range={range} onChange={setRange} monthCount={4} scrollEnabled={false} />
            {warning ? <Text style={s.warning}>{warning}</Text> : null}
            <Pressable
              onPress={applyDates}
              disabled={!range.start || !range.end}
              accessibilityRole="button"
              style={[s.apply, (!range.start || !range.end) && s.applyOff]}
            >
              <Text style={[s.applyLabel, (!range.start || !range.end) && s.applyLabelOff]}>
                {range.start && range.end
                  ? `${tripLength(range.start, range.end)} 로 변경`
                  : '날짜를 선택해 주세요'}
              </Text>
            </Pressable>
          </View>
        ) : null}

        <Field label="동행">
          <View style={s.chips}>
            {COMPANIONS.map((c) => (
              <Chip
                key={c}
                label={c}
                selected={trip.companion === c}
                onPress={() => updateTripBasics(id, { companion: trip.companion === c ? null : c })}
              />
            ))}
          </View>
        </Field>

        <Field label="성향">
          <View style={s.chips}>
            {STYLES.map((v) => (
              <Chip key={v} label={v} selected={styles.includes(v)} onPress={() => toggleStyle(v)} />
            ))}
          </View>
        </Field>

        <Field label="기본 통화">
          <View style={s.chips}>
            {CURRENCIES.map((c) => (
              <Chip
                key={c}
                label={c}
                selected={trip.currency === c}
                onPress={() => updateTripBasics(id, { currency: c })}
              />
            ))}
          </View>
        </Field>

        <Field label="데이터">
          <Pressable onPress={exportJson} accessibilityRole="button" style={s.row}>
            <Text style={s.rowValue}>JSON 내보내기</Text>
            <Text style={s.rowAction}>이 여행만</Text>
          </Pressable>
          <Text style={s.rowMeta}>
            여행 데이터는 이 기기에만 있습니다. 내보내기가 유일한 백업 수단이에요.
          </Text>
        </Field>

        <Pressable onPress={confirmDelete} accessibilityRole="button" style={s.delete}>
          <Text style={s.deleteLabel}>여행 삭제</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: spacing.gutter, paddingBottom: spacing.xxl },

  field: { paddingTop: spacing.lg, gap: spacing.xs },
  fieldLabel: { ...t.captionUpper, color: colors.muted },
  input: {
    ...t.bodyMd,
    color: colors.ink,
    minHeight: sizing.controlH,
    borderRadius: rounded.md,
    borderWidth: sizing.hairline,
    borderColor: colors.hairline,
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: sizing.touchMin,
    gap: spacing.sm,
  },
  rowValue: { ...t.bodyMd, color: colors.ink, flexGrow: 1 },
  rowAction: { ...t.button, color: colors.ink },
  rowMeta: { ...t.caption, color: colors.muted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },

  calendar: {
    height: 520,
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  warning: { ...t.bodySm, color: colors.warning },
  apply: {
    minHeight: sizing.controlH,
    borderRadius: rounded.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyOff: { backgroundColor: colors.primaryDisabled },
  applyLabel: { ...t.button, color: colors.onPrimary },
  applyLabelOff: { color: colors.muted },

  delete: {
    marginTop: spacing.section,
    minHeight: sizing.controlH,
    borderRadius: rounded.md,
    borderWidth: sizing.hairline,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteLabel: { ...t.button, color: colors.error },
});
