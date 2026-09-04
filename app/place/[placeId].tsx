import { useLocalSearchParams } from 'expo-router';

import Screen from '../../components/Screen';

export default function PlaceDetail() {
  const { placeId } = useLocalSearchParams<{ placeId: string }>();
  return (
    <Screen
      id={`S20  ·  /place/${placeId}`}
      title="장소 상세"
      note="사진, 평점·리뷰 수, 카테고리·지역, 소개, 주소·전화·영업시간, 미니맵. 저장 / 일정에 추가(BS3) / 길찾기(외부 앱)."
    />
  );
}
