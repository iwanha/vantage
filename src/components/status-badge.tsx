import { capitalize } from "@/lib/format";
import { STATUS_COLOR } from "@/lib/status";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium">
      <span
        className="size-1.5 rounded-full"
        style={{ background: STATUS_COLOR[status] ?? "var(--muted-foreground)" }}
      />
      {capitalize(status)}
    </span>
  );
}
