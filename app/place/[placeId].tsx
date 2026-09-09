import { eq } from 'drizzle-orm';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import DayPickerSheet from '../../components/DayPickerSheet';
import PlaceMap from '../../components/PlaceMap';
import { Chip } from '../../components/ui';
import { db } from '../../db';
import { savePlaces, unsavePlace, updateCustomPlaceLocation } from '../../db/places';
import { places, savedPlaces, trips } from '../../db/schema';
import { categoryLabel } from '../../lib/category';
import type { LatLng } from '../../lib/geo';
import { directionsUrl, validCoord } from '../../lib/map';
import { useDbQuery } from '../../lib/useDbQuery';
import { colors, mapStyle, rounded, sizing, spacing, type as t } from '../../theme';

export default function PlaceDetail() {
  const { placeId, tripId } = useLocalSearchParams<{ placeId: string; tripId?: string }>();
  const place = useDbQuery(() => db.select().from(places).where(eq(places.id, placeId)), [places], [placeId])?.[0];
  const trip = useDbQuery(() => db.select().from(trips).where(eq(trips.id, tripId ?? '')), [trips], [tripId])?.[0];
  const saved = useDbQuery(() => db.select().from(savedPlaces).where(eq(savedPlaces.tripId, tripId ?? '')), [savedPlaces], [tripId]);
  const [draft, setDraft] = useState<LatLng | null>(null);
  const [adding, setAdding] = useState(false);
  if (!place) return <View style={s.content}><Text style={s.title}>장소를 찾을 수 없어요</Text></View>;
  const coord = draft ?? (validCoord(place.lat, place.lng) ? { lat: place.lat!, lng: place.lng! } : null);
  const isSaved = saved?.some((p) => p.placeId === place.id);
  const write = (run: () => void) => { try { run(); } catch { Alert.alert('저장하지 못했어요', '다시 시도해 주세요.'); } };
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      {place.photoUrl && <Image source={{ uri: place.photoUrl }} style={s.photo} accessibilityLabel={`${place.name} 사진`} />}
      <Text style={s.title}>{place.name}</Text>
      <Text style={s.body}>{[categoryLabel(place.category), place.region].filter(Boolean).join(' · ')}</Text>
      {place.rating != null && <Text style={s.body}>평점 {place.rating} · 리뷰 {place.ratingCount ?? 0}개</Text>}
      {place.summary && <Text style={s.body}>{place.summary}</Text>}
      {place.address && <Text style={s.body}>{place.address}</Text>}
      {place.applePlaceId && <Text style={s.body}>장소 정보: Apple 지도</Text>}
      {place.openingHours?.map((hours, i) => <Text key={i} style={s.body}>{hours}</Text>)}
      <View style={s.map}><PlaceMap pins={coord ? [{ id: place.id, title: place.name, order: 1, coord }] : []}
        center={trip?.lat != null && trip.lng != null ? { lat: trip.lat, lng: trip.lng } : null}
        selectedIds={draft ? [place.id] : []} onPick={place.isCustom ? setDraft : undefined} /></View>
      {place.isCustom && <Text style={s.body}>지도를 눌러 이 장소의 위치를 {coord ? '수정' : '등록'}할 수 있어요.</Text>}
      {!coord && <Text style={s.body}>등록된 위치가 없어요. 길찾기는 장소명으로 검색해요.</Text>}
      {draft && <View style={s.chips}>
        <Chip label="위치 저장" onPress={() => write(() => { updateCustomPlaceLocation(place.id, draft); setDraft(null); })} />
        <Chip label="취소" onPress={() => setDraft(null)} />
      </View>}
      <Pressable style={s.action} accessibilityRole="button" onPress={() => Linking.openURL(directionsUrl(place)).catch(() => Alert.alert('길찾기를 열 수 없어요', '네트워크 연결을 확인해 주세요.'))}><Text style={s.button}>길찾기</Text></Pressable>
      {trip && <>
        <Pressable style={s.action} accessibilityRole="button" onPress={() => write(() => isSaved ? unsavePlace(trip.id, place.id) : savePlaces(trip.id, [place.id]))}><Text style={s.button}>{isSaved ? '저장 해제' : '저장'}</Text></Pressable>
        <Pressable style={s.action} accessibilityRole="button" onPress={() => setAdding(!adding)}><Text style={s.button}>일정에 추가</Text></Pressable>
        {adding && <DayPickerSheet tripId={trip.id} placeId={place.id} name={place.name} onClose={() => setAdding(false)} />}
      </>}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas }, content: { padding: spacing.gutter, paddingBottom: spacing.xxl, gap: spacing.sm },
  title: { ...t.displayMd, color: colors.ink }, body: { ...t.bodySm, color: colors.muted }, button: { ...t.button, color: colors.ink },
  map: { height: mapStyle.expandedHeight, borderRadius: rounded.lg, overflow: 'hidden' }, photo: { height: mapStyle.collapsedHeight, borderRadius: rounded.lg },
  action: { minHeight: sizing.touchMin, justifyContent: 'center' }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
});
