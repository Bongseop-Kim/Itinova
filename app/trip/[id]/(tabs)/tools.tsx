import { eq } from 'drizzle-orm';
import { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Chip, ScreenHeader } from '../../../../components/ui';
import { db } from '../../../../db';
import { trips } from '../../../../db/schema';
import { cityTimeZone } from '../../../../lib/cities';
import { dayMeta } from '../../../../lib/date';
import { formatAmount } from '../../../../lib/expense';
import { convertAmount, timeDifference, tripForecast, weatherSummary, zonedDateTime } from '../../../../lib/travelTools';
import { useClock, useExchangeRate, useTripWeather } from '../../../../lib/useTravelData';
import { useDbQuery } from '../../../../lib/useDbQuery';
import { useTripId } from '../../../../lib/useTripId';
import { colors, rounded, sizing, spacing, type as t } from '../../../../theme';

const LANGUAGES = [{ name: '영어', code: 'en' }, { name: '일본어', code: 'ja' }, { name: '중국어 번체', code: 'zh-TW' }, { name: '태국어', code: 'th' }, { name: '베트남어', code: 'vi' }, { name: '프랑스어', code: 'fr' }, { name: '한국어', code: 'ko' }];
const open = (url: string) => Linking.openURL(url).catch(() => Alert.alert('열 수 없어요', '브라우저와 인터넷 연결을 확인해 주세요.'));

export default function Tools() {
  const id = useTripId();
  const trip = useDbQuery(() => db.select().from(trips).where(eq(trips.id, id)), [trips], [id])?.[0];
  return <View style={s.screen}><ScreenHeader title="여행 도구" />{trip ? <TravelTools key={trip.id + trip.currency} trip={trip} /> : <Text style={s.body}>여행을 찾을 수 없어요.</Text>}</View>;
}
function TravelTools({ trip }: { trip: typeof trips.$inferSelect }) {
  const weather = useTripWeather(trip);
  const now = useClock();
  const timezone = cityTimeZone(trip.cityName, trip.countryCode) ?? weather.data?.timezone;
  const forecast = tripForecast(weather.data, trip.startDate, trip.endDate);
  const [base, setBase] = useState(trip.currency);
  const [quote, setQuote] = useState(trip.currency === 'KRW' ? 'USD' : 'KRW');
  const [amount, setAmount] = useState('1');
  const fx = useExchangeRate(base, quote);
  const currencies = [...new Set([trip.currency, 'KRW', 'USD', 'EUR', 'JPY', 'TWD', 'VND', 'THB', 'SGD'])];
  const rate = base === quote ? 1 : fx.data?.rate;
  const converted = rate != null ? convertAmount(amount, rate) : null;
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('en');
  return (
    <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <View style={s.section}>
        <View style={s.heading}><Text style={s.title}>{trip.cityName} 날씨</Text><Action label="새로고침" onPress={weather.refresh} /></View>
        <Text style={s.body}>{trip.startDate} ~ {trip.endDate} · 현지 날짜 기준</Text>
        {weather.loading && <LoadingRows label="예보를 불러오고 있어요" />}
        {weather.error && <Text style={s.body} accessibilityRole="alert">{weather.error}</Text>}
        {!weather.loading && !weather.error && !weather.data && <Text style={s.body}>도시 위치가 없어 날씨를 확인할 수 없어요.</Text>}
        {forecast.map((day) => <View key={day.date} style={s.row}><Text style={s.body}>{dayMeta(day.date)}</Text><View style={s.values}><Text style={s.body}>{weatherSummary(day)}</Text>{day.rain != null && <Text style={s.caption}>강수 확률 {day.rain}%</Text>}</View></View>)}
        {weather.data && !forecast.length && <Text style={s.body}>여행 날짜가 예보 범위 밖이에요. 여행이 가까워지면 확인해 주세요.</Text>}
        {weather.data && <Text style={s.caption}>제공 범위 {weather.data.days[0]?.date} ~ {weather.data.days.at(-1)?.date} (최대 16일){'\n'}조회 {zonedDateTime(new Date(weather.data.fetchedAt), 'Asia/Seoul')} 한국 시각</Text>}
        <Action label="날씨 출처: Open-Meteo" onPress={() => open('https://open-meteo.com/')} />
      </View>
      <View style={s.section}>
        <Text style={s.title}>시차</Text>
        <Text style={s.number}>한국 · {zonedDateTime(now, 'Asia/Seoul')}</Text>
        {timezone ? <><Text style={s.number}>{trip.cityName} · {zonedDateTime(now, timezone)}</Text><Text style={s.body}>{timeDifference(now, timezone)}</Text><Text style={s.caption}>현재 시차 · 서머타임 반영</Text></> : <Text style={s.body}>현지 시간대를 확인할 수 없어요. 날씨를 새로고침해 주세요.</Text>}
      </View>
      <View style={s.section}>
        <View style={s.heading}><Text style={s.title}>환율 계산</Text><Action label="새로고침" onPress={fx.refresh} /></View>
        <Text style={s.body}>보낼 통화</Text><CurrencyChips currencies={currencies} value={base} onChange={setBase} />
        <TextInput style={s.input} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" accessibilityLabel={`${base} 환산할 금액`} placeholder="금액" placeholderTextColor={colors.mutedSoft} maxLength={16} />
        <Action label="통화 방향 바꾸기" onPress={() => { setBase(quote); setQuote(base); }} />
        <Text style={s.body}>받을 통화</Text><CurrencyChips currencies={currencies} value={quote} onChange={setQuote} />
        {base !== quote && fx.loading && <LoadingRows label="환율을 불러오고 있어요" />}
        {base !== quote && fx.error && <Text style={s.body} accessibilityRole="alert">{fx.error}</Text>}
        {rate != null && <><Text style={s.number}>{converted == null ? '0 이상의 숫자를 입력해 주세요' : `${formatAmount(converted, quote)} ${quote}`}</Text><Text style={s.body}>1 {base} = {rate.toLocaleString('ko-KR', { maximumFractionDigits: 6 })} {quote}</Text></>}
        {base !== quote && fx.data && <Text style={s.caption}>기준일 {fx.data.date} · 일별 참고 환율 (실시간 아님)</Text>}
        <Text style={s.caption}>환전 수수료와 카드사 적용 환율은 포함하지 않아요.</Text>
        <Action label="환율 출처: Frankfurter" onPress={() => open('https://frankfurter.dev/')} />
      </View>
      <View style={s.section}>
        <Text style={s.title}>번역</Text>
        <TextInput style={s.input} value={text} onChangeText={setText} multiline accessibilityLabel="번역할 문장" placeholder="번역할 문장을 입력해 주세요" placeholderTextColor={colors.mutedSoft} maxLength={2000} />
        <View style={s.chips}>{LANGUAGES.map((lang) => <Chip key={lang.code} label={lang.name} selected={language === lang.code} onPress={() => setLanguage(lang.code)} />)}</View>
        <Pressable style={s.action} accessibilityRole="button" disabled={!text.trim()} accessibilityState={{ disabled: !text.trim() }} onPress={() => open(`https://translate.google.com/?sl=auto&tl=${language}&text=${encodeURIComponent(text.trim())}&op=translate`)}><Text style={[s.button, !text.trim() && s.disabled]}>Google 번역에서 열기</Text></Pressable>
        <Text style={s.caption}>버튼을 누르면 입력한 문장을 Google 번역으로 보내고 외부 화면에서 결과를 확인해요.</Text>
      </View>
    </ScrollView>
  );
}
function LoadingRows({ label }: { label: string }) {
  return <View accessible accessibilityLabel={label} accessibilityState={{ busy: true }} style={s.loading}>{[0, 1, 2].map((i) => <View key={i} style={s.row}><View style={s.skeleton} /><View style={s.skeleton} /></View>)}</View>;
}
function CurrencyChips({ currencies, value, onChange }: { currencies: string[]; value: string; onChange: (value: string) => void }) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>{currencies.map((currency) => <Chip key={currency} label={currency} selected={value === currency} onPress={() => onChange(currency)} />)}</ScrollView>;
}
function Action({ label, onPress }: { label: string; onPress: () => void }) {
  return <Pressable style={s.action} onPress={onPress} accessibilityRole="button"><Text style={s.button}>{label}</Text></Pressable>;
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas }, content: { paddingHorizontal: spacing.gutter, paddingBottom: spacing.xxl, gap: spacing.section },
  section: { gap: spacing.sm, padding: spacing.md, backgroundColor: colors.canvas, borderWidth: sizing.hairline, borderColor: colors.hairline, borderRadius: rounded.lg }, heading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { ...t.titleLg, color: colors.ink, flexShrink: 1, flexGrow: 1 }, body: { ...t.bodySm, color: colors.body }, caption: { ...t.caption, color: colors.muted }, number: { ...t.numeric, color: colors.ink },
  action: { minHeight: sizing.touchMin, justifyContent: 'center' }, button: { ...t.button, color: colors.ink }, disabled: { color: colors.muted },
  row: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.xs, borderBottomWidth: sizing.hairline, borderBottomColor: colors.hairline }, values: { flex: 1, alignItems: 'flex-end', gap: spacing.xxs },
  input: { ...t.bodyMd, color: colors.ink, minHeight: sizing.controlH, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: sizing.hairline, borderColor: colors.hairline, borderRadius: rounded.md, backgroundColor: colors.canvas },
  loading: { gap: spacing.xs }, skeleton: { flex: 1, height: t.bodySm.lineHeight, borderRadius: rounded.xs, backgroundColor: colors.surfaceCard },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }, chipRow: { gap: spacing.xs, paddingVertical: spacing.xxs },
});
