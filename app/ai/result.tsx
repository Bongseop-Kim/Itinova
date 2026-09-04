import Screen from '../../components/Screen';

export default function AiResult() {
  return (
    <Screen
      id="S08  ·  /ai/result"
      title="생성 결과 미리보기"
      note="일차별 초안, 장소별 제외, 다시 생성, 생성 근거 1줄, 정확성 고지. 저장 시점에만 DB 적재(트랜잭션). 첫 진입 코치마크 C05."
      to={[['/trip/1/itinerary', '내 여행으로 저장  →  S10']]}
    />
  );
}
