"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Download, Plus, SearchX, Users } from "lucide-react";
import { shortDate } from "@/lib/format";
import { initials, hueFromString, hueTint } from "@/lib/cells";
import { countryName, flagEmoji } from "@/lib/countries";
import { toCsv, downloadCsv } from "@/lib/csv";
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
import { CustomerFormDialog } from "./customer-form-dialog";
import { CustomerRowActions } from "./customer-row-actions";
import { CustomerDetailSheet } from "./customer-detail-sheet";
import { deleteCustomers } from "./actions";
import { COUNTRIES } from "./constants";

export type CustomerRow = {
  id: string;
  name: string;
  email: string;
  country: string;
  created_at: string;
};

const baseColumns: ColumnDef<CustomerRow>[] = [
  {
    accessorKey: "name",
    header: "Name",
    meta: { sortKey: "name" } as ColMeta,
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <Avatar className="size-8">
          <AvatarFallback
            className="text-xs font-medium"
            style={hueTint(hueFromString(row.original.name))}
          >
            {initials(row.original.name)}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium">{row.original.name}</span>
      </div>
    ),
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
      <span className="inline-flex items-center gap-2">
        <span className="text-base leading-none">
          {flagEmoji(row.original.country)}
        </span>
        <span>{countryName(row.original.country)}</span>
      </span>
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
  const [createOpen, setCreateOpen] = useState(false);
  const [detail, setDetail] = useState<CustomerRow | null>(null);
  const { setParams } = useTableParams();
  const filtersActive = q !== "" || country !== "all";

  const sel = useTableSelection(`${page}|${sort}|${dir}|${q}|${country}`);
  const selectedRows = rows.filter((r) => sel.ids.has(r.id));

  const selection: TableSelection<CustomerRow> = {
    getRowId: (r) => r.id,
    selectedIds: sel.ids,
    toggleRow: sel.toggleRow,
    toggleVisible: sel.toggleVisible,
    renderBar: () => (
      <BulkBar count={sel.ids.size} noun="customer" onClear={sel.clear}>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            downloadCsv(
              "customers.csv",
              toCsv(selectedRows, [
                { header: "Name", value: (r) => r.name },
                { header: "Email", value: (r) => r.email },
                { header: "Country", value: (r) => countryName(r.country) },
                { header: "Joined", value: (r) => shortDate(r.created_at) },
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
            noun="customer"
            onDelete={() => deleteCustomers([...sel.ids])}
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
      description="No customers match your current search and filters."
      action={
        <Button
          variant="outline"
          size="sm"
          onClick={() => setParams({ q: null, country: null, page: 1 })}
        >
          Clear filters
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={Users}
      title="No customers yet"
      description={
        canWrite
          ? "Add your first customer to start building the directory."
          : "Customers will show up here once they're added."
      }
      action={
        canWrite ? (
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            New customer
          </Button>
        ) : undefined
      }
    />
  );

  const columns = useMemo<ColumnDef<CustomerRow>[]>(() => {
    if (!canWrite) return baseColumns;
    return [
      ...baseColumns,
      {
        id: "actions",
        header: "",
        meta: { align: "right" } as ColMeta,
        cell: ({ row }) => (
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <CustomerRowActions customer={row.original} />
          </div>
        ),
      },
    ];
  }, [canWrite]);

  const activeFilters: ActiveFilter[] = [
    ...(q ? [{ key: "q", label: `“${q}”` }] : []),
    ...(country !== "all"
      ? [{ key: "country", label: `Country: ${countryName(country)}` }]
      : []),
  ];

  const toolbar = (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <TableSearch placeholder="Search name or email…" defaultValue={q} />
        <FilterSelect
          paramKey="country"
          value={country}
          allLabel="All countries"
          options={COUNTRIES.map((c) => ({ value: c, label: c }))}
        />
        <div className="ml-auto flex items-center gap-4">
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
        renderCard={(c) => (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <Avatar className="size-8">
                <AvatarFallback
                  className="text-xs font-medium"
                  style={hueTint(hueFromString(c.name))}
                >
                  {initials(c.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium">{c.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {c.email}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="text-sm leading-none">
                  {flagEmoji(c.country)}
                </span>
                {countryName(c.country)}
              </span>
              <span>{shortDate(c.created_at)}</span>
            </div>
          </div>
        )}
      />
      <CustomerDetailSheet
        customer={detail}
        onOpenChange={(open) => !open && setDetail(null)}
      />
      {canWrite && (
        <CustomerFormDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          mode="create"
        />
      )}
    </>
  );
}
