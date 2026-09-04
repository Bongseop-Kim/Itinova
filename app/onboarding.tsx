import Screen from '../components/Screen';

export default function Onboarding() {
  return (
    <Screen
      id="S22  ·  /onboarding"
      title="온보딩 (3 step)"
      note="단일 화면 + step 상태. ① 가치 제안 캐러셀 ② 로컬 데이터 고지 ③ 위치 권한 사전 안내. 건너뛰기 없음. 완료 시 app_settings.onboarded = '1'."
      to={[['/', '완료 / 나중에 하기  →  S01']]}
    />
  );
}
