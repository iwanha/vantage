"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  ShieldCheck,
  Settings,
  UserRound,
  LogOut,
  Menu,
  Code2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SOURCE_URL } from "@/lib/site";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { ThemeCustomizer } from "@/components/theme-customizer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CommandPalette } from "@/components/command-palette";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const baseNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/products", label: "Products", icon: Package },
  { href: "/customers", label: "Customers", icon: Users },
];

function SidebarNav({
  nav,
  pathname,
  onNavigate,
}: {
  nav: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex h-14 items-center gap-2 border-b px-5">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <BarChart3 className="size-4" />
        </div>
        <span className="font-display text-lg tracking-tight">Vantage</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {nav.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-1.5 border-t p-4 text-xs text-muted-foreground">
        <p>Reference ops console · synthetic demo data</p>
        {SOURCE_URL && (
          <a
            href={SOURCE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <Code2 className="size-3" /> View source
          </a>
        )}
      </div>
    </div>
  );
}

export function AppShell({
  email,
  role,
  children,
}: {
  email: string;
  role: "admin" | "viewer";
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav: NavItem[] =
    role === "admin"
      ? [...baseNav, { href: "/users", label: "Users", icon: ShieldCheck }]
      : baseNav;

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <TooltipProvider>
    <div className="grid min-h-svh lg:grid-cols-[240px_1fr]">
      <aside className="hidden border-r lg:block">
        <SidebarNav nav={nav} pathname={pathname} />
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="flex h-14 items-center gap-2 border-b px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
          </Button>

          <Breadcrumbs />

          <div className="ml-auto flex items-center gap-1">
            <CommandPalette role={role} />
            <ThemeCustomizer />
            <ModeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "h-auto gap-2 py-1",
                )}
              >
                <Avatar className="size-7">
                  <AvatarFallback className="text-xs">
                    {email.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm sm:inline">{email}</span>
                <Badge variant={role === "admin" ? "default" : "secondary"}>
                  {role}
                </Badge>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-1.5 py-1.5">
                  <div className="truncate text-sm font-medium">{email}</div>
                  <div className="text-xs capitalize text-muted-foreground">
                    {role} access
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <UserRound className="mr-2 size-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <Settings className="mr-2 size-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="min-w-0 flex-1 bg-muted/20 p-4 sm:p-6">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0" showCloseButton={false}>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav
            nav={nav}
            pathname={pathname}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
    </TooltipProvider>
  );
}
