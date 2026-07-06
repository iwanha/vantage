"use client";

import { useState } from "react";

// Row selection scoped to the current view. When the view key (page + filters +
// sort) changes, the selection resets — so selected ids only ever reference rows
// currently on screen, which keeps Export / Delete semantics unambiguous.
export function useTableSelection(viewKey: string) {
  const [key, setKey] = useState(viewKey);
  const [ids, setIds] = useState<Set<string>>(new Set());

  if (viewKey !== key) {
    setKey(viewKey);
    setIds(new Set());
  }

  function toggleRow(id: string) {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleVisible(visible: string[], checked: boolean) {
    setIds((prev) => {
      const next = new Set(prev);
      for (const v of visible) {
        if (checked) next.add(v);
        else next.delete(v);
      }
      return next;
    });
  }

  function clear() {
    setIds(new Set());
  }

  return { ids, toggleRow, toggleVisible, clear };
}
