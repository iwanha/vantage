import { createClient } from "@/lib/supabase/server";

export type Profile = {
  userId: string;
  email: string;
  role: "admin" | "viewer";
};

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", user.id)
    .single();

  return {
    userId: user.id,
    email: data?.email ?? user.email ?? "",
    role: (data?.role as "admin" | "viewer") ?? "viewer",
  };
}
