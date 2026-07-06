"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BarChart3, Code2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/status-badge";
import { SOURCE_URL } from "@/lib/site";

type Pending = "form" | "admin" | "viewer" | null;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@vantage.demo");
  const [password, setPassword] = useState("vantage-demo");
  const [pending, setPending] = useState<Pending>(null);
  const [error, setError] = useState<string | null>(null);

  async function signIn(mail: string, pass: string, who: Pending) {
    setPending(who);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: mail,
      password: pass,
    });
    if (error) {
      setError(error.message);
      setPending(null);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  const busy = pending !== null;

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Brand — a living sliver of the product */}
      <aside className="relative hidden overflow-hidden border-r bg-sidebar lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full opacity-60 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, var(--primary), transparent)",
          }}
        />

        <div className="relative flex items-center gap-2 duration-700 animate-in fade-in slide-in-from-left-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BarChart3 className="size-5" />
          </div>
          <span className="font-display text-2xl tracking-tight">Vantage</span>
        </div>

        <div className="relative space-y-8 duration-700 animate-in fade-in slide-in-from-left-4">
          <div className="space-y-3">
            <h1 className="max-w-md text-balance font-display text-3xl leading-tight tracking-tight">
              The ops console, running on real data.
            </h1>
            <p className="max-w-sm text-sm text-muted-foreground">
              The data-heavy internal tools a commerce team actually runs on —
              server-side tables over thousands of rows, role-gated writes, and
              a dashboard that actually moves.
            </p>
          </div>

          {/* mini instrument */}
          <div className="max-w-sm rounded-xl border bg-card/70 p-5 shadow-sm backdrop-blur-sm">
            <div className="flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Revenue · 12 mo
              </span>
              <span
                className="rounded-full px-2 py-0.5 font-mono text-xs font-medium"
                style={{
                  background:
                    "color-mix(in oklab, var(--status-delivered) 16%, transparent)",
                  color: "var(--status-delivered)",
                }}
              >
                ↗ +32.7%
              </span>
            </div>
            <p className="mt-1 font-display text-3xl tracking-tight tabular-nums">
              $765,745
            </p>
            <svg
              viewBox="0 0 320 110"
              preserveAspectRatio="none"
              aria-hidden
              className="mt-3 h-24 w-full"
            >
              <defs>
                <linearGradient id="loginFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M4,96 C48,92 64,74 104,78 S168,58 208,50 C238,44 270,26 316,12 L316,110 L4,110 Z"
                fill="url(#loginFill)"
              />
              <path
                d="M4,96 C48,92 64,74 104,78 S168,58 208,50 C238,44 270,26 316,12"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{
                  strokeDasharray: 1200,
                  animation: "draw-line 1.6s var(--ease-out) both",
                }}
              />
            </svg>
            <div className="mt-4 flex flex-wrap gap-1.5">
              <StatusBadge status="delivered" />
              <StatusBadge status="paid" />
              <StatusBadge status="shipped" />
              <StatusBadge status="pending" />
            </div>
          </div>

          <dl className="grid max-w-sm grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="font-medium text-foreground">Admin</dt>
              <dd className="text-muted-foreground">Full read &amp; write.</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Viewer</dt>
              <dd className="text-muted-foreground">
                Read-only — enforced by Postgres RLS.
              </dd>
            </div>
          </dl>
        </div>

        <div className="relative flex items-center gap-4 text-xs text-muted-foreground">
          <span>Next.js 16 · React 19 · Supabase</span>
          {SOURCE_URL && (
            <a
              href={SOURCE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
            >
              <Code2 className="size-3.5" /> View source
            </a>
          )}
        </div>
      </aside>

      {/* Form */}
      <main className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm duration-700 animate-in fade-in slide-in-from-bottom-3">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <BarChart3 className="size-5" />
            </div>
            <span className="font-display text-xl tracking-tight">Vantage</span>
          </div>

          <div className="space-y-1">
            <h2 className="font-display text-2xl tracking-tight">Sign in</h2>
            <p className="text-sm text-muted-foreground">
              Use a demo account — one tap gets you straight in.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-auto flex-col items-start gap-0.5 py-3"
              disabled={busy}
              onClick={() => signIn("admin@vantage.demo", "vantage-demo", "admin")}
            >
              <span className="flex w-full items-center justify-between text-sm font-medium">
                Admin
                {pending === "admin" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ArrowRight className="size-4" />
                )}
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                read &amp; write
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col items-start gap-0.5 py-3"
              disabled={busy}
              onClick={() =>
                signIn("viewer@vantage.demo", "vantage-demo", "viewer")
              }
            >
              <span className="flex w-full items-center justify-between text-sm font-medium">
                Viewer
                {pending === "viewer" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ArrowRight className="size-4" />
                )}
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                read-only
              </span>
            </Button>
          </div>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or with email
            <span className="h-px flex-1 bg-border" />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              signIn(email, password, "form");
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={busy}>
              {pending === "form" && <Loader2 className="mr-2 size-4 animate-spin" />}
              Sign in
            </Button>
          </form>

          <p className="mt-4 text-center font-mono text-xs text-muted-foreground">
            admin@vantage.demo · viewer@vantage.demo · vantage-demo
          </p>
        </div>
      </main>
    </div>
  );
}
