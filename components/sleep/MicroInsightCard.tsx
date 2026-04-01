// © 2026 Doctopal — All Rights Reserved
"use client";

import { Sparkles, Loader2 } from "lucide-react";
import { tx } from "@/lib/translations";

interface MicroInsightCardProps {
  insight: string | null;
  isLoading: boolean;
  lang: "en" | "tr";
}

export function MicroInsightCard({ insight, isLoading, lang }: MicroInsightCardProps) {
  if (!insight && !isLoading) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-4 dark:border-purple-800 dark:from-purple-950/30 dark:to-indigo-950/30">
      {/* Background shimmer */}
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-purple-400/10 blur-xl" />

      <div className="relative flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/40">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-purple-600 dark:text-purple-400" />
          ) : (
            <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            {tx("sleep.microInsight", lang)}
          </h3>
          {isLoading ? (
            <div className="mt-2 space-y-2">
              <div className="h-3 w-full rounded bg-purple-100/80 animate-pulse dark:bg-purple-900/40" />
              <div className="h-3 w-4/5 rounded bg-purple-100/80 animate-pulse dark:bg-purple-900/40" />
              <div className="h-3 w-3/5 rounded bg-purple-100/80 animate-pulse dark:bg-purple-900/40" />
            </div>
          ) : (
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{insight}</p>
          )}
        </div>
      </div>
    </div>
  );
}
