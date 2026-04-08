// © 2026 DoctoPal — All Rights Reserved
import { Skeleton } from "@/components/ui/skeleton";

export default function InteractionCheckerLoading() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      {/* Title + description */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Search input */}
      <div className="flex gap-2">
        <Skeleton className="h-11 flex-1 rounded-xl" />
        <Skeleton className="h-11 w-24 rounded-xl shrink-0" />
      </div>

      {/* Medication chips */}
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-8 w-28 rounded-full" />
        <Skeleton className="h-8 w-36 rounded-full" />
      </div>

      {/* Results area — 3 cards */}
      <div className="space-y-3 pt-2">
        <Skeleton className="h-5 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}
