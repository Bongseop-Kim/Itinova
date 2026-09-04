---
version: alpha
name: Itinova-design-system
platform: react-native
description: >
  Clay(claymation-meets-data) 비주얼 언어를 Expo/RN 여행 앱에 이식한 시스템.
  크림 캔버스(#fffaf0) 위에 near-black 잉크와 6색 채도 카드, 넉넉한 라운드.
  3D 클레이 일러스트를 브랜드 전압으로 삼되, 자산은 점진 확보한다.
  모든 값은 RN StyleSheet에 그대로 들어가는 형태(단위 없는 숫자, 절대 lineHeight)다.

# ── 값 규약 ────────────────────────────────────────────────
# 숫자에 단위 없음. lineHeight는 배수가 아니라 절대 dp.
# fontWeight는 문자열. padding shorthand 없음(Vertical/Horizontal 분리).
# 색은 문자열, 투명은 'transparent'.

colors:
  primary: "#0a0a0a"
  primary-active: "#1f1f1f"
  primary-disabled: "#e5e5e5"
  ink: "#0a0a0a"
  body: "#3a3a3a"
  body-strong: "#1a1a1a"
  muted: "#6a6a6a"
  muted-soft: "#9a9a9a"
  hairline: "#e5e5e5"
  hairline-soft: "#f0f0f0"
  canvas: "#fffaf0"
  surface-soft: "#faf5e8"
  surface-card: "#f5f0e0"
  surface-strong: "#ebe6d6"
  surface-dark: "#0a1a1a"
  surface-dark-elevated: "#1a2a2a"
  on-primary: "#ffffff"
  on-dark: "#ffffff"
  on-dark-soft: "#a0a0a0"
  brand-pink: "#ff4d8b"
  brand-teal: "#1a3a3a"
  brand-lavender: "#b8a4ed"
  brand-peach: "#ffb084"
  brand-ochre: "#e8b94a"
  brand-mint: "#a4d4c5"
  brand-coral: "#ff6b5a"
  success: "#22c55e"
  warning: "#f59e0b"
  error: "#ef4444"
  scrim: "rgba(10,10,10,0.4)"

fonts:
  # Pretendard (SIL OFL, 무료). duego-saas-mobile-v2 에서 검증된 선택.
  # 한글·라틴·숫자를 한 페이스로 커버한다 — 본문 대부분이 한글인 앱의 유일한 현실적 선택.
  # Android는 weight를 합성하지 않으므로 weight마다 별도 family를 로드한다.
  regular: "Pretendard-Regular"
  medium: "Pretendard-Medium"
  semibold: "Pretendard-SemiBold"
  bold: "Pretendard-Bold"

typography:
  # fontSize/lineHeight 짝은 dds-m 의 t 스케일을 승계했다 (한글 프로덕션 검증).
  # 비율 약 1.32~1.36 — Pretendard 는 내부 leading 이 넉넉해 웹 습관인 1.5 는 헐겁다.
  # 예외: 긴 글을 읽는 body-md/body-sm 만 +1~2dp.
  # letterSpacing 은 tracking.tight(-0.4) 를 상한으로 둔다. 한글 글자틀은 정사각형이라
  # 웹 원본의 -1.2dp 같은 음수 자간은 자소가 붙어 보인다.
  display-xl:   { font: bold,     fontSize: 34, lineHeight: 44, letterSpacing: -0.4 }
  display-lg:   { font: bold,     fontSize: 28, lineHeight: 38, letterSpacing: -0.4 }
  display-md:   { font: semibold, fontSize: 24, lineHeight: 32, letterSpacing: -0.4 }
  display-sm:   { font: semibold, fontSize: 20, lineHeight: 27, letterSpacing: -0.4 }
  title-lg:     { font: semibold, fontSize: 18, lineHeight: 24, letterSpacing: 0 }
  title-md:     { font: semibold, fontSize: 16, lineHeight: 22, letterSpacing: 0 }
  title-sm:     { font: semibold, fontSize: 15, lineHeight: 20, letterSpacing: 0 }
  body-md:      { font: regular,  fontSize: 16, lineHeight: 24, letterSpacing: 0 }
  body-sm:      { font: regular,  fontSize: 14, lineHeight: 20, letterSpacing: 0 }
  caption:      { font: medium,   fontSize: 13, lineHeight: 18, letterSpacing: 0 }
  caption-upper:{ font: semibold, fontSize: 11, lineHeight: 15, letterSpacing: 1.2 }
  button:       { font: semibold, fontSize: 15, lineHeight: 20, letterSpacing: 0 }
  tab-label:    { font: medium,   fontSize: 11, lineHeight: 15, letterSpacing: 0 }
  numeric:      { font: semibold, fontSize: 16, lineHeight: 22, letterSpacing: 0, fontVariant: ["tabular-nums"] }

tracking:
  normal: 0
  tight: -0.4

rounded:
  xs: 6
  sm: 8
  md: 12
  lg: 16
  xl: 24
  sheet: 24        # 바텀시트 상단 두 모서리만
  pill: 9999
  full: 9999

spacing:
  xxs: 4
  xs: 8
  sm: 12
  md: 16
  lg: 24
  xl: 32
  xxl: 48
  gutter: 20       # 화면 좌우 고정 여백
  section: 32      # 모바일 섹션 리듬 (웹의 96 아님)

sizing:
  touch-min: 44          # iOS HIG / WCAG
  control-h: 48          # 버튼·입력 기본 높이 (폰은 44보다 48이 편함)
  control-h-sm: 36       # 칩, 소형 버튼
  tab-bar-h: 56          # + bottom safe-area inset
  header-h: 56           # + top safe-area inset
  icon-sm: 16
  icon-md: 20
  icon-lg: 24
  avatar: 40
  hairline: 1            # StyleSheet.hairlineWidth 를 쓰면 레티나에서 더 얇다

motion:
  # dds-m 에서 그대로 승계. 임의 duration·bezier 를 만들지 않는다.
  duration:
    fast: 100      # pressed 같은 짧은 상태 피드백
    normal: 200    # 일반 전환
    slow: 300      # 시트·모달 진입
  easing:
    standard: [0.35, 0, 0.35, 1]   # 상태 변화, 일반 전환
    enter: [0, 0, 0.15, 1]         # 들어오는 요소 (감속)
    exit: [0.35, 0, 1, 1]          # 나가는 요소 (가속)

elevation:
  # boxShadow는 New Architecture 전용(Expo 57 기본), Android 9+ / iOS 공통.
  # shadowOffset·shadowRadius·shadowOpacity는 iOS 전용이므로 쓰지 않는다.
  flat: null
  card:    "0px 2px 8px rgba(10,10,10,0.06)"
  raised:  "0px 4px 12px rgba(10,10,10,0.10)"
  float:   "0px 6px 16px rgba(10,10,10,0.14)"   # FAB, 하단 고정 CTA 바
  sheet:   "0px -4px 20px rgba(10,10,10,0.12)"  # 바텀시트

components:
  # ── 전역 크롬 ──
  screen:
    backgroundColor: "{colors.canvas}"
    paddingHorizontal: "{spacing.gutter}"
    # 상하 인셋은 useSafeAreaInsets(). SafeAreaView 하드코딩 금지.
  screen-header:
    backgroundColor: "{colors.canvas}"
    height: "{sizing.header-h}"
    titleTypography: "{typography.title-lg}"
    titleColor: "{colors.ink}"
    elevation: "{elevation.flat}"          # 스크롤 전엔 그림자 없음
    elevationScrolled: "{elevation.card}"  # 스크롤 시작하면 card
  tab-bar:
    backgroundColor: "{colors.canvas}"
    height: "{sizing.tab-bar-h}"
    borderTopWidth: "{sizing.hairline}"
    borderTopColor: "{colors.hairline}"
    activeTintColor: "{colors.ink}"
    inactiveTintColor: "{colors.muted-soft}"
    labelTypography: "{typography.tab-label}"
  bottom-cta-bar:
    backgroundColor: "{colors.canvas}"
    paddingHorizontal: "{spacing.gutter}"
    paddingTop: "{spacing.sm}"
    borderTopWidth: "{sizing.hairline}"
    borderTopColor: "{colors.hairline}"
    # paddingBottom = spacing.sm + insets.bottom

  # ── 버튼 ──
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    borderRadius: "{rounded.md}"
    height: "{sizing.control-h}"
    paddingHorizontal: "{spacing.lg}"
  button-primary-pressed:
    backgroundColor: "{colors.primary-active}"
  button-primary-disabled:
    backgroundColor: "{colors.primary-disabled}"
    textColor: "{colors.muted}"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    borderRadius: "{rounded.md}"
    borderWidth: "{sizing.hairline}"
    borderColor: "{colors.hairline}"
    height: "{sizing.control-h}"
    paddingHorizontal: "{spacing.lg}"
  button-on-color:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    borderRadius: "{rounded.md}"
    height: "{sizing.control-h}"
  button-text:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    minHeight: "{sizing.touch-min}"
  icon-button:
    backgroundColor: transparent
    tintColor: "{colors.ink}"
    size: "{sizing.touch-min}"
    borderRadius: "{rounded.full}"
  fab:
    backgroundColor: "{colors.primary}"
    tintColor: "{colors.on-primary}"
    size: 56
    borderRadius: "{rounded.full}"
    elevation: "{elevation.float}"

  # ── 리스트 / 카드 ──
  list-row:
    backgroundColor: "{colors.canvas}"
    minHeight: "{sizing.touch-min}"
    paddingVertical: "{spacing.sm}"
    titleTypography: "{typography.title-sm}"
    subtitleTypography: "{typography.body-sm}"
    subtitleColor: "{colors.muted}"
    separatorWidth: "{sizing.hairline}"
    separatorColor: "{colors.hairline-soft}"
  trip-card:
    # S01 홈 여행 카드. 이미지 위 잉크 텍스트, 크림 카드가 기본.
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    borderRadius: "{rounded.lg}"
    padding: "{spacing.md}"
    elevation: "{elevation.card}"
    titleTypography: "{typography.title-lg}"
    metaTypography: "{typography.caption}"
    metaColor: "{colors.muted}"
  trip-card-active:
    # 진행중 여행 1건. 채도 카드로 승격해 홈에서 유일하게 튄다.
    backgroundColor: "{colors.brand-teal}"
    textColor: "{colors.on-dark}"
    borderRadius: "{rounded.xl}"
    padding: "{spacing.lg}"
  place-card:
    # S09 캐러셀 / S11 저장함 / S15 결과
    backgroundColor: "{colors.canvas}"
    borderRadius: "{rounded.lg}"
    borderWidth: "{sizing.hairline}"
    borderColor: "{colors.hairline}"
    padding: "{spacing.sm}"
    imageRadius: "{rounded.md}"
    titleTypography: "{typography.title-sm}"
    metaTypography: "{typography.caption}"
    metaColor: "{colors.muted}"
  itinerary-card:
    # S10 순번 배지 장소 카드
    backgroundColor: "{colors.canvas}"
    borderRadius: "{rounded.lg}"
    borderWidth: "{sizing.hairline}"
    borderColor: "{colors.hairline}"
    padding: "{spacing.sm}"
    gap: "{spacing.sm}"
  order-badge:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.caption}"
    size: 24
    borderRadius: "{rounded.full}"
  distance-badge:
    # 카드 사이 "8.1km"
    backgroundColor: transparent
    textColor: "{colors.muted}"
    typography: "{typography.caption}"
    paddingVertical: "{spacing.xs}"
  day-header:
    # "day 1  9.9/수" + 날씨
    backgroundColor: "{colors.canvas}"
    labelTypography: "{typography.title-md}"
    labelColor: "{colors.ink}"
    metaTypography: "{typography.caption}"
    metaColor: "{colors.muted}"
    paddingTop: "{spacing.lg}"
    paddingBottom: "{spacing.sm}"
  feature-card:
    # 채도 카드. variant 로만 색이 바뀐다.
    borderRadius: "{rounded.xl}"
    padding: "{spacing.lg}"
    titleTypography: "{typography.display-sm}"
    bodyTypography: "{typography.body-sm}"
    variants:
      pink:     { backgroundColor: "{colors.brand-pink}",     textColor: "{colors.ink}" }
      teal:     { backgroundColor: "{colors.brand-teal}",     textColor: "{colors.on-dark}" }
      lavender: { backgroundColor: "{colors.brand-lavender}", textColor: "{colors.ink}" }
      peach:    { backgroundColor: "{colors.brand-peach}",    textColor: "{colors.ink}" }
      ochre:    { backgroundColor: "{colors.brand-ochre}",    textColor: "{colors.ink}" }
      cream:    { backgroundColor: "{colors.surface-card}",   textColor: "{colors.ink}" }
  empty-state:
    # 일러스트 자리를 항상 확보한다 (§ 자산 로드맵)
    illustrationSize: 160
    titleTypography: "{typography.title-md}"
    bodyTypography: "{typography.body-sm}"
    bodyColor: "{colors.muted}"
    gap: "{spacing.md}"

  # ── 입력 ──
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    placeholderColor: "{colors.muted-soft}"
    typography: "{typography.body-md}"
    borderRadius: "{rounded.md}"
    borderWidth: "{sizing.hairline}"
    borderColor: "{colors.hairline}"
    height: "{sizing.control-h}"
    paddingHorizontal: "{spacing.md}"
  text-input-focused:
    borderColor: "{colors.ink}"
    borderWidth: 1.5
  text-input-error:
    borderColor: "{colors.error}"
    messageTypography: "{typography.caption}"
    messageColor: "{colors.error}"
  search-bar:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    borderRadius: "{rounded.pill}"
    height: "{sizing.control-h}"
    paddingHorizontal: "{spacing.md}"
  amount-input:
    # S18 비용 입력
    typography: "{typography.display-md}"
    fontVariant: ["tabular-nums"]
    textColor: "{colors.ink}"

  # ── 선택 ──
  chip:
    backgroundColor: transparent
    textColor: "{colors.muted}"
    typography: "{typography.caption}"
    borderRadius: "{rounded.pill}"
    borderWidth: "{sizing.hairline}"
    borderColor: "{colors.hairline}"
    height: "{sizing.control-h-sm}"
    paddingHorizontal: "{spacing.md}"
  chip-selected:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    borderColor: "{colors.primary}"
  segment-tab:
    # S11 전체/관광/맛집/숙소, S13 day 필터
    backgroundColor: transparent
    textColor: "{colors.muted}"
    typography: "{typography.title-sm}"
    borderRadius: "{rounded.pill}"
    height: "{sizing.control-h-sm}"
    paddingHorizontal: "{spacing.md}"
  segment-tab-active:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
  checkbox:
    size: 24
    borderRadius: "{rounded.xs}"
    borderWidth: 1.5
    borderColor: "{colors.hairline}"
    checkedBackgroundColor: "{colors.primary}"
    checkedTintColor: "{colors.on-primary}"
    hitSlop: 10
  badge-pill:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    borderRadius: "{rounded.pill}"
    paddingVertical: "{spacing.xxs}"
    paddingHorizontal: "{spacing.sm}"
  progress-bar:
    # S07 1/5~5/5
    height: 4
    borderRadius: "{rounded.pill}"
    trackColor: "{colors.hairline}"
    fillColor: "{colors.primary}"

  # ── 오버레이 ──
  bottom-sheet:
    backgroundColor: "{colors.canvas}"
    borderTopLeftRadius: "{rounded.sheet}"
    borderTopRightRadius: "{rounded.sheet}"
    paddingHorizontal: "{spacing.gutter}"
    paddingTop: "{spacing.md}"
    elevation: "{elevation.sheet}"
    scrimColor: "{colors.scrim}"
    handleWidth: 36
    handleHeight: 4
    handleColor: "{colors.hairline}"
    # paddingBottom = spacing.lg + insets.bottom
  toast:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.body-sm}"
    borderRadius: "{rounded.md}"
    paddingVertical: "{spacing.sm}"
    paddingHorizontal: "{spacing.md}"
    elevation: "{elevation.raised}"

  # ── 지도 ──
  map-preview:
    borderRadius: "{rounded.lg}"
    collapsedHeight: 160
    expandedHeight: 320
  map-pin:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.caption}"
    size: 28
    borderRadius: "{rounded.full}"
    borderWidth: 2
    borderColor: "{colors.canvas}"
  map-pin-selected:
    backgroundColor: "{colors.brand-pink}"
    size: 34
  map-route:
    strokeColor: "{colors.primary}"
    strokeWidth: 2
    lineDashPattern: [4, 6]

  # ── 채팅 ──
  chat-bubble-user:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    borderRadius: "{rounded.lg}"
    padding: "{spacing.sm}"
  chat-bubble-ai:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    borderRadius: "{rounded.lg}"
    padding: "{spacing.sm}"
  disclaimer:
    typography: "{typography.caption}"
    textColor: "{colors.muted}"
---

## 개요

Itinova는 Clay의 비주얼 언어를 여행 앱에 이식한다. 크림 캔버스(`{colors.canvas}` #fffaf0) 위에 near-black 잉크, 넉넉한 라운드, 그리고 **채도 높은 단색 카드**가 화면당 한 번씩만 튀는 구조다. 다른 여행 앱이 흰 배경 + 사진 그리드로 수렴할 때, 크림 톤과 클레이 일러스트가 유일한 차별점이 된다.

원본 Clay 문서는 마케팅 웹사이트 시스템이었다. 여기서는 색·라운드·spacing 베이스·"크림 일관성" 계약만 승계하고, 타입 스케일·컴포넌트·레이아웃 규칙은 폰 화면에 맞게 재산출했다.

**앱 전체가 라이트 모드 전용이다.** `app.json`의 `userInterfaceStyle: "light"`가 이 계약을 강제한다. 다크 팔레트는 정의하지 않는다 — 크림 캔버스가 시스템의 정체성이라 다크 대응은 다른 브랜드를 만드는 일이 된다.

## RN 변환 규약

문서의 모든 값은 `StyleSheet.create`에 그대로 들어간다. 웹 CSS 습관이 새어 들어오는 지점들:

| 하지 말 것 | 할 것 |
| --- | --- |
| `fontSize: '16px'` | `fontSize: 16` |
| `lineHeight: 1.55` | `lineHeight: 24` — RN은 **절대 dp**. 배수를 넣으면 줄이 겹친다 |
| `padding: '12px 20px'` | `paddingVertical: 12, paddingHorizontal: 20` — shorthand 없음 |
| `fontFamily: 'Inter, sans-serif'` | 단일 폰트명 하나. 폴백 스택 개념이 없다 |
| `fontWeight: 500` + 커스텀 폰트 | Android는 weight를 합성하지 않는다. **weight마다 별도 family**를 로드하고 `font` 토큰으로 지정 |
| `shadowOffset` / `shadowRadius` | iOS 전용. `boxShadow` 문자열 하나로 양 플랫폼 (New Arch, Android 9+) |
| RN 내장 `SafeAreaView` | `react-native-safe-area-context` 의 것을 `edges` 명시해서 쓰거나 `useSafeAreaInsets()` |
| `backgroundColor: transparent` (bare) | `'transparent'` 문자열 |

`{typography.*}`의 `font` 필드는 `fonts` 맵의 키를 가리킨다. 현재 전부 `null` — 시스템 폰트로 렌더된다. 폰트를 붙이는 시점에 `fonts` 맵만 바꾸면 타이포 토큰 전체가 따라온다.

## 색

### 브랜드 · 액센트
- **Primary** (`{colors.primary}` #0a0a0a): 모든 주 CTA, 헤드라인 잉크, 순번 배지, 지도 핀.
- **Brand Pink** (`{colors.brand-pink}` #ff4d8b): 선택 상태 지도 핀, 강조 채도 카드.
- **Brand Teal** (`{colors.brand-teal}` #1a3a3a): 진행중 여행 카드. 홈에서 유일하게 어두운 면.
- **Brand Lavender / Peach / Ochre / Mint / Coral**: 채도 카드와 일러스트 액센트.

### 표면
- **Canvas** (`{colors.canvas}` #fffaf0): 모든 화면 바닥. 크림 틴트가 시스템의 정체성이다.
- **Surface Soft** (`{colors.surface-soft}` #faf5e8): 강조 밴드.
- **Surface Card** (`{colors.surface-card}` #f5f0e0): 크림 카드, 검색바, 활성 세그먼트 탭, AI 말풍선.
- **Surface Dark** (`{colors.surface-dark}` #0a1a1a): 토스트. 그 외 용도 없음.
- **Hairline** (`{colors.hairline}` #e5e5e5): 카드·입력 테두리, 탭바 상단선.
- **Scrim** (`{colors.scrim}`): 바텀시트 뒤 딤.

### 텍스트
`{colors.ink}` 헤드라인 · `{colors.body}` 본문 · `{colors.muted}` 보조/메타 · `{colors.muted-soft}` 플레이스홀더 전용(대비 2.7:1 — 콘텐츠에 쓰지 않는다) · `{colors.on-primary}` 어두운 면 위 텍스트.

### 대비 (실측)

채도 카드 위 텍스트 색은 계산 결과가 정한다. `{colors.ink}` 기준 대비비:

| 배경 | ink 대비 | 흰색 대비 | 텍스트 |
|---|---|---|---|
| `{colors.brand-mint}` | 12.07 | 1.64 | ink |
| `{colors.brand-peach}` | 11.12 | 1.78 | ink |
| `{colors.brand-ochre}` | 10.81 | 1.83 | ink |
| `{colors.brand-lavender}` | 9.02 | 2.19 | ink |
| `{colors.brand-coral}` | 7.07 | 2.80 | ink |
| `{colors.brand-pink}` | **6.30** | **3.14** | **ink** — 흰 텍스트는 AA 미달 |
| `{colors.brand-teal}` | 1.61 | 12.28 | 흰색 |

`{colors.brand-teal}`만 흰 텍스트를 쓴다. 나머지 여섯은 전부 잉크다. 특히 핑크는 채도가 높아 흰 텍스트가 어울려 보이지만 3.14:1로 AA(4.5)에 미달한다.

캔버스 위 텍스트: `{colors.body}` 12.4 · `{colors.muted}` 5.20 · `{colors.muted-soft}` **2.70**. muted-soft는 플레이스홀더 전용이고 읽어야 하는 문장에 쓰지 않는다.

### 시맨틱
`{colors.success}` · `{colors.warning}` · `{colors.error}` — 폼 검증과 데이터 손실 경고에만. 장식으로 쓰지 않는다.

## 타이포그래피

### 폰트
**Pretendard** 하나로 간다. SIL OFL 무료이고 한글·라틴·숫자를 한 페이스로 커버한다. 본문 대부분이 한글인 앱에서 라틴 전용 폰트(Inter, Recoleta)는 애초에 후보가 아니다.

`duego-saas-mobile-v2`(`assets/font/`)에 Regular·Medium·SemiBold·Bold·ExtraBold OTF가 이미 있다. 그대로 복사한다.

```ts
// app/_layout.tsx
useFonts({
  'Pretendard-Regular': require('../assets/font/Pretendard-Regular.otf'),
  'Pretendard-Medium': require('../assets/font/Pretendard-Medium.otf'),
  'Pretendard-SemiBold': require('../assets/font/Pretendard-SemiBold.otf'),
  'Pretendard-Bold': require('../assets/font/Pretendard-Bold.otf'),
})
```

**Android는 `fontWeight`로 커스텀 폰트의 굵기를 만들어내지 않는다.** weight마다 별도 family를 로드하고 `{typography.*}`의 `font` 필드로 지정한다. `fontWeight`는 쓰지 않는다.

Clay 원본의 "디스플레이는 500 weight, 그 이상 금지" 규칙은 이식하지 않았다. 그 규칙은 Plain Black이라는 둥근 페이스를 전제했고, Pretendard는 중립적 산세리프라 500으로는 디스플레이 위계가 서지 않는다. 대신 display는 Bold/SemiBold, 본문은 Regular로 간다. 둥근 브랜드 성격은 폰트가 아니라 **라운드·크림 캔버스·클레이 일러스트**가 담당한다.

### 스케일

| 토큰 | Size / LineHeight | Family | Tracking | 용도 |
|---|---|---|---|---|
| `{typography.display-xl}` | 34 / 44 | Bold | -0.4 | 여행 홈 D-day 헤더 (S09) |
| `{typography.display-lg}` | 28 / 38 | Bold | -0.4 | 홈 인사, 빈 상태 헤드 |
| `{typography.display-md}` | 24 / 32 | SemiBold | -0.4 | 화면 대제목, 금액 입력 (S18) |
| `{typography.display-sm}` | 20 / 27 | SemiBold | -0.4 | 채도 카드 제목, 섹션 헤드 |
| `{typography.title-lg}` | 18 / 24 | SemiBold | 0 | 헤더 타이틀, 여행 카드 제목 |
| `{typography.title-md}` | 16 / 22 | SemiBold | 0 | 일차 라벨, 카드 제목 |
| `{typography.title-sm}` | 15 / 20 | SemiBold | 0 | 리스트 행 제목, 장소명 |
| `{typography.body-md}` | 16 / 24 | Regular | 0 | 본문, 입력값, 말풍선 |
| `{typography.body-sm}` | 14 / 20 | Regular | 0 | 보조 설명 |
| `{typography.caption}` | 13 / 18 | Medium | 0 | 메타, 배지, 거리, 날짜 |
| `{typography.caption-upper}` | 11 / 15 | SemiBold | 1.2 | 섹션 라벨 |
| `{typography.button}` | 15 / 20 | SemiBold | 0 | 버튼 라벨 |
| `{typography.tab-label}` | 11 / 15 | Medium | 0 | 하단 탭 라벨 |
| `{typography.numeric}` | 16 / 22 | SemiBold | 0 | 금액·환율·거리 — `tabular-nums` 필수 |

크기/행간 짝은 `dds-m`의 t 스케일을 승계했다. 비율이 1.32~1.36으로 웹 습관(1.5)보다 촘촘한데, Pretendard는 내부 leading이 넉넉해 1.5를 주면 문단이 흩어진다. 긴 글을 읽는 `body-md`·`body-sm`만 +1~2dp 예외다.

### 원칙
- `lineHeight`는 항상 `fontSize`보다 크다. 같게 두면 Android에서 디센더가 잘린다.
- 금액·환율·시각처럼 자릿수가 바뀌는 숫자는 `{typography.numeric}`. 고정폭 숫자가 없으면 가계부 합계가 갱신될 때마다 흔들린다.
- 한 화면에 `display-*`는 하나만. 두 개 이상이면 위계가 사라진다.
- 음수 자간은 `{tracking.tight}` (-0.4)가 상한이다. 한글 글자틀은 정사각형이라 웹 원본의 -1.2dp 같은 값에서 자소가 붙어 보인다.
- 굵기는 토큰이 정한다. 부분 강조가 필요하면 `fontWeight`가 아니라 별도 Text로 분리한다.

## 레이아웃

### 간격
4dp 베이스. `{spacing.xxs}` 4 · `{spacing.xs}` 8 · `{spacing.sm}` 12 · `{spacing.md}` 16 · `{spacing.lg}` 24 · `{spacing.xl}` 32 · `{spacing.xxl}` 48.

- **화면 좌우 거터**: `{spacing.gutter}` (20). 전 화면 고정. 카드 안쪽은 카드 자신의 padding을 쓴다.
- **섹션 리듬**: `{spacing.section}` (32). 웹 원본의 96은 폰 한 화면을 통째로 먹으므로 쓰지 않는다.
- **카드 내부**: 채도 카드 `{spacing.lg}` (24), 일반 카드 `{spacing.sm}`~`{spacing.md}`.

### Safe area
`react-native-safe-area-context`를 쓴다. RN 내장 `SafeAreaView`는 쓰지 않는다 (iOS 전용, `edges` 제어 불가).

`edges`를 명시한 `SafeAreaView`(safe-area-context 쪽)나 `useSafeAreaInsets()` 둘 다 괜찮다. 중요한 건 **어느 변에 인셋을 줄지 명시하는 것**이다. `edges` 없이 감싸면 하단까지 잡혀 탭바·CTA 바가 이중으로 밀린다.

- 화면 배경은 인셋 **밖까지** 칠한다 (`{colors.canvas}`가 노치 뒤까지).
- 헤더: `paddingTop = insets.top`, 높이는 그 위에 `{sizing.header-h}`.
- 하단 고정 CTA / 바텀시트: `paddingBottom = {spacing.sm} + insets.bottom`.
- 지도 전체화면(S13)은 인셋을 무시하고 풀블리드, 컨트롤만 인셋 안으로.

### 스크롤
- 리스트는 `FlatList`/`SectionList`. `ScrollView` + `.map()`은 일정·저장함·가계부처럼 길어지는 목록에 쓰지 않는다.
- `contentContainerStyle`에 하단 여백 `{spacing.xxl}` + `insets.bottom`을 준다. 마지막 항목이 탭바에 가리는 게 가장 흔한 버그다.
- 키보드가 뜨는 화면(S18 비용 입력, S19 채팅)은 `KeyboardAvoidingView` + `keyboardShouldPersistTaps="handled"`.

### 폰 / 태블릿
`app.json`에 `supportsTablet: true`. 웹 breakpoint는 적용하지 않는다.

- 기준 폭 360dp. 모든 컴포넌트가 여기서 성립해야 한다.
- 태블릿(≥768dp)은 **콘텐츠 최대 폭 560dp 중앙 정렬**로 처리한다. 컬럼을 늘리지 않는다 — 화면 수 21개짜리 앱에 태블릿 전용 레이아웃을 따로 만들 이유가 없다.
- `orientation: "portrait"` 고정. 가로 레이아웃은 정의하지 않는다.

### Dynamic Type
사용자 글자 크기 설정을 막지 않는다. `allowFontScaling`을 끄는 건 배지·핀처럼 크기가 고정된 요소에만 허용한다. 대신 **텍스트를 담는 컨테이너에 고정 높이를 주지 않는다** — `height` 대신 `minHeight`.

## 깊이

| 토큰 | 값 | 용도 |
|---|---|---|
| `{elevation.flat}` | 없음 | 화면 배경, 섹션, 스크롤 전 헤더 |
| `{elevation.card}` | `0px 2px 8px rgba(10,10,10,0.06)` | 여행 카드, 스크롤된 헤더 |
| `{elevation.raised}` | `0px 4px 12px rgba(10,10,10,0.10)` | 토스트, 드래그 중인 항목 |
| `{elevation.float}` | `0px 6px 16px rgba(10,10,10,0.14)` | FAB, 하단 고정 CTA 바 |
| `{elevation.sheet}` | `0px -4px 20px rgba(10,10,10,0.12)` | 바텀시트 |

`boxShadow`는 New Architecture 전용이고 Android 9+에서 동작한다 (Expo 57은 New Arch 기본). `shadowOffset`·`shadowRadius`·`shadowOpacity`는 iOS 전용이므로 쓰지 않는다.

깊이는 최소한만 쓴다. 이 시스템의 위계는 그림자가 아니라 **크림 바탕과 채도 면의 대비**에서 나온다. 테두리(`{colors.hairline}`)로 충분한 곳에 그림자를 얹지 않는다.

## 모션

`dds-m`에서 그대로 승계했다. 임의 duration·bezier를 만들지 않는다.

| duration | 값 | 용도 |
|---|---|---|
| `{motion.duration.fast}` | 100ms | pressed 같은 짧은 상태 피드백 |
| `{motion.duration.normal}` | 200ms | 일반 전환 |
| `{motion.duration.slow}` | 300ms | 바텀시트·모달 진입 |

| easing | bezier | 용도 |
|---|---|---|
| `{motion.easing.standard}` | `[0.35, 0, 0.35, 1]` | 상태 변화, 일반 전환 |
| `{motion.easing.enter}` | `[0, 0, 0.15, 1]` | 들어오는 요소 (감속) |
| `{motion.easing.exit}` | `[0.35, 0, 1, 1]` | 나가는 요소 (가속) |

- 기본 조합: 상태 변화 `fast` + `standard`, 진입 `slow` + `enter`, 퇴장 `normal` + `exit`.
- `opacity`와 `transform`만 애니메이션한다. `width`·`height`·`margin`은 매 프레임 레이아웃을 다시 계산한다.
- OS의 Reduce Motion 설정을 존중한다.
- 라이브러리는 `react-native-reanimated`. 첫 애니메이션이 필요한 시점에 설치한다.

## 라운드

`{rounded.xs}` 6 배지 · `{rounded.sm}` 8 소형 · `{rounded.md}` 12 버튼·입력 · `{rounded.lg}` 16 카드 · `{rounded.xl}` 24 채도 카드 · `{rounded.sheet}` 24 바텀시트 상단 · `{rounded.pill}` 999 칩·검색바.

pill/full은 `9999`. 정원이 필요한 곳(아바타, FAB, 순번 배지)은 `borderRadius: size / 2`가 더 안전하다 — 크기가 바뀔 때 따라온다.

## 컴포넌트

화면 ID는 `docs/design.md` § 2 인벤토리를 따른다.

### 전역 크롬
**`screen`** — 모든 화면의 루트. `{colors.canvas}` 배경 + `{spacing.gutter}` 좌우 여백. 지도 화면만 예외로 풀블리드.

**`screen-header`** — 56dp + top inset. 스크롤 전엔 그림자 없이 크림에 녹아 있다가, 스크롤이 시작되면 `{elevation.card}`가 붙는다.

**`tab-bar`** — 여행 내부에서만 나타난다 (여행홈·일정·저장·도구). 크림 배경 + 상단 hairline. 활성 잉크 / 비활성 `{colors.muted-soft}`.

**`bottom-cta-bar`** — 화면 하단 고정 액션 (S01 `여행 일정짜기`, S05 `N박 M일`, S15 `day N 일정에 N개 담기`). 크림 배경 + 상단 hairline, `paddingBottom`에 bottom inset을 더한다.

### 버튼
**`button-primary`** — near-black 채움, 48dp 높이, `{rounded.md}`. 화면당 주 CTA 하나.
**`button-secondary`** — 크림 + hairline 테두리.
**`button-on-color`** — 채도 카드 위에서만. 흰 배경 + 잉크 텍스트.
**`icon-button`** — 44dp 터치 영역. 아이콘이 20dp여도 터치는 44dp다.
**`fab`** — 56dp 원형. 지도 화면의 장소 추가에만 쓴다. 리스트 화면은 `bottom-cta-bar`를 쓴다.

누르는 상태는 `Pressable`의 `pressed`로 `{components.button-primary-pressed}` 배경만 바꾼다. 웹의 hover 개념은 없다.

### 카드
**`trip-card`** / **`trip-card-active`** — S01 홈. 진행중 1건만 `{colors.brand-teal}` 채도 카드로 승격하고 나머지는 크림 카드다. 홈에서 눈이 가야 할 곳이 하나로 고정된다.

**`place-card`** — S09 캐러셀, S11 저장함, S15 검색 결과. 크림 + hairline, 이미지 `{rounded.md}`.

**`itinerary-card`** + **`order-badge`** + **`distance-badge`** — S10의 핵심 3종. 순번 배지는 24dp 원형 near-black. 거리 배지는 카드 **사이** 여백에 텍스트만 놓는다 (배경 없음) — 이게 이 화면의 시그니처다.

**`day-header`** — `day 1  9.9/수` + 날씨. 일차 라벨은 `{typography.title-md}`, 날짜·날씨는 `{typography.caption}` muted.

**`feature-card`** — 채도 카드. `variant`로만 색이 바뀐다. **한 화면에 두 장 이상 쓰지 않는다.** 웹처럼 6색을 연속 나열하는 롱스크롤은 앱에 없다.

**`empty-state`** — 160dp 일러스트 자리 + 제목 + 설명. 빈 상태가 많은 앱이라(저장함, 체크리스트, 가계부, 지도) 일러스트 자산이 가장 먼저 필요한 곳이다.

### 입력
**`text-input`** — 48dp, `{rounded.md}`, hairline 테두리. 포커스 시 테두리가 잉크 1.5dp로 두꺼워진다.
**`text-input-error`** — 테두리 `{colors.error}` + 아래 caption 메시지. **에러는 색만으로 표시하지 않는다** — 메시지 텍스트가 항상 함께 간다.
**`search-bar`** — 크림 카드 배경 + pill. S04 도시 검색, S15 장소 검색.
**`amount-input`** — S18 금액. `{typography.display-md}` + `tabular-nums`.

### 선택
**`chip`** / **`chip-selected`** — S06 동행·성향, S07 AI 질문. 선택 시 near-black 채움. 36dp 높이지만 터치 영역은 44dp를 확보한다.
**`segment-tab`** / **`segment-tab-active`** — S09 카테고리, S11 필터, S13 day 필터. 활성만 크림 카드 배경.
**`checkbox`** — S16 체크리스트, S14 방문 완료. 24dp + `hitSlop: 10`.
**`progress-bar`** — S07 5단계 진행. 4dp 트랙.

### 오버레이
**`bottom-sheet`** — BS1 장소 퀵 액션, BS2 생성 방식, BS3 일차 선택. 상단 두 모서리만 24dp, 36×4 핸들, 뒤에 scrim. `paddingBottom`에 bottom inset.

**`toast`** — 시스템에서 유일하게 어두운 표면. 짧게 뜨고 사라지므로 크림 계약을 깨지 않는다.

### 지도
**`map-preview`** — S10 상단 접기/펼치기. 160 ↔ 320dp.
**`map-pin`** / **`map-pin-selected`** — 28dp 원형 순번 핀, 크림 2dp 테두리로 지도 위에서 분리된다. 선택 시 `{colors.brand-pink}` 34dp.
**`map-route`** — 일차 경로 점선. `lineDashPattern: [4, 6]`.

지도 타일 색은 우리가 통제하지 않는다. 지도 위 요소는 **테두리로 분리**하고 색에만 의존하지 않는다.

### 채팅
**`chat-bubble-user`** (near-black) / **`chat-bubble-ai`** (크림 카드) / **`disclaimer`** (muted caption). S19와 S08 하단의 정확성 고지에 쓴다.

## 로딩 · 빈 · 에러

외부 데이터에 의존하는 화면(S08 AI 생성, S12 날씨·환율, S15 장소 검색, S20 장소 상세)은 세 상태를 모두 처리한다.

| 상태 | 처리 |
|---|---|
| 형태를 아는 초기 로딩 | 실제 콘텐츠와 **같은 구조의 스켈레톤** (`{colors.surface-card}` 면) |
| 형태를 모르는 짧은 대기 | 작은 스피너 |
| 진행률을 아는 작업 | `{components.progress-bar}` |
| 결과 0건 | `{components.empty-state}` — 문구 + 다음 행동 |
| 실패 | 재시도 행동을 먼저 제시. 기술 오류 문구를 그대로 노출하지 않는다 |

- 첫 진입에 스피너와 스켈레톤을 연속으로 겹쳐 보이지 않는다.
- AI 생성(S07→S08)은 유일하게 긴 대기다. 스피너가 아니라 클레이 캐릭터 + 진행 문구로 처리한다 (§ 자산 로드맵 3번).
- 로컬 SQLite 조회는 즉시 반환된다. 로딩 상태를 만들지 않는다.

## 자산 로드맵

3D 클레이메이션 일러스트는 이 시스템의 브랜드 전압이다. 지금은 하나도 없다. **자산 자리를 미리 확보한 채로 만들고, 확보되는 대로 채워 넣는다.**

우선순위:

1. **빈 상태 4종** (`{components.empty-state}`, 160dp) — 저장함 / 체크리스트 / 가계부 / 지도 장소 없음. 사용자가 가장 먼저 마주치고, 일러스트 없이는 가장 허전한 화면이다.
2. **홈 히어로** (S01) — 여행이 없을 때의 첫 화면. 앱의 첫인상.
3. **AI 생성 대기** (S07→S08) — 대기 시간이 있는 유일한 지점. 움직이는 클레이 캐릭터가 체감 시간을 줄인다.
4. **온보딩 / 여행 생성 완료** — 있으면 좋고 없어도 된다.

확보 전까지: 해당 자리를 **비워두거나** `{colors.surface-card}` 크림 면 + 단색 아이콘으로 채운다. **플랫 벡터 일러스트나 스톡 이미지로 대체하지 않는다** — 나중에 클레이 자산이 들어올 때 두 양식이 섞여 시스템이 무너진다. 빈 자리가 잘못된 자리보다 낫다.

일러스트 제작 시 팔레트는 `{colors.brand-peach}` · `{colors.brand-ochre}` · `{colors.brand-lavender}` · `{colors.brand-mint}`를 축으로 잡고, 배경은 항상 투명(크림 캔버스 위에 얹힌다).

## Do / Don't

### Do
- 모든 화면 바닥은 `{colors.canvas}`. 크림 틴트는 협상 대상이 아니다.
- 채도 카드는 **화면당 한 장**. 눈이 갈 곳을 하나로 고정한다.
- 터치 대상은 최소 44dp. 시각 크기가 작으면 `hitSlop`으로 늘린다.
- 금액·거리·시각은 `tabular-nums`.
- 리스트는 `FlatList`. 하단 여백에 `insets.bottom`을 더한다.
- 에러는 색 + 텍스트. 색만으로 상태를 말하지 않는다.
- 채도 카드 위 텍스트는 `{colors.brand-teal}`만 흰색, 나머지는 전부 잉크 (§ 대비).
- 일러스트 자리는 자산이 없어도 레이아웃에 확보해 둔다.

### Don't
- 쿨 그레이 배경 금지. `#fff`, `#f5f5f5` 전부 크림 계약 위반이다.
- 다크 팔레트 추가 금지. 라이트 전용이 시스템 계약이다 (`userInterfaceStyle: "light"`).
- `lineHeight`에 배수 금지.
- `<SafeAreaView>`로 화면 감싸기 금지 — 배경이 인셋에서 끊긴다.
- `shadowOffset` 등 iOS 전용 그림자 prop 금지. `boxShadow` 하나로.
- 채도 카드를 연속 나열 금지. 웹의 6색 롱스크롤은 앱 패턴이 아니다.
- 플랫 벡터/스톡 일러스트로 클레이 자산 대체 금지.
- 토큰 밖 hex 인라인 금지.
- `fontWeight` 사용 금지 — Android에서 동작하지 않는다. family를 지정한다.
- 임의 duration·bezier 금지.
- `{colors.muted-soft}`를 읽어야 하는 문장에 쓰지 않는다 (2.70:1).

## 미결 항목

- **Pretendard 파일 미복사.** `duego-saas-mobile-v2/assets/font/`에서 4종 OTF를 가져오고 `expo-font`를 설치해야 한다.
- **3D 클레이 자산 0개.** § 자산 로드맵 우선순위대로 확보한다.
- **지도 스타일 미정.** `react-native-maps` 커스텀 스타일로 크림 톤을 맞출지, 기본 타일을 쓸지.
- **접근성 부분 검증.** 대비비는 실측했다(§ 대비). 터치 영역·스크린리더 라벨·Dynamic Type 실기기 확인은 남았다.
