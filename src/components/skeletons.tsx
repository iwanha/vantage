import { Skeleton } from "@/components/ui/skeleton";

// Matches PageHeader: a 2xl (~h-8) title over a single description line.
export function PageHeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full max-w-md" />
    </div>
  );
}

// Mirrors a DataTable page — header, toolbar, bordered table with a head row
// and body rows, then the pagination strip — so the load state matches the
// shape and height of what replaces it.
export function TablePageSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-9 w-40" />
          <Skeleton className="ml-auto h-9 w-32" />
        </div>
        <div className="overflow-hidden rounded-lg border">
          <div className="flex h-10 items-center gap-4 border-b bg-muted/40 px-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-40" />
            <Skeleton className="ml-auto h-3 w-16" />
          </div>
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-b px-4 py-3 last:border-0"
            >
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="hidden h-4 w-48 sm:block" />
              <Skeleton className="ml-auto h-4 w-20" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-64" />
        </div>
      </div>
    </div>
  );
}
