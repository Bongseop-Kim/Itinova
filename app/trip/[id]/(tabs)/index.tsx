import { useLocalSearchParams } from 'expo-router';

import Screen from '../../../../components/Screen';

export default function TripHome() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen
      id={`S09  ·  /trip/${id}`}
      title="여행 홈"
      note="D-day 헤더, 날짜 칩+편집, 카테고리 탭(관광·맛집·숙소), AI 추천 장소 캐러셀, 검색."
      to={[
        [`/trip/${id}/add-place`, '검색  →  S15'],
        [`/trip/${id}/settings`, '여행 설정  →  S21'],
        ['/place/1', '장소 카드  →  S20'],
      ]}
    />
  );
}
