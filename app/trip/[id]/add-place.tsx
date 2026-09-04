import { useLocalSearchParams } from 'expo-router';

import Screen from '../../../components/Screen';

export default function AddPlace() {
  const { id, day } = useLocalSearchParams<{ id: string; day?: string }>();
  return (
    <Screen
      id={`S15  ·  /trip/${id}/add-place${day ? `?day=${day}` : ''}`}
      title="장소 추가"
      note={
        day
          ? `지도 + 검색바, 카테고리 필터, 소스 탭(Day ${day} 추천 · 최근 저장 · 나만의 장소), 다중 선택 → day ${day} 일정에 담기.`
          : 'day 파라미터가 없으면 담기 대상은 저장함(S11).'
      }
      to={[
        [day ? `/trip/${id}/itinerary` : `/trip/${id}/saved`, day ? `day ${day} 일정에 담기  →  S10` : '저장함에 담기  →  S11'],
        ['/place/1', '리스트 행  →  S20'],
      ]}
    />
  );
}
