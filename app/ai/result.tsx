import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { BottomCtaBar, ScreenHeader } from '../../components/ui';
import { colors, spacing, type as t } from '../../theme';

export default function AiResult() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <ScreenHeader title="AI 추천 일정" backLabel="홈으로" onBack={() => router.navigate('/')} />
      <Text style={{ ...t.bodyMd, color: colors.muted, padding: spacing.gutter, flex: 1 }}>
        AI 일정 추천은 준비 중이에요.
      </Text>
      <BottomCtaBar label="직접 일정 만들기" onPress={() => router.navigate('/create/destination')} />
    </View>
  );
}
