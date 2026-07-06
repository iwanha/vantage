"use client";

import { useState, type ReactNode } from "react";
import { currencyPrecise, number as fmtNumber, shortDate } from "@/lib/format";
import { categoryHue, hueTint } from "@/lib/cells";
import { StatusBadge } from "@/components/status-badge";
import { DotBadge } from "@/components/dot-badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ProductRow } from "./products-table";

const LOW_STOCK = 10;

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

export function ProductDetailSheet({
  product,
  onOpenChange,
}: {
  product: ProductRow | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [cached, setCached] = useState<ProductRow | null>(product);
  if (product && product !== cached) setCached(product);

  const p = product ?? cached;

  return (
    <Sheet open={!!product} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        {p && (
          <>
            <SheetHeader className="gap-2">
              <div className="flex items-center gap-3">
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-md text-sm font-semibold"
                  style={hueTint(categoryHue(p.category))}
                >
                  {p.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <SheetTitle className="truncate text-base">
                    {p.name}
                  </SheetTitle>
                  <SheetDescription className="font-mono">
                    {p.sku}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="px-4">
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Price
                </p>
                <p className="mt-1 font-display text-3xl tracking-tight tabular-nums">
                  {currencyPrecise(Number(p.price))}
                </p>
              </div>

              <dl className="mt-4">
                <Field label="Category">
                  <DotBadge color={`oklch(0.62 0.17 ${categoryHue(p.category)})`}>
                    {p.category}
                  </DotBadge>
                </Field>
                <Field label="Stock">
                  <span className="inline-flex items-center gap-2 tabular-nums">
                    {fmtNumber(p.stock)}
                    {p.stock === 0 ? (
                      <span className="rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
                        Out
                      </span>
                    ) : p.stock < LOW_STOCK ? (
                      <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-500">
                        Low
                      </span>
                    ) : null}
                  </span>
                </Field>
                <Field label="Status">
                  <StatusBadge status={p.status} />
                </Field>
                <Field label="Added">{shortDate(p.created_at)}</Field>
                <Field label="Product ID">
                  <span className="font-mono text-xs text-muted-foreground">
                    {p.id}
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
