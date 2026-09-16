import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GestureDetector, useTapGesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedProps, useAnimatedRef, useSharedValue, type SharedValue } from 'react-native-reanimated';
import Sortable from 'react-native-sortables';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PlaceMap from '../../../components/PlaceMap';
import { mapData } from '../../../lib/map';
import { BottomCtaBar, Checkbox, Icon, ScreenHeader } from '../../../components/ui';
import { db } from '../../../db';
import { deleteItems, moveItemsToDay, reorderDay, toggleVisited } from '../../../db/dayItems';
import { dayItems, places, tripDays, trips } from '../../../db/schema';
import { dayMeta } from '../../../lib/date';
import { groupByDay, type DaySection } from '../../../lib/itinerary';
import { moveItem, sortByDistance } from '../../../lib/reorder';
import { useDbQuery } from '../../../lib/useDbQuery';
import { useTripId } from '../../../lib/useTripId';
import { colors, mapStyle, motion, rounded, sizing, spacing, type as t } from '../../../theme';

function DragHandle({ name, scrollEnabled }: { name: string; scrollEnabled: SharedValue<boolean> }) {
  // 부모 ScrollView가 핸들 드래그를 먼저 취소하지 않도록 UI 스레드에서 스크롤을 잠근다.
  const touch = useTapGesture({
    maxDistance: sizing.touchMin,
    onTouchesDown: () => {
      scrollEnabled.value = false;
    },
    onFinalize: () => {
      scrollEnabled.value = true;
    },
  });
  return (
    <GestureDetector gesture={touch}>
      <View collapsable={false}>
        <Sortable.Handle style={s.handle}>
          <View accessible accessibilityLabel={`${name} 순서 변경 핸들`} accessibilityHint="위로/아래로 버튼으로 순서를 바꿀 수 있어요">
            <Icon name="drag" color={colors.muted} />
          </View>
        </Sortable.Handle>
      </View>
    </GestureDetector>
  );
}

export default function EditItinerary() {
  const id = useTripId();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string[]>([]);
  const [movingTo, setMovingTo] = useState(false);
  const scrollRef = useAnimatedRef<ScrollView>();
  const scrollEnabled = useSharedValue(true);
  const scrollProps = useAnimatedProps(() => ({ scrollEnabled: scrollEnabled.value }));
  const [screenReader, setScreenReader] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isScreenReaderEnabled().then((enabled) => {
      if (active) setScreenReader(enabled);
    });
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active) setReduceMotion(enabled);
    });
    const readerSubscription = AccessibilityInfo.addEventListener('screenReaderChanged', setScreenReader);
    const motionSubscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      active = false;
      readerSubscription.remove();
      motionSubscription.remove();
    };
  }, []);

  const trip = useDbQuery(() => db.select().from(trips).where(eq(trips.id, id)), [trips], [id])?.[0];
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

  const sortDay = (section: DaySection) => reorderDay(sortByDistance(section.data).map((i) => i.id));

  return (
    <View style={s.screen}>
      <ScreenHeader title="일정 편집" action="완료" onAction={() => router.back()} />

      <View style={s.map}>
        <PlaceMap
          {...mapData(sections)}
          center={trip?.lat != null && trip.lng != null ? { lat: trip.lat, lng: trip.lng } : null}
          selectedIds={selected}
          onPinPress={toggleSelect}
        />
      </View>

      <Animated.ScrollView
        ref={scrollRef}
        animatedProps={scrollProps}
        contentContainerStyle={[s.list, { paddingBottom: spacing.xxl + insets.bottom }]}
      >
        {sections.map((section) => (
          <View key={section.dayId}>
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
            <Sortable.Grid
              columns={1}
              data={section.data}
              customHandle
              dragActivationDelay={0}
              dragActivationFailOffset={sizing.touchMin}
              scrollableRef={scrollRef}
              sortEnabled={!screenReader}
              itemEntering={null}
              itemExiting={null}
              activeItemScale={1}
              activeItemShadowOpacity={0}
              activationAnimationDuration={reduceMotion ? 0 : motion.duration.fast}
              dropAnimationDuration={reduceMotion ? 0 : motion.duration.normal}
              onDragEnd={({ data, fromIndex, toIndex }) => {
                if (fromIndex !== toIndex) reorderDay(data.map((item) => item.id));
              }}
              renderItem={({ item, index }) => {
                const on = selected.includes(item.id);
                return (
                  <View style={s.row}>
                    <DragHandle name={item.name} scrollEnabled={scrollEnabled} />
                    <Checkbox checked={on} label={`${item.name} 선택`} onPress={() => toggleSelect(item.id)} />
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
                    {screenReader ? (
                      <>
                        <Pressable
                          onPress={() => move(section as DaySection, index, index - 1)}
                          disabled={index === 0}
                          hitSlop={8}
                          accessibilityRole="button"
                          accessibilityLabel="위로"
                        >
                          <Icon name="arrow-up" color={index === 0 ? colors.hairline : colors.ink} />
                        </Pressable>
                        <Pressable
                          onPress={() => move(section as DaySection, index, index + 1)}
                          disabled={index === section.data.length - 1}
                          hitSlop={8}
                          accessibilityRole="button"
                          accessibilityLabel="아래로"
                        >
                          <Icon name="arrow-down" color={index === section.data.length - 1 ? colors.hairline : colors.ink} />
                        </Pressable>
                      </>
                    ) : null}
                  </View>
                );
              }}
            />
          </View>
        ))}
      </Animated.ScrollView>

      {selected.length ? (
        movingTo ? (
          <View style={[s.bar, { paddingBottom: spacing.sm + insets.bottom }]}>
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
          </View>
        ) : (
          // 템플릿 Button-fixed 2버튼. 삭제는 되돌릴 수 없으므로 주 버튼으로 올리지 않는다.
          <BottomCtaBar
            secondaryLabel={`삭제 (${selected.length})`}
            secondaryDestructive
            onSecondary={() => {
              deleteItems(selected);
              setSelected([]);
            }}
            label={`다른 일차로 이동 (${selected.length})`}
            onPress={() => setMovingTo(true)}
          />
        )
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  map: {
    height: mapStyle.collapsedHeight,
    marginHorizontal: spacing.gutter,
    borderRadius: rounded.lg,
    backgroundColor: colors.surfaceCard,
    overflow: 'hidden',
  },

  list: { paddingHorizontal: spacing.gutter, paddingBottom: spacing.xxl },
  dayHeader: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
    gap: spacing.xxs,
  },
  dayLabel: { ...t.titleMd, color: colors.ink },
  dayMeta: { ...t.caption, color: colors.muted },
  dayActions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.xxs,
  },
  dayAction: {
    ...t.caption,
    color: colors.ink,
    minHeight: sizing.touchMin,
    lineHeight: sizing.touchMin,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: sizing.touchMin,
    paddingVertical: spacing.xs,
    borderBottomWidth: sizing.hairline,
    borderBottomColor: colors.hairlineSoft,
  },
  handle: {
    width: sizing.touchMin,
    minHeight: sizing.touchMin,
    alignItems: 'center',
    justifyContent: 'center',
  },
  order: { ...t.caption, color: colors.muted, width: 16, textAlign: 'center' },
  rowBody: { flexGrow: 1, flexShrink: 1 },
  name: { ...t.titleSm, color: colors.ink },
  nameVisited: { color: colors.mutedSoft },
  visited: { ...t.caption, color: colors.muted },

  bar: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    borderTopWidth: sizing.hairline,
    borderTopColor: colors.hairline,
    backgroundColor: colors.canvas,
  },

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
