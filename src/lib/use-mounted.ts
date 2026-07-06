"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * `false` on the server and during hydration, `true` once mounted on the
 * client. Uses useSyncExternalStore (no setState-in-effect) so client-only
 * widgets — e.g. Recharts, which measures the DOM before it can draw — render
 * a stable skeleton first, avoiding both the empty-then-pop flash and
 * hydration mismatches.
 */
export function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
