import Screen from '../../components/Screen';

export default function Destination() {
  return (
    <Screen
      id="S04  ·  /create/destination"
      title="도시 선택"
      note="국내/해외 탭, 검색 입력, 인기 도시 목록(권역 보조 텍스트)."
      to={[['/create/dates', '도시 선택  →  S05']]}
    />
  );
}
