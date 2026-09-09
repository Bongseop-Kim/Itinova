import { Stack } from 'expo-router';

// 여행 내부 스택. 하단 탭은 (tabs) 그룹 안에만 있고,
// S13~S21 서브 화면은 그 위로 push 되어 탭바를 덮는다 (와이어프레임과 동일).
export default function TripLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* 구현이 끝난 화면만 자체 헤더를 쓴다. 나머지 골격은 네이티브 헤더를 유지한다. */}
      <Stack.Screen name="add-place" options={{ headerShown: false }} />
      <Stack.Screen name="checklist" options={{ headerShown: false }} />
      <Stack.Screen name="budget" options={{ headerShown: false }} />
      <Stack.Screen name="expense/new" options={{ headerShown: false }} />
      <Stack.Screen name="map" options={{ headerShown: false }} />
      <Stack.Screen name="edit" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
    </Stack>
  );
}
