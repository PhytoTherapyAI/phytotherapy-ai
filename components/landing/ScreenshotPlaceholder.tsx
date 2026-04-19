// © 2026 DoctoPal — All Rights Reserved
// Placeholder for an eventual <Image /> preview.
// mode="hero" renders a richer mock UI (browser chrome + mock assistant chat)
// for the Hero section. mode="simple" keeps a Monitor icon for feature cards.
"use client"

import { Monitor, Sparkles, Activity } from "lucide-react"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"

interface Props {
  /** Translation key for the caption. Defaults to Hero caption. */
  captionKey?: string
  /** Aspect ratio of the frame. */
  aspectRatio?: "16:10" | "4:3" | "1:1"
  /** Width ceiling of the placeholder. */
  size?: "lg" | "md" | "sm"
  /** Visual richness. `hero` shows a mock panel; `simple` shows an icon. */
  mode?: "hero" | "simple"
  /** Extra classes on the outer wrapper. */
  className?: string
}

const ASPECT_CLASS: Record<NonNullable<Props["aspectRatio"]>, string> = {
  "16:10": "aspect-[16/10]",
  "4:3": "aspect-[4/3]",
  "1:1": "aspect-square",
}

const SIZE_CLASS: Record<NonNullable<Props["size"]>, string> = {
  lg: "max-w-2xl",
  md: "max-w-md",
  sm: "max-w-xs",
}

export function ScreenshotPlaceholder({
  captionKey = "landing.hero.screenshotCaption",
  aspectRatio = "16:10",
  size = "lg",
  mode = "simple",
  className = "",
}: Props) {
  const { lang } = useLang()
  const tr = lang === "tr"

  return (
    <div className={`w-full ${SIZE_CLASS[size]} ${className}`}>
      {mode === "hero" ? (
        <div
          className={`group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl transition-colors hover:border-emerald-300 dark:hover:border-emerald-700 ${ASPECT_CLASS[aspectRatio]}`}
        >
          {/* Browser chrome — traffic lights + address bar */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-400" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-green-400" aria-hidden="true" />
            </div>
            <div className="flex-1 ml-4 px-3 py-1 bg-white dark:bg-slate-900 rounded text-[11px] text-slate-400 dark:text-slate-500 font-mono">
              doctopal.com
            </div>
          </div>

          {/* Mock panel body */}
          <div className="p-5 space-y-4">
            {/* Section header */}
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {tr ? "Sağlık Asistanı" : "Health Assistant"}
              </div>
              <div className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/60">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {tr ? "Aktif" : "Active"}
              </div>
            </div>

            {/* Mock chat rows */}
            <div className="space-y-2">
              <div className="ml-auto w-4/5 h-3 rounded-md bg-slate-200 dark:bg-slate-700" />
              <div className="ml-auto w-3/5 h-3 rounded-md bg-slate-200 dark:bg-slate-700" />
              <div className="mt-3 w-5/6 h-3 rounded-md bg-emerald-100 dark:bg-emerald-950/50" />
              <div className="w-4/6 h-3 rounded-md bg-emerald-100 dark:bg-emerald-950/50" />
              <div className="w-3/6 h-3 rounded-md bg-emerald-100 dark:bg-emerald-950/50" />
            </div>

            {/* Mock medication chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {["Aspirin 100mg", "Concor 5mg", "Omega-3"].map((m) => (
                <span
                  key={m}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  {m}
                </span>
              ))}
            </div>

            {/* Mini metric line */}
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 px-3 py-2">
              <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
              <svg viewBox="0 0 200 24" className="flex-1 h-5" preserveAspectRatio="none" aria-hidden="true">
                <polyline
                  points="0,18 20,14 40,16 60,8 80,12 100,4 120,10 140,6 160,12 180,8 200,10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-emerald-500 dark:text-emerald-400"
                />
              </svg>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
                7d
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 shadow-lg transition-colors hover:border-emerald-300 dark:hover:border-emerald-700 ${ASPECT_CLASS[aspectRatio]}`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <Monitor
              className="h-16 w-16 text-slate-300 dark:text-slate-600 transition-colors group-hover:text-emerald-400"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>
        </div>
      )}

      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
        {tx(captionKey, lang)}
      </p>
    </div>
  )
}
