// © 2026 DoctoPal — All Rights Reserved
// Generic screenshot placeholder for Hero + Solution sections.
// Replaced later with <Image /> + actual panel shots.
"use client"

import { Monitor } from "lucide-react"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"

interface Props {
  /** Translation key for the caption. Defaults to Hero caption. */
  captionKey?: string
  /** Aspect ratio of the frame. */
  aspectRatio?: "16:10" | "4:3" | "1:1"
  /** Width ceiling of the placeholder. */
  size?: "lg" | "md" | "sm"
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
  className = "",
}: Props) {
  const { lang } = useLang()

  return (
    <div className={`w-full ${SIZE_CLASS[size]} ${className}`}>
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
      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
        {tx(captionKey, lang)}
      </p>
    </div>
  )
}
