# Cloud Run `itinova-api` — 구독 검증 서버 (Apple · Firestore · 세션 · rate limit)

이 저장소 `server/`에 GCP Cloud Run 서비스 `itinova-api`를 만들고, 앱이 보낸 스토어 거래 증명을 서버에서 검증해
서명된 구독 세션을 발급하는 부분까지 완성한다. **AI 엔드포인트는 이 플랜에 없다**(`07-ai-server.md`). iOS(Apple)를 먼저 끝내고,
Android(Google Play)는 D절로 분리해 Android 출시 결정 뒤에 실행한다. 설계 정본은 `docs/design.md` §4.2, §5.0, §5.1이다.

## 왜 필요한가

- 저장소에 `server/` 디렉터리도, OpenAI·Firestore·스토어 관련 코드도 없다(2026-09-10 HEAD `c10aca7` 기준 grep 0건). 설계 §5.0·§5.1과
  §6 "배포 차단 항목"이 요구하는 것이 전부 미착수다.
- 로그인이 없는 앱이므로(§1.3) 구독 권한의 유일한 근거는 스토어가 서명한 거래 증명이고, 그것을 검증할 수 있는 곳은 서버뿐이다.
- OpenAI API 키를 앱에 넣을 수 없다. 서버가 없으면 AI 기능(플랜 07~09)을 시작할 수 없다.

## 범위 밖

- `/v1/itineraries/generate`, `/v1/chat` — 플랜 07.
- S23 화면, `expo-iap` — `06-subscription-client.md`.
- Firebase App Check(기기 증명). 2026-09-10 사용자 결정으로 제외했다. 근거와 재도입 조건은 "기각한 대안" 참고.
- 사용자 계정·이메일 수집·플랫폼 간 구독 병합(§4.2 "하지 않는다").
- CI/CD 파이프라인. 초기 배포는 `gcloud run deploy --source`로 수동.

## 실행 조건

- GCP 프로젝트, 결제 계정, Firestore 데이터베이스(Native 모드)가 있어야 한다. Firebase 프로젝트는 필요 없다. 없으면 만들고 나서 시작한다.
- App Store Connect에 앱과 자동 갱신 구독 상품 4개(한 구독 그룹, 플랜 07 "요금제와 한도"), App Store Server API 키(In-App Purchase 키)가 있어야 B절을 실행할 수 있다.
  없으면 A절(골격·Firestore·세션)까지만 하고 기다린다.
- **실행하면 안 되는 조건**: Apple 서버 API 키·OpenAI 키·세션 서명 키 중 하나라도 저장소·`app.config.ts`·`EXPO_PUBLIC_*`에 들어가야 하는
  설계가 나오면 멈춘다. 모두 Secret Manager에만 둔다.
- 플랜 06(클라이언트)과 병행할 수 있지만 계약(요청·응답 타입)은 이 플랜의 A-3이 먼저 고정한다.

## 검증된 외부 사실 (2026-09-10 조사, 플랜 항목의 근거)

| 사실 | 출처 |
| --- | --- |
| Apple `verifyReceipt`와 영수증은 deprecated. 대체는 App Store Server API `Get Transaction Info`(`/inApps/v1/transactions/{transactionId}`), `Get All Subscription Statuses`(`/inApps/v1/subscriptions/{anyTransactionId}`) | developer.apple.com/documentation/appstorereceipts, /appstoreserverapi |
| 베이스 URL: production `https://api.storekit.apple.com/`, sandbox `https://api.storekit-sandbox.apple.com/` | 위 Apple 문서 |
| Server Notifications V2 `signedPayload`는 JWS, 헤더 `x5c` 체인을 Apple Root CA - G3로 검증. 공식 `@apple/app-store-server-library` 3.1.0(2026-05-06)이 `SignedDataVerifier`와 `AppStoreServerAPIClient`를 제공 | github.com/apple/app-store-server-library-node |
| Xcode StoreKit Testing 거래는 Xcode가 서명해 서버 API로 검증할 수 없다. 서버 연동 검증은 Sandbox Apple Account를 쓰는 기기에서만 | developer.apple.com/documentation/storekit/testing-at-all-stages-of-development-with-xcode-and-the-sandbox |
| V2 알림 타입: SUBSCRIBED, DID_RENEW, DID_CHANGE_RENEWAL_STATUS, EXPIRED, DID_FAIL_TO_RENEW(GRACE_PERIOD), GRACE_PERIOD_EXPIRED, REFUND, REFUND_REVERSED, REVOKE 등 | developer.apple.com/documentation/appstoreservernotifications/notificationtype |
| Google `purchases.subscriptionsv2.get`의 `subscriptionState`: PENDING, ACTIVE, PAUSED, IN_GRACE_PERIOD, ON_HOLD, CANCELED(만료 전), EXPIRED, PENDING_PURCHASE_CANCELED. v1 `purchases.subscriptions.get`은 deprecated지만 `acknowledge`는 v1이 현행. 최초 구매는 3일 내 acknowledge 필수, 갱신은 불필요 | developers.google.com/android-publisher/api-ref/rest/v3/purchases.subscriptionsv2, developer.android.com/google/play/billing/integrate |
| RTDN `notificationType`: 1 RECOVERED, 2 RENEWED, 3 CANCELED, 4 PURCHASED, 5 ON_HOLD, 6 IN_GRACE_PERIOD, 7 RESTARTED, 10 PAUSED, 12 REVOKED, 13 EXPIRED 등 | developer.android.com/google/play/billing/rtdn-reference |
| Cloud Run 기본값: 요청 제한 300초(최대 3600), **최대 인스턴스 기본 100**, 최소 0. `asia-northeast3`(서울) 제공. Secret Manager를 env/volume으로 네이티브 마운트 | docs.cloud.google.com/run/docs/configuring/* |
| GCP 예산은 알림만 한다. 지출을 자동으로 막지 않는다 | docs.cloud.google.com/billing/docs/how-to/budgets |

## 절차

### A. 골격 · Firestore · 세션 · rate limit

1. `server/`에 Node 22 + TypeScript 단일 서비스. 의존성은 `@google-cloud/firestore`, `@apple/app-store-server-library`,
   `zod`(요청 스키마), 그리고 HTTP는 Node 내장 `http` 또는 최소 라우터 하나. 근거: 엔드포인트가 6개다. 프레임워크가 필요한 규모가 아니다.
2. `server/src/contracts.ts`에 `POST /v1/subscriptions/verify`, `GET /v1/subscriptions/status` 요청·응답 zod 스키마와 표준 오류 형태
   `{code, message, retryAfter?}`를 정의하고, 같은 파일을 앱이 타입으로 import할 수 있게 `lib/api/contracts.ts`로 복사 없이 참조(tsconfig `paths`)한다.
   근거: 계약을 한 곳에 두면 06·07 플랜이 여기만 본다. §5.0의 엔드포인트 이름을 그대로 쓴다.
3. 오류 코드를 고정한다: `SESSION_INVALID`(401), `ENTITLEMENT_INACTIVE`(403), `STORE_VERIFY_FAILED`(400),
   `PRODUCT_NOT_ALLOWED`(400), `RATE_LIMITED`(429), `UPSTREAM_TIMEOUT`(504). 앱은 코드로 분기하고 message는 표시하지 않는다.
4. `verify` rate limit: 클라이언트 IP 기준 분당 10회·일 100회를 넘으면 `RATE_LIMITED` 429. 카운터는 인스턴스 메모리(`Map`)에 두고 인스턴스가 여러 개면
   각자 세는 것을 허용한다 — 최대 인스턴스 3이므로 실효 한도는 최대 3배다. 근거: `verify`는 Apple 서버 API를 호출하므로 무제한이면 남용이 비용이 된다.
   `/store/*`(스토어 알림 수신)에는 적용하지 않는다. `// ponytail: 메모리 카운터. 분산 카운터가 필요해지면 Firestore 문서로`.
5. Firestore 컬렉션 `entitlements`, `usage`, `processed_events`를 §4.2 표대로 만든다. 문서 ID는 권한 ID의 SHA-256. 스토어 재조회에 필요한
   식별자(`originalTransactionId` / `purchaseToken`)는 Cloud KMS로 암호화해 저장한다. 거래 JWS·영수증 원문·여행 데이터는 저장하지 않는다.
6. 구독 세션: HMAC-SHA256(Node `crypto`)으로 서명한 `{entitlementHash, exp}` 토큰, 최대 15분(§5.1-3). 서명 키는 Secret Manager.
   근거: JWT 라이브러리 없이 stdlib로 충분하다. 외부 검증자가 없다.
7. Cloud Run 배포 설정: 리전 `asia-northeast3`, `--min-instances 0`, `--max-instances 3`, `--timeout 60`, `--concurrency 20`,
   `--ingress all`(앱이 공개 URL로 호출), 런타임 서비스 계정 전용 생성 + Secret별 `secretAccessor`만 부여.
   근거: 기본 최대 인스턴스가 100이므로 명시하지 않으면 예산 통제가 없다. 예산 알림은 자동 차단이 아니므로 최대 인스턴스가 실제 상한이다.
8. GCP 예산을 만들고 50/90/100% 알림을 건다. 자동 차단(billing 해제 함수)은 넣지 않는다 — 최대 인스턴스 3과 플랜 07의 사용량 제한이 상한이다.

### B. Apple 검증 · 알림

1. `POST /v1/subscriptions/verify` (platform `ios`): 앱이 보낸 서명 거래 JWS를 `SignedDataVerifier`로 검증(bundleId, environment 일치)하고
   `originalTransactionId`로 `Get All Subscription Statuses`를 호출해 현재 상태를 읽는다. 상품 ID가 서버 설정 allowlist에 없으면 `PRODUCT_NOT_ALLOWED`.
   근거: 로컬 JWS 검증만으로는 환불·철회를 알 수 없다. 두 단계가 필요하다.
2. 상태 정규화: Apple 응답의 `status`와 `renewalInfo`를 §5.1-5의 `active | grace | canceled_until_expiry | pending | on_hold | paused | expired | revoked | refunded`로
   매핑하는 표를 `server/src/apple/status.ts`에 두고 **Apple 문서의 `status` 값 정의를 실행 시점에 다시 확인해 표를 채운다**(이 플랜은 값 목록을 단정하지 않는다).
   허용은 `active`, `grace`, `canceled_until_expiry`만.
3. `POST /store/apple/notifications`: `signedPayload` 검증 → `notificationUUID`로 `processed_events` 멱등 확인 → 타입별로 `entitlements` 갱신.
   REFUND·REVOKE는 즉시 거부 상태로, EXPIRED·GRACE_PERIOD_EXPIRED는 만료로, DID_RENEW·SUBSCRIBED는 만료 시각 갱신, DID_CHANGE_RENEWAL_PREF는 `product_id`(요금제) 갱신. 순서가 뒤바뀐 알림은
   `signedDate`가 저장된 `updated_at`보다 오래되면 무시한다.
4. `GET /v1/subscriptions/status`: 세션이 유효하면 Firestore 권한을 읽어 반환하고 세션을 재발급한다. 세션이 없거나 만료면 `SESSION_INVALID` →
   앱이 `verify`를 다시 부른다(§5.1-3).
5. Sandbox와 production은 환경 변수로 분리한 두 Cloud Run 서비스(`itinova-api-sandbox`, `itinova-api`)로 배포한다. 한 서비스에서 두 환경을 동시에 받지 않는다.
   근거: 심사용 sandbox 거래와 실제 거래가 같은 `entitlements`에 섞이는 사고를 구조로 막는다.

### C. 검사 코드 (`server/test/`)

- Node 내장 `node:test`로 실행한다. 프레임워크 없음.
- 상태 매핑표 계약 검사: 허용 3종·거부 6종.
- Apple fixture: 서명 실패, bundleId 불일치, sandbox/production 혼용, 같은 `notificationUUID` 2회, 오래된 `signedDate`.
- rate limit 초과·세션 만료·allowlist 외 상품에서 스토어 API 클라이언트가 호출되지 않았음을 mock으로 확인.
- 빌드 산출물과 앱 번들(`npx expo export`)에 `sk-`(OpenAI 키 접두)·Apple 키 ID 문자열이 없는지 `grep`하는 스크립트.

### D. Google Play (Android 출시 결정 후)

1. `verify` (platform `android`): `purchaseToken`을 `purchases.subscriptionsv2.get`으로 조회해 `subscriptionState`를 정규화한다.
   `SUBSCRIPTION_STATE_ACTIVE`·`IN_GRACE_PERIOD`·`CANCELED`(만료 전)만 허용. `acknowledgementState`가 PENDING이고 최초 구매면 v1 `acknowledge`를 서버가 호출한다.
2. `linkedPurchaseToken`이 있으면 이전 토큰의 권한을 `replaced`로 무효화한다(§4.2).
3. `POST /store/google/rtdn`: Pub/Sub push 구독, OIDC 토큰 검증. `messageId`로 멱등. 타입 3·5·10·12·13은 거부 방향, 2·4·7은 허용 방향으로 갱신.
4. Play Console 서비스 계정 자격 증명은 Secret Manager. 앱의 `applicationId`와 상품 ID allowlist를 서버 설정에 추가.

### E. 설계 문서

- `docs/design.md` §5.0·§5.1·§6 "앱·요청 검증" 행에서 Firebase App Check 문장을 제거하고 "`verify` IP rate limit + 세션 + 서버 권한 조회"로 바꾼다. §5.0에 A-3 오류 코드 표와 A-7 배포값(`--max-instances 3`, `--timeout 60`, `--concurrency 20`)을 확정값으로 기록한다.
- §6 표의 Apple 링크 옆에 sandbox 베이스 URL을 적고, "Xcode StoreKit Testing은 서버 검증 불가" 한 줄을 추가한다.

## 검증

```
cd server && npm test && npm run build
grep -rE "sk-[A-Za-z0-9_-]{20,}|api.storekit" dist/ ; npx expo export && grep -rE "sk-[A-Za-z0-9_-]{20,}" dist/   # 둘 다 0건
gcloud run services describe itinova-api-sandbox --region asia-northeast3 --format='value(spec.template.metadata.annotations)'  # maxScale=3, timeout 확인
curl -s -X POST https://<sandbox-url>/v1/subscriptions/verify -d '{}'            # 400 STORE_VERIFY_FAILED (스키마 불일치)
for i in $(seq 12); do curl -s -o /dev/null -w '%{http_code}\n' -X POST https://<sandbox-url>/v1/subscriptions/verify -d '{}'; done   # 11번째부터 429
```

Sandbox Apple Account를 넣은 실기기 development build(플랜 06 이후):

1. sandbox 구독 → `verify` 200, Firestore `entitlements` 1건, 세션 발급.
2. App Store Connect 알림 테스트(`Request a Test Notification`) → `processed_events`에 1건, 두 번 보내도 1건.
3. sandbox에서 구독 취소 → 만료 전 `status`가 `canceled_until_expiry`로 허용, 만료 후(sandbox 가속 갱신) `expired`로 거부.
4. sandbox 환불 요청 → REFUND 알림 후 다음 `status`가 거부.

## 되돌리는 법 / 상향 신호

- 서비스 삭제(`gcloud run services delete`)로 완전히 되돌릴 수 있다. 앱 데이터는 로컬이라 영향 없다.
- 상향 신호: `verify` 429 비율이 전체의 5%를 넘거나 Apple 서버 API 호출 수가 하루 활성 사용자의 5배를 넘으면 남용이다. 이때 App Check 재도입을 재론한다(기각한 대안).
- 예산 90% 알림이 오면 `--max-instances`를 1로 내리고 원인을 본다.

## 기각한 대안

- **RevenueCat** — 서버 검증·S2S 알림·권한 저장을 대행하고 Expo를 지원한다(10.9.0). 기각 이유: 사용자 식별자 없이도 동작하지만 제3자에 거래 데이터가 가고,
  AI 사용량 제한(플랜 07)은 어차피 자체 서버가 필요하다. **자체 서버 유지 비용이 월 1인일을 넘으면 재론한다.**
- **`verifyReceipt`** — deprecated. 재론 없음.
- **Firebase App Check(App Attest/Play Integrity) 도입** — 설계 §5.0의 원안. 2026-09-10 사용자 결정으로 제외. 이유: 세션은 스토어 거래 검증 뒤에만 발급되어
  무권한 AI 호출은 이미 막히고, 구독자의 스크립트 사용은 사용량 한도가 상한이며, 영수증 공유는 App Check로도 못 막는다. 반면 앱에 Firebase 네이티브 SDK 2개·
  `GoogleService-Info.plist`·config plugin과 시뮬레이터용 debug provider 분기가 들어온다. **재도입 조건**: 위 상향 신호가 관측될 때. 미들웨어 한 겹이라 언제 붙여도 비용이 같다.
- **JWT 라이브러리로 세션** — 검증자가 자기 자신뿐이다. HMAC 한 줄로 충분하다.
- **Firestore 대신 Cloud SQL** — 문서 3종, 사용자당 행 1개. 관계형이 필요 없다.

## 실패 모드

시뮬레이터의 StoreKit Configuration 거래로 "서버 검증이 된다"고 결론내는 것이 이 플랜의 실패 모드다. 그 거래는 Xcode가 서명해 Apple 서버 API가
거부한다. 서버 검증은 Sandbox 계정 실기기에서만 참으로 판정한다.
