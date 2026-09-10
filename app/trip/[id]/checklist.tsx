import { useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';

import { ScreenHeader } from '../../../components/ui';
import {
  addChecklistItem,
  checklistQuery,
  removeChecklistItem,
  toggleChecklistItem,
} from '../../../db/checklist';
import { checklistItems } from '../../../db/schema';
import { checklistSections } from '../../../db/templates';
import { useDbQuery } from '../../../lib/useDbQuery';
import { useTripId } from '../../../lib/useTripId';
import { colors, rounded, sizing, spacing, type as t } from '../../../theme';

export default function Checklist() {
  const id = useTripId();
  const rows = useDbQuery(() => checklistQuery(id), [checklistItems], [id]);

  const sections = checklistSections(rows ?? []);

  const done = (rows ?? []).filter((r) => r.done).length;
  const total = rows?.length ?? 0;

  return (
    <View style={s.screen}>
      <ScreenHeader title="체크리스트" />
      <Text style={s.progress}>
        {total ? `${done} / ${total} 완료` : '항목이 없어요'}
      </Text>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => <Text style={s.category}>{section.title}</Text>}
        renderItem={({ item }) => (
          <View style={s.row}>
            <Pressable
              onPress={() => toggleChecklistItem(item.id, !item.done)}
              hitSlop={10}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: item.done }}
              style={[s.checkbox, item.done && s.checkboxOn]}
            />
            <Text style={[s.label, item.done && s.labelDone]}>{item.label}</Text>
            <Pressable
              onPress={() => removeChecklistItem(item.id)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={`${item.label} 삭제`}
            >
              <Text style={s.remove}>삭제</Text>
            </Pressable>
          </View>
        )}
        renderSectionFooter={({ section }) => (
          <AddRow onSubmit={(label) => addChecklistItem(id, section.title, label)} />
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
  list: { paddingHorizontal: spacing.gutter, paddingBottom: spacing.xxl },

  category: { ...t.titleMd, color: colors.ink, paddingTop: spacing.lg, paddingBottom: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: sizing.touchMin,
    paddingVertical: spacing.xs,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: rounded.xs,
    borderWidth: 1.5,
    borderColor: colors.hairline,
  },
  checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { ...t.bodyMd, color: colors.ink, flexGrow: 1, flexShrink: 1 },
  labelDone: { color: colors.mutedSoft, textDecorationLine: 'line-through' },
  remove: { ...t.caption, color: colors.muted },

  addRow: { paddingTop: spacing.xs },
  addInput: {
    ...t.bodyMd,
    color: colors.ink,
    minHeight: sizing.touchMin,
    paddingHorizontal: spacing.xs,
  },
});
