"use client";

import { useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Plus,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { shortDate } from "@/lib/format";
import { CustomerFormDialog } from "./customer-form-dialog";
import { CustomerRowActions } from "./customer-row-actions";
import { COUNTRIES } from "./constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type CustomerRow = {
  id: string;
  name: string;
  email: string;
  country: string;
  created_at: string;
};

type ColMeta = { sortKey?: string; align?: "right" };

const baseColumns: ColumnDef<CustomerRow>[] = [
  {
    accessorKey: "name",
    header: "Name",
    meta: { sortKey: "name" } as ColMeta,
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "email",
    header: "Email",
    meta: { sortKey: "email" } as ColMeta,
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.email}</span>
    ),
  },
  {
    accessorKey: "country",
    header: "Country",
    meta: { sortKey: "country" } as ColMeta,
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.country}</span>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Joined",
    meta: { sortKey: "created_at" } as ColMeta,
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {shortDate(row.original.created_at)}
      </span>
    ),
  },
];

interface Props {
  rows: CustomerRow[];
  total: number;
  page: number;
  pageSize: number;
  sort: string;
  dir: "asc" | "desc";
  country: string;
  q: string;
  canWrite: boolean;
}

export function CustomersTable({
  rows,
  total,
  page,
  pageSize,
  sort,
  dir,
  country,
  q,
  canWrite,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  function setParams(next: Record<string, string | number | null>) {
    const params = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === "") params.delete(k);
      else params.set(k, String(v));
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function onSearch(v: string) {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setParams({ q: v || null, page: 1 }), 350);
  }

  function toggleSort(key: string) {
    if (sort === key) setParams({ dir: dir === "asc" ? "desc" : "asc" });
    else setParams({ sort: key, dir: "asc" });
  }

  const columns = useMemo<ColumnDef<CustomerRow>[]>(() => {
    if (!canWrite) return baseColumns;
    return [
      ...baseColumns,
      {
        id: "actions",
        header: "",
        meta: { align: "right" } as ColMeta,
        cell: ({ row }) => <CustomerRowActions customer={row.original} />,
      },
    ];
  }, [canWrite]);

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  });

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name or email…"
            defaultValue={q}
            onChange={(e) => onSearch(e.target.value)}
            className="w-56 pl-8"
            aria-label="Search customers"
          />
        </div>
        <Select
          value={country}
          onValueChange={(v) =>
            setParams({ country: v === "all" ? null : v, page: 1 })
          }
        >
          <SelectTrigger className="w-40" aria-label="Filter by country">
            <SelectValue>
              {(value) => (value === "all" ? "All countries" : String(value))}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-64">
            <SelectItem value="all">All countries</SelectItem>
            {COUNTRIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-3">
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {total.toLocaleString()} customers
          </span>
          {canWrite && (
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              New customer
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="bg-muted/40 hover:bg-muted/40">
                {hg.headers.map((h) => {
                  const meta = h.column.columnDef.meta as ColMeta | undefined;
                  const label = flexRender(
                    h.column.columnDef.header,
                    h.getContext(),
                  );
                  return (
                    <TableHead
                      key={h.id}
                      className={cn(
                        "h-10 text-xs font-medium uppercase tracking-wide text-muted-foreground",
                        meta?.align === "right" && "text-right",
                      )}
                    >
                      {meta?.sortKey ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(meta.sortKey!)}
                          className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                        >
                          {label}
                          {sort === meta.sortKey ? (
                            dir === "asc" ? (
                              <ArrowUp className="size-3" />
                            ) : (
                              <ArrowDown className="size-3" />
                            )
                          ) : (
                            <ChevronsUpDown className="size-3 opacity-50" />
                          )}
                        </button>
                      ) : (
                        label
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as
                      | ColMeta
                      | undefined;
                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "py-2.5",
                          meta?.align === "right" && "text-right",
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  No customers match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
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

      {canWrite && (
        <CustomerFormDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          mode="create"
        />
      )}
    </div>
  );
}
