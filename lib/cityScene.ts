export const CITY_SCENE_SLUGS = [
  'seoul', 'busan', 'jeju', 'gangneung', 'yeosu', 'gyeongju', 'jeonju', 'sokcho',
  'tokyo', 'osaka', 'fukuoka', 'taipei', 'bangkok', 'danang', 'singapore', 'paris',
] as const;
export type CitySceneSlug = (typeof CITY_SCENE_SLUGS)[number];

const aliases: Record<string, CitySceneSlug> = {
  '서울': 'seoul', '서울특별시': 'seoul', 'seoul': 'seoul',
  '부산': 'busan', '부산광역시': 'busan', 'busan': 'busan',
  '제주': 'jeju', '제주시': 'jeju', '제주도': 'jeju', 'jeju': 'jeju',
  '강릉': 'gangneung', '강릉시': 'gangneung', 'gangneung': 'gangneung',
  '여수': 'yeosu', '여수시': 'yeosu', 'yeosu': 'yeosu',
  '경주': 'gyeongju', '경주시': 'gyeongju', 'gyeongju': 'gyeongju',
  '전주': 'jeonju', '전주시': 'jeonju', 'jeonju': 'jeonju',
  '속초': 'sokcho', '속초시': 'sokcho', 'sokcho': 'sokcho',
  '도쿄': 'tokyo', '동경': 'tokyo', 'tokyo': 'tokyo', '東京': 'tokyo',
  '오사카': 'osaka', 'osaka': 'osaka', '大阪': 'osaka',
  '후쿠오카': 'fukuoka', 'fukuoka': 'fukuoka', '福岡': 'fukuoka',
  '타이베이': 'taipei', '타이페이': 'taipei', 'taipei': 'taipei', '台北': 'taipei',
  '방콕': 'bangkok', 'bangkok': 'bangkok',
  '다낭': 'danang', 'da nang': 'danang', 'danang': 'danang',
  '싱가포르': 'singapore', 'singapore': 'singapore',
  '파리': 'paris', 'paris': 'paris',
};

export const citySceneSlug = (cityName: string): CitySceneSlug | undefined =>
  aliases[cityName.trim().toLocaleLowerCase('en-US')];

export const CITY_FALLBACKS = ['brandPeach', 'brandOchre', 'brandMint', 'brandLavender', 'brandCoral'] as const;
export type CityFallback = (typeof CITY_FALLBACKS)[number];

/** FNV-1a: 같은 자유 입력 도시명은 모든 슬롯에서 같은 폴백 색을 쓴다. */
export function cityFallback(cityName: string): CityFallback {
  let hash = 0x811c9dc5;
  for (const char of cityName.trim().toLocaleLowerCase('en-US')) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193);
  }
  return CITY_FALLBACKS[(hash >>> 0) % CITY_FALLBACKS.length];
}
