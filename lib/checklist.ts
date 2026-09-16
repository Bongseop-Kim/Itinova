/** 기존 카테고리 뒤에 원본 순서대로 이어 붙일 정렬값. */
export function categoryAppendOrders(sourceCount: number, targetOrders: readonly number[]): number[] {
  const last = Math.max(0, ...targetOrders);
  return Array.from({ length: sourceCount }, (_, index) => last + (index + 1) * 1000);
}
