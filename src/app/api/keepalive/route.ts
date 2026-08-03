import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Supabase free-tier pauses a project after ~7 days without activity, and this
// demo is linked from live proposals — a paused project means a client clicks a
// dead demo. A daily Vercel cron (see vercel.json) hits this route and runs one
// trivial query, which is enough to keep the project awake.
//
// Deliberately public and read-only: it runs on the server with the service
// key, returns no data, and leaks nothing beyond "the demo is alive".
export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await createAdminClient().from("products").select("id").limit(1);

  if (error) {
    console.error("keepalive query failed:", error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
