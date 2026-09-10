# S23 구독 화면 · 구매 복원 · AI 게이트

앱에 `expo-iap`를 붙이고 S23(`/subscription`) 화면, 구매·복원 → 서버 검증 → 세션 보관 흐름, S03·S10의
AI 진입 게이트를 만든다. 서버는 `05-subscription-server.md`가 sandbox 서비스로 배포된 뒤여야 한다. 개발 빌드(development build)가 필수다.

## 왜 필요한가

- `app/subscription.tsx`가 없다. 설계 §2.8 라우트 트리에 있고 §3.3 흐름에서 AI 진입의 관문이다.
- `app/create/index.tsx:31`은 구독 확인 없이 `router.push('/ai/ask')`하고, `app/trip/[id]/(tabs)/itinerary.tsx:106` `AI에게 묻기` 칩도 게이트가 없다.
- `package.json`에 IAP 의존성이 없다.

## 범위 밖

- 서버 측 검증 로직·Firestore(플랜 05). AI 화면(플랜 08·09).
- Android 결제 UI. `expo-iap`는 양 플랫폼을 지원하지만 Play 상품·서버 D절이 없으므로 Android에서는 S23이 "iOS에서 구독할 수 있어요" 안내만 보인다.
- 가격 A/B, 프로모션 오퍼, 가족 공유.

## 실행 조건

- 플랜 05 A·B절이 sandbox 서비스에 배포되어 `verify`/`status`가 응답한다.
- App Store Connect에 같은 구독 그룹으로 상품 4개(라이트·플러스 월·플러스 연·프로)가 있고, 상품 ID가 서버 allowlist와 같다. 그룹 내 등급 순서는 프로 > 플러스 > 라이트.
- **Expo Go에서는 실행하지 않는다.** `npx expo run:ios`(또는 EAS development build)로만 검증한다.

## 검증된 외부 사실 (2026-09-10 조사)

| 사실 | 출처 |
| --- | --- |
| Expo 공식 IAP 가이드가 권장하는 라이브러리는 `expo-iap`와 RevenueCat 둘. Expo Go 불가, 개발 빌드 필요 | docs.expo.dev/guides/in-app-purchases (2026-05-20) |
| `expo-iap` 5.5.1(2026-09-06). 개발은 `hyodotdev/openiap` 모노레포로 이동. **Expo SDK 57 / RN 0.86이 검증 기준선**. iOS 16.4+. iOS StoreKit 2 JWS는 `purchase.purchaseToken` 필드에 담긴다(통합 토큰). config plugin 제공 | openiap.dev/docs/setup/expo, unpkg expo-iap@5.5.1/build/types.d.ts |
| `react-native-iap`는 v15.0.0부터 Expo 지원 종료 — "use expo-iap instead" | github.com/hyochan/react-native-iap README |
| Xcode StoreKit Configuration 거래는 서버 API로 검증 불가 → 결제 UI·로컬 상태 전환 검사에만 사용 | 플랜 05 표 참고 |

## 결정

| 항목 | 결정 | 근거 |
| --- | --- | --- |
| IAP 라이브러리 | `expo-iap` | Expo 공식 권장, SDK 57 검증 기준선. `react-native-iap`는 Expo 지원 종료 |
| 세션 보관 | `expo-secure-store`에 세션 토큰·만료 시각 | 새 의존성 1개. `AsyncStorage`보다 낫고 SQLite `app_settings`에 토큰을 두면 백업(플랜 04)에 섞일 위험이 있다 |
| 권한 상태 캐시 | 메모리 + secure-store의 세션만. 별도 "구독 중" 불리언을 저장하지 않는다 | §5.1 "클라이언트 불리언은 권한 근거가 아니다". 오프라인이면 잠금 화면에 재시도·직접 만들기를 보인다 |
| 게이트 위치 | `useEntitlement()` 훅 하나. S03 AI 행, S10 `AI에게 묻기`, S09 캐러셀(플랜 10)이 같은 훅을 쓴다 | 게이트 로직이 한 곳 |
| 가격 표시 | 스토어 `getProducts` 결과의 `localizedPrice`·기간만. 하드코딩 금지 | 완료 조건 |
| 요금제 배치 | 라이트 · **플러스(가장 인기, 기본 선택, 연간 토글)** · 프로 3열. 플러스 카드만 강조 색과 배지. 한도 수치는 서버 `status.limits`에서 | 플랜 07 "요금제와 한도"의 미끼 구조. 기본 선택이 주력 상품이어야 미끼가 작동한다 |

## 절차

1. `npx expo install expo-iap expo-secure-store`. `app.config.ts`에 `expo-iap` config plugin을 추가한다. `cd ios && pod install`. 근거: 검증된 사실 표.
   Firebase는 붙이지 않는다(플랜 05 기각한 대안).
2. 서버 URL은 `app.config.ts` `extra.apiUrl`(공개값, §6)에 둔다. sandbox·production 서비스 URL은 빌드 프로파일로 나눈다.
3. `lib/api/client.ts`: 플랜 05 A-2의 `contracts.ts` 타입을 import해 `verify`·`status` 호출을 감싼다. 12초 timeout(`lib/useTravelData.ts:13`·`lib/travelTools.ts:65` `fetchTravelJson`의 기존 AbortSignal 패턴과 동일),
   오류 코드 분기. 세션 토큰은 `expo-secure-store`에 저장·복원.
4. `lib/useEntitlement.ts`: 상태 `unknown | active | inactive | offline`. 앱 시작과 AI 진입 시 세션이 있으면 `status`, 없으면 `inactive`. `SESSION_INVALID`면
   `expo-iap`의 현재 구독 거래(`getAvailablePurchases`)를 읽어 `verify` 재시도 → 없으면 `inactive`. 네트워크 실패는 `offline`이며 절대 `active`로 승격하지 않는다.
5. `app/subscription.tsx`(S23)를 `app/_layout.tsx:56-66` 루트 스택에 `presentation: 'modal'`로 등록한다. 내용은 설계 §2.3 S23 행 그대로:
   요금제 3열(플랜 07 표, 플러스 기본 선택·"가장 인기" 배지·월/연 토글은 플러스에만), 각 열의 생성·채팅 한도(서버 `status.limits`에서 받아 표시 — 하드코딩 금지), 스토어 가격·주기, 자동 갱신·해지 안내,
   이용약관·개인정보 링크, `구독하기`, `구매 복원`, 닫기. 진입 파라미터 `returnTo`로 검증 성공 후 S07 또는 S19로 `router.replace`.
6. `구독하기`: `requestPurchase` → 거래 수신 → `purchaseToken`(iOS JWS)을 `verify`로 전송 → 200이면 `finishTransaction` → 세션 저장 → `returnTo`로 이동.
   `verify` 실패 시 `finishTransaction`을 호출하지 않고(재시도 가능하게) 오류 코드별 안내를 보인다. 근거: 서버 검증이 끝난 뒤에만 이동(원 플랜 §6.2).
7. `구매 복원`: `getAvailablePurchases` → 가장 최근 구독 거래의 토큰을 `verify` → 성공 시 세션 저장. 결과가 없으면 "이 Apple 계정에 구독이 없어요.
   iOS와 Android 구독은 서로 이어지지 않아요"를 표시한다(§4.2, 원 플랜 §6.2).
8. 구독 관리·해지는 `Linking.openURL('https://apps.apple.com/account/subscriptions')`로 시스템 화면에 연결한다. 앱 안에 해지 UI를 만들지 않는다.
9. 게이트 연결: `app/create/index.tsx:31`을 `useEntitlement()` 결과로 분기 — `active`면 `/ai/ask`, `inactive`면 `/subscription?returnTo=/ai/ask`,
   `offline`이면 "연결을 확인해 주세요 · 다시 시도 · 직접 일정 만들기" 인라인 안내. `itinerary.tsx:106` 칩도 같은 방식으로 `/trip/[id]/chat`을 보호한다.
10. `app/settings.tsx` "앱 정보" 위에 "AI 구독" 행 — 상태(`active`면 갱신일, 아니면 `구독하기`), `구매 복원`, `구독 관리`(8번 링크). 설계 §2.1 S02.
11. `docs/design.md` §2.3 S23 행에 `returnTo` 파라미터와 오프라인 정책, §6 인앱 구독 행에 `expo-iap 5.x` 결정과 "react-native-iap는 Expo 지원 종료"를 기록한다.

## 검증

```
npx tsc --noEmit && npm run check
npx expo export && grep -rnE "sk-[A-Za-z0-9_-]{20,}|storekit" dist/   # 0건
```

시뮬레이터 + Xcode StoreKit Configuration(`.storekit` 파일에 같은 상품 ID) — 결제 UI와 로컬 전환만:

1. S03 → AI 행 → S23 모달 → 가격·주기가 `.storekit` 설정값과 일치 → `구독하기` → 시스템 결제 시트. 서버 `verify`는 이 거래를 거부해야 한다(400 `STORE_VERIFY_FAILED`) — **거부되는 것이 정상**이며 화면이 막히지 않고 재시도·닫기가 가능한지 본다.
2. 기내 모드 → S03 AI 행 → `offline` 안내 → 직접 일정 만들기로 이탈 가능.

Sandbox Apple Account 실기기 development build — 종단 검증:

3. sandbox 구독 → `verify` 200 → S07 진입(플랜 08 이전이면 S07 골격) → 앱 재실행 후에도 `status`로 `active` 유지.
4. 앱 삭제·재설치 → `구매 복원` → `active`.
5. sandbox 구독 취소 → 만료 전 접근 가능, 만료 후 다음 진입에 S23으로 이동.
6. App Store Connect에서 환불 → REFUND 알림 후 다음 진입 차단.
7. S23 표시 한도 문구가 서버 `status` 응답의 한도와 같다(하드코딩 없음). 3열의 가격이 `.storekit`/App Store Connect 값과 같다.
8. 플러스 → 프로 업그레이드 후 `status.plan`이 `pro`, 사용량은 이월. 프로 → 라이트 다운그레이드는 다음 갱신일에 적용된다.

## 되돌리는 법 / 상향 신호

- 게이트 연결(9번)만 되돌리면 AI 진입이 예전처럼 열린다. IAP 의존성은 남아도 무해하다.
- 상향 신호: sandbox에서 `verify` 성공 후 `finishTransaction` 누락으로 같은 거래가 앱 재시작마다 다시 도착하면 6번의 순서가 틀린 것이다.

## 기각한 대안

- **`react-native-iap`** — v15부터 Expo 미지원. 재론 없음.
- **RevenueCat SDK** — 플랜 05의 기각 조건과 같다. 자체 서버를 접으면 함께 재론.
- **구독 상태를 SQLite `app_settings`에 캐시** — 백업 JSON에 섞이고 서버 근거 없이 `active`가 되살아난다.
- **S23을 온보딩에 배치** — §2.0이 기각했다(첫 실행부터 결제 요구 안 함).

## 실패 모드

시뮬레이터 StoreKit Configuration에서 결제 시트가 뜨는 것을 보고 "구독 흐름 완료"로 기록하는 것이 이 플랜의 실패 모드다. 서버 검증 성공은
Sandbox 실기기 검증 3~7번으로만 판정한다.
