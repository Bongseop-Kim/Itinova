import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { BottomCtaBar, Chip, ChipRow, ScreenHeader, TextField } from '../../../../components/ui';
import { db } from '../../../../db';
import { createExpense, expensePlaceQuery, tripDaysQuery } from '../../../../db/expenses';
import { dayItems, places, savedPlaces, tripDays, trips } from '../../../../db/schema';
import { dayMeta } from '../../../../lib/date';
import { expenseDay, initialExpenseCurrency, EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../../../../lib/expense';
import { useDbQuery } from '../../../../lib/useDbQuery';
import { useTripId } from '../../../../lib/useTripId';
import { colors, spacing, type as t } from '../../../../theme';

export default function NewExpense() {
  const id = useTripId();
  const router = useRouter();
  const { day, placeId } = useLocalSearchParams<{ day?: string; placeId?: string }>();

  const tripRows = useDbQuery(
    () => db.select({ currency: trips.currency }).from(trips).where(eq(trips.id, id)),
    [trips],
    [id],
  );
  const days = useDbQuery(() => tripDaysQuery(id), [tripDays], [id]);

  const linkedPlaces = useDbQuery(() => expensePlaceQuery(id, placeId), [places, savedPlaces, dayItems, tripDays], [id, placeId]);
  const tripCurrency = tripRows?.[0]?.currency;
  const currencies = [...new Set([tripCurrency, 'KRW'].filter((c): c is string => !!c))];

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<string>();
  useEffect(() => {
    setCurrency((current) => initialExpenseCurrency(current, tripCurrency));
  }, [tripCurrency]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [selectedDay, setSelectedDay] = useState<string | null>();
  const dayIndex = expenseDay(selectedDay === undefined ? day : selectedDay ?? undefined, days?.length ?? 0);
  const [method, setMethod] = useState<string>(PAYMENT_METHODS[0]);

  const parsed = Number(amount.replace(/[^0-9.]/g, ''));
  const amountError = amount && !(Number.isFinite(parsed) && parsed > 0) ? '0보다 큰 숫자를 입력해 주세요' : undefined;
  const valid = Number.isFinite(parsed) && parsed > 0 && !!title.trim() && !!currency && !!days;

  const submit = () => {
    if (!valid || !currency) return;
    createExpense({
      tripId: id,
      dayIndex,
      placeId,
      title,
      category,
      currency,
      amount: parsed,
      paymentMethod: method,
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={s.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader title="비용 추가" />
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <TextInput
          style={s.amount}
          value={amount}
          onChangeText={setAmount}
          placeholder="0"
          placeholderTextColor={colors.mutedSoft}
          keyboardType="decimal-pad"
          accessibilityLabel="금액"
        />
        {amountError ? <Text style={s.error} accessibilityRole="alert">{amountError}</Text> : null}
        <ChipRow>
          {currencies.map((c) => (
            <Chip key={c} label={c} selected={currency === c} onPress={() => setCurrency(c)} />
          ))}
        </ChipRow>

        <TextField label="항목명" value={title} onChangeText={setTitle} placeholder="무엇에 썼나요?" style={s.field} />

        <ChipField label="카테고리">
          <ChipRow>
            {EXPENSE_CATEGORIES.map((c) => (
              <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
            ))}
          </ChipRow>
        </ChipField>

        <ChipField label="일차">
          <ChipRow>
            <Chip label="미지정" selected={dayIndex == null} onPress={() => setSelectedDay(null)} />
            {(days ?? []).map((d) => (
              <Chip
                key={d.dayIndex}
                label={`day ${d.dayIndex} · ${dayMeta(d.date)}`}
                selected={dayIndex === d.dayIndex}
                onPress={() => setSelectedDay(String(d.dayIndex))}
              />
            ))}
          </ChipRow>
        </ChipField>

        <ChipField label="결제수단">
          <ChipRow>
            {PAYMENT_METHODS.map((m) => (
              <Chip key={m} label={m} selected={method === m} onPress={() => setMethod(m)} />
            ))}
          </ChipRow>
        </ChipField>

        {linkedPlaces?.[0] ? <Text style={s.placeName}>연결 장소 · {linkedPlaces[0].name}</Text> : null}
      </ScrollView>

      <BottomCtaBar label="저장" onPress={submit} disabled={!valid} />
    </KeyboardAvoidingView>
  );
}

/** 칩 그룹 라벨. 입력 필드는 TextField 가 라벨을 갖는다. */
function ChipField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: spacing.gutter, paddingBottom: spacing.xl, gap: spacing.sm },

  amount: {
    ...t.displayMd,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
    paddingVertical: spacing.sm,
  },
  error: { ...t.caption, color: colors.error },
  field: { paddingTop: spacing.md, gap: spacing.xs },
  fieldLabel: { ...t.caption, color: colors.muted },
  placeName: { ...t.bodySm, color: colors.muted },
});
