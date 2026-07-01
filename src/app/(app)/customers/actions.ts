"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

const CustomerInput = z.object({
  name: z.string().trim().min(1, "Name required"),
  email: z.string().trim().email("Valid email required"),
  country: z.string().trim().min(1, "Pick a country"),
});

export type ActionResult = { ok: true } | { ok: false; error: string };

async function isAdmin() {
  const profile = await getProfile();
  return profile?.role === "admin";
}

export async function createCustomer(input: unknown): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, error: "Viewer accounts are read-only." };
  const parsed = CustomerInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("customers").insert(parsed.data);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/customers");
  return { ok: true };
}

export async function updateCustomer(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, error: "Viewer accounts are read-only." };
  const parsed = CustomerInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("customers").update(parsed.data).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/customers");
  return { ok: true };
}

export async function deleteCustomer(id: string): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, error: "Viewer accounts are read-only." };
  const supabase = await createClient();
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/customers");
  return { ok: true };
}
