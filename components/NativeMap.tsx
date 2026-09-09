import { Image, type ImageRef } from 'expo-image';
import { AppleMaps, GoogleMaps } from 'expo-maps';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PixelRatio, Platform, StyleSheet, View } from 'react-native';
import { coordinates, dashedRoutes, mapCamera, validCoord } from '../lib/map';
import { colors, mapStyle, type as t } from '../theme';
import type { PlaceMapProps } from './PlaceMap';

export default function NativeMap({ pins, routes = [], center = null, selectedIds = [], onPinPress, onPick }: PlaceMapProps) {
  const apple = useRef<AppleMaps.MapView>(null);
  const google = useRef<GoogleMaps.MapView>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const camera = useMemo(() => mapCamera(pins.map((p) => p.coord), center, size.width, size.height), [JSON.stringify(pins.map((p) => p.coord)), center?.lat, center?.lng, size.width, size.height]);
  const [zoom, setZoom] = useState(camera.zoom);
  const [icons, setIcons] = useState<Record<string, ImageRef>>({});
  const iconKeys = [...new Set(pins.map((p) => `${p.order}-${selectedIds.includes(p.id)}`))].sort().join(',');
  useEffect(() => {
    let active = true;
    Promise.all(iconKeys.split(',').filter(Boolean).map(async (key) => {
      const [order, selected] = key.split('-');
      const size = selected === 'true' ? mapStyle.selectedPinSize : mapStyle.pinSize;
      // expo-maps iOS의 annotation 이미지는 50pt 고정 프레임이다. 투명 여백으로 핀 토큰 크기를 유지한다.
      const canvas = Platform.OS === 'ios' ? 50 : size;
      const pixels = Platform.OS === 'android' ? canvas * PixelRatio.get() : canvas;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${pixels}" height="${pixels}" viewBox="0 0 ${canvas} ${canvas}"><circle cx="${canvas / 2}" cy="${canvas / 2}" r="${(size - mapStyle.pinBorderWidth) / 2}" fill="${selected === 'true' ? colors.brandPink : colors.primary}" stroke="${colors.canvas}" stroke-width="${mapStyle.pinBorderWidth}"/><text x="50%" y="50%" dy=".35em" text-anchor="middle" font-family="${t.caption.fontFamily}" font-size="${t.caption.fontSize}" fill="${colors.onPrimary}">${order}</text></svg>`;
      return [key, await Image.loadAsync(`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`)] as const;
    })).then((entries) => { if (active) setIcons(Object.fromEntries(entries)); }).catch(() => { if (active) setIcons({}); });
    return () => { active = false; };
  }, [iconKeys]);
  useEffect(() => {
    apple.current?.setCameraPosition(camera);
    google.current?.setCameraPosition(camera);
    setZoom(camera.zoom);
  }, [camera]);
  const polylines = useMemo(() => dashedRoutes(routes, zoom, mapStyle.lineDashPattern).map((line) => ({ ...line, color: colors.primary, width: mapStyle.routeWidth })), [JSON.stringify(routes), zoom]);
  const markers = pins.map((p) => ({ id: p.id, coordinates: coordinates(p.coord), title: p.title, icon: icons[`${p.order}-${selectedIds.includes(p.id)}`] }));
  const onMapClick = ({ coordinates: p }: { coordinates: { latitude?: number; longitude?: number } }) => {
    if (validCoord(p.latitude, p.longitude)) onPick?.({ lat: p.latitude!, lng: p.longitude! });
  };
  return (
    <View style={s.fill} onLayout={({ nativeEvent: { layout } }) => setSize({ width: layout.width, height: layout.height })}>
      {size.width > 0 && (Platform.OS === 'ios' ? (
        <AppleMaps.View ref={apple} style={s.fill} cameraPosition={camera} colorScheme={AppleMaps.MapColorScheme.LIGHT}
          annotations={markers.map((p) => ({ ...p, text: p.icon ? undefined : p.title, backgroundColor: colors.primary, textColor: colors.onPrimary }))}
          polylines={polylines} onAnnotationClick={(p) => p.id && onPinPress?.(p.id)} onMapClick={onMapClick}
          onCameraMove={(event) => setZoom(Math.round(event.zoom))} uiSettings={{ myLocationButtonEnabled: false }} />
      ) : (
        <GoogleMaps.View ref={google} style={s.fill} cameraPosition={camera} colorScheme={GoogleMaps.MapColorScheme.LIGHT}
          markers={markers.map((p) => ({ ...p, anchor: { x: 0.5, y: 0.5 }, showCallout: false }))}
          polylines={polylines} onMarkerClick={(p) => p.id && onPinPress?.(p.id)} onMapClick={onMapClick} onPOIClick={onMapClick}
          onCameraMove={(event) => setZoom(Math.round(event.zoom))}
          uiSettings={{ myLocationButtonEnabled: false, mapToolbarEnabled: false }} />
      ))}
    </View>
  );
}
const s = StyleSheet.create({ fill: { flex: 1 } });
