# S19 여행 맥락 채팅

`app/trip/[id]/chat.tsx`를 임시 `Screen` 껍데기(`:1-13`)에서 실제 채팅 화면으로 바꾼다. 플랜 07의 `chat` 엔드포인트, 플랜 06의 게이트·클라이언트,
플랜 08의 장소 해석 함수(`lib/aiResolve.ts`)를 재사용한다. 메시지는 여행별로 로컬 `chat_messages`(`db/schema.ts:99-105`)에 저장한다.

## 왜 필요한가

- `chat_messages` 테이블은 정의만 있고 읽거나 쓰는 코드가 없다(2026-09-10 grep). S19는 골격이다.
- 설계 §2.5 S19·§5.3의 흐름(컨텍스트 배지, 추천 칩, 장소 카드 → BS3, 정확성 고지, 8턴 윈도우)이 미구현이다.
- S10 `AI에게 묻기` 칩(`itinerary.tsx:106`)이 플랜 06에서 게이트만 붙은 채 빈 화면으로 간다.

## 범위 밖

- 대화 요약 압축, 여러 대화 스레드, 대화 삭제 UI(여행 삭제 cascade로 충분).
- 채팅 백업 포함은 플랜 04가 처리한다.
- S09 추천 캐러셀(플랜 10-7)은 이 플랜의 장소 카드 컴포넌트를 재사용한다.

## 실행 조건

- 플랜 07 `chat` 200, 플랜 08 `lib/aiResolve.ts` 존재. iOS 개발 빌드.

## 결정

| 항목 | 결정 | 근거 |
| --- | --- | --- |
| 저장 | 사용자·어시스턴트 메시지 모두 `chat_messages`에 즉시 삽입. 장소 카드는 `content`에 JSON으로 함께 저장 | 스키마 변경 없음. 재진입 시 카드가 되살아난다 |
| 전송 윈도우 | 최근 8턴(사용자+어시스턴트 16행)을 `lib/chatWindow.ts` 순수 함수로 잘라 보낸다 | §5.3. `lib/check.ts`로 검증 가능 |
| 컨텍스트 | `lib/itinerary.ts` `groupByDay` 결과로 §5.3 형식 문자열 생성. 다른 여행 데이터 접근 없음 | 쿼리가 `trip_id`로 고정 |
| 추천 칩 | 빈 일차 있음 → "day N 뭐 넣을까?", 없음 → "동선 좀 봐줄래?" 정적 분기 | §5.3 |
| 장소 카드 | 서버 `places[]`(플랜 07-5)만 해석. 본문 텍스트 파싱 없음. 실패 시 카드 없이 텍스트 | §5.3 해석 실패 규칙 |

## 절차

1. `db/chat.ts`: `chatQuery(tripId)`, `appendMessage(tripId, role, content)`. 조회는 `useDbQuery(…, [chatMessages], [id])`.
2. `lib/chatWindow.ts`: 행 배열 → 최근 8턴 → 서버 요청 `messages` 형태. `lib/check.ts`에 "17행 입력 → 16행 출력, 첫 행이 user" 케이스.
3. `lib/chatContext.ts`: 여행 + `groupByDay` → §5.3 시스템 컨텍스트 문자열. 케이스: 빈 일차 `(없음)` 표기, 날짜 형식(플랜 02 설정 무관하게 `M/D` 고정).
4. `app/trip/[id]/chat.tsx`: `ScreenHeader`, 컨텍스트 배지, 메시지 `FlatList`(inverted), 추천 칩(메시지 0개일 때만), 입력바, 하단 정확성 고지 상시.
   전송 → 사용자 행 저장 → `chat` 호출(플랜 06 클라이언트, 12초 timeout) → 응답 저장. 실패 시 사용자 행 옆 `다시 시도`; 어시스턴트 행은 저장하지 않는다.
5. 응답 `places[]`를 `lib/aiResolve.ts`로 해석(여행 도시 좌표 기준) → 카드 렌더 → `일정에 담기` → 기존 `components/DayPickerSheet.tsx`(BS3) →
   `db/places.ts` `addPlacesToDay`/`savePlaces` 재사용. 해석 실패 항목은 카드 없음.
6. 게이트: 플랜 06-9가 붙인 `useEntitlement` 분기를 유지한다. `inactive`면 이 화면에 오지 않는다. 화면 안에서 `ENTITLEMENT_INACTIVE`·`RATE_LIMITED`를 받으면
   입력바를 잠그고 S23 또는 초기화 시각 안내.
7. `docs/design.md` §8 표 "S07·S08·S19 AI" 행 갱신, §5.3에 "카드 JSON은 `content`에 저장" 한 줄.

## 검증

```
npm run check && npx tsc --noEmit
grep -rn "components/Screen" app/   # 0건 — 마지막 골격이 사라진다
```

iOS 개발 빌드, sandbox 세션:

1. 여행 A에서 3턴 대화 → 여행 B 채팅에 A의 메시지·일정이 없다(화면·서버 요청 body 모두).
2. 10턴 대화 후 전송 → 서버 요청 `messages`가 16행. 화면에는 20행 전부.
3. 응답 장소 카드 `일정에 담기` → day 2 → `day_items` 1행 추가, S10 반영. 저장함에만 담기 → `saved_places`.
4. 존재하지 않는 장소명이 응답에 오면 카드 없이 텍스트만.
5. 기내 모드 전송 → 사용자 행은 남고 `다시 시도` 표시, 어시스턴트 행 없음.
6. 정확성 고지가 스크롤과 무관하게 항상 보인다.

## 기각한 대안

- **응답 텍스트에서 장소명 정규식 추출** — 오탐이 카드가 된다. 서버 구조화 필드가 있다.
- **컨텍스트를 서버에서 조립** — 여행 데이터를 서버에 보내지 않는다(§5.0). 앱이 최소 문자열만 만든다.
- **별도 `chat_place_cards` 테이블** — JSON in `content`로 충분. 카드 검색·집계가 필요해지면 재론.

## 실패 모드

`chat_messages` 조회를 `trip_id` 없이 만들어 다른 여행 대화가 섞이는 것이 이 플랜의 실패 모드다. 검증 1번이 그것을 잡는다.
