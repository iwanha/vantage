# Vantage — Ops Console

A production-grade back-office **ops console** for a commerce team — fast
server-side tables over thousands of rows, real dashboards, role-based
workflows, and a considered design system. Built on Next.js 16 + Supabase.

**Live demo:** [vantage-swart-one.vercel.app](https://vantage-swart-one.vercel.app)
**Sign in:** `admin@vantage.demo` (full CRUD) or `viewer@vantage.demo` (read-only) — password `vantage-demo`

---

## Features

- **Server-side data tables** (TanStack Table) — pagination, sorting, filtering
  and search run in Postgres and scale to millions of rows. Table state lives in
  the URL (shareable, back-button friendly).
- **Dashboard** — KPI cards with period deltas, a 3M / 6M / 12M date range, plus
  Recharts revenue (area), orders-per-month (bar) and status (donut) charts.
- **Full CRUD** — create / edit / delete for orders, products and customers via
  typed **Server Actions** with React Hook Form + Zod, toasts and confirm dialogs.
- **Row selection & bulk actions** — multi-select with **Export CSV** and bulk
  delete.
- **Detail drawers** — click any row for a slide-over with the full record.
- **Command palette** — `⌘K` / `Ctrl-K` to jump anywhere.
- **Role-based access control** — enforced twice: hidden in the UI *and* at the
  database via **Supabase Row-Level Security** (admin writes, viewer read-only).
- **Auth** — Supabase Auth (email/password) with protected routes, Settings &
  Profile pages.
- **Responsive** — tables collapse to cards on mobile; sidebar becomes a drawer.
- **Owned design** — a warm "Neo-Mirai" theme (editorial serif display +
  monospace data), first-class light/dark, a runtime accent picker, branded 404 /
  error pages, OpenGraph image, and purposeful motion.

## Stack

Next.js 16 (App Router, RSC) · TypeScript · Tailwind v4 · shadcn/ui (Base UI) ·
TanStack Table · Recharts · React Hook Form + Zod · Supabase (Postgres · Auth · RLS)

## Prerequisites

- **Node.js 20+** and **pnpm** (`npm i -g pnpm`)
- A free **Supabase** project ([supabase.com](https://supabase.com))

## Getting started

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Create a Supabase project**, then copy the env template and fill in the keys
   from *Project Settings → API*:

   ```bash
   cp .env.example .env.local
   ```

   | Variable | Where |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | `service_role` secret (server only — never exposed to the client) |

3. **Create the schema.** Open the Supabase **SQL Editor** and run
   [`supabase/schema.sql`](supabase/schema.sql) — it creates the `profiles`,
   `customers`, `products` and `orders` tables plus the Row-Level Security
   policies and the `admin`/`viewer` role enum.

4. **Seed demo data** (200 customers, 150 products, 2,000 orders, and the two
   demo users):

   ```bash
   pnpm seed
   ```

5. **Run it**

   ```bash
   pnpm dev
   ```

   Open [localhost:3000](http://localhost:3000) and sign in with a demo account.

## Deploy to Vercel

1. Push the repo to your Git host and import it in Vercel.
2. Add the three env vars above under *Settings → Environment Variables*
   (Production + Preview).
3. Deploy. To show the "View source" links, optionally set
   `NEXT_PUBLIC_SOURCE_URL` to your repo URL — otherwise they're hidden.

## Customizing

- **Branding** — the "Vantage" name and logo live in `src/components/app-shell.tsx`
  and `src/app/login/page.tsx`. App metadata is in `src/app/layout.tsx`.
- **Colors & theme** — design tokens are OKLCH variables in
  `src/app/globals.css` (`:root` / `.dark`). The runtime accent picker lives in
  `src/components/theme-customizer.tsx`.
- **Add a table** — mirror an existing feature folder under `src/app/(app)/…`:
  a `page.tsx` (server-side query), a `*-table.tsx` (columns + the shared
  `DataTable`), `actions.ts` (Server Actions), and a matching `create table` +
  RLS policy in `supabase/schema.sql`.
- **Roles & permissions** — RLS policies in `supabase/schema.sql`; the UI reads
  the role via `src/lib/auth.ts`.

## Project structure

```
src/
  app/
    (app)/            authenticated pages — dashboard, orders, products,
                      customers, users, settings, profile
    login/            split-screen sign-in
    layout.tsx        metadata, fonts, providers
  components/
    data-table/       DataTable, pagination, filters, selection, bulk actions
    charts/           revenue / orders / status charts
    ui/               shadcn (Base UI) primitives
  lib/                supabase clients, auth, formatting, helpers
supabase/schema.sql   tables + RLS policies + role enum
scripts/seed.mjs      synthetic demo data generator
```

## License

Commercial license — see [`LICENSE.md`](LICENSE.md). You may use Vantage in
unlimited personal and commercial projects; you may **not** resell or
redistribute the source itself as a template/kit.

---

Built by [Iwan Hadi Setiawan](https://www.linkedin.com/in/iwanhadisetiawan/) · [portfolio](https://portfolio-iwan.vercel.app)
