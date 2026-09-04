import { Stack } from 'expo-router';

// 여행 내부 스택. 하단 탭은 (tabs) 그룹 안에만 있고,
// S13~S21 서브 화면은 그 위로 push 되어 탭바를 덮는다 (와이어프레임과 동일).
export default function TripLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
