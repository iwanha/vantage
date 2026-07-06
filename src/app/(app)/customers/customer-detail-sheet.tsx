"use client";

import { useState, type ReactNode } from "react";
import { shortDate } from "@/lib/format";
import { initials, hueFromString, hueTint } from "@/lib/cells";
import { countryName, flagEmoji } from "@/lib/countries";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { CustomerRow } from "./customers-table";

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

export function CustomerDetailSheet({
  customer,
  onOpenChange,
}: {
  customer: CustomerRow | null;
  onOpenChange: (open: boolean) => void;
}) {
  // keep the last row rendered through the close animation (render-phase update)
  const [cached, setCached] = useState<CustomerRow | null>(customer);
  if (customer && customer !== cached) setCached(customer);

  const c = customer ?? cached;

  return (
    <Sheet open={!!customer} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        {c && (
          <>
            <SheetHeader className="gap-2">
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarFallback
                    className="text-sm font-medium"
                    style={hueTint(hueFromString(c.name))}
                  >
                    {initials(c.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <SheetTitle className="truncate text-base">
                    {c.name}
                  </SheetTitle>
                  <SheetDescription className="truncate">
                    {c.email}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="px-4">
              <dl>
                <Field label="Email">{c.email}</Field>
                <Field label="Country">
                  <span className="inline-flex items-center gap-2">
                    <span className="text-base leading-none">
                      {flagEmoji(c.country)}
                    </span>
                    {countryName(c.country)}
                  </span>
                </Field>
                <Field label="Customer since">
                  {shortDate(c.created_at)}
                </Field>
                <Field label="Customer ID">
                  <span className="font-mono text-xs text-muted-foreground">
                    {c.id}
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
