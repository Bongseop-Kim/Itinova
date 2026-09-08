import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { BottomCtaBar, Chip, ScreenHeader, SegmentTabs } from '../../../components/ui';
import { addPlacesToDay, createCustomPlace, savePlaces, savedPlacesQuery } from '../../../db/places';
import { places as placesTable, savedPlaces } from '../../../db/schema';
import { CATEGORY_LABEL, categoryLabel, type Category } from '../../../lib/category';
import { useDbQuery } from '../../../lib/useDbQuery';
import { useTripId } from '../../../lib/useTripId';
import { colors, rounded, sizing, spacing, type as t } from '../../../theme';

const SOURCES = ['최근 저장', '나만의 장소'] as const;
const CATEGORIES = Object.keys(CATEGORY_LABEL) as Category[];

export default function AddPlace() {
  const id = useTripId();
  const router = useRouter();
  const { day } = useLocalSearchParams<{ day?: string }>();
  const dayIndex = day ? Number(day) : undefined;

  const [source, setSource] = useState<(typeof SOURCES)[number]>('최근 저장');
  const [selected, setSelected] = useState<string[]>([]);

  const saved = useDbQuery(() => savedPlacesQuery(id), [savedPlaces, placesTable], [id]);

  const toggle = (placeId: string) =>
    setSelected((cur) => (cur.includes(placeId) ? cur.filter((x) => x !== placeId) : [...cur, placeId]));

  const confirm = () => {
    if (dayIndex) addPlacesToDay(id, dayIndex, selected);
    else savePlaces(id, selected);
    router.back();
  };

  return (
    <View style={s.screen}>
      <ScreenHeader title={dayIndex ? `day ${dayIndex}에 담기` : '저장함에 담기'} />

      {/* Places 검색과 지도 핀 선택은 API 키가 붙은 뒤에 열린다 (design.md §6) */}
      <View style={s.searchDisabled}>
        <Text style={s.searchLabel}>장소 검색은 준비 중이에요</Text>
      </View>

      <SegmentTabs options={SOURCES} value={source} onChange={setSource} />

      {source === '최근 저장' ? (
        <FlatList
          data={saved ?? []}
          keyExtractor={(p) => p.placeId}
          contentContainerStyle={s.list}
          ListEmptyComponent={
            <View style={s.empty}>
              <View style={s.emptyFigure} />
              <Text style={s.emptyTitle}>저장한 장소가 없어요</Text>
              <Text style={s.emptyBody}>나만의 장소 탭에서 직접 추가할 수 있어요</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => toggle(item.placeId)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected.includes(item.placeId) }}
              style={s.row}
            >
              <View style={s.rowBody}>
                <Text style={s.rowTitle}>{item.name}</Text>
                <Text style={s.rowMeta}>
                  {[categoryLabel(item.category), item.region].filter(Boolean).join(' · ')}
                </Text>
              </View>
              <Text style={[s.pick, selected.includes(item.placeId) && s.pickOn]}>
                {selected.includes(item.placeId) ? '선택됨' : '선택'}
              </Text>
            </Pressable>
          )}
        />
      ) : (
        <CustomPlaceForm
          onCreate={(placeId) => {
            setSelected((cur) => [...cur, placeId]);
            setSource('최근 저장');
            savePlaces(id, [placeId]); // 만든 장소는 보관함에도 남긴다
          }}
        />
      )}

      <BottomCtaBar
        label={
          dayIndex
            ? `day ${dayIndex} 일정에 ${selected.length}개 담기`
            : `저장함에 ${selected.length}개 담기`
        }
        disabled={!selected.length}
        onPress={confirm}
      />
    </View>
  );
}

function CustomPlaceForm({ onCreate }: { onCreate: (placeId: string) => void }) {
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [category, setCategory] = useState<Category>('attraction');

  const submit = () => {
    if (!name.trim()) return;
    onCreate(createCustomPlace({ name, category, region }));
    setName('');
    setRegion('');
  };

  return (
    <View style={s.form}>
      <TextInput
        style={s.input}
        value={name}
        onChangeText={setName}
        placeholder="장소 이름"
        placeholderTextColor={colors.mutedSoft}
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      <TextInput
        style={s.input}
        value={region}
        onChangeText={setRegion}
        placeholder="지역 (선택)"
        placeholderTextColor={colors.mutedSoft}
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      <View style={s.chips}>
        {CATEGORIES.map((c) => (
          <Chip
            key={c}
            label={CATEGORY_LABEL[c]}
            selected={category === c}
            onPress={() => setCategory(c)}
          />
        ))}
      </View>
      <Pressable
        onPress={submit}
        disabled={!name.trim()}
        accessibilityRole="button"
        style={[s.add, !name.trim() && s.addDisabled]}
      >
        <Text style={[s.addLabel, !name.trim() && s.addLabelDisabled]}>장소 만들기</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  searchDisabled: {
    marginHorizontal: spacing.gutter,
    marginBottom: spacing.sm,
    minHeight: sizing.controlH,
    borderRadius: rounded.pill,
    backgroundColor: colors.surfaceCard,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  searchLabel: { ...t.bodyMd, color: colors.mutedSoft },

  list: { paddingHorizontal: spacing.gutter, paddingTop: spacing.sm, paddingBottom: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: sizing.touchMin,
    paddingVertical: spacing.sm,
    borderBottomWidth: sizing.hairline,
    borderBottomColor: colors.hairlineSoft,
  },
  rowBody: { flexGrow: 1, flexShrink: 1 },
  rowTitle: { ...t.titleSm, color: colors.ink },
  rowMeta: { ...t.caption, color: colors.muted },
  pick: {
    ...t.caption,
    color: colors.muted,
    borderWidth: sizing.hairline,
    borderColor: colors.hairline,
    borderRadius: rounded.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    overflow: 'hidden',
  },
  pickOn: { backgroundColor: colors.primary, borderColor: colors.primary, color: colors.onPrimary },

  empty: { alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingTop: spacing.xxl },
  emptyFigure: {
    width: 160,
    height: 160,
    borderRadius: rounded.xl,
    backgroundColor: colors.surfaceCard,
    marginBottom: spacing.xs,
  },
  emptyTitle: { ...t.titleMd, color: colors.ink },
  emptyBody: { ...t.bodySm, color: colors.muted, textAlign: 'center' },

  form: { flex: 1, paddingHorizontal: spacing.gutter, paddingTop: spacing.md, gap: spacing.sm },
  input: {
    ...t.bodyMd,
    color: colors.ink,
    minHeight: sizing.controlH,
    borderRadius: rounded.md,
    borderWidth: sizing.hairline,
    borderColor: colors.hairline,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.canvas,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  add: {
    minHeight: sizing.controlH,
    borderRadius: rounded.md,
    borderWidth: sizing.hairline,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  addDisabled: { borderColor: colors.hairlineSoft },
  addLabel: { ...t.button, color: colors.ink },
  addLabelDisabled: { color: colors.mutedSoft },
});
