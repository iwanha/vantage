"use client";

import { X } from "lucide-react";
import { useTableParams } from "./table-params";

export type ActiveFilter = { key: string; label: string };

export function ActiveFilters({ filters }: { filters: ActiveFilter[] }) {
  const { setParams } = useTableParams();
  if (filters.length === 0) return null;

  function clearAll() {
    const reset: Record<string, null | number> = { page: 1 };
    for (const f of filters) reset[f.key] = null;
    setParams(reset);
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs text-muted-foreground">Filters</span>
      {filters.map((f) => (
        <button
          key={f.key}
          type="button"
          onClick={() => setParams({ [f.key]: null, page: 1 })}
          className="group inline-flex items-center gap-1 rounded-full border bg-muted/40 py-0.5 pr-1.5 pl-2.5 text-xs transition-colors hover:bg-muted"
          aria-label={`Remove filter ${f.label}`}
        >
          <span>{f.label}</span>
          <X className="size-3 text-muted-foreground transition-colors group-hover:text-foreground" />
        </button>
      ))}
      {filters.length > 1 && (
        <button
          type="button"
          onClick={clearAll}
          className="ml-1 text-xs text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
