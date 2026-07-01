# Vantage — Ops Console

A reference back-office **ops console** for a fictional commerce team — built to demonstrate the data-heavy internal tools I build: fast server-side tables, real dashboards, and role-based workflows.

**Live demo:** [vantage-swart-one.vercel.app](https://vantage-swart-one.vercel.app)
**Sign in:** `admin@vantage.demo` or `viewer@vantage.demo` — password `vantage-demo`

> Log in as **admin** (full CRUD) or **viewer** (read-only) to see role-based access in action.

## What it shows

- **Server-side data tables** (TanStack Table) — pagination, sorting, filtering and search run in Postgres and scale to millions of rows; table state lives in the URL (shareable, back-button friendly).
- **Dashboard** — KPI cards with 30-day deltas, plus Recharts revenue (area) and orders-by-status charts.
- **Full CRUD** — create / edit / delete for orders, products and customers via typed **Server Actions** with React Hook Form + Zod validation, toasts and confirm dialogs.
- **Role-based access control** — enforced twice: hidden in the UI *and* at the database via **Supabase Row-Level Security** (admin writes, viewer read-only).
- **Auth** — Supabase Auth (email/password) with protected routes.
- **Owned design** — a warm "Neo-Mirai" theme (editorial serif display + monospace data), first-class light/dark, purposeful motion.

## Stack

Next.js 16 (App Router, RSC) · TypeScript · Tailwind v4 · shadcn/ui (Base UI) · TanStack Table · Recharts · React Hook Form + Zod · Supabase (Postgres · Auth · RLS)

## Run locally

1. `pnpm install`
2. Create a Supabase project, copy `.env.example` → `.env.local`, and fill in the keys (Project Settings → API).
3. Run `supabase/schema.sql` in the Supabase SQL editor.
4. Seed demo data: `node --env-file=.env.local scripts/seed.mjs`
5. `pnpm dev`

---

Built by [Iwan Hadi Setiawan](https://www.linkedin.com/in/iwanhadisetiawan/) · [portfolio](https://portfolio-iwan.vercel.app)
