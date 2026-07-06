import { DollarSign, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { StatusChart } from "@/components/charts/status-chart";
import { OrdersChart } from "@/components/charts/orders-chart";
import { currency, number } from "@/lib/format";
import { STATUS_ORDER } from "@/lib/status";
import { PageHeader } from "@/components/page-header";
import { DashboardRange } from "./range-toggle";
import { DEFAULT_RANGE, rangeMonths } from "./ranges";

const REVENUE = new Set(["paid", "shipped", "delivered"]);

type OrderRow = { total_amount: number; status: string; created_at: string };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const sp = await searchParams;
  const range = sp.range ?? DEFAULT_RANGE;
  const monthsN = rangeMonths(range);

  const supabase = await createClient();
  const [{ data: orders }, { count: customerCount }, { count: productCount }] =
    await Promise.all([
      supabase.from("orders").select("total_amount, status, created_at"),
      supabase.from("customers").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }),
    ]);

  const all = (orders ?? []) as OrderRow[];

  // revenue + order volume by month, over the selected window. The window ends
  // at the last *completed* month — the current partial month would otherwise
  // dive to ~0 on the right edge and read as broken (F-03).
  const now = new Date();
  const months = Array.from({ length: monthsN }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (monthsN - i), 1);
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      month: d.toLocaleDateString("en-US", { month: "short" }),
      revenue: 0,
      orders: 0,
    };
  });
  const monthIdx = new Map(months.map((m, i) => [m.key, i]));
  for (const o of all) {
    const d = new Date(o.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const i = monthIdx.get(key);
    if (i === undefined) continue;
    months[i].orders += 1;
    if (REVENUE.has(o.status)) months[i].revenue += Number(o.total_amount);
  }

  // KPI window: everything since the start of the selected range.
  const windowStart = new Date(
    now.getFullYear(),
    now.getMonth() - monthsN,
    1,
  ).getTime();
  const prevStart = new Date(
    now.getFullYear(),
    now.getMonth() - monthsN * 2,
    1,
  ).getTime();

  const inRange = (from: number, to: number) => (o: OrderRow) => {
    const ts = new Date(o.created_at).getTime();
    return ts >= from && ts < to;
  };
  const windowed = all.filter(inRange(windowStart, now.getTime()));
  const prevWindowed = all.filter(inRange(prevStart, windowStart));

  const statusCounts = STATUS_ORDER.map((s) => ({
    status: s,
    count: windowed.filter((o) => o.status === s).length,
  })).filter((s) => s.count > 0);

  const realized = windowed.filter((o) => REVENUE.has(o.status));
  const revenue = realized.reduce((s, o) => s + Number(o.total_amount), 0);
  const aov = realized.length ? revenue / realized.length : 0;

  const prevRevenue = prevWindowed
    .filter((o) => REVENUE.has(o.status))
    .reduce((s, o) => s + Number(o.total_amount), 0);

  const pct = (a: number, b: number) => (b ? ((a - b) / b) * 100 : null);
  const revDelta = pct(revenue, prevRevenue);
  const ordDelta = pct(windowed.length, prevWindowed.length);
  const prevHint = `vs prev ${monthsN}mo`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of orders, revenue and customers across the store."
        actions={<DashboardRange value={range} />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Revenue"
          value={currency(revenue)}
          icon={DollarSign}
          delta={revDelta}
          hint={prevHint}
        />
        <MetricCard
          label="Orders"
          value={number(windowed.length)}
          icon={ShoppingCart}
          delta={ordDelta}
          hint={prevHint}
        />
        <MetricCard
          label="Avg order value"
          value={currency(aov)}
          icon={TrendingUp}
          hint="realized orders"
        />
        <MetricCard
          label="Customers"
          value={number(customerCount ?? 0)}
          icon={Users}
          hint={`${number(productCount ?? 0)} products`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Revenue</CardTitle>
            <CardDescription>
              Last {monthsN} months · realized orders
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <RevenueChart
              data={months.map((m) => ({
                month: m.month,
                revenue: Math.round(m.revenue),
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orders by status</CardTitle>
            <CardDescription>Selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusChart data={statusCounts} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Orders per month</CardTitle>
          <CardDescription>Volume over the last {monthsN} months</CardDescription>
        </CardHeader>
        <CardContent className="pl-0">
          <OrdersChart
            data={months.map((m) => ({ month: m.month, orders: m.orders }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
