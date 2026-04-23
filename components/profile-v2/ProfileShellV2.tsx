// © 2026 DoctoPal — All Rights Reserved
//
// F-PROFILE-001 Commit 1: sidebar shell + URL-state tab routing.
//
// Contract with app/profile/page.tsx:
//   - The page-level route checks `?legacy=true` and either renders
//     this shell (default) or the legacy 1981-line monolith.
//   - This shell owns ONLY the layout, auth gating, and tab routing.
//     Domain data (medications, allergies, power score, etc.) lives
//     inside each tab — Commit 2+ introduces a `useProfileData` hook
//     if tabs end up needing the same fetches; for Commit 1 the only
//     live tab (General) reads straight from auth context.
//
// Mobile layout: Sidebar collapses into a button-triggered list at
// the top (<ProfileSidebar> handles the internal state). Desktop is
// a two-column sticky sidebar + content flex layout.
"use client"

import { useEffect, useMemo } from "react"
import Link from "next/link"
import { LogIn } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useActiveProfile } from "@/lib/use-active-profile"
import { useLang } from "@/components/layout/language-toggle"
import { ProfileSidebar } from "./ProfileSidebar"
import { useProfileTab } from "./useProfileTab"
import { GeneralTab } from "./tabs/GeneralTab"
import { BodyLifestyleTab } from "./tabs/BodyLifestyleTab"
import { MedicalHistoryTab } from "./tabs/MedicalHistoryTab"
import { MedicationsTab } from "./tabs/MedicationsTab"
import { SupplementsTab } from "./tabs/SupplementsTab"
import { AllergiesTab } from "./tabs/AllergiesTab"
import { VaccinesTab } from "./tabs/VaccinesTab"
import { FamilyTab } from "./tabs/FamilyTab"
import { ReproductiveTab } from "./tabs/ReproductiveTab"
import { PrivacyTab } from "./tabs/PrivacyTab"
import type { ProfileTabId } from "./useProfileTab"
import { PlaceholderTab } from "./tabs/PlaceholderTab"
import { useProfileData } from "./hooks/useProfileData"

export function ProfileShellV2() {
  const { user, profile: authProfile, isAuthenticated, isLoading: authLoading, refreshProfile } = useAuth()
  const { activeUserId, isOwnProfile } = useActiveProfile()
  const { lang } = useLang()
  const tr = lang === "tr"
  const { activeTab, setTab } = useProfileTab()

  // When viewing a family member, the auth profile isn't the right source;
  // legacy page fetches a separate `viewedProfile`. Commit 1 only ships the
  // General tab with its shallow read-only identity fields — we lean on
  // authProfile here and leave the richer family-view fetch for Commit 2,
  // where the ChronicConditionsEditor / meds list actually need it.
  const effectiveProfile = isOwnProfile ? authProfile : null
  const effectiveUserId = activeUserId || user?.id || ""

  // F-PROFILE-001 Commit 4: hash backward-compat. Old palette bookmarks
  // (/profile#allergy-card, #vucut-olculeri etc.) are retired in favour
  // of ?tab=<slug>, but users / external links may still arrive on the
  // legacy hash. Translate it to the right tab and strip the hash via
  // history.replaceState so a refresh doesn't re-fire the effect.
  // Unknown hashes silently strip — no error surface.
  useEffect(() => {
    if (typeof window === "undefined") return
    const raw = window.location.hash.slice(1)
    if (!raw) return
    const HASH_TO_TAB: Record<string, ProfileTabId> = {
      "vucut-olculeri": "vucut-yasam",
      "kan-grubu":      "vucut-yasam",
      "yasam-tarzi":    "vucut-yasam",
      "takviyelerim":   "takviyeler",
      "ureme-sagligi":  "ureme",
      "allergy-card":   "alerjiler",
      "medications":    "ilaclar",
      "vaccines":       "asilar",
      "medical-history": "tibbi-gecmis",
    }
    const target = HASH_TO_TAB[raw]
    if (target) setTab(target)
    // Strip hash either way — unknown hashes shouldn't sit around.
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // F-PROFILE-001 Commit 2.1: shared read layer. medications drives
  // ChronicConditionsEditor's "medication → condition" hint inside
  // MedicalHistoryTab; allergies + labTestCount will be consumed by
  // future tabs (Commit 2.2 / 3). One fetch, many tabs.
  const profileData = useProfileData(effectiveUserId || null)

  // F-PROFILE-001 Commit 3: cross-tab sync. When any tab saves a
  // user_profiles column, both the local read cache (profileData)
  // AND the auth context (authProfile) need to refresh — otherwise
  // a tab switch shows stale data because the new mount hydrates
  // from authProfile. Wrapping the two calls behind one onSaved
  // closure means every tab can opt in with a single prop.
  const handleTabSaved = useMemo(
    () => async () => {
      await Promise.all([
        profileData.refetch(),
        refreshProfile().catch(() => { /* non-fatal */ }),
      ])
    },
    [profileData, refreshProfile],
  )

  // Sidebar header — avatar + display name. Kept in the shell (rather
  // than a tab) because it survives tab changes.
  const sidebarHeader = useMemo(() => {
    const name = effectiveProfile?.full_name || (tr ? "Profilim" : "My Profile")
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {tr ? "Profil" : "Profile"}
        </p>
        <p className="mt-1 text-sm font-semibold text-foreground truncate">{name}</p>
      </div>
    )
  }, [effectiveProfile?.full_name, tr])

  // ── Auth gating ────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 md:px-8 py-10">
        <div className="h-6 w-32 bg-muted animate-pulse rounded-md" />
        <div className="mt-6 h-64 bg-muted/60 animate-pulse rounded-xl" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto max-w-lg px-4 md:px-8 py-16 text-center">
        <h1 className="font-heading text-2xl font-bold mb-2">
          {tr ? "Profilini görmek için giriş yap" : "Sign in to view your profile"}
        </h1>
        <p className="text-sm text-muted-foreground mb-5">
          {tr
            ? "Profilindeki sağlık verilerin KVKK kapsamında korunur. Giriş yaptıktan sonra tüm bölümler burada listelenir."
            : "Your health data is KVKK-protected. Once you sign in, all your sections live here."}
        </p>
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 rounded-lg bg-foreground text-background px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <LogIn className="h-4 w-4" />
          {tr ? "Giriş Yap" : "Sign In"}
        </Link>
      </div>
    )
  }

  // ── Tab content ────────────────────────────────────────────────────
  // Each case pulls its own props. Adding a new tab is a two-step edit:
  // (1) extend PROFILE_TABS in useProfileTab, (2) add a case here.
  // Until a tab lands its real content, PlaceholderTab + PLACEHOLDER_CONTENT
  // tell the user what's coming.
  function renderTab(): React.ReactNode {
    switch (activeTab) {
      case "genel":
        return (
          <GeneralTab
            lang={lang as "tr" | "en"}
            userId={effectiveUserId}
            isOwnProfile={isOwnProfile}
            profile={effectiveProfile ?? null}
          />
        )

      case "vucut-yasam":
        return (
          <BodyLifestyleTab
            lang={lang as "tr" | "en"}
            userId={effectiveUserId}
            profile={effectiveProfile ?? null}
            onSaved={handleTabSaved}
          />
        )

      case "tibbi-gecmis":
        return (
          <MedicalHistoryTab
            lang={lang as "tr" | "en"}
            userId={effectiveUserId}
            gender={(effectiveProfile?.gender as string | undefined) ?? null}
            profile={effectiveProfile ?? null}
            medications={profileData.medications}
            onSaved={handleTabSaved}
          />
        )

      case "ilaclar":
        return (
          <MedicationsTab
            lang={lang as "tr" | "en"}
            userId={effectiveUserId}
            canEdit={isOwnProfile}
            patientName={effectiveProfile?.full_name ?? null}
            medications={profileData.medications}
            setMedications={profileData.setMedications}
            refetch={profileData.refetch}
          />
        )

      case "takviyeler":
        return (
          <SupplementsTab
            lang={lang as "tr" | "en"}
            userId={effectiveUserId}
            initialSupplements={
              Array.isArray((effectiveProfile as { supplements?: unknown } | null)?.supplements)
                ? ((effectiveProfile as { supplements: string[] }).supplements)
                : []
            }
            onSaved={handleTabSaved}
          />
        )

      case "alerjiler":
        return (
          <AllergiesTab
            lang={lang as "tr" | "en"}
            userId={effectiveUserId}
            canEdit={isOwnProfile}
            allergies={profileData.allergies}
            setAllergies={profileData.setAllergies}
            refetch={profileData.refetch}
            onSaved={handleTabSaved}
          />
        )

      case "asilar":
        return <VaccinesTab lang={lang as "tr" | "en"} userId={effectiveUserId} />

      case "aile-oykusu":
        return <FamilyTab lang={lang as "tr" | "en"} userId={effectiveUserId} />

      case "ureme":
        return (
          <ReproductiveTab
            lang={lang as "tr" | "en"}
            userId={effectiveUserId}
            gender={(effectiveProfile?.gender as string | undefined) ?? null}
            profile={effectiveProfile ?? null}
            onSaved={handleTabSaved}
          />
        )

      case "gizlilik":
        return (
          <PrivacyTab
            lang={lang as "tr" | "en"}
            patientName={effectiveProfile?.full_name ?? null}
          />
        )

      case "saglik-raporu":
        // Health Report tab — canlılık skoru + rozetler + SBAR PDF arrive
        // in Commit 5 of the rollout. Until then the legacy editor has
        // the full widget; we tell the user that plainly.
        return (
          <PlaceholderTab
            lang={lang as "tr" | "en"}
            title={tr ? "Sağlık Raporu" : "Health Report"}
            upcomingItems={tr
              ? ["Canlılık skoru halkası", "Başarı rozetleri", "Sayı kartları (aktif ilaç, takviye, tahlil)", "SBAR PDF indir + e-posta gönder", "Son aktiviteler akışı"]
              : ["Vitality score ring", "Achievement badges", "Stat cards (active meds, supplements, labs)", "SBAR PDF download + email", "Recent activity feed"]}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-8 py-6 md:py-10">
      <div className="flex flex-col lg:flex-row lg:gap-8">
        <ProfileSidebar
          activeTab={activeTab}
          onSelect={setTab}
          lang={lang as "tr" | "en"}
          header={sidebarHeader}
          gender={(effectiveProfile?.gender as string | undefined) ?? null}
        />
        <main className="flex-1 min-w-0">{renderTab()}</main>
      </div>
    </div>
  )
}
