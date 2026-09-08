import { getTableConfig, type SQLiteTable } from 'drizzle-orm/sqlite-core';
import { addDatabaseChangeListener } from 'expo-sqlite';
import { useEffect, useState } from 'react';

/**
 * 여러 테이블을 감시하는 조회 훅.
 *
 * drizzle 의 `useLiveQuery` 를 쓰지 않는 이유: 그건 쿼리의 `from` 테이블 **하나만** 감시한다
 * (`config.name === tableName`). S10 처럼 `.from(trip_days)` 에 `day_items`·`places` 를
 * join 한 쿼리는 day_items 가 바뀌어도 갱신되지 않는다 — 장소를 담아도 화면에 안 나온다.
 *
 * 로컬 SQLite 는 즉시 반환하므로 로딩 상태를 만들지 않는다 (design-system §로딩).
 */
export function useDbQuery<T>(
  run: () => PromiseLike<T>,
  watch: SQLiteTable[],
  deps: unknown[],
): T | undefined {
  const [data, setData] = useState<T>();

  useEffect(() => {
    const names = new Set(watch.map((t) => getTableConfig(t).name));
    let alive = true;

    const load = () => {
      Promise.resolve(run()).then(
        (d) => {
          if (alive) setData(d);
        },
        // 로컬 조회 실패는 스키마 문제뿐이다. 화면을 비우기보다 이전 값을 유지한다.
        () => {},
      );
    };

    load();
    const listener = addDatabaseChangeListener(({ tableName }) => {
      if (names.has(tableName)) load();
    });

    return () => {
      alive = false;
      listener.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return data;
}
