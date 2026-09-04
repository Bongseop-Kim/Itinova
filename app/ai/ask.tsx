import Screen from '../../components/Screen';

export default function AiAsk() {
  return (
    <Screen
      id="S07  ·  /ai/ask"
      title="AI 질문 5단계"
      note="단일 화면 + step 상태. ① 도시 ② 기간 ③ 동행(복수) ④ 스타일(복수) ⑤ 밀도."
      to={[['/ai/result', '5단계 완료  ·  생성  →  S08']]}
    />
  );
}
