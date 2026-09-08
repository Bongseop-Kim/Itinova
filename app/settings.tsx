import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '../components/ui';
import { exportAllJson, importTrips } from '../db/backup';
import { parseBackup } from '../lib/backup';
import { colors, rounded, sizing, spacing, type as t } from '../theme';

export default function AppSettings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [importing, setImporting] = useState(false);
  const [text, setText] = useState('');

  const exportAll = async () => {
    const json = exportAllJson();
    // ponytail: RN 내장 Share. expo-sharing / file-system 을 붙이지 않는다.
    await Share.share({ message: json, title: 'itinova-backup.json' });
  };

  const runImport = () => {
    const parsed = parseBackup(text);
    if ('error' in parsed) {
      Alert.alert('가져올 수 없어요', parsed.error);
      return;
    }
    try {
      const { imported, remapped } = importTrips(parsed.backup.trips);
      setText('');
      setImporting(false);
      Alert.alert(
        '가져왔어요',
        remapped
          ? `여행 ${imported}건을 가져왔어요. 그중 ${remapped}건은 이미 있는 여행과 겹쳐 새 여행으로 추가했습니다.`
          : `여행 ${imported}건을 가져왔어요.`,
        [{ text: '확인', onPress: () => router.back() }],
      );
    } catch {
      // 기술 오류를 그대로 노출하지 않는다 (design-system §로딩·빈·에러)
      Alert.alert('가져오지 못했어요', '백업 내용이 손상됐을 수 있어요. 다시 시도해 주세요.');
    }
  };

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="앱 설정" />
      <ScrollView
        contentContainerStyle={[s.content, { paddingBottom: spacing.xxl + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
      >
        <Field label="데이터">
          <Pressable onPress={exportAll} accessibilityRole="button" style={s.row}>
            <Text style={s.rowValue}>전체 데이터 내보내기</Text>
            <Text style={s.rowAction}>JSON</Text>
          </Pressable>
          <Pressable
            onPress={() => setImporting((v) => !v)}
            accessibilityRole="button"
            style={s.row}
          >
            <Text style={s.rowValue}>데이터 가져오기</Text>
            <Text style={s.rowAction}>{importing ? '접기' : 'JSON'}</Text>
          </Pressable>
          <Text style={s.meta}>
            여행 데이터는 이 기기에만 있습니다. 내보내기가 유일한 백업·기기 이전 수단이에요.
          </Text>
        </Field>

        {importing ? (
          <View style={s.importer}>
            <TextInput
              style={s.textarea}
              value={text}
              onChangeText={setText}
              placeholder="내보내기로 만든 JSON 을 붙여넣어 주세요"
              placeholderTextColor={colors.mutedSoft}
              multiline
              textAlignVertical="top"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={s.meta}>
              이미 있는 여행과 겹치면 덮어쓰지 않고 새 여행으로 추가합니다.
            </Text>
            <Pressable
              onPress={runImport}
              disabled={!text.trim()}
              accessibilityRole="button"
              style={[s.cta, !text.trim() && s.ctaOff]}
            >
              <Text style={[s.ctaLabel, !text.trim() && s.ctaLabelOff]}>가져오기</Text>
            </Pressable>
          </View>
        ) : null}

        <Field label="앱 정보">
          <View style={s.row}>
            <Text style={s.rowValue}>버전</Text>
            <Text style={s.rowAction}>{Constants.expoConfig?.version ?? '—'}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.rowValue}>언어</Text>
            <Text style={s.rowAction}>한국어</Text>
          </View>
        </Field>

        {/*
          아직 넣지 않은 것과 이유 (design.md §2.1 대비):
          · 날짜·거리 형식 — 화면 전체에 배선이 필요한데 지금은 한 가지 표기만 쓴다
          · 기본 통화 — 여행 생성 시 도시에서 정해진다. 전역 기본값이 필요해지면 그때
          · 위치 권한 — 위치를 쓰는 기능이 아직 없다 (지도·Places 대기)
          · 알림 — 알림 기능이 없다
        */}
        <Text style={s.note}>
          날짜 형식 · 기본 통화 · 위치 권한 · 알림 설정은 해당 기능이 붙은 뒤에 열립니다.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: spacing.gutter },

  field: { paddingTop: spacing.lg, gap: spacing.xxs },
  fieldLabel: { ...t.captionUpper, color: colors.muted, paddingBottom: spacing.xxs },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: sizing.touchMin, gap: spacing.sm },
  rowValue: { ...t.bodyMd, color: colors.ink, flexGrow: 1 },
  rowAction: { ...t.button, color: colors.muted },
  meta: { ...t.caption, color: colors.muted, paddingTop: spacing.xxs },

  importer: { paddingTop: spacing.sm, gap: spacing.xs },
  textarea: {
    ...t.bodySm,
    color: colors.ink,
    // 붙여넣은 백업이 길면 입력칸이 무한정 늘어나 버튼이 화면 밖으로 밀린다. 안에서 스크롤시킨다.
    minHeight: 160,
    maxHeight: 200,
    borderRadius: rounded.md,
    borderWidth: sizing.hairline,
    borderColor: colors.hairline,
    padding: spacing.sm,
  },
  cta: {
    minHeight: sizing.controlH,
    borderRadius: rounded.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaOff: { backgroundColor: colors.primaryDisabled },
  ctaLabel: { ...t.button, color: colors.onPrimary },
  ctaLabelOff: { color: colors.muted },

  note: { ...t.caption, color: colors.muted, paddingTop: spacing.section },
});
