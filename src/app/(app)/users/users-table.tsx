"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { capitalize, shortDate } from "@/lib/format";
import { updateUserRole } from "./actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

export type UserRow = {
  id: string;
  email: string;
  role: "admin" | "viewer";
  created_at: string;
};

export function UsersTable({
  users,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [savingId, setSavingId] = useState<string | null>(null);

  async function onRole(id: string, role: string) {
    setSavingId(id);
    const result = await updateUserRole(id, role);
    setSavingId(null);
    if (result.ok) {
      toast.success("Role updated");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="h-10 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              User
            </TableHead>
            <TableHead className="h-10 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Role
            </TableHead>
            <TableHead className="h-10 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Joined
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => {
            const self = u.id === currentUserId;
            return (
              <TableRow key={u.id}>
                <TableCell className="py-2.5">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className="text-xs">
                        {u.email.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>
                      {u.email}
                      {self && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (you)
                        </span>
                      )}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-2.5">
                  <Select
                    value={u.role}
                    disabled={self || savingId === u.id}
                    onValueChange={(v) => {
                      if (v) onRole(u.id, v);
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
                </TableCell>
                <TableCell className="py-2.5 text-muted-foreground">
                  {shortDate(u.created_at)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
