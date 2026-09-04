import { useLocalSearchParams } from 'expo-router';

import Screen from '../../../components/Screen';

export default function EditItinerary() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen
      id={`S14  ·  /trip/${id}/edit`}
      title="일정 편집"
      note="드래그 핸들 재정렬(sort_order 만 갱신), 거리순 재정렬, 방문 완료 체크, day 전체 선택 → 다른 일차로 이동/삭제. 첫 진입 코치마크 C02 → C03 (2스텝)."
      to={[[`/trip/${id}/itinerary`, '완료  →  S10']]}
    />
  );
}
