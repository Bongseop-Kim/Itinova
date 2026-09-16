# 클레이 3D 에셋 생성과 화면 반영

`docs/references/travel-3d-clay/`(2026-09-16 조사)를 스타일 기준으로 삼아, GPT Image 2.5로 클레이 3D 에셋 16종을 만들고
빈 상태·온보딩·장소 상세·썸네일·생성 방식 시트·도구 탭·앱 아이콘에 반영한다. 코드 기준 HEAD `e6ef6c6`(2026-09-16).
`파일:라인`이 어긋나면 심볼 이름으로 다시 찾는다. 다른 플랜과 선행 관계가 없다. 언제든 단독으로 실행할 수 있다.

2026-09-16 사용자 결정: 모델은 GPT Image 2.5, 에셋은 최소 4종이 아니라 화면 전반에 넉넉히 쓰는 방향, 생성 해상도는 표시 크기보다 한 단계 위로 잡고 축소해서 쓴다.

## 왜 필요한가

- 디자인 시스템은 "3D 클레이 일러스트가 이 시스템의 브랜드 전압"이라 정의하고(§ 자산 로드맵) **자산이 0개**라고 적어 두었다(§ 미결 항목 2번).
  화면은 자리만 잡아 왔다. `app/index.tsx:76`, `app/onboarding.tsx:51,76`, `app/trip/[id]/(tabs)/saved.tsx:75`, `app/trip/[id]/budget.tsx:71`,
  `app/trip/[id]/add-place.tsx:113`이 전부 160dp 크림 사각형이다.
- 사진이 영구 공백인 자리가 있다. Apple 지도 검색은 사진을 주지 않으므로(`docs/design.md` § 6) S20 `app/place/[placeId].tsx:30`의 사진은 백업으로 들어온
  과거 캐시가 아니면 절대 나오지 않고, S10 `itinerary.tsx:162`·S11 `saved.tsx:84`의 44dp 썸네일 박스는 항상 비어 있다. 카테고리 클레이가 이 자리를 채울 수 있다.
- S12 도구 탭(`tools.tsx`)은 네 섹션이 텍스트뿐이라 앱에서 가장 단조롭다. S03 생성 방식 시트(`app/create/index.tsx`) 두 행도 글자만 있다.
- 앱 아이콘·스플래시가 크림 계약을 깬다. `app.json:17,35`의 배경 `#1554D1`(파랑)과 `assets/icon.png`의 파란 바탕은 디자인 시스템 Do/Don't
  "쿨 그레이·흰 배경 금지, 토큰 밖 hex 금지"에 어긋난다.
- 레퍼런스 README가 남긴 세 가지 미결(무광 vs 광택, 인물 vs 소품, 큰 일러스트 범위)이 정해지지 않아 제작을 시작할 수 없었다. § 절차 1이 정한다.

### 확인한 외부 사실 (2026-09-16)

이미지 모델. OpenAI API 레퍼런스(<https://developers.openai.com/api/reference/resources/images>)와 이미지 프롬프팅 가이드
(<https://developers.openai.com/api/docs/guides/image-prompting>) 원문에서 확인했다.

- `gpt-image-2.5-flare`(속도, GPT Image 2와 비슷한 품질)·`gpt-image-2.5-sunburst`(품질·편집 정밀도). 둘 다 `background: transparent`를 정식 지원하고
  이때 `output_format`은 `png` 또는 `webp`. PNG에는 `output_compression`을 쓰지 않는다.
- `size`는 `WIDTHxHEIGHT` 임의 값. 양변 16의 배수, 한 변 최대 3840, 비율 3:1 이내, **총 픽셀 655,360~8,294,400**. `2560x1440`(3,686,400픽셀)을 넘으면 실험적.
  → 512x512는 최소 픽셀에 못 미쳐 거절된다. 정방형 비실험 상한은 1920x1920(정확히 3,686,400).
- `quality`는 `low`/`medium`/`high`/`xhigh`/`max`/`auto`. 가이드는 "요구 품질을 못 채울 때만 `xhigh`·`max`"라 한다. `n`은 1~10. 응답은 항상 base64.
- 세트 일관성은 프롬프트 접두만으로는 부족하다. 가이드의 방법은 **승인된 첫 장을 스타일 참조로 넘겨 `images.edit`로 나머지를 만들고, 제약을 매번 다시 적는 것**이다
  ("Use the same style from the input image…", "Restate those constraints and inspect each result").
- 투명 에셋 프롬프트 표준 문구: "Fully transparent background… clean alpha edges, and no solid backdrop, scenery, checkerboard, or watermark."
  그려진 체커보드는 투명이 아니다. 디코드한 알파 채널을 직접 확인하라고 한다.

축소. 사용자의 전제("높게 생성해 줄이면 깔끔하다")는 맞다. 슈퍼샘플링이다 — 큰 원본을 평균 내어 줄이면 가장자리 계단과 노이즈가 사라진다
(<https://cloudinary.com/glossary/supersampling>). 단, 이득은 2~3배에서 포화하고 그 위로는 비용만 늘며, **줄이는 도구가 나쁘면 원본이 커도 소용없다**.

- ImageMagick이 sips보다 축소 품질이 낫다(<https://decovar.dev/blog/2019/12/12/imagemagick-vs-sips-resize/>). 이 머신에 ImageMagick 7.1.2 Q16-HDRI·`cwebp`가 있다.
- 리사이즈는 선형 광에서 해야 정확하다. ImageMagick 예제(<https://usage.imagemagick.org/resize/#resize_colorspace>)의 패턴은
  `-colorspace RGB -resize … -colorspace sRGB`. sRGB에서 바로 줄이면 어두운 쪽이 더 어둡게 뭉친다.
- 투명 이미지 축소 시 ImageMagick 기본 필터는 Mitchell(링잉이 적어 알파 가장자리에 유리), 불투명은 Lanczos(<https://usage.imagemagick.org/filter/#default_filter>).
  클레이는 부드러운 면이라 Mitchell 기본값을 그대로 둔다. 투명 가장자리 후광(halo) 버그는 IM 6.2.4에서 고쳐졌다.
- `expo-image`(SDK 57 문서 <https://docs.expo.dev/versions/v57.0.0/sdk/image/>)는 WebP를 iOS·Android 모두 지원하고 `allowDownscaling` 기본 `true`라
  뷰 크기에 맞춰 디코드한다. 큰 파일을 작은 뷰에 넣어도 메모리는 뷰 기준이지만 **번들 크기는 파일 그대로**다. 그래서 파일은 표시 크기 3배(@3x)까지만 줄여 싣는다.
- RN은 `@2x`/`@3x` 접미 파일을 기기 밀도에 맞춰 골라 싣는다(<https://reactnative.dev/docs/images>). 16장×3파일은 관리 비용이 커 쓰지 않고 @3x 하나만 싣는다.

## 범위 밖

- AI 생성 대기 화면의 움직이는 클레이 캐릭터(§ 자산 로드맵 3번) — S07·S08이 자리표시자(`app/ai/ask.tsx`)다. `08-ai-itinerary-screens.md` 이후 별도 플랜.
- 탭바 아이콘, 지도 핀, 순번 배지 같은 **32dp 이하 아이콘**. 클레이 질감은 그 크기에서 뭉개진다(§ 기각한 대안). 카테고리 44dp가 하한이다.
- S06 동행·성향 칩 아이콘, O02 로컬 데이터 고지 그림 — 칩은 선택 상태를 색으로 이미 말하고, O02는 `brand-peach` 경고 카드 하나가 튀어야 한다.
- 디자인 토큰(색·타입·간격) 변경. 에셋을 토큰에 맞추는 것이지 토큰을 에셋에 맞추지 않는다.
- 사진·평점 공급자 추가. `10-coachmarks-and-content.md` 범위 밖 항목과 같다.

## 실행 조건

- OpenAI API 키가 있고 조직 검증(API Organization Verification)이 끝나 GPT Image 모델을 호출할 수 있다.
  ChatGPT 앱은 스타일 참조 편집 반복이 불편하고 알파 채널이 자주 깨지므로 API를 기본으로 한다. 앱으로 만든 파일은 § 절차 4 검사를 통과해야 한다.
- 사용자가 § 절차 1의 기본값에 이의가 없다. 이의가 있으면 그 값으로 바꾸고 나머지는 그대로 실행한다.
- **실행하지 않는 조건:** 스타일이 서로 다른 에셋을 "우선 넣어 두자"고 하는 상황. 한 세트가 같은 앵커 이미지에서 파생된 뒤에만 반영한다.
  디자인 시스템이 이미 "빈 자리가 잘못된 자리보다 낫다"고 정했다.

## 절차

### 1. 스타일 결정 (기본값)

| 미결 | 기본값 | 근거 |
| --- | --- | --- |
| 무광 클레이 vs 광택 장난감 3D | **무광 클레이**, 표면에 아주 미세한 손자국 질감. 01 Roam 기준. 05 Summer Travel의 광택은 쓰지 않는다 | 시스템 이름이 Clay다. 광택은 스톡 3D와 구분이 안 된다 |
| 인물 캐릭터 vs 소품 | **소품만**. 인물 없음 | 소품은 실루엣만 맞으면 한 세트로 읽힌다. 인물은 장마다 얼굴이 흔들린다 |
| 큰 일러스트 범위 | 빈 상태·온보딩·홈 히어로·장소 상세 헤더에 **대형(160~240dp)**, 썸네일·시트 행·도구 섹션에 **소형(44~56dp)**. 여행 카드에는 쓰지 않는다 | 여행 카드는 채도 카드 1장 규칙이 시선을 잡는다. 06 Travel UI처럼 카드마다 그림은 사진 앱 패턴 |

팔레트는 디자인 시스템 § 자산 로드맵 지시대로 `brand-peach #ffb084` · `brand-ochre #e8b94a` · `brand-mint #a4d4c5` · `brand-lavender #b8a4ed`를 축으로,
포인트 한 곳에 `brand-coral #ff6b5a`. 크림·흰색은 소품의 밝은 면에만. 잉크 `#0a0a0a`는 쓰지 않는다 — 잉크는 텍스트 몫이다. 배경은 항상 투명.
소형 아이콘은 **한 소품 한 실루엣**으로 단순하게, 대형은 소품 2~3개 장면을 허용한다. 소형에는 접지 그림자를 넣지 않는다(44dp에서 회색 얼룩이 된다).
대형에는 01 Roam처럼 아주 옅은 접지 그림자 하나를 허용한다.

### 2. 에셋 목록 (16종)

파일은 `assets/clay/` 아래, 형식은 WebP(마크만 PNG). 픽셀은 표시 dp × 3.

| 그룹 | id | 소재 | 쓰는 곳 | 표시 dp → 파일 px |
| --- | --- | --- | --- | --- |
| 대형 | `hero` | 캐리어 위에 접힌 지도와 항공권이 걸쳐진 장면 | E01 `app/index.tsx:76` · O01 `app/onboarding.tsx:51` | 240 → 720 |
| 대형 | `saved` | 접힌 지도 위에 꽂힌 통통한 핀, 핀 머리에 작은 북마크 리본 | E03 `saved.tsx:75` · `add-place.tsx:113` | 160 → 480 |
| 대형 | `budget` | 입이 살짝 열린 동전 지갑과 동전 두어 개 | E04 `budget.tsx:71` | 160 → 480 |
| 카테고리 | `cat-attraction` | 카메라 | S20 헤더 160 · S10/S11 썸네일 44 | 160 → 480 (44는 런타임 축소) |
| 카테고리 | `cat-food` | 볼에 담긴 면과 젓가락 | 〃 | 〃 |
| 카테고리 | `cat-cafe` | 손잡이 있는 머그 | 〃 | 〃 |
| 카테고리 | `cat-stay` | 침대 | 〃 | 〃 |
| 카테고리 | `cat-transport` | 버스 정면 | 〃 | 〃 |
| 카테고리 | `cat-etc` | 표지판(두 방향 화살표) | 〃 | 〃 |
| 시트 | `method-manual` | 접힌 지도와 연필 | S03 `app/create/index.tsx` 첫 행 | 56 → 168 |
| 시트 | `method-ai` | 반짝이 별 세 개가 붙은 나침반 | S03 둘째 행 | 56 → 168 |
| 도구 | `tool-weather` | 구름 앞의 해 | S12 `tools.tsx:41` | 48 → 144 |
| 도구 | `tool-time` | 자명종 시계 | `tools.tsx:52` | 48 → 144 |
| 도구 | `tool-fx` | 쌓인 동전 두 무더기 | `tools.tsx:57` | 48 → 144 |
| 도구 | `tool-translate` | 겹친 말풍선 두 개 | `tools.tsx:70` | 48 → 144 |
| 마크 | `icon.png` 등 | 클레이 핀 하나. 현재 마크(코랄 핀 + 경로 곡선) 실루엣 승계. 크림 `#fffaf0` 불투명 배경 | `app.json:8,18,36` | 1024 PNG |

카테고리 id는 `lib/category.ts:2-9`의 열거값과 1:1이다. 새 카테고리가 생기면 에셋도 생긴다.
O02(`app/onboarding.tsx:76`)의 사각형은 **삭제한다**. S13 지도 빈 상태는 지도 위 카드라 그림을 넣지 않는다(§ 2.9).

### 3. 생성

**해상도 두 단계.** 표시 크기보다 한 단계 위에서 생성하고 축소한다(§ 확인한 외부 사실 "축소").

| 그룹 | 생성 size | 최종 px | 초과표본 배율 |
| --- | --- | --- | --- |
| 대형·카테고리·마크 | `1536x1536` | 480~1024 | 1.5~3.2배 |
| 시트·도구 | `1024x1024` | 144~168 | 6배 이상 |

1536은 비실험 범위 안이고 최종 480px에 3.2배로 충분하다. 1920으로 올려도 480px 결과는 구분되지 않는다 — 비용만 든다.
소형은 1024가 API 최소 정방형에 가깝고 이미 6배라 그 이상 필요 없다.

**호출 값.** `model: gpt-image-2.5-flare`, `background: transparent`, `output_format: png`(중간 산출물은 PNG, 알파 보존), `quality: high`, `n: 4`.
마크만 `background: opaque`이고, 마크는 한 장을 정밀하게 다듬어야 하므로 `sunburst`를 쓴다. `high`로 부족한 장만 `xhigh`로 다시 뽑는다.
`curl` 한 줄 또는 Node `fetch` 스크립트 하나. SDK를 설치하지 않는다.

**앵커 → 파생 순서.** 접두만 같아서는 세트가 안 된다. 가이드의 방법대로 한다.

1. 스타일 접두 프롬프트를 하나 만든다: 재질(무광 폴리머 클레이, 미세한 손자국, 통통하고 둥근 형태, 모서리 없음) · 조명(위 왼쪽 부드러운 스튜디오 광) ·
   시점(3/4, 살짝 위) · 팔레트(§ 1 hex 다섯 개, "이 색만") · 배경(위 표준 문구 그대로) · 금지(글자·로고·인물·광택 반사·아웃라인·사진 질감·바닥면·체커보드) ·
   구도(정방형의 70~80%, 여백 균등).
2. `hero`를 `images.generate`로 4장 뽑고 한 장을 승인한다. 이것이 **앵커**다.
3. 나머지 15종은 `images.edit`에 앵커를 입력 이미지로 넣고 "Use the same style from the input image"로 시작해 소재 문장을 붙인다.
   접두의 제약을 **매번 다시 적는다**(가이드: 참조만으로는 드리프트한다). 소형 그룹은 앵커 대신 승인된 `cat-attraction`을 참조로 써도 된다 —
   소형은 "한 소품 한 실루엣"이라 대형 장면보다 그쪽이 가깝다.
4. 마크는 앵커 스타일 + 현재 `assets/icon-source.svg` 실루엣을 참조로 넣는다.

접두 프롬프트·소재 문장·모델 id·앵커 파일명·생성 날짜를 `assets/clay/README.md`에 기록한다. 이 플랜은 완료 후 삭제되므로 재생성 정보는 에셋 옆에 남는다.
레퍼런스 스크린샷은 스타일 참고로만 쓴다. 01 Roam 등의 구도를 그대로 재현하지 않는다(라이선스는 레퍼런스 README 기록대로 미확인).

### 4. 축소·변환·검사

축소는 ImageMagick으로 **선형 광에서** 한다. `sips`는 쓰지 않는다. 패턴은 § 확인한 외부 사실의 `-colorspace RGB -resize … -colorspace sRGB`.
필터는 지정하지 않는다(투명 입력에 Mitchell이 기본). 축소 뒤 `cwebp`로 WebP(`-q 90 -alpha_q 100`). 클레이 면에 밴딩이 보이면 그 장만 `-lossless`.
마크는 PNG 1024 그대로 둔다(iOS 아이콘은 알파 없는 PNG).

각 후보는 아래를 모두 통과해야 반영한다.

1. 축소 전 PNG를 `file`로 열어 `RGBA`(알파)를 확인한다. 그려진 체커보드·흰 바탕은 실격.
2. 크림 `#fffaf0` 위에 올려 가장자리에 흰 테·회색 후광이 없다. 시뮬레이터에서 확인한다. 후광이 보이면 축소 명령의 색공간 변환이 빠진 것이다.
3. 16장을 한 화면에 나열했을 때 같은 재질·같은 조명 방향·같은 시점으로 읽힌다. 한 장이 튀면 그 장을 앵커 참조로 다시 뽑는다.
4. 카테고리 6종을 **44dp로 줄여 나열**해도 서로 구분된다. 구분이 안 되는 것은 실루엣을 단순화해 다시 뽑는다. 이 검사가 카테고리 세트의 관문이다.
5. 색이 § 1 팔레트 밖으로 크게 벗어나지 않았다. hex는 힌트다 — 눈으로 확인한다.
6. 글자·인물·바닥면이 없다. 소형에는 그림자도 없다.
7. `du -sh assets/clay`가 2MB 이하다. 넘으면 `cwebp -q`를 85까지 내린다.

### 5. 코드 반영

1. `components/ClayFigure.tsx` 하나를 만든다. props는 `name`(§ 2 id 유니온)과 `size`(dp). 내부는 `expo-image` `Image` + 정적 `require` 맵 + `contentFit="contain"` +
   `accessible={false}`(장식). `expo-image`는 이미 설치·플러그인 등록되어 있다(`package.json`, `app.json:24`). 카테고리는 `lib/category.ts`의 `Category`로
   id를 만드는 헬퍼 하나를 같은 파일에 둔다. 근거: Metro는 `require` 경로가 정적이어야 해 이름→파일 맵이 한 곳에 필요하고 호출 지점이 10곳이 넘는다.
2. `app/index.tsx:76`을 `ClayFigure hero 240`으로 바꾸고 `:204` 스타일을 지운다. `:211` 빈 상태 제목을 `titleMd`에서 `displayLg`로 올린다.
   근거: 타이포 표가 `display-lg` 용도를 "홈 인사, 빈 상태 헤드"로 정했고 E01은 첫인상이다. E01에 다른 `display-*`가 없어 한 화면 하나 규칙에 맞는다.
3. `app/onboarding.tsx:51`을 `ClayFigure hero 240`(가로 중앙)으로 바꾼다. `:76`은 삭제한다. `:102` 스타일을 지운다.
4. `saved.tsx:75`·`add-place.tsx:113`을 `ClayFigure saved 160`으로, `budget.tsx:71`을 `ClayFigure budget 160`으로 바꾸고 각 `emptyFigure` 스타일을 지운다.
5. S20 `app/place/[placeId].tsx:30` — `photoUrl`이 없을 때 카테고리 `ClayFigure 160`을 같은 자리에 가로 중앙으로 그린다. `photoUrl`이 있으면 기존 사진 유지.
   근거: 사진이 없는 게 기본이고 헤더가 텍스트로 시작하면 상세 화면이 목록 행과 구분되지 않는다.
6. S10 `itinerary.tsx:162`·S11 `saved.tsx:84`의 빈 `thumb` 박스를 카테고리 `ClayFigure 44`로 바꾼다. `thumb` 스타일(`:248`, `:141`)의 배경색은 지우고 크기만 남긴다.
   근거: 영원히 비는 자리는 미완성으로 읽힌다. `10-coachmarks-and-content.md` § 6-1이 이 자리를 라벨 배지로 채우려 했으나, 이 플랜이 대신한다(§ 6-6).
7. S03 `app/create/index.tsx` `Row`에 왼쪽 `ClayFigure 56`을 넣는다(`method-manual`·`method-ai`). 행을 가로 배치로 바꾸고 텍스트 두 줄을 오른쪽에 둔다.
8. S12 `tools.tsx:41,52,57,70` 섹션 제목 왼쪽에 `ClayFigure 48`을 넣는다. `:52`·`:70`은 `heading` 래퍼가 없으므로 `:41`과 같은 구조로 감싼다.
9. `app.json:17,35`의 `#1554D1`을 `#fffaf0`으로 바꾼다. `assets/icon.png`·`splash-icon.png`·`android-icon-foreground.png`를 새 마크로 교체한다.
   스플래시 이미지는 배경 없는 마크만(크림은 설정이 칠한다). `android-icon-monochrome.png`는 실루엣이 같으므로 그대로 둔다.
   **아이콘 교체는 스토어 노출 자산이라 반영 전 사용자에게 새 마크를 보여 주고 확인을 받는다.** 나머지 항목은 확인 없이 진행한다.
10. `grep -rn "emptyFigure\|s.figure\|backgroundColor: colors.surfaceCard }" app/`에서 그림 자리표시자가 0건이 되게 한다.

### 6. 문서 갱신

1. `docs/design-system.md` § 자산 로드맵(`:702`)을 다시 쓴다. "지금은 하나도 없다"를 확보 목록 16종과 `assets/clay/README.md` 포인터로 바꾸고
   우선순위 3번(AI 대기 캐릭터)만 남긴다. § 1의 결정(무광·소품·대형/소형 구분·소형 무그림자)을 "스타일 계약"으로 옮겨 적는다.
   생성·축소 레시피(1536/1024 생성 → 선형 광 축소 → WebP)를 세 줄로 적는다.
2. 프론트매터 `components.empty-state.illustrationSize: 160` 옆에 `illustration: { hero: 240, large: 160, row: 56, section: 48, thumb: 44 }`를 추가한다.
   화면에서 크기 숫자를 인라인하지 않게 하기 위함이다. `theme.ts`에도 같은 값을 `illustration`으로 옮긴다.
3. § 미결 항목(`:742`) 2번 "3D 클레이 자산 0개"를 지운다.
4. `docs/design.md` § 8에 14번으로 이 플랜의 결과 한 단락을 더한다. § 2.6 S20 행의 "사진"을 "사진(공급자가 준 경우) 또는 카테고리 클레이"로, § 2.4 S10 "장소 썸네일"을
   "카테고리 클레이 44dp"로 고친다.
5. `docs/references/travel-3d-clay/README.md` "검토할 항목" 아래에 결정값과 이 플랜(완료 후에는 리뷰) 링크를 한 줄로 적는다.
6. `docs/plans/10-coachmarks-and-content.md` § 6-1을 "썸네일은 플랜 11의 카테고리 클레이로 채운다. 이 항목은 `photoUrl` 조회와 S20 출처 문구만 남긴다"로 고친다.
   (이 플랜을 쓰면서 함께 고쳤다. 실행 시 다시 확인만 한다.)

## 검증

```
file assets/clay/_src/*.png       # 축소 전 원본 전부 RGBA (원본은 _src/ 에 두고 git 에 넣지 않는다)
ls assets/clay/*.webp | wc -l     # 15
du -sh assets/clay                # 2MB 이하
grep -rn "emptyFigure\|s.figure" app/   # 0건
grep -n "1554D1" app.json         # 0건
npx tsc --noEmit
npm run check
```

iOS 시뮬레이터(`xcrun simctl` + Codex Computer Use), `app_settings`를 비운 콜드 스타트에서:

1. 스플래시 배경이 크림이고 마크가 중앙에 있다.
2. 온보딩 1단계에 hero가 보이고 2단계에는 그림이 없다.
3. 홈 E01에 hero + `display-lg` 제목. 가장자리 후광 없음.
4. S03 시트 두 행에 아이콘이 있고 행 높이가 44dp 이상이다.
5. 여행을 만들고 저장 탭(E03)·가계부(E04)·장소 추가 "최근 저장" 탭의 그림이 각각 saved·budget·saved다.
6. 카테고리가 다른 장소 6개를 담아 S10·S11 썸네일 44dp가 서로 구분되고, S20에서 160dp로 같은 소품이 크게 보인다. `photoUrl`이 있는 장소(백업 가져오기)는 사진이 우선한다.
7. S12 네 섹션 제목 옆 아이콘이 48dp로 정렬된다.
8. 위 화면을 캡처해 나란히 놓고 § 4-3(한 세트로 읽히는지)을 눈으로 확인한다. 캡처는 리뷰에 첨부한다.
9. 라이트 모드 고정이라 다크 확인은 없다.

## 되돌리는 법 / 상향 신호

- 되돌리기: `ClayFigure` 호출을 크림 사각형으로 되돌리는 것뿐이다. 데이터 변경이 없다. `git revert` 한 번.
- 카테고리 44dp가 실기기에서 구분되지 않으면(§ 4-4 통과 후에도) 썸네일만 플랜 10 § 6-1의 라벨 배지로 되돌리고 S20 160dp는 유지한다.
- `08-ai-itinerary-screens.md` 실행 시 대기 화면이 생기면 "AI 대기 캐릭터" 플랜을 별도로 쓴다. 그때 § 1 "인물 없음"을 재론한다 — 대기 화면은 인물 한 장만 필요해 일관성 문제가 없다.
- 번들 크기가 문제로 보고되면(§ 4-7 2MB 초과) 그때 `@2x`/`@3x` 분할이나 소형 그룹 픽셀 축소를 검토한다.

## 기각한 대안

- **01 Roam 팩 구매·그대로 사용** — 팔레트가 우리 토큰과 다르고 소재를 화면에 맞게 고를 수 없다. 라이선스 미확인. 재론하지 않는다.
- **인물 마스코트** — 장마다 같은 얼굴 유지가 어렵다. AI 대기 화면 한 장이 필요해질 때 재론.
- **탭바·핀·순번 배지를 클레이로** — 24~28dp에서 질감이 뭉개진다. 카테고리 44dp가 하한이고 그것도 § 4-4로 검사한다.
- **표시 크기(480px)에서 바로 생성** — 초과표본 없이는 가장자리 계단과 노이즈가 남고, 512x512는 API 최소 픽셀(655,360)에도 못 미친다.
- **1920 이상·`max` 품질로 전부 생성** — 480px 결과에서 1536과 구분되지 않는다. 가이드도 "요구 품질을 못 채울 때만 xhigh/max".
- **`sips`로 축소** — ImageMagick보다 축소 품질이 낮고 선형 광 변환을 제어할 수 없다. ImageMagick이 이미 설치되어 있다.
- **PNG로 싣기** — 알파 PNG 15장은 WebP의 3~4배다. `expo-image`가 WebP를 양 플랫폼에서 지원한다. 밴딩이 보이는 장만 WebP 무손실.
- **`@2x`/`@3x` 분할 파일** — 16장×3파일 관리 비용. `allowDownscaling` 기본값이 메모리를 뷰 기준으로 잡아 준다. 번들 크기 문제가 실제로 보고되면 재론.
- **Lottie·애니메이션 클레이** — 움직여야 하는 자리가 없다. AI 대기 화면이 생기면 재론.
- **플랫 벡터로 우선 채우기** — 디자인 시스템이 명시적으로 금지한다. 재론하지 않는다.
- **`gpt-image-2` 이하 모델** — 투명 배경이 프리뷰이거나 미지원. 2.5로 확정했으므로 재론하지 않는다.
- **ChatGPT 앱에서 수작업 생성** — 앵커 참조 편집을 15번 반복하기 불편하고 알파가 자주 깨진다. API 키가 없을 때의 임시 수단으로만.

## 실패 모드

접두 프롬프트만 같은 채 앵커 없이 16장을 따로 뽑아 "대체로 비슷한" 세트를 넣는 것이 이 플랜의 실패 모드다. § 3 앵커→파생 순서와 § 4-3이 그것을 잡는다.
두 번째는 카테고리 6종이 44dp에서 구분되지 않는데 160dp 결과만 보고 통과시키는 것이다 — § 4-4가 44dp 나열 검사를 강제한다.
세 번째는 sRGB에서 바로 줄여 크림 위에 회색 후광이 남는 것이다 — § 4-2가 잡는다.
