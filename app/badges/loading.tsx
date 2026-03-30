// © 2026 Phytotherapy.ai — All Rights Reserved
import { Skeleton } from "@/components/ui/skeleton"

export default function BadgesLoading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Title + subtitle */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* 4x3 badge grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 flex flex-col items-center gap-3">
            {/* Circle icon */}
            <Skeleton className="h-14 w-14 rounded-full" />
            {/* Name */}
            <Skeleton className="h-4 w-20" />
            {/* Description */}
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>
    </div>
  )
}
