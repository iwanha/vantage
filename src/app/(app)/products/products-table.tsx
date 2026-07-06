"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Download, Package, Plus, SearchX } from "lucide-react";
import { capitalize, currency, number as fmtNumber } from "@/lib/format";
import { categoryHue, hueTint } from "@/lib/cells";
import { toCsv, downloadCsv } from "@/lib/csv";
import { StatusBadge } from "@/components/status-badge";
import { DotBadge } from "@/components/dot-badge";
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
import { Button } from "@/components/ui/button";
import { ProductFormDialog } from "./product-form-dialog";
import { ProductRowActions } from "./product-row-actions";
import { ProductDetailSheet } from "./product-detail-sheet";
import { deleteProducts } from "./actions";
import { CATEGORIES, PRODUCT_STATUS } from "./constants";

const LOW_STOCK = 10;

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
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <div
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold"
          style={hueTint(categoryHue(row.original.category))}
        >
          {row.original.name.slice(0, 1).toUpperCase()}
        </div>
        <span className="font-medium">{row.original.name}</span>
      </div>
    ),
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
    cell: ({ row }) => (
      <DotBadge
        color={`oklch(0.62 0.17 ${categoryHue(row.original.category)})`}
      >
        {row.original.category}
      </DotBadge>
    ),
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
    cell: ({ row }) => {
      const stock = row.original.stock;
      return (
        <span className="inline-flex items-center justify-end gap-2">
          <span className="tabular-nums">{fmtNumber(stock)}</span>
          {stock === 0 ? (
            <span className="rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
              Out
            </span>
          ) : stock < LOW_STOCK ? (
            <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-500">
              Low
            </span>
          ) : null}
        </span>
      );
    },
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
  const [detail, setDetail] = useState<ProductRow | null>(null);
  const { setParams } = useTableParams();
  const filtersActive = q !== "" || category !== "all" || status !== "all";

  const sel = useTableSelection(
    `${page}|${sort}|${dir}|${q}|${category}|${status}`,
  );
  const selectedRows = rows.filter((r) => sel.ids.has(r.id));

  const selection: TableSelection<ProductRow> = {
    getRowId: (r) => r.id,
    selectedIds: sel.ids,
    toggleRow: sel.toggleRow,
    toggleVisible: sel.toggleVisible,
    renderBar: () => (
      <BulkBar count={sel.ids.size} noun="product" onClear={sel.clear}>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            downloadCsv(
              "products.csv",
              toCsv(selectedRows, [
                { header: "Name", value: (r) => r.name },
                { header: "SKU", value: (r) => r.sku },
                { header: "Category", value: (r) => r.category },
                { header: "Price", value: (r) => r.price },
                { header: "Stock", value: (r) => r.stock },
                { header: "Status", value: (r) => r.status },
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
            noun="product"
            onDelete={() => deleteProducts([...sel.ids])}
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
      description="No products match your current search and filters."
      action={
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setParams({ q: null, category: null, status: null, page: 1 })
          }
        >
          Clear filters
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={Package}
      title="No products yet"
      description={
        canWrite
          ? "Add your first product to start building the catalog."
          : "Products will show up here once they're added."
      }
      action={
        canWrite ? (
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            New product
          </Button>
        ) : undefined
      }
    />
  );

  const columns = useMemo<ColumnDef<ProductRow>[]>(() => {
    if (!canWrite) return baseColumns;
    return [
      ...baseColumns,
      {
        id: "actions",
        header: "",
        meta: { align: "right" } as ColMeta,
        cell: ({ row }) => (
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <ProductRowActions product={row.original} />
          </div>
        ),
      },
    ];
  }, [canWrite]);

  const activeFilters: ActiveFilter[] = [
    ...(q ? [{ key: "q", label: `“${q}”` }] : []),
    ...(category !== "all"
      ? [{ key: "category", label: `Category: ${category}` }]
      : []),
    ...(status !== "all"
      ? [{ key: "status", label: `Status: ${capitalize(status)}` }]
      : []),
  ];

  const toolbar = (
    <div className="space-y-3">
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
          options={PRODUCT_STATUS.map((s) => ({
            value: s,
            label: capitalize(s),
          }))}
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
        renderCard={(p) => (
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div
                className="flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold"
                style={hueTint(categoryHue(p.category))}
              >
                {p.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{p.name}</p>
                <p className="truncate font-mono text-xs text-muted-foreground">
                  {p.sku}
                </p>
              </div>
              <span className="tabular-nums text-sm font-medium">
                {currency(Number(p.price))}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <DotBadge
                color={`oklch(0.62 0.17 ${categoryHue(p.category)})`}
              >
                {p.category}
              </DotBadge>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="tabular-nums">
                  {fmtNumber(p.stock)} in stock
                </span>
                <StatusBadge status={p.status} />
              </div>
            </div>
          </div>
        )}
      />
      <ProductDetailSheet
        product={detail}
        onOpenChange={(open) => !open && setDetail(null)}
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
