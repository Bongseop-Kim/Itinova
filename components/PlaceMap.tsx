import { requireOptionalNativeModule } from 'expo';
import Constants from 'expo-constants';
import { Platform, StyleSheet, Text, View } from 'react-native';
import type { LatLng } from '../lib/geo';
import type { MapPin, MapRoute } from '../lib/map';
import { colors, rounded, spacing, type as t } from '../theme';

export type PlaceMapProps = {
  pins: MapPin[];
  routes?: MapRoute[];
  center?: LatLng | null;
  selectedIds?: string[];
  onPinPress?: (id: string) => void;
  onPick?: (coord: LatLng) => void;
};

export default function PlaceMap(props: PlaceMapProps) {
  const supported = Platform.OS === 'android' || (Platform.OS === 'ios' && Number.parseInt(String(Platform.Version), 10) >= 17);
  const available = supported && !!requireOptionalNativeModule('ExpoMaps');
  const configured = Platform.OS !== 'android' || !!Constants.expoConfig?.extra?.googleMapsConfigured;
  if (!available || !configured) return (
    <View style={s.fallback}>
      <Text style={s.title}>지도를 표시할 수 없어요</Text>
      <Text style={s.body}>{!supported ? '지도는 iOS 17 이상·Android 앱에서 볼 수 있어요.' : !available ? '지도가 포함된 앱 빌드에서 다시 열어 주세요.' : '지도 연결 설정이 필요해요. 장소 목록은 계속 사용할 수 있어요.'}</Text>
    </View>
  );
  // Expo Go / 웹에서는 네이티브 모듈 자체를 불러오지 않는다.
  const NativeMap = require('./NativeMap').default as typeof import('./NativeMap').default;
  return <NativeMap {...props} />;
}
const s = StyleSheet.create({
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.md, gap: spacing.xs, backgroundColor: colors.surfaceCard, borderRadius: rounded.lg },
  title: { ...t.titleSm, color: colors.ink },
  body: { ...t.bodySm, color: colors.muted, textAlign: 'center' },
});
