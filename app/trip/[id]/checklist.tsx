import { useEffect, useState } from 'react';
import { AccessibilityInfo, Alert, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';

import { Checkbox, IconButton, ScreenHeader, SectionHeader } from '../../../components/ui';
import {
  addChecklistItem,
  checklistQuery,
  deleteCategory,
  renameCategory,
  renameChecklistItem,
  reorderChecklistItems,
  removeChecklistItem,
  toggleChecklistItem,
} from '../../../db/checklist';
import { checklistItems } from '../../../db/schema';
import { CHECKLIST_TEMPLATE, checklistSections } from '../../../db/templates';
import { moveItem } from '../../../lib/reorder';
import { useDbQuery } from '../../../lib/useDbQuery';
import { useTripId } from '../../../lib/useTripId';
import { colors, sizing, spacing, type as t } from '../../../theme';

export default function Checklist() {
  const id = useTripId();
  const rows = useDbQuery(() => checklistQuery(id), [checklistItems], [id]);

  const [emptyCategories, setEmptyCategories] = useState<string[]>([]);
  const [screenReader, setScreenReader] = useState(false);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isScreenReaderEnabled().then((enabled) => { if (active) setScreenReader(enabled); });
    const subscription = AccessibilityInfo.addEventListener('screenReaderChanged', setScreenReader);
    return () => { active = false; subscription.remove(); };
  }, []);
  const sections = checklistSections(rows ?? []);
  emptyCategories.forEach((title) => {
    if (!sections.some((section) => section.title === title)) sections.push({ title, data: [] });
  });

  const addCategory = () => Alert.prompt('카테고리 추가', '카테고리 이름을 입력해 주세요', (value) => {
    const title = value.trim();
    if (title && !sections.some((section) => section.title === title)) {
      setEmptyCategories((current) => [...current, title]);
    }
  });
  const categoryMenu = (title: string, count: number) => Alert.alert(title, undefined, [
    { text: '이름 변경', onPress: () => Alert.prompt('카테고리 이름 변경', '기존 이름을 입력하면 항목이 합쳐져요', (value) => {
      const next = value.trim();
      if (!next || next === title) return;
      renameCategory(id, title, next);
      setEmptyCategories((current) => [...new Set([...current.filter((name) => name !== title), ...(count === 0 && !sections.some((section) => section.title === next) ? [next] : [])])]);
    }, 'plain-text', title) },
    { text: '삭제', style: 'destructive', onPress: () => Alert.alert('카테고리 삭제',
      CHECKLIST_TEMPLATE.some(([name]) => name === title)
        ? `항목 ${count}개가 삭제됩니다. 기본 카테고리는 빈 상태로 남아요`
        : `항목 ${count}개가 함께 삭제됩니다`, [
          { text: '취소', style: 'cancel' },
          { text: '삭제', style: 'destructive', onPress: () => {
            deleteCategory(id, title);
            setEmptyCategories((current) => current.filter((name) => name !== title));
          } },
        ]) },
    { text: '취소', style: 'cancel' },
  ]);

  const done = (rows ?? []).filter((r) => r.done).length;
  const total = rows?.length ?? 0;

  return (
    <View style={s.screen}>
      <ScreenHeader title="체크리스트" actions={[{ icon: 'plus', label: '카테고리 추가', onPress: addCategory }]} />
      <Text style={s.progress}>
        {total ? `${done} / ${total} 완료` : '항목이 없어요'}
      </Text>

      <SectionList
        sections={sections.map((section) => ({ ...section, key: section.title }))}
        extraData={screenReader}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <SectionHeader
            title={section.title}
            actionIcon="more"
            action={`${section.title} 카테고리 더보기`}
            onAction={() => categoryMenu(section.title, section.data.length)}
          />
        )}
        renderItem={({ item, index, section }) => (
          <View style={s.row}>
            <Checkbox checked={item.done} label={item.label} onPress={() => toggleChecklistItem(item.id, !item.done)} />
            <Text style={[s.label, item.done && s.labelDone]}>{item.label}</Text>
            <IconButton
              icon="more"
              color={colors.muted}
              label={`${item.label} 더보기`}
              onPress={() => Alert.alert(item.label, undefined, [
                { text: '이름 변경', onPress: () => Alert.prompt('항목 이름 변경', undefined,
                  (value) => renameChecklistItem(item.id, value), 'plain-text', item.label) },
                ...(screenReader ? [
                  ...(index > 0 ? [{ text: '위로', onPress: () => reorderChecklistItems(moveItem(section.data, index, index - 1).map((row) => row.id)) }] : []),
                  ...(index < section.data.length - 1 ? [{ text: '아래로', onPress: () => reorderChecklistItems(moveItem(section.data, index, index + 1).map((row) => row.id)) }] : []),
                ] : []),
                { text: '삭제', style: 'destructive', onPress: () => removeChecklistItem(item.id) },
                { text: '취소', style: 'cancel' },
              ])}
            />
          </View>
        )}
        renderSectionFooter={({ section }) => (
          <AddRow key={section.title} onSubmit={(label) => {
            addChecklistItem(id, section.title, label);
            setEmptyCategories((current) => current.filter((name) => name !== section.title));
          }} />
        )}
      />
    </View>
  );
}

function AddRow({ onSubmit }: { onSubmit: (label: string) => void }) {
  const [value, setValue] = useState('');
  const submit = () => {
    if (!value.trim()) return;
    onSubmit(value);
    setValue('');
  };
  return (
    <View style={s.addRow}>
      <TextInput
        style={s.addInput}
        value={value}
        onChangeText={setValue}
        placeholder="항목 추가"
        placeholderTextColor={colors.mutedSoft}
        returnKeyType="done"
        onSubmitEditing={submit}
      />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  progress: { ...t.caption, color: colors.muted, paddingHorizontal: spacing.gutter },
  list: { paddingBottom: spacing.xxl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: sizing.touchMin,
    paddingVertical: spacing.xxs,
    paddingLeft: spacing.gutter,
    paddingRight: spacing.xs,
  },
  label: { ...t.bodyMd, color: colors.ink, flexGrow: 1, flexShrink: 1 },
  labelDone: { color: colors.mutedSoft, textDecorationLine: 'line-through' },
  addRow: { paddingTop: spacing.xxs, paddingHorizontal: spacing.gutter },
  addInput: { ...t.bodyMd, color: colors.ink, minHeight: sizing.touchMin, paddingLeft: 24 + spacing.sm },
});
