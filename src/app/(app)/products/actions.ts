"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { PRODUCT_STATUS } from "./constants";

const ProductInput = z.object({
  name: z.string().trim().min(1, "Name required"),
  sku: z.string().trim().min(1, "SKU required").max(32),
  category: z.string().trim().min(1, "Pick a category"),
  price: z.coerce.number().min(0, "Must be ≥ 0"),
  stock: z.coerce.number().int("Whole number").min(0, "Must be ≥ 0"),
  status: z.enum(PRODUCT_STATUS),
});

export type ActionResult = { ok: true } | { ok: false; error: string };

async function isAdmin() {
  const profile = await getProfile();
  return profile?.role === "admin";
}

export async function createProduct(input: unknown): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, error: "Viewer accounts are read-only." };
  const parsed = ProductInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("products").insert(parsed.data);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/products");
  return { ok: true };
}

export async function updateProduct(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, error: "Viewer accounts are read-only." };
  const parsed = ProductInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("products").update(parsed.data).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/products");
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, error: "Viewer accounts are read-only." };
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/products");
  return { ok: true };
}
