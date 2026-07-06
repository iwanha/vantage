"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  ShieldCheck,
  Settings,
  UserRound,
  LogOut,
  Search,
  CornerDownLeft,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type Command = {
  id: string;
  label: string;
  group: string;
  icon: LucideIcon;
  keywords?: string;
  run: () => void;
};

export function CommandPalette({ role }: { role: "admin" | "viewer" }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // ⌘K / Ctrl+K toggles the palette from anywhere.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const commands = useMemo<Command[]>(() => {
    const go = (href: string) => () => {
      setOpen(false);
      router.push(href);
    };
    const nav: Command[] = [
      { id: "dashboard", label: "Dashboard", group: "Navigate", icon: LayoutDashboard, keywords: "home overview", run: go("/dashboard") },
      { id: "orders", label: "Orders", group: "Navigate", icon: ShoppingCart, keywords: "order book sales", run: go("/orders") },
      { id: "products", label: "Products", group: "Navigate", icon: Package, keywords: "catalog inventory sku", run: go("/products") },
      { id: "customers", label: "Customers", group: "Navigate", icon: Users, keywords: "people directory", run: go("/customers") },
    ];
    if (role === "admin") {
      nav.push({ id: "users", label: "Users & roles", group: "Navigate", icon: ShieldCheck, keywords: "admin permissions rls", run: go("/users") });
    }
    const account: Command[] = [
      { id: "profile", label: "Profile", group: "Account", icon: UserRound, keywords: "me account", run: go("/profile") },
      { id: "settings", label: "Settings", group: "Account", icon: Settings, keywords: "preferences appearance", run: go("/settings") },
      {
        id: "signout",
        label: "Sign out",
        group: "Account",
        icon: LogOut,
        keywords: "logout leave",
        run: async () => {
          setOpen(false);
          await createClient().auth.signOut();
          router.push("/login");
          router.refresh();
        },
      },
    ];
    return [...nav, ...account];
  }, [role, router]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        (c.keywords ?? "").toLowerCase().includes(q),
    );
  }, [commands, query]);

  function onQueryChange(value: string) {
    setQuery(value);
    setActive(0); // reset highlight to the top as the result set changes
  }

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setQuery("");
      setActive(0);
    }
  }

  function onInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      results[active]?.run();
    }
  }

  // group the filtered results while preserving order
  const groups = useMemo(() => {
    const map = new Map<string, Command[]>();
    for (const c of results) {
      const arr = map.get(c.group) ?? [];
      arr.push(c);
      map.set(c.group, arr);
    }
    return [...map.entries()];
  }, [results]);

  let flatIndex = -1;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-2 rounded-md border bg-background px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted sm:w-56"
        aria-label="Open command palette"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Search…</span>
        <kbd className="ml-auto hidden rounded border bg-muted px-1.5 font-mono text-[10px] sm:inline">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="top-[15%] max-w-lg translate-y-0 gap-0 p-0 sm:max-w-lg"
        >
          <DialogTitle className="sr-only">Command palette</DialogTitle>
          <div className="flex items-center gap-2 border-b px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder="Search pages and actions…"
              className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div ref={listRef} className="max-h-80 overflow-y-auto p-1.5">
            {results.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                No results for “{query}”.
              </p>
            ) : (
              groups.map(([group, items]) => (
                <div key={group} className="mb-1 last:mb-0">
                  <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    {group}
                  </p>
                  {items.map((c) => {
                    flatIndex += 1;
                    const idx = flatIndex;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => c.run()}
                        onMouseMove={() => setActive(idx)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm transition-colors",
                          active === idx
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground",
                        )}
                      >
                        <c.icon className="size-4 text-muted-foreground" />
                        {c.label}
                        {active === idx && (
                          <CornerDownLeft className="ml-auto size-3.5 text-muted-foreground" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
