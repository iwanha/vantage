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
import { currency, number } from "@/lib/format";
import { STATUS_ORDER } from "@/lib/status";

const REVENUE = new Set(["paid", "shipped", "delivered"]);
const DAY = 86400000;

type OrderRow = { total_amount: number; status: string; created_at: string };

export default async function DashboardPage() {
  const supabase = await createClient();
  const [{ data: orders }, { count: customerCount }, { count: productCount }] =
    await Promise.all([
      supabase.from("orders").select("total_amount, status, created_at"),
      supabase.from("customers").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }),
    ]);

  const all = (orders ?? []) as OrderRow[];

  // revenue by month (last 12 months)
  const now = new Date();
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      month: d.toLocaleDateString("en-US", { month: "short" }),
      revenue: 0,
    };
  });
  const monthIdx = new Map(months.map((m, i) => [m.key, i]));
  for (const o of all) {
    if (!REVENUE.has(o.status)) continue;
    const d = new Date(o.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const i = monthIdx.get(key);
    if (i !== undefined) months[i].revenue += Number(o.total_amount);
  }

  // orders by status
  const statusCounts = STATUS_ORDER.map((s) => ({
    status: s,
    count: all.filter((o) => o.status === s).length,
  }));

  // totals + 30-day momentum
  const realized = all.filter((o) => REVENUE.has(o.status));
  const revenue = realized.reduce((s, o) => s + Number(o.total_amount), 0);
  const aov = realized.length ? revenue / realized.length : 0;

  const t = now.getTime();
  const revIn = (from: number, to: number) =>
    all
      .filter((o) => REVENUE.has(o.status))
      .filter((o) => {
        const ts = new Date(o.created_at).getTime();
        return ts >= t - from * DAY && ts < t - to * DAY;
      })
      .reduce((s, o) => s + Number(o.total_amount), 0);
  const ordIn = (from: number, to: number) =>
    all.filter((o) => {
      const ts = new Date(o.created_at).getTime();
      return ts >= t - from * DAY && ts < t - to * DAY;
    }).length;

  const pct = (a: number, b: number) => (b ? ((a - b) / b) * 100 : null);
  const revDelta = pct(revIn(30, 0), revIn(60, 30));
  const ordDelta = pct(ordIn(30, 0), ordIn(60, 30));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of orders, revenue and customers across the store.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Revenue"
          value={currency(revenue)}
          icon={DollarSign}
          delta={revDelta}
          hint="vs prev 30d"
        />
        <MetricCard
          label="Orders"
          value={number(all.length)}
          icon={ShoppingCart}
          delta={ordDelta}
          hint="vs prev 30d"
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
            <CardDescription>Last 12 months · realized orders</CardDescription>
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
            <CardDescription>All time</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <StatusChart data={statusCounts} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
