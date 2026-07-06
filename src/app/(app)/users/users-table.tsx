"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { SearchX, Users } from "lucide-react";
import { toast } from "sonner";
import { capitalize, shortDate } from "@/lib/format";
import { hueFromString, hueTint } from "@/lib/cells";
import { updateUserRole } from "./actions";
import { DataTable, type ColMeta } from "@/components/data-table/data-table";
import { TableSearch } from "@/components/data-table/table-search";
import { FilterSelect } from "@/components/data-table/filter-select";
import { useTableParams } from "@/components/data-table/table-params";
import {
  ActiveFilters,
  type ActiveFilter,
} from "@/components/data-table/active-filters";
import { EmptyState } from "@/components/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type UserRow = {
  id: string;
  email: string;
  role: "admin" | "viewer";
  created_at: string;
};

interface Props {
  rows: UserRow[];
  total: number;
  page: number;
  pageSize: number;
  sort: string;
  dir: "asc" | "desc";
  role: string;
  q: string;
  currentUserId: string;
}

export function UsersTable({
  rows,
  total,
  page,
  pageSize,
  sort,
  dir,
  role,
  q,
  currentUserId,
}: Props) {
  const router = useRouter();
  const { setParams } = useTableParams();
  const [savingId, setSavingId] = useState<string | null>(null);
  const filtersActive = q !== "" || role !== "all";

  async function onRole(id: string, next: string) {
    setSavingId(id);
    const result = await updateUserRole(id, next);
    setSavingId(null);
    if (result.ok) {
      toast.success("Role updated");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  const columns = useMemo<ColumnDef<UserRow>[]>(
    () => [
      {
        accessorKey: "email",
        header: "User",
        meta: { sortKey: "email" } as ColMeta,
        cell: ({ row }) => {
          const self = row.original.id === currentUserId;
          return (
            <div className="flex items-center gap-2.5">
              <Avatar className="size-8">
                <AvatarFallback
                  className="text-xs font-medium"
                  style={hueTint(hueFromString(row.original.email))}
                >
                  {row.original.email.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">
                {row.original.email}
                {self && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    (you)
                  </span>
                )}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "role",
        header: "Role",
        meta: { sortKey: "role" } as ColMeta,
        cell: ({ row }) => {
          const self = row.original.id === currentUserId;
          return (
            <Select
              value={row.original.role}
              disabled={self || savingId === row.original.id}
              onValueChange={(v) => {
                if (v) onRole(row.original.id, v);
              }}
            >
              <SelectTrigger className="w-32" aria-label="Role">
                <SelectValue>
                  {(value) => capitalize(String(value))}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          );
        },
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
    ],
    // onRole only closes over stable refs; re-memo on identity + saving state.
    [currentUserId, savingId], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const activeFilters: ActiveFilter[] = [
    ...(q ? [{ key: "q", label: `“${q}”` }] : []),
    ...(role !== "all" ? [{ key: "role", label: `Role: ${capitalize(role)}` }] : []),
  ];

  const toolbar = (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <TableSearch placeholder="Search email…" defaultValue={q} />
        <FilterSelect
          paramKey="role"
          value={role}
          allLabel="All roles"
          width="w-36"
          options={[
            { value: "admin", label: "Admin" },
            { value: "viewer", label: "Viewer" },
          ]}
        />
        <span className="ml-auto font-mono text-xs tabular-nums text-muted-foreground">
          {total.toLocaleString()} users
        </span>
      </div>
      <ActiveFilters filters={activeFilters} />
    </div>
  );

  const empty = filtersActive ? (
    <EmptyState
      icon={SearchX}
      title="No matches"
      description="No users match your current search and filters."
      action={
        <Button
          variant="outline"
          size="sm"
          onClick={() => setParams({ q: null, role: null, page: 1 })}
        >
          Clear filters
        </Button>
      }
    />
  ) : (
    <EmptyState icon={Users} title="No users found" />
  );

  return (
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
    />
  );
}
