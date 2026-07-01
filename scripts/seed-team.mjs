// Adds a few demo team members so the Users & Roles page looks populated.
// Run: node --env-file=.env.local scripts/seed-team.mjs
import { setGlobalDispatcher, EnvHttpProxyAgent } from "undici";
import { createClient } from "@supabase/supabase-js";

if (process.env.HTTPS_PROXY) setGlobalDispatcher(new EnvHttpProxyAgent());

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const sb = createClient(url, secret, { auth: { persistSession: false } });

const team = [
  { email: "sarah.chen@vantage.demo", role: "admin" },
  { email: "marcus.reed@vantage.demo", role: "viewer" },
  { email: "lena.park@vantage.demo", role: "viewer" },
  { email: "david.osei@vantage.demo", role: "admin" },
  { email: "yuki.tanaka@vantage.demo", role: "viewer" },
];

for (const u of team) {
  let id;
  const { data, error } = await sb.auth.admin.createUser({
    email: u.email,
    password: "vantage-demo",
    email_confirm: true,
  });
  if (error) {
    const { data: list } = await sb.auth.admin.listUsers();
    id = list?.users?.find((x) => x.email === u.email)?.id;
  } else {
    id = data.user.id;
  }
  if (id) {
    await sb.from("profiles").update({ role: u.role, email: u.email }).eq("id", id);
    console.log(`  ${u.email} -> ${u.role}`);
  }
}
console.log("team seeded");
