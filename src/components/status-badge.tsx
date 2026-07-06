import { capitalize } from "@/lib/format";
import { STATUS_COLOR } from "@/lib/status";
import { DotBadge } from "@/components/dot-badge";

export function StatusBadge({ status }: { status: string }) {
  return (
    <DotBadge color={STATUS_COLOR[status] ?? "var(--muted-foreground)"}>
      {capitalize(status)}
    </DotBadge>
  );
}
