// © 2026 DoctoPal — All Rights Reserved
// Placeholder for an eventual <Image /> preview.
// mode="hero" renders a realistic Interaction Checker result preview
// (question + emerald-bordered AI answer + evidence tags + med chips).
// mode="simple" keeps a Monitor icon for feature cards.
"use client"

import { Monitor, Sparkles, User } from "lucide-react"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"

interface Props {
  /** Translation key for the caption. Defaults to Hero caption. */
  captionKey?: string
  /** Aspect ratio of the frame. */
  aspectRatio?: "16:10" | "4:3" | "1:1"
  /** Width ceiling of the placeholder. */
  size?: "lg" | "md" | "sm"
  /** Visual richness. `hero` shows a mock interaction result; `simple` shows an icon. */
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

          {/* Panel body — realistic Interaction Checker preview */}
          <div className="p-4 sm:p-5 space-y-3">
            {/* Panel header */}
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {tr ? "Sağlık Asistanı" : "Health Assistant"}
              </div>
              <div className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/60">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                {tr ? "Aktif" : "Active"}
              </div>
            </div>

            {/* Question card */}
            <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 backdrop-blur border border-slate-200 dark:border-slate-700/50 p-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                <User className="h-3.5 w-3.5" aria-hidden="true" />
              </div>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {tr
                  ? "Aspirin 100mg ile Concor 5mg birlikte alınabilir mi?"
                  : "Can Aspirin 100mg be taken together with Concor 5mg?"}
              </p>
            </div>

            {/* Answer card — emerald left border */}
            <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 backdrop-blur border-l-4 border-emerald-500 border-y border-r border-y-emerald-100 border-r-emerald-100 dark:border-y-emerald-900/40 dark:border-r-emerald-900/40 p-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <span className="inline-flex items-center gap-1 rounded bg-emerald-100 dark:bg-emerald-600/20 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-emerald-700 dark:text-emerald-400">
                  ✓ {tr ? "DÜŞÜK RİSK" : "LOW RISK"}
                </span>
                <p className="text-sm leading-relaxed text-slate-900 dark:text-slate-200">
                  {tr
                    ? "Bu kombinasyon literatürde güvenli kabul edilir."
                    : "This combination is considered safe in the literature."}
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                  <span>📊 {tr ? "Yüksek kanıt seviyesi" : "High evidence level"}</span>
                  <span>🔬 {tr ? "12 çalışma" : "12 studies"}</span>
                  <span>🇹🇷 {tr ? "İlaç Bilgi Bankası" : "Drug Info Bank"}</span>
                </div>
              </div>
            </div>

            {/* Current medications footer */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-500 mb-1.5">
                {tr ? "Mevcut ilaçların:" : "Your medications:"}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["Aspirin 100mg", "Concor 5mg", "Omega-3"].map((m) => (
                  <span
                    key={m}
                    className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    {m}
                  </span>
                ))}
              </div>
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
