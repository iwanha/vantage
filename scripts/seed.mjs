// Seed Vantage demo data.
// Run: node --env-file=.env.local scripts/seed.mjs
import { setGlobalDispatcher, EnvHttpProxyAgent } from "undici";
import { createClient } from "@supabase/supabase-js";

// route server-side fetch through the corp proxy if present
if (process.env.HTTPS_PROXY) setGlobalDispatcher(new EnvHttpProxyAgent());

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !secret) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local");
  process.exit(1);
}
const sb = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const rnd = (n) => Math.floor(Math.random() * n);
const pick = (a) => a[rnd(a.length)];
const money = (min, max) => Math.round((min + Math.random() * (max - min)) * 100) / 100;

const firstNames = ["James","Mary","John","Patricia","Robert","Jennifer","Michael","Linda","David","Elizabeth","Wei","Aisha","Diego","Yuki","Ravi","Sofia","Omar","Ingrid","Chen","Nadia"];
const lastNames  = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Tan","Khan","Silva","Sato","Patel","Nguyen","Haddad","Larsen","Wang","Kowalski"];
const countries  = ["US","GB","DE","SG","ID","AU","CA","FR","NL","JP","IN","BR"];
const categories = ["Apparel","Electronics","Home","Beauty","Sports","Toys","Grocery","Books"];
const adjectives = ["Classic","Premium","Eco","Compact","Deluxe","Smart","Vintage","Modern","Pro","Essential","Ultra","Wireless"];
const nouns      = ["Mug","Headphones","Backpack","Lamp","Sneakers","Notebook","Bottle","Charger","Jacket","Keyboard","Chair","Speaker","Watch","Blender","Camera"];
const statusPool = ["pending","paid","paid","shipped","shipped","delivered","delivered","delivered","delivered","cancelled","refunded"];

async function clearTable(t) {
  const { error } = await sb.from(t).delete().gte("created_at", "1970-01-01");
  if (error) console.warn(`clear ${t}: ${error.message}`);
}

async function insertChunked(table, rows, selectIds = false) {
  const ids = [];
  for (let i = 0; i < rows.length; i += 500) {
    const q = sb.from(table).insert(rows.slice(i, i + 500));
    const { data, error } = selectIds ? await q.select("id") : await q;
    if (error) { console.error(`insert ${table}: ${error.message}`); process.exit(1); }
    if (selectIds && data) ids.push(...data.map((r) => r.id));
  }
  return ids;
}

async function ensureDemoUsers() {
  const users = [
    { email: "admin@vantage.demo", password: "vantage-demo", role: "admin" },
    { email: "viewer@vantage.demo", password: "vantage-demo", role: "viewer" },
  ];
  for (const u of users) {
    let id;
    const { data, error } = await sb.auth.admin.createUser({
      email: u.email, password: u.password, email_confirm: true,
    });
    if (error) {
      const { data: list } = await sb.auth.admin.listUsers();
      id = list?.users?.find((x) => x.email === u.email)?.id;
    } else {
      id = data.user.id;
    }
    if (id) {
      await sb.from("profiles").update({ role: u.role, email: u.email }).eq("id", id);
      console.log(`  user ${u.email} -> ${u.role}`);
    } else {
      console.warn(`  could not resolve user ${u.email}`);
    }
  }
}

async function main() {
  console.log("clearing tables…");
  await clearTable("orders");
  await clearTable("products");
  await clearTable("customers");

  console.log("demo users…");
  await ensureDemoUsers();

  console.log("customers…");
  const customers = Array.from({ length: 200 }, () => {
    const fn = pick(firstNames), ln = pick(lastNames);
    return {
      name: `${fn} ${ln}`,
      email: `${fn}.${ln}${rnd(9999)}@example.com`.toLowerCase(),
      country: pick(countries),
    };
  });
  const customerIds = await insertChunked("customers", customers, true);

  console.log("products…");
  const products = Array.from({ length: 150 }, (_, i) => ({
    name: `${pick(adjectives)} ${pick(nouns)}`,
    sku: `SKU-${String(i + 1).padStart(5, "0")}`,
    category: pick(categories),
    price: money(5, 500),
    stock: rnd(500),
    status: Math.random() < 0.85 ? "active" : "archived",
  }));
  await insertChunked("products", products);

  console.log("orders…");
  const now = Date.now();
  const orders = Array.from({ length: 2000 }, (_, i) => {
    const created = new Date(now - rnd(365) * 86400000 - rnd(86400000));
    return {
      order_number: `ORD-${String(i + 1).padStart(6, "0")}`,
      customer_id: pick(customerIds),
      status: pick(statusPool),
      total_amount: money(10, 2000),
      currency: "USD",
      created_at: created.toISOString(),
    };
  });
  await insertChunked("orders", orders);

  const counts = {};
  for (const t of ["customers", "products", "orders"]) {
    const { count } = await sb.from(t).select("*", { count: "exact", head: true });
    counts[t] = count;
  }
  console.log("DONE:", counts);
}

main().catch((e) => { console.error(e); process.exit(1); });
