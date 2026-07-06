import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// The shared pill-with-a-dot badge. One markup for status, category and any
// other categorical label so they read as a single system.
export function DotBadge({
  color,
  children,
  className,
}: {
  color: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium",
        className,
      )}
    >
      <span
        className="size-1.5 shrink-0 rounded-full"
        style={{ background: color }}
      />
      {children}
    </span>
  );
}
