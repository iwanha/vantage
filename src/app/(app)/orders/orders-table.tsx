"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Download, Plus, SearchX, ShoppingCart } from "lucide-react";
import { capitalize, currency, shortDate } from "@/lib/format";
import { initials, hueFromString, hueTint } from "@/lib/cells";
import { toCsv, downloadCsv } from "@/lib/csv";
import { STATUS_ORDER } from "@/lib/status";
import { StatusBadge } from "@/components/status-badge";
import {
  DataTable,
  type ColMeta,
  type TableSelection,
} from "@/components/data-table/data-table";
import { TableSearch } from "@/components/data-table/table-search";
import { FilterSelect } from "@/components/data-table/filter-select";
import { useTableParams } from "@/components/data-table/table-params";
import {
  ActiveFilters,
  type ActiveFilter,
} from "@/components/data-table/active-filters";
import { useTableSelection } from "@/components/data-table/use-selection";
import { BulkBar } from "@/components/data-table/bulk-bar";
import { BulkDelete } from "@/components/data-table/bulk-delete";
import { EmptyState } from "@/components/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { OrderFormDialog } from "./order-form-dialog";
import { OrderRowActions } from "./order-row-actions";
import { OrderDetailSheet } from "./order-detail-sheet";
import { deleteOrders } from "./actions";

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
    cell: ({ row }) => {
      const name = row.original.customers?.name;
      if (!name) return <span className="text-muted-foreground">—</span>;
      return (
        <div className="flex items-center gap-2.5">
          <Avatar className="size-7">
            <AvatarFallback
              className="text-[10px] font-medium"
              style={hueTint(hueFromString(name))}
            >
              {initials(name)}
            </AvatarFallback>
          </Avatar>
          <span>{name}</span>
        </div>
      );
    },
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
  const [detail, setDetail] = useState<OrderRow | null>(null);
  const { setParams } = useTableParams();
  const filtersActive = q !== "" || status !== "all";

  const sel = useTableSelection(`${page}|${sort}|${dir}|${q}|${status}`);
  const selectedRows = rows.filter((r) => sel.ids.has(r.id));

  const selection: TableSelection<OrderRow> = {
    getRowId: (r) => r.id,
    selectedIds: sel.ids,
    toggleRow: sel.toggleRow,
    toggleVisible: sel.toggleVisible,
    renderBar: () => (
      <BulkBar count={sel.ids.size} noun="order" onClear={sel.clear}>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            downloadCsv(
              "orders.csv",
              toCsv(selectedRows, [
                { header: "Order", value: (r) => r.order_number },
                { header: "Customer", value: (r) => r.customers?.name ?? "" },
                { header: "Status", value: (r) => r.status },
                { header: "Total", value: (r) => r.total_amount },
                { header: "Currency", value: (r) => r.currency },
                { header: "Date", value: (r) => shortDate(r.created_at) },
              ]),
            )
          }
        >
          <Download className="size-4" />
          Export CSV
        </Button>
        {canWrite && (
          <BulkDelete
            count={sel.ids.size}
            noun="order"
            onDelete={() => deleteOrders([...sel.ids])}
            onDeleted={sel.clear}
          />
        )}
      </BulkBar>
    ),
  };

  const empty = filtersActive ? (
    <EmptyState
      icon={SearchX}
      title="No matches"
      description="No orders match your current search and filters."
      action={
        <Button
          variant="outline"
          size="sm"
          onClick={() => setParams({ q: null, status: null, page: 1 })}
        >
          Clear filters
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={ShoppingCart}
      title="No orders yet"
      description={
        canWrite
          ? "Create your first order to see it in the book."
          : "Orders will show up here once they're placed."
      }
      action={
        canWrite ? (
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            New order
          </Button>
        ) : undefined
      }
    />
  );

  const columns = useMemo<ColumnDef<OrderRow>[]>(() => {
    if (!canWrite) return baseColumns;
    return [
      ...baseColumns,
      {
        id: "actions",
        header: "",
        meta: { align: "right" } as ColMeta,
        cell: ({ row }) => (
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <OrderRowActions order={row.original} customers={customers} />
          </div>
        ),
      },
    ];
  }, [canWrite, customers]);

  const activeFilters: ActiveFilter[] = [
    ...(q ? [{ key: "q", label: `“${q}”` }] : []),
    ...(status !== "all"
      ? [{ key: "status", label: `Status: ${capitalize(status)}` }]
      : []),
  ];

  const toolbar = (
    <div className="space-y-3">
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
      <ActiveFilters filters={activeFilters} />
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
        empty={empty}
        toolbar={toolbar}
        onRowClick={setDetail}
        selection={selection}
        renderCard={(o) => (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs">{o.order_number}</span>
              <StatusBadge status={o.status} />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex min-w-0 items-center gap-2 text-sm">
                {o.customers?.name ? (
                  <>
                    <Avatar className="size-6">
                      <AvatarFallback
                        className="text-[10px] font-medium"
                        style={hueTint(hueFromString(o.customers.name))}
                      >
                        {initials(o.customers.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{o.customers.name}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </span>
              <span className="shrink-0 tabular-nums text-sm font-medium">
                {currency(Number(o.total_amount), o.currency)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {shortDate(o.created_at)}
            </p>
          </div>
        )}
      />
      <OrderDetailSheet
        order={detail}
        onOpenChange={(open) => !open && setDetail(null)}
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
