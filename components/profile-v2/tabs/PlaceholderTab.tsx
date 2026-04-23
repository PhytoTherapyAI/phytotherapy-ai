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
  "ilaclar": {
    tr: {
      title: "İlaçlar",
      items: ["Aktif ilaçlarım", "İlaç ekle / düzenle / sil", "İlaç tarama (foto)"],
    },
    en: {
      title: "Medications",
      items: ["Active medications", "Add / edit / remove", "Prescription photo scan"],
    },
  },
  "takviyeler": {
    tr: {
      title: "Takviyeler",
      items: ["Vitamin & mineraller", "Bitkisel takviyeler", "Doz & sıklık girişi"],
    },
    en: {
      title: "Supplements",
      items: ["Vitamins & minerals", "Herbal supplements", "Dose & frequency entry"],
    },
  },
  "alerjiler": {
    tr: {
      title: "Alerjiler",
      items: ["Yaygın alerjen chip'leri", "Reaksiyon tipi", "Özel alerji ekle", "'Alerji yok' toggle"],
    },
    en: {
      title: "Allergies",
      items: ["Common allergen chips", "Reaction type", "Add custom allergy", "'No allergies' toggle"],
    },
  },
  "asilar": {
    tr: {
      title: "Aşılar",
      items: ["Temel aşılar (Tetanoz, Hepatit B…)", "Ek aşılar", "Kronolojik aşı geçmişi"],
    },
    en: {
      title: "Vaccines",
      items: ["Core vaccines (Tetanus, Hepatitis B…)", "Additional vaccines", "Chronological history"],
    },
  },
  "aile-oykusu": {
    tr: {
      title: "Aile Öyküsü",
      items: ["Akraba hastalık geçmişi özeti", "Detaylı düzenleme için Aile Sağlık Ağacı'na yönlendirme"],
    },
    en: {
      title: "Family History",
      items: ["Summary of relatives' conditions", "Deep-edit link to Family Health Tree"],
    },
  },
  "ureme": {
    tr: {
      title: "Üreme Sağlığı",
      items: ["Hamilelik & emzirme", "Adet döngüsü"],
    },
    en: {
      title: "Reproductive Health",
      items: ["Pregnancy & breastfeeding", "Menstrual cycle"],
    },
  },
  "gizlilik": {
    tr: {
      title: "Gizlilik & Rıza",
      items: ["KVKK aydınlatma durumu", "3 açık rıza toggle'ı", "Veri silme isteği", "Verilerimi indir (JSON export)"],
    },
    en: {
      title: "Privacy & Consent",
      items: ["KVKK disclosure status", "3 explicit consent toggles", "Data deletion request", "Download my data (JSON export)"],
    },
  },
}
