// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useFamily } from "@/lib/family-context"
import { createBrowserClient } from "@/lib/supabase"
import { Shield } from "lucide-react"
import type { Lang } from "@/lib/translations"

interface Props {
  lang: Lang
}

export function FamilyManagementSettings({ lang }: Props) {
  const { user } = useAuth()
  const { familyGroup, updateAllowsManagement } = useFamily()
  const [allows, setAllows] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const tr = lang === "tr"

  useEffect(() => {
    async function load() {
      if (!user || !familyGroup) return
      const supabase = createBrowserClient()
      const { data, error } = await supabase
        .from("family_members")
        .select("allows_management")
        .eq("user_id", user.id)
        .eq("group_id", familyGroup.id)
        .maybeSingle()
      if (error) {
        console.error("[FamilySettings] load error:", error.message)
        return
      }
      if (data) setAllows(data.allows_management)
      setLoaded(true)
    }
    load()
  }, [user, familyGroup])

  async function toggle() {
    setSaving(true)
    try {
      const next = !allows
      await updateAllowsManagement(next)
      setAllows(next)
    } finally {
      setSaving(false)
    }
  }

  if (!familyGroup || !loaded) return null

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="h-5 w-5 text-emerald-500" />
        <h3 className="font-semibold text-foreground">
          {tr ? "Aile Profil \u0130zni" : "Family Profile Permission"}
        </h3>
      </div>
      <p className="text-muted-foreground text-sm mb-4">
        {tr
          ? "Aile grubundaki y\u00f6neticilerin senin profilini d\u00fczenlemesine izin vermek istiyor musun? Bu ayar\u0131 sadece sen de\u011fi\u015ftirebilirsin."
          : "Do you want to allow admins in your family group to edit your profile? Only you can change this setting."}
      </p>

      <div className="flex items-center justify-between bg-muted/50 rounded-xl p-4">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground text-sm">
            {tr ? "Profilimin y\u00f6netilmesine izin ver" : "Allow profile management"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {allows
              ? (tr ? "Y\u00f6neticiler profilini d\u00fczenleyebilir" : "Admins can edit your profile")
              : (tr ? "Sadece sen d\u00fczenleyebilirsin" : "Only you can edit")}
          </p>
        </div>
        <button
          onClick={toggle}
          disabled={saving}
          role="switch"
          aria-checked={allows}
          className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
            allows
              ? "bg-emerald-500"
              : "bg-muted-foreground/30"
          } disabled:opacity-50`}
          aria-label={tr ? "Y\u00f6netim izni" : "Management permission"}
        >
          <div
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${
              allows ? "left-[26px]" : "left-0.5"
            }`}
          />
        </button>
      </div>

      {allows && (
        <div className="mt-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
          <p className="text-amber-700 dark:text-amber-300 text-xs">
            {tr
              ? "Y\u00f6neticiler ila\u00e7, alerji ve sa\u011fl\u0131k bilgilerini d\u00fczenleyebilir. Bu izni istedi\u011fin zaman kapatabilirsin."
              : "Admins can edit medications, allergies and health info. You can revoke this permission at any time."}
          </p>
        </div>
      )}
    </div>
  )
}
