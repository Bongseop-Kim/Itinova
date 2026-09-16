# Designbase 템플릿 기준 컴포넌트·아이콘 전면 개편 — 실행 결과

원 플랜 `docs/plans/12-designbase-component-refresh.md`, 삭제 직전 커밋 `81ac2da`. 실행 2026-09-16.
레퍼런스는 `docs/references/designbase-app-ui/`(같은 커밋)에 남아 있다.

## 한 것

### 1. 토큰 (플랜 § 1)

- `theme.ts:81` 라운드를 템플릿 스케일로 교체했다: `xs 6→8`, `lg 16→20`. `sm`은 `xs` 별칭으로 남겼다.
- `theme.ts:93` `controlHMd: 40` 추가(아이콘 버튼·검색바). `theme.ts:120` `semantic` 객체로 `text`/`icon`/`button` 상태 계층을 얹었다 — 값은 전부 기존 토큰 별칭이고 새 hex 는 없다.
- `theme.ts` `mapStyle.pinSize 28→36`, `selectedPinSize 34→42`(템플릿 NumberedPin). `pickerHeight: 240` 추가 — 아래 § 플랜이 틀렸던 곳 참고.
- `docs/design-system.md` 프론트매터와 본문에 같은 값을 반영했다. 색은 플랜대로 유지했다.

### 2. 아이콘 (플랜 § 2)

- 템플릿 아이콘 1,024개 중 앱이 쓰는 46개만 `assets/icons/`로 복사하고 나머지 SVG 본문은 지웠다(사용자 결정). 색인 `docs/references/designbase-app-ui/icons/index.json`과 재추출 스크립트는 남겼다.
- 지도 마커 2종은 `fill`을 `currentColor`로 바꿔 넣었다. 템플릿 파랑이 앱에 남지 않는다.
- `components/Icon.tsx` — 정적 `require` 맵 + `expo-image` `tintColor`. `react-native-svg`를 붙이지 않았다. 출처 표는 `assets/icons/README.md`.

### 3. 공용 컴포넌트 (플랜 § 3)

`components/ui.tsx`(186줄, 5개)를 `components/ui/` 13파일로 나눴다. 파일당 107줄 이하, import 경로 `../components/ui`는 그대로다.

`ScreenHeader`(뒤로 셰브론·중앙 제목·아이콘 액션·`largeTitle`) · `IconButton`(40dp 시각/44dp 터치, `floating`) · `BottomCtaBar`(2버튼·정보형) ·
`Chip`(`leadingIcon`·`onDismiss`·`elevated`) · `Tabs`/`SegmentedControl`(분리) · `Badge`(개수·상태) · `ListRow`/`ListGroup` · `SectionHeader` ·
`TextField` · `SearchBar` · `Checkbox` · `BottomSheet`.

### 4. 화면 (플랜 § 4)

| 화면 | 바뀐 것 |
| --- | --- |
| S01 `app/index.tsx` | 라지 타이틀 + 설정 아이콘, 진행중 teal 카드 유지, `다가오는`/`지난` 탭(개수 배지), 연도 섹션 + 날짜 라벨 + 상태 배지 카드 |
| S02 `app/settings.tsx` · S21 `trip/[id]/settings.tsx` | 라지 타이틀, 그룹 간격 `ListRow`, 여행 삭제는 error 색 행. 날짜 형식 두 행은 형식 자체를 제목으로 바꿨다 |
| S04 `create/destination.tsx` | 검색바 + 지역별 섹션 + 도시 pill 칩. 검색 시 결과 리스트 행 |
| S05 `create/dates.tsx` | 범위 연속 밴드 + 양끝 잉크 원 + 오늘 점(`RangeCalendar`), 하단 바 왼쪽 `9/20 ~ 9/24`·`4박 5일` |
| S09 `(tabs)/index.tsx` | 헤더 설정 아이콘, 아이콘 칩, 섹션 헤더, `SearchBar`, `ListRow` |
| S10 `(tabs)/itinerary.tsx` | 헤더 편집 아이콘, 지도 위 전체지도·접기 아이콘 버튼, 시각에 시계 아이콘 |
| S13 `trip/[id]/map.tsx` | 일차 탭, 지도 위 `지도뷰`/`리스트` 세그먼트와 현재 위치 버튼, 하단 가로 카드(핀 선택과 양방향 동기화), 리스트 뷰 |
| S14 `trip/[id]/edit.tsx` | 드래그 핸들 아이콘, `Checkbox`, 하단 2버튼 바 |
| S15 `trip/[id]/add-place.tsx` | 지도 위 검색바, 소스 탭, 체크박스 행, 선택 칩에 해제 아이콘 |
| S16 `trip/[id]/checklist.tsx` | `Checkbox`, `⋯` 문자를 `more` 아이콘으로, 섹션 헤더 |
| S17 `trip/[id]/budget.tsx` | `SegmentedControl`, 섹션 헤더에 소계 |
| S18 `expense/new.tsx` | `TextField`(라벨·에러), 칩 그룹 |
| S20 `place/[placeId].tsx` | 헤더 이미지(없으면 카테고리 아이콘), 이름 + 카테고리 배지, 아이콘 액션 4열, 선행 아이콘 정보 행 |
| 탭바 `(tabs)/_layout.tsx` | outline/filled 짝 아이콘 24dp + 라벨 |
| BS1·BS2·BS3 | `BottomSheet` 하나로 통합. S03 은 `asModal={false}` |
| 지도 핀 `components/NativeMap.tsx` | 36dp 원 순번 핀, 선택 42dp 핑크 |

### 5. 문서 (플랜 § 6)

`docs/design-system.md` 프론트매터(컴포넌트 12개 추가·수정)와 본문 § 컴포넌트, `docs/design.md` § 2 인벤토리 13행과 § 8-15,
`docs/plans/08`·`09` 실행 조건, 레퍼런스 README § 라이선스를 갱신했다.

## 안 한 것

- **플랜 § 4-2 의 S10 시간 레일** — 원래 범위 밖이었고 그대로 두었다.
- **템플릿 Empty Graphic** — 플랫 벡터라 쓰지 않았다(플랜 범위 밖). 빈 상태 일러스트 자리는 플랜 11 이 채운다.
- **Toast** — 필요한 화면이 아직 없다(플랜 § 상향 신호).
- **플로팅 탭바** — 부착형 + 아이콘으로 두었다(플랜 § 상향 신호).
- `components/Screen.tsx` 를 쓰는 라우트는 건드리지 않았다(플랜 08·09 몫).

## 검증 결과

`npx tsc --noEmit` 오류 없음. `npm run check` 4건 모두 통과(lib · map · travel tools · apple places).

```
ls assets/icons/*.svg | wc -l                          → 46
grep -rn "'뒤로'\|'닫기'\|'홈'\|⋯\|'검색'" app components → 0 (라벨 제외)
grep -rn "tabBarIcon: () => null" app                  → 0
grep -rn "function Field" app                          → 0
grep -rn "backgroundColor: colors.scrim" app components → 1 (BottomSheet)
grep -rln "006fff" app components theme.ts assets/icons → 0
wc -l components/ui/*.tsx                              → 최대 107
```

iOS 26.0 시뮬레이터(iPhone 17 Pro). 조작은 **Maestro**로 했다 — 사용자 마우스를 쓰지 않는다. 확인한 것:

1. 홈: 라지 타이틀·설정 아이콘, teal 카드 + `여행 중` 배지, 탭 개수 배지, 연도 헤더 + `10/21/수` + `D-35` 배지 카드.
2. 앱 설정·여행 설정: 그룹 간격 리스트, 트레일링 셰브론·값·체크, 삭제 행 error 색.
3. 도시 선택: 지역별 칩. 날짜: 9/20 탭 → 시작 원, 9/24 탭 → 연속 밴드 + 하단 `9/20 ~ 9/24`·`4박 5일`, 오늘(9/16) 점.
4. 여행 탭 4개 아이콘(활성 filled), 저장 탭 개수 배지, 저장함 빈 상태.
5. 전체 지도: `day 1` 탭으로 핀·동선 필터, `지도뷰`/`리스트` 전환, 카드 탭 → 선택 → 한 번 더 → 퀵 액션 시트, 현재 위치 버튼.
6. 장소 상세: 아이콘 액션 4열, 정보 행, 카테고리 그래픽(사진 없을 때).
7. 일정 편집: 핸들 아이콘, 체크박스, 하단 2버튼 바.
8. 체크리스트: 체크 아이콘, 섹션·항목 더보기 아이콘, `1 / 6 완료`.
9. BS3 일차 선택 시트: 핸들·제목·닫기 아이콘·리스트 행.
10. 비용 추가: `TextField` 라벨, 칩 그룹, 비활성 저장.

## 플랜이 틀렸던 곳

1. **플랜 § 3-6 의 `ListRow` 트레일링에 버튼을 넣는 설계가 접근성을 깼다.** 행 전체가 `accessibilityLabel` 을 가진 `Pressable` 이라 iOS 가 행을 하나의 요소로 합쳐
   안쪽 `IconButton` 이 VoiceOver 에서 사라졌다. `maestro hierarchy` 로 확인했다 — `123 crepe 상세`만 노출되고 `123 crepe 일정에 추가`가 없었다.
   `trailingAction` prop 을 따로 두고 행 **밖 형제**로 그리도록 고쳤다. 장식용 `trailing` 과 누를 수 있는 `trailingAction` 을 타입에서 분리했다.
2. **플랜 § 3-3 의 "왼쪽 tertiary + 오른쪽 primary" 를 S14 에 그대로 적용하면 삭제가 검정 주 버튼이 된다.** 되돌릴 수 없는 액션을 시각적으로 승격하는 것이라
   `다른 일차로 이동`을 primary 로, `삭제`를 error 색 tertiary 로 뒤집고 `secondaryDestructive` prop 을 넣었다.
3. **플랜 § 4-7 의 "지도 위 검색바"가 160dp 지도에서는 지도를 거의 다 덮는다.** 처음엔 320dp(`expandedHeight`)로 키웠더니 이번엔 결과 목록과 빈 상태가 잘렸다.
   `mapStyle.pickerHeight: 240` 을 새로 두고 목록에 `flex: 1` 을 줬다. 플랜에 없던 토큰이다.
4. **플랜이 `place/[placeId]` 의 네이티브 헤더를 빼먹었다.** 자체 헤더를 그리면서 `app/_layout.tsx` 에 `headerShown: false` 를 넣지 않아 헤더가 둘 겹쳤다.
5. **`BottomSheet` 의 `asModal` 을 인라인 래퍼 컴포넌트로 구현하면 매 렌더마다 자식이 재마운트된다** — 시트 안 입력 포커스가 끊긴다. JSX 를 변수로 두고 조건부로 감쌌다.
6. **지도 위 텍스트는 배경 없이 두면 지도 라벨과 겹쳐 안 읽힌다.** 동선 캡션과 검색 출처 문구에 크림 배경 pill 을 입혔다.

## 남은 위험 / 상향 신호

- 라운드 `lg` 20 이 크림 카드에서 어색하다는 피드백이 오면 `theme.ts` 한 곳만 16 으로 되돌린다.
- S13 하단 가로 카드가 장소 8개 이상에서 찾기 어렵다는 피드백이 오면 `리스트` 를 기본 뷰로 바꾼다(초기값 한 줄).
- 아이콘은 `expo-image` 의 SVG 디코더에 의존한다. 타원 호(`A`/`a`) 명령이 있는 아이콘은 iOS 에서 깨질 수 있다 — 현재 46개에는 없다. 새 아이콘을 넣을 때 확인한다.
- 빈 상태 160dp 크림 사각형은 그대로다. 플랜 11 이 채운다.
