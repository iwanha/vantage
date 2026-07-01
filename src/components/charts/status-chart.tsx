"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { capitalize } from "@/lib/format";
import { STATUS_COLOR } from "@/lib/status";

type Point = { status: string; count: number };

export function StatusChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 8, right: 16, top: 8, bottom: 0 }}
      >
        <XAxis
          type="number"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
        />
        <YAxis
          type="category"
          dataKey="status"
          width={80}
          tickLine={false}
          axisLine={false}
          tickFormatter={capitalize}
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
        <Bar dataKey="count" radius={[0, 6, 6, 0]}>
          {data.map((d) => (
            <Cell
              key={d.status}
              fill={STATUS_COLOR[d.status] ?? "var(--primary)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
