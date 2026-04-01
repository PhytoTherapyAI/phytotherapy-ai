// © 2026 Phytotherapy.ai — All Rights Reserved
"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RotateCcw, Home } from "lucide-react"

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

    // Auto-retry up to 2 times with delay (handles cold start / deploy transitions)
    if (retryCount.current < 2) {
      retryCount.current++
      const timer = setTimeout(() => reset(), 1500)
      return () => clearTimeout(timer)
    }
  }, [error, reset])

  // Show UI only after auto-retries are exhausted
  if (retryCount.current < 2) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const handleRefresh = () => {
    if (typeof window !== "undefined") window.location.reload()
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30">
        <AlertTriangle className="h-8 w-8 text-amber-500" />
      </div>
      <h2 className="text-xl font-semibold">Bir şeyler ters gitti</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin veya sayfayı yenileyin.
      </p>
      <div className="flex gap-3">
        <Button onClick={() => reset()} variant="default" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Tekrar Dene
        </Button>
        <Button onClick={handleRefresh} variant="outline" className="gap-2">
          Sayfayı Yenile
        </Button>
        <Button onClick={() => { if (typeof window !== "undefined") window.location.href = "/" }} variant="ghost" className="gap-2">
          <Home className="h-4 w-4" />
          Ana Sayfa
        </Button>
      </div>
    </div>
  )
}
