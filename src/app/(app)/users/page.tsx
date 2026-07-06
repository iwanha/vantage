import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { UsersTable, type UserRow } from "./users-table";
import { PageHeader } from "@/components/page-header";

const SORTABLE = ["email", "role", "created_at"];

type SP = {
  page?: string;
  size?: string;
  sort?: string;
  dir?: string;
  role?: string;
  q?: string;
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const profile = await getProfile();
  if (profile?.role !== "admin") redirect("/dashboard");

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const pageSize = [10, 25, 50].includes(Number(sp.size)) ? Number(sp.size) : 25;
  const sort = SORTABLE.includes(sp.sort ?? "") ? sp.sort! : "created_at";
  const dir: "asc" | "desc" = sp.dir === "desc" ? "desc" : "asc";
  const role = sp.role ?? "all";
  const q = (sp.q ?? "").trim();

  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select("id, email, role, created_at", { count: "exact" });

  if (role !== "all") query = query.eq("role", role);
  if (q) query = query.ilike("email", `%${q}%`);

  const fromRow = (page - 1) * pageSize;
  const { data, count } = await query
    .order(sort, { ascending: dir === "asc" })
    .range(fromRow, fromRow + pageSize - 1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users & roles"
        description="Manage who can view vs. edit. Roles are enforced by Postgres row-level security — not just the UI."
      />
      <UsersTable
        rows={(data ?? []) as UserRow[]}
        total={count ?? 0}
        page={page}
        pageSize={pageSize}
        sort={sort}
        dir={dir}
        role={role}
        q={q}
        currentUserId={profile.userId}
      />
    </div>
  );
}
