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

const DAY = 86400000;
const rnd = (n) => Math.floor(Math.random() * n);
const pick = (a) => a[rnd(a.length)];
const money = (min, max) => Math.round((min + Math.random() * (max - min)) * 100) / 100;

const now = Date.now();
// A date up to `maxDaysAgo` in the past, biased toward more recent (bias>1)
// so the store visibly grows over time rather than sitting flat.
const pastISO = (maxDaysAgo, bias = 1) =>
  new Date(
    now - Math.floor(maxDaysAgo * Math.pow(Math.random(), bias)) * DAY - rnd(DAY),
  ).toISOString();

const firstNames = ["James","Mary","John","Patricia","Robert","Jennifer","Michael","Linda","David","Elizabeth","Wei","Aisha","Diego","Yuki","Ravi","Sofia","Omar","Ingrid","Chen","Nadia","Lucas","Emma","Noah","Olivia","Liam","Ava","Mateo","Isabella","Hiroshi","Mei","Arjun","Priya","Fatima","Youssef","Elena","Sven","Anya","Marco","Giulia","Kwame","Amara","Thabo","Lena","Tomas","Freya","Idris","Camila","Bjorn"];
const lastNames  = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Tan","Khan","Silva","Sato","Patel","Nguyen","Haddad","Larsen","Wang","Kowalski","Andersson","Ferrari","Mbeki","Okafor","Novak","Ivanov","Yamamoto","Kim","Park","Dubois","Rossi","Hassan","Reyes","Cruz","Fischer","Meyer","Costa","Almeida","Adeyemi","Suzuki","Lindqvist","Petrov","Bianchi","Nakamura","Volkov","Moreau"];
const countries  = ["US","GB","DE","SG","ID","AU","CA","FR","NL","JP","IN","BR"];
const categories = ["Apparel","Electronics","Home","Beauty","Sports","Toys","Grocery","Books"];
const adjectives = ["Classic","Premium","Eco","Compact","Deluxe","Smart","Vintage","Modern","Pro","Essential","Ultra","Wireless","Handcrafted","Travel","Studio","Everyday","Signature","Nordic"];
const nouns      = ["Mug","Headphones","Backpack","Lamp","Sneakers","Notebook","Bottle","Charger","Jacket","Keyboard","Chair","Speaker","Watch","Blender","Camera","Wallet","Tote","Mouse","Monitor","Kettle","Toaster","Sunglasses","Scarf","Desk","Planter"];
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

// Draw unique combinations from two pools ("First Last") so no name repeats.
function uniqueNames(count) {
  const used = new Set();
  const out = [];
  while (out.length < count) {
    const fn = pick(firstNames);
    const ln = pick(lastNames);
    const name = `${fn} ${ln}`;
    if (used.has(name)) continue;
    used.add(name);
    out.push({ fn, ln, name });
  }
  return out;
}

function uniqueProductNames(count) {
  const used = new Set();
  const out = [];
  let guard = 0;
  while (out.length < count && guard++ < count * 40) {
    const name = `${pick(adjectives)} ${pick(nouns)}`;
    if (used.has(name)) continue;
    used.add(name);
    out.push(name);
  }
  return out;
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
  const customers = uniqueNames(200).map(({ fn, ln }) => ({
    name: `${fn} ${ln}`,
    email: `${fn}.${ln}${rnd(9999)}@example.com`.toLowerCase(),
    country: pick(countries),
    // joined any time in the last ~2 years, skewed recent (a growing store)
    created_at: pastISO(730, 1.25),
  }));
  const customerIds = await insertChunked("customers", customers, true);

  console.log("products…");
  const productNames = uniqueProductNames(150);
  const products = productNames.map((name, i) => ({
    name,
    sku: `SKU-${String(i + 1).padStart(5, "0")}`,
    category: pick(categories),
    price: money(5, 500),
    stock: rnd(500),
    status: Math.random() < 0.85 ? "active" : "archived",
    // catalog built up over the last ~2 years
    created_at: pastISO(730, 1),
  }));
  await insertChunked("products", products);

  console.log("orders…");
  const orders = Array.from({ length: 2000 }, (_, i) => {
    // bias creation toward recent days so both volume and revenue trend up (F-02)
    const daysAgo = Math.floor(365 * Math.pow(Math.random(), 1.3));
    const created = new Date(now - daysAgo * DAY - rnd(DAY));
    // gentle growth: recent orders carry a higher value than year-old ones
    const growth = 1.35 - (daysAgo / 365) * 0.7;
    return {
      order_number: `ORD-${String(i + 1).padStart(6, "0")}`,
      customer_id: pick(customerIds),
      status: pick(statusPool),
      total_amount: Math.round(money(10, 2000) * growth * 100) / 100,
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
