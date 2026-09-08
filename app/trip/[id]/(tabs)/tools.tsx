import Screen from '../../../../components/Screen';
import { useTripId } from '../../../../lib/useTripId';

export default function Tools() {
  const id = useTripId();
  return (
    <Screen
      id={`S12  ·  /trip/${id}/tools`}
      title="여행 도구"
      note="날씨(여행 날짜 기준 일별) · 시차 · 환율(기준 시각 필수) · 번역. 날씨·환율 API 미선정 (§6)."
    />
  );
}
