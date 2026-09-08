import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '../../../components/ui';
import { db } from '../../../db';
import { deleteItems, moveItemsToDay, reorderDay, toggleVisited } from '../../../db/dayItems';
import { dayItems, places, tripDays } from '../../../db/schema';
import { dayMeta } from '../../../lib/date';
import { groupByDay, type DaySection } from '../../../lib/itinerary';
import { moveItem, sortByDistance } from '../../../lib/reorder';
import { useDbQuery } from '../../../lib/useDbQuery';
import { useTripId } from '../../../lib/useTripId';
import { colors, rounded, sizing, spacing, type as t } from '../../../theme';

export default function EditItinerary() {
  const id = useTripId();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string[]>([]);
  const [movingTo, setMovingTo] = useState(false);

  const rows = useDbQuery(
    () =>
      db
        .select({
          dayId: tripDays.id,
          dayIndex: tripDays.dayIndex,
          date: tripDays.date,
          itemId: dayItems.id,
          startTime: dayItems.startTime,
          visited: dayItems.visited,
          name: places.name,
          category: places.category,
          region: places.region,
          lat: places.lat,
          lng: places.lng,
        })
        .from(tripDays)
        .leftJoin(dayItems, eq(dayItems.tripDayId, tripDays.id))
        .leftJoin(places, eq(places.id, dayItems.placeId))
        .where(eq(tripDays.tripId, id))
        .orderBy(tripDays.dayIndex, dayItems.sortOrder),
    [tripDays, dayItems, places],
    [id],
  );

  const sections = useMemo<DaySection[]>(() => groupByDay(rows ?? []), [rows]);

  const toggleSelect = (itemId: string) =>
    setSelected((cur) => (cur.includes(itemId) ? cur.filter((x) => x !== itemId) : [...cur, itemId]));

  const selectDay = (section: DaySection) => {
    const ids = section.data.map((i) => i.id);
    const allOn = ids.every((x) => selected.includes(x));
    setSelected((cur) => (allOn ? cur.filter((x) => !ids.includes(x)) : [...new Set([...cur, ...ids])]));
  };

  const move = (section: DaySection, from: number, to: number) =>
    reorderDay(moveItem(section.data, from, to).map((i) => i.id));

  const sortDay = (section: DaySection) =>
    reorderDay(sortByDistance(section.data).map((i) => i.id));

  return (
    <View style={s.screen}>
      <ScreenHeader title="일정 편집" action="완료" onAction={() => router.back()} />

      {/* react-native-maps 미설치 (design.md §6). 자리는 확보한다 */}
      <View style={s.map}>
        <Text style={s.mapLabel}>지도 · 순번 + 경로</Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <View style={s.dayHeader}>
            <Text style={s.dayLabel}>day {section.dayIndex}</Text>
            <Text style={s.dayMeta}>{dayMeta(section.date)}</Text>
            <View style={s.dayActions}>
              {section.data.length > 2 ? (
                <Pressable onPress={() => sortDay(section)} hitSlop={8} accessibilityRole="button">
                  <Text style={s.dayAction}>거리순 재정렬</Text>
                </Pressable>
              ) : null}
              {section.data.length ? (
                <Pressable onPress={() => selectDay(section)} hitSlop={8} accessibilityRole="button">
                  <Text style={s.dayAction}>day 전체 선택</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        )}
        renderItem={({ item, index, section }) => {
          const on = selected.includes(item.id);
          return (
            <View style={s.row}>
              <Pressable
                onPress={() => toggleSelect(item.id)}
                hitSlop={10}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                style={[s.checkbox, on && s.checkboxOn]}
              />
              <Text style={s.order}>{index + 1}</Text>
              <View style={s.rowBody}>
                <Text style={[s.name, item.visited && s.nameVisited]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Pressable
                  onPress={() => toggleVisited(item.id, !item.visited)}
                  hitSlop={8}
                  accessibilityRole="button"
                >
                  <Text style={s.visited}>{item.visited ? '방문 완료' : '방문 전'}</Text>
                </Pressable>
              </View>
              {/* ponytail: 드래그 대신 위/아래 버튼. 드래그는 제스처 라이브러리가 필요하다 */}
              <Pressable
                onPress={() => move(section as DaySection, index, index - 1)}
                disabled={index === 0}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="위로"
              >
                <Text style={[s.arrow, index === 0 && s.arrowOff]}>위로</Text>
              </Pressable>
              <Pressable
                onPress={() => move(section as DaySection, index, index + 1)}
                disabled={index === section.data.length - 1}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="아래로"
              >
                <Text style={[s.arrow, index === section.data.length - 1 && s.arrowOff]}>아래로</Text>
              </Pressable>
            </View>
          );
        }}
      />

      {selected.length ? (
        <View style={[s.bar, { paddingBottom: spacing.sm + insets.bottom }]}>
          {movingTo ? (
            <View style={s.dayPicker}>
              <Text style={s.pickerLabel}>어느 일차로 옮길까요?</Text>
              <View style={s.pickerChips}>
                {sections.map((sec) => (
                  <Pressable
                    key={sec.dayId}
                    onPress={() => {
                      moveItemsToDay(id, selected, sec.dayIndex);
                      setSelected([]);
                      setMovingTo(false);
                    }}
                    accessibilityRole="button"
                    style={s.pickerChip}
                  >
                    <Text style={s.pickerChipLabel}>day {sec.dayIndex}</Text>
                  </Pressable>
                ))}
                <Pressable onPress={() => setMovingTo(false)} accessibilityRole="button" style={s.pickerChip}>
                  <Text style={s.pickerChipLabel}>취소</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={s.barButtons}>
              <Pressable onPress={() => setMovingTo(true)} accessibilityRole="button" style={s.btn}>
                <Text style={s.btnLabel}>다른 일차로 이동 ({selected.length})</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  deleteItems(selected);
                  setSelected([]);
                }}
                accessibilityRole="button"
                style={s.btn}
              >
                <Text style={[s.btnLabel, s.btnDanger]}>삭제 ({selected.length})</Text>
              </Pressable>
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  map: {
    height: 120,
    marginHorizontal: spacing.gutter,
    borderRadius: rounded.lg,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapLabel: { ...t.caption, color: colors.muted },

  list: { paddingHorizontal: spacing.gutter, paddingBottom: spacing.xxl },
  dayHeader: { paddingTop: spacing.lg, paddingBottom: spacing.xs, gap: spacing.xxs },
  dayLabel: { ...t.titleMd, color: colors.ink },
  dayMeta: { ...t.caption, color: colors.muted },
  dayActions: { flexDirection: 'row', gap: spacing.md, paddingTop: spacing.xxs },
  dayAction: { ...t.caption, color: colors.ink, minHeight: sizing.touchMin, lineHeight: sizing.touchMin },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: sizing.touchMin,
    paddingVertical: spacing.xs,
    borderBottomWidth: sizing.hairline,
    borderBottomColor: colors.hairlineSoft,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: rounded.xs,
    borderWidth: 1.5,
    borderColor: colors.hairline,
  },
  checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  order: { ...t.caption, color: colors.muted, width: 16, textAlign: 'center' },
  rowBody: { flexGrow: 1, flexShrink: 1 },
  name: { ...t.titleSm, color: colors.ink },
  nameVisited: { color: colors.mutedSoft },
  visited: { ...t.caption, color: colors.muted },
  arrow: { ...t.caption, color: colors.ink },
  arrowOff: { color: colors.hairline },

  bar: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    borderTopWidth: sizing.hairline,
    borderTopColor: colors.hairline,
    backgroundColor: colors.canvas,
  },
  barButtons: { flexDirection: 'row', gap: spacing.xs },
  btn: {
    flexGrow: 1,
    flexBasis: 0,
    minHeight: sizing.controlH,
    borderRadius: rounded.md,
    borderWidth: sizing.hairline,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLabel: { ...t.button, color: colors.ink },
  btnDanger: { color: colors.error },

  dayPicker: { gap: spacing.xs },
  pickerLabel: { ...t.caption, color: colors.muted },
  pickerChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  pickerChip: {
    minHeight: sizing.controlHSm,
    paddingHorizontal: spacing.md,
    borderRadius: rounded.pill,
    borderWidth: sizing.hairline,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerChipLabel: { ...t.caption, color: colors.ink },
});
