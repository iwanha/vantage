import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { UsersTable, type UserRow } from "./users-table";

export default async function UsersPage() {
  const profile = await getProfile();
  if (profile?.role !== "admin") redirect("/dashboard");

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, email, role, created_at")
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight">Users &amp; roles</h1>
        <p className="text-sm text-muted-foreground">
          Manage who can view vs. edit. Roles are enforced by Postgres
          row-level security — not just the UI.
        </p>
      </div>
      <UsersTable
        users={(data ?? []) as UserRow[]}
        currentUserId={profile.userId}
      />
    </div>
  );
}
