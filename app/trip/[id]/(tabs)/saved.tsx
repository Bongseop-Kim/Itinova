import { useLocalSearchParams } from 'expo-router';

import Screen from '../../../../components/Screen';

export default function Saved() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen
      id={`S11  ·  /trip/${id}/saved`}
      title="저장"
      note="전체/관광/맛집/숙소 탭. 카드 액션 '일정에 추가' → BS3. 여행별 보관함(전역 목록 아님). 빈 상태 E03."
      to={[
        [`/trip/${id}/add-place`, '장소 찾기  →  S15'],
        ['/place/1', '카드  →  S20'],
      ]}
    />
  );
}
