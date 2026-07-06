import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { CustomersTable, type CustomerRow } from "./customers-table";
import { PageHeader } from "@/components/page-header";

const SORTABLE = ["name", "email", "country", "created_at"];

type SP = {
  page?: string;
  size?: string;
  sort?: string;
  dir?: string;
  country?: string;
  q?: string;
};

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const pageSize = [10, 25, 50].includes(Number(sp.size)) ? Number(sp.size) : 25;
  const sort = SORTABLE.includes(sp.sort ?? "") ? sp.sort! : "name";
  const dir: "asc" | "desc" = sp.dir === "desc" ? "desc" : "asc";
  const country = sp.country ?? "all";
  const q = (sp.q ?? "").trim();

  const supabase = await createClient();
  let query = supabase
    .from("customers")
    .select("id, name, email, country, created_at", { count: "exact" });

  if (country !== "all") query = query.eq("country", country);
  if (q) query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`);

  const fromRow = (page - 1) * pageSize;
  const [{ data, count }, profile] = await Promise.all([
    query.order(sort, { ascending: dir === "asc" }).range(fromRow, fromRow + pageSize - 1),
    getProfile(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Customer directory with server-side search and country filter."
      />
      <CustomersTable
        rows={(data ?? []) as CustomerRow[]}
        total={count ?? 0}
        page={page}
        pageSize={pageSize}
        sort={sort}
        dir={dir}
        country={country}
        q={q}
        canWrite={profile?.role === "admin"}
      />
    </div>
  );
}
