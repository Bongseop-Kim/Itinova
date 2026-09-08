import Screen from '../../../components/Screen';
import { useTripId } from '../../../lib/useTripId';

export default function Chat() {
  const id = useTripId();
  return (
    <Screen
      id={`S19  ·  /trip/${id}/chat`}
      title="AI 채팅"
      note="여행 컨텍스트 배지, 추천 질문 칩(일정 상태에 따라 정적 분기), 직전 8턴만 전송. 응답 내 장소 카드 → 일정에 담기(BS3). 하단 정확성 고지 상시."
    />
  );
}
