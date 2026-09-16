// 'expo-router' 의 Tabs 는 57 에서 deprecated — 'expo-router/js-tabs' 를 쓴다.
import { Tabs } from 'expo-router/js-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ColorValue } from 'react-native';

import { Icon, type IconName } from '../../../../components/Icon';
import { colors, sizing, type as t } from '../../../../theme';

// 템플릿 아이콘 outline/filled 짝. 활성이면 filled.
const tabIcon = (name: IconName) => ({ focused, color }: { focused: boolean; color: ColorValue }) => (
  <Icon name={focused ? (`${name}-filled` as IconName) : name} color={color as string} />
);

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
      }}
    >
      <Tabs.Screen name="index" options={{ title: '여행 홈', tabBarIcon: tabIcon('home') }} />
      <Tabs.Screen name="itinerary" options={{ title: '일정', tabBarIcon: tabIcon('calendar') }} />
      <Tabs.Screen name="saved" options={{ title: '저장', tabBarIcon: tabIcon('bookmark') }} />
      <Tabs.Screen name="tools" options={{ title: '도구', tabBarIcon: tabIcon('tools') }} />
    </Tabs>
  );
}
