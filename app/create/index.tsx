import Screen from '../../components/Screen';

export default function CreateMethod() {
  return (
    <Screen
      id="S03  ·  /create  ·  modal"
      title="생성 방식"
      note="바텀시트 2행 (BS2와 같은 형태)."
      to={[
        ['/create/destination', '직접 일정 만들기  →  S04'],
        ['/ai/ask', 'AI 일정 추천받기  →  S07'],
      ]}
    />
  );
}
