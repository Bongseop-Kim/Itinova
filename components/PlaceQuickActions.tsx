import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';

import { db } from '../db';
import { updateItemDetails } from '../db/dayItems';
import { dayItems, places, tripDays } from '../db/schema';
import { categoryLabel } from '../lib/category';
import { directionsUrl, validTime } from '../lib/map';
import { colors, spacing, type as t } from '../theme';
import { BottomSheet, ListRow, TextField } from './ui';

/** BS1 장소 퀵 액션. */
export default function PlaceQuickActions({ itemId, onClose }: { itemId: string; onClose: () => void }) {
  const router = useRouter();
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
    <BottomSheet title={row?.place.name ?? '장소'} closeLabel="퀵 액션 닫기" onClose={onClose}>
      {row ? <>
        <ListRow
          title="장소 상세 보기"
          subtitle={`${categoryLabel(row.place.category)} · day ${row.day.dayIndex}`}
          leading="info"
          trailing="chevron"
          onPress={() => { onClose(); router.push(`/place/${row.place.id}?tripId=${row.day.tripId}`); }}
        />
        <View style={s.form}>
          <TextField label="방문 시간" value={time} onChangeText={setTime} placeholder="HH:mm" autoCapitalize="none" maxLength={5} error={error || undefined} />
          <TextField label="메모" value={memo} onChangeText={setMemo} multiline placeholder="기억할 내용을 적어 주세요" accessibilityLabel="장소 메모" />
        </View>
        <ListRow title="시간·메모 저장" leading="check" onPress={save} />
        <ListRow title="비용 추가" leading="wallet" trailing="chevron" onPress={() => { onClose(); router.push(`/trip/${row.day.tripId}/expense/new?day=${row.day.dayIndex}&placeId=${row.place.id}`); }} />
        <ListRow title="길찾기" leading="route" trailing="chevron" onPress={() => Linking.openURL(directionsUrl(row.place)).catch(() => Alert.alert('길찾기를 열 수 없어요', '지도 앱이나 네트워크 연결을 확인해 주세요.'))} />
      </> : <Text style={s.body}>삭제된 장소예요.</Text>}
    </BottomSheet>
  );
}
const s = StyleSheet.create({
  form: { paddingHorizontal: spacing.gutter, paddingVertical: spacing.xs, gap: spacing.sm },
  body: { ...t.bodySm, color: colors.muted, paddingHorizontal: spacing.gutter },
});
