"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { capitalize } from "@/lib/format";
import { STATUS_COLOR } from "@/lib/status";
import { Skeleton } from "@/components/ui/skeleton";
import { useMounted } from "@/lib/use-mounted";

type Point = { status: string; count: number };

export function StatusChart({ data }: { data: Point[] }) {
  const mounted = useMounted();
  if (!mounted) return <Skeleton className="h-[280px] w-full" />;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="status"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
          strokeWidth={0}
          isAnimationActive={false}
        >
          {data.map((d) => (
            <Cell key={d.status} fill={STATUS_COLOR[d.status] ?? "var(--primary)"} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
            color: "var(--popover-foreground)",
          }}
          formatter={(v, n) => [v, capitalize(String(n))]}
        />
        <Legend
          iconType="circle"
          formatter={(value) => capitalize(String(value))}
          wrapperStyle={{ fontSize: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
