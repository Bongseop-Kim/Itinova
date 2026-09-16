import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { ScreenHeader } from '../../../components/ui';
import { colors, spacing, type as t } from '../../../theme';

export default function Chat() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <ScreenHeader title="AI 채팅" />
      <Text style={{ ...t.bodyMd, color: colors.muted, padding: spacing.gutter }}>
        AI 채팅은 준비 중이에요.
      </Text>
    </View>
  );
}
