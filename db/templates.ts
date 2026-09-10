// 여행 생성 시 시드되는 기본 체크리스트 (design.md §2.5 S16 · `checklist_items` 비고).
export const CHECKLIST_TEMPLATE: [string, string[]][] = [
  ['필수 준비물', ['신분증', '항공권 · 교통권 예약 확인', '여행자 보험']],
  ['기본 짐싸기', ['충전기 · 보조배터리', '상비약', '세면도구']],
];

export function checklistSections<T extends { category: string }>(rows: readonly T[]) {
  const categories = [...new Set([...CHECKLIST_TEMPLATE.map(([category]) => category), ...rows.map((row) => row.category)])];
  return categories.map((title) => ({ title, data: rows.filter((row) => row.category === title) }));
}
