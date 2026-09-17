# 14 — S01 홈 여행 생성 진입점을 히어로 아래 행 카드로

`app/index.tsx`의 `여행 일정짜기` 진입점을 **`다가오는 여행` 캐러셀 첫 칸의 156×196 세로 카드**에서
**히어로 바로 아래 가로 1행 카드**로 옮긴다. 2026-09-17 사용자 결정(안 A). 선행 플랜 없음, 단독 실행 가능.

작업 기준 커밋은 `f30397e`이며, 그 위에 **아직 커밋되지 않은 홈 변경**이 워킹 트리에 올라가 있다
(`app/index.tsx`, `docs/design.md` 수정 상태). 이 플랜은 그 상태를 전제로 한다 — 깨끗한 `f30397e`에서
시작하면 `파일:라인`이 전부 어긋나므로, 실행 전 `git status`로 두 파일이 modified 인지 먼저 확인한다.

## 왜 필요한가

2026-09-17에 하단 고정 `BottomCtaBar`를 걷어내고 캐러셀 첫 칸 + 카드로 옮겼는데, 그 카드가 네 가지로 틀렸다.
근거는 `reference-captures/`의 실물 캡처 2개 앱이다(웹 조사는 일반론뿐이라 근거로 쓰지 않았다).

1. **섹션 소속이 틀렸다.** `SectionHeader title="다가오는 여행"`(`app/index.tsx:104`) 아래에 있는데,
   새 여행은 다가오는 여행이 아니다. 섹션 헤더가 카드의 의미를 덮는다.
2. **여행이 늘수록 방해가 된다.** 캐러셀 `ListHeaderComponent`(`app/index.tsx:106`)라 항상 첫 칸이다.
   여행 10건이면 매번 지나쳐야 한다.
3. **196dp를 쓰고 비어 보인다.** 옆 씬 카드는 일러스트로 꽉 차는데 + 카드는 아이콘 하나다
   (`s.newCard` `app/index.tsx:211`).
4. **히어로 344dp 아래라 반쯤 접힌다.** iPhone 16 Pro(874dp) 기준 카드 상단이 화면 중앙 부근이다.

실물 조사 결과:

- **트리플** (`reference-captures/app-02/01-home.png`, `23-home-active-trip.png`) — 진입점이 둘이다.
  헤더 우상단 캘린더+ 아이콘이 **상시**, 하단 떠 있는 pill은 **상황에 따라 내용이 바뀐다**:
  여행이 없으면 `여행 일정짜기`, 있으면 `부산 여행 · D-5 │ 9.9(수)-9.11(금) │ 내 일정`.
  하단 자리를 "만들기"에 영구히 주지 않는 것이 요지다.
- **Wanderlog** (`reference-captures/app-01/35-home-tutorial-dismissed.png`) — 탭바 중앙 원형 + 버튼.
  상시 노출이고 목록과 안 겹친다. 여행 행 메타가 `1곳`(장소 수)이라 우리 카드 메타 선택과 같다.

두 앱 모두 **상시 진입점**을 두고, **목록 항목 사이에 끼워 넣지 않는다.** 지금 구현만 목록 안에 있다.

## 범위 밖(non-goals)

- 홈에 탭바를 새로 만들지 않는다(Wanderlog식 중앙 + 버튼은 그래서 기각).
- 히어로·씬 카드·지난 여행 행의 레이아웃과 내용은 건드리지 않는다. 2026-09-17 결정 그대로 둔다.
- 빈 상태(E01)의 CTA 버튼(`app/index.tsx:81-84`)은 그대로 둔다 — 여행이 0건이면 캐러셀 자체가 없다.

## 실행 조건

- 워킹 트리의 `app/index.tsx`가 2026-09-17 상태여야 한다. `NewTripCard`가 `app/index.tsx:158`에 있고
  캐러셀 `ListHeaderComponent`로 붙어 있으면 맞다. 아니면 심볼 이름으로 다시 찾는다.
- 실행 전 Expo SDK 57 문서(`https://docs.expo.dev/versions/v57.0.0/`)와 `docs/design-system.md` 토큰을 확인한다.
- `docs/design-system.md`에 없는 값을 새로 만들지 않는다. 행 카드는 기존 `list-row`/`place-card` 토큰 범위에서 짠다.

## 절차

1. **`NewTripCard`를 가로 행 카드로 바꾼다** (`app/index.tsx:158-166`, 스타일 `s.newCard` `app/index.tsx:211-222`).
   - 형태: 좌우 `{spacing.gutter}` 여백, 높이 `{sizing.touchMin}` 이상(64dp 권장), `{rounded.lg}`,
     배경 `{colors.surfaceCard}`, 테두리 `{sizing.hairline}`/`{colors.hairline}`.
   - 내용: 왼쪽 원형 + 아이콘(`{sizing.controlHSm}` 원, `{colors.primary}` 바탕) · 가운데 제목 `여행 일정짜기`
     (`{typography.title-md}`, `{colors.ink}`) + 보조 `도시와 날짜만 정하면 끝`(`{typography.caption}`, `{colors.muted}`)
     · 오른쪽 셰브론.
   - 근거: 세로 196dp를 64dp로 줄이면 "비어 보임"(문제 3)이 사라지고 여행 수와 무관하게 자리가 고정된다(문제 2).
   - `components/ui/ListRow.tsx`가 이미 leading/trailing/chevron 구조를 갖고 있다. 재사용 가능한지 먼저 확인하고,
     카드 면(`surfaceCard` + hairline)이 필요해서 안 맞으면 그때 `app/index.tsx` 안에 둔다.
2. **캐러셀에서 떼어내 히어로 아래로 옮긴다** (`app/index.tsx:104-106`).
   - 가로 `FlatList`의 `ListHeaderComponent`를 제거하고, `<Hero>` 직후 · `SectionHeader title="다가오는 여행"` 직전에
     행 카드를 놓는다.
   - 근거: 섹션 밖으로 나가면 의미 충돌(문제 1)이 없어지고, 히어로 바로 아래라 스크롤 전에 보인다(문제 4).
3. **캐러셀 빈 상태를 되살린다** (`app/index.tsx:104-111`).
   - + 카드가 빠지면 `upcoming`이 0건일 때 섹션이 완전히 빈다. 2026-09-17에 지웠던
     `추가로 다가오는 여행이 없어요.` 계열 문구를 `s.sectionEmpty`로 다시 넣는다.
   - 근거: 지금 문구를 지운 이유가 "+ 카드가 자리를 채우니까"였다. 전제가 사라진다.
4. **설계 문서 반영** — `docs/design.md`.
   - §S01 행(`docs/design.md:77`)의 "하단 고정 `여행 일정짜기` → S03"을 이번 진입점으로 고친다.
   - 2026-09-17 항목 18번 아래에, 아직 기록되지 않은 홈 변경을 함께 적는다:
     히어로를 상태바 아래로 내린 것(`marginTop: insets.top + {spacing.xs}`), 상단 모서리 각처리,
     텍스트 여백, 씬 카드 메타를 `기간 · 장소 수`로 바꾼 것과 `day_items ⨝ trip_days` 쿼리 추가,
     배지를 `여행 중` → `N일차`로 바꾼 것.
   - 근거: 이 변경들은 2026-09-17 세션에서 코드만 바뀌고 문서에 안 들어갔다. 이 플랜 실행 시 함께 정리한다.

## 검증

- `npm run check` · `npx tsc --noEmit` 통과.
- 시뮬레이터 `Itinova Clay QA`(`78F26324-A3A7-495B-BEF5-387818CC3A1B`)에서 `xcrun simctl` 스크린샷으로 관찰한다.
  Fast Refresh가 `StyleSheet` 변경을 놓치는 경우가 있으므로, 스타일을 바꿨으면
  `xcrun simctl terminate` → `launch`로 재실행한 뒤 찍는다(2026-09-17 실측).
- 세 분기를 모두 본다:
  1. 진행중 1건 + 다가오는 1건 (현재 QA 데이터) — 행 카드가 히어로와 `다가오는 여행` 사이에 있고 캐러셀 첫 칸이 씬 카드다.
  2. 다가오는 0건 — 캐러셀 자리에 빈 문구가 뜨고 행 카드는 그대로 있다.
  3. 여행 0건 — E01 빈 상태이고 행 카드가 아니라 기존 CTA 버튼이 뜬다.
- 분기 2·3은 QA 데이터를 지우지 않고 만든다. SQLite에 임시 행을 넣고 확인한 뒤 **반드시 지운다**
  (DB 경로는 `~/Library/Developer/CoreSimulator/Devices/<UDID>/data/Containers/Data/Application/*/Documents/SQLite/itinova.db`).
  사용자 데이터 보존은 `AGENTS.md` 규칙이다.
- 접근성: 행 카드의 터치 높이가 `{sizing.touchMin}` 이상인지, `accessibilityRole="button"`과
  읽히는 라벨이 붙었는지 확인한다.

## 기각한 대안

- **헤더 `+` 아이콘 + 캐러셀 맨 뒤 카드** — 진입점 2개. 여행이 많아도 방해가 없다는 장점이 있지만,
  진행중 여행이 있을 때 홈에 헤더가 없다(히어로가 상단을 차지하고 설정 아이콘만 떠 있다).
  아이콘을 하나 더 띄우면 히어로 위 floating 원형이 2개가 된다. **홈에 헤더가 생기면 재론한다.**
- **헤더 `+` 아이콘만** — 가장 iOS답지만 카드 형식을 원한 2026-09-17 사용자 결정과 반대다.
- **트리플식 하단 컨텍스트 pill** — 플로팅을 쓰지 않기로 한 2026-09-17 결정에 어긋나고,
  무엇보다 **히어로가 이미 "진행중 여행으로 가기"를 하고 있어 기능이 겹친다.**
  히어로를 걷어내는 결정이 나오면 재론한다.
- **Wanderlog식 탭바 중앙 + 버튼** — 홈에 전역 탭바가 없다. 탭은 여행 내부(`app/trip/[id]/(tabs)/`)에만 있고,
  이걸 위해 전역 탭바를 만드는 건 비용이 너무 크다.

## 실패 모드

**행 카드가 히어로와 주목도를 다투는 것**이 이 플랜의 실패 모드다. 히어로는 344dp 이미지고 행 카드는 64dp 크림 면이므로
위계는 유지되지만, 행 카드에 채도 색을 넣거나 높이를 키우면 홈에서 눈이 갈 곳이 둘로 갈라진다
(`docs/design-system.md` §Do "채도 카드는 화면당 한 장"). 크림 카드 + hairline을 넘지 않는다.
