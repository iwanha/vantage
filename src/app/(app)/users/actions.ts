"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export type ActionResult = { ok: true } | { ok: false; error: string };

const Role = z.enum(["admin", "viewer"]);

export async function updateUserRole(
  userId: string,
  role: string,
): Promise<ActionResult> {
  const me = await getProfile();
  if (me?.role !== "admin") {
    return { ok: false, error: "Only admins can manage roles." };
  }
  if (me.userId === userId) {
    return { ok: false, error: "You can't change your own role." };
  }

  const parsed = Role.safeParse(role);
  if (!parsed.success) return { ok: false, error: "Invalid role" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ role: parsed.data })
    .eq("id", userId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/users");
  return { ok: true };
}
