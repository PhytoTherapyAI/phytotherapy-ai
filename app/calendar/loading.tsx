// © 2026 DoctoPal — All Rights Reserved
import { Skeleton } from "@/components/ui/skeleton";

const DAY_NAMES = 7;
const WEEKS = 5;

export default function CalendarLoading() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="flex gap-6">
        {/* Main calendar area */}
        <div className="flex-1 space-y-4">
          {/* Month header */}
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>

          {/* Day name headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {Array.from({ length: DAY_NAMES }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full rounded" />
            ))}
          </div>

          {/* Day cells grid (5 weeks × 7 days) */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: WEEKS * DAY_NAMES }).map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-lg border border-border bg-card p-1 space-y-1"
              >
                <Skeleton className="h-4 w-5" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:flex flex-col w-64 shrink-0 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
