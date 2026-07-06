"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTableParams } from "./table-params";
import { TablePagination } from "./table-pagination";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type ColMeta = { sortKey?: string; align?: "right" };

export interface TableSelection<T> {
  getRowId: (row: T) => string;
  selectedIds: Set<string>;
  toggleRow: (id: string) => void;
  toggleVisible: (ids: string[], checked: boolean) => void;
  renderBar: () => React.ReactNode;
}

interface Props<T> {
  columns: ColumnDef<T>[];
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  sort: string;
  dir: "asc" | "desc";
  empty: React.ReactNode;
  toolbar?: React.ReactNode;
  onRowClick?: (row: T) => void;
  selection?: TableSelection<T>;
  // Mobile (<md) card renderer; when provided the table collapses to cards.
  renderCard?: (row: T) => React.ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  total,
  page,
  pageSize,
  sort,
  dir,
  empty,
  toolbar,
  onRowClick,
  selection,
  renderCard,
}: Props<T>) {
  const { setParams } = useTableParams();

  function toggleSort(key: string) {
    if (sort === key) setParams({ dir: dir === "asc" ? "desc" : "asc" });
    else setParams({ sort: key, dir: "asc" });
  }

  // Optionally prepend a selection checkbox column driven by the parent's state.
  const visibleIds = selection ? rows.map(selection.getRowId) : [];
  const allSelected =
    !!selection &&
    visibleIds.length > 0 &&
    visibleIds.every((id) => selection.selectedIds.has(id));
  const someSelected =
    !!selection && visibleIds.some((id) => selection.selectedIds.has(id));

  const columnsToRender: ColumnDef<T>[] = selection
    ? [
        {
          id: "select",
          header: () => (
            <Checkbox
              aria-label="Select all rows on this page"
              checked={allSelected}
              indeterminate={!allSelected && someSelected}
              onCheckedChange={(checked) =>
                selection.toggleVisible(visibleIds, checked === true)
              }
            />
          ),
          cell: ({ row }) => {
            const id = selection.getRowId(row.original);
            return (
              <div onClick={(e) => e.stopPropagation()} className="flex">
                <Checkbox
                  aria-label="Select row"
                  checked={selection.selectedIds.has(id)}
                  onCheckedChange={() => selection.toggleRow(id)}
                />
              </div>
            );
          },
        },
        ...columns,
      ]
    : columns;

  const table = useReactTable({
    data: rows,
    columns: columnsToRender,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  });

  return (
    <div className="space-y-4">
      {toolbar}

      {selection && selection.selectedIds.size > 0 ? selection.renderBar() : null}

      <div
        className={cn(
          "overflow-hidden rounded-lg border",
          renderCard && "hidden md:block",
        )}
      >
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
                <TableRow
                  key={row.id}
                  onClick={
                    onRowClick ? () => onRowClick(row.original) : undefined
                  }
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={
                    onRowClick
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onRowClick(row.original);
                          }
                        }
                      : undefined
                  }
                  className={cn(onRowClick && "cursor-pointer")}
                >
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
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columnsToRender.length} className="p-0">
                  {empty}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {renderCard && (
        <div className="grid gap-2 md:hidden">
          {rows.length ? (
            rows.map((row) => {
              const id = selection?.getRowId(row);
              return (
                <div
                  key={id ?? undefined}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border bg-card p-3",
                    onRowClick && "cursor-pointer",
                  )}
                >
                  {selection && id != null && (
                    <div onClick={(e) => e.stopPropagation()} className="pt-0.5">
                      <Checkbox
                        aria-label="Select row"
                        checked={selection.selectedIds.has(id)}
                        onCheckedChange={() => selection.toggleRow(id)}
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">{renderCard(row)}</div>
                </div>
              );
            })
          ) : (
            <div className="rounded-lg border">{empty}</div>
          )}
        </div>
      )}

      <TablePagination page={page} pageSize={pageSize} total={total} />
    </div>
  );
}
