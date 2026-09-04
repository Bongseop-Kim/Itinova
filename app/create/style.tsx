import Screen from '../../components/Screen';

export default function TripStyle() {
  return (
    <Screen
      id="S06  ·  /create/style"
      title="동행 · 성향"
      note="동행 칩(단일), 성향 칩(복수). 우상단 건너뛰기."
      to={[['/trip/1/itinerary', '여행 만들기  →  S10']]}
    />
  );
}
