# S07 AI 질문 5단계 · S08 생성 결과 미리보기

`app/ai/ask.tsx`와 `app/ai/result.tsx`를 임시 `Screen` 껍데기에서 실제 화면으로 바꾼다. 플랜 07의 `generate` 엔드포인트와 플랜 06의
`useEntitlement`·API 클라이언트가 있어야 한다. 장소 좌표는 앱의 Apple MapKit 검색(`lib/applePlaces.ts`, `modules/apple-place-search`)으로 해석한다.

## 왜 필요한가

- 두 파일은 12줄짜리 골격이다(`app/ai/ask.tsx:1-12`, `app/ai/result.tsx`). 플랜 01이 뒤로가기와 죽은 링크만 고쳤다.
- 설계 §2.3·§3.3·§5.2가 정한 흐름(5단계 → 생성 → Apple 해석 → 미리보기 → 트랜잭션 저장)이 통째로 미구현이다.

## 범위 밖

- S19 채팅(플랜 09). 코치마크 C05(플랜 10).
- S08에서 장소 순서 편집·시간 지정. 저장 후 S14에서 한다.
- 생성 결과 캐시·재방문. 화면을 나가면 초안은 버린다.

## 실행 조건
- 헤더·입력·칩·시트·탭은 `components/ui/`의 공용 컴포넌트를 쓴다(2026-09-16 플랜 12로 도입). 새로 만들지 않는다. 채팅 화면 배치의 원 레퍼런스는 Designbase 템플릿의 `생성형 AI 채팅` 프레임(모델명 드롭다운 헤더, 아이콘 칩 빠른 시작, 첨부·마이크 컴포저)이었다. **이미지는 2026-09-17에 저장소에서 지웠다** — 필요하면 `git checkout 81ac2da -- docs/references/designbase-app-ui/screens` 로 꺼낸다.


- 플랜 06 게이트가 S03에서 동작하고, 플랜 07 `generate`가 sandbox에서 200을 준다.
- iOS 개발 빌드(Apple 검색 네이티브 모듈 필요).

## 결정

| 항목 | 결정 | 근거 |
| --- | --- | --- |
| S07 상태 | 단일 화면 + `useState` step(설계 §2.3). URL 파라미터로 넘기지 않는다 | 5단계 값(복수 선택 배열 포함)을 URL에 싸는 것보다 한 컴포넌트 상태가 짧다. 뒤로가기는 step 감소 |
| 도시 입력 | `app/create/destination.tsx`의 인기 도시 + Apple 도시 검색을 재사용(`lib/useAppleSearch.ts`) | 같은 데이터, 같은 컴포넌트 |
| 기간 | `nights 0..5` 칩. 실제 날짜는 S08 저장 시 묻지 않고 **오늘+7일부터**로 기본 생성, S21에서 변경 | §5.2 입력에 날짜가 없다. 날짜 선택 단계를 늘리지 않는다. **추정** — 사용자가 날짜를 먼저 정하고 싶어하면 S05 캘린더를 6단계로 재론 |
| 장소 해석 | 각 `search_query`를 도시 좌표 주변으로 `MKLocalSearch`. 실패 항목은 제외. 일차 장소 수가 밀도 기준 미달이면 `다시 생성` 권고 배너 | §5.2-3 |
| 저장 | `db/createTrip.ts`를 확장해 `origin:'ai'`와 일차별 장소를 **한 sync 트랜잭션**으로 적재 | 기존 패턴(`docs/design.md` §8-5 "expo-sqlite는 sync 드라이버"). 새 트랜잭션 API 도입 없음 |

## 절차

### S07 (`app/ai/ask.tsx`)

1. `ScreenHeader`(플랜 01) 아래 진행바(`1/5`)와 step별 본문. step 0 상단에 `24-ai-itinerary-intro` 카피 한 줄(§2.3 주석).
2. 단계별 규칙: ① 도시 필수 ② 기간 필수(0~5) ③ 동행 복수·최소 1 ④ 스타일 복수·최소 1 ⑤ 밀도 단일 필수. 다음 버튼은 조건 충족 전 비활성.
   칩 값 목록은 `lib/tripStyle.ts`(S06과 공유)에서 가져온다. 근거: S06과 같은 어휘여야 `trips.companion`·`styles`에 그대로 저장된다.
3. 뒤로가기: step>0이면 step-1(입력 보존), step 0이면 `router.back()`.
4. 5/5 `생성` → 버튼 비활성 + 생성 중 표시 → `generate` 호출(플랜 06 클라이언트) → 성공 시 결과를 `router.push('/ai/result')`에 **파라미터가 아닌 모듈 스코프 임시 저장소**
   (`lib/aiDraft.ts`의 변수 하나)로 넘긴다. 근거: 응답이 URL 파라미터 크기를 넘고, DB에 쓰면 §5.2-4 "저장 전까지 DB에 쓰지 않는다" 위반.
5. 실패: `UPSTREAM_TIMEOUT`·네트워크 → "다시 시도 · 직접 일정 만들기(S04로 `router.replace`)". `RATE_LIMITED` → 초기화 시각 표시. `ENTITLEMENT_INACTIVE`·`SESSION_INVALID` → S23으로.
   중복 제출은 `inFlight` ref로 막는다.

### 장소 해석 (`lib/aiResolve.ts`)

1. 초안의 모든 `search_query`를 도시 좌표 기준으로 `lib/applePlaces.ts` 검색. 동시 실행 4개로 제한, 항목당 15초(기존 검색 제한과 동일).
2. 첫 결과를 채택하되 `lib/applePlaces.ts`의 `appleCategory`로 모델 `category`와 대분류가 다르면(예: 모델 `food` ↔ Apple `attraction`) 결과를 제외한다.
   근거: 이름만 같은 다른 장소를 걸러낸다. **추정** 규칙이며 오탐이 많으면 완화.
3. 순수 함수(입력 초안 + 해석 결과 → 표시용 일차 배열, 밀도 미달 판정)로 분리해 `lib/check.ts`에 케이스를 넣는다.

### S08 (`app/ai/result.tsx`)

1. `lib/aiDraft.ts`에 초안이 없으면(딥링크·재실행) 즉시 `router.replace('/create')`. 근거: 빈 화면을 만들지 않는다.
2. 상단 생성 근거 1줄(모델 `reason` 요약이 아니라 입력 요약: "부산 · 2박 · 친구와 · 먹방 · 널널"), 일차별 카드, 항목별 `제외` 토글, 헤더 `다시 생성`,
   하단 정확성 고지(§5.3과 같은 문구), CTA `내 여행으로 저장`(해석된 장소가 0개면 비활성).
3. `다시 생성`: 같은 입력으로 `generate` 재호출. 이전 초안은 메모리에서만 교체된다 — DB에 아무것도 남지 않는다(완료 조건).
4. 저장: `db/createTrip.ts`에 `origin`과 `items:[{dayIndex, place}]` 인자를 추가하고 기존 트랜잭션 안에서 `places` upsert(`apple_place_id` unique, `db/places.ts`의 기존
   충돌 회피 재사용) → `day_items` 삽입(`sort_order` 1000 간격, `lib/reorder.ts:50-51`). 제외한 항목은 넣지 않는다. 성공 시 `lib/aiDraft.ts` 비우고
   `router.replace('/trip/${id}/itinerary')`. 실패 시 트랜잭션 롤백으로 부분 여행이 남지 않고 CTA가 다시 활성.
5. `app/ai/result.tsx:8`의 자리표시자 문자열을 제거한다.

### 설계 문서

- `docs/design.md` §2.3 S07 행에 "날짜는 저장 시 오늘+7일 기본, S21에서 변경"을, §5.2 후처리에 카테고리 불일치 제외 규칙을 추가한다.
- §8 표의 "S07·S08 라우트 골격" 행을 갱신한다.

## 검증

```
npm run check && npx tsc --noEmit
grep -rn "components/Screen" app/ai/   # 0건
```

iOS 개발 빌드, sandbox 세션:

1. 1/5→5/5 이동 후 뒤로 4번 → 각 단계 입력이 그대로다. 필수 미충족 단계에서 `다음`이 비활성.
2. 생성 중 `생성` 연타 → 요청 1건(서버 로그).
3. 기내 모드에서 생성 → 오류 안내 → `직접 일정 만들기`로 S04 진입.
4. 결과에서 장소 2개 제외 → 저장 → `day_items` 행 수 = 표시 항목 − 2. `trips.origin = 'ai'`. `places`에 해석 실패 항목 없음.
5. `다시 생성` 2회 후 저장 취소하고 나가기 → `trips` 행 수 불변.
6. 저장 성공 → S10으로 이동, 순번·거리 배지 표시. 앱 재실행 후 동일.
7. 저장 중 강제 실패(테스트용 throw) → `trips`·`trip_days`·`day_items` 어디에도 새 행 없음.

## 기각한 대안

- **초안을 `chat_messages`나 임시 테이블에 저장** — §5.2-4 위반. 앱이 백그라운드에서 죽으면 초안이 사라지는 것은 감수한다(재생성 비용 1회).
- **S07 상태를 URL 파라미터로** — S03~S06은 값이 스칼라라 URL이 맞았다. 배열 3개는 아니다.
- **날짜 선택을 6단계로 추가** — 설계가 5단계다. 사용자 요청이 확인되면 재론.
- **Google Places로 해석** — Apple 결정(§ "2026-09-09").

## 실패 모드

해석 실패 항목을 "일단 좌표 없이 저장"하는 것이 이 플랜의 실패 모드다. 좌표 없는 장소는 지도·거리·재정렬 전부를 깨뜨린다. 해석 실패는 제외만 한다.
