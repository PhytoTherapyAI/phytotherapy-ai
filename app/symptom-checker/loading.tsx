import { Skeleton } from "@/components/ui/skeleton"

export default function SymptomCheckerLoading() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 space-y-6">
      {/* Title + description */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Body area */}
      <div className="rounded-xl border bg-card p-4">
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>

      {/* Common symptoms grid — 8 chips */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-36" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      </div>

      {/* Submit button placeholder */}
      <Skeleton className="h-11 w-full rounded-md" />
    </div>
  )
}
