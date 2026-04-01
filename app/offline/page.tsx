// © 2026 Doctopal — All Rights Reserved
"use client"

import { WifiOff, RefreshCw } from "lucide-react"

export default function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <WifiOff className="h-10 w-10 text-muted-foreground" />
      </div>
      <h1 className="font-heading text-2xl font-semibold">You&apos;re Offline</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        It looks like you&apos;ve lost your internet connection. Some features may be limited while offline.
        Your data is safe and will sync when you&apos;re back online.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        <RefreshCw className="h-4 w-4" />
        Try Again
      </button>
    </div>
  )
}
