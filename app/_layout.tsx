import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { db } from '../db';
import migrations from '../drizzle/migrations';
import { colors, fontAssets, rounded, sizing, spacing, type as t } from '../theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts(fontAssets);
  const [migration, setMigration] = useState<'pending' | 'done' | 'failed'>('pending');

  const runMigrations = useCallback(() => {
    setMigration('pending');
    migrate(db, migrations).then(
      () => setMigration('done'),
      () => setMigration('failed'),
    );
  }, []);

  useEffect(runMigrations, [runMigrations]);

  const settled = fontsLoaded && migration !== 'pending';
  useEffect(() => {
    if (settled) SplashScreen.hideAsync();
  }, [settled]);

  if (!settled) return null;

  // 마이그레이션 실패는 데이터 손실 영역이다. 기술 오류를 그대로 노출하지 않고 재시도를 먼저 준다.
  if (migration === 'failed') {
    return (
      <View style={s.fatal}>
        <Text style={s.fatalTitle}>여행 데이터를 열 수 없어요</Text>
        <Text style={s.fatalBody}>
          앱을 다시 시작해도 같은 화면이 나오면, 기기에 저장된 데이터가 손상됐을 수 있어요.
        </Text>
        <Pressable
          style={({ pressed }) => [s.retry, pressed && s.retryPressed]}
          onPress={runMigrations}
          accessibilityRole="button"
        >
          <Text style={s.retryLabel}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  // ponytail: 골격 화면은 네이티브 헤더를 계속 쓴다. 구현이 끝난 화면만 headerShown: false 로 내린다.
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: colors.canvas } }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      {/* S03 은 바텀시트라 뒤가 비쳐야 한다 — 카드 모달이 아니라 transparentModal */}
      <Stack.Screen
        name="create"
        options={{ presentation: 'transparentModal', headerShown: false, animation: 'fade' }}
      />
      <Stack.Screen name="trip/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}

const s = StyleSheet.create({
  fatal: {
    flex: 1,
    backgroundColor: colors.canvas,
    justifyContent: 'center',
    paddingHorizontal: spacing.gutter,
    gap: spacing.sm,
  },
  fatalTitle: { ...t.titleMd, color: colors.ink },
  fatalBody: { ...t.bodySm, color: colors.muted },
  retry: {
    marginTop: spacing.md,
    minHeight: sizing.controlH,
    borderRadius: rounded.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  retryPressed: { backgroundColor: colors.primaryActive },
  retryLabel: { ...t.button, color: colors.onPrimary },
});
