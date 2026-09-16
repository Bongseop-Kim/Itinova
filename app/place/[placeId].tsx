import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import DayPickerSheet from '../../components/DayPickerSheet';
import PlaceMap from '../../components/PlaceMap';
import { Badge, Chip, ChipRow, Icon, ListRow, ScreenHeader, SectionHeader, type IconName } from '../../components/ui';
import { db } from '../../db';
import { savePlaces, unsavePlace, updateCustomPlaceLocation } from '../../db/places';
import { places, savedPlaces, trips } from '../../db/schema';
import { categoryLabel } from '../../lib/category';
import type { LatLng } from '../../lib/geo';
import { directionsUrl, validCoord } from '../../lib/map';
import { useDbQuery } from '../../lib/useDbQuery';
import { colors, mapStyle, rounded, spacing, type as t } from '../../theme';

// S20 장소 상세. 템플릿 "지도-상세페이지": 헤더 이미지 → 이름+카테고리 → 아이콘 액션 4열 → 정보 행 → 지도.
export default function PlaceDetail() {
  const router = useRouter();
  const { placeId, tripId } = useLocalSearchParams<{ placeId: string; tripId?: string }>();
  const place = useDbQuery(() => db.select().from(places).where(eq(places.id, placeId)), [places], [placeId])?.[0];
  const trip = useDbQuery(() => db.select().from(trips).where(eq(trips.id, tripId ?? '')), [trips], [tripId])?.[0];
  const saved = useDbQuery(() => db.select().from(savedPlaces).where(eq(savedPlaces.tripId, tripId ?? '')), [savedPlaces], [tripId]);
  const [draft, setDraft] = useState<LatLng | null>(null);
  const [adding, setAdding] = useState(false);
  if (!place) return <View style={s.screen}><ScreenHeader /><Text style={[s.title, s.gutter]}>장소를 찾을 수 없어요</Text></View>;
  const coord = draft ?? (validCoord(place.lat, place.lng) ? { lat: place.lat!, lng: place.lng! } : null);
  const isSaved = saved?.some((p) => p.placeId === place.id);
  const write = (run: () => void) => { try { run(); } catch { Alert.alert('저장하지 못했어요', '다시 시도해 주세요.'); } };
  const directions = () => Linking.openURL(directionsUrl(place)).catch(() => Alert.alert('길찾기를 열 수 없어요', '네트워크 연결을 확인해 주세요.'));
  return (
    <View style={s.screen}>
      <ScreenHeader />
      <ScrollView contentContainerStyle={s.content}>
        {place.photoUrl ? (
          <Image source={{ uri: place.photoUrl }} style={s.photo} accessibilityLabel={`${place.name} 사진`} />
        ) : (
          // 사진이 없는 게 기본이다 (Apple 검색). 플랜 11의 카테고리 클레이가 이 자리에 온다.
          <View style={s.figure}><Icon name={`cat-${place.category ?? 'etc'}` as IconName} size={48} color={colors.muted} /></View>
        )}
        <View style={[s.gutter, s.head]}>
          <Text style={s.title}>{place.name}</Text>
          <View style={s.meta}>
            <Badge label={categoryLabel(place.category)} />
            {place.region ? <Text style={s.body}>{place.region}</Text> : null}
            {place.rating != null ? <Text style={s.body}>평점 {place.rating} · 리뷰 {place.ratingCount ?? 0}개</Text> : null}
          </View>
        </View>

        <View style={s.actions}>
          {trip ? <Action icon="calendar" label="일정에 추가" onPress={() => setAdding(true)} /> : null}
          {trip ? <Action icon={isSaved ? 'bookmark-filled' : 'bookmark'} label={isSaved ? '저장됨' : '저장'} onPress={() => write(() => isSaved ? unsavePlace(trip.id, place.id) : savePlaces(trip.id, [place.id]))} /> : null}
          <Action icon="route" label="길찾기" onPress={directions} />
          <Action icon="map" label="지도 앱" onPress={directions} />
        </View>

        {place.summary ? <Text style={[s.summary, s.gutter]}>{place.summary}</Text> : null}
        {place.address ? <ListRow title={place.address} leading="location" /> : null}
        {place.openingHours?.length ? <ListRow title={place.openingHours[0]} subtitle={place.openingHours.slice(1).join(' · ') || undefined} leading="clock" /> : null}
        {place.applePlaceId ? <ListRow title="장소 정보: Apple 지도" subtitle="이름 · 주소 · 좌표 · 분류" leading="info" /> : null}

        <SectionHeader title="위치" />
        <View style={[s.map, s.gutter]}>
          <View style={s.mapInner}>
            <PlaceMap pins={coord ? [{ id: place.id, title: place.name, order: 1, coord }] : []}
              center={trip?.lat != null && trip.lng != null ? { lat: trip.lat, lng: trip.lng } : null}
              selectedIds={draft ? [place.id] : []} onPick={place.isCustom ? setDraft : undefined} />
          </View>
        </View>
        {place.isCustom && <Text style={[s.body, s.gutter]}>지도를 눌러 이 장소의 위치를 {coord ? '수정' : '등록'}할 수 있어요.</Text>}
        {!coord && <Text style={[s.body, s.gutter]}>등록된 위치가 없어요. 길찾기는 장소명으로 검색해요.</Text>}
        {draft && <View style={s.gutter}><ChipRow>
          <Chip label="위치 저장" leadingIcon="check" selected onPress={() => write(() => { updateCustomPlaceLocation(place.id, draft); setDraft(null); })} />
          <Chip label="취소" onPress={() => setDraft(null)} />
        </ChipRow></View>}
        {trip && adding && <DayPickerSheet tripId={trip.id} placeId={place.id} name={place.name} onClose={() => setAdding(false)} />}
      </ScrollView>
    </View>
  );
}

/** 템플릿 상세의 아이콘 액션 열 (전화·문의·찜·공유 자리). 56dp 세로 아이콘 + 라벨. */
function Action({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [s.action, pressed && s.actionPressed]} accessibilityRole="button" accessibilityLabel={label} onPress={onPress}>
      <Icon name={icon} />
      <Text style={s.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas }, content: { paddingBottom: spacing.xxl },
  gutter: { paddingHorizontal: spacing.gutter },
  photo: { height: mapStyle.collapsedHeight, marginHorizontal: spacing.gutter, borderRadius: rounded.lg },
  figure: { height: mapStyle.collapsedHeight, marginHorizontal: spacing.gutter, borderRadius: rounded.lg, backgroundColor: colors.surfaceCard, alignItems: 'center', justifyContent: 'center' },
  head: { paddingTop: spacing.md, gap: spacing.xs },
  title: { ...t.displayMd, color: colors.ink },
  meta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.xs },
  body: { ...t.bodySm, color: colors.muted },
  summary: { ...t.bodyMd, color: colors.body, paddingBottom: spacing.xs },
  actions: { flexDirection: 'row', paddingHorizontal: spacing.gutter, paddingVertical: spacing.md, gap: spacing.xs },
  action: { flex: 1, minHeight: 56, borderRadius: rounded.md, alignItems: 'center', justifyContent: 'center', gap: spacing.xxs, paddingVertical: spacing.xs },
  actionPressed: { backgroundColor: colors.surfaceCard },
  actionLabel: { ...t.caption, color: colors.ink },
  map: { paddingTop: spacing.xxs },
  mapInner: { height: mapStyle.expandedHeight, borderRadius: rounded.lg, overflow: 'hidden' },
});
