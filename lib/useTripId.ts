import { useGlobalSearchParams, useLocalSearchParams } from 'expo-router';

/**
 * 여행 내부 화면에서 `[id]` 를 읽는다.
 *
 * 왜 훅이 필요한가: `/trip/[id]/(tabs)/...` 화면을 **탭을 눌러** 진입하면
 * `useLocalSearchParams` 가 부모 동적 세그먼트의 id 를 돌려주지 않는다 (undefined).
 * URL 로 직접 push 했을 때만 local 에 들어온다. global 은 두 경우 다 채워진다.
 *
 * local 을 먼저 보는 이유: global 은 URL 이 바뀔 때마다 포커스 없는 화면까지 갱신한다.
 * 포커스된 화면에서는 local 이 있으므로 그쪽을 쓰고, 없을 때만 global 로 떨어진다.
 */
export function useTripId(): string {
  const local = useLocalSearchParams<{ id?: string }>();
  const global = useGlobalSearchParams<{ id?: string }>();
  return local.id ?? global.id ?? '';
}
