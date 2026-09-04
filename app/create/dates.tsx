import Screen from '../../components/Screen';

export default function Dates() {
  return (
    <Screen
      id="S05  ·  /create/dates"
      title="날짜 범위"
      note="2개월 세로 스크롤 캘린더. 날짜 필수 — 초안 상태를 만들지 않는다. 캘린더 위 인라인 힌트로 '시작일 → 종료일 차례로' 안내 (§2.9)."
      to={[['/create/style', 'N박 M일  ·  다음  →  S06']]}
    />
  );
}
