import { useLocalSearchParams } from 'expo-router';

import Screen from '../../../components/Screen';

export default function TripSettings() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen
      id={`S21  ·  /trip/${id}/settings`}
      title="여행 설정"
      note="제목, 날짜, 동행·성향, 기본 통화, JSON 내보내기, 맨 아래 분리된 여행 삭제. 날짜 변경 시 trip_days 재생성 — 기간이 줄면 사라지는 일차의 장소를 saved_places 로 이동 (§4.1)."
    />
  );
}
