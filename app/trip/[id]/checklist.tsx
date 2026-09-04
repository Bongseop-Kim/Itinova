import { useLocalSearchParams } from 'expo-router';

import Screen from '../../../components/Screen';

export default function Checklist() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen
      id={`S16  ·  /trip/${id}/checklist`}
      title="체크리스트"
      note="카테고리 섹션(필수 준비물 · 기본 짐싸기). 여행 생성 시 기본 템플릿 시드. 완료 토글, 항목 추가, 더보기 메뉴."
    />
  );
}
