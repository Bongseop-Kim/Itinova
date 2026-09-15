# 앱 설정·온보딩 정책·캘린더 범위 실행 리뷰

- 원 플랜: `docs/plans/02-settings-and-onboarding-policy.md`
- 삭제 직전 기준 커밋: `05b0647c3037d455cb1adb9c2f26b458baab8e43`
- 실행 기간: 2026-09-15

## 한 것

1. `docs/design.md`의 S22를 한 화면 3항목 + 로컬 데이터 고지의 2단계로 확정하고, 위치 권한·알림·전역 기본 통화·거리 형식·6개월 캘린더 결정을 §6에 기록했다. S02·S05와 `app_settings` 설명도 실제 구현에 맞췄다.
2. `db/settings.ts`, `lib/date.ts`, `app/settings.tsx`에 `date_format`과 `YYYY.M.D` / `M/D` 선택을 추가했다. 기본값은 `ymd`이며 `app/index.tsx`, `app/trip/[id]/(tabs)/index.tsx`, `app/trip/[id]/(tabs)/itinerary.tsx`, `app/trip/[id]/budget.tsx`가 설정 변경을 즉시 반영한다.
3. `db/expenses.ts`, `lib/expense.ts`에서 가계부 일차 그룹에 실제 날짜를 전달해 S17 헤더도 선택한 날짜 형식을 사용하게 했다.
4. `app/onboarding.tsx`에서 위치 안내 화면을 삭제하고 마지막 CTA를 `시작하기`로 바꿨다. 완료 게이트와 `onboarded=1` 저장은 유지했다.
5. `components/RangeCalendar.tsx`, `app/trip/[id]/settings.tsx`, `lib/calendar.ts`에서 S05와 S21이 같은 6개월 기본값을 쓰게 했다. S21은 부모 스크롤에 월 블록을 포함하고 S05만 캘린더 자체를 스크롤한다. 6개월뿐인 월 목록에는 가상화가 필요 없어 `FlatList` 대신 `ScrollView`/`View`를 썼다.
6. `db/schema.ts`의 `app_settings` 주석을 실제 키인 `onboarded`, `date_format`, `tip_map`에 맞췄고 `lib/check.ts`에 두 날짜 형식과 6개월 연 경계 검사를 추가했다.

## 안 한 것

- AI 구독 상태·관리·구매 복원은 플랜 06의 S23·스토어 연동 범위라 이번 코드에 행을 만들지 않았다.
- 알림, 전역 기본 통화, 거리 단위, 위치 권한 행은 원 플랜 결정대로 만들지 않았다.

## 검증 결과

- `npm run check`: lib, map, travel tools, apple places 검사 통과. `2026년 11월`부터 6개월의 마지막이 `2027년 4월`인지 확인했다.
- `npx tsc --noEmit`, `git diff --check`: 통과.
- `grep -nE '나중에|붙은 뒤에' app/settings.tsx`, `rg -n 'monthCount=' app`: 0건.
- iPhone 17 Pro, iOS 26.0: 온보딩은 가치 제안 → 로컬 데이터 고지의 2단계였고 `시작하기` 후 홈으로 이동했다. 재실행 후 온보딩이 없고 DB의 `onboarded=1`을 확인했다.
- S02에서 `M/D`를 선택하자 홈은 `10/21 ~ 10/26`, S09는 같은 범위, S10은 `10/21/수`, S17은 `day 1 · 10/21/수`로 바뀌었다. 앱 재실행 후 유지됐다.
- S05와 S21에서 같은 공용 6개월 월 목록을 확인했다. S21의 기존 고정 높이와 중첩 `VirtualizedList` 경고는 제거됐다.
- 검증용 비용과 `date_format` 행을 삭제해 기존 여행 데이터와 기본 `ymd` 상태를 복원했다.

## 플랜이 틀렸던 곳

- S17 경로는 플랜의 `(tabs)/budget.tsx`가 아니라 `app/trip/[id]/budget.tsx`였다.
- S21의 부모가 이미 `ScrollView`라 공용 `FlatList`의 스크롤만 켜면 같은 방향 가상 목록 중첩 경고가 난다. 6개월 고정 목록을 비가상 렌더링하고 S21 부모 스크롤을 사용하는 방식으로 수정했다.
- S17 기존 조회에는 날짜가 없어 단순히 `dayMeta` 호출만 추가할 수 없었다. `trip_days.date`를 비용 조회에 포함했다.

## 남은 위험 / 상향 신호

6개월 안에서 날짜를 고르기 어렵다는 피드백이 반복되면 월 수를 재론한다. 날짜 형식이 추가 화면에도 필요해지면 그 화면의 `dayMeta` 호출에도 저장값을 연결한다.
