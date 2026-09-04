import { useLocalSearchParams } from 'expo-router';

import Screen from '../../../../components/Screen';

export default function NewExpense() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen
      id={`S18  ·  /trip/${id}/expense/new`}
      title="비용 입력"
      note="통화, 금액, 일차, 결제수단, 항목명, 카테고리, (선택) 연결 장소. split_with 은 스키마에만 존재하고 노출하지 않는다."
      to={[[`/trip/${id}/budget`, '저장  →  S17']]}
    />
  );
}
