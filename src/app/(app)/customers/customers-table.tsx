"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { shortDate } from "@/lib/format";
import { DataTable, type ColMeta } from "@/components/data-table/data-table";
import { TableSearch } from "@/components/data-table/table-search";
import { FilterSelect } from "@/components/data-table/filter-select";
import { Button } from "@/components/ui/button";
import { CustomerFormDialog } from "./customer-form-dialog";
import { CustomerRowActions } from "./customer-row-actions";
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
  const [createOpen, setCreateOpen] = useState(false);

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

  const toolbar = (
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
        emptyMessage="No customers match your filters."
        toolbar={toolbar}
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
