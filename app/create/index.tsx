import { useRouter } from 'expo-router';

import { ClayFigure } from '../../components/ClayFigure';
import { BottomSheet, ListRow } from '../../components/ui';
import { illustration } from '../../theme';

// S03 = BS2 생성 방식. 라우트 자체가 transparentModal 이라 BottomSheet 를 Modal 없이 쓴다.
export default function CreateMethod() {
  const router = useRouter();
  return (
    <BottomSheet asModal={false} title="어떻게 만들까요?" onClose={() => router.back()} scroll={false}>
      <ListRow
        title="직접 일정 만들기"
        subtitle="도시와 날짜를 고르고 일차별로 채웁니다"
        leading={<ClayFigure name="method-manual" size={illustration.row} />}
        trailing="chevron"
        onPress={() => router.push('/create/destination')}
      />
      <ListRow
        title="AI 일정 추천받기"
        subtitle="다섯 가지만 답하면 초안을 만들어 드려요"
        leading={<ClayFigure name="method-ai" size={illustration.row} />}
        trailing="chevron"
        onPress={() => router.push('/ai/ask')}
      />
    </BottomSheet>
  );
}
