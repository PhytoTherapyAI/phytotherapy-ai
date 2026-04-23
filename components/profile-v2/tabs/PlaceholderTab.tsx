// © 2026 DoctoPal — All Rights Reserved
//
// Placeholder content for tabs that haven't been migrated yet in the
// F-PROFILE-001 redesign. Shown during Commit 1-N of the rollout; the
// final commit removes this component entirely.
//
// Copy per user request (Session 45):
//   "Bu sekme şu an yapılandırılıyor. Mevcut düzenleyiciye dön → [link]"
//   "Yakında burada: [feature list for that tab]"
"use client"

import Link from "next/link"
import { ArrowRight, Wrench } from "lucide-react"

interface PlaceholderTabProps {
  lang: "tr" | "en"
  /** Short title echoing the sidebar label so the user knows which tab they're on. */
  title: string
  /** Upcoming feature bullets shown under the "yakında" line. */
  upcomingItems: string[]
}

export function PlaceholderTab({ lang, title, upcomingItems }: PlaceholderTabProps) {
  const tr = lang === "tr"
  return (
    <section className="mx-auto max-w-2xl py-10">
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 sm:p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400">
          <Wrench className="h-5 w-5" />
        </div>
        <h2 className="font-heading text-lg font-bold mb-2">{title}</h2>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {tr
            ? "Bu sekme şu an yapılandırılıyor. Alanlarını yeni yapıda tekrar düzenleyeceğiz."
            : "This section is being restructured. We'll wire the fields back into the new layout shortly."}
        </p>
        <Link
          href="/profile?legacy=true"
          className="inline-flex items-center gap-1.5 rounded-lg bg-foreground text-background px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          {tr ? "Mevcut düzenleyiciye dön" : "Open the current editor"}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {upcomingItems.length > 0 && (
        <div className="mt-6 rounded-xl border border-border bg-card px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            {tr ? "Yakında burada" : "Coming soon"}
          </p>
          <ul className="space-y-1.5 text-sm">
            {upcomingItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-foreground/90">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

// ─── Per-tab feature bullets (lives here so the shell stays thin) ──────
// Updated incrementally as each tab migrates — once a tab lands its
// real content in later commits, remove the entry from this map.
export const PLACEHOLDER_CONTENT: Record<string, { tr: { title: string; items: string[] }; en: { title: string; items: string[] } }> = {
  // vucut-yasam + tibbi-gecmis migrated to real tabs in F-PROFILE-001
  // Commit 2.1 — entries removed from the placeholder map.
  // ilaclar migrated in Commit 2.2 (MedicationsTab + full F-SAFETY-002.2).
  // takviyeler migrated in Commit 3.
  // gizlilik migrated to real tab in Commit 4.
  // All 9 real tabs live; saglik-raporu stays as an inline placeholder
  // block in ShellV2 until Commit 5 lands Digital Twin + Gamification
  // + SBAR PDF. That inline block doesn't read from this map.
}
