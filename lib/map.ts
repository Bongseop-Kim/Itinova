import type { LatLng } from './geo.ts';
import type { DaySection } from './itinerary.ts';

export type MapPin = { id: string; title: string; order: number; coord: LatLng };
export type MapRoute = { id: string; coordinates: LatLng[] };
export const validCoord = (lat: unknown, lng: unknown): boolean =>
  typeof lat === 'number' && typeof lng === 'number' && Number.isFinite(lat) && Number.isFinite(lng) &&
  Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
export const coordinates = (p: LatLng) => ({ latitude: p.lat, longitude: p.lng });
export const wrapLng = (lng: number) => ((lng + 540) % 360) - 180;

export function mapData(sections: DaySection[], day?: number) {
  const pins: MapPin[] = [];
  const routes: MapRoute[] = [];
  for (const section of sections) {
    if (day != null && section.dayIndex !== day) continue;
    section.data.forEach((item, index) => {
      if (!item.coord || !validCoord(item.coord.lat, item.coord.lng)) return;
      pins.push({ id: item.id, title: `day ${section.dayIndex} · ${index + 1}. ${item.name}`, order: index + 1, coord: item.coord });
      const prev = section.data[index - 1]?.coord;
      // 좌표가 빠진 방문을 건너뛰어 가짜 연결선을 만들지 않는다.
      if (prev && validCoord(prev.lat, prev.lng)) routes.push({ id: `${section.dayId}-${item.id}`, coordinates: [prev, item.coord] });
    });
  }
  return { pins, routes };
}

const mercatorY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + Math.max(-85.051129, Math.min(85.051129, lat)) * Math.PI / 360));
export function mapCamera(points: LatLng[], fallback: LatLng | null, width: number, height: number) {
  const valid = points.filter((p) => validCoord(p.lat, p.lng));
  if (!valid.length) return { coordinates: coordinates(fallback && validCoord(fallback.lat, fallback.lng) ? fallback : { lat: 0, lng: 0 }), zoom: fallback ? 11 : 1 };
  const longitudes = valid.map((p) => (p.lng + 360) % 360).sort((a, b) => a - b);
  let gapIndex = 0;
  let largestGap = -1;
  longitudes.forEach((lng, i) => {
    const gap = (longitudes[i + 1] ?? longitudes[0] + 360) - lng;
    if (gap > largestGap) { largestGap = gap; gapIndex = i; }
  });
  const span = 360 - largestGap;
  const lng = wrapLng(longitudes[(gapIndex + 1) % longitudes.length] + span / 2);
  const ys = valid.map((p) => mercatorY(p.lat));
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const lat = (2 * Math.atan(Math.exp((minY + maxY) / 2)) - Math.PI / 2) * 180 / Math.PI;
  const zoom = Math.min(15, Math.log2(Math.max(1, width - 64) / (256 * Math.max(span / 360, 0.000001))), Math.log2(Math.max(1, height - 64) / (256 * Math.max((maxY - minY) / (2 * Math.PI), 0.000001))));
  return { coordinates: { latitude: lat, longitude: lng }, zoom: Math.max(1, zoom) };
}

// ponytail: expo-maps v57에는 dash prop이 없어 짧은 선분으로 표현한다.
// 확대된 장거리 경로는 구간당 512개로 제한한다. 그 이상 정밀도가 필요하면 네이티브 dash 지원으로 교체.
export function dashedRoutes(routes: MapRoute[], zoom: number, pattern: readonly [number, number]) {
  return routes.flatMap((route) => {
    const [a, b] = route.coordinates;
    const dx = wrapLng(b.lng - a.lng) / 360;
    const ay = mercatorY(a.lat), by = mercatorY(b.lat);
    const pixels = Math.hypot(dx, (by - ay) / (2 * Math.PI)) * 256 * 2 ** zoom;
    const count = Math.min(512, Math.ceil(pixels / (pattern[0] + pattern[1])));
    if (!count) return [];
    const step = Math.max(pattern[0] + pattern[1], pixels / count);
    const point = (f: number) => ({ latitude: (2 * Math.atan(Math.exp(ay + (by - ay) * f)) - Math.PI / 2) * 180 / Math.PI, longitude: wrapLng(a.lng + dx * 360 * f) });
    return Array.from({ length: count }, (_, i) => ({ id: `${route.id}-${i}`, coordinates: [point(i * step / pixels), point(Math.min(1, (i * step + step * pattern[0] / (pattern[0] + pattern[1])) / pixels))] }));
  });
}

export const validTime = (value: string) => !value.trim() || /^([01]\d|2[0-3]):[0-5]\d$/.test(value.trim());
export function directionsUrl(place: { name: string; address?: string | null; lat: number | null; lng: number | null }) {
  const destination = validCoord(place.lat, place.lng) ? `${place.lat},${place.lng}` : [place.name, place.address].filter(Boolean).join(' ');
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}
