import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomCtaBar, Chip, Question } from '../../components/ui';
import { createTrip } from '../../db/createTrip';
import { COMPANIONS, STYLES } from '../../lib/tripStyle';
import { colors, spacing, type as t } from '../../theme';

export default function TripStyle() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const p = useLocalSearchParams<{
    name: string; region: string; countryCode: string; currency: string;
    lat: string; lng: string; startDate: string; endDate: string;
  }>();

  const [companion, setCompanion] = useState<string>();
  const [styles, setStyles] = useState<string[]>([]);

  const toggleStyle = (v: string) =>
    setStyles((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]));

  const submit = () => {
    const id = createTrip({
      cityName: p.name,
      countryCode: p.countryCode,
      currency: p.currency,
      lat: Number(p.lat),
      lng: Number(p.lng),
      startDate: p.startDate,
      endDate: p.endDate,
      companion,
      styles: styles.length ? styles : undefined,
      origin: 'manual',
    });
    // 생성 흐름은 모달 스택이다. 닫고 새 여행의 일정 보드로 교체한다.
    router.dismissAll();
    router.replace(`/trip/${id}/itinerary`);
  };

  return (
    <View style={s.screen}>
      <View style={[s.header, { paddingTop: insets.top }]}>
        <Pressable onPress={submit} hitSlop={10} accessibilityRole="button">
          <Text style={s.skip}>건너뛰기</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <Question>누구와 함께 가나요?</Question>
        <View style={s.chips}>
          {COMPANIONS.map((c) => (
            <Chip
              key={c}
              label={c}
              selected={companion === c}
              onPress={() => setCompanion((cur) => (cur === c ? undefined : c))}
            />
          ))}
        </View>

        <View style={s.section}>
          <Question>어떤 여행을 원하세요?</Question>
          <Text style={s.sub}>복수 선택</Text>
        </View>
        <View style={s.chips}>
          {STYLES.map((v) => (
            <Chip key={v} label={v} selected={styles.includes(v)} onPress={() => toggleStyle(v)} />
          ))}
        </View>
      </ScrollView>

      <BottomCtaBar label="여행 만들기" onPress={submit} hint={`${p.name} · ${p.startDate} ~ ${p.endDate}`} />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  header: { paddingHorizontal: spacing.gutter, alignItems: 'flex-end', justifyContent: 'center', minHeight: 56 },
  skip: { ...t.button, color: colors.muted, minHeight: 44, lineHeight: 44 },
  content: { paddingHorizontal: spacing.gutter, paddingBottom: spacing.xxl, gap: spacing.sm },
  section: { paddingTop: spacing.section, gap: spacing.xxs },
  sub: { ...t.bodySm, color: colors.muted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
});
