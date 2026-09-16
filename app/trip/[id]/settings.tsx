import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';

import RangeCalendar, { type Range } from '../../../components/RangeCalendar';
import { Chip, ChipRow, ListGroup, ListRow, ScreenHeader, TextField } from '../../../components/ui';
import { exportTripJson } from '../../../db/backup';
import { trips } from '../../../db/schema';
import {
  changeTripDates,
  countItemsInDays,
  currentDays,
  deleteTrip,
  tripQuery,
  updateTripBasics,
} from '../../../db/updateTrip';
import { tripLength } from '../../../lib/calendar';
import { dateRangeLabel } from '../../../lib/date';
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
        <ScreenHeader title="여행 설정" largeTitle />
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
    const { start, end } = range;
    const apply = () => {
      changeTripDates(id, start, end);
      setEditingDates(false);
      setRange({});
    };
    if (warning) {
      Alert.alert('여행 기간을 줄일까요?', warning, [
        { text: '취소', style: 'cancel' },
        { text: '확인', onPress: apply },
      ]);
    } else {
      apply();
    }
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
      <ScreenHeader title="여행 설정" largeTitle />
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <View style={s.gutter}>
          <TextField
            label="제목"
            value={title}
            onChangeText={setTitle}
            onEndEditing={() => updateTripBasics(id, { title: title.trim() || trip.title })}
            placeholder="여행 제목"
          />
        </View>

        <ListGroup title="날짜">
          <ListRow
            title={dateRangeLabel(trip.startDate, trip.endDate)}
            subtitle={tripLength(trip.startDate, trip.endDate)}
            leading="calendar"
            trailing={editingDates ? '접기' : '변경'}
            onPress={() => {
              setEditingDates((v) => !v);
              setRange({});
            }}
          />
        </ListGroup>

        {editingDates ? (
          <View style={s.calendar}>
            <RangeCalendar range={range} onChange={setRange} embedded />
            {warning ? <Text style={s.warning}>{warning}</Text> : null}
            <Pressable
              onPress={applyDates}
              disabled={!range.start || !range.end}
              accessibilityRole="button"
              style={[s.apply, (!range.start || !range.end) && s.applyOff]}
            >
              <Text style={[s.applyLabel, (!range.start || !range.end) && s.applyLabelOff]}>
                {range.start && range.end ? `${tripLength(range.start, range.end)} 로 변경` : '날짜를 선택해 주세요'}
              </Text>
            </Pressable>
          </View>
        ) : null}

        <ListGroup title="동행">
          <View style={s.gutter}>
            <ChipRow>
              {COMPANIONS.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  selected={trip.companion === c}
                  onPress={() => updateTripBasics(id, { companion: trip.companion === c ? null : c })}
                />
              ))}
            </ChipRow>
          </View>
        </ListGroup>

        <ListGroup title="성향">
          <View style={s.gutter}>
            <ChipRow>
              {STYLES.map((v) => (
                <Chip key={v} label={v} selected={styles.includes(v)} onPress={() => toggleStyle(v)} />
              ))}
            </ChipRow>
          </View>
        </ListGroup>

        <ListGroup title="기본 통화">
          <View style={s.gutter}>
            <ChipRow>
              {CURRENCIES.map((c) => (
                <Chip key={c} label={c} selected={trip.currency === c} onPress={() => updateTripBasics(id, { currency: c })} />
              ))}
            </ChipRow>
          </View>
        </ListGroup>

        <ListGroup title="데이터">
          <ListRow title="JSON 내보내기" subtitle="이 여행만 · 유일한 백업 수단" leading="share" trailing="chevron" onPress={exportJson} />
        </ListGroup>

        <ListGroup>
          <ListRow title="여행 삭제" leading="trash" destructive onPress={confirmDelete} />
        </ListGroup>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingBottom: spacing.xxl },
  gutter: { paddingHorizontal: spacing.gutter },
  calendar: { marginTop: spacing.xs, paddingHorizontal: spacing.gutter, gap: spacing.xs },
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
});
