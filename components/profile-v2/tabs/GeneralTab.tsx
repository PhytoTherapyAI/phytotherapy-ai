// © 2026 DoctoPal — All Rights Reserved
//
// General tab — read-only identity summary + reusable blocks that already
// worked in the old monolith (AvatarPicker, EmergencyContactsSection,
// LinkedAccountsSection). Full inline-edit of name / age / gender lands
// in Commit 2 of the F-PROFILE-001 rollout; for now, a banner links the
// user to the legacy editor.
"use client"

import Link from "next/link"
import { ArrowRight, Mail, Calendar as CalendarIcon } from "lucide-react"
import { AvatarPicker } from "@/components/profile/AvatarPicker"
import { EmergencyContactsSection } from "@/components/profile/EmergencyContactsSection"
import { LinkedAccountsSection } from "@/components/profile/LinkedAccountsSection"

interface GeneralTabProps {
  lang: "tr" | "en"
  userId: string
  isOwnProfile: boolean
  profile: {
    full_name?: string | null
    email?: string | null
    age?: number | null
    gender?: string | null
    birth_date?: string | null
    created_at?: string | null
  } | null
}

export function GeneralTab({ lang, userId, isOwnProfile, profile }: GeneralTabProps) {
  const tr = lang === "tr"
  const displayName = profile?.full_name || (tr ? "İsimsiz" : "Unnamed")
  const joined = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(tr ? "tr-TR" : "en-US", { year: "numeric", month: "long" })
    : null

  return (
    <section className="space-y-6">
      {/* Header — avatar + name + email + joined */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <AvatarPicker
            userId={userId}
            userName={displayName}
            lang={lang}
            onAvatarChange={() => { /* picker persists; parent re-renders via auth context */ }}
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-foreground truncate">{displayName}</h2>
            {profile?.email && (
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground truncate">
                <Mail className="h-3.5 w-3.5" />
                {profile.email}
              </p>
            )}
            {joined && (
              <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarIcon className="h-3 w-3" />
                {tr ? `${joined} tarihinde katıldı` : `Joined ${joined}`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Read-only identity facts + legacy link */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h3 className="text-sm font-semibold mb-4">{tr ? "Kişisel bilgiler" : "Personal info"}</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          <IdentityField
            label={tr ? "Yaş" : "Age"}
            value={profile?.age != null ? String(profile.age) : "—"}
          />
          <IdentityField
            label={tr ? "Cinsiyet" : "Gender"}
            value={profile?.gender ? localizeGender(profile.gender, lang) : "—"}
          />
          <IdentityField
            label={tr ? "Doğum tarihi" : "Birth date"}
            value={profile?.birth_date
              ? new Date(profile.birth_date).toLocaleDateString(tr ? "tr-TR" : "en-US")
              : "—"}
          />
        </dl>
        {isOwnProfile && (
          <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground flex items-center justify-between gap-3">
            <span>
              {tr
                ? "Ad, yaş, doğum tarihi düzenlemesi yakında bu sekmede. Şimdilik mevcut düzenleyiciyi kullan."
                : "Editing name, age, birth date lands here soon. For now, use the current editor."}
            </span>
            <Link
              href="/profile?legacy=true"
              className="inline-flex items-center gap-1 rounded-md bg-foreground text-background px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap hover:opacity-90"
            >
              {tr ? "Aç" : "Open"}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>

      {/* Emergency contacts — own profile only (caller-session semantics
          mean we can only edit contacts we own). */}
      {isOwnProfile && <EmergencyContactsSection lang={lang} userId={userId} />}

      {/* Linked accounts — own profile only for the same reason. */}
      {isOwnProfile && <LinkedAccountsSection lang={lang} userId={userId} />}
    </section>
  )
}

function IdentityField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-foreground">{value}</dd>
    </div>
  )
}

function localizeGender(g: string, lang: "tr" | "en"): string {
  const map: Record<string, { tr: string; en: string }> = {
    male:   { tr: "Erkek",  en: "Male" },
    female: { tr: "Kadın",  en: "Female" },
    other:  { tr: "Diğer",  en: "Other" },
    prefer_not_to_say: { tr: "Belirtmek istemiyorum", en: "Prefer not to say" },
  }
  return map[g]?.[lang] ?? g
}
