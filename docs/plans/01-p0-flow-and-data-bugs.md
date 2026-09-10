# P0 — 사용자 흐름 차단과 데이터 오동작 4건

2026-09-09 구현 점검에서 확인된 P0 버그 4건을 고친다. 외부 서비스·새 의존성·스키마 변경 없이
현재 코드(HEAD `c10aca7`)만으로 실행한다. 이 문서 하나만 들고 실행할 수 있어야 하며,
다른 플랜(`02`~`10`)보다 먼저 실행한다.

## 왜 필요한가

- **S07/S08 이탈 불가** — `app/ai/ask.tsx:1-12`와 `app/ai/result.tsx`는 임시 껍데기 `components/Screen.tsx`를
  그대로 쓴다. `app/create/index.tsx:31`이 `router.push('/ai/ask')`로 진입시키지만 `app/_layout.tsx:56-66` 루트
  스택에 `ai/ask`·`ai/result`가 등록되지 않아 헤더 정책이 골격 기본값에 의존하고, `app/ai/result.tsx:9`는
  존재하지 않는 `/trip/1/itinerary`로 링크한다(여행 id는 `db/schema.ts:8`의 문자열 `newId()`라 `1`은 없다).
- **S21 기간 축소 즉시 적용** — `app/trip/[id]/settings.tsx:128`은 `dateChangeWarning` 결과를 텍스트로만 보여주고
  `:67`의 `changeTripDates`가 버튼 탭 즉시 실행된다. `docs/design.md` §4.1은 "감소 시 저장 전 확인 1회"를 요구한다.
- **체크리스트 카테고리 소멸** — `app/trip/[id]/checklist.tsx:22-28`이 섹션을 기존 행에서만 파생하고
  `:66-68` 추가 입력이 섹션 푸터에만 있어, 마지막 항목을 지우면(`:57`) 그 카테고리에 다시 추가할 수 없다.
  전체 0개면 추가 수단 자체가 없다.
- **비용 통화 KRW 고정** — `app/trip/[id]/expense/new.tsx:32`가 `useState(tripCurrency)`로 한 번만 초기화되는데
  `lib/useDbQuery.ts:19-45`는 첫 렌더에 `undefined`를 돌려주므로 `:28`의 `?? 'KRW'` 폴백이 항상 초기값이 된다.
  THB 여행에서도 원화가 선택된다.

## 범위 밖

- S07 5단계 질문, S08 실제 미리보기, AI 호출 — `08-ai-itinerary-screens.md`.
- 체크리스트 카테고리 이름 변경·삭제 메뉴 — `03-itinerary-drag-and-checklist-categories.md`.
- 캘린더 표시 월 수 정책 — `02-settings-and-onboarding-policy.md`.

## 실행 조건

- `npm run check`와 `npx tsc --noEmit`이 시작 전 통과 상태여야 한다. 실패 중이면 원인을 먼저 고친다.
- DB 스키마 변경이 필요해지면 이 플랜에서 하지 않고 멈춘다. 4건 모두 스키마 없이 해결 가능하다고 판단했고,
  그렇지 않다는 것이 드러나면 플랜을 수정한다.

## 절차

각 항목은 독립적으로 커밋·검증한다. 순서는 사용자 피해 크기 순이다.

### 1. S07/S08 이탈 경로 (`app/ai/*`, `app/_layout.tsx`)

1. `app/_layout.tsx:56-66` 루트 스택에 `ai/ask`, `ai/result`를 명시하고 `headerShown: false`로 내린다.
   근거: 다른 실화면과 같은 정책(`docs/design.md` §8-13)이며, `Screen` 껍데기가 헤더에 의존하는 상태를 끊는다.
2. `app/ai/ask.tsx`를 `Screen` 대신 `components/ui.tsx:12-34`의 `ScreenHeader`로 바꾸고 뒤로가기 액션에
   `router.back()`을 연결한다. 본문은 AI 연동 전까지 "준비 중" 카피와 `직접 일정 만들기`(→ `/create/destination`)
   버튼만 둔다. 근거: 설계 S07은 뒤로가기가 필수 요소이고, AI가 붙기 전에도 사용자가 갇히면 안 된다.
3. `app/ai/result.tsx:9`의 `/trip/1/itinerary` 링크를 제거한다. 저장 버튼은 08 플랜까지 두지 않고,
   `홈으로`(`router.navigate('/')`)와 `직접 일정 만들기`만 남긴다. 근거: 죽은 id 링크는 즉시 크래시성 화면을 만든다.
   탭 화면의 `router.back()`은 이전 탭으로 가므로 목적지가 분명한 버튼은 `navigate`를 쓴다(`docs/design.md` "실기기에서만 드러난 것들").
4. `app/trip/[id]/chat.tsx:1-13`도 같은 `Screen` 껍데기다. 최소한 `ScreenHeader` + 뒤로가기만 같은 방식으로 붙인다.

### 2. S21 기간 축소 확인 (`app/trip/[id]/settings.tsx`)

1. `app/trip/[id]/settings.tsx:65-70` `applyDates`에서, `warning`(`:42-48`)이 `null`이 아니면 RN 내장 `Alert.alert`로
   확인창을 띄우고 확인 시에만 `:67`의 `changeTripDates`를 호출한다. 취소는 아무것도 하지 않는다.
   근거: §4.1 "감소 시 저장 전 확인 1회". 여행 삭제가 이미 `Alert`를 쓰므로(§8-10) 새 컴포넌트를 만들지 않는다.
2. `warning`이 `null`(기간 동일·증가)이면 확인 없이 즉시 적용한다. `lib/tripDates.ts:44-52`가 이미 이 구분을 돌려준다.
3. `:128`의 인라인 경고 텍스트는 유지한다. 확인창 본문에도 같은 문자열을 넣어 두 곳이 어긋나지 않게 한다.

### 3. 체크리스트 빈 상태 복구 (`app/trip/[id]/checklist.tsx`, `db/checklist.ts`)

1. 섹션 목록을 "기존 행의 카테고리 ∪ `db/templates.ts:2-5`의 기본 카테고리"로 만든다(`checklist.tsx:22-28`).
   기본 카테고리는 항목이 0개여도 섹션과 `AddRow`(`:74-94`)를 유지한다. 근거: 설계 S16은 기본 템플릿 섹션을
   화면 구조로 본다. 이 한 줄로 "마지막 항목 삭제 후 복구 불가"와 "전체 0개" 두 경우가 함께 풀린다.
2. `db/checklist.ts:22-28`의 `last` 계산을 여행 전체가 아니라 같은 카테고리 기준으로 고친다. 주석(`:21`)이
   이미 그렇게 말하고 있고, 그렇지 않으면 새 항목이 다른 카테고리 뒤로 정렬된다.
3. 사용자 정의 카테고리(기본 템플릿 밖)는 항목이 0개가 되면 사라지는 현재 동작을 유지한다.
   근거: 이름 변경·삭제 메뉴(플랜 03)가 없는 상태에서 빈 사용자 카테고리를 남기면 지울 방법이 없다.

### 4. 비용 입력 기본 통화 동기화 (`app/trip/[id]/expense/new.tsx`)

1. `expense/new.tsx:28-32`: `currency` 상태를 `undefined`로 시작하고, `tripRows`가 처음 도착했을 때 한 번만
   여행 통화로 채운다. 이후 재조회는 덮어쓰지 않는다. 근거: 사용자가 KRW로 바꾼 뒤 화면 갱신으로 되돌아가면
   저장 통화가 의도와 달라진다.
2. `:35`의 `day` 검증에 상한을 더한다. `db/expenses.ts:61-66` `tripDaysQuery` 결과의 일차 수를 넘으면 `undefined`로 취급한다.
   근거: 현재는 범위 밖 `day`가 칩 없는 `dayIndex`를 만든다.
3. `placeId`는 `db/expenses.ts:46`에서 존재만 확인하고 여행 소속은 확인하지 않는다. 같은 여행의 `day_items` 또는
   `saved_places`에 있는 장소가 아니면 `null`로 저장한다. 근거: 원 플랜 "다른 여행의 `placeId`는 연결하지 않는다".
4. `:122`의 "진입 경로가 없다" 주석은 `components/PlaceQuickActions.tsx:44`가 이미 `placeId`를 넘기므로 사실과 다르다.
   주석을 지우고, 연결된 장소명을 폼에 한 줄 표시한다.

### 5. 순수 로직 검사 추가 (`lib/check.ts`)

- 통화 초기화 규칙과 `day` 상한 검증은 순수 함수로 빼서 `lib/check.ts`에 케이스를 추가한다(기존 `:189` §4.1 절 옆).
- 체크리스트 섹션 합치기(기본 ∪ 기존)도 순수 함수로 두고 "기본 카테고리 항목 0개 → 섹션 유지", "사용자 카테고리 0개 → 섹션 제거"
  두 케이스를 넣는다.

## 검증

```
npm run check
npx tsc --noEmit
```

iOS 시뮬레이터(`xcrun simctl` + Codex Computer Use):

1. 홈 → `여행 일정짜기` → `AI 일정 추천받기` → S07 뒤로가기 → 생성 방식 시트로 복귀. S07·S08 어디서도 홈으로 나갈 수 있다.
   `grep -rn "/trip/1/" app/`가 0건이다.
2. 장소가 있는 3일 여행을 2일로 줄인다 → 확인창에 이동 장소 수가 표시된다 → 취소 → `trip_days`, `day_items` 행 수 불변.
   확인 → 초과 일차 장소가 `saved_places`로 이동하고 이미 저장된 장소는 중복 삽입되지 않는다.
   일차만 늘리면 확인창이 뜨지 않는다.
3. 한 카테고리의 모든 항목 삭제 → 섹션과 입력창이 남는다 → 새 항목 추가 → `checklist_items.category`가 그 카테고리이고
   `sort_order`가 같은 카테고리의 마지막 뒤다. 전체 항목 삭제 후에도 두 기본 섹션이 남는다.
4. THB 여행 → BS1 `비용 추가` → 최초 통화가 THB, 연결 장소명이 표시된다 → KRW로 변경 후 다른 입력을 바꿔도 KRW 유지 →
   저장 후 `expenses.currency`, `trip_day_id`, `place_id`가 화면 선택과 일치한다.

SQLite 확인은 시뮬레이터 앱 컨테이너의 DB 파일을 `sqlite3`로 읽는다. 검증용 여행만 만들고 끝나면 삭제한다.

## 되돌리는 법

각 항목이 독립 커밋이므로 `git revert`로 개별 복구한다. 상향 신호: 확인창 도입 후 기간 변경이 두 번 적용되는 로그가
보이면(`trip_days` 중복 생성) 즉시 2번 항목을 되돌리고 `applyDates` 중복 호출 경로를 찾는다.

## 기각한 대안

- **S07/S08을 `create` 모달 스택 안으로 옮기기** — 설계 §2.8 라우트 트리가 `/ai/*`를 루트로 둔다. 라우트 변경은 설계 수정을
  동반하므로 08 플랜에서 AI 화면 전체를 만들 때 함께 판단한다.
- **체크리스트 빈 상태에 "카테고리 선택 후 추가" 별도 UI** — 기본 카테고리 섹션을 유지하면 같은 결과를 UI 추가 없이 얻는다.
  사용자 정의 카테고리를 만들 수 있게 되면(플랜 03) 재론한다.
- **통화 동기화를 위해 `useDbQuery`에 초기값 옵션 추가** — 훅을 건드리면 12개 화면이 영향받는다. 화면 하나의 문제다.

## 실패 모드

"확인창을 붙였다"에서 멈추고 취소 경로가 여전히 `changeTripDates`를 호출하는지 시뮬레이터로 확인하지 않는 것이
이 플랜의 실패 모드다. 4건 모두 화면 결과가 아니라 SQLite 행으로 판정한다.
