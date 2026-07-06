// Dashboard time windows. Kept month-based (order data spans ~1 year) so the
// charts never show empty trailing months.
export const DASHBOARD_RANGES = [
  { key: "3m", label: "3M", months: 3 },
  { key: "6m", label: "6M", months: 6 },
  { key: "12m", label: "12M", months: 12 },
] as const;

export type RangeKey = (typeof DASHBOARD_RANGES)[number]["key"];
export const DEFAULT_RANGE: RangeKey = "12m";

export function rangeMonths(key: string | undefined): number {
  return DASHBOARD_RANGES.find((r) => r.key === key)?.months ?? 12;
}
