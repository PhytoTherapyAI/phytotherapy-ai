import { Skeleton } from "@/components/ui/skeleton";

export default function SupplementsLoading() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Title bar + search */}
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-10 w-56 rounded-xl" />
      </div>

      {/* Supplement cards */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-4 flex items-start gap-4"
          >
            {/* Icon circle */}
            <Skeleton className="h-12 w-12 rounded-full shrink-0" />

            {/* Text content */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-full max-w-xs" />
            </div>

            {/* Toggle */}
            <Skeleton className="h-6 w-11 rounded-full shrink-0 mt-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
