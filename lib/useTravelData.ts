import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { validCoord } from './map';
import { fetchTravelJson, parseRate, parseWeather } from './travelTools';

function useTravelData<T>(url: string | null, parse: (value: unknown) => T) {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState<{ url: string | null; data?: T; error?: string; loading: boolean }>({ url: null, loading: false });
  useFocusEffect(useCallback(() => {
    if (!url) return;
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 12000);
    setState({ url, loading: true });
    fetchTravelJson(url, controller.signal).then(parse).then((data) => {
      if (active) setState({ url, data, loading: false });
    }).catch(() => {
      if (active) setState({ url, loading: false, error: '정보를 불러오지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.' });
    }).finally(() => clearTimeout(timeout));
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [url, version, parse]));
  return { ...(url === state.url ? state : { loading: !!url, data: undefined, error: undefined }), refresh: () => setVersion((v) => v + 1) };
}

export function useTripWeather(trip: { lat: number | null; lng: number | null } | undefined) {
  const url = trip && validCoord(trip.lat, trip.lng)
    ? `https://api.open-meteo.com/v1/forecast?latitude=${trip.lat}&longitude=${trip.lng}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=16`
    : null;
  return useTravelData(url, parseWeather);
}
export function useExchangeRate(base: string, quote: string) {
  const parse = useCallback((value: unknown) => parseRate(value, base, quote), [base, quote]);
  return useTravelData(base !== quote ? `https://api.frankfurter.dev/v2/rate/${encodeURIComponent(base)}/${encodeURIComponent(quote)}` : null, parse);
}
export function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);
  return now;
}
