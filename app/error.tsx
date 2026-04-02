// © 2026 Doctopal — All Rights Reserved
"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { RotateCcw, Home, RefreshCw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const retryCount = useRef(0)

  useEffect(() => {
    console.error("[ErrorBoundary]", error)
    import("@sentry/nextjs").then((Sentry) => Sentry.captureException(error)).catch(() => {})

    if (retryCount.current < 2) {
      retryCount.current++
      const timer = setTimeout(() => reset(), 1500)
      return () => clearTimeout(timer)
    }
  }, [error, reset])

  if (retryCount.current < 2) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-icon.svg" alt="DoctoPal" className="h-14 w-14 opacity-60" />
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        An unexpected error occurred. Don&apos;t worry — your data is safe. Let&apos;s get you back on track.
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <Button onClick={() => reset()} variant="default" className="gap-2">
          <RotateCcw className="h-4 w-4" /> Try Again
        </Button>
        <Button onClick={() => { if (typeof window !== "undefined") window.location.reload() }} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh Page
        </Button>
        <Button onClick={() => { if (typeof window !== "undefined") window.location.href = "/" }} variant="ghost" className="gap-2">
          <Home className="h-4 w-4" /> Go Home
        </Button>
      </div>
    </div>
  )
}
