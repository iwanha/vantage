"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BulkBar({
  count,
  noun,
  onClear,
  children,
}: {
  count: number;
  noun: string;
  onClear: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/50 px-3 py-2">
      <span className="text-sm font-medium">
        {count} {noun}
        {count === 1 ? "" : "s"} selected
      </span>
      <div className="ml-auto flex items-center gap-2">
        {children}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          aria-label="Clear selection"
        >
          <X className="size-4" />
          Clear
        </Button>
      </div>
    </div>
  );
}
