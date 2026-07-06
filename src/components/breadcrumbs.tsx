"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  orders: "Orders",
  products: "Products",
  customers: "Customers",
  users: "Users & roles",
  settings: "Settings",
  profile: "Profile",
};

function labelFor(segment: string) {
  return (
    LABELS[segment] ??
    segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
  );
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex items-center gap-1.5 text-sm">
        <li className="flex items-center">
          <Link
            href="/dashboard"
            className="flex items-center text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Dashboard"
          >
            <Home className="size-4" />
          </Link>
        </li>
        {segments.map((seg, i) => {
          const href = "/" + segments.slice(0, i + 1).join("/");
          const last = i === segments.length - 1;
          return (
            <li key={href} className="flex min-w-0 items-center gap-1.5">
              <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" />
              {last ? (
                <span className="truncate font-medium">{labelFor(seg)}</span>
              ) : (
                <Link
                  href={href}
                  className="truncate text-muted-foreground transition-colors hover:text-foreground"
                >
                  {labelFor(seg)}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
