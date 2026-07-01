export const STATUS_ORDER = [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

// Single source of truth for status colors (charts + badges).
export const STATUS_COLOR: Record<string, string> = {
  pending: "var(--chart-4)",
  paid: "var(--chart-2)",
  shipped: "var(--chart-3)",
  delivered: "var(--chart-1)",
  cancelled: "var(--muted-foreground)",
  refunded: "var(--chart-5)",
};
