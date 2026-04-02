// © 2026 Doctopal — All Rights Reserved
// Smart Back Button — hierarchy-aware navigation
// Shows breadcrumbs + back arrow that goes to parent category, not home

"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { useToolNavigation } from "@/lib/use-tool-navigation";
import { useLang } from "@/components/layout/language-toggle";

export function SmartBackButton() {
  const { lang } = useLang();
  const { breadcrumbs, backUrl, isToolPage } = useToolNavigation();

  if (!isToolPage || breadcrumbs.length === 0) return null;

  return (
    <div className="mb-4 flex items-center gap-2">
      {/* Back arrow — goes to parent category */}
      <Link
        href={backUrl}
        className="flex h-8 w-8 items-center justify-center rounded-lg border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Go back"
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-xs text-muted-foreground overflow-x-auto">
        <Link href="/dashboard" className="shrink-0 hover:text-foreground transition-colors">
          <Home className="h-3 w-3" />
        </Link>
        {breadcrumbs.map((crumb, i) => {
          const isLast = i === breadcrumbs.length - 1;
          return (
            <span key={i} className="flex items-center gap-1 shrink-0">
              <ChevronRight className="h-3 w-3 text-muted-foreground/70" />
              {isLast ? (
                <span className="font-medium text-foreground truncate max-w-[150px]">
                  {crumb.label[lang]}
                </span>
              ) : (
                <Link href={crumb.href} className="hover:text-foreground transition-colors truncate max-w-[120px]">
                  {crumb.label[lang]}
                </Link>
              )}
            </span>
          );
        })}
      </nav>
    </div>
  );
}
