// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Home, WifiOff } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface PageErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  icon?: React.ReactNode;
  title: string;
  description: string;
  /** Optional override; default is the localised "Tekrar Dene" / "Try Again". */
  retryLabel?: string;
}

export function PageError({
  error,
  reset,
  icon,
  title,
  description,
  retryLabel,
}: PageErrorProps) {
  const { lang } = useLang();
  useEffect(() => {
    console.error(`[ErrorBoundary] ${title}:`, error);
    import("@sentry/nextjs")
      .then(Sentry => Sentry.captureException(error))
      .catch(() => {
        // Sentry unavailable — swallow
      });
  }, [error, title]);

  const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
  const effectiveRetry = retryLabel ?? tx("error.tryAgain", lang);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      {isOffline ? (
        <WifiOff className="h-12 w-12 text-muted-foreground" />
      ) : (
        icon ?? <img src="/logo-icon.svg" alt="DoctoPal" className="h-14 w-14 opacity-60" />
      )}
      <h2 className="text-xl font-semibold">
        {isOffline ? tx("error.youreOffline", lang) : title}
      </h2>
      <p className="max-w-md text-sm text-muted-foreground">
        {isOffline ? tx("error.checkConnection", lang) : description}
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} className="gap-2">
          <RotateCcw className="h-4 w-4" /> {effectiveRetry}
        </Button>
        <Button onClick={() => { window.location.href = "/"; }} variant="ghost" className="gap-2">
          <Home className="h-4 w-4" /> {tx("error.home", lang)}
        </Button>
      </div>
      {error.digest && (
        <p className="text-xs text-muted-foreground/50 font-mono">
          {tx("error.errorId", lang)}: {error.digest}
        </p>
      )}
    </div>
  );
}
