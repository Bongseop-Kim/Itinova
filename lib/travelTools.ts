export type DailyWeather = { date: string; code: number | null; low: number | null; high: number | null; rain: number | null };
export type Weather = { timezone: string; days: DailyWeather[]; fetchedAt: string };
export type ExchangeRate = { date: string; base: string; quote: string; rate: number };
const record = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const finite = (value: unknown): number | null => typeof value === 'number' && Number.isFinite(value) ? value : null;
const isoDate = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;

export function parseWeather(input: unknown): Weather {
  const root = record(input), daily = record(root.daily);
  if (typeof root.timezone !== 'string' || !Array.isArray(daily.time) || !daily.time.length) throw new Error('날씨 응답을 확인할 수 없어요.');
  new Intl.DateTimeFormat('ko-KR', { timeZone: root.timezone });
  const values = (key: string) => Array.isArray(daily[key]) ? daily[key] as unknown[] : [];
  const columns = ['weather_code', 'temperature_2m_min', 'temperature_2m_max', 'precipitation_probability_max'].map(values);
  if (columns.some((column) => column.length !== (daily.time as unknown[]).length)) throw new Error('날씨 정보가 불완전해요.');
  const days = daily.time.map((date, i) => {
    if (!isoDate(date)) throw new Error('날씨 날짜를 확인할 수 없어요.');
    const [code, low, high, rawRain] = columns.map((column) => finite(column[i]));
    if (low != null && high != null && low > high) throw new Error('날씨 온도 범위를 확인할 수 없어요.');
    const rain = rawRain != null && rawRain >= 0 && rawRain <= 100 ? rawRain : null;
    return { date, code, low, high, rain };
  });
  return { timezone: root.timezone, days, fetchedAt: new Date().toISOString() };
}
export function parseRate(input: unknown, base: string, quote: string): ExchangeRate {
  const row = record(input);
  if (!isoDate(row.date) || row.base !== base || row.quote !== quote || finite(row.rate) == null || (row.rate as number) <= 0) throw new Error('이 통화의 환율을 확인할 수 없어요.');
  return { date: row.date, base, quote, rate: row.rate as number };
}
export function weatherLabel(code: number | null): string {
  if (code === 0) return '맑음';
  if (code != null && [1, 2].includes(code)) return '구름 조금';
  if (code === 3) return '흐림';
  if (code != null && [45, 48].includes(code)) return '안개';
  if (code != null && [51, 53, 55, 56, 57].includes(code)) return '이슬비';
  if (code != null && [61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return '비';
  if (code != null && [71, 73, 75, 77, 85, 86].includes(code)) return '눈';
  if (code != null && [95, 96, 99].includes(code)) return '뇌우';
  return '날씨 정보 없음';
}
export const weatherSummary = (day: DailyWeather) => `${weatherLabel(day.code)} · ${day.low == null ? '—' : Math.round(day.low)}° / ${day.high == null ? '—' : Math.round(day.high)}°`;
export const tripForecast = (weather: Weather | undefined, start: string, end: string) => weather?.days.filter((day) => day.date >= start && day.date <= end) ?? [];

export function convertAmount(input: string, rate: number): number | null {
  if (!/^\d+(\.\d*)?$/.test(input.trim()) || !Number.isFinite(rate) || rate <= 0) return null;
  const result = Number(input) * rate;
  return Number.isFinite(result) && result >= 0 ? result : null;
}
export function zonedDateTime(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('ko-KR', { timeZone: timezone, month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date);
}
export function timeDifference(date: Date, timezone: string): string {
  // Hermes의 timeZoneName: longOffset 지원 차이를 피하고 각 시간대의 달력 숫자를 비교한다.
  const wallTime = (zone: string) => {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date);
    const value = (type: string) => Number(parts.find((part) => part.type === type)?.value);
    const result = Date.UTC(value('year'), value('month') - 1, value('day'), value('hour'), value('minute'));
    if (!Number.isFinite(result)) throw new Error('시차를 계산할 수 없어요.');
    return result;
  };
  const minutes = (wallTime(timezone) - wallTime('Asia/Seoul')) / 60000;
  if (!minutes) return '한국과 시차가 없어요';
  const distance = Math.abs(minutes);
  return `한국보다 ${Math.floor(distance / 60)}시간${distance % 60 ? ` ${distance % 60}분` : ''} ${minutes > 0 ? '빨라요' : '느려요'}`;
}
export async function fetchTravelJson(url: string, signal: AbortSignal): Promise<unknown> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
