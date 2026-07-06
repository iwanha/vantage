"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTableParams } from "./table-params";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  page: number;
  pageSize: number;
  total: number;
}

// Windowed page list: 1 … (p-1) p (p+1) … last, collapsing gaps with ellipses.
function pageRange(current: number, last: number): (number | "…")[] {
  if (last <= 1) return [1];
  const range: (number | "…")[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(last - 1, current + 1);
  if (left > 2) range.push("…");
  for (let i = left; i <= right; i++) range.push(i);
  if (right < last - 1) range.push("…");
  range.push(last);
  return range;
}

export function TablePagination({ page, pageSize, total }: Props) {
  const { setParams } = useTableParams();
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const pages = pageRange(page, lastPage);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <span className="font-mono text-xs tabular-nums text-muted-foreground">
        {from}–{to} of {total.toLocaleString()}
      </span>
      <div className="flex items-center gap-2">
        <Select
          value={String(pageSize)}
          onValueChange={(v) => setParams({ size: v, page: 1 })}
        >
          <SelectTrigger className="w-28" aria-label="Rows per page">
            <SelectValue>{(value) => `${value} / page`}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {[10, 25, 50].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n} / page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <nav className="flex items-center gap-1" aria-label="Pagination">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Previous page"
                  disabled={page <= 1}
                  onClick={() => setParams({ page: page - 1 })}
                >
                  <ChevronLeft className="size-4" />
                </Button>
              }
            />
            <TooltipContent>Previous page</TooltipContent>
          </Tooltip>

          {pages.map((p, i) =>
            p === "…" ? (
              <span
                key={`gap-${i}`}
                className="px-1.5 text-sm text-muted-foreground"
                aria-hidden
              >
                …
              </span>
            ) : (
              <Button
                key={p}
                variant={p === page ? "default" : "ghost"}
                size="icon"
                aria-label={`Page ${p}`}
                aria-current={p === page ? "page" : undefined}
                className={cn("font-mono text-xs tabular-nums")}
                onClick={() => setParams({ page: p })}
              >
                {p}
              </Button>
            ),
          )}

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Next page"
                  disabled={page >= lastPage}
                  onClick={() => setParams({ page: page + 1 })}
                >
                  <ChevronRight className="size-4" />
                </Button>
              }
            />
            <TooltipContent>Next page</TooltipContent>
          </Tooltip>
        </nav>
      </div>
    </div>
  );
}
