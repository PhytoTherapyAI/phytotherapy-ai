// © 2026 Phytotherapy.ai — All Rights Reserved
import { Skeleton } from "@/components/ui/skeleton"

export default function WrappedLoading() {
  return (
    <div className="min-h-screen w-full space-y-6">
      {/* Full-width gradient background placeholder */}
      <Skeleton className="w-full h-64 rounded-none" />

      <div className="container mx-auto max-w-3xl px-4 space-y-6">
        {/* Title */}
        <div className="text-center space-y-2">
          <Skeleton className="h-9 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>

        {/* 3 stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-5 space-y-2 text-center">
              <Skeleton className="h-8 w-16 mx-auto" />
              <Skeleton className="h-4 w-24 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
