# `itinova-api` AI 엔드포인트 — 일정 생성 · 채팅 · 사용량 제한

플랜 05로 만든 `server/`에 `POST /v1/itineraries/generate`와 `POST /v1/chat`을 추가한다. 모델 호출(OpenAI API)은 이 두 엔드포인트에서만 일어나고,
호출 전에 구독 세션·Firestore 권한·사용량 한도를 모두 확인한다. 앱 화면은 플랜 08(S07/S08)·09(S19)가 만든다.
`05-subscription-server.md` A·B절이 sandbox에 배포된 뒤 실행한다.

## 왜 필요한가

- 설계 §5.2·§5.3의 AI 기능은 서버 없이는 시작할 수 없고, 서버의 구독 검증(플랜 05)만으로는 아직 아무 가치를 만들지 않는다.
- API 키를 앱에 둘 수 없으므로(§5.0) 앱에서 모델을 직접 호출하는 선택지는 없다. 서버가 유일한 호출 지점이다.

## 범위 밖

- S07·S08·S19 화면과 Apple MapKit 장소 해석(앱 쪽, 플랜 08·09). 서버는 장소명과 `search_query`만 돌려준다(§5.2 "LLM 좌표를 받지 않는다").
- 대화 요약 압축(§5.3 "고정 윈도우"). 스트리밍 응답 — 첫 버전은 비스트리밍.
- 앱 내 번역 API(§6 번역 행) — 요청이 생기면 별도 플랜.

## 실행 조건

- 플랜 05의 세션·권한 미들웨어가 동작한다(`verify` → 세션 → `status` 200).
- OpenAI API 키(종량 과금 API 계정. ChatGPT·Codex 구독은 서버에서 쓸 수 없다)가 Secret Manager에 있고 Cloud Run 서비스 계정만 읽는다.
- **모델 ID는 배포 직전에 다시 확인한다.** 아래 표의 값은 2026-09-10 기준이다.

## 검증된 외부 사실 (2026-09-10 조사)

| 사실 | 출처 |
| --- | --- |
| `gpt-5.6-luna`: 입력 $0.20/M, 캐시 입력 $0.02/M, 출력 $1.20/M. 컨텍스트 1,050,000, 최대 출력 128,000. `structured_outputs`·`function_calling` 지원. 272K 초과 프롬프트는 입력 2배·출력 1.5배 | developers.openai.com/api/docs/models/gpt-5.6-luna |
| 2026-07-30에 Luna 가격 80% 인하(출시가 $1/$6). GPT-5.6 계열은 Sol(최상위)·Terra(중간)·Luna(최저가) | openai.com/index/advancing-the-price-performance-frontier-with-gpt-5-6 |
| Structured outputs: Responses API `text.format = {type:'json_schema', strict:true, schema}`. Node SDK `zodTextFormat`(`openai/helpers/zod`) + `client.responses.parse()` → `output_parsed`. 거부 시 스키마 대신 `refusal` 항목이 온다 | developers.openai.com/api/docs/guides/structured-outputs |
| 프롬프트 캐시: 기본 활성, GPT-5.6 이후 최소 **1,024** 토큰, 캐시 읽기 0.1×, 최근 사용 후 30분 유지 | developers.openai.com/api/docs/guides/prompt-caching |
| `openai` Node SDK 7.13.0, zod peer `^3.25 \|\| ^4.0` | registry.npmjs.org/openai |
| 비교 대상 Anthropic `claude-sonnet-5`: $2/$10 (이전 조사, 기각 대안에만 사용) | platform.claude.com/docs/en/about-claude/models/overview |

## 결정

| 항목 | 결정 | 근거 |
| --- | --- | --- |
| 모델 | OpenAI `gpt-5.6-luna`. 환경 변수 `MODEL_ID`로 고정 | 사용자 결정(2026-09-10). Sonnet 5 대비 입력 10배·출력 8배 저렴. 설계 §5 "`claude-sonnet-5`"는 이 결정으로 갱신 |
| 채택 조건 | 절차 0의 **장소 해석률 비교**를 통과해야 한다. Luna의 해석률이 Sonnet 5보다 15%p 이상 낮으면 `MODEL_ID`를 Terra급으로 올린다 | nano급 모델은 실존 장소명 정확도가 낮을 수 있다(**추정**). 원가가 아니라 해석률이 채택 기준 |
| 구조화 출력 | Responses API `text.format` json_schema(`strict:true`) + `zodTextFormat` + `responses.parse`. 툴 강제 방식은 쓰지 않는다 | SDK가 파싱까지 해준다. 설계 §5.2 "tool use로 강제"는 이 결정으로 갱신. `refusal` 항목은 `AI_INVALID_OUTPUT`으로 처리 |
| 모델 timeout | 45초(`--timeout 60` 안에서 응답 조립 여유) | Cloud Run 요청 제한과 정합 |
| 사용량 한도 | 요금제 3단계별로 다르다. 아래 "요금제와 한도" 절의 표를 서버 상수 `PLAN_LIMITS`로 둔다. 권한 단위, 구독 갱신일마다 초기화 | 원가 계산은 아래 절. S23·`status` 응답이 같은 상수를 쓴다 |
| 요청 크기 | body 32KB, 채팅 히스토리 8턴, 일정 컨텍스트 일차 6일×장소 8개 | §5.3 "8턴". 그 이상은 400 |

## 요금제와 한도 (2026-09-10 계산)

구독자만 AI를 쓴다. 상품은 자동 갱신 구독 3단계 + 주력 상품의 연간 옵션 1개, 총 4개 상품 ID를 하나의 구독 그룹에 둔다.
구조는 미끼 효과(decoy pricing)다 — **플러스가 팔려야 하는 상품**이고, 라이트는 "1,000원 더 내면 5배"를 보여주기 위해, 프로는 플러스 가격이 합리적으로
보이게 하기 위해 존재한다. 프로의 회당 단가는 플러스와 같게 두어 "많이 사면 싸진다"는 이유로 프로를 고를 동기를 없앤다.

### 원가 가정 (전부 **추정**, 절차 10에서 실측으로 교체)

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 모델 단가 | Luna 입력 $0.20/M, 출력 $1.20/M, 캐시 없음 | 검증된 사실 표. 시스템 프롬프트가 1,024 토큰 미만이면 캐시가 안 걸리므로 캐시 절감을 원가에 넣지 않는다 |
| 일정 생성 1회 | 입력 1,200 + 출력 1,100 토큰 ≈ $0.0016, 재시도 여유 10% → **약 2.4원** | 시스템 800 + 입력 100 + 3일×4곳×60토큰 출력 |
| 채팅 1회 | 입력 2,300(컨텍스트 600 + 8턴 1,500 + 질문) + 출력 400 ≈ $0.00094 → **약 1.3원** | §5.3 8턴 윈도우 |
| 환율 | 1,400원/USD | 2026-09 근사값. 배포 시 갱신 |
| 스토어 수수료 | 15%(App Store Small Business Program, 연 매출 $1M 미만) | 미가입·첫해 30% 시나리오는 아래 표 괄호값 |
| Cloud Run·Firestore | 사용자당 월 10원 미만 | 최소 인스턴스 0. 원가에 넣지 않는다 |

### 요금제

| 요금제 | 월 가격 | 생성/월 | 채팅/월 | 토큰 상한/월 | 회당 생성 단가 | 100% 소진 시 원가 | 원가율(수수료 15% / 30%) | 역할 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 라이트 | ₩1,900 | 3 | 40 | 150K | 633원 | 59원 | 4% / 4% | 미끼. 플러스보다 1,000원 싸지만 5배 적다 |
| **플러스** | **₩2,900** | **15** | **200** | **750K** | **193원** | 296원 | 12% / 15% | **주력. "가장 인기" 배지, 기본 선택, 유일한 연간 옵션** |
| 플러스 연간 | ₩24,000 (월 2,000원) | 15 | 200 | 750K | 133원 | 296원 | 17% / 21% | 플러스 결제자를 연간으로 묶는다. 31% 할인 |
| 프로 | ₩6,900 | 40 | 600 | 2.2M | 173원 | 876원 | 15% / 18% | 앵커. 단가가 플러스와 거의 같아 "많이 써야만" 의미가 있다 |

- 토큰 상한은 `(생성 횟수 × 2,300 + 채팅 횟수 × 2,700) × 1.3`으로 계산한 **실제 하드 리밋**이다. 횟수 한도는 화면에 보여주는 값이고, 토큰 상한은 프롬프트가
  길어지는 사용자(장소 많은 여행, 긴 질문)를 막는 안전장치다. 둘 중 먼저 닿는 것이 429를 낸다.
- 원가율은 한도를 100% 소진했을 때의 최악값이다. 여행 앱의 월간 실사용은 한도의 20~30%로 **추정**하므로 기대 원가율은 표의 1/3 수준이다.
  Luna 단가에서는 모델 원가가 가격을 정하지 않는다. 하한은 스토어 수수료·환불·결제 실패 비용이 정하며, ₩1,900 아래는 수수료 비중이 커져 의미가 없다.
- 가격은 App Store가 제공하는 가격 포인트 중 가장 가까운 값으로 확정한다. 표시 가격은 항상 스토어 응답을 쓴다(플랜 06 결정).
- 라이트는 팔리지 않아도 된다. 라이트 구매 비율이 20%를 넘으면 라이트 가격을 올리거나 생성 한도를 2회로 내려 미끼 기능을 되살린다.

### 서버 반영

- `PLAN_LIMITS: Record<productId, {generate, chat, tokens}>`를 환경 설정으로 두고, Firestore `entitlements.product_id`로 요금제를 결정한다.
- 업그레이드·다운그레이드(Apple `DID_CHANGE_RENEWAL_PREF`, Google `linkedPurchaseToken`)는 `product_id`를 갱신하고 **사용량은 이월한다**. 초기화 시각은 갱신일 그대로.
- `status` 응답에 `plan`, `limits`, `usage`, `resetAt`을 넣어 S23과 S02가 하드코딩 없이 표시한다.

## 절차

0. **모델 해석률 비교(채택 게이트)**: 같은 입력 20건(국내 10·해외 10, 밀도 혼합)을 `gpt-5.6-luna`와 `claude-sonnet-5`로 각각 생성하고 플랜 08의 `lib/aiResolve.ts`
   해석률(Apple 검색 성공 항목 ÷ 전체 항목)을 기록한다. Luna가 Sonnet보다 15%p 이상 낮으면 결정 표의 채택 조건대로 상위 모델로 올린다. 결과를 이 문서 아래에 표로 남긴다.
1. `server/src/contracts.ts`(플랜 05 A-2)에 두 엔드포인트의 요청·응답 zod 스키마를 추가한다. 입력은 §5.2 `{city, nights 0..5, companions[], styles[], pace}`,
   출력은 §5.2 `{days:[{day_index, items:[{name, category, search_query, reason}]}]}`. 채팅은 `{tripContext, messages[≤8], question}` → `{answer, places:[{name, search_query}]}`.
   `status` 응답에 `limits`와 `usage`를 추가해 S23(플랜 06-5)이 한도를 표시할 수 있게 한다.
2. 인가 미들웨어 순서를 고정한다: 세션 → Firestore 권한(`active|grace|canceled_until_expiry`) → 사용량 한도 → **그 뒤에만** OpenAI 클라이언트 호출.
   한도 초과는 `RATE_LIMITED` 429 + 다음 초기화 시각(§5.1-6). 근거: 완료 조건 "거부 요청에서 모델을 호출하지 않는다"를 코드 순서로 보장한다.
3. `server/src/ai/prompts.ts`: 일정 생성 시스템 프롬프트(밀도 `packed` 4~5, `relaxed` 2~3 개/일, 실존 장소명과 검색어, 좌표·가격·영업시간 단정 금지)와
   채팅 시스템 프롬프트(§5.3 컨텍스트 형식). 캐시는 자동이지만 최소 1,024 토큰이므로 시스템 프롬프트가 그보다 짧으면 캐시가 안 걸린다.
   짧으면 억지로 늘리지 말고 캐시를 포기한다. 캐시가 걸리게 하려면 시스템 프롬프트를 `input` 맨 앞에 고정 배치한다.
4. `generate`: `client.responses.parse` + `zodTextFormat`, `timeout: 45_000`, `maxRetries: 1`. `refusal` 항목 또는 `output_parsed`가 일차 수와 `nights+1` 불일치이면 한 번 재시도 후 `UPSTREAM_TIMEOUT`이 아닌
   `AI_INVALID_OUTPUT`(502) 코드로 반환. 오류 코드를 플랜 05 A-3 표에 추가한다.
5. `chat`: 서버는 히스토리를 저장하지 않는다. 앱이 최근 8턴을 보낸다(§5.3, 저장은 앱 로컬 `chat_messages`). 응답의 장소 후보는 모델이 `places` 필드로 구조화해 돌려주고
   본문 텍스트에서 정규식으로 뽑지 않는다. 근거: 해석 실패 시 일반 텍스트로 두는 규칙(§5.3)을 앱이 결정적으로 적용할 수 있다.
6. 사용량 기록: 응답의 `usage.input_tokens`·`output_tokens`를 Firestore `usage` 문서에 트랜잭션으로 누적한다. 한도 검사와 누적은 같은 문서 트랜잭션.
7. 로그에는 요청 ID, 권한 해시, 토큰 수, 지연만 남긴다. 프롬프트·응답 본문·여행 컨텍스트는 남기지 않는다(§4.2).
8. `server/test/`: 권한 없음·한도 초과·잘못된 스키마 요청에서 OpenAI 클라이언트 mock이 호출되지 않음, 출력 스키마 위반 fixture 처리, 8턴 초과 400.
9. `docs/design.md` §5 "모델은 `claude-sonnet-5`"를 "OpenAI `gpt-5.6-luna`(2026-09-10 결정, 해석률 게이트 통과 조건)"로, §5.0 "Anthropic"을 "OpenAI"로, §5.2 "tool use로 강제" → "structured outputs `text.format`"으로 갱신,
   §5.1-6에 "요금제와 한도" 표를 옮겨 적는다.
10. 배포 후 2주간 `usage`의 실측 토큰 평균으로 "요금제와 한도" 원가표를 갱신하고 한도를 재조정한다. 실측이 추정의 ±30%를 벗어나면 한도부터 다시 자른다.

## 검증

```
cd server && npm test && npm run build
curl -s -X POST https://<sandbox-url>/v1/itineraries/generate -d '{"city":"부산","nights":2,"companions":["friend"],"styles":["food"],"pace":"relaxed"}'
# 세션 없음 → 401 SESSION_INVALID, OpenAI 호출 0 (Cloud Logging에서 model 호출 로그 없음)
```

sandbox 세션으로:

1. `generate` 200, `days.length === 3`, 각 일차 2~3개, 모든 `items[].search_query`가 비어 있지 않다.
2. 같은 세션으로 한도(테스트용 낮은 값)까지 호출 → 429 + `resetAt`.
3. `chat`에 9턴 보내기 → 400. 8턴 → 200, `places`가 배열.
4. Cloud Logging에 프롬프트 본문이 없다.
5. OpenAI 대시보드 사용량 = Firestore `usage` 합계(±재시도 1회).
6. 절차 0의 해석률 표가 이 문서에 기록되어 있고 채택 조건을 만족한다.

## 되돌리는 법 / 상향 신호

- 두 라우트를 제거하면 플랜 05 상태로 돌아간다.
- 상향 신호: 월간 OpenAI 청구액이 순매출의 25%를 넘으면 원가표의 토큰 추정이 틀린 것이다. 토큰 상한을 먼저 내리고 원인을 본다.
- 라이트 선택 비율이 20%를 넘거나 프로 선택 비율이 플러스를 넘으면 미끼 구조가 깨진 것이다. 가격 간격을 다시 벌린다.
- 모델 deprecation 고지가 오면 `MODEL_ID` 환경 변수만 바꿔 재배포한다. 코드 변경 없음. 프롬프트 캐시 최소 길이(1,024)는 모델이 바뀌면 다시 확인한다.

## 기각한 대안

- **Anthropic `claude-sonnet-5`(설계 원안)** — 입력 10배·출력 8배 비싸다. 사용자 결정으로 OpenAI로 전환. Luna가 절차 0의 해석률 게이트를 통과하지 못하고 Terra급도 부족하면 재론.
- **`gpt-5.6-sol`/`terra`를 기본으로** — 원가가 문제가 아니라 해석률이 문제일 때만 올린다. 절차 0 결과가 근거.
- **툴 강제(tool use)로 구조화** — structured outputs가 GA이고 SDK 파싱을 제공한다. 설계 §5.2 문구를 갱신한다.
- **서버에서 Apple MapKit 해석** — 서버에 MapKit이 없다(iOS 전용). 앱이 해석한다(§5.2-1).
- **스트리밍** — S08은 완성된 초안을 한 번에 보여주는 화면이다. 채팅 체감 지연이 문제가 되면 `chat`만 SSE로 재론.
- **서버에 채팅 기록 저장** — 로그인 없음 + §4.2 "여행 데이터를 저장하지 않는다".

## 실패 모드

인가 체크를 라우트 핸들러 안 여기저기에 두어 어느 경로 하나가 모델을 먼저 호출하는 것이 이 플랜의 실패 모드다. 절차 2의 미들웨어 순서와
테스트 8번("mock 호출 0회")이 그것을 잡는다.
