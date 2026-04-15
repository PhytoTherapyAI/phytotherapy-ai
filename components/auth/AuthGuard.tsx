// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AuthGuardProps {
  children: React.ReactNode;
  /** Custom loading UI (default: centered spinner) */
  loadingFallback?: React.ReactNode;
  /** Custom guest UI shown when not authenticated (default: login prompt) */
  guestFallback?: React.ReactNode;
}

export function AuthGuard({ children, loadingFallback, guestFallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { lang } = useLang();

  if (isLoading) {
    return loadingFallback ?? (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return guestFallback ?? (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <LogIn className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-lg font-semibold">{tx("common.loginRequired", lang)}</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          {tx("common.loginToUse2", lang)}
        </p>
        <Link href="/auth/login">
          <Button>{tx("common.login", lang)}</Button>
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
