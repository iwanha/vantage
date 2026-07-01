"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { capitalize, currency, shortDate } from "@/lib/format";
import { STATUS_ORDER } from "@/lib/status";
import { StatusBadge } from "@/components/status-badge";
import { DataTable, type ColMeta } from "@/components/data-table/data-table";
import { TableSearch } from "@/components/data-table/table-search";
import { FilterSelect } from "@/components/data-table/filter-select";
import { Button } from "@/components/ui/button";
import { OrderFormDialog } from "./order-form-dialog";
import { OrderRowActions } from "./order-row-actions";

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
  const [createOpen, setCreateOpen] = useState(false);

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

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <TableSearch placeholder="Search order #…" defaultValue={q} />
      <FilterSelect
        paramKey="status"
        value={status}
        allLabel="All statuses"
        options={STATUS_ORDER.map((s) => ({ value: s, label: capitalize(s) }))}
      />
      <div className="ml-auto flex items-center gap-4">
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
  );

  return (
    <>
      <DataTable
        columns={columns}
        rows={rows}
        total={total}
        page={page}
        pageSize={pageSize}
        sort={sort}
        dir={dir}
        emptyMessage="No orders match your filters."
        toolbar={toolbar}
      />
      {canWrite && (
        <OrderFormDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          mode="create"
          customers={customers}
        />
      )}
    </>
  );
}
