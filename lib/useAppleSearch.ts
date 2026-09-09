import { requireOptionalNativeModule } from 'expo';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { uniqueApplePlaces, type ApplePlace } from './applePlaces';
import type { LatLng } from './geo';

const native = Platform.OS === 'ios' ? requireOptionalNativeModule<{
  search(query: string, citiesOnly: boolean, lat: number | null, lng: number | null, requestId: string): Promise<ApplePlace[]>;
  cancel(requestId: string): Promise<void>;
}>('ApplePlaceSearch') : null;

export function useAppleSearch(citiesOnly: boolean, center?: LatLng | null) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ApplePlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string>();
  const active = useRef<string | null>(null);
  const cancel = useCallback(() => {
    if (active.current) void native?.cancel(active.current).catch(() => {});
    active.current = null;
  }, []);
  useFocusEffect(useCallback(() => {
    setLoading(false);
    return cancel;
  }, [cancel]));

  const changeQuery = (value: string) => {
    cancel();
    setQuery(value);
    setResults([]);
    setSearched(false);
    setLoading(false);
    setError(undefined);
  };
  const search = async () => {
    if (!native || !query.trim()) return;
    cancel();
    const requestId = `${Date.now()}-${Math.random()}`;
    active.current = requestId;
    setLoading(true);
    setSearched(true);
    setResults([]);
    setError(undefined);
    const timeout = setTimeout(() => {
      if (active.current !== requestId) return;
      cancel();
      setLoading(false);
      setError('검색이 지연되고 있어요. 연결을 확인하고 다시 검색해 주세요.');
    }, 15000);
    try {
      const found = await native.search(query.trim(), citiesOnly, center?.lat ?? null, center?.lng ?? null, requestId);
      if (active.current === requestId) setResults(uniqueApplePlaces(found, citiesOnly));
    } catch {
      if (active.current === requestId) setError('검색하지 못했어요. 연결을 확인하고 다시 검색해 주세요.');
    } finally {
      clearTimeout(timeout);
      if (active.current === requestId) { active.current = null; setLoading(false); }
    }
  };
  return { query, changeQuery, results, loading, searched, error, search, available: !!native };
}
