# S14 드래그 재정렬 · S16 카테고리 관리

설계에는 있고 구현에는 없는 두 로컬 편집 기능을 만든다. 외부 서비스가 필요 없고 서로 독립적이지만
둘 다 "목록 편집 상호작용"이라 한 플랜으로 묶는다. 각 절은 따로 실행·커밋할 수 있다.
`01-p0-flow-and-data-bugs.md` 이후 실행한다. S16 절은 플랜 01의 3번(기본 카테고리 섹션 유지)이 끝나야 한다.

## 왜 필요한가

- **S14** — `app/trip/[id]/edit.tsx:125` 주석대로 드래그 대신 `위로`/`아래로` 텍스트 버튼(`:126-143`)만 있다. 드래그 핸들이 없어
  설계 C02 코치마크의 스포트라이트 대상도 없다. 당시 기각 사유는 "그 하나를 위해 의존성을 늘리지 않는다"(`docs/design.md` §8-9)였고,
  `reanimated`·`gesture-handler`는 전이 의존성으로만 있었다. 지금은 `ios/Podfile.lock:2015,2038`에 `RNGestureHandler 3.2.1`·`RNReanimated 4.6.0`이
  expo-router의 peer로 이미 링크되어 있다. 네이티브 비용은 이미 지불했다.
- **S16** — `app/trip/[id]/checklist.tsx:45` 섹션 헤더는 비상호작용 `Text`이고 `:35` `ScreenHeader`에는 액션이 없다. 이름 변경·삭제·
  새 카테고리 추가가 전부 없다. 설계 §2.5 S16 "항목·카테고리 더보기 메뉴"와 다르며, §8-8이 "값이 작아 미뤘다"고 기록한 항목이다.

## 범위 밖

- 일차 경계를 넘는 드래그(day 1 → day 2). 다른 일차 이동은 기존 `day 전체 선택` → 액션바(`edit.tsx` 하단) 경로를 유지한다.
- 체크리스트 템플릿 편집(여행 생성 시 시드되는 `db/templates.ts:2-5`의 내용 변경).
- 코치마크 C02·C03(`10-coachmarks-and-content.md`).

## 실행 조건

- 플랜 01 완료.
- S14 절은 `npx expo install`이 고르는 `react-native-gesture-handler` 버전을 먼저 확인한다. Expo SDK 57 번들 버전은 RNGH `~2.32.0`,
  reanimated `4.5.1`인데(출처: `expo/expo` sdk-57 `bundledNativeModules.json`) 현재 설치본은 RNGH 3.2.1·reanimated 4.6.0이다.
  `react-native-sortables` README는 RNGH 2.x + iOS 신아키에서 항목이 고착되는 이슈(#349)가 RNGH 3에서 해결됐다고 적는다.
  **`expo install`이 RNGH를 2.x로 내리려 하면 실행을 멈추고** 3.x 유지가 Expo 57과 호환되는지 `npx expo-doctor`로 확인한 뒤 진행한다.

## 결정

| 항목 | 결정 | 근거 |
| --- | --- | --- |
| 드래그 구현 | `react-native-sortables`(1.10.0, 2026-07-23) 사용. 순수 JS, reanimated 4.x·RNGH 2.x/3.x 위에서 동작, 신아키 명시 지원 | 직접 제스처 구현은 스크롤 충돌·자동 스크롤을 다시 만드는 일이다. `react-native-draggable-flatlist`는 마지막 릴리스 2025-05-06, 신아키 지원 미확인이라 기각 |
| 위/아래 버튼 | **유지하되 접근성 보조 조작으로 축소** — VoiceOver 켜진 상태 또는 항목 더보기 메뉴에서만 노출 | 드래그는 스크린리더로 조작할 수 없다. 이미 동작하는 코드를 지울 이유가 없다 |
| 일차 경계 이동 | 드래그로 하지 않는다 | 범위 밖 |
| 카테고리 메뉴 | RN 내장 `Alert.alert` 버튼 목록으로 더보기 메뉴를 만든다. 새 컴포넌트·ActionSheet 라이브러리 없음 | `app/settings.tsx:38,45,54`·`app/trip/[id]/settings.tsx:4`가 이미 `Alert`를 쓴다. 메뉴 항목이 3개 이하다 |
| 카테고리 삭제 시 항목 | **항목도 함께 삭제**하고 확인창에 개수를 표시 | "다른 카테고리로 이동"은 이동 대상 선택 UI가 하나 더 필요하다. 체크리스트 항목은 재생성 비용이 작다 |
| 새 카테고리 추가 | `ScreenHeader` 우측 액션 `카테고리 추가` → `Alert.prompt`(iOS) | Android 출시 시 `Alert.prompt` 미지원을 확인해야 한다. 그때 인라인 입력으로 바꾼다 |

## 절차

### A. S14 드래그 (`app/trip/[id]/edit.tsx`, `package.json`)

1. `npx expo install react-native-reanimated react-native-gesture-handler react-native-sortables`로 세 패키지를 `package.json`에
   명시한다. 앞 둘은 이미 설치·링크되어 있지만 전이 의존성에만 기대는 상태를 끊는다. 실행 조건의 버전 확인을 통과해야 한다.
   `babel.config.js`에 reanimated/worklets 플러그인이 필요한지 Expo 57 문서(`docs.expo.dev/versions/v57.0.0/sdk/reanimated`)로 확인한다.
   `babel-preset-expo` 57이 자동 포함한다면 추가하지 않는다.
2. `app/_layout.tsx` 최상위를 `GestureHandlerRootView`로 감싼다(RNGH 요구사항). 다른 화면 동작에 영향이 없는지 `npm run ios`로 확인한다.
3. `edit.tsx`의 일차별 목록(`SectionList` 섹션 데이터)을 일차 단위 `Sortable.Flex` 또는 `Sortable.Grid`(1열)로 바꾼다. 드래그 완료 콜백에서
   기존 `reorderDay(ids)`(`db/dayItems.ts:10-17`)를 그대로 호출한다. `lib/reorder.ts:50-51` `sortOrders` 규약은 바뀌지 않는다.
   근거: 저장 계층을 건드리지 않으면 S10·지도 순번·거리 배지(`lib/itinerary.ts`)가 자동으로 같은 순서를 쓴다.
4. 카드 왼쪽에 드래그 핸들(≡ 글리프, `docs/design-system.md` 아이콘 토큰)을 두고 `Sortable.Handle`로 핸들에서만 드래그가 시작되게 한다.
   근거: 카드 전체 드래그는 세로 스크롤과 충돌한다. 핸들 전용이면 스크롤 제스처와 분리된다.
5. `:126-143` 위/아래 버튼은 `AccessibilityInfo.isScreenReaderEnabled()`가 참일 때만 렌더한다. 핸들에는 `accessibilityLabel`과
   `accessibilityHint`("위로/아래로 버튼으로 순서를 바꿀 수 있어요")를 붙인다.
6. 거리순 재정렬 버튼(`:88-92`)과 선택·이동·삭제 액션바는 그대로 둔다.

### B. S16 카테고리 관리 (`app/trip/[id]/checklist.tsx`, `db/checklist.ts`)

1. `db/checklist.ts`에 `renameCategory(tripId, from, to)`와 `deleteCategory(tripId, category)`를 추가한다. 둘 다 한 트랜잭션.
   `renameCategory`는 대상 이름이 이미 있으면 병합(같은 카테고리로 합치고 `sort_order`는 뒤에 이어 붙인다).
   근거: 카테고리는 `checklist_items.category` 문자열이라(`db/schema.ts:93`) 별도 테이블 없이 UPDATE 하나다.
2. `checklist.tsx:45` 섹션 헤더를 `Pressable`로 바꾸고 길게 누르기(또는 우측 `⋯`)에 `Alert.alert` 메뉴 — `이름 변경`·`삭제`·`취소`.
   `삭제`는 2차 확인창에 "항목 N개가 함께 삭제됩니다"를 표시한다. 근거: 결정 표.
3. 항목 행(`:56-63`)의 `삭제` 텍스트 버튼을 더보기 메뉴로 바꾸고 `삭제`와 (스크린리더용) `위로`/`아래로`를 넣는다. 항목 이름 변경은
   메뉴 항목 `이름 변경` → `Alert.prompt`. 근거: 설계 "항목 더보기 메뉴".
4. `:35` `ScreenHeader`에 `action="카테고리 추가"`를 달고 `Alert.prompt`로 이름을 받아 빈 섹션을 화면 상태에 추가한다. 빈 사용자 카테고리는
   DB에 행이 없으므로 화면 상태(`useState`)로만 존재하고, 첫 항목이 추가될 때 DB에 나타난다. 화면을 나가면 빈 사용자 카테고리는 사라진다.
   근거: 스키마를 바꾸지 않는다. 플랜 01-3의 "기본 카테고리는 유지, 사용자 카테고리는 0개면 소멸" 규칙과 일관된다.
5. 기본 카테고리(`db/templates.ts:2-5`)를 삭제하면 항목은 지워지지만 플랜 01-3의 "기본 ∪ 기존" 규칙 때문에 다음 진입에 빈 섹션으로
   다시 보인다. 이 동작을 그대로 허용하고 확인창에 "항목 N개가 삭제됩니다. 기본 카테고리는 빈 상태로 남아요"라고 적는다.
   근거: "삭제한 기본 카테고리"를 기억하려면 여행 단위 컬럼과 마이그레이션이 필요하다. 기본 카테고리를 지우려는 사용자는 드물다는 **추정**이며,
   불만이 확인되면 `trips`에 컬럼을 추가해 재론한다.

### C. 순수 로직 검사 (`lib/check.ts`)

- `renameCategory` 병합 시 `sort_order` 이어붙이기는 순수 함수로 빼서 케이스를 추가한다.
- 드래그 완료 → `reorderDay` 인자 순서는 기존 `moveItem` 케이스(`lib/check.ts:160`)가 이미 덮는다. 추가하지 않는다.

### D. 설계 문서 (`docs/design.md`)

- §8-9 "드래그 대신 위/아래 버튼" 기록 아래에 이 결정(라이브러리·버전·핸들 전용·접근성 보조)을 추가한다.
- §2.5 S16 행에 카테고리 삭제 정책("항목 함께 삭제, 기본 카테고리는 빈 섹션으로 복귀")을 적는다.

## 검증

```
npm run check
npx tsc --noEmit
npx expo-doctor
cd ios && pod install && cd .. && npm run ios
```

iOS 시뮬레이터(Codex Computer Use로 드래그 제스처):

1. 3개 이상 장소가 있는 일차에서 핸들을 끌어 1번을 3번 자리로 → S10 순번, S13 핀 번호, 카드 사이 거리 배지가 새 순서. 앱 재실행 후 유지.
   `day_items.sort_order`가 1000 간격으로 다시 쓰였다.
2. 카드 본문(핸들 아닌 곳)을 세로로 끌면 스크롤만 된다.
3. 설정 → 손쉬운 사용 → VoiceOver 켠 뒤(시뮬레이터: Accessibility Inspector) 위/아래 버튼이 보인다.
4. 카테고리 이름 변경 → 포함 항목 전부 새 이름. 기존 이름과 같은 이름으로 바꾸면 병합되고 순서가 뒤에 붙는다.
5. 카테고리 삭제 → 확인창에 항목 수 → 취소 시 불변, 확인 시 항목 행 삭제. 기본 카테고리는 재진입 시 빈 섹션으로 보인다.
6. `카테고리 추가` → 빈 섹션 → 항목 추가 → `checklist_items.category`가 새 이름. 항목 없이 나가면 섹션이 없다.

## 되돌리는 법

A절은 `package.json` 3줄과 `edit.tsx` 하나로 한정되므로 커밋 revert 후 `pod install`로 돌아간다. 상향 신호: 시뮬레이터에서 드래그 중
항목이 고착되거나 놓은 자리와 다른 곳에 들어가면 RNGH 버전 문제(실행 조건 참고)다. 되돌리고 버전을 먼저 확정한다.

## 기각한 대안

- **RNGH `Pan` 제스처로 직접 구현** — 자동 스크롤·자리표시자·드롭 애니메이션을 다시 만든다. `react-native-sortables`가 유지보수를 멈추면 재론.
- **`react-native-draggable-flatlist`** — 2025-05 이후 릴리스 없음, 신아키 지원 미확인(2026-09-10 조사).
- **카테고리를 별도 테이블로 분리** — 정렬·색상 등 카테고리 속성이 생길 때까지 문자열로 충분하다.
- **카테고리 삭제 시 항목을 "기타"로 이동** — 대상 선택 UI가 필요하고 "기타"라는 예약 이름이 생긴다. 사용자 요청이 있으면 재론.

## 실패 모드

드래그 라이브러리 버전 조합(RNGH 2.x vs 3.x)을 확정하지 않고 `expo install`이 바꿔놓은 버전으로 "동작하는 것 같아서" 진행하는 것이
이 플랜의 실패 모드다. 실행 조건의 버전 확인을 먼저 기록한다.
