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
  pending: "var(--status-pending)",
  paid: "var(--status-paid)",
  shipped: "var(--status-shipped)",
  delivered: "var(--status-delivered)",
  cancelled: "var(--status-cancelled)",
  refunded: "var(--status-refunded)",
  active: "var(--status-delivered)",
  archived: "var(--status-refunded)",
};
