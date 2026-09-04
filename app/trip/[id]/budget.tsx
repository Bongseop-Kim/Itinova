import { useLocalSearchParams } from 'expo-router';

import Screen from '../../../components/Screen';

export default function Budget() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen
      id={`S17  ·  /trip/${id}/budget`}
      title="가계부"
      note="통화별 합계 헤더, 일차별/카테고리별 토글. 단일 주체 모델 — 분담 없음. 일차가 삭제된 비용은 '미지정' 그룹 (§4.1). 빈 상태 E04."
      to={[[`/trip/${id}/expense/new`, '비용 추가  →  S18']]}
    />
  );
}
