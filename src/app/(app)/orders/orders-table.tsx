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
import { capitalize, currency, shortDate } from "@/lib/format";
import { STATUS_ORDER } from "@/lib/status";
import { StatusBadge } from "@/components/status-badge";
import { OrderFormDialog } from "./order-form-dialog";
import { OrderRowActions } from "./order-row-actions";
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

export type OrderRow = {
  id: string;
  order_number: string;
  customer_id: string;
  status: string;
  total_amount: number;
  currency: string;
  created_at: string;
  customers: { name: string } | null;
};

type ColMeta = { sortKey?: string; align?: "right" };
type Customer = { id: string; name: string };

const baseColumns: ColumnDef<OrderRow>[] = [
  {
    accessorKey: "order_number",
    header: "Order",
    meta: { sortKey: "order_number" } as ColMeta,
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.order_number}</span>
    ),
  },
  {
    id: "customer",
    header: "Customer",
    cell: ({ row }) => row.original.customers?.name ?? "—",
  },
  {
    accessorKey: "status",
    header: "Status",
    meta: { sortKey: "status" } as ColMeta,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "total_amount",
    header: "Total",
    meta: { sortKey: "total_amount", align: "right" } as ColMeta,
    cell: ({ row }) => (
      <span className="tabular-nums">
        {currency(Number(row.original.total_amount), row.original.currency)}
      </span>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Date",
    meta: { sortKey: "created_at" } as ColMeta,
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {shortDate(row.original.created_at)}
      </span>
    ),
  },
];

interface Props {
  rows: OrderRow[];
  total: number;
  page: number;
  pageSize: number;
  sort: string;
  dir: "asc" | "desc";
  status: string;
  q: string;
  canWrite: boolean;
  customers: Customer[];
}

export function OrdersTable({
  rows,
  total,
  page,
  pageSize,
  sort,
  dir,
  status,
  q,
  canWrite,
  customers,
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

  const columns = useMemo<ColumnDef<OrderRow>[]>(() => {
    if (!canWrite) return baseColumns;
    return [
      ...baseColumns,
      {
        id: "actions",
        header: "",
        meta: { align: "right" } as ColMeta,
        cell: ({ row }) => (
          <OrderRowActions order={row.original} customers={customers} />
        ),
      },
    ];
  }, [canWrite, customers]);

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
            placeholder="Search order #…"
            defaultValue={q}
            onChange={(e) => onSearch(e.target.value)}
            className="w-56 pl-8"
            aria-label="Search orders"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) =>
            setParams({ status: v === "all" ? null : v, page: 1 })
          }
        >
          <SelectTrigger className="w-40" aria-label="Filter by status">
            <SelectValue>
              {(value) =>
                value === "all" ? "All statuses" : capitalize(String(value))
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_ORDER.map((s) => (
              <SelectItem key={s} value={s}>
                {capitalize(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-3">
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {total.toLocaleString()} orders
          </span>
          {canWrite && (
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              New order
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
                          className={cn(
                            "inline-flex items-center gap-1 transition-colors hover:text-foreground",
                            meta.align === "right" && "flex-row-reverse",
                          )}
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
                  No orders match your filters.
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
        <OrderFormDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          mode="create"
          customers={customers}
        />
      )}
    </div>
  );
}
