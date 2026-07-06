"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { DASHBOARD_RANGES, DEFAULT_RANGE } from "./ranges";

export function DashboardRange({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  function set(key: string) {
    const p = new URLSearchParams(sp.toString());
    if (key === DEFAULT_RANGE) p.delete("range");
    else p.set("range", key);
    const qs = p.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="inline-flex rounded-lg border p-0.5" role="group" aria-label="Date range">
      {DASHBOARD_RANGES.map((r) => (
        <button
          key={r.key}
          type="button"
          onClick={() => set(r.key)}
          aria-pressed={value === r.key}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            value === r.key
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
