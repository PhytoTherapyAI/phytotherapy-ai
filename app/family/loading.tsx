// © 2026 Phytotherapy.ai — All Rights Reserved
import { Skeleton } from "@/components/ui/skeleton"

export default function FamilyLoading() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 space-y-6">
      {/* Title + Add member button */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>

      {/* 3 family member cards */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 flex items-center gap-4">
            {/* Avatar */}
            <Skeleton className="h-12 w-12 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              {/* Name */}
              <Skeleton className="h-5 w-32" />
              {/* Role */}
              <Skeleton className="h-3 w-20" />
            </div>
            {/* Action button placeholder */}
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
