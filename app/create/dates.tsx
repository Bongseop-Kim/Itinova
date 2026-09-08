import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import RangeCalendar, { type Range } from '../../components/RangeCalendar';
import { BottomCtaBar, ScreenHeader } from '../../components/ui';
import { tripLength } from '../../lib/calendar';
import { colors, spacing, type as t } from '../../theme';

export default function Dates() {
  const router = useRouter();
  const city = useLocalSearchParams<Record<string, string>>();
  const [range, setRange] = useState<Range>({});

  const complete = !!range.start && !!range.end;

  return (
    <View style={s.screen}>
      <ScreenHeader title="언제 떠나세요?" />
      <Text style={s.hint}>시작일과 종료일을 차례로 눌러 주세요</Text>

      <RangeCalendar range={range} onChange={setRange} />

      <BottomCtaBar
        label={complete ? `${tripLength(range.start!, range.end!)}  ·  다음` : '날짜를 선택해 주세요'}
        disabled={!complete}
        onPress={() =>
          router.push({
            pathname: '/create/style',
            params: { ...city, startDate: range.start!, endDate: range.end! },
          })
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  hint: { ...t.bodySm, color: colors.muted, paddingHorizontal: spacing.gutter, paddingBottom: spacing.sm },
});
