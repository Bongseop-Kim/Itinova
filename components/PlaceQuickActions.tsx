import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { db } from '../db';
import { updateItemDetails } from '../db/dayItems';
import { dayItems, places, tripDays } from '../db/schema';
import { categoryLabel } from '../lib/category';
import { directionsUrl, validTime } from '../lib/map';
import { colors, elevation, rounded, sizing, spacing, type as t } from '../theme';

export default function PlaceQuickActions({ itemId, onClose }: { itemId: string; onClose: () => void }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const row = db.select({ item: dayItems, place: places, day: tripDays }).from(dayItems)
    .innerJoin(places, eq(places.id, dayItems.placeId)).innerJoin(tripDays, eq(tripDays.id, dayItems.tripDayId))
    .where(eq(dayItems.id, itemId)).all()[0];
  const [time, setTime] = useState(row?.item.startTime ?? '');
  const [memo, setMemo] = useState(row?.item.memo ?? '');
  const [error, setError] = useState('');
  const save = () => {
    if (!validTime(time)) { setError('시간은 09:30처럼 HH:mm으로 입력해 주세요.'); return; }
    try { updateItemDetails(itemId, time, memo); onClose(); }
    catch { setError('저장하지 못했어요. 다시 시도해 주세요.'); }
  };
  return (
    <Modal transparent visible onRequestClose={onClose}>
      <KeyboardAvoidingView style={s.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="퀵 액션 닫기" />
        <ScrollView style={s.sheet} contentContainerStyle={[s.content, { paddingBottom: spacing.lg + insets.bottom }]} keyboardShouldPersistTaps="handled" accessibilityViewIsModal>
          <Pressable onPress={onClose} accessibilityRole="button" style={s.action}><Text style={s.button}>닫기</Text></Pressable>
          {row ? <>
            <Pressable style={s.action} accessibilityRole="button" onPress={() => { onClose(); router.push(`/place/${row.place.id}?tripId=${row.day.tripId}`); }}>
              <Text style={s.title}>{row.place.name} ›</Text>
              <Text style={s.body}>{categoryLabel(row.place.category)} · day {row.day.dayIndex}</Text>
            </Pressable>
            <Text style={s.body}>시간 추가</Text>
            <TextInput value={time} onChangeText={setTime} style={s.input} placeholder="HH:mm" placeholderTextColor={colors.mutedSoft} accessibilityLabel="방문 시간" autoCapitalize="none" maxLength={5} />
            <Text style={s.body}>메모 추가</Text>
            <TextInput value={memo} onChangeText={setMemo} style={s.input} multiline accessibilityLabel="장소 메모" placeholder="기억할 내용을 적어 주세요" placeholderTextColor={colors.mutedSoft} />
            {!!error && <Text style={s.error} accessibilityRole="alert">{error}</Text>}
            <Pressable onPress={save} style={s.action} accessibilityRole="button"><Text style={s.button}>시간·메모 저장</Text></Pressable>
            <Pressable style={s.action} accessibilityRole="button" onPress={() => { onClose(); router.push(`/trip/${row.day.tripId}/expense/new?day=${row.day.dayIndex}&placeId=${row.place.id}`); }}><Text style={s.button}>비용 추가</Text></Pressable>
            <Pressable style={s.action} accessibilityRole="button" onPress={() => Linking.openURL(directionsUrl(row.place)).catch(() => Alert.alert('길찾기를 열 수 없어요', '지도 앱이나 네트워크 연결을 확인해 주세요.'))}><Text style={s.button}>길찾기</Text></Pressable>
          </> : <Text style={s.body}>삭제된 장소예요.</Text>}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.scrim },
  sheet: { flexGrow: 0, maxHeight: '90%', backgroundColor: colors.canvas, borderTopLeftRadius: rounded.sheet, borderTopRightRadius: rounded.sheet, boxShadow: elevation.sheet },
  content: { paddingHorizontal: spacing.gutter, paddingTop: spacing.md, gap: spacing.xs },
  title: { ...t.titleLg, color: colors.ink }, body: { ...t.bodySm, color: colors.muted },
  action: { minHeight: sizing.touchMin, justifyContent: 'center', gap: spacing.xxs }, button: { ...t.button, color: colors.ink },
  input: { ...t.bodyMd, color: colors.ink, minHeight: sizing.controlH, padding: spacing.md, borderRadius: rounded.md, borderWidth: sizing.hairline, borderColor: colors.hairline },
  error: { ...t.caption, color: colors.error },
});
