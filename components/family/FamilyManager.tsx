"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users, Plus, Trash2, User, Baby, Heart, Loader2,
  ShieldAlert, ChevronDown, ChevronUp, Sparkles, Crown,
} from "lucide-react"
import { tx, type Lang } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import type { FamilyMember, FamilyRelationship, Gender } from "@/lib/database.types"

interface FamilyManagerProps {
  userId: string
  lang: Lang
  isPremium?: boolean
}

const RELATIONSHIP_LABELS: Record<FamilyRelationship, Record<"en" | "tr", string>> = {
  spouse: { en: "Spouse", tr: "Eş" },
  child: { en: "Child", tr: "Çocuk" },
  parent: { en: "Parent", tr: "Ebeveyn" },
  sibling: { en: "Sibling", tr: "Kardeş" },
  other: { en: "Other", tr: "Diğer" },
}

const GENDER_LABELS: Record<string, Record<"en" | "tr", string>> = {
  male: { en: "Male", tr: "Erkek" },
  female: { en: "Female", tr: "Kadın" },
  other: { en: "Other", tr: "Diğer" },
  prefer_not_to_say: { en: "Prefer not to say", tr: "Belirtmek istemiyorum" },
}

const AVATAR_COLORS = [
  "from-emerald-400 to-teal-500",
  "from-blue-400 to-indigo-500",
  "from-purple-400 to-pink-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-red-500",
  "from-cyan-400 to-blue-500",
]

export function FamilyManager({ userId, lang, isPremium = false }: FamilyManagerProps) {
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const tr = lang === "tr"

  // Form state
  const [form, setForm] = useState({
    full_name: "",
    birth_date: "",
    gender: "" as Gender | "",
    relationship: "child" as FamilyRelationship,
    is_pregnant: false,
    is_breastfeeding: false,
    chronic_conditions: "",
  })

  const fetchMembers = useCallback(async () => {
    try {
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const res = await fetch("/api/family", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      if (res.ok) {
        setMembers(data.members || [])
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const handleAdd = async () => {
    if (!form.full_name.trim()) return
    setSaving(true)
    try {
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const res = await fetch("/api/family", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          ...form,
          gender: form.gender || null,
          chronic_conditions: form.chronic_conditions
            ? form.chronic_conditions.split(",").map(s => s.trim()).filter(Boolean)
            : [],
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setForm({
          full_name: "",
          birth_date: "",
          gender: "",
          relationship: "child",
          is_pregnant: false,
          is_breastfeeding: false,
          chronic_conditions: "",
        })
        setShowAddForm(false)
        await fetchMembers()
      } else {
        alert(data.error || tx("family.addError", lang))
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (memberId: string) => {
    if (!confirm(tx("family.confirmRemove", lang))) return
    setDeleting(memberId)
    try {
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const res = await fetch(`/api/family?id=${memberId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      if (res.ok) {
        await fetchMembers()
      }
    } catch {
      // silently fail
    } finally {
      setDeleting(null)
    }
  }

  const getAge = (birthDate: string | null): number | null => {
    if (!birthDate) return null
    return Math.floor((Date.now() - new Date(birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  }

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)

  const maxMembers = isPremium ? 3 : 1

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-primary" />
          {tx("family.title", lang)}
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">
              {members.length}/{maxMembers}
            </Badge>
            {isPremium && (
              <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                <Crown className="mr-0.5 h-2.5 w-2.5" />
                PREMIUM
              </Badge>
            )}
          </div>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {tx("family.subtitle", lang)}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Member cards */}
            {members.map((member, idx) => {
              const age = getAge(member.birth_date)
              const isExpanded = expandedId === member.id
              const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length]

              return (
                <div key={member.id} className="rounded-xl border overflow-hidden transition-all hover:shadow-sm">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : member.id)}
                    className="flex w-full items-center gap-3 p-4 text-left"
                  >
                    {/* Avatar */}
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${colorClass} text-white text-sm font-bold shadow-sm`}>
                      {member.is_minor ? (
                        <Baby className="h-5 w-5" />
                      ) : (
                        getInitials(member.full_name)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{member.full_name}</span>
                        {member.is_minor && (
                          <Badge variant="secondary" className="text-[9px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {tr ? "Reşit değil" : "Minor"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {RELATIONSHIP_LABELS[member.relationship]?.[lang] || member.relationship}
                        {age !== null && ` · ${age} ${tr ? "yaş" : "yrs"}`}
                        {member.gender && ` · ${GENDER_LABELS[member.gender]?.[lang] || member.gender}`}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="border-t bg-muted/20 px-4 py-3 space-y-3">
                      {/* Health flags with badges */}
                      <div className="flex flex-wrap gap-1.5">
                        {member.is_pregnant && (
                          <Badge className="text-[9px] bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 border-0">
                            <Heart className="mr-0.5 h-2.5 w-2.5" />
                            {tr ? "Hamile" : "Pregnant"}
                          </Badge>
                        )}
                        {member.is_breastfeeding && (
                          <Badge className="text-[9px] bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 border-0">
                            {tr ? "Emziriyor" : "Breastfeeding"}
                          </Badge>
                        )}
                        {member.kidney_disease && (
                          <Badge className="text-[9px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">
                            {tr ? "Böbrek" : "Kidney"}
                          </Badge>
                        )}
                        {member.liver_disease && (
                          <Badge className="text-[9px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">
                            {tr ? "Karaciğer" : "Liver"}
                          </Badge>
                        )}
                        {member.chronic_conditions?.map((c, i) => (
                          <Badge key={i} variant="secondary" className="text-[9px]">{c}</Badge>
                        ))}
                        {!member.is_pregnant && !member.is_breastfeeding && !member.kidney_disease && !member.liver_disease && (!member.chronic_conditions || member.chronic_conditions.length === 0) && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-green-500" />
                            {tr ? "Sağlıklı profil" : "Healthy profile"}
                          </span>
                        )}
                      </div>

                      {member.is_minor && (
                        <div className="flex items-start gap-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 px-3 py-2">
                          <ShieldAlert className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                          <p className="text-[11px] text-blue-700 dark:text-blue-400">
                            {tr
                              ? "18 yaş altı — ebeveyn denetim modu aktif. Tüm öneriler pediatrik güvenlik kontrolünden geçer."
                              : "Under 18 — parental oversight mode active. All recommendations pass pediatric safety checks."
                            }
                          </p>
                        </div>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30"
                        onClick={() => handleDelete(member.id)}
                        disabled={deleting === member.id}
                      >
                        {deleting === member.id ? (
                          <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="mr-1.5 h-3 w-3" />
                        )}
                        {tr ? "Profili Sil" : "Remove Profile"}
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Empty state */}
            {members.length === 0 && !showAddForm && (
              <div className="flex flex-col items-center gap-3 py-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-8 w-8 text-primary/60" />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  {tx("family.empty", lang)}
                </p>
              </div>
            )}

            {/* Add form */}
            {showAddForm && (
              <div className="space-y-3 rounded-xl border-2 border-dashed border-primary/30 p-4 bg-primary/5">
                <p className="text-sm font-semibold text-primary">
                  {tr ? "Yeni Aile Üyesi" : "New Family Member"}
                </p>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder={tr ? "Ad Soyad" : "Full Name"}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                  autoFocus
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      {tr ? "Doğum Tarihi" : "Birth Date"}
                    </label>
                    <input
                      type="date"
                      value={form.birth_date}
                      onChange={(e) => setForm(f => ({ ...f, birth_date: e.target.value }))}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      {tr ? "Cinsiyet" : "Gender"}
                    </label>
                    <select
                      value={form.gender}
                      onChange={(e) => setForm(f => ({ ...f, gender: e.target.value as Gender }))}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    >
                      <option value="">{tr ? "Seçiniz" : "Select"}</option>
                      {Object.entries(GENDER_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label[lang]}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    {tr ? "Yakınlık" : "Relationship"}
                  </label>
                  <select
                    value={form.relationship}
                    onChange={(e) => setForm(f => ({ ...f, relationship: e.target.value as FamilyRelationship }))}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    {Object.entries(RELATIONSHIP_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label[lang]}</option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  value={form.chronic_conditions}
                  onChange={(e) => setForm(f => ({ ...f, chronic_conditions: e.target.value }))}
                  placeholder={tr ? "Kronik hastalıklar (virgülle ayır)" : "Chronic conditions (comma-separated)"}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_pregnant}
                      onChange={(e) => setForm(f => ({ ...f, is_pregnant: e.target.checked }))}
                      className="rounded"
                    />
                    {tr ? "Hamile" : "Pregnant"}
                  </label>
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_breastfeeding}
                      onChange={(e) => setForm(f => ({ ...f, is_breastfeeding: e.target.checked }))}
                      className="rounded"
                    />
                    {tr ? "Emziriyor" : "Breastfeeding"}
                  </label>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleAdd} disabled={saving || !form.full_name.trim()}>
                    {saving ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> : <Plus className="mr-1.5 h-3 w-3" />}
                    {tr ? "Kaydet" : "Save"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    {tr ? "İptal" : "Cancel"}
                  </Button>
                </div>
              </div>
            )}

            {/* Add button */}
            {!showAddForm && members.length < maxMembers && (
              <Button
                variant="outline"
                className="w-full gap-1.5 border-dashed"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="h-4 w-4" />
                {tx("family.add", lang)}
              </Button>
            )}

            {/* Limit reached */}
            {members.length >= maxMembers && !isPremium && (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-3 text-center">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  {tx("family.limitReached", lang)}
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
