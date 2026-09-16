import { useRef, useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { tripDaysQuery } from '../db/expenses';
import { addPlacesToDay, savePlaces } from '../db/places';
import { tripDays } from '../db/schema';
import { dayMeta } from '../lib/date';
import { useDbQuery } from '../lib/useDbQuery';
import { colors, spacing, type as t } from '../theme';
import { BottomSheet, ListRow } from './ui';

/** BS3 일차 선택. */
export default function DayPickerSheet({ tripId, placeId, name, onClose }: { tripId: string; placeId: string; name: string; onClose: () => void }) {
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
    <BottomSheet title="어느 일차에 담을까요?" closeLabel="일차 선택 닫기" onClose={onClose}>
      <Text style={s.body}>{name}</Text>
      {!!error && <Text style={s.error} accessibilityRole="alert">{error}</Text>}
      {days?.map((day) => (
        <ListRow key={day.dayIndex} title={`day ${day.dayIndex}`} subtitle={dayMeta(day.date)} leading="calendar" trailing="chevron" onPress={() => choose(day.dayIndex)} />
      ))}
      <ListRow title="저장함에만 담기" leading="bookmark" trailing="chevron" onPress={() => choose()} />
    </BottomSheet>
  );
}
const s = StyleSheet.create({
  body: { ...t.bodySm, color: colors.muted, paddingHorizontal: spacing.gutter, paddingBottom: spacing.xs },
  error: { ...t.caption, color: colors.error, paddingHorizontal: spacing.gutter },
});
