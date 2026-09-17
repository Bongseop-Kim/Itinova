# Itinova 구현 보완 플랜 — 인덱스

2026-09-09 구현 점검(`docs/design.md` §8 "현재 구현 상태" 표 기준)에서 나온 버그와 미구현 범위를 10개 플랜으로 나눴다.
각 플랜은 `AGENTS.md` 형식을 따르고 단독으로 실행·검증할 수 있다. 실행이 끝난 플랜은 결과를 `docs/reviews/`에 기록하고 여기서 삭제한다
(`docs/reviews/`는 2026-09-10 현재 없다. 첫 완료 시 만든다).

## 공통 전제

- 코드 기준 HEAD `c10aca7`(2026-09-10). 플랜의 `파일:라인`은 이 시점 값이며 실행 시 어긋나면 심볼 이름으로 다시 찾는다.
- 구현 전 Expo SDK 57 문서(`https://docs.expo.dev/versions/v57.0.0/`)와 `docs/design-system.md` 토큰을 확인한다.
- 정본은 `docs/design.md`다. 구현과 다르게 결정한 것은 코드에 남기지 않고 각 플랜의 "설계 문서" 항목대로 `design.md`를 고친다.
  서버 API 계약(플랜 05·07)은 `server/src/contracts.ts`가 정본이고 `design.md` §5.0은 그것을 요약한다.
- 검증은 `npm run check`, `npx tsc --noEmit`, iOS 시뮬레이터(`xcrun simctl` + Codex Computer Use), 필요 시 SQLite 행 확인. E2E는 플랜 완료 체크포인트에서만.

## 플랜과 순서

| # | 파일 | 범위 | 선행 | 외부 의존 |
| --- | --- | --- | --- | --- |
| 04 | `04-backup-scope.md` | 백업 v2(채팅 포함), 부분 실패 안내 | 01 | 없음 |
| 05 | `05-subscription-server.md` | Cloud Run `itinova-api`, Apple 검증·알림, Firestore, 세션, `verify` rate limit. (D절 Google Play는 Android 출시 후) | — | GCP·App Store Connect |
| 06 | `06-subscription-client.md` | `expo-iap`, S23, 구매 복원, AI 게이트 | 05 A·B | 개발 빌드, Sandbox 계정 |
| 07 | `07-ai-server.md` | `generate`·`chat` 엔드포인트, 요금제 3단계(라이트 ₩1,900·플러스 ₩2,900·프로 ₩6,900) 원가·한도, OpenAI `gpt-5.6-luna` | 05 | OpenAI API 키 |
| 08 | `08-ai-itinerary-screens.md` | S07 5단계, Apple 해석, S08 미리보기·트랜잭션 저장 | 06, 07 | 개발 빌드 |
| 09 | `09-ai-chat.md` | S19 채팅, 8턴 윈도우, 장소 카드 → BS3 | 07, 08 | 개발 빌드 |
| 10 | `10-coachmarks-and-content.md` | C01~C05, 썸네일·상세 정리, S09 추천 캐러셀 | C01·C04·콘텐츠: 01 / C02·03: 03 / C05: 08 / 캐러셀: 09 | 없음 |
| 14 | `14-home-create-entry.md` | S01 홈 여행 생성 진입점을 히어로 아래 행 카드로 | — | 없음 |

권장 순서: **01 → (02, 03, 04 병행) → 05 → 06 → 07 → 08 → 09 → 10**. 05는 GCP 준비가 되는 즉시 01과 병행할 수 있다.
10의 C01·C04·콘텐츠 정리는 01 직후 언제든 끼워 넣을 수 있다. 11(클레이 자산)은 2026-09-17 완료했다 — `docs/reviews/2026-09-16-11-clay-assets-and-visual-refresh.md`.
12(Designbase 컴포넌트·아이콘)는 2026-09-16 완료했다 — `docs/reviews/2026-09-16-12-designbase-component-refresh.md`.
13(홈 히어로 씬)은 2026-09-17 완료했다 — `docs/reviews/2026-09-17-13-home-hero-scenes.md`.

## 2026-09-10 웹 조사로 원 플랜에서 바뀐 것

| 원 플랜 내용 | 정정 | 반영 플랜 |
| --- | --- | --- |
| IAP 라이브러리 "선택한다" | `expo-iap` 5.x로 확정. `react-native-iap`는 v15부터 Expo 지원 종료 | 06 |
| Apple 검증 방식만 명시 | sandbox 베이스 URL `api.storekit-sandbox.apple.com`, 공식 `@apple/app-store-server-library` 3.1.0 사용, Xcode StoreKit Testing 거래는 서버 검증 불가 | 05 |
| Cloud Run "최대 2~5" | 기본값이 100이므로 `--max-instances 3` 명시. 요청 제한 기본 300초 → `--timeout 60` 명시. 예산 알림은 지출을 막지 않는다 | 05 |
| `claude-sonnet-5` | 사용자 결정(2026-09-10)으로 OpenAI `gpt-5.6-luna`($0.20/$1.20)로 전환. 원가가 Sonnet 5의 약 1/9. 채택 조건은 장소 해석률 비교 게이트 | 07 |
| Firebase App Check | 2026-09-10 사용자 결정으로 제외. 세션·사용량 한도·`verify` IP rate limit이 같은 위험을 덮는다. 남용 신호 관측 시 재도입 | 05·06 |
| "tool use로 강제하는 구조" | OpenAI Responses API structured outputs(`text.format` json_schema) + `zodTextFormat`으로 변경 | 07 |
| 드래그 "라이브러리 필요" | `react-native-sortables` 1.10.0. reanimated 4.6·RNGH 3.2가 이미 expo-router peer로 링크됨. RNGH 2.x/3.x 버전 확정이 실행 조건 | 03 |
| 트랜잭션 언급 없음 | 앱은 기존 sync `db.transaction` 패턴 유지(§8-5). 비동기 API를 새로 들이지 않는다 | 08 |

## 전체 완료 판정

아래가 모두 참이면 원 플랜(2026-09-09)의 목표를 달성한 것이다.

- [x] 01의 P0 4건이 재현되지 않는다.
- [ ] `grep -rn "components/Screen" app/`가 0건이다(08·09 이후).
- [ ] S02에 동작하지 않는 행·안내가 없고, 백업 문구와 JSON 범위가 일치한다(02·04).
- [x] S14 드래그, S16 카테고리 메뉴가 동작한다(03).
- [ ] 서버가 스토어 검증 + 세션 + 권한 + 한도를 모두 확인한 뒤에만 모델을 호출하고, 앱 번들과 로그에 키가 없다(05·07).
- [ ] Sandbox 실기기에서 구독·복원·취소·환불 흐름이 기대대로 열리고 막힌다(06).
- [ ] S07→S08→저장→S10, S19 장소 카드→BS3가 동작한다(08·09).
- [ ] C01~C05가 정해진 트리거에서 한 번씩 뜬다(10).
- [x] 빈 상태·온보딩·S20·썸네일·S03·S12에 클레이 에셋 15종과 앱 마크 1종이 들어가고 `app.json`에 `#1554D1`이 없다(11).
- [x] 헤더·시트·검색에 텍스트 액션이 없고 탭바에 아이콘이 있으며 화면별 `Field`·scrim 중복이 없다(12).
- [x] S01 홈이 도시 씬 히어로 + 가로 캐러셀로 서고, 진행중 없음·여행 0건 분기가 모두 성립한다(13).
- [ ] 각 플랜의 "설계 문서" 항목이 `docs/design.md`에 반영됐다.
