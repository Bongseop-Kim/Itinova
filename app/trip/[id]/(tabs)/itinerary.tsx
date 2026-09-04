import { useLocalSearchParams } from 'expo-router';

import Screen from '../../../../components/Screen';

export default function Itinerary() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen
      id={`S10  ·  /trip/${id}/itinerary`}
      title="일정 보드  ★ 기준 화면"
      note="지도 프리뷰(접기/펼치기), 퀵칩 행, 일차 섹션 + 날씨, 순번 배지 장소 카드, 카드 사이 거리 배지(Haversine 직선거리, 렌더 시 계산). 빈 상태 E02, 첫 장소 담은 직후 코치마크 C01."
      to={[
        [`/trip/${id}/edit`, '편집  →  S14'],
        [`/trip/${id}/map`, '지도  →  S13'],
        [`/trip/${id}/add-place?day=1`, 'day 1 장소 추가  →  S15'],
        [`/trip/${id}/checklist`, '퀵칩 체크리스트  →  S16'],
        [`/trip/${id}/budget`, '퀵칩 가계부  →  S17'],
        [`/trip/${id}/chat`, '퀵칩 AI에게 묻기  →  S19'],
      ]}
    />
  );
}
