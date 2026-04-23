// © 2026 DoctoPal — All Rights Reserved
//
// F-PROFILE-001 Commit 3: Family History tab. Read-only mini preview
// of the user's latest family_history_entries + two CTAs pointing at
// /family-health-tree — the full tree + AI genetic analysis lives
// there. Inline FamilyHistorySection would duplicate that surface.
//
// Deep-link strategy (per user spec):
//   - "+ Yeni Ekle"          → /family-health-tree?section=history&new=true
//       (F-PALETTE-001 contract — auto-opens the Add modal on arrival,
//       strips ?new=true from the URL so refresh doesn't re-fire)
//   - "Aile Sağlık Ağacını Aç" → /family-health-tree
//       (landing on the tree + analysis page; history section visible
//       at the top thanks to F-PALETTE-001 Commit 1 layout)
//
// Fetch: GET /api/family-history — returns entries[] for the
// authenticated user. Graceful degrade when the table isn't migrated
// (empty state renders, no error surface).
"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Users, Plus, ArrowRight, Loader2 } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase"

interface FamilyHistoryEntry {
  id: string
  person_relation: string
  condition_name: string
  age_at_diagnosis: number | null
  age_at_death: number | null
  is_deceased: boolean
  notes: string | null
  created_at: string
}

interface FamilyTabProps {
  lang: "tr" | "en"
  /** Needed only for the authenticated fetch below — `/api/family-history`
   *  reads auth context itself. Kept in the signature for symmetry with
   *  the other tabs + any future caller that wants to scope differently. */
  userId: string
}

export function FamilyTab({ lang }: FamilyTabProps) {
  const tr = lang === "tr"
  const [entries, setEntries] = useState<FamilyHistoryEntry[] | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      const headers: Record<string, string> = {}
      if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`
      const res = await fetch("/api/family-history", { headers })
      if (!res.ok) {
        setEntries([])
        return
      }
      const json = await res.json()
      setEntries(Array.isArray(json.entries) ? json.entries : [])
    } catch {
      setEntries([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchEntries()
  }, [fetchEntries])

  const total = entries?.length ?? 0
  const preview = (entries ?? []).slice(0, 3)

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">{tr ? "Aile Sağlık Geçmişin" : "Family Health History"}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {tr
            ? "Anne, baba, kardeş gibi yakınlarında gördüğün kronik hastalık, kanser veya erken kalp krizi gibi sağlık öykülerini burada tut. Detaylı düzenleme Aile Sağlık Ağacı'nda."
            : "Record health history from parents, siblings, or other relatives — chronic conditions, cancers, early cardiac events. Full editing lives in the Family Health Tree."}
        </p>
      </div>

      {/* Summary + preview card */}
      <div className="rounded-2xl border border-border bg-card p-5">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : total === 0 ? (
          <div className="text-center py-5">
            <Users className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm font-semibold mb-1">
              {tr ? "Henüz kayıt yok" : "No entries yet"}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              {tr
                ? "Anne, baba veya kardeşlerinin sağlık geçmişini ekleyerek genetik risk değerlendirmesini iyileştir."
                : "Add your parents' or siblings' health history to sharpen the genetic risk assessment."}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                {tr ? `Toplam ${total} kayıt` : `${total} entries total`}
              </p>
              {total > 3 && (
                <p className="text-[11px] text-muted-foreground">
                  {tr ? `Son 3 gösteriliyor` : `Showing latest 3`}
                </p>
              )}
            </div>
            <ul className="space-y-2">
              {preview.map((e) => (
                <li
                  key={e.id}
                  className="rounded-lg border border-border bg-background/60 p-3"
                >
                  <p className="text-sm font-semibold">
                    {e.person_relation}
                    {typeof e.age_at_diagnosis === "number" && (
                      <span className="text-xs font-normal text-muted-foreground ml-2">
                        {tr ? `(${e.age_at_diagnosis} yaşında tanı)` : `(diagnosed at ${e.age_at_diagnosis})`}
                      </span>
                    )}
                  </p>
                  <p className="text-sm mt-0.5">{e.condition_name}</p>
                  {e.is_deceased && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {typeof e.age_at_death === "number"
                        ? (tr ? `${e.age_at_death} yaşında vefat` : `passed away at ${e.age_at_death}`)
                        : (tr ? "Vefat etti" : "Deceased")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* CTA row */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Link
          href="/family-health-tree?section=history&new=true"
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-foreground text-background px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          {tr ? "Yeni Ekle" : "Add New"}
        </Link>
        <Link
          href="/family-health-tree"
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted/60 transition-colors"
        >
          {tr ? "Aile Sağlık Ağacını Aç" : "Open Family Health Tree"}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
