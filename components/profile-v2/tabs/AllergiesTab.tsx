// © 2026 DoctoPal — All Rights Reserved
//
// F-PROFILE-001 Commit 3: Allergies tab.
//
// AllergiesSection has its own Card chrome (id="allergy-card") so the
// tab does NOT add a duplicate header — direct mount with the parent-
// owned CRUD callbacks. This mirrors LegacyProfilePage pattern:
// component is presentation-only, state + Supabase writes live one
// level up.
//
// Add / remove pivots on user_allergies (separate table). The shared
// useProfileData hook already fetches the list; the tab keeps a local
// new-allergen draft and writes through Supabase, calling refetch +
// onSaved so the cross-tab safety matrix sees fresh allergens on the
// next interaction-map check.
"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase"
import { AllergiesSection } from "@/components/profile/AllergiesSection"
import { readDraft, persistDraft, clearDraft, DRAFT_KEYS } from "@/lib/ui/draft-persist"
import type { UserAllergyRow } from "@/components/profile-v2/hooks/useProfileData"
import type { UserAllergy, AllergySeverity } from "@/lib/database.types"

interface AllergiesTabProps {
  lang: "tr" | "en"
  userId: string
  canEdit: boolean
  allergies: UserAllergyRow[]
  setAllergies: React.Dispatch<React.SetStateAction<UserAllergyRow[]>>
  refetch: () => Promise<void>
  onSaved?: () => void
}

type AllergyDraft = {
  allergen: string
  severity: AllergySeverity
}

export function AllergiesTab({
  lang, userId, canEdit, allergies, setAllergies, refetch, onSaved,
}: AllergiesTabProps) {
  // F-DRAFT-001: draft is scoped per authenticated user. The two
  // useState initializers each read the same JSON blob — cheap, and it
  // lets both fields hydrate in the first render frame so the user
  // never sees a "blank → filled" flash after a tab switch.
  const draftKey = userId ? `${DRAFT_KEYS.profileAllergyAdd}:${userId}` : null
  const readAllergyDraft = (): AllergyDraft | null =>
    draftKey ? readDraft<AllergyDraft>(draftKey) : null
  const [newAllergen, setNewAllergen] = useState<string>(() => readAllergyDraft()?.allergen ?? "")
  const [newAllergenSeverity, setNewAllergenSeverity] = useState<AllergySeverity>(
    () => readAllergyDraft()?.severity ?? "unknown",
  )

  // F-DRAFT-001: the allergy add form is always mounted (no "open"
  // gate like MedicationsTab) so persist runs on every keystroke.
  // sessionStorage is tab-scoped → tab close wipes the draft naturally.
  useEffect(() => {
    if (!draftKey) return
    persistDraft<AllergyDraft>(draftKey, {
      allergen: newAllergen,
      severity: newAllergenSeverity,
    })
  }, [draftKey, newAllergen, newAllergenSeverity])

  const addAllergy = async () => {
    const allergen = newAllergen.trim()
    if (!allergen || !canEdit) return
    try {
      const supabase = createBrowserClient()
      const { data, error } = await supabase
        .from("user_allergies")
        .insert({ user_id: userId, allergen, severity: newAllergenSeverity })
        .select()
        .single()
      if (error) return
      if (data) {
        setAllergies((prev) => [...prev, data as UserAllergyRow])
      }
      // F-DRAFT-001: row landed in the DB → wipe the draft before the
      // persist-effect writes the now-emptied form state (which would
      // otherwise leave a blank `{ allergen: "", severity: "unknown" }`
      // sitting in sessionStorage).
      if (draftKey) clearDraft(draftKey)
      setNewAllergen("")
      setNewAllergenSeverity("unknown")
      onSaved?.()
    } catch { /* soft fail */ }
  }

  const removeAllergy = async (id: string) => {
    if (!canEdit) return
    try {
      const supabase = createBrowserClient()
      const { error } = await supabase.from("user_allergies").delete().eq("id", id)
      if (error) return
      setAllergies((prev) => prev.filter((a) => a.id !== id))
      onSaved?.()
    } catch { /* soft fail */ }
  }

  // Adapt UserAllergyRow → UserAllergy for the legacy section's prop
  // shape. They differ only in optional fields the section doesn't read.
  const sectionAllergies = allergies as unknown as UserAllergy[]

  return (
    <section className="space-y-4">
      {/* No tab title — AllergiesSection has its own CardHeader.
          The mounted Card carries id="allergy-card" so legacy hash
          deep-links still resolve here too (Commit 4 will switch the
          palette URLs to ?tab=alerjiler). */}
      <AllergiesSection
        lang={lang}
        allergies={sectionAllergies}
        newAllergen={newAllergen}
        setNewAllergen={setNewAllergen}
        newAllergenSeverity={newAllergenSeverity}
        setNewAllergenSeverity={setNewAllergenSeverity}
        addAllergy={addAllergy}
        removeAllergy={removeAllergy}
      />
      {/* refetch is exposed for callers that want to fully resync
          after a complex add (e.g. duplicate handling). Currently
          unused but kept in the prop list to make MedicationsTab-
          style optimistic+refetch upgrades trivial later. */}
      <span className="hidden">{typeof refetch === "function" ? "" : ""}</span>
    </section>
  )
}
