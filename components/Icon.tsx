import { Image } from 'expo-image';
import type { StyleProp } from 'react-native';
import type { ImageStyle } from 'expo-image';

import { colors, sizing } from '../theme';

// Designbase 템플릿 아이콘 (assets/icons/README.md). Metro 는 require 경로가 정적이어야 해서 이름→파일 맵을 여기 한 곳에 둔다.
// 단색 SVG 를 expo-image tintColor 로 칠한다 — 새 의존성 없음.
const ICONS = {
  'arrow-down': require('../assets/icons/arrow-down.svg'),
  'arrow-up': require('../assets/icons/arrow-up.svg'),
  'bookmark': require('../assets/icons/bookmark.svg'),
  'bookmark-filled': require('../assets/icons/bookmark-filled.svg'),
  'calendar': require('../assets/icons/calendar.svg'),
  'calendar-filled': require('../assets/icons/calendar-filled.svg'),
  'cat-attraction': require('../assets/icons/cat-attraction.svg'),
  'cat-cafe': require('../assets/icons/cat-cafe.svg'),
  'cat-etc': require('../assets/icons/cat-etc.svg'),
  'cat-food': require('../assets/icons/cat-food.svg'),
  'cat-stay': require('../assets/icons/cat-stay.svg'),
  'cat-transport': require('../assets/icons/cat-transport.svg'),
  'check': require('../assets/icons/check.svg'),
  'chevron-down': require('../assets/icons/chevron-down.svg'),
  'chevron-left': require('../assets/icons/chevron-left.svg'),
  'chevron-right': require('../assets/icons/chevron-right.svg'),
  'chevron-up': require('../assets/icons/chevron-up.svg'),
  'clock': require('../assets/icons/clock.svg'),
  'close': require('../assets/icons/close.svg'),
  'close-small': require('../assets/icons/close-small.svg'),
  'drag': require('../assets/icons/drag.svg'),
  'edit': require('../assets/icons/edit.svg'),
  'exchange': require('../assets/icons/exchange.svg'),
  'gps': require('../assets/icons/gps.svg'),
  'home': require('../assets/icons/home.svg'),
  'home-filled': require('../assets/icons/home-filled.svg'),
  'info': require('../assets/icons/info.svg'),
  'location': require('../assets/icons/location.svg'),
  'map': require('../assets/icons/map.svg'),
  'map-filled': require('../assets/icons/map-filled.svg'),
  'marker-current': require('../assets/icons/marker-current.svg'),
  'marker-numbered': require('../assets/icons/marker-numbered.svg'),
  'minus': require('../assets/icons/minus.svg'),
  'more': require('../assets/icons/more.svg'),
  'plus': require('../assets/icons/plus.svg'),
  'route': require('../assets/icons/route.svg'),
  'search': require('../assets/icons/search.svg'),
  'settings': require('../assets/icons/settings.svg'),
  'share': require('../assets/icons/share.svg'),
  'sun': require('../assets/icons/sun.svg'),
  'tools': require('../assets/icons/tools.svg'),
  'tools-filled': require('../assets/icons/tools-filled.svg'),
  'translate': require('../assets/icons/translate.svg'),
  'trash': require('../assets/icons/trash.svg'),
  'wallet': require('../assets/icons/wallet.svg'),
  'world-clock': require('../assets/icons/world-clock.svg'),
};

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = sizing.iconLg,
  color = colors.ink,
  style,
}: {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image
      source={ICONS[name]}
      style={[{ width: size, height: size }, style]}
      tintColor={color}
      contentFit="contain"
      accessible={false}
    />
  );
}
