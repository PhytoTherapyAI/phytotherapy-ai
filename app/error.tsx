// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RotateCcw, Home, RefreshCw } from "lucide-react"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { lang } = useLang()
  useEffect(() => {
    console.error("[ErrorBoundary]", error)
    import("@sentry/nextjs").then((Sentry) => Sentry.captureException(error)).catch(() => {})
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-icon.svg" alt="DoctoPal" className="h-14 w-14 opacity-60" />
      <h2 className="text-xl font-semibold">{tx("error.somethingWentWrong", lang)}</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        {error.message || tx("error.genericDesc", lang)}
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <Button onClick={() => reset()} variant="default" className="gap-2">
          <RotateCcw className="h-4 w-4" /> {tx("error.tryAgain", lang)}
        </Button>
        <Button onClick={() => { if (typeof window !== "undefined") window.location.reload() }} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" /> {tx("error.refreshPage", lang)}
        </Button>
        <Button onClick={() => { if (typeof window !== "undefined") window.location.href = "/" }} variant="ghost" className="gap-2">
          <Home className="h-4 w-4" /> {tx("error.goHome", lang)}
        </Button>
      </div>
    </div>
  )
}
