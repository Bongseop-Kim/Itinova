# Itinova clay assets

생성일: 2026-09-16. 사용자 승인으로 API 대신 내장 `image_gen` 도구 사용. 모델 ID·quality·n은 도구가 노출하지 않아 지정하지 않았다. 원본은 전부 1254×1254 RGBA이며 요청한 1536/1024와 다르다. hero 1장을 검토해 앵커로 채택하고 모든 소품에 같은 원본을 참조했다. 후보 4장 생성은 내장 도구 전환에 따라 1장씩 생성·검토로 변경했다.

앵커: `_src/hero.png` (로컬 원본, git 제외). 저장된 최종 앵커는 `hero.webp`. 재생성 시 원본이 없으면 이 WebP를 스타일 참조로 사용한다.

## 스타일 계약

무광 폴리머 클레이·미세 손자국·소품만·좌상단 광원·살짝 위 3/4 시점. peach/ochre/mint/lavender와 coral 포인트, 크림 하이라이트. 투명 배경, 글자·사람·바닥·광택 금지. 작은 소품은 접지 그림자 없음.

## 프롬프트

히어로: peach travel suitcase with folded mint map and cream airline ticket draped over its top, tiny coral accent. 아래 공통 스타일·금지 조건과 함께 생성했다.

공통 접두:

```text
Use the same style from the input image (style reference only). Create ONE isolated mobile app clay asset, square transparent PNG, preferably 1536x1536. Matte polymer clay with subtle fingerprint texture, plump rounded forms, three-quarter slightly elevated view, soft upper-left studio lighting. Only peach #ffb084, ochre #e8b94a, mint #a4d4c5, lavender #b8a4ed and one coral #ff6b5a accent; cream highlights allowed, no black. Fully transparent background, clean alpha edges, no solid backdrop, scenery, checkerboard, watermark, floor, text, letters, logos, people, outlines or glossy reflections. Center subject with balanced 15% margins, clean silhouette. NO cast or ground shadow. Subject:
```

소재:

- `saved`: a folded mint map with a plump coral location pin; small lavender bookmark ribbon attached to the pin head. No suitcase or ticket.
- `budget`: a peach coin purse slightly open, with two ochre coins beside it. Coins have no writing or symbols. No map or suitcase.
- `cat-attraction`: one simple peach camera with a large lavender lens and mint shutter button. Single chunky recognizable camera silhouette. No map or suitcase.
- `cat-food`: one mint bowl filled with chunky cream noodles, with two ochre chopsticks across its rim. Minimal single silhouette.
- `cat-cafe`: one lavender mug with a big rounded handle and cream coffee surface. No saucer, no steam.
- `cat-stay`: one peach bed with a thick cream duvet, mint pillow and rounded lavender headboard. Minimal recognizable bed.
- `cat-transport`: one mint bus seen almost from the front, lavender windows, ochre wheels and cream headlights. No signs or lettering.
- `cat-etc`: one rounded peach signpost with two broad directional arrows, mint pointing left and lavender pointing right, no writing. No base platform.
- `method-manual`: a folded mint map with one peach pencil resting diagonally across it, cream simple route line. No writing.
- `method-ai`: one round lavender compass with a coral needle and three small ochre sparkle stars attached around its upper rim. No letters or numbers.
- `tool-weather`: one plump cream cloud partially covering an ochre sun with short rounded rays. One cohesive weather icon.
- `tool-time`: one peach twin-bell alarm clock with a cream face, lavender hands and ochre bells. No numerals, just simple dot hour marks.
- `tool-fx`: two short stacks of thick ochre coins side by side, cream coin centers, no letters or currency symbols.
- `tool-translate`: two overlapping plump speech bubbles, mint front and lavender behind, no letters, only three cream dots in front bubble.

마크 시안:

```text
Create a square 1536x1536 app icon proposal. Image 1 is ONLY the matte clay material, lighting reference. Image 2 is ONLY the existing brand silhouette reference: coral location pin with circular hole and a cream curved route ending in an arrow. Recreate that pin and route as one plump handmade matte polymer clay mark, frontal with very slight dimensional thickness, soft upper-left lighting, subtle fingerprint texture. Preserve the pin outline, central round hole, cream route curving upward across lower right side into arrow. No suitcase, map, ticket or extra objects. Coral #ff6b5a pin, cream #fffaf0 route. Solid uniform cream #fffaf0 background, full bleed square, no rounded tile corners. Mark centered filling 68% height, generous even padding, no floor or cast shadow, no lettering, watermark or glossy reflection.
```

마크는 2026-09-16 사용자 승인 후 `../icon.png`(1024 RGB)·`../splash-icon.png`(1024 RGBA)·`../android-icon-foreground.png`(안전 여백을 추가한 RGBA)에 반영했다. `../icon-source.svg`는 이전 실루엣 참조 원본이며 현재 아이콘 재생성 원본이 아니다. 승인 시안과 투명 변형은 `../../docs/reviews/2026-09-16-clay-assets/`에 보관한다.

## 축소

ImageMagick `-colorspace RGB -resize SIZE -colorspace sRGB` → cwebp `-q 90 -alpha_q 100`. hero 720px, 빈 상태·카테고리 480px, 생성 방식 168px, 도구 144px. 별도 @2x 파일 없이 하나씩 사용한다. 출력 PNG/WebP의 알파 및 크림 위 가장자리와 44dp 실루엣을 검사했다.

원본·중간 PNG는 `_src/`에 로컬 보관하고 버전 관리와 앱 번들에서 제외한다. 용량 예산 2MB는 **배포 파일 기준**이며 원본을 포함한 `du -sh assets/clay`에는 적용하지 않는다.

도시 씬은 정사각 원본에서 `hero` 1170×1032, `card` 468×588, `thumb` 168×168로 중앙 크롭한다. 소품 2~3개와 낮은 바닥 면을 두고, 히어로 텍스트가 올라가는 하단 1/3은 비운다. 공통 스타일 계약의 재질·광원·팔레트는 유지하되 장면형 자산이므로 크림 배경과 바닥 면을 허용한다. `lib/cities.ts`의 16개 도시를 내장 ImageGen으로 각각 한 번 생성하고 세 슬롯으로 크롭했다. q90은 배포분이 2.4MB여서 q82로 낮췄고, 기존 자산을 합친 배포분은 1,637,862바이트다.


투명 마크 편집 프롬프트: Extract this exact coral clay pin with cream curved arrow as a transparent PNG. Preserve silhouette, central hole, colors, texture, camera and proportions; remove only the cream background, including inside the hole. Clean alpha, no backdrop/shadow/checkerboard. 투명 결과를 860px로 선형 광 축소해 1024px 중앙에 놓고, 앱 아이콘에는 정확한 canvas #fffaf0를 합성했다. Android foreground는 이 투명 마크를 다시 760px로 줄여 1024px 가운데 놓았다.
