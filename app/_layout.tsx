import { Stack } from 'expo-router';

export default function RootLayout() {
  // ponytail: 골격 단계에서는 네이티브 헤더를 켜둔다 — 뒤로가기와 타이틀이 공짜다.
  // design.md §8-5 에서 화면별 커스텀 헤더를 만들 때 headerShown 을 끈다.
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Itinova' }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ title: '앱 설정' }} />
      <Stack.Screen name="create" options={{ presentation: 'modal', headerShown: false }} />
    </Stack>
  );
}
