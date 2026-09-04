import Screen from '../components/Screen';

export default function Home() {
  return (
    <Screen
      id="S01  ·  /"
      title="홈"
      note="진행중 여행 카드(D-day·날짜범위), 다가오는/지난 여행 목록. 빈 상태는 E01."
      to={[
        ['/create', '여행 일정짜기  →  S03'],
        ['/trip/1/itinerary', '여행 카드  →  S10'],
        ['/settings', '앱 설정  →  S02'],
        ['/onboarding', '온보딩 다시 보기  →  S22'],
      ]}
    />
  );
}
