// docs/design-system.md 의 컴포넌트 토큰을 그대로 옮긴 조각들. 값은 theme.ts 에서만 온다 — 화면에서 hex 를 인라인하지 않는다.
// 템플릿(Designbase APP UI Template v1.6.0) 구조를 따르고 색은 우리 토큰을 유지한다 (플랜 12).
import type { Link } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { colors, type as t } from '../../theme';

/** expo-router 의 typed route 문자열. `href` prop 을 받는 곳에서 함께 쓴다. */
export type Href = React.ComponentProps<typeof Link>['href'];

export { Badge } from './Badge';
export { BottomCtaBar } from './BottomCtaBar';
export { BottomSheet } from './BottomSheet';
export { Checkbox } from './Checkbox';
export { Chip, ChipRow, chipRow } from './Chip';
export { IconButton } from './IconButton';
export { ListGroup, ListRow } from './ListRow';
export { ScreenHeader, type HeaderAction } from './ScreenHeader';
export { SearchBar } from './SearchBar';
export { SectionHeader } from './SectionHeader';
export { SegmentedControl, Tabs, type TabOption } from './Tabs';
export { TextField } from './TextField';
export { Icon, type IconName } from '../Icon';

export function Question({ children }: { children: string }) {
  return <Text style={q.question}>{children}</Text>;
}
const q = StyleSheet.create({ question: { ...t.displaySm, color: colors.ink } });
