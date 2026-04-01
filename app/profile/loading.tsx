// © 2026 Doctopal — All Rights Reserved
import { Skeleton } from "@/components/ui/skeleton";

function SectionCard({ rows = 3 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <Skeleton className="h-5 w-36" />
      <div className="space-y-2.5 pt-1">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-36" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      {/* Avatar + name block */}
      <div className="flex items-center gap-5 py-2">
        <Skeleton className="h-20 w-20 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-4 w-28 mt-1" />
        </div>
        <Skeleton className="h-9 w-24 rounded-lg shrink-0" />
      </div>

      {/* 4 section cards */}
      <SectionCard rows={3} />
      <SectionCard rows={3} />
      <SectionCard rows={3} />
      <SectionCard rows={3} />
    </div>
  );
}
