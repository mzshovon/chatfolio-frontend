import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * True only after client hydration. Avoids the classic
 * `useState(false) + useEffect(() => setState(true))` pattern (which trips
 * the react-hooks "no setState in effect" rule) by using an external store
 * whose server snapshot is `false` and client snapshot is `true`.
 */
export function useHasMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
