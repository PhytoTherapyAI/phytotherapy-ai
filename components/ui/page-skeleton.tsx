// © 2026 DoctoPal — All Rights Reserved
"use client"

import { Skeleton } from "@/components/ui/skeleton"

/**
 * Generic page skeleton for auth-loading states.
 * Replaces Loader2 spinners with a structured skeleton layout.
 * Variant "default" = card grid, "form" = form fields, "list" = list items.
 */
export function PageSkeleton({ variant = "default" }: { variant?: "default" | "form" | "list" }) {
  if (variant === "form") {
    return (
      <div className="container max-w-2xl mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="space-y-4 mt-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <Skeleton className="h-10 w-32 mt-4" />
        </div>
      </div>
    )
  }

  if (variant === "list") {
    return (
      <div className="container max-w-4xl mx-auto p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <div className="space-y-3 mt-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-border">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Default: card grid
  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-4 rounded-lg border border-border space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-8 w-24 mt-2" />
          </div>
        ))}
      </div>
    </div>
  )
}
