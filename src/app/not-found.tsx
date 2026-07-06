import Link from "next/link";
import { BarChart3, Compass } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <BarChart3 className="size-5" />
        </div>
        <span className="font-display text-xl tracking-tight">Vantage</span>
      </div>
      <div className="space-y-2">
        <p className="font-mono text-sm text-muted-foreground">404</p>
        <h1 className="font-display text-3xl tracking-tight">
          This page went off the map
        </h1>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          The page you&rsquo;re looking for doesn&rsquo;t exist, or it may have moved.
        </p>
      </div>
      <Link href="/dashboard" className={buttonVariants()}>
        <Compass className="size-4" /> Back to dashboard
      </Link>
    </div>
  );
}
