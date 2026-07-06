"use client";

// global-error replaces the root layout when it fails, so it ships its own
// <html>/<body> and pulls in the stylesheet directly. The ThemeProvider isn't
// mounted here, so this renders in the default (light) tokens.
import "./globals.css";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 text-center text-foreground antialiased">
        <div className="space-y-2">
          <p className="font-mono text-sm text-muted-foreground">Error</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Something broke
          </h1>
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">
            An unexpected error took down the app. Try again, or reload the page.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
