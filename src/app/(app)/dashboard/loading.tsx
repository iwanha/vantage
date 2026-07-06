import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeaderSkeleton />
        <Skeleton className="h-8 w-40" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-80 w-full lg:col-span-2" />
        <Skeleton className="h-80 w-full" />
      </div>
      <Skeleton className="h-72 w-full" />
    </div>
  );
}
