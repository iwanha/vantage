"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTableParams } from "./table-params";
import { Button } from "@/components/ui/button";
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

export function TablePagination({ page, pageSize, total }: Props) {
  const { setParams } = useTableParams();
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

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
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => setParams({ page: page - 1 })}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="font-mono text-xs tabular-nums">
          {page} / {lastPage}
        </span>
        <Button
          variant="outline"
          size="icon"
          aria-label="Next page"
          disabled={page >= lastPage}
          onClick={() => setParams({ page: page + 1 })}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
