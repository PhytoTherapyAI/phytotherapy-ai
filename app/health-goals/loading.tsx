// © 2026 Phytotherapy.ai — All Rights Reserved
import { Skeleton } from "@/components/ui/skeleton"

export default function HealthGoalsLoading() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 space-y-6">
      {/* Title */}
      <Skeleton className="h-8 w-44" />

      {/* 3 goal cards */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
            {/* Title + status badge */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            {/* Progress bar */}
            <Skeleton className="h-2 w-full rounded-full" />
            {/* Sub-label */}
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    </div>
  )
}
