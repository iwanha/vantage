import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { OrdersTable, type OrderRow } from "./orders-table";

const SORTABLE = ["order_number", "status", "total_amount", "created_at"];

type SP = {
  page?: string;
  size?: string;
  sort?: string;
  dir?: string;
  status?: string;
  q?: string;
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const pageSize = [10, 25, 50].includes(Number(sp.size)) ? Number(sp.size) : 10;
  const sort = SORTABLE.includes(sp.sort ?? "") ? sp.sort! : "created_at";
  const dir: "asc" | "desc" = sp.dir === "asc" ? "asc" : "desc";
  const status = sp.status ?? "all";
  const q = (sp.q ?? "").trim();

  const supabase = await createClient();
  let ordersQuery = supabase
    .from("orders")
    .select(
      "id, order_number, customer_id, status, total_amount, currency, created_at, customers(name)",
      { count: "exact" },
    );

  if (status !== "all") ordersQuery = ordersQuery.eq("status", status);
  if (q) ordersQuery = ordersQuery.ilike("order_number", `%${q}%`);

  const fromRow = (page - 1) * pageSize;
  ordersQuery = ordersQuery
    .order(sort, { ascending: dir === "asc" })
    .range(fromRow, fromRow + pageSize - 1);

  const [{ data, count }, { data: customersData }, profile] = await Promise.all([
    ordersQuery,
    supabase.from("customers").select("id, name").order("name"),
    getProfile(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">
          Server-side paginated, filtered and sorted across the full order book.
        </p>
      </div>
      <OrdersTable
        rows={(data ?? []) as unknown as OrderRow[]}
        total={count ?? 0}
        page={page}
        pageSize={pageSize}
        sort={sort}
        dir={dir}
        status={status}
        q={q}
        canWrite={profile?.role === "admin"}
        customers={(customersData ?? []) as { id: string; name: string }[]}
      />
    </div>
  );
}
