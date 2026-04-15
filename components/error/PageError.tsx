// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Home, WifiOff } from "lucide-react";

interface PageErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  icon?: React.ReactNode;
  title: string;
  description: string;
  retryLabel?: string;
}

export function PageError({
  error,
  reset,
  icon,
  title,
  description,
  retryLabel = "Try Again",
}: PageErrorProps) {
  useEffect(() => {
    console.error(`[ErrorBoundary] ${title}:`, error);
    import("@sentry/nextjs")
      .then(Sentry => Sentry.captureException(error))
      .catch(() => {
        // Sentry unavailable — swallow
      });
  }, [error, title]);

  const isOffline = typeof navigator !== "undefined" && !navigator.onLine;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      {isOffline ? (
        <WifiOff className="h-12 w-12 text-muted-foreground" />
      ) : (
        icon ?? <img src="/logo-icon.svg" alt="DoctoPal" className="h-14 w-14 opacity-60" />
      )}
      <h2 className="text-xl font-semibold">
        {isOffline ? "You're offline" : title}
      </h2>
      <p className="max-w-md text-sm text-muted-foreground">
        {isOffline
          ? "Please check your internet connection and try again."
          : description}
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} className="gap-2">
          <RotateCcw className="h-4 w-4" /> {retryLabel}
        </Button>
        <Button onClick={() => { window.location.href = "/"; }} variant="ghost" className="gap-2">
          <Home className="h-4 w-4" /> Home
        </Button>
      </div>
      {error.digest && (
        <p className="text-xs text-muted-foreground/50 font-mono">
          Error ID: {error.digest}
        </p>
      )}
    </div>
  );
}
