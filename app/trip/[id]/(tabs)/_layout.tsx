// 'expo-router' 의 Tabs 는 57 에서 deprecated — 'expo-router/js-tabs' 를 쓴다.
import { Tabs } from 'expo-router/js-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, sizing, type as t } from '../../../../theme';

export default function TripTabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.canvas },
        tabBarStyle: {
          backgroundColor: colors.canvas,
          // 토큰의 tab-bar-h 는 "56 + bottom safe-area inset" 이다. 고정 높이만 주면 인셋이 무시된다.
          height: sizing.tabBarH + insets.bottom,
          paddingBottom: insets.bottom,
          borderTopWidth: sizing.hairline,
          borderTopColor: colors.hairline,
        },
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.mutedSoft,
        tabBarLabelStyle: t.tabLabel,
        // 아이콘 세트가 미정이다 (design-system.md §자산 로드맵에 탭 아이콘 없음).
        // 기본 플레이스홀더(▼)가 나오는 것보다 라벨만 두는 편이 낫다.
        tabBarIcon: () => null,
        tabBarIconStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: '여행 홈' }} />
      <Tabs.Screen name="itinerary" options={{ title: '일정' }} />
      <Tabs.Screen name="saved" options={{ title: '저장' }} />
      <Tabs.Screen name="tools" options={{ title: '도구' }} />
    </Tabs>
  );
}
