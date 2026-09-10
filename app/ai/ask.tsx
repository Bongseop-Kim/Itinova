import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { BottomCtaBar, ScreenHeader } from '../../components/ui';
import { colors, spacing, type as t } from '../../theme';

export default function AiAsk() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <ScreenHeader title="AI 일정 추천" action="뒤로" onAction={() => router.back()} />
      <Text style={{ ...t.bodyMd, color: colors.muted, padding: spacing.gutter, flex: 1 }}>
        AI 일정 추천은 준비 중이에요.
      </Text>
      <BottomCtaBar label="직접 일정 만들기" onPress={() => router.navigate('/create/destination')} />
    </View>
  );
}
