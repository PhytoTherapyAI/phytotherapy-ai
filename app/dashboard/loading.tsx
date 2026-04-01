// © 2026 Doctopal — All Rights Reserved
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* Greeting bar */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-24" />
      </div>

      {/* Daily plan card */}
      <Skeleton className="h-40 w-full rounded-xl" />

      {/* 2x2 grid of cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>

      {/* Quick actions row — 4 circles */}
      <div className="flex items-center gap-4 justify-center pt-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>
    </div>
  );
}
