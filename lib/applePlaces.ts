import type { Category } from './category';

export type ApplePlace = {
  applePlaceId: string;
  name: string;
  address: string;
  region: string;
  countryCode: string;
  currency: string;
  lat: number;
  lng: number;
  poiCategory: string;
};

export function appleCategory(raw: string): Category {
  const name = raw.replace(/^MKPOICategory/, '');
  if (['Cafe', 'Bakery'].includes(name)) return 'cafe';
  if (['Restaurant', 'Brewery', 'Winery', 'FoodMarket', 'Distillery'].includes(name)) return 'food';
  if (['Hotel', 'Campground', 'RVPark'].includes(name)) return 'stay';
  if (['Airport', 'PublicTransport', 'Parking', 'CarRental', 'EVCharger', 'GasStation'].includes(name)) return 'transport';
  if (['Museum', 'NationalPark', 'Park', 'Beach', 'Zoo', 'Aquarium', 'AmusementPark', 'Theater', 'Stadium', 'Landmark', 'Castle', 'Fortress', 'Monument'].includes(name)) return 'attraction';
  return 'etc';
}

export function uniqueApplePlaces(results: ApplePlace[], citiesOnly: boolean): ApplePlace[] {
  const seen = new Set<string>();
  return results.filter((p) => {
    if (!p.applePlaceId || !p.name.trim() || !Number.isFinite(p.lat) || !Number.isFinite(p.lng) || Math.abs(p.lat) > 90 || Math.abs(p.lng) > 180) return false;
    const key = citiesOnly ? `${p.countryCode}|${p.region}|${p.name}` : p.applePlaceId;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
