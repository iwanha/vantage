"use client";

import { useState, type ReactNode } from "react";
import { currency, shortDate } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { OrderRow } from "./orders-table";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-3 last:border-0">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-right text-sm font-medium text-foreground">
        {children}
      </dd>
    </div>
  );
}

export function OrderDetailSheet({
  order,
  onOpenChange,
}: {
  order: OrderRow | null;
  onOpenChange: (open: boolean) => void;
}) {
  // keep the last order rendered through the close animation — adjust state
  // during render (React's blessed pattern) rather than in an effect
  const [cached, setCached] = useState<OrderRow | null>(order);
  if (order && order !== cached) setCached(order);

  const o = order ?? cached;

  return (
    <Sheet open={!!order} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        {o && (
          <>
            <SheetHeader className="gap-2">
              <div className="flex items-center gap-3">
                <SheetTitle className="font-mono text-base">
                  {o.order_number}
                </SheetTitle>
                <StatusBadge status={o.status} />
              </div>
              <SheetDescription>Placed {shortDate(o.created_at)}</SheetDescription>
            </SheetHeader>

            <div className="px-4">
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Total
                </p>
                <p className="mt-1 font-display text-3xl tracking-tight tabular-nums">
                  {currency(Number(o.total_amount), o.currency)}
                </p>
              </div>

              <dl className="mt-4">
                <Field label="Customer">{o.customers?.name ?? "—"}</Field>
                <Field label="Status">
                  <StatusBadge status={o.status} />
                </Field>
                <Field label="Currency">{o.currency}</Field>
                <Field label="Order date">{shortDate(o.created_at)}</Field>
                <Field label="Order ID">
                  <span className="font-mono text-xs text-muted-foreground">
                    {o.id}
                  </span>
                </Field>
              </dl>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
