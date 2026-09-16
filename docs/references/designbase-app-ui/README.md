# Designbase APP UI Template v1.6.0 — 레퍼런스 에셋

2026-09-16 사용자가 준 템플릿. 처음엔 Figma MCP로 읽다가 Starter 플랜 월 20회 한도에 걸렸고, 사용자가 같은 템플릿을 **pen.dev**(로컬 디자인 도구, `.pen`은 JSON)로
옮긴 뒤 전체를 읽었다. 앱 적용 플랜은 `docs/plans/12-designbase-component-refresh.md`.

원본 문서: `~/.pencil/documents/b0663e16-bc21-4747-86c0-6728897af191/pencil-new.pen`(24MB, 사용자 로컬). Pen 데스크톱 MCP 서버(`pencil`, stdio)로
스크린샷·PNG 내보내기를, JSON 직접 파싱으로 아이콘 SVG 추출을 했다. 재현 스크립트는 `tools/`.

## 폴더

| 경로 | 내용 | 개수 |
| --- | --- | --- |
| `icons/index.json` | 템플릿 아이콘 1,024개의 `[섹션, 이름, 원본 노드 id]` 색인. SVG 본문은 앱이 쓰는 것만 `assets/icons/`에 있다 | — |
| `graphics/empty-*.svg` | 템플릿 Empty Graphic 7종(96dp, 파랑 플랫 일러스트). **앱에 쓰지 않는다** — 디자인 시스템이 플랫 벡터 대체를 금지. 형태 참고용 | 7 |
| `graphics/marker-*.svg` | Map Markers 8종(출발 깃발, 현재 위치, 순번 핀, 카테고리 핀, 북마크 핀, 이미지 핀, 텍스트 핀, 위치 정보) | 8 |
| `screens/*.png` | 화면 예시 29장, 2x(804px). 여행 앱과 겹치는 지도·항공 예약·검색·목록·설정·AI 채팅 | 29 |
| `components/*.png` | 컴포넌트 시트 21장 + Figma 캔버스 전체 썸네일 | 22 |
| `tokens.json` | Figma 변수 전체(색·타입·라운드·크기·간격·효과). Pen 임포트 때 변수가 평탄화돼 여기가 유일한 토큰 기록 | — |
| `nodes.md` | Figma 컴포넌트 캔버스 노드 색인(옛 id). Pen 문서의 id와는 다르다 | — |
| `tools/pen_mcp.py` | Pen MCP 서버 stdio 클라이언트(초기화·`tools/call`) | — |
| `tools/extract_icons.py` | `.pen` → SVG 아이콘 추출 | — |
| `tools/export_frames.py` | Pen `execute Export()`로 프레임 PNG 내보내기 | — |

## 화면 파일 ↔ 템플릿 프레임

| 파일 | 템플릿 프레임 | Itinova에서 볼 것 |
| --- | --- | --- |
| `screens/map-trip-mapview.png` | 지도-여행-지도뷰 | **S10·S13의 원형.** 일차 밑줄 탭, 순번 핀 + 동선, 지도 위 `지도뷰/리스트` 세그먼트, 하단 가로 카드(순번 배지·시각·장소명·카테고리 · 체류) |
| `screens/map-recommend.png` | 지도-추천 | S15 지도: 지도 위 검색바, 핀 아이콘 카테고리 칩, 핸들 있는 바텀시트, 현재 위치 원형 버튼 |
| `screens/map-place-detail.png` | 지도-상세페이지 | **S20의 원형.** 갤러리 헤더, 제목+카테고리, 아이콘 액션 4열(전화·문의·찜·공유), 정보 행(선행 아이콘: 주소·영업·전화·URL), 방문 기록 섹션 |
| `screens/map-search-results.png` `map-favorites.png` `map-favorite-lists.png` `map-nav-walk.png` | 지도-검색결과 · 즐겨찾기 · 즐겨찾기목록 · 네비게이션-도보 | S11 저장함 폴더형 목록, 검색 결과 행, 길찾기 |
| `screens/flight-my-trips.png` | 항공 예약-내여행 | **S01의 원형.** 예정/지난 탭, 연도 그룹 헤더, 날짜 라벨, 상태 배지 카드, `출발 → 도착` 행 |
| `screens/flight-date-picker.png` `flight-date-picked.png` | 항공 예약-날짜선택(완료) | **S05.** 월 제목, 범위 밴드 + 양끝 채운 원, 오늘 점, 하단 `25.11.23 ~ 25.11.26 적용하기` |
| `screens/flight-find-destination.png` | 항공 예약-여행지 찾기 | **S04.** 검색바 + 지역별 섹션 헤더 + 도시 pill 칩 가로 스크롤 |
| `screens/flight-home.png` `flight-travelers.png` | 항공 예약-홈 · 인원선택 | 출발/도착 입력 카드, 스테퍼 |
| `screens/search-recent.png` `search-no-results.png` `search-results-list.png` | 검색 3종 | S15 검색: 선행 아이콘·지우기·`취소`, 최근 검색 헤더 + `모두 삭제`, 결과 없음 |
| `screens/list-tab.png` `list-segment.png` `list-chip.png` `list-list-type.png` `list-filter-open.png` | 목록 5종 | 순번 + 64dp 썸네일 + 제목/부제/메타 행, 탭·세그먼트·칩 필터 비교 |
| `screens/more-settings-1.png` `more-settings-2.png` `blog-settings.png` | 설정 3종 | **S02·S21.** 뒤로 + 라지 타이틀, 프로필 행, 그룹 간격으로 구분한 셰브론 행(구분선 없음) |
| `screens/more-notifications-empty.png` | 알림 빈 화면 | 빈 상태 배치 |
| `screens/ai-chat.png` `ai-chat-active.png` | 생성형 AI 채팅 | 플랜 09 참고: 모델명 드롭다운 헤더, 아이콘 칩 빠른 시작, 첨부·마이크 컴포저 |
| `screens/saas-schedule.png` `saas-todo-timeline.png` | SaaS 일정·타임라인 | 주간 날짜 스트립 + 시간 레일 + 카드. S10에 시각이 있을 때의 대안 배치 |

컴포넌트 시트(`components/`)는 Figma 캔버스와 같은 구성이다: button · lists · cards · filters · forms · form-controls · date-picker · navigation-bar · search-bar ·
tabbar · tabbar-ios · empty-state · toast · modal · badge · progress-indicators · progress-stepper · icon-container · category-item · map-markers · graphic.

## 템플릿 성격 요약

- 402dp 화면, 한국어 문구, **Pretendard** — 우리 폰트와 같다.
- 색: 흰 표면 `#ffffff`, 파랑 브랜드 `#006fff`, 텍스트 `#17191a`/`#464a4d`/`#757b80`, 테두리·2층 표면 `#e8eef2`. 파랑은 교체 전제의 자리색.
- 라운드 8/12/20/24/full, 컨트롤 36/40/48, 간격 4/8/12/16/24/32. 우리 토큰과 간격은 같고 라운드는 6·16이 없다.
- 타입: Title 24/20/18 Bold(행간 1.25), Body 16 Regular(행간 1.8), Label 16/14 Bold, Caption 14 Regular, Button 16/14/12 Bold.
- 아이콘: 24dp 라인, 약 1.5dp 스트로크 상당의 채움 경로, 둥근 끝. outline/filled 짝이라 탭바 활성·비활성에 그대로 쓴다.
- 컴포넌트: iOS 관습(뒤로 셰브론, 중앙 제목, 검색 취소, 플로팅 탭바), pressed/disabled 상태가 토큰으로 분리.

## 라이선스

사용자가 유료 구매한 템플릿이다(2026-09-16 확인). 아이콘·마커를 앱 에셋으로 쓰는 데 제약이 없다.
아이콘 원본 1,024개는 플랜 12 실행 시 앱이 쓰는 것만 `assets/icons/`로 옮기고 나머지를 지웠다(사용자 결정). 다시 필요하면 `tools/extract_icons.py`로 재추출한다.
