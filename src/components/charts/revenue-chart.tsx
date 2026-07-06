"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useMounted } from "@/lib/use-mounted";

type Point = { month: string; revenue: number };

export function RevenueChart({ data }: { data: Point[] }) {
  const mounted = useMounted();
  if (!mounted) return <Skeleton className="h-[280px] w-full" />;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          minTickGap={16}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
        />
        <YAxis
          width={48}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`}
        />
        <Tooltip
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
            color: "var(--popover-foreground)",
          }}
          formatter={(v) => [`$${Number(v).toLocaleString()}`, "Revenue"]}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="var(--primary)"
          strokeWidth={2}
          fill="url(#revFill)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
