# Designbase 템플릿 기준 컴포넌트·아이콘 전면 개편

`docs/references/designbase-app-ui/`(2026-09-16, pen.dev에서 추출)의 Designbase APP UI Template v1.6.0을 기준으로 Itinova의 공용 컴포넌트를 다시 만들고,
템플릿 아이콘·마커를 저장소 에셋으로 넣어 전 화면의 텍스트 액션·자리표시 글리프를 바꾸고, 지도·장소 상세·홈·날짜 선택 화면의 배치를 템플릿 화면 예시에 맞춘다.
코드 기준 HEAD `e6ef6c6`(2026-09-16). `파일:라인`이 어긋나면 심볼 이름으로 다시 찾는다.
`11-clay-assets-and-visual-refresh.md`와 병행 가능하며, 같은 파일을 만질 때는 이 플랜(구조)을 먼저, 11(그림)을 뒤에 넣는다.

2026-09-16 사용자 결정: 참고 자료는 이 템플릿 하나. 가져올 아이콘·컴포넌트는 링크가 아니라 에셋으로 저장소에 넣는다(완료 — 레퍼런스 폴더에 아이콘 1,024개·마커 8개·화면 29장·컴포넌트 21장).
템플릿 기준으로 전면 개편한다.

## 왜 필요한가

- 앱에 아이콘이 없다. 뒤로가기·닫기·더보기·검색·체크가 전부 글자다: `components/ui.tsx:27-31`(헤더 액션 텍스트), `app/trip/[id]/(tabs)/itinerary.tsx:78`(`홈`),
  `app/trip/[id]/map.tsx:35`(`닫기`), `app/trip/[id]/checklist.tsx:85`(`⋯` 문자), `app/trip/[id]/edit.tsx:37-45`(핸들 글리프 텍스트), `components/AppleSearchBar.tsx:15`(`검색` 텍스트 버튼),
  `app/trip/[id]/(tabs)/_layout.tsx:27-28`(탭 아이콘 없음). `docs/design.md` § 8-5가 "아이콘 세트 미정"이라 남긴 자리다. 이제 세트가 있다.
- 공용 컴포넌트가 5개(`ScreenHeader`·`BottomCtaBar`·`Chip`·`SegmentTabs`·`Question`, `components/ui.tsx`)뿐이라 리스트 행·섹션 헤더·입력 필드·체크박스·바텀시트를 화면마다 따로 그린다.
  `app/settings.tsx:70-86`, `app/trip/[id]/settings.tsx:108-117`, `app/trip/[id]/expense/new.tsx:83-99`가 각자 `Field`·`row`를 정의한다.
- 템플릿에 Itinova 화면과 거의 같은 목적의 예시가 있다: 지도-여행-지도뷰(일차 탭 + 순번 핀 동선 + 하단 카드 = S10/S13), 지도-상세페이지(S20), 항공 예약-내여행(S01 여행 목록),
  항공 예약-날짜선택(S05), 항공 예약-여행지 찾기(S04), 검색-최근 검색어(S15), 더보기-설정(S02·S21). `docs/references/designbase-app-ui/README.md` § 화면 파일 표.
- 템플릿은 우리와 같은 Pretendard·4dp 간격·iOS 관습을 갖췄고, 파랑 `#006fff`·흰 표면은 교체 전제의 자리색이다. **색은 우리 토큰을 유지하고 구조·컴포넌트·아이콘·상태 체계·화면 배치를 가져온다**(§ 절차 1).
  이 결정에 이의가 있으면 § 절차 1만 바꾸고 나머지는 그대로 실행한다.

## 범위 밖

- 클레이 일러스트(플랜 11). 템플릿 Empty Graphic 7종(`graphics/empty-*.svg`)은 파랑 플랫 벡터라 **쓰지 않는다** — 디자인 시스템 § 자산 로드맵이 플랫 벡터 대체를 금지한다.
- Advertising·Social Login·Coupon·Follower·Review·Video·Avatar·Accordion·Stepper·Select Menu·Slider — 대응 기능이 없다.
- 중앙 카드 Modal로 RN `Alert` 교체. `docs/design.md`가 삭제·날짜 단축 확인에 내장 `Alert`를 채택했다. 재론 조건: Android 출시 시 외양 불일치.
- 타입 스케일 변경. 템플릿 Body 행간 1.8은 한글 본문에 헐겁고, 우리 스케일은 `docs/design-system.md` § 타이포그래피에 근거가 있다.
- AI 화면(S07·S08·S19) — 플랜 08·09가 이 플랜의 컴포넌트와 `screens/ai-chat*.png`를 참고한다. 여기서 만들지 않는다.
- S10에 시간 레일(`screens/saas-schedule.png`) 도입. 시각은 선택 입력이라 레일이 대부분 비게 된다. 시각 입력률이 높아지면 재론.

## 실행 조건

- 템플릿 라이선스(상업 이용·재배포)를 확인해 레퍼런스 README § 라이선스에 적은 뒤에만 아이콘·마커를 `assets/`에 커밋한다. 확인 전에는 § 절차 3·4(토큰·컴포넌트)를 `Icon` 자리만 잡고 진행할 수 있다.
- **실행하지 않는 조건:** 라이선스가 재배포를 금지하면 § 절차 2를 "같은 기하(24dp, 채움 경로, 둥근 끝)로 직접 그린 SVG"로 대체한다. 그 외 절차는 그대로.
- Pen 문서를 다시 읽어야 하면(누락 프레임 등) Pen 데스크톱이 해당 문서를 열고 있어야 한다. `tools/export_frames.py`·`extract_icons.py`로 재추출한다. 첫 MCP 호출은 1분쯤 걸릴 수 있다.

## 절차

### 1. 토큰 결정 (기본값)

| 항목 | 결정 | 근거 |
| --- | --- | --- |
| 색 | **유지.** 캔버스 `#fffaf0`, 잉크 `#0a0a0a` 주 버튼, 크림 카드. 템플릿 `surface/layer-2`·`border/base` 역할은 `surface-card`·`hairline` | 템플릿 파랑은 자리색. 크림·클레이가 차별점(design-system 개요) |
| 시맨틱 색 계층 | **추가.** `tokens.json`의 `text/primary·secondary·tertiary·disabled`, `icon/primary·disabled·inverse`, `button/{primary,secondary,tertiary,disabled}/{bg,text,border}-{default,pressed}` 이름 체계를 `theme.ts`에 `semantic` 객체로 얹는다. 값은 기존 토큰 별칭 | 컴포넌트가 상태별 색을 직접 고르지 않게. hex는 새로 만들지 않는다 |
| 보조 버튼 | **템플릿 3단 도입.** secondary = `surface-card` 배경 + 잉크, tertiary = 테두리형(기존 `button-secondary`를 개명) | CTA 2개 배치(§ 절차 3-3)에 필요 |
| 라운드 | **템플릿 스케일로 교체:** `xs 8 · sm 12 · md 20 · lg 24 · pill 999`. 기존 `xs 6`→8, `lg 16` 카드→20 | 두 스케일을 함께 두면 화면마다 값이 갈린다 |
| 컨트롤 높이 | `sm 36 · md 40 · lg 48` — `md 40` 추가 | 아이콘 버튼·검색바 |
| 아이콘 크기 | `16 · 20 · 24` 유지. 탭바·헤더 24, 리스트 트레일링 20, 칩 안 16 | 템플릿 Icon Container Minimal S/M/L |
| 그림자 | 유지 | 템플릿 Shadow-3은 플로팅 탭바 전용 |
| 타입 | 유지 | § 범위 밖 |

`docs/design-system.md` 프론트매터와 `theme.ts`를 같은 커밋에서 바꾼다. `grep -rn "rounded.lg\|rounded.xs" app components`로 값 변경이 의도와 맞는지 본다.

### 2. 아이콘·마커 에셋 (`assets/icons/`)

원본은 `docs/references/designbase-app-ui/icons/<섹션>/<이름>.svg`(단색 `currentColor`, 24×24). 아래 표의 파일을 `assets/icons/<앱 이름>.svg`로 복사한다. 이름이 애매하면 `icons/index.json`으로 섹션을 찾는다.
`expo-image`가 SVG를 iOS·Android에서 렌더하고 `tintColor`로 색을 입힌다(SDK 57 `expo-image` 지원 형식 표) — 새 의존성 없음.

| 앱 이름 | 원본 | 쓰는 곳 |
| --- | --- | --- |
| `chevron-left` `chevron-right` `chevron-down` `chevron-up` | `arrows/…` | 헤더 뒤로, 리스트 트레일링, 접기/펼치기 |
| `close` `close-small` | `actions/…` | 시트·지도 닫기, 칩 해제 |
| `search` | `navigation/search` | 검색바 선행 |
| `check` | `actions/done` | 체크박스 on, 선택 칩 |
| `plus` `minus` | `actions/…` | 장소·비용·카테고리 추가 |
| `more` | `actions/more-horizontal` | 체크리스트 카테고리 메뉴(`⋯` 대체) |
| `drag` | `grip-vertical`(`ls icons/*/grip-vertical.svg`) | 일정 편집 핸들 |
| `trash` `edit` | `actions/…` | 편집 액션바 삭제, 일정 편집 진입 |
| `share` | `navigation/share-ios` | JSON 내보내기, 장소 공유 |
| `map` `map-filled` | `navigation/…` | 전체 지도 진입 |
| `location` `gps` | `navigation/…` | 지도 핀 칩, 현재 위치 버튼 |
| `route` | `travel/route` | 길찾기 |
| `home` `home-filled` | `navigation/home-outline` `home-filled` | 탭 `여행 홈` |
| `calendar` `calendar-filled` | `forms/…`(filled 없으면 `calendar-check`) | 탭 `일정`, 날짜 편집 |
| `bookmark` `bookmark-filled` | `actions/…` | 탭 `저장`, 장소 저장 |
| `tools` `tools-filled` | `layout/dashboard` `dashboard-filled` | 탭 `도구` |
| `settings` | `settings/settings` | 홈 헤더 설정 |
| `info` | `status-alerts/info` | 정보 출처·안내 |
| `arrow-up` `arrow-down` | `arrows/…` | 편집 화면 VoiceOver 대체 버튼 |
| `clock` | `actions/clock` | 장소 시각 |
| `wallet` `exchange` `sun` `translate` `world-clock` | `commerce/wallet` `travel/exchange` `weather/sun` `settings/translate` `travel/world-clock` | 도구 탭 섹션(플랜 11 클레이가 들어오기 전 임시, 들어온 뒤엔 인라인 안내에만) |
| `cat-attraction` `cat-food` `cat-cafe` `cat-stay` `cat-transport` `cat-etc` | `travel/landmark` `food/soup` `food/coffee` `furniture/bed` `travel/bus` `travel/sign` | 카테고리 필터 칩·세그먼트 안 16dp. 썸네일 44dp는 플랜 11 클레이 |
| `marker-numbered` `marker-start` `marker-current` | `graphics/marker-numberedpin` `marker-startmarker` `marker-currentlocation` | 지도 순번 핀 배경, 출발 표시, 현재 위치 |

`assets/icons/README.md`에 앱 이름 → 원본 경로 표와 추출 날짜를 적는다. **한 세트에서만 가져온다** — 다른 아이콘 팩을 섞지 않는다.
`components/Icon.tsx` 하나: props `name`(위 유니온)·`size`(16/20/24)·`color`. 정적 `require` 맵 + `expo-image` `tintColor`. 장식이면 `accessible={false}`, 단독 버튼이면 부모 `Pressable`에 `accessibilityLabel`.
마커 SVG는 파랑이 박혀 있으므로 복사 시 `fill`을 `currentColor`로 바꿔 `tintColor`로 잉크/핑크를 준다.

### 3. 공용 컴포넌트 (`components/ui/` 폴더로 분할, `index.ts` 재수출)

각 항목의 참고 이미지는 `docs/references/designbase-app-ui/components/`·`screens/`.

1. **`ScreenHeader`** (`ui.tsx:12`) — `components/navigation-bar.png`. 왼쪽 `IconButton chevron-left`(기본 `router.back`), 중앙 제목 `title-lg`, 오른쪽 `action`은 텍스트 또는 아이콘 1~2개.
   `largeTitle` 변형(`screens/more-settings-1.png`): 위 줄 아이콘만, 아래 줄 `display-md` 제목. 홈(`app/index.tsx:61-71`)·여행 홈·설정이 쓴다. 텍스트 `뒤로`·`홈`·`닫기`는 전부 아이콘으로.
2. **`IconButton`** — 44dp 터치, 40dp 시각, 아이콘 24. pressed에 `surface-card` 원. 지도 위에서는 `screens/map-recommend.png`의 현재 위치 버튼처럼 흰 원 + `elevation.card`.
3. **`BottomCtaBar`** (`ui.tsx:37`) — `components/button.png` Button-fixed. 변형: `secondaryLabel`(왼쪽 tertiary + 오른쪽 primary, 1:2), `info`(왼쪽 정보 두 줄 + 오른쪽 버튼).
   `app/create/dates.tsx:24-33`은 템플릿 날짜선택처럼 라벨에 범위를 넣는다(`9.9 ~ 9.11 · 2박 3일` / `다음`은 `info` 변형). `app/trip/[id]/edit.tsx` 하단 액션바는 `secondaryLabel`(`다른 일차로 이동` / `삭제`).
4. **`Chip`** (`ui.tsx:70`) — `components/filters.png`. `leadingIcon`(16)·`onDismiss`(닫기 아이콘) 옵션. 지도 카테고리 칩은 `location` 선행 아이콘 + 흰 배경 + `elevation.card`(`screens/map-recommend.png`).
   `add-place.tsx:82`의 `이름 · 해제` 문자열을 `onDismiss`로.
5. **`SegmentTabs`** (`ui.tsx:94`) — 둘로 나눈다. **`SegmentedControl`**(필 컨테이너 + 채워진 선택, 2~3개 균등폭; `screens/map-trip-mapview.png`의 `지도뷰/리스트`)은
   `budget.tsx:61`·`create/destination.tsx:23`·S13 지도/리스트 토글에. **`Tabs`**(밑줄 인디케이터 + 굵기 변화 + 가로 스크롤; `screens/list-tab.png`, `flight-my-trips.png`)는
   `saved.tsx:49-66`(전체/관광/맛집/숙소 + 개수)·`add-place.tsx:75`·S13 일차 탭·S01 예정/지난에. 근거: 4개 이상이면 세그먼트가 좁아진다. 개수는 `Badge`.
6. **`ListRow`** — `components/lists.png`, `screens/more-settings-1.png`. props `title`·`subtitle`·`leading`(아이콘 또는 44/64dp 썸네일 슬롯)·`trailing`(`chevron` | `switch` | 텍스트 | 커스텀)·`onPress`.
   높이 56(부제 있으면 64). **그룹 사이 간격으로 구분하고 행 구분선을 두지 않는다**(설정 화면 예시). 적용: `app/settings.tsx:70-86`, `app/trip/[id]/settings.tsx`, `saved.tsx:83-95`,
   `(tabs)/index.tsx:50-56`, `create/destination.tsx:50-57`, `DayPickerSheet.tsx:37-38`, `PlaceQuickActions.tsx:34-45`.
7. **`SectionHeader`** — `title`(`title-md`) + 오른쪽 텍스트 액션(`모두 보기`·`모두 삭제`). 적용: `app/index.tsx:119-120`, `(tabs)/index.tsx:44`, `checklist.tsx:82-86`(더보기 아이콘), `budget.tsx:79-86`, S04 지역 섹션.
8. **`TextField`** — `components/forms.png`. `label` 위 · 입력 · `helper`/`error` 아래(에러는 색 + 문구) · 우측 지우기 아이콘. `multiline`이면 Textarea(96dp, 글자수 카운터 옵션).
   적용: `expense/new.tsx:68-90`, `trip/[id]/settings.tsx:109-116`, `add-place.tsx` 나만의 장소 폼, `PlaceQuickActions.tsx:39-41`, `settings.tsx` 가져오기. 각 파일의 로컬 `Field`는 지운다.
9. **`SearchBar`** — `components/search-bar.png`, `screens/search-recent.png`. 선행 `search`, `surface-card` pill 40dp, 값이 있으면 `close` 채움 원 지우기, 포커스 시 오른쪽 `취소`.
   `AppleSearchBar.tsx`는 이를 감싸고 `검색` 텍스트 버튼(`:13-16`)을 없앤다 — 제출은 키보드 `search`. `(tabs)/index.tsx:46`의 맨 `TextInput`도 교체. 지도 위에서는 흰 배경 + `elevation.card`.
10. **`Checkbox`** — `components/form-controls.png`. 24dp, `rounded.xs`, on일 때 잉크 채움 + `check`. `checklist.tsx:90-96` 교체.
11. **`BottomSheet`** — `create/index.tsx:20-32`, `DayPickerSheet.tsx:30-41`, `PlaceQuickActions.tsx:28-49`가 세 번 그리는 scrim + 시트 + 핸들을 하나로. `screens/map-recommend.png`의 핸들(36×4) 위치.
12. **`Badge`** — `components/badge.png`. 개수 pill(`caption`, `surface-card`, 최소 20dp)과 상태 배지(`screens/flight-my-trips.png`의 `여행완료` — 진행중/예정/지난 여행에 `surface-card` + 잉크).
13. **`RangeCalendar`** (`components/RangeCalendar.tsx`) — `screens/flight-date-picked.png`, `components/date-picker.png`. (a) 월 라벨 `title-md`, 세로 스크롤 유지, (b) 범위 안 **연속 밴드**(`surface-card`, 양끝 둥글게) +
    시작·끝 잉크 원 + 흰 숫자, (c) 오늘 숫자 위 4dp 점. `cellState`(`lib/calendar.ts`)가 상태를 이미 계산하므로 스타일만.
14. **탭바** (`(tabs)/_layout.tsx:27-28`) — `components/tabbar.png`. outline/filled 짝 아이콘 24 + 라벨, 활성 잉크·filled, 비활성 `muted-soft`·outline. `tabBarIcon: () => null` 삭제.
    플로팅 필(`tabbar-ios.png`)은 § 상향 신호.
15. **지도 핀** (`components/NativeMap.tsx`) — `components/map-markers.png`. 순번 핀은 `marker-numbered`(36dp 원 + 숫자) 잉크 채움 + 크림 2dp 테두리, 선택 핑크. 첫 장소에 `marker-start` 깃발은
    쓰지 않는다(순번 1이 이미 출발). 동선은 기존 점선 유지 — 템플릿의 굵은 실선은 지도 타일 위에서 정보를 가린다(design-system § 지도).

### 4. 화면 배치 (템플릿 화면 예시 적용)

1. **S13 전체 지도** (`app/trip/[id]/map.tsx`) ← `screens/map-trip-mapview.png`. 위: `ScreenHeader`(뒤로 · 여행명 · 검색·더보기 아이콘). 그 아래 `Tabs`(전체 · day 1 · day 2 …)가 현재 칩 행(`:36-39`)을 대체.
   지도 위 상단 중앙 `SegmentedControl`(지도뷰/리스트). 하단은 현재 텍스트 목록(`:53-55`)을 **가로 스크롤 카드**(순번 배지 · 시각 · 장소명 · 카테고리 · 메모 첫 줄, 폭 화면의 70%)로 바꾸고
   카드 스크롤이 선택 핀을 따라간다. 지도 위 오른쪽 아래 `IconButton gps`(여행 도시 중심으로 복귀). 안내 배너(`:40-43`)는 플랜 10이 코치마크로 바꾼다.
2. **S10 일정 보드** (`(tabs)/itinerary.tsx`) — 헤더를 `ScreenHeader`(뒤로 · 여행명 · 편집 아이콘)로. 지도 프리뷰 접기/펼치기 칩(`:98-101`)을 `IconButton chevron-down/up`으로.
   카드 왼쪽 순번 배지는 유지하고 오른쪽에 `clock` + 시각(있을 때만). 템플릿의 시간 레일은 도입하지 않는다(§ 범위 밖).
3. **S20 장소 상세** (`app/place/[placeId].tsx:29-45`) ← `screens/map-place-detail.png`. 순서: 헤더(사진 또는 플랜 11 카테고리 클레이) → 이름 + 카테고리 칩 → **아이콘 액션 4열**
   (`일정에 추가` calendar · `저장` bookmark/bookmark-filled · `길찾기` route · `공유` share, 각 56dp 세로 아이콘+라벨) → 정보 행(`ListRow leading` 아이콘: 주소 `location`, 영업 `clock`, 출처 `info`) →
   지도 → 방문 메모·시각 섹션(`SectionHeader` + 카드). 현재 `Text` 나열(`:31-37`)을 이 구조로 재배치한다.
4. **S01 홈** (`app/index.tsx`) ← `screens/flight-my-trips.png`. `ScreenHeader largeTitle`(제목 `Itinova`, 오른쪽 `settings`). 진행중 teal 카드는 유지(design-system § 카드).
   다가오는/지난 목록은 **연도 그룹 헤더 + 날짜 라벨 + 카드**로, 카드에 상태 `Badge`(`D-3`·`여행 중`·`지난 여행`)와 `도시 · 2박 3일` 행. `Section`(`:104-136`)을 이 구조로.
5. **S04 도시 선택** (`app/create/destination.tsx`) ← `screens/flight-find-destination.png`. `SearchBar` 아래 `lib/cities.ts`를 지역별 `SectionHeader` + 가로 스크롤 pill `Chip`으로.
   현재 세그먼트(`:23`) + 리스트(`:25-43`)를 대체. 검색 결과가 있을 때만 `ListRow` 목록. 근거: 도시 20~30개는 칩이 리스트보다 한 화면에 더 많이 보인다.
6. **S05 날짜** (`app/create/dates.tsx`) — § 3-13 캘린더 + § 3-3 `info` CTA. 인라인 힌트(`:20`)는 유지(design.md § 2.9).
7. **S15 장소 추가** (`add-place.tsx`) ← `screens/map-recommend.png`, `search-recent.png`. 지도 위 `SearchBar`(흰 배경), 카테고리 `Chip`(location 선행 아이콘) 가로 스크롤, 아래 `BottomSheet` 성격의 결과 목록.
   소스 전환(`:75`)은 `Tabs`. 결과 없음은 `screens/search-no-results.png` 배치(플랜 11 saved 클레이).
8. **S02·S21 설정** ← `screens/more-settings-1.png`. `ScreenHeader largeTitle` + 그룹 간격 `ListRow`(트레일링 chevron/switch/값 텍스트). 여행 삭제 행은 `error` 색 텍스트, 구분선 없이 마지막 그룹.
9. **S11 저장함·S12 도구·S16 체크리스트·S17 가계부** — § 3의 컴포넌트 교체만. 배치 변경 없음.

### 5. 적용 순서

효과 ÷ 난이도 순, 항목별 단독 커밋.

1. 토큰(§ 1) + `Icon` + `IconButton` + `ScreenHeader` → 헤더 12개가 한 번에 바뀐다.
2. 탭바 아이콘(§ 3-14).
3. `ListRow`·`SectionHeader`·`Badge` → 설정 2화면(§ 4-8), 홈(§ 4-4), 저장함, 여행 홈, 시트 2개.
4. `SearchBar`·`Chip` 개편 → `AppleSearchBar`, 여행 홈, 도시 선택(§ 4-5), 장소 추가(§ 4-7).
5. `Tabs`/`SegmentedControl` 분리 → 저장함, 장소 추가, 가계부, 지도.
6. S13 지도 배치(§ 4-1) + 지도 핀(§ 3-15).
7. S20 장소 상세(§ 4-3).
8. `TextField` → 비용 추가, 여행 설정, 나만의 장소, 퀵 액션, 가져오기.
9. `BottomCtaBar` 변형 + `RangeCalendar`(§ 4-6), 일정 편집 액션바.
10. `BottomSheet` 통합, `Checkbox`, S10 헤더·접기 아이콘(§ 4-2).
11. `components/Screen.tsx` 임시 껍데기 라우트(`grep -rln "components/Screen" app/`)는 건드리지 않는다 — 플랜 08·09 몫.

### 6. 문서 갱신

1. `docs/design-system.md` 프론트매터: `rounded`·`sizing` 값 교체, `semantic` 색 계층, `components`에 `icon-button`·`list-row`·`section-header`·`text-field`·`badge`·`segmented-control`·`tabs`·`bottom-sheet`
   정의와 `search-bar`·`checkbox`·`map-pin`·`tab-bar` 수정. 본문 § 컴포넌트에 각 한 단락. "아이콘 세트 미정" 문장을 해소로.
2. `docs/design.md` § 8에 15번으로 결과 한 단락. § 2.4 S11 "탭 라벨에 개수" → "탭 + Badge". § 2.5 S13에 일차 탭·하단 카드·지도뷰/리스트 토글. § 2.6 S20에 아이콘 액션 4열. § 2.2 S04에 지역별 칩. § 2.7 바텀시트 3종이 공용 `BottomSheet`.
3. `docs/references/designbase-app-ui/README.md` § 라이선스에 확인 결과.
4. `docs/plans/08-ai-itinerary-screens.md`·`09-ai-chat.md` 실행 조건에 "헤더·입력·시트·칩은 플랜 12 컴포넌트, 참고 `screens/ai-chat*.png`" 한 줄.

## 검증

```
ls assets/icons/*.svg | wc -l                       # 40 이상
grep -rn "'뒤로'\|'닫기'\|'홈'\|⋯\|'검색'" app components   # 헤더·시트·검색의 텍스트 액션 0건 (본문 문장 제외)
grep -rn "tabBarIcon: () => null" app               # 0건
grep -rn "function Field" app                       # 0건
grep -rn "backgroundColor: colors.scrim" app components  # BottomSheet 1곳
grep -rn "006fff" app components theme.ts assets/icons   # 0건 (마커 fill 을 currentColor 로 바꿨는지)
wc -l components/ui/*.tsx                           # 파일당 200줄 이하
npx tsc --noEmit
npm run check
```

iOS 시뮬레이터(`xcrun simctl` + Codex Computer Use):

1. 홈: 라지 타이틀 + 설정 아이콘, 연도 그룹 + 상태 배지 카드. 진행중 카드는 teal 그대로.
2. 설정 2화면: 그룹 간격 `ListRow`, 트레일링 셰브론·스위치. VoiceOver가 아이콘 버튼 라벨을 읽는다.
3. 여행 생성: 도시 선택이 지역 섹션 + 칩, 검색 시 목록. 캘린더 범위 밴드·오늘 점. 하단 바 왼쪽 범위·박수, 오른쪽 `다음`.
4. 여행 탭 4개 아이콘(활성 filled), 저장함 탭 개수 Badge, 필터 `Tabs` 밑줄이 스크롤을 따라간다.
5. 전체 지도: 일차 `Tabs` 전환 시 핀·동선 필터, 하단 카드 스크롤 ↔ 핀 선택 동기화, 지도뷰/리스트 토글, gps 버튼으로 중심 복귀. 핀이 36dp 원 순번, 선택 핑크.
6. 장소 상세: 아이콘 액션 4열 각각 동작(일차 선택 시트·저장 토글·길찾기·공유), 정보 행 아이콘.
7. 장소 추가: 지도 위 검색바·카테고리 칩, 결과 선택 → 칩 닫기 아이콘으로 해제.
8. 비용 추가: `TextField` 라벨·헬퍼, 금액 에러 시 빨간 테두리 + 문구.
9. 일정 편집: `drag` 핸들 아이콘으로 드래그가 플랜 03 검증대로 동작, 하단 2버튼 바.
10. 체크리스트: 체크박스 on 아이콘, 카테고리 `more` → 메뉴.
11. 바텀시트 3종 핸들·닫기 위치 동일. 라운드 20 카드가 크림 위에서 어색하지 않은지 홈·저장함에서 확인.

## 되돌리는 법 / 상향 신호

- 컴포넌트 교체는 파일 단위 커밋이라 항목별 `git revert`. 데이터 변경 없음.
- 라운드 20 카드가 어색하면 `rounded.md`만 16으로(토큰 한 곳).
- S13 하단 가로 카드가 장소 8개 이상에서 찾기 어렵다는 피드백이 오면 `지도뷰/리스트` 토글의 리스트를 기본으로 바꾼다(코드 변경 없이 초기값만).
- 탭바를 템플릿 **플로팅 필**(블러 + 분리 검색)로 바꾸는 것은 `expo-router/js-tabs`의 `tabBar` 커스텀으로 인셋 처리가 확인된 뒤 별도 항목.
- Toast가 필요한 첫 화면(플랜 08 저장 완료 등)이 생기면 `components/toast.png`대로 `ui/Toast.tsx` 추가.
- 시각 입력률이 높아지면 S10 시간 레일(`screens/saas-schedule.png`) 재론.

## 기각한 대안

- **템플릿 색(흰 표면 + 파랑) 채택** — 크림·클레이 정체성과 플랜 11 팔레트와 충돌. 사용자가 명시하면 § 1 색 행과 11의 팔레트를 함께 조정.
- **템플릿 Empty Graphic을 빈 상태에** — 파랑 플랫 벡터. 디자인 시스템 금지 항목. 재론하지 않는다.
- **아이콘 라이브러리(`@expo/vector-icons`·Lucide) 또는 Pen 내장 `icon` 노드 라이브러리** — 사용자 결정이 템플릿 아이콘이고 이미 SVG로 확보했다.
- **`react-native-svg`로 아이콘 컴포넌트화** — 단색 `tintColor`만 필요하다. 다색 아이콘이 필요해지면 재론.
- **`ui.tsx` 한 파일 유지** — 15개면 500줄을 넘는다. 폴더 + index 재수출.
- **타입 스케일을 템플릿으로** — 한글 근거(design-system § 타이포그래피).
- **Select Menu로 통화·카테고리 선택** — 칩 한 번 탭이 빠르다. 항목 8개 초과 시 재론.
- **Date Picker를 월 페이지 넘김으로** — 여행은 두 달에 걸치기 쉬워 세로 스크롤 유지. 밴드·점만 가져온다.
- **S13 동선을 템플릿처럼 굵은 실선으로** — 지도 타일을 가린다. 점선 유지.
- **출발 깃발 마커** — 순번 1이 출발이다. 중복.

## 실패 모드

템플릿을 "참고"만 하고 컴포넌트를 화면마다 또 따로 그리는 것 — § 검증의 `function Field` 0건, scrim 1곳, `ui/` 파일 크기가 잡는다.
두 번째는 다른 팩 아이콘을 섞는 것 — § 절차 2 "한 세트에서만"과 `assets/icons/README.md` 출처 표가 방어선.
세 번째는 마커 SVG의 파랑을 그대로 두거나 템플릿 파랑을 인라인하는 것 — `grep 006fff` 0건.
네 번째는 S13을 템플릿과 똑같이 만들려다 지도 위 요소가 4종(검색·탭·세그먼트·gps)이 되어 지도를 가리는 것 — S13에는 검색바를 두지 않는다(검색은 S15).
