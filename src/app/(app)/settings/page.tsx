import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { ModeToggle } from "@/components/mode-toggle";
import { ThemeCustomizer } from "@/components/theme-customizer";
import { SignOutButton } from "@/components/sign-out-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function Row({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 py-4 first:pt-0 last:border-0 last:pb-0">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

export default async function SettingsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Appearance and account preferences for this workspace."
      />

      <Tabs defaultValue="appearance" className="max-w-2xl">
        <TabsList>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Appearance</CardTitle>
              <CardDescription>
                Personalize how Vantage looks. Saved to this browser.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Row
                title="Theme"
                description="Light, dark, or match your system."
              >
                <ModeToggle />
              </Row>
              <Row
                title="Accent color"
                description="Recolor charts, buttons and highlights."
              >
                <ThemeCustomizer />
              </Row>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account</CardTitle>
              <CardDescription>Signed in as {profile.email}.</CardDescription>
            </CardHeader>
            <CardContent>
              <Row title="Email" description="The address you sign in with.">
                <span className="font-mono text-sm text-muted-foreground">
                  {profile.email}
                </span>
              </Row>
              <Row
                title="Role"
                description="Enforced by Postgres row-level security."
              >
                <Badge
                  variant={profile.role === "admin" ? "default" : "secondary"}
                >
                  {profile.role}
                </Badge>
              </Row>
              <Row title="Session" description="Sign out of this demo workspace.">
                <SignOutButton />
              </Row>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
