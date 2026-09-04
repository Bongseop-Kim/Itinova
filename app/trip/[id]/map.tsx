import { useLocalSearchParams } from 'expo-router';

import Screen from '../../../components/Screen';

export default function TripMap() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen
      id={`S13  ·  /trip/${id}/map`}
      title="전체 지도"
      note="전체 / day 1~N 필터 칩, 순번 핀, 일차 경로 점선. 핀 탭 → BS1. 장소 없으면 지도 중앙 안내. 첫 진입 코치마크 C04."
    />
  );
}
