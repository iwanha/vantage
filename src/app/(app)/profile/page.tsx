import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { shortDate } from "@/lib/format";
import { initials, hueFromString, hueTint } from "@/lib/cells";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ReactNode } from "react";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-3 last:border-0">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-right text-sm font-medium">{children}</dd>
    </div>
  );
}

export default async function ProfilePage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("created_at")
    .eq("id", profile.userId)
    .single();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Your account details and access level in this workspace."
      />

      <Card className="max-w-2xl">
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-14" size="lg">
              <AvatarFallback
                className="text-lg font-medium"
                style={hueTint(hueFromString(profile.email))}
              >
                {initials(profile.email.replace(/[@.]/g, " "))}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium">{profile.email}</p>
              <Badge
                variant={profile.role === "admin" ? "default" : "secondary"}
                className="mt-1"
              >
                {profile.role}
              </Badge>
            </div>
          </div>

          <Separator />

          <dl>
            <Field label="Email">{profile.email}</Field>
            <Field label="Role">
              <span className="capitalize">{profile.role}</span>
            </Field>
            <Field label="Member since">
              {data?.created_at ? shortDate(data.created_at) : "—"}
            </Field>
            <Field label="User ID">
              <span className="font-mono text-xs text-muted-foreground">
                {profile.userId}
              </span>
            </Field>
          </dl>

          <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-foreground" />
            <p>
              Access is enforced by Postgres row-level security.{" "}
              {profile.role === "admin"
                ? "As an admin you can read and write across every table."
                : "As a viewer you have read-only access — writes are blocked at the database, not just hidden in the UI."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
