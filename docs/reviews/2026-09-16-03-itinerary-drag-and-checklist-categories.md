# 일정 드래그·체크리스트 카테고리 실행 리뷰 — 원 플랜 HEAD `6d682cc915735d4e89d7dd0f5940edc7d3400a94`

- 원 플랜: `docs/plans/03-itinerary-drag-and-checklist-categories.md`
- 실행 기간: 2026-09-15 ~ 2026-09-16
- 사용자 요청에 따라 구현 결과를 리뷰로 이관하고 플랜을 삭제한다. 사용자의 직접 핸들 드래그 확인까지 완료했으며, 아래의 실기기 VoiceOver 미검증을 통과로 처리하지 않는다.

## 한 것

1. **A-1 의존성** — `package.json`에 Sortables 1.10.0, RNGH 3.2.1, Reanimated 4.5.1, Worklets 0.10.1을 명시했다. Reanimated·Worklets는 [Expo 57 권장 조합](https://docs.expo.dev/versions/v57.0.0/sdk/reanimated/)이다. RNGH 3.2.x의 RN 0.86 지원은 [공식 호환 표](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/getting-started/)로 확인하고 해당 패키지만 Expo 권장 버전 검사에서 제외했다. `babel-preset-expo`가 플러그인을 포함하므로 Babel 설정을 추가하지 않았다. 사용자의 Expo patch 갱신을 유지했고, 2026-09-16 Doctor가 새로 권장한 Expo 57.0.23도 반영했다.
2. **A-2 루트** — `app/_layout.tsx:58`에서 Stack을 `GestureHandlerRootView`로 감쌌다.
3. **A-3·4 목록과 핸들** — `app/trip/[id]/edit.tsx`에서 일차마다 한 열 `Sortable.Grid`를 렌더하고 핸들에서만 드래그하도록 했다. 완료 시 변경된 ID 순서를 기존 `reorderDay`에 전달한다. 일차 경계를 넘는 이동은 기존 선택 액션을 사용한다.
4. **A-4 드래그 충돌 수정** — 첫 Maestro 2초 스와이프는 성공했지만 사용자가 직접 끌면 바뀌지 않는다고 보고해 검증을 다시 열었다. 로그상 부모 스크롤이 약 11px 이동에서 드래그를 취소했다. `edit.tsx:23`의 `DragHandle`에서 UI 스레드의 터치 시작으로 공유값을 바꾸고 `useAnimatedProps`로 부모 스크롤을 잠근다. 종료·실패·취소를 받는 `onFinalize`에서 복원한다. [RNGH 3 Tap 콜백](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/use-tap-gesture/)과 [Reanimated animated props](https://docs.swmansion.com/react-native-reanimated/docs/core/useAnimatedProps/)를 사용했다. JS 상태만으로 잠그는 방식은 빠른 드래그에 부족했다. 화면 전체의 `canCancelContentTouches=false`는 본문 스크롤까지 막아 제거했다. 라이브러리 수정과 패치 도구도 제거했다.
5. **A-5·6 접근성·기존 조작** — `edit.tsx`에서 스크린리더 상태 조회·변경 구독과 정리를 추가했다. 스크린리더에서는 드래그를 끄고 위/아래 버튼을 제공한다. 핸들에 장소 이름과 플랜의 접근성 안내를 붙였다. 모션 감소 설정에 따라 활성화·드롭 시간을 줄인다. 거리순 정렬, 방문 체크, 지도 선택, day 전체 선택과 이동·삭제 액션은 유지했다.
6. **B-1 저장** — `db/checklist.ts:61`의 카테고리 이름 변경·병합과 `:76`의 삭제는 여행에 한정된 트랜잭션이다. 병합 항목은 대상의 마지막 정렬값 뒤에 원래 순서대로 붙인다. `:47` 항목 이름 변경과 `:52` 접근성 순서 변경도 추가했다.
7. **B-2·3 메뉴** — `app/trip/[id]/checklist.tsx`에 카테고리·항목 더보기 메뉴와 이름 변경 입력을 추가했다. 카테고리 삭제는 포함 항목 수를 보여 주는 2차 확인을 거친다. 항목 메뉴의 위/아래 조작은 스크린리더에서만 제공한다.
8. **B-4·5 빈 섹션** — `checklist.tsx:26`의 화면 상태로 빈 사용자 카테고리를 만들고 첫 항목을 저장하면 임시 상태에서 제거한다. 빈 카테고리는 화면 이탈 후 사라진다. 기본 카테고리는 항목 삭제 후 빈 섹션으로 유지하고 확인창에도 안내한다. Footer의 카테고리 key는 입력 상태를 재설정하기 위해 유지했다.
9. **C 순수 검사** — `lib/checklist.ts:2`에 병합 정렬값 계산을 분리하고 `lib/check.ts:29`에 빈 대상, 순서가 섞인 대상, 빈 원본, 비표준 기존 간격의 네 검사를 추가했다. 기존 드래그 ID 순서 검사는 중복하지 않았다.
10. **D 설계** — `docs/design.md`의 S16 정책, §8의 카테고리·드래그 결정과 구현 상태를 갱신했다. 2026-09-16 핸들 터치와 부모 스크롤 충돌 수정도 기록했다.

| Before | After | Why |
| --- | --- | --- |
| 빠른 핸들 이동 중 부모 스크롤이 드래그를 취소 | 핸들 터치 시작 시 UI 스레드에서 스크롤 잠금, 종료·실패·취소 시 복원 | 핸들 드래그와 본문 스크롤을 각각 유지 |
| 라이브러리 기본 활성화·드롭 모션 | 디자인 토큰의 100ms·200ms, 모션 감소 시 0ms | 위치 변화 피드백에 필요한 시간으로 제한 |

## 안 한 것

- VoiceOver 실기기 조작은 검증하지 못했다. 플랜은 Simulator의 Accessibility Inspector로 VoiceOver를 켜라고 했지만 [Apple 공식 안내](https://developer.apple.com/documentation/accessibility/performing-accessibility-testing-for-your-app)는 Simulator에서 VoiceOver를 사용할 수 없고 실기기가 필요하다고 명시한다. 접근성 코드 구현과 실제 VoiceOver 사용자 검증을 구분한다.
- Android 입력 UI, 일차 간 드래그, 템플릿 편집과 코치마크는 원 플랜의 범위 밖이다.

## 검증 결과

- `npm run check`: lib, map, travel tools, apple places 검사 통과. 카테고리 병합 네 케이스 포함.
- `npx tsc --noEmit`, `git diff --check`: 통과.
- `npx expo-doctor`: 2026-09-15 명시한 네 의존성을 포함해 21/21. 2026-09-16에는 Expo 57.0.23 권장으로 20/21이 되어 해당 patch를 반영했고 최종 21/21을 확인했다.
- 2026-09-16 Expo 57.0.23 반영 후 `pod install`과 `npm run ios -- --device B0C92012-9758-4B50-B838-C69A72B7FB4A --no-bundler`가 종료 코드 0으로 성공했다. 최종 빌드는 0 errors, 중복 `-lc++` 경고 1개이며 Simulator 설치·실행도 완료됐다.
- patch 갱신 후 처음 `pod install`은 ExpoFont 로컬 명세 불일치로 실패했다. `pod update --no-repo-update` 후 설치·iOS 빌드가 성공했다. 2026-09-15 빌드는 0 errors, 중복 `-lc++` 경고 1개였다. Expo CLI의 최종 Simulator 창 활성화 `osascript`는 실패했으며, 설치·실행·deep link는 `xcrun simctl`로 수행했다.
- iPhone 17 Pro / iOS 26.0 / `B0C92012-9758-4B50-B838-C69A72B7FB4A`에서 카테고리 이름 변경 후 항목 2개가 Documents로 이동했다. 기본 짐싸기를 병합하면 신분증·보험·충전기가 1000·2000·3000 순서로 저장됐다. 사용자 카테고리 삭제 확인창은 항목 3개를 표시했고 취소 시 3개 유지, 확인 시 해당 3개 삭제였다.
- 기본 카테고리의 항목 1개 삭제 확인창에 빈 상태 유지 안내가 표시됐다. 삭제·재실행 후 기본 섹션이 남았다. Gear 생성·첫 항목 저장은 `category=Gear`, `sort_order=1000`이었고 항목 이름 변경도 반영됐다. 빈 Temporary는 재실행 후 사라지고 Gear의 저장 항목은 남았다. 입력 자동화의 한글 입력이 실패해 이름 입력은 영문으로 검증했다.
- 초기 2초 핸들 드래그 후 DB는 장소 2·3·1 순서였다. 앱 재실행 후 S10 순번, 2.1km·4.2km·6.3km 거리 배지, 전체 지도 목록과 `day 1.3 장소 1` annotation 제목을 확인했다. day 전체 선택의 8개 이동·삭제 액션도 표시됐다.
- 가장자리 뒤로가기는 Maestro에서 빈 EmptyFlow 생성 → 이탈 → 재진입 후 두 기본 섹션만 남았다. 처음에는 부분 접근성 이름 selector가 실패했고 전체 이름 정규식으로 수정해 통과했다.
- 2026-09-16 재검증: 기본 스크롤 정책의 200ms 드래그는 순서 불변이며 취소 로그가 관찰됐다. 화면 전체 터치 취소 방지는 드래그만 성공하고 본문 스크롤이 실패해 기각했다. 최종 핸들 구현으로 `maestro test /tmp/itinova-p03-final-flow.yaml`은 100ms 드래그 → 장소 1이 3번 오른쪽에 표시 → 본문 1초 스와이프 → day 2 표시를 모두 통과했다. DB는 장소 2·3·1 순서와 1000·2000·3000 정렬값이었고 본문 스크롤 후에도 불변이었다. 앱 재실행 후 CUA 화면에도 동일 순서가 표시됐다.
- Expo 57.0.23의 최종 네이티브 빌드·새 번들에서도 동일 Maestro 흐름이 종료 코드 0으로 통과했고 DB의 2·3·1 순서가 유지됐다.
- 2026-09-16 사용자가 시뮬레이터에서 ≡ 핸들을 직접 끌어 순서가 바뀐다고 확인했다. CUA·Orca의 마우스 입력은 순서 변경을 확인하지 못했으므로 성공 증거에 포함하지 않았으며, 직접 조작의 성공은 사용자 확인을 근거로 기록한다.
- 검증 여행 `p03-check`, `p03-drag`, `p03-fix`와 해당 검증용 장소만 정리했다. 마지막 DB 개수는 시작 전과 같은 여행 2건·일정 항목 4개·체크리스트 12개였다. 기존 여행의 데이터는 유지했다.
- `npx react-doctor@latest --verbose --scope changed`: 최종 5파일, 82/100, 오류 0·경고 7. 체크리스트의 inline callback·renderItem, 입력 재설정을 위한 footer key, 비가상 일차 목록과 배열 검색 권고를 남겼다. 전체 진단은 HTML 와이어프레임을 포함해 215건이었으며 별도 대규모 정리는 하지 않았다.

## 플랜이 틀렸던 곳

- Doctor의 권장 버전 차이만으로 RNGH 3 호환 불가를 판단할 수 없다. 초기 중단은 이 차이를 실제 비호환으로 취급한 실행 오류였다. 공식 RN 호환 표와 Expo의 Reanimated·Worklets 조합을 함께 확인해야 한다.
- VoiceOver를 Simulator의 Inspector에서 켠다는 검증 지시는 실행 불가능했다. 실제 조작 검증에는 실기기가 필요하다.
- 핸들 전용이라는 사실만으로 부모 ScrollView와의 터치 충돌이 없어지지 않았다. 느린 자동 스와이프 성공만으로 직접 드래그 성공을 판단한 것이 초기 검증의 오류였다.
- 되돌리기 범위는 플랜의 package 3줄·edit 화면뿐이 아니다. RootView, Worklets 명시와 Expo 검사 제외도 함께 되돌려야 한다.

## 남은 위험 / 상향 신호

- 실기기 VoiceOver의 위/아래 조작, 모션 감소와 장시간 드래그의 사용자 확인이 남아 있다. 직접 드래그 실패가 다시 보고되면 완료 판단을 다시 열고 실제 터치 취소 이벤트를 확인한다.
- 일차 목록은 모든 항목을 렌더한다. 매우 긴 일정의 성능은 실측하지 않았다. 해당 규모에서 지연이 관찰되면 가상화를 재론한다.
- 기본 카테고리는 이름 변경·삭제 후 빈 상태로 다시 나타나는 정책이다. 이를 숨겨야 한다는 사용자 피드백이 있으면 저장 모델 변경을 재론한다.
