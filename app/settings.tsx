import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, ListGroup, ListRow, ScreenHeader, TextField } from '../components/ui';
import { exportAllJson, importTrips } from '../db/backup';
import { appSettings } from '../db/schema';
import { DATE_FORMAT, setSetting, settingsQuery } from '../db/settings';
import { parseBackup } from '../lib/backup';
import { useDbQuery } from '../lib/useDbQuery';
import { colors, rounded, sizing, spacing, type as t } from '../theme';

export default function AppSettings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [importing, setImporting] = useState(false);
  const [text, setText] = useState('');
  const settings = useDbQuery(settingsQuery, [appSettings], []);
  const dateFormat = settings?.find((row) => row.key === DATE_FORMAT)?.value === 'md' ? 'md' : 'ymd';

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

  const check = <Icon name="check" size={sizing.iconMd} />;

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="앱 설정" largeTitle />
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl + insets.bottom }} keyboardShouldPersistTaps="handled">
        <ListGroup title="데이터">
          <ListRow title="전체 데이터 내보내기" subtitle="JSON" leading="share" trailing="chevron" onPress={exportAll} />
          <ListRow
            title="데이터 가져오기"
            subtitle="내보내기로 만든 JSON 붙여넣기"
            leading="plus"
            trailing={<Icon name={importing ? 'chevron-up' : 'chevron-down'} size={sizing.iconMd} color={colors.mutedSoft} />}
            onPress={() => setImporting((v) => !v)}
          />
          <Text style={s.meta}>여행 데이터는 이 기기에만 있습니다. 내보내기가 유일한 백업·기기 이전 수단이에요.</Text>
        </ListGroup>

        {importing ? (
          <View style={s.importer}>
            <TextField
              value={text}
              onChangeText={setText}
              placeholder="내보내기로 만든 JSON 을 붙여넣어 주세요"
              helper="이미 있는 여행과 겹치면 덮어쓰지 않고 새 여행으로 추가합니다."
              multiline
              autoCapitalize="none"
              autoCorrect={false}
              inputStyle={s.textarea}
            />
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

        <ListGroup title="날짜 형식">
          <ListRow title="YYYY.M.D" subtitle="2026.9.16" trailing={dateFormat === 'ymd' ? check : undefined} onPress={() => setSetting(DATE_FORMAT, 'ymd')} />
          <ListRow title="M/D" subtitle="9/16" trailing={dateFormat === 'md' ? check : undefined} onPress={() => setSetting(DATE_FORMAT, 'md')} />
        </ListGroup>

        <ListGroup title="표시">
          <ListRow title="언어" trailing="한국어" />
        </ListGroup>

        <ListGroup title="앱 정보">
          <ListRow title="버전" trailing={Constants.expoConfig?.version ?? '—'} />
        </ListGroup>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  meta: { ...t.caption, color: colors.muted, paddingHorizontal: spacing.gutter, paddingTop: spacing.xxs },
  importer: { paddingHorizontal: spacing.gutter, paddingTop: spacing.sm, gap: spacing.sm },
  // 붙여넣은 백업이 길면 입력칸이 무한정 늘어나 버튼이 화면 밖으로 밀린다. 안에서 스크롤시킨다.
  textarea: { ...t.bodySm, minHeight: 160, maxHeight: 200 },
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
});
