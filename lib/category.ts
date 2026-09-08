// places.category 열거값 → 화면 라벨. 인벤토리의 관광·맛집·숙소 탭과 같은 어휘를 쓴다.
export const CATEGORY_LABEL = {
  attraction: '관광',
  food: '맛집',
  cafe: '카페',
  stay: '숙소',
  transport: '교통',
  etc: '기타',
} as const;

export type Category = keyof typeof CATEGORY_LABEL;

export const categoryLabel = (c: string | null) =>
  (c && CATEGORY_LABEL[c as Category]) || CATEGORY_LABEL.etc;
