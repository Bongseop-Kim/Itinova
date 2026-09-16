import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, elevation, rounded, spacing, type as t } from '../../theme';
import { IconButton } from './IconButton';

/**
 * 바텀시트 (design-system bottom-sheet). scrim + 상단 24 라운드 + 36×4 핸들 + 제목/닫기. paddingBottom 에 bottom inset.
 * 세 시트(생성 방식·일차 선택·퀵 액션)가 같은 껍데기를 쓴다.
 */
export function BottomSheet({
  visible = true,
  onClose,
  title,
  closeLabel = '닫기',
  scroll = true,
  /** false 면 Modal 래퍼 없이 그린다 — 라우트 자체가 transparentModal 인 시트(S03). */
  asModal = true,
  children,
}: {
  visible?: boolean;
  onClose: () => void;
  title?: string;
  closeLabel?: string;
  scroll?: boolean;
  asModal?: boolean;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const Body = scroll ? ScrollView : View;
  // 인라인 래퍼 컴포넌트를 만들면 매 렌더마다 자식이 재마운트되어 입력 포커스가 끊긴다. JSX 를 변수로 둔다.
  const body = (
    <KeyboardAvoidingView style={s.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel={closeLabel} />
      <View style={[s.sheet, { paddingBottom: spacing.lg + insets.bottom }]} accessibilityViewIsModal>
        <View style={s.handle} />
        {title ? (
          <View style={s.header}>
            <Text style={s.title} numberOfLines={1}>
              {title}
            </Text>
            <IconButton icon="close" label={closeLabel} onPress={onClose} />
          </View>
        ) : null}
        <Body keyboardShouldPersistTaps="handled" style={s.body}>
          {children}
        </Body>
      </View>
    </KeyboardAvoidingView>
  );
  if (!asModal) return visible ? body : null;
  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="slide">
      {body}
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.scrim },
  sheet: {
    maxHeight: '85%',
    backgroundColor: colors.canvas,
    borderTopLeftRadius: rounded.sheet,
    borderTopRightRadius: rounded.sheet,
    paddingTop: spacing.sm,
    boxShadow: elevation.sheet,
  },
  handle: { width: 36, height: 4, borderRadius: rounded.pill, backgroundColor: colors.hairline, alignSelf: 'center', marginBottom: spacing.xs },
  header: { flexDirection: 'row', alignItems: 'center', paddingLeft: spacing.gutter, paddingRight: spacing.xs },
  title: { ...t.titleLg, color: colors.ink, flex: 1 },
  body: { flexGrow: 0 },
});
