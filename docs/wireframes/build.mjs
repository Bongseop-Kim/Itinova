// Itinova 와이어프레임 아트보드 생성기.
// docs/design.md §2 기준. 회색 박스 + 라벨만. 시각 디자인은 범위 밖.
// 수정은 이 파일에서 하고 `node build.mjs` 로 .dc.html 을 다시 뽑는다.
// ponytail: .dc.html 은 파일마다 helmet CSS 를 들고 있어야 해서, CSS 를 한 곳에 두려면 생성기가 가장 짧다.
import { writeFileSync, readdirSync, unlinkSync } from 'node:fs';

const CSS = `
*{box-sizing:border-box}
body{margin:0;background:#f4f4f4;font:400 13px/1.45 -apple-system,'Helvetica Neue',system-ui,sans-serif;color:#333;-webkit-font-smoothing:antialiased}
a{color:#333}a:hover{color:#000}
.fr{display:flex;flex-direction:column;min-height:100vh;background:#f4f4f4}
.rt{flex:none;padding:7px 12px 6px;font:500 10px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;color:#8d8d8d;letter-spacing:.01em}
.ph{flex:1;display:flex;flex-direction:column;background:#fff;border-top:1px solid #dcdcdc;overflow:hidden}
.hd{flex:none;display:flex;align-items:center;gap:10px;min-height:52px;padding:10px 16px;border-bottom:1px solid #ececec}
.hd .t{font-size:15px;font-weight:600;flex-grow:1}
.act{font-size:12px;font-weight:600;color:#666;flex:none}
.ic{flex:none;min-width:30px;height:30px;padding:0 5px;border:1px solid #d2d2d2;border-radius:5px;background:#eee;display:flex;align-items:center;justify-content:center;font-size:9px;color:#8d8d8d}
.bd{flex:1;display:flex;flex-direction:column;gap:12px;padding:14px 16px}
.box{background:#e8e8e8;border:1px solid #d4d4d4;border-radius:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;color:#7a7a7a;font-size:11px;line-height:1.4;text-align:center;padding:8px}
.row{display:flex;align-items:center;gap:10px;min-height:44px;background:#fff;border:1px solid #e2e2e2;border-radius:6px;padding:8px 12px;font-size:12px}
.row .g{flex-grow:1}
.set{display:flex;flex-direction:column;gap:8px}
.hs{display:flex;gap:8px}
.wr{display:flex;flex-wrap:wrap;gap:8px}
.lb{font-size:11px;font-weight:700;color:#9a9a9a;letter-spacing:.04em}
.q{font-size:16px;font-weight:600;color:#2b2b2b;line-height:1.35}
.mut{color:#9a9a9a;font-size:11px;line-height:1.45}
.chip{display:flex;align-items:center;min-height:40px;padding:0 14px;border:1px solid #d2d2d2;border-radius:999px;font-size:11px;color:#666;background:#f7f7f7}
.chip.on{background:#333;border-color:#333;color:#fff}
.xs{flex:none;min-height:32px;display:flex;align-items:center;padding:0 9px;border:1px solid #d2d2d2;border-radius:5px;font-size:10px;color:#7a7a7a;background:#fafafa}
.cta{flex:none;margin:0 16px 16px;min-height:48px;border-radius:8px;background:#333;color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600}
.btn{flex-grow:1;min-height:44px;border:1px solid #d2d2d2;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#555;background:#fafafa}
.bar{flex:none;display:flex;gap:8px;padding:10px 16px 16px;border-top:1px solid #ececec}
.sg{flex:none;display:flex;border-bottom:1px solid #ececec}
.sg div{flex-grow:1;text-align:center;padding:13px 4px;font-size:12px;color:#a8a8a8}
.sg div.on{color:#333;font-weight:600;box-shadow:inset 0 -2px 0 #333}
.tb{flex:none;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-top:1px solid #e2e2e2;padding:8px 0 12px}
.tb div{display:flex;flex-direction:column;align-items:center;gap:5px;font-size:10px;color:#b0b0b0}
.tb div.on{color:#333;font-weight:700}
.tb i{width:22px;height:22px;border:1px solid #d2d2d2;border-radius:5px;background:#eee}
.tb div.on i{background:#d8d8d8;border-color:#b8b8b8}
.dh{display:flex;align-items:baseline;gap:8px;padding-top:2px}
.dh b{font-size:14px;font-weight:700}
.pc{display:flex;align-items:center;gap:10px;min-height:64px;background:#fff;border:1px solid #e2e2e2;border-radius:8px;padding:10px 12px}
.num{flex:none;width:22px;height:22px;border-radius:11px;background:#333;color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center}
.th{flex:none;width:44px;height:44px;border-radius:5px;background:#e8e8e8;border:1px solid #d4d4d4}
.dist{display:flex;align-items:center;gap:8px;padding-left:22px;font-size:10px;color:#a8a8a8}
.dist:before{content:'';width:0;height:16px;border-left:1px dashed #c8c8c8}
.add{min-height:44px;border:1px dashed #cfcfcf;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:11px;color:#9a9a9a}
.cb{flex:none;width:22px;height:22px;border:1px solid #c8c8c8;border-radius:5px;background:#fff}
.cb.on{background:#333;border-color:#333}
.hnd{flex:none;width:20px;height:14px;background:repeating-linear-gradient(#c4c4c4 0 2px,transparent 2px 6px)}
.dim{flex:1;background:rgba(0,0,0,.26)}
.sh{flex:none;background:#fff;border:1px solid #dcdcdc;border-top-left-radius:16px;border-top-right-radius:16px;padding:16px 16px 20px;display:flex;flex-direction:column;gap:10px}
.bu{max-width:80%;border-radius:12px;padding:10px 12px;font-size:12px;line-height:1.45}
.bu.me{align-self:flex-end;background:#333;color:#fff}
.bu.ai{align-self:flex-start;background:#f1f1f1;color:#4a4a4a;display:flex;flex-direction:column;gap:8px}
.cal{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}
.dow{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;font-size:10px;color:#a8a8a8;text-align:center}
.cd{min-height:42px;border-radius:5px;background:#f2f2f2;display:flex;align-items:center;justify-content:center;font-size:11px;color:#8d8d8d}
.cd.mid{background:#dcdcdc;color:#555}
.cd.sel{background:#333;color:#fff;font-weight:700}
.del{margin-top:auto;min-height:44px;border:1px solid #e6dada;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#a4453a;background:#fdfafa}
.dots{display:flex;gap:6px;align-items:center}
.dots i{width:6px;height:6px;border-radius:3px;background:#d4d4d4}
.dots i.on{width:18px;background:#333}
.co{border:1px solid #dcdcdc;border-radius:8px;background:#fafafa;padding:12px 14px;display:flex;flex-direction:column;gap:6px;font-size:12px;line-height:1.5}
.co.warn{border-color:#e6dada;background:#fdfafa;color:#8a3a30}
.ov{position:absolute;inset:0;background:rgba(0,0,0,.58);display:flex;flex-direction:column;justify-content:flex-end;gap:10px;padding:16px}
.bub{background:#fff;border-radius:10px;padding:12px 14px;display:flex;flex-direction:column;gap:4px}
.ring{min-height:44px;border:2px solid #fff;border-radius:8px;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;font-size:11px;color:#fff}
.ovbtn{min-height:44px;border-radius:8px;background:#fff;color:#333;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600}
.txtbtn{flex:none;min-height:44px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#8d8d8d;margin:0 16px 8px}
.es{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center;padding:24px 28px}
.es .fig{width:64px;height:64px;border-radius:14px;background:#ededed;border:1px solid #dcdcdc;margin-bottom:4px}
.es b{font-size:14px;color:#4a4a4a}
.tip{background:#2b2b2b;color:#fff;border-radius:10px;padding:12px 14px;display:flex;flex-direction:column;gap:6px}
.tip b{font-size:13px}
.tip .m{font-size:11px;color:#c4c4c4;line-height:1.5}
.tip .r{display:flex;gap:14px;align-items:center;margin-top:4px}
.tip .r span{font-size:11px;font-weight:700}
.tip .r .sec{font-weight:400;color:#a8a8a8;margin-left:auto}
.arw{width:12px;height:12px;background:#2b2b2b;transform:rotate(45deg);flex:none;margin-left:30px}
.ovdim{position:absolute;inset:0;background:rgba(0,0,0,.62);z-index:1}
.spot{position:relative;z-index:2;background:#fff;border-radius:10px;box-shadow:0 0 0 4px rgba(255,255,255,.9)}
.tw{position:absolute;left:0;right:0;z-index:3;display:flex;flex-direction:column}
.tw.below{top:calc(100% + 16px)}
.tw.above{bottom:calc(100% + 16px)}
.tw.below .arw{margin-bottom:-6px}
.tw.above .arw{margin-top:-6px}
`.trim();

const ic = (t) => `<div class="ic">${t}</div>`;
const box = (label, h, extra = '') => `<div class="box" style="height:${h}px;${extra}">${label}</div>`;
const row = (l, r = '', extra = '') => `<div class="row"${extra}><span class="g">${l}</span>${r ? `<span class="mut">${r}</span>` : ''}</div>`;
const set = (...rows) => `<div class="set">${rows.join('')}</div>`;
const chips = (arr, on = []) => `<div class="wr">${arr.map((c) => `<div class="chip${on.includes(c) ? ' on' : ''}">${c}</div>`).join('')}</div>`;
const lb = (t) => `<div class="lb">${t}</div>`;
const mut = (t) => `<div class="mut">${t}</div>`;
const q = (t) => `<div class="q">${t}</div>`;
const dh = (t, r = '') => `<div class="dh"><b>${t}</b>${r ? `<span class="mut" style="margin-left:auto">${r}</span>` : ''}</div>`;
const hd = (title, left = '뒤로', right = '') =>
  `<div class="hd">${left ? ic(left) : ''}<div class="t">${title}</div>${right}</div>`;
const bd = (...kids) => `<div class="bd">${kids.join('')}</div>`;
const cta = (t) => `<div class="cta">${t}</div>`;
const bar = (...btns) => `<div class="bar">${btns.map((b) => `<div class="btn">${b}</div>`).join('')}</div>`;
const sg = (arr, on) => `<div class="sg">${arr.map((t) => `<div class="${t === on ? 'on' : ''}">${t}</div>`).join('')}</div>`;
const tb = (on) => `<div class="tb">${['여행 홈', '일정', '저장', '도구'].map((n) => `<div class="${n === on ? 'on' : ''}"><i></i>${n}</div>`).join('')}</div>`;
const pc = (n, name, meta, right = '') =>
  `<div class="pc"><div class="num">${n}</div><div class="th"></div><div class="g"><div style="font-size:12px;font-weight:600">${name}</div><div class="mut">${meta}</div></div>${right}</div>`;
const dist = (t) => `<div class="dist">${t}</div>`;
const dots = (n, on) => `<div class="dots">${Array.from({ length: n }, (_, i) => `<i class="${i === on ? 'on' : ''}"></i>`).join('')}</div>`;
const sheet = (...kids) => `<div class="dim"></div><div class="sh">${kids.join('')}</div>`;
const exclude = (name) => `<div class="row"><span class="g">${name}</span><div class="xs">제외</div></div>`;
const addToDay = (name) => `<div class="row"><div class="th"></div><span class="g">${name}</span><div class="xs">일정에 추가</div></div>`;

// ── 화면 정의 ────────────────────────────────────────────────
const S = {};

S.S01 = {
  title: 'S01 홈', route: 'app/index.tsx  ·  /', w: 390, h: 844,
  body: [
    hd('Itinova', '', ic('설정')),
    bd(
      lb('진행중'),
      box('진행중 여행 카드<br>부산 · D-5 · 9.9 – 9.11', 104),
      lb('다가오는 여행'),
      box('여행 카드 · 도쿄 · 10.2 – 10.6', 62),
      box('여행 카드 · 제주 · 11.14 – 11.16', 62),
      lb('지난 여행'),
      box('여행 카드 · 여수 · 5.3 – 5.5', 62),
      mut('빈 상태 = 카드 목록 없이 안내 문구 + 하단 CTA 하나만'),
    ),
    cta('여행 일정짜기  →  S03'),
  ],
};

S.S02 = {
  title: 'S02 앱 설정', route: 'app/settings.tsx  ·  /settings', w: 390, h: 844,
  body: [
    hd('앱 설정'),
    bd(
      set(
        row('언어', '한국어'),
        row('날짜 형식', 'YYYY.MM.DD'),
        row('거리 단위', 'km'),
        row('기본 통화', 'KRW'),
        row('위치 권한', '사용 중일 때'),
        row('알림', '켜짐'),
      ),
      lb('데이터'),
      set(
        row('전체 데이터 내보내기', 'JSON'),
        row('데이터 가져오기', 'JSON'),
      ),
      mut('로그인 없음 → JSON 내보내기/가져오기가 유일한 백업·기기 이전 수단'),
    ),
  ],
};

S.S03 = {
  title: 'S03 생성 방식 (= BS2)', route: 'app/create/index.tsx  ·  /create  · modal', w: 390, h: 844,
  body: [
    sheet(
      q('어떻게 만들까요?'),
      set(
        row('직접 일정 만들기', '→ S04'),
        row('AI 일정 추천받기', '→ S07'),
      ),
      mut('바텀시트 2행. BS2와 같은 형태'),
    ),
  ],
};

S.S04 = {
  title: 'S04 도시 선택', route: 'app/create/destination.tsx  ·  /create/destination', w: 390, h: 844,
  body: [
    hd('어디로 떠나세요?'),
    sg(['국내', '해외'], '국내'),
    bd(
      box('검색 입력 · 도시명', 44),
      lb('인기 도시'),
      set(
        row('서울', '수도권'),
        row('부산', '경상'),
        row('제주', '제주'),
        row('강릉', '강원'),
        row('여수', '전라'),
        row('경주', '경상'),
      ),
      mut('도시 선택 → S05. 국내/해외는 탭 전환만, 별도 제품으로 나누지 않음'),
    ),
  ],
};

const cal = (rows) => `<div class="cal">${rows.flat().map((c) => {
  if (c === null) return '<div></div>';
  const [d, k] = Array.isArray(c) ? c : [c, ''];
  return `<div class="cd${k ? ' ' + k : ''}">${d}</div>`;
}).join('')}</div>`;

S.S05 = {
  title: 'S05 날짜 범위', route: 'app/create/dates.tsx  ·  /create/dates', w: 390, h: 844,
  body: [
    hd('언제 떠나세요?'),
    bd(
      lb('2026년 9월'),
      `<div class="dow"><div>일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div>토</div></div>`,
      cal([
        [null, null, 1, 2, 3, 4, 5],
        [6, 7, 8, ['9', 'sel'], ['10', 'mid'], ['11', 'sel'], 12],
        [13, 14, 15, 16, 17, 18, 19],
        [20, 21, 22, 23, 24, 25, 26],
        [27, 28, 29, 30, null, null, null],
      ]),
      lb('2026년 10월'),
      cal([
        [null, null, null, 1, 2, 3, 4],
        [5, 6, 7, 8, 9, 10, 11],
      ]),
      mut('2개월 세로 스크롤. 날짜 필수 · 하단에 "날짜는 나중에 바꿀 수 있어요" 안내 1줄'),
    ),
    cta('2박 3일  ·  다음'),
  ],
};

S.S06 = {
  title: 'S06 동행 · 성향', route: 'app/create/style.tsx  ·  /create/style', w: 390, h: 844,
  body: [
    hd('', '뒤로', '<div class="act">건너뛰기</div>'),
    bd(
      q('누구와 함께 가나요?'),
      chips(['혼자', '친구', '연인', '가족', '아이와'], ['친구']),
      q('어떤 여행을 원하세요?'),
      mut('복수 선택'),
      chips(['체험', '핫플', '자연', '문화', '힐링', '쇼핑', '먹방'], ['핫플', '먹방']),
      mut('전체 건너뛰기 가능. 성향은 AI 추천·정렬 힌트로만 쓴다'),
    ),
    cta('여행 만들기  →  S10'),
  ],
};

S.S07 = {
  title: 'S07 AI 질문 5단계', route: 'app/ai/ask.tsx  ·  /ai/ask', w: 390, h: 844,
  body: [
    `<div class="hd">${ic('뒤로')}<div style="flex-grow:1;height:4px;border-radius:2px;background:#e8e8e8;overflow:hidden"><div style="width:60%;height:100%;background:#333"></div></div><div class="act">3 / 5</div></div>`,
    bd(
      mut('몇 가지만 알려주시면 일정 초안을 만들어 드려요  (캡처 24 소개 화면 흡수)'),
      q('누구와 함께 가나요?'),
      chips(['혼자', '친구', '연인', '가족', '아이와'], ['친구']),
      box('단일 화면 + step 상태<br>① 도시  ② 기간 (당일 ~ 5박6일)  ③ 동행  ④ 스타일  ⑤ 밀도 (빡빡/널널)', 96),
      mut('5단계 완료 → Claude 호출 → Places 해석 → S08'),
    ),
    cta('다음'),
  ],
};

const aiResultKids = [
      mut('생성 근거 1줄 — 먹방 · 핫플 성향, 널널 밀도로 하루 3곳'),
      lb('DAY 1 · 9.9 수'),
      set(...['부산역', '광안리 해수욕장', '돼지국밥 거리'].map(exclude)),
      lb('DAY 2 · 9.10 목'),
      set(...['감천문화마을', '흰여울문화마을'].map(exclude)),
      mut('Places 해석 실패 항목은 결과에서 조용히 빠짐'),
  mut('AI가 만든 정보는 정확하지 않을 수 있어요 · 영업시간·가격은 확인 필요'),
];
const aiResultHd = hd('생성 결과', '뒤로', '<div class="act">다시 생성</div>');

S.S08 = {
  title: 'S08 생성 결과 미리보기', route: 'app/ai/result.tsx  ·  /ai/result', w: 390, h: 844,
  body: [aiResultHd, bd(...aiResultKids), cta('내 여행으로 저장  →  S10')],
};

S.S09 = {
  title: 'S09 여행 홈', route: 'app/trip/[id]/index.tsx  ·  /trip/[id]', w: 390, h: 844,
  body: [
    hd('두근두근, 여행 D-5', '', ic('검색') + ic('설정')),
    bd(
      `<div class="hs" style="align-items:center"><div class="chip on">9.9 수</div><div class="chip">9.10 목</div><div class="chip">9.11 금</div><div class="xs">편집</div></div>`,
      lb('AI 추천 장소'),
      `<div class="hs" style="margin-right:-16px">${box('추천 카드', 132, 'width:148px;flex:none')}${box('추천 카드', 132, 'width:148px;flex:none')}${box('추천', 132, 'width:148px;flex:none')}</div>`,
      mut('가로 캐러셀 · 다음 카드가 잘려 보이게'),
    ),
    sg(['관광', '맛집', '숙소'], '관광'),
    `<div class="bd" style="flex:none;padding-top:12px">${set(row('해운대 해수욕장', '관광'), row('감천문화마을', '관광'))}</div>`,
    tb('여행 홈'),
  ],
};

// C01 이 인덱스로 대상을 집으므로 자식을 배열로 빼둔다.
const mainKids = [
  box('지도 프리뷰 · 순번 핀 + 일차 경로<br>접기 / 펼치기', 120),
      `<div class="hs"><div class="chip">체크리스트</div><div class="chip">가계부</div><div class="chip">AI에게 묻기</div></div>`,
      dh('day 1  9.9/수', '맑음 26°'),
      pc(1, '부산역', '교통 · 부산 동구'),
      dist('8.1 km'),
      pc(2, '광안리 해수욕장', '관광 · 부산 수영구'),
      dist('2.4 km'),
      pc(3, '돼지국밥 거리', '맛집 · 부산 서면'),
      `<div class="add">+ 장소 추가  →  S15</div>`,
  dh('day 2  9.10/목', '흐림 24°'),
];
const mainHd = hd('부산 여행', '뒤로', '<div class="act">편집</div>');

S.Main = {
  title: 'S10 일정 보드  ★ 기준 화면', route: 'app/trip/[id]/itinerary.tsx  ·  /trip/[id]/itinerary', w: 390, h: 844,
  body: [mainHd, bd(...mainKids), tb('일정')],
};

// ── 온보딩 (§2.0) ────────────────────────────────────────────
// app-01 `11` 가치 제안 · `22` 권한 "나중에" · `59`,`60` 지도 팁만 채택.
// 성향 설문(app-01 `01`,`02`,`08`)은 S06에서 이미 받으므로 넣지 않는다.
S.O01 = {
  title: 'O01 가치 제안', route: 'app/onboarding.tsx  ·  step 1/3', w: 390, h: 844,
  body: [
    `<div class="hd">${dots(3, 0)}</div>`,
    bd(
      q('여행 하나를,<br>처음부터 끝까지'),
      mut('계획하고, 다니면서 쓰고, 끝나면 정리까지'),
      box('일정 보드 미리보기 일러스트', 232),
    ),
    `<div class="bd" style="flex:none;padding-top:0">${mut('3페이지 캐러셀 — ① 일차별 일정 보드  ② 지도 위 동선과 거리  ③ AI 일정 초안')}</div>`,
    cta('다음'),
  ],
};

S.O02 = {
  title: 'O02 로컬 데이터 고지', route: 'app/onboarding.tsx  ·  step 2/3', w: 390, h: 844,
  body: [
    `<div class="hd">${dots(3, 1)}</div>`,
    bd(
      q('로그인 없이 바로 씁니다'),
      `<div class="co">여행 데이터는 이 기기에만 저장됩니다.<br>계정도, 서버도 없습니다.</div>`,
      `<div class="co warn"><b>앱을 삭제하면 여행 기록도 함께 사라집니다.</b></div>`,
      mut('설정 → 전체 데이터 내보내기(JSON)로 백업할 수 있어요 (S02)'),
      box('내보내기 / 가져오기 일러스트', 150),
      mut('건너뛰기 없음 — 3화면뿐이고, 이 고지는 반드시 한 번 보게 한다'),
    ),
    cta('알겠어요'),
  ],
};

S.O03 = {
  title: 'O03 위치 권한 사전 안내', route: 'app/onboarding.tsx  ·  step 3/3', w: 390, h: 844,
  body: [
    `<div class="hd">${dots(3, 2)}</div>`,
    bd(
      q('주변 장소를 찾으려면<br>위치가 필요해요'),
      `<div class="co">위치는 <b>장소 검색과 지도 표시</b>에만 씁니다.<br>이동 경로를 기록하거나 저장하지 않습니다.</div>`,
      box('OS 권한 다이얼로그 미리보기<br>앱 사용 중에만 허용 / 이번만 / 거부', 108),
      mut('§1.2에서 위치 자동 추적을 제외했으므로, 상시 위치는 요청하지 않는다'),
      mut('완료 시 app_settings.onboarded = 1 → 다음 실행부터 건너뜀'),
    ),
    cta('위치 허용'),
    `<div class="txtbtn">나중에 하기  →  S01</div>`,
  ],
};

S.S11 = {
  title: 'S11 저장 (여행별 보관함)', route: 'app/trip/[id]/saved.tsx  ·  /trip/[id]/saved', w: 390, h: 844,
  body: [
    hd('저장', '뒤로'),
    sg(['전체', '관광', '맛집', '숙소'], '전체'),
    bd(
      set(...['흰여울문화마을', '밀면 본점', '부산 시티호텔'].map(addToDay)),
      mut('일정에 추가 → BS3 (일차 선택)'),
      mut('빈 상태 = "저장한 장소가 없어요" + 장소 찾기 CTA'),
    ),
    tb('저장'),
  ],
};

S.S12 = {
  title: 'S12 여행 도구', route: 'app/trip/[id]/tools.tsx  ·  /trip/[id]/tools', w: 390, h: 844,
  body: [
    hd('여행 도구', '뒤로'),
    bd(
      lb('날씨'),
      `<div class="hs">${['9.9', '9.10', '9.11'].map((d) => box(d + '<br>26°', 74, 'flex-grow:1')).join('')}</div>`,
      lb('시차'),
      box('현지 09:20  /  한국 09:20  ·  차이 없음', 58),
      lb('환율'),
      box('KRW / JPY  ·  100엔 = 928원', 58),
      mut('기준 시각 표시 필수 — 9.4 17:00'),
      lb('번역'),
      box('입력 언어 / 대상 언어<br>번역 결과', 84),
    ),
    tb('도구'),
  ],
};

const mapBody = [
  hd('전체 지도', '뒤로'),
  `<div style="flex:none;padding:10px 16px">${chips(['전체', 'day 1', 'day 2', 'day 3'], ['전체'])}</div>`,
  `<div class="bd" style="padding-top:0">${box('지도 전체화면<br>순번 핀 1 2 3 · 일차별 경로 점선<br><br>핀 탭 → BS1 퀵 액션', 0, 'flex:1')}${mut('장소 없는 상태 = 지도 중앙에 안내 + 장소 추가 CTA')}</div>`,
];

S.S13 = {
  title: 'S13 전체 지도', route: 'app/trip/[id]/map.tsx  ·  /trip/[id]/map', w: 390, h: 844,
  body: mapBody,
};

const editKids = [
      box('지도 · 순번 + 경로', 96),
      `<div class="hs"><div class="xs">거리순 재정렬</div></div>`,
      dh('day 1  9.9/수', 'day 전체 선택'),
      set(
        `<div class="row"><div class="hnd"></div><div class="cb on"></div><div class="num">1</div><span class="g">부산역</span></div>`,
        `<div class="row"><div class="hnd"></div><div class="cb"></div><div class="num">2</div><span class="g">광안리 해수욕장</span></div>`,
        `<div class="row"><div class="hnd"></div><div class="cb"></div><div class="num">3</div><span class="g">돼지국밥 거리</span></div>`,
      ),
      dh('day 2  9.10/목', 'day 전체 선택'),
      set(`<div class="row"><div class="hnd"></div><div class="cb"></div><div class="num">1</div><span class="g">감천문화마을</span></div>`),
  mut('드래그 재정렬 · 방문 완료 체크 · sort_order 만 갱신'),
];
const editBody = [
  hd('일정 편집', '뒤로', '<div class="act">완료</div>'),
  bd(...editKids),
  bar('다른 일차로 이동', '삭제'),
];

S.S14 = {
  title: 'S14 일정 편집', route: 'app/trip/[id]/edit.tsx  ·  /trip/[id]/edit', w: 390, h: 844,
  body: editBody,
};

S.S15 = {
  title: 'S15 장소 추가', route: 'app/trip/[id]/add-place.tsx  ·  ?day=1', w: 390, h: 844,
  body: [
    hd('장소 추가', '뒤로'),
    `<div class="bd" style="flex:none">${box('검색 · 관광지 / 맛집 / 숙소 검색', 44)}${chips(['맛집', '관광', '숙소'])}${box('지도 · 핀 선택으로도 담기', 128)}</div>`,
    sheet(
      sg(['Day 1 추천', '최근 저장', '나만의 장소'], 'Day 1 추천'),
      set(
        row('해운대 해수욕장', '선택'),
        row('밀면 본점', '선택됨'),
        row('부산 시티호텔', '선택'),
      ),
      mut('day 파라미터 없이 진입하면 담기 대상은 저장함(S11)'),
    ),
    cta('day 1 일정에 2개 담기'),
  ],
};

S.S16 = {
  title: 'S16 체크리스트', route: 'app/trip/[id]/checklist.tsx', w: 390, h: 844,
  body: [
    hd('체크리스트', '뒤로'),
    bd(
      dh('필수 준비물', '더보기'),
      set(
        `<div class="row"><div class="cb on"></div><span class="g">여권 / 신분증</span></div>`,
        `<div class="row"><div class="cb"></div><span class="g">항공권 예약 확인</span></div>`,
        `<div class="row"><div class="cb"></div><span class="g">여행자 보험</span></div>`,
      ),
      dh('기본 짐싸기', '더보기'),
      set(
        `<div class="row"><div class="cb on"></div><span class="g">충전기 · 보조배터리</span></div>`,
        `<div class="row"><div class="cb"></div><span class="g">상비약</span></div>`,
        `<div class="row"><div class="cb"></div><span class="g">세면도구</span></div>`,
      ),
      `<div class="add">+ 항목 추가</div>`,
      mut('여행 생성 시 기본 템플릿 시드'),
    ),
  ],
};

S.S17 = {
  title: 'S17 가계부', route: 'app/trip/[id]/budget.tsx', w: 390, h: 844,
  body: [
    hd('가계부', '뒤로'),
    `<div class="bd" style="flex:none;padding-bottom:0">${box('KRW 428,000   ·   JPY 12,400<br>통화별 합계', 78)}</div>`,
    sg(['일차별', '카테고리별'], '일차별'),
    bd(
      dh('day 1 · 9.9', '184,000'),
      set(
        row('KTX 서울–부산 · 교통', '59,800'),
        row('돼지국밥 · 식비', '11,000'),
        row('숙소 1박 · 숙박', '113,200'),
      ),
      dh('day 2 · 9.10', '8,500'),
      set(row('감천 카페 · 카페', '8,500')),
      mut('단일 주체 모델 — 지불자·분담 인원 없음'),
    ),
    cta('비용 추가  →  S18'),
  ],
};

S.S18 = {
  title: 'S18 비용 입력', route: 'app/trip/[id]/expense/new.tsx', w: 390, h: 844,
  body: [
    hd('비용 추가', '뒤로', '<div class="act">저장</div>'),
    bd(
      box('금액 입력  ·  0<br>통화 KRW', 90),
      set(
        row('일차', 'day 1 · 9.9'),
        row('결제수단', '카드'),
        row('항목명', '입력'),
        row('카테고리', '식비'),
        row('연결 장소 (선택)', '돼지국밥 거리'),
      ),
      mut('expenses.split_with 은 스키마에만 존재 · UI 미노출 (§1.3-1)'),
    ),
  ],
};

S.S19 = {
  title: 'S19 AI 채팅', route: 'app/trip/[id]/chat.tsx', w: 390, h: 844,
  body: [
    hd('AI에게 묻기', '뒤로'),
    `<div style="flex:none;padding:12px 16px 0"><div class="chip" style="align-self:flex-start;display:inline-flex">부산 · 9.9 – 9.11 · 친구와</div></div>`,
    bd(
      chips(['day 2 뭐 넣을까?', '동선 좀 봐줄래?']),
      `<div class="bu me">부산 야경 좋은 곳?</div>`,
      `<div class="bu ai"><div>광안대교가 보이는 곳을 두 군데 추천해요.</div><div class="pc"><div class="th"></div><div class="g"><div style="font-size:12px;font-weight:600">광안리 해수욕장</div><div class="mut">관광 · 부산 수영구</div></div><div class="xs">일정에 담기</div></div></div>`,
      mut('직전 8턴만 컨텍스트로 전송 · 추천 질문 칩은 일정 상태에 따라 정적 분기'),
      `<div style="margin-top:auto">${mut('AI 응답은 정확하지 않을 수 있어요 · 영업시간·가격 확인 필요')}</div>`,
    ),
    `<div class="bar">${box('메시지 입력', 44, 'flex-grow:1')}${ic('전송')}</div>`,
  ],
};

S.S21 = {
  title: 'S21 여행 설정', route: 'app/trip/[id]/settings.tsx', w: 390, h: 844,
  body: [
    hd('여행 설정', '뒤로'),
    bd(
      set(
        row('제목', '부산 여행'),
        row('날짜', '9.9 – 9.11'),
        row('동행 · 성향', '친구와 · 핫플, 먹방'),
        row('기본 통화', 'KRW'),
        row('JSON 내보내기', '이 여행만'),
      ),
      mut('날짜 변경 시 trip_days 재생성 — 기존 day_items 처리 규칙 확인 필요'),
      `<div class="del">여행 삭제</div>`,
    ),
  ],
};

S.S20 = {
  title: 'S20 장소 상세 (공용)', route: 'app/place/[placeId].tsx  ·  /place/[placeId]', w: 390, h: 844,
  body: [
    hd('', '뒤로', ic('저장')),
    `<div style="flex:none">${box('사진', 168, 'border-radius:0;border-left:0;border-right:0')}</div>`,
    bd(
      q('광안리 해수욕장'),
      mut('평점 4.5 · 리뷰 12,480  ·  관광 · 부산 수영구'),
      box('소개 2 – 3줄', 56),
      set(
        row('주소', '부산 수영구 광안해변로'),
        row('전화', '051-000-0000'),
        row('영업시간', '24시간'),
      ),
      box('미니맵', 88),
    ),
    bar('저장', '일정에 추가', '길찾기'),
  ],
};

S.BS1 = {
  title: 'BS1 장소 퀵 액션', route: '바텀시트 · 라우트 아님 (S10 / S13 에서 열림)', w: 390, h: 420,
  body: [
    sheet(
      `<div><div style="font-size:15px;font-weight:600">광안리 해수욕장</div>${mut('관광 · 부산 수영구')}</div>`,
      row('장소 상세 보기', '→ S20'),
      `<div class="hs"><div class="btn">시간 추가</div><div class="btn">메모 추가</div></div>`,
      `<div class="hs"><div class="btn">비용 추가 → S18</div><div class="btn">길찾기 (외부 앱)</div></div>`,
    ),
  ],
};

S.BS3 = {
  title: 'BS3 일차 선택', route: '바텀시트 · 라우트 아님 (S11 / S19 / S20 에서 열림)', w: 390, h: 420,
  body: [
    sheet(
      q('어느 일차에 담을까요?'),
      set(
        row('day 1', '9.9 수'),
        row('day 2', '9.10 목'),
        row('day 3', '9.11 금'),
        row('저장함에만 담기', '→ S11'),
      ),
    ),
  ],
};

// ── 코치마크 (app-01 `60` 형태) ──────────────────────────────
// 대상 요소를 딤 위로 z-index 로 띄우고, 말풍선은 그 요소를 기준으로 absolute 배치한다.
// 좌표 상수가 없으므로 위아래 내용이 바뀌어도 앵커가 어긋나지 않는다.
const tip = (title, body, step, total) =>
  `<div class="tip"><b>${title}</b><div class="m">${body}</div><div class="r">` +
  (total > 1
    ? `<span>${step < total ? '다음 팁' : '알겠어요'}</span><span class="sec">${step} / ${total}  ·  닫기</span>`
    : `<span>알겠어요</span><span class="sec">닫기</span>`) +
  `</div></div>`;

// arr[i] 를 스포트라이트로 감싸고 말풍선을 placement('below' | 'above') 쪽에 붙인다.
const withSpot = (arr, i, tipHtml, placement) => {
  const tw = placement === 'below'
    ? `<div class="tw below"><div class="arw"></div>${tipHtml}</div>`
    : `<div class="tw above">${tipHtml}<div class="arw"></div></div>`;
  return arr.map((el, k) => (k === i ? `<div class="spot">${tw}${el}</div>` : el));
};
const dim = '<div class="ovdim"></div>';
const CM = 'position:relative;z-index:0';   // .ph 를 스태킹 컨텍스트로

S.C01 = {
  title: 'C01 · S10 일정 보드', route: '첫 장소를 담은 직후 1회 · app_settings.tip_itinerary', w: 390, h: 844,
  phStyle: CM,
  body: [
    mainHd,
    bd(...withSpot(mainKids, 3, tip(
      '장소 카드를 탭해 보세요',
      '상세 화면에 들어가지 않고 <b>시간 · 메모 · 비용</b>을 바로 넣습니다. 카드 사이 숫자는 직선거리예요.',
      1, 1), 'above')),
    tb('일정'),
    dim,
  ],
};

S.C02 = {
  title: 'C02 · S14 일정 편집  1/2', route: '첫 진입 1회 · app_settings.tip_edit', w: 390, h: 844,
  phStyle: CM,
  body: [
    editBody[0],
    bd(...withSpot(editKids, 3, tip(
      '순서는 두 가지로 바꿉니다',
      '왼쪽 <b>핸들</b>을 끌어 직접 옮기거나, 위 <b>거리순 재정렬</b>로 동선이 짧은 순서로 한 번에 정리합니다.',
      1, 2), 'below')),
    editBody[2],
    dim,
  ],
};

S.C03 = {
  title: 'C03 · S14 일정 편집  2/2', route: '첫 진입 1회 · tip_edit 두 번째 스텝', w: 390, h: 844,
  phStyle: CM,
  body: [
    ...withSpot(editBody, 2, tip(
      '다른 날로 옮길 수도 있어요',
      '체크로 장소를 고르거나 <b>day 전체 선택</b>을 누른 뒤, 아래에서 다른 일차로 옮기거나 지웁니다.',
      2, 2), 'above'),
    dim,
  ],
};

S.C04 = {
  title: 'C04 · S13 전체 지도', route: '첫 진입 1회 · app_settings.tip_map', w: 390, h: 844,
  phStyle: CM,
  body: [
    ...withSpot(mapBody, 1, tip(
      '특정 일차만 보고 싶으세요?',
      '여기서 일차를 고르면 그 날의 핀과 경로만 남습니다. 핀을 탭하면 퀵 액션이 열려요.',
      1, 1), 'below'),
    dim,
  ],
};

S.C05 = {
  title: 'C05 · S08 AI 생성 결과', route: '첫 진입 1회 · app_settings.tip_ai_result', w: 390, h: 844,
  phStyle: CM,
  body: [
    aiResultHd,
    bd(...withSpot(aiResultKids, 2, tip(
      '저장하기 전에 다듬는 화면이에요',
      '마음에 안 드는 곳은 <b>제외</b>로 빼고, 초안 자체가 아쉬우면 위 <b>다시 생성</b>을 누르세요.',
      1, 1), 'below')),
    cta('내 여행으로 저장  →  S10'),
    dim,
  ],
};

// ── 빈 상태 (화면 본문 · 상시 · 닫기 없음) ───────────────────
// app-02 `36` · app-01 `32`,`38`,`40` 형태: 도형 + 제목 + 부제 + (있으면) 단일 CTA.
const es = (fig, title, sub) => `<div class="es"><div class="fig"></div><b>${title}</b>${mut(sub)}${mut(fig)}</div>`;

S.E01 = {
  title: 'E01 홈 — 여행 없음 (첫 실행)', route: 'S01 빈 상태', w: 390, h: 844,
  body: [
    hd('Itinova', '', ic('설정')),
    es('온보딩 직후 첫 화면', '아직 여행이 없어요', '도시와 날짜만 정하면<br>일차별 일정이 바로 만들어집니다'),
    cta('여행 일정짜기  →  S03'),
  ],
};

S.E02 = {
  title: 'E02 일정 보드 — 장소 없음', route: 'S10 빈 상태', w: 390, h: 844,
  body: [
    hd('부산 여행', '뒤로', '<div class="act">편집</div>'),
    bd(
  box('지도 프리뷰 · 핀 없음', 110),
      `<div class="hs"><div class="chip">체크리스트</div><div class="chip">가계부</div><div class="chip">AI에게 묻기</div></div>`,
      dh('day 1  9.9/수', '맑음 26°'),
      `<div class="add">+ 장소 추가</div>`,
      dh('day 2  9.10/목', '흐림 24°'),
      `<div class="add">+ 장소 추가</div>`,
      dh('day 3  9.11/금', '맑음 27°'),
      `<div class="add">+ 장소 추가</div>`,
      mut('일차 골격은 이미 있으므로 별도 안내 문구를 두지 않는다. 점선 버튼이 다음 행동이다'),
    ),
    tb('일정'),
  ],
};

S.E03 = {
  title: 'E03 저장 — 저장한 장소 없음', route: 'S11 빈 상태', w: 390, h: 844,
  body: [
    hd('저장', '뒤로'),
    sg(['전체 0', '관광 0', '맛집 0', '숙소 0'], '전체 0'),
    es('app-02 `36`과 같은 형태 · CTA 없음', '저장한 장소가 없어요', '가고 싶은 곳을 저장해두면<br>일차에 담을 때 바로 꺼내 씁니다'),
    tb('저장'),
  ],
};

S.E04 = {
  title: 'E04 가계부 — 비용 없음', route: 'S17 빈 상태', w: 390, h: 844,
  body: [
    hd('가계부', '뒤로'),
    `<div class="bd" style="flex:none;padding-bottom:0">${box('KRW 0<br>통화별 합계', 78)}</div>`,
    sg(['일차별', '카테고리별'], '일차별'),
    es('app-01 `38` 형태', '기록한 비용이 없어요', '결제할 때마다 넣어두면<br>일차별·카테고리별로 알아서 묶입니다'),
    cta('비용 추가  →  S18'),
  ],
};

// ── 파일 출력 ────────────────────────────────────────────────
const page = (s) => `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <style>
${CSS}
  </style>
</helmet>
<div class="fr">
  <div class="rt">${s.route}</div>
  <div class="ph" style="${s.phStyle ?? ''}">
${s.body.join('\n')}
  </div>
</div>
</x-dc>
</body>
</html>
`;

// 행 배치: 6 / 2 / 4 / 6 / 2 / 3
const ROWS = [
  { note: '온보딩 — 앱 첫 실행 1회   (O01 – O03)', keys: ['O01', 'O02', 'O03'] },
  { note: '코치마크 — 4곳 5스텝, 1회만, 닫으면 끝   (C01 – C05)', keys: ['C01', 'C02', 'C03', 'C04', 'C05'] },
  { note: '빈 상태 — 데이터 없으면 상시, 닫기 없음   (E01 – E04)', keys: ['E01', 'E02', 'E03', 'E04'] },
  { note: '전역 · 여행 생성   (S01 – S06)', keys: ['S01', 'S02', 'S03', 'S04', 'S05', 'S06'] },
  { note: 'AI 일정 생성   (S07 – S08)', keys: ['S07', 'S08'] },
  { note: '여행 내부 — 하단 탭 4개   (S09 – S12)', keys: ['S09', 'Main', 'S11', 'S12'] },
  { note: '여행 내부 — 서브 화면   (S13 – S18)', keys: ['S13', 'S14', 'S15', 'S16', 'S17', 'S18'] },
  { note: '여행 내부 — 서브 화면   (S19, S21)', keys: ['S19', 'S21'] },
  { note: '공용 · 바텀시트   (S20, BS1, BS3)', keys: ['S20', 'BS1', 'BS3'] },
];

const XSTEP = 480;
const YSTEP = 984;
const artboards = [];
const annotations = [];

ROWS.forEach((r, ri) => {
  const y = ri * YSTEP;
  annotations.push({ id: `row-${ri + 1}`, x: 0, y: y - 96, w: 360, text: r.note });
  r.keys.forEach((k, ci) => {
    const s = S[k];
    if (!s) throw new Error(`missing screen ${k}`);
    writeFileSync(new URL(`./${k}.dc.html`, import.meta.url), page(s));
    artboards.push({ file: `${k}.dc.html`, x: ci * XSTEP, y, w: s.w, h: s.h, title: s.title });
  });
});

const defined = Object.keys(S).length;
const placed = artboards.length;
if (defined !== placed) throw new Error(`정의 ${defined}개 / 배치 ${placed}개 — 불일치`);

writeFileSync(
  new URL('./canvas.json', import.meta.url),
  JSON.stringify({ artboards, annotations, launch: { view: 'canvas' } }, null, 2) + '\n',
);

// 이름이 바뀐 아트보드가 남아 있으면 seed 시 좌표 없는 슬롯으로 딸려 들어간다.
const keep = new Set(artboards.map((a) => a.file));
const stale = readdirSync(new URL('.', import.meta.url)).filter((f) => f.endsWith('.dc.html') && !keep.has(f));
stale.forEach((f) => unlinkSync(new URL(`./${f}`, import.meta.url)));

console.log(`${placed} artboards + canvas.json${stale.length ? ` (stale 삭제: ${stale.join(', ')})` : ''}`);
