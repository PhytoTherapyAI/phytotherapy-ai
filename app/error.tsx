// © 2026 Phytotherapy.ai — All Rights Reserved
"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RotateCcw, Home } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[ErrorBoundary]", error)
    import("@sentry/nextjs").then((Sentry) => Sentry.captureException(error)).catch(() => {})
  }, [error])

  const handleReset = () => {
    // Clear any cached state that might cause the error to repeat
    try {
      // Clear error-causing session storage entries
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("lastError")
      }
    } catch {}
    reset()
  }

  const handleRefresh = () => {
    window.location.reload()
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
      {error.message && (
        <p className="max-w-md text-xs text-muted-foreground/60 font-mono bg-muted rounded-lg px-3 py-2">
          {error.message.substring(0, 200)}
        </p>
      )}
      <div className="flex gap-3">
        <Button onClick={handleReset} variant="default" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Tekrar Dene
        </Button>
        <Button onClick={handleRefresh} variant="outline" className="gap-2">
          Sayfayı Yenile
        </Button>
        <Button onClick={() => window.location.href = "/"} variant="ghost" className="gap-2">
          <Home className="h-4 w-4" />
          Ana Sayfa
        </Button>
      </div>
    </div>
  )
}
