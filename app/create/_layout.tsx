import { Stack } from 'expo-router';

import { colors } from '../../theme';

// design.md §2.2 — 여행 생성은 모달 스택. 모달 표시(transparentModal)는 루트에서 지정한다.
export default function CreateLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.canvas },
      }}
    >
      {/* S03 만 시트 형태라 배경이 비쳐야 한다 */}
      <Stack.Screen name="index" options={{ contentStyle: { backgroundColor: 'transparent' } }} />
    </Stack>
  );
}
