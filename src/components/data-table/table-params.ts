"use client";

import { useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ParamValue = string | number | null;

// Shared URL-state helpers for server-driven tables (search, filters, sort, paging).
export function useTableParams() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function setParams(next: Record<string, ParamValue>) {
    const params = new URLSearchParams(sp.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, String(value));
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function debouncedSet(next: Record<string, ParamValue>, ms = 350) {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setParams(next), ms);
  }

  return { setParams, debouncedSet };
}
