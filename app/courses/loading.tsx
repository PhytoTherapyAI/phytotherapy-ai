// © 2026 DoctoPal — All Rights Reserved
import { Skeleton } from "@/components/ui/skeleton"

export default function CoursesLoading() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      {/* Title */}
      <Skeleton className="h-8 w-36" />

      {/* Filter chips row */}
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>

      {/* 3x2 course card grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card overflow-hidden space-y-3">
            {/* Image area */}
            <Skeleton className="h-40 w-full rounded-none" />
            <div className="px-4 pb-4 space-y-2">
              {/* Title */}
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-3/4" />
              {/* Rating row */}
              <div className="flex items-center gap-2 pt-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
