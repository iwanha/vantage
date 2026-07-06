"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useMounted } from "@/lib/use-mounted";

type Point = { month: string; orders: number };

export function OrdersChart({ data }: { data: Point[] }) {
  const mounted = useMounted();
  if (!mounted) return <Skeleton className="h-[260px] w-full" />;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          minTickGap={16}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
        />
        <YAxis
          width={40}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
        />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
            color: "var(--popover-foreground)",
          }}
          formatter={(v) => [v, "Orders"]}
        />
        <Bar
          dataKey="orders"
          fill="var(--primary)"
          radius={[6, 6, 0, 0]}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
