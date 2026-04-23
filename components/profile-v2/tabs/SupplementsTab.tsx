// © 2026 DoctoPal — All Rights Reserved
//
// F-PROFILE-001 Commit 3: Supplements tab. Wraps the
// ProfileSupplementsStep onboarding adapter — the adapter already
// owns its own debounced auto-save against user_profiles.supplements
// (line 60-66 in OnboardingAdapters.tsx). Tab just provides a header,
// hydrates from `profile.supplements`, and forwards an onUpdate
// callback that triggers a parent refetch so other tabs (like
// MedicationsTab's safety screen) see the new entries.
"use client"

import { useState } from "react"
import { ProfileSupplementsStep } from "@/components/profile/OnboardingAdapters"

interface SupplementsTabProps {
  lang: "tr" | "en"
  userId: string
  /** profile.supplements array. May contain `meta:` prefixed entries
   *  (city, insurance, etc.) — the adapter strips them at render. */
  initialSupplements: string[]
  onSaved?: () => void
}

export function SupplementsTab({ lang, userId, initialSupplements, onSaved }: SupplementsTabProps) {
  const tr = lang === "tr"
  // Local mirror so the adapter sees state changes synchronously
  // without waiting for an authProfile refresh. Parent's onSaved is
  // still called so cross-tab consumers (e.g. interaction matrix)
  // re-fetch.
  const [supplements, setSupplements] = useState<string[]>(initialSupplements)

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">{tr ? "Takviyelerim" : "My Supplements"}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {tr
            ? "Kullandığın vitamin, mineral, omega-3 ve bitkisel takviyeleri ekle. Değişiklikler otomatik kaydedilir."
            : "Add the vitamins, minerals, omega-3, and herbal supplements you take. Changes auto-save."}
        </p>
      </div>

      <ProfileSupplementsStep
        userId={userId}
        supplements={supplements}
        onUpdate={(next) => {
          setSupplements(next)
          onSaved?.()
        }}
      />
    </section>
  )
}
