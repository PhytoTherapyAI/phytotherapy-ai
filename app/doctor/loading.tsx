// © 2026 Phytotherapy.ai — All Rights Reserved
import { Skeleton } from "@/components/ui/skeleton"

export default function DoctorLoading() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
      {/* Title */}
      <Skeleton className="h-8 w-44" />

      <div className="flex gap-6">
        {/* Patient list sidebar */}
        <div className="w-64 shrink-0 space-y-3">
          <Skeleton className="h-5 w-24" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-3 flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>

        {/* Main content area */}
        <div className="flex-1 space-y-4">
          {/* Patient header */}
          <div className="rounded-xl border bg-card p-5 flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-full shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-card p-4 space-y-2">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>

          {/* Large content block */}
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
