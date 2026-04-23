// © 2026 DoctoPal — All Rights Reserved
//
// F-PROFILE-001 Commit 3: Vaccines tab. VaccineProfileSection is
// fully self-contained (its own user_profiles.vaccines fetch + save,
// own Card chrome, own optimistic UI) so the tab is a thin wrapper.
// No tab title — section has its own header.
"use client"

import { VaccineProfileSection } from "@/components/profile/VaccineProfileSection"

interface VaccinesTabProps {
  lang: "tr" | "en"
  userId: string
}

export function VaccinesTab({ lang, userId }: VaccinesTabProps) {
  return (
    <section className="space-y-4">
      <VaccineProfileSection lang={lang} userId={userId} />
    </section>
  )
}
