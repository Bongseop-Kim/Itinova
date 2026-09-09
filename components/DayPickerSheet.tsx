import { useRef, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tripDaysQuery } from '../db/expenses';
import { addPlacesToDay, savePlaces } from '../db/places';
import { tripDays } from '../db/schema';
import { dayMeta } from '../lib/date';
import { useDbQuery } from '../lib/useDbQuery';
import { colors, elevation, rounded, sizing, spacing, type as t } from '../theme';

export default function DayPickerSheet({ tripId, placeId, name, onClose }: { tripId: string; placeId: string; name: string; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const days = useDbQuery(() => tripDaysQuery(tripId), [tripDays], [tripId]);
  const busy = useRef(false);
  const [error, setError] = useState('');
  const choose = (dayIndex?: number) => {
    if (busy.current) return;
    busy.current = true;
    try {
      if (dayIndex != null) addPlacesToDay(tripId, dayIndex, [placeId]);
      else savePlaces(tripId, [placeId]);
      onClose();
      Alert.alert(dayIndex != null ? `day ${dayIndex}에 담았어요` : '저장함에 담았어요', name);
    } catch {
      busy.current = false;
      setError('담지 못했어요. 여행과 일차를 확인하고 다시 시도해 주세요.');
    }
  };
  return (
    <Modal transparent visible onRequestClose={onClose}>
      <View style={s.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="일차 선택 닫기" />
        <View style={[s.sheet, { paddingBottom: spacing.lg + insets.bottom }]} accessibilityViewIsModal>
          <View style={s.header}><Text style={s.title}>어느 일차에 담을까요?</Text><Pressable style={s.action} onPress={onClose} accessibilityRole="button"><Text style={s.button}>닫기</Text></Pressable></View>
          <Text style={s.body}>{name}</Text>
          {!!error && <Text style={s.error} accessibilityRole="alert">{error}</Text>}
          <ScrollView>{days?.map((day) => <Pressable key={day.dayIndex} style={s.row} onPress={() => choose(day.dayIndex)} accessibilityRole="button"><Text style={s.button}>day {day.dayIndex}</Text><Text style={s.body}>{dayMeta(day.date)}</Text></Pressable>)}</ScrollView>
          <Pressable style={s.row} onPress={() => choose()} accessibilityRole="button"><Text style={s.button}>저장함에만 담기</Text></Pressable>
        </View>
      </View>
    </Modal>
  );
}
const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.scrim },
  sheet: { maxHeight: '80%', backgroundColor: colors.canvas, borderTopLeftRadius: rounded.sheet, borderTopRightRadius: rounded.sheet, paddingHorizontal: spacing.gutter, paddingTop: spacing.md, boxShadow: elevation.sheet, gap: spacing.xs },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, title: { ...t.titleLg, color: colors.ink, flex: 1 },
  body: { ...t.bodySm, color: colors.muted }, button: { ...t.button, color: colors.ink }, error: { ...t.caption, color: colors.error },
  action: { minHeight: sizing.touchMin, justifyContent: 'center' },
  row: { minHeight: sizing.touchMin, paddingVertical: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderBottomWidth: sizing.hairline, borderBottomColor: colors.hairlineSoft },
});
