"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { capitalize, currency, number as fmtNumber } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import { DataTable, type ColMeta } from "@/components/data-table/data-table";
import { TableSearch } from "@/components/data-table/table-search";
import { FilterSelect } from "@/components/data-table/filter-select";
import { Button } from "@/components/ui/button";
import { ProductFormDialog } from "./product-form-dialog";
import { ProductRowActions } from "./product-row-actions";
import { CATEGORIES, PRODUCT_STATUS } from "./constants";

export type ProductRow = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  created_at: string;
};

const baseColumns: ColumnDef<ProductRow>[] = [
  {
    accessorKey: "name",
    header: "Name",
    meta: { sortKey: "name" } as ColMeta,
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "sku",
    header: "SKU",
    meta: { sortKey: "sku" } as ColMeta,
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.sku}
      </span>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    meta: { sortKey: "category" } as ColMeta,
  },
  {
    accessorKey: "price",
    header: "Price",
    meta: { sortKey: "price", align: "right" } as ColMeta,
    cell: ({ row }) => (
      <span className="tabular-nums">{currency(Number(row.original.price))}</span>
    ),
  },
  {
    accessorKey: "stock",
    header: "Stock",
    meta: { sortKey: "stock", align: "right" } as ColMeta,
    cell: ({ row }) => (
      <span className="tabular-nums">{fmtNumber(row.original.stock)}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

interface Props {
  rows: ProductRow[];
  total: number;
  page: number;
  pageSize: number;
  sort: string;
  dir: "asc" | "desc";
  category: string;
  status: string;
  q: string;
  canWrite: boolean;
}

export function ProductsTable({
  rows,
  total,
  page,
  pageSize,
  sort,
  dir,
  category,
  status,
  q,
  canWrite,
}: Props) {
  const [createOpen, setCreateOpen] = useState(false);

  const columns = useMemo<ColumnDef<ProductRow>[]>(() => {
    if (!canWrite) return baseColumns;
    return [
      ...baseColumns,
      {
        id: "actions",
        header: "",
        meta: { align: "right" } as ColMeta,
        cell: ({ row }) => <ProductRowActions product={row.original} />,
      },
    ];
  }, [canWrite]);

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <TableSearch placeholder="Search name or SKU…" defaultValue={q} />
      <FilterSelect
        paramKey="category"
        value={category}
        allLabel="All categories"
        options={CATEGORIES.map((c) => ({ value: c, label: c }))}
      />
      <FilterSelect
        paramKey="status"
        value={status}
        allLabel="All status"
        width="w-36"
        options={PRODUCT_STATUS.map((s) => ({ value: s, label: capitalize(s) }))}
      />
      <div className="ml-auto flex items-center gap-4">
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {total.toLocaleString()} products
        </span>
        {canWrite && (
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            New product
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
        emptyMessage="No products match your filters."
        toolbar={toolbar}
      />
      {canWrite && (
        <ProductFormDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          mode="create"
        />
      )}
    </>
  );
}
