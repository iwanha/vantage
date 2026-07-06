import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { ProductsTable, type ProductRow } from "./products-table";
import { PageHeader } from "@/components/page-header";

const SORTABLE = ["name", "sku", "category", "price", "stock", "created_at"];

type SP = {
  page?: string;
  size?: string;
  sort?: string;
  dir?: string;
  category?: string;
  status?: string;
  q?: string;
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const pageSize = [10, 25, 50].includes(Number(sp.size)) ? Number(sp.size) : 25;
  const sort = SORTABLE.includes(sp.sort ?? "") ? sp.sort! : "name";
  const dir: "asc" | "desc" = sp.dir === "desc" ? "desc" : "asc";
  const category = sp.category ?? "all";
  const status = sp.status ?? "all";
  const q = (sp.q ?? "").trim();

  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("id, name, sku, category, price, stock, status, created_at", {
      count: "exact",
    });

  if (category !== "all") query = query.eq("category", category);
  if (status !== "all") query = query.eq("status", status);
  if (q) query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%`);

  const fromRow = (page - 1) * pageSize;
  const [{ data, count }, profile] = await Promise.all([
    query.order(sort, { ascending: dir === "asc" }).range(fromRow, fromRow + pageSize - 1),
    getProfile(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Catalog with server-side search, category and status filters."
      />
      <ProductsTable
        rows={(data ?? []) as ProductRow[]}
        total={count ?? 0}
        page={page}
        pageSize={pageSize}
        sort={sort}
        dir={dir}
        category={category}
        status={status}
        q={q}
        canWrite={profile?.role === "admin"}
      />
    </div>
  );
}
