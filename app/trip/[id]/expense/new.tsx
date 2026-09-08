import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { BottomCtaBar, Chip, ScreenHeader } from '../../../../components/ui';
import { db } from '../../../../db';
import { createExpense, tripDaysQuery } from '../../../../db/expenses';
import { tripDays, trips } from '../../../../db/schema';
import { dayMeta } from '../../../../lib/date';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../../../../lib/expense';
import { useDbQuery } from '../../../../lib/useDbQuery';
import { useTripId } from '../../../../lib/useTripId';
import { colors, rounded, sizing, spacing, type as t } from '../../../../theme';

export default function NewExpense() {
  const id = useTripId();
  const router = useRouter();

  const tripRows = useDbQuery(
    () => db.select({ currency: trips.currency }).from(trips).where(eq(trips.id, id)),
    [trips],
    [id],
  );
  const days = useDbQuery(() => tripDaysQuery(id), [tripDays], [id]);

  const tripCurrency = tripRows?.[0]?.currency ?? 'KRW';
  const currencies = [...new Set([tripCurrency, 'KRW'])];

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(tripCurrency);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [dayIndex, setDayIndex] = useState<number>();
  const [method, setMethod] = useState<string>(PAYMENT_METHODS[0]);

  const parsed = Number(amount.replace(/[^0-9.]/g, ''));
  const valid = parsed > 0 && !!title.trim();

  const submit = () => {
    if (!valid) return;
    createExpense({
      tripId: id,
      dayIndex,
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
        <View style={s.chips}>
          {currencies.map((c) => (
            <Chip key={c} label={c} selected={currency === c} onPress={() => setCurrency(c)} />
          ))}
        </View>

        <Field label="항목명">
          <TextInput
            style={s.input}
            value={title}
            onChangeText={setTitle}
            placeholder="무엇에 썼나요?"
            placeholderTextColor={colors.mutedSoft}
          />
        </Field>

        <Field label="카테고리">
          <View style={s.chips}>
            {EXPENSE_CATEGORIES.map((c) => (
              <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
            ))}
          </View>
        </Field>

        <Field label="일차">
          <View style={s.chips}>
            <Chip
              label="미지정"
              selected={dayIndex == null}
              onPress={() => setDayIndex(undefined)}
            />
            {(days ?? []).map((d) => (
              <Chip
                key={d.dayIndex}
                label={`day ${d.dayIndex} · ${dayMeta(d.date)}`}
                selected={dayIndex === d.dayIndex}
                onPress={() => setDayIndex(d.dayIndex)}
              />
            ))}
          </View>
        </Field>

        <Field label="결제수단">
          <View style={s.chips}>
            {PAYMENT_METHODS.map((m) => (
              <Chip key={m} label={m} selected={method === m} onPress={() => setMethod(m)} />
            ))}
          </View>
        </Field>

        {/* 연결 장소는 BS1(장소 퀵 액션)에서 들어올 때 채운다 — 지금은 진입 경로가 없다 */}
      </ScrollView>

      <BottomCtaBar label="저장" onPress={submit} disabled={!valid} />
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
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
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },

  field: { paddingTop: spacing.md, gap: spacing.xs },
  fieldLabel: { ...t.captionUpper, color: colors.muted },
  input: {
    ...t.bodyMd,
    color: colors.ink,
    minHeight: sizing.controlH,
    borderRadius: rounded.md,
    borderWidth: sizing.hairline,
    borderColor: colors.hairline,
    paddingHorizontal: spacing.md,
  },
});
