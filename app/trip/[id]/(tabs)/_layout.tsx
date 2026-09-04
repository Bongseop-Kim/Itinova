// 'expo-router' 의 Tabs 는 57 에서 deprecated — 'expo-router/js-tabs' 를 쓴다.
import { Tabs } from 'expo-router/js-tabs';

export default function TripTabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: '여행 홈' }} />
      <Tabs.Screen name="itinerary" options={{ title: '일정' }} />
      <Tabs.Screen name="saved" options={{ title: '저장' }} />
      <Tabs.Screen name="tools" options={{ title: '도구' }} />
    </Tabs>
  );
}
