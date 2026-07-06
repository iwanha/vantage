"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { STATUS_ORDER } from "@/lib/status";

const OrderInput = z.object({
  customer_id: z.string().uuid("Pick a customer"),
  status: z.enum(STATUS_ORDER),
  total_amount: z.coerce.number().min(0, "Must be ≥ 0"),
  currency: z.string().trim().min(1).max(8).default("USD"),
});

export type ActionResult = { ok: true } | { ok: false; error: string };

async function isAdmin() {
  const profile = await getProfile();
  return profile?.role === "admin";
}

export async function createOrder(input: unknown): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, error: "Viewer accounts are read-only." };

  const parsed = OrderInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const order_number = `ORD-${Date.now().toString(36).toUpperCase()}`;
  const { error } = await supabase
    .from("orders")
    .insert({ ...parsed.data, order_number });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/orders");
  return { ok: true };
}

export async function updateOrder(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, error: "Viewer accounts are read-only." };

  const parsed = OrderInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("orders").update(parsed.data).eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/orders");
  return { ok: true };
}

export async function deleteOrder(id: string): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, error: "Viewer accounts are read-only." };

  const supabase = await createClient();
  const { error } = await supabase.from("orders").delete().eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/orders");
  return { ok: true };
}

export async function deleteOrders(ids: string[]): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, error: "Viewer accounts are read-only." };
  if (ids.length === 0) return { ok: true };
  const supabase = await createClient();
  const { error } = await supabase.from("orders").delete().in("id", ids);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/orders");
  return { ok: true };
}
