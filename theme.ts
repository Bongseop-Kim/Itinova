import type { TextStyle } from 'react-native';

// docs/design-system.md 의 토큰을 그대로 옮긴 것. 값을 새로 만들지 않는다.
// 규약: 숫자에 단위 없음 · lineHeight 는 절대 dp · fontWeight 금지(family 로 지정) · 색은 문자열.

export const colors = {
  primary: '#0a0a0a',
  primaryActive: '#1f1f1f',
  primaryDisabled: '#e5e5e5',
  ink: '#0a0a0a',
  body: '#3a3a3a',
  bodyStrong: '#1a1a1a',
  muted: '#6a6a6a',
  mutedSoft: '#9a9a9a', // 플레이스홀더 전용 (2.70:1). 읽어야 하는 문장에 쓰지 않는다
  hairline: '#e5e5e5',
  hairlineSoft: '#f0f0f0',
  canvas: '#fffaf0',
  surfaceSoft: '#faf5e8',
  surfaceCard: '#f5f0e0',
  surfaceStrong: '#ebe6d6',
  surfaceDark: '#0a1a1a',
  surfaceDarkElevated: '#1a2a2a',
  onPrimary: '#ffffff',
  onDark: '#ffffff',
  onDarkSoft: '#a0a0a0',
  brandPink: '#ff4d8b',
  brandTeal: '#1a3a3a',
  brandLavender: '#b8a4ed',
  brandPeach: '#ffb084',
  brandOchre: '#e8b94a',
  brandMint: '#a4d4c5',
  brandCoral: '#ff6b5a',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  scrim: 'rgba(10,10,10,0.4)',
} as const;

// Android 는 weight 를 합성하지 않으므로 weight 마다 별도 family 를 로드한다.
export const fonts = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
} as const;

export const fontAssets = {
  'Pretendard-Regular': require('./assets/font/Pretendard-Regular.otf'),
  'Pretendard-Medium': require('./assets/font/Pretendard-Medium.otf'),
  'Pretendard-SemiBold': require('./assets/font/Pretendard-SemiBold.otf'),
  'Pretendard-Bold': require('./assets/font/Pretendard-Bold.otf'),
};

export const tracking = { normal: 0, tight: -0.4 } as const;

export const type = {
  displayXl: { fontFamily: fonts.bold, fontSize: 34, lineHeight: 44, letterSpacing: -0.4 },
  displayLg: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 38, letterSpacing: -0.4 },
  displayMd: { fontFamily: fonts.semibold, fontSize: 24, lineHeight: 32, letterSpacing: -0.4 },
  displaySm: { fontFamily: fonts.semibold, fontSize: 20, lineHeight: 27, letterSpacing: -0.4 },
  titleLg: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 24, letterSpacing: 0 },
  titleMd: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22, letterSpacing: 0 },
  titleSm: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 20, letterSpacing: 0 },
  bodyMd: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, letterSpacing: 0 },
  bodySm: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, letterSpacing: 0 },
  caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, letterSpacing: 0 },
  captionUpper: { fontFamily: fonts.semibold, fontSize: 11, lineHeight: 15, letterSpacing: 1.2 },
  button: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 20, letterSpacing: 0 },
  tabLabel: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 15, letterSpacing: 0 },
  numeric: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0,
    fontVariant: ['tabular-nums'],
  },
  // as const 대신 satisfies — as const 는 fontVariant 를 readonly 로 만들어 TextStyle 할당이 깨진다.
} satisfies Record<string, TextStyle>;

export const rounded = { xs: 6, sm: 8, md: 12, lg: 16, xl: 24, sheet: 24, pill: 9999, full: 9999 } as const;

export const spacing = {
  xxs: 4, xs: 8, sm: 12, md: 16, lg: 24, xl: 32, xxl: 48,
  gutter: 20,   // 화면 좌우 고정 여백
  section: 32,  // 모바일 섹션 리듬
} as const;

export const sizing = {
  touchMin: 44,
  controlH: 48,
  controlHSm: 36,
  tabBarH: 56,
  headerH: 56,
  iconSm: 16, iconMd: 20, iconLg: 24,
  avatar: 40,
  hairline: 1,
} as const;

// boxShadow 문자열 하나로 양 플랫폼 (New Arch). shadowOffset 등 iOS 전용 prop 은 쓰지 않는다.
export const elevation = {
  flat: undefined,
  card: '0px 2px 8px rgba(10,10,10,0.06)',
  raised: '0px 4px 12px rgba(10,10,10,0.10)',
  float: '0px 6px 16px rgba(10,10,10,0.14)',
  sheet: '0px -4px 20px rgba(10,10,10,0.12)',
} as const;

export const motion = {
  duration: { fast: 100, normal: 200, slow: 300 },
  easing: {
    standard: [0.35, 0, 0.35, 1],
    enter: [0, 0, 0.15, 1],
    exit: [0.35, 0, 1, 1],
  },
} as const;

// 태블릿은 컬럼을 늘리지 않고 콘텐츠 최대 폭만 잡는다.
export const layout = { contentMaxWidth: 560 } as const;

export const mapStyle = {
  collapsedHeight: 160, expandedHeight: 320,
  pinSize: 28, selectedPinSize: 34, pinBorderWidth: 2,
  routeWidth: 2, lineDashPattern: [4, 6] as const,
} as const;
