// S04 인기 도시. Google Places 검색은 API 키가 붙은 뒤에 열린다 (design.md §6).
// ponytail: 검색 없이도 흐름이 성립하도록 대표 도시만 정적으로 둔다.
export type City = {
  name: string;
  region: string;      // 도시 아래 보조 텍스트 (권역 / 국가)
  countryCode: string;
  currency: string;
  lat: number;
  lng: number;
};

export const DOMESTIC: City[] = [
  { name: '서울', region: '수도권', countryCode: 'KR', currency: 'KRW', lat: 37.5665, lng: 126.978 },
  { name: '부산', region: '경상', countryCode: 'KR', currency: 'KRW', lat: 35.1796, lng: 129.0756 },
  { name: '제주', region: '제주', countryCode: 'KR', currency: 'KRW', lat: 33.4996, lng: 126.5312 },
  { name: '강릉', region: '강원', countryCode: 'KR', currency: 'KRW', lat: 37.7519, lng: 128.8761 },
  { name: '여수', region: '전라', countryCode: 'KR', currency: 'KRW', lat: 34.7604, lng: 127.6622 },
  { name: '경주', region: '경상', countryCode: 'KR', currency: 'KRW', lat: 35.8562, lng: 129.2247 },
  { name: '전주', region: '전라', countryCode: 'KR', currency: 'KRW', lat: 35.8242, lng: 127.148 },
  { name: '속초', region: '강원', countryCode: 'KR', currency: 'KRW', lat: 38.207, lng: 128.5918 },
];

export const OVERSEAS: City[] = [
  { name: '도쿄', region: '일본 간토', countryCode: 'JP', currency: 'JPY', lat: 35.6762, lng: 139.6503 },
  { name: '오사카', region: '일본 간사이', countryCode: 'JP', currency: 'JPY', lat: 34.6937, lng: 135.5023 },
  { name: '후쿠오카', region: '일본 규슈', countryCode: 'JP', currency: 'JPY', lat: 33.5904, lng: 130.4017 },
  { name: '타이베이', region: '대만', countryCode: 'TW', currency: 'TWD', lat: 25.033, lng: 121.5654 },
  { name: '방콕', region: '태국', countryCode: 'TH', currency: 'THB', lat: 13.7563, lng: 100.5018 },
  { name: '다낭', region: '베트남', countryCode: 'VN', currency: 'VND', lat: 16.0544, lng: 108.2022 },
  { name: '싱가포르', region: '싱가포르', countryCode: 'SG', currency: 'SGD', lat: 1.3521, lng: 103.8198 },
  { name: '파리', region: '프랑스', countryCode: 'FR', currency: 'EUR', lat: 48.8566, lng: 2.3522 },
];
