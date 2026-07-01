-- ============================================================
-- Vantage — schema (Customers / Products / Orders + RBAC)
-- Run in Supabase → SQL Editor. Safe to re-run (resets data).
-- ============================================================

-- teardown (idempotent)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.is_admin() cascade;
drop table if exists public.orders cascade;
drop table if exists public.products cascade;
drop table if exists public.customers cascade;
drop table if exists public.profiles cascade;
drop type if exists public.user_role cascade;

-- roles
create type public.user_role as enum ('admin', 'viewer');

-- profiles (1:1 with auth.users)
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  role       public.user_role not null default 'viewer',
  created_at timestamptz not null default now()
);

-- auto-create a profile whenever a user signs up
create function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'viewer')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- helper: is the current user an admin?
create function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- customers
create table public.customers (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  country    text not null,
  created_at timestamptz not null default now()
);

-- products
create table public.products (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  sku        text not null unique,
  category   text not null,
  price      numeric(10,2) not null,
  stock      integer not null default 0,
  status     text not null default 'active',      -- active | archived
  created_at timestamptz not null default now()
);

-- orders
create table public.orders (
  id           uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id  uuid not null references public.customers(id) on delete cascade,
  status       text not null default 'pending',   -- pending|paid|shipped|delivered|cancelled|refunded
  total_amount numeric(12,2) not null default 0,
  currency     text not null default 'USD',
  created_at   timestamptz not null default now()
);

create index orders_status_idx     on public.orders (status);
create index orders_created_at_idx on public.orders (created_at desc);
create index orders_customer_idx   on public.orders (customer_id);
create index products_category_idx on public.products (category);

-- ============================================================
-- Row Level Security   (read = any authenticated user, write = admin only)
-- ============================================================
alter table public.profiles  enable row level security;
alter table public.customers enable row level security;
alter table public.products  enable row level security;
alter table public.orders    enable row level security;

-- profiles: read own row (admins read all)
create policy profiles_select on public.profiles
  for select using (id = auth.uid() or public.is_admin());

-- read policies (any logged-in user)
create policy customers_select on public.customers for select using (auth.uid() is not null);
create policy products_select  on public.products  for select using (auth.uid() is not null);
create policy orders_select    on public.orders    for select using (auth.uid() is not null);

-- write policies (admin only)
create policy customers_write on public.customers for all using (public.is_admin()) with check (public.is_admin());
create policy products_write  on public.products  for all using (public.is_admin()) with check (public.is_admin());
create policy orders_write    on public.orders    for all using (public.is_admin()) with check (public.is_admin());

-- grants for the Data API 'authenticated' role (RLS still applies on top)
grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.customers to authenticated;
grant select, insert, update, delete on public.products  to authenticated;
grant select, insert, update, delete on public.orders    to authenticated;
