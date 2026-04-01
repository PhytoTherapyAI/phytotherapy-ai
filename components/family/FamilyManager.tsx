// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users, Plus, Trash2, Baby, Heart, Loader2,
  ShieldAlert, ChevronDown, ChevronUp, Sparkles, Crown, UserPlus, X,
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
    try {
      const ms = Date.now() - new Date(birthDate).getTime()
      return ms > 0 ? Math.floor(ms / (365.25 * 24 * 60 * 60 * 1000)) : null
    } catch { return null }
  }

  const getMemberType = (member: FamilyMember): "child" | "elderly" | "adult" => {
    const age = getAge(member.birth_date)
    if (member.is_minor || (age !== null && age < 18)) return "child"
    if (age !== null && age >= 65) return "elderly"
    return "adult"
  }

  const getMemberTypeBadge = (type: "child" | "elderly" | "adult") => {
    if (type === "child") return { label: tr ? "Cocuk" : "Child", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" }
    if (type === "elderly") return { label: tr ? "Yaşlı" : "Elderly", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" }
    return { label: tr ? "Yetişkin" : "Adult", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" }
  }

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)

  const maxMembers = isPremium ? 3 : 1

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-teal-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {members.length} / {maxMembers} {tx("family.profiles", lang)}
            </span>
          </div>
          {isPremium && (
            <Badge className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">
              <Crown className="mr-0.5 h-2.5 w-2.5" />
              PREMIUM
            </Badge>
          )}
        </div>
        {!showAddForm && members.length < maxMembers && (
          <Button
            size="sm"
            className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5"
            onClick={() => setShowAddForm(true)}
          >
            <UserPlus className="h-4 w-4" />
            {tx("family.add", lang)}
          </Button>
        )}
      </div>

      {/* Member Cards */}
      {members.map((member, idx) => {
        const age = getAge(member.birth_date)
        const isExpanded = expandedId === member.id
        const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length]
        const memberType = getMemberType(member)
        const typeBadge = getMemberTypeBadge(memberType)

        return (
          <div key={member.id} className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md">
            <button
              onClick={() => setExpandedId(isExpanded ? null : member.id)}
              className="flex w-full items-center gap-4 p-4 sm:p-5 text-left"
            >
              {/* Avatar */}
              <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${colorClass} text-white text-sm font-bold shadow-md flex-shrink-0`}>
                {member.is_minor ? (
                  <Baby className="h-5 w-5" />
                ) : (
                  getInitials(member.full_name)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-semibold text-gray-900 dark:text-white">{member.full_name}</span>
                  <Badge variant="secondary" className={`text-[9px] ${typeBadge.className}`}>
                    {typeBadge.label}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {RELATIONSHIP_LABELS[member.relationship]?.[lang] || member.relationship}
                  {age !== null && ` · ${age} ${tx("family.ageUnit", lang)}`}
                  {member.gender && ` · ${GENDER_LABELS[member.gender]?.[lang] || member.gender}`}
                </p>
              </div>
              <ChevronDown className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </button>

            {isExpanded && (
              <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 px-4 sm:px-5 py-4 space-y-3">
                {/* Health flags */}
                <div className="flex flex-wrap gap-1.5">
                  {member.is_pregnant && (
                    <Badge className="text-xs bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 border-0">
                      <Heart className="mr-1 h-3 w-3" />
                      {tx("family.pregnantFlag", lang)}
                    </Badge>
                  )}
                  {member.is_breastfeeding && (
                    <Badge className="text-xs bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 border-0">
                      {tx("family.breastfeedingFlag", lang)}
                    </Badge>
                  )}
                  {member.kidney_disease && (
                    <Badge className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">
                      {tx("family.kidneyFlag", lang)}
                    </Badge>
                  )}
                  {member.liver_disease && (
                    <Badge className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">
                      {tx("family.liverFlag", lang)}
                    </Badge>
                  )}
                  {member.chronic_conditions?.map((c, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{c}</Badge>
                  ))}
                  {!member.is_pregnant && !member.is_breastfeeding && !member.kidney_disease && !member.liver_disease && (!member.chronic_conditions || member.chronic_conditions.length === 0) && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-green-500" />
                      {tx("family.healthy", lang)}
                    </span>
                  )}
                </div>

                {memberType === "child" && (
                  <div className="flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 px-3 py-2.5">
                    <ShieldAlert className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-700 dark:text-blue-400">
                      {tr
                        ? "Ebeveyn kontrol modu aktif. Herhangi bir takviye vermeden önce mutlaka bir pediatriste danışın."
                        : "Parental control mode active. Always consult a pediatrician before giving any supplement."}
                    </p>
                  </div>
                )}
                {memberType === "elderly" && (
                  <div className="flex items-start gap-2 rounded-lg bg-purple-50 dark:bg-purple-950/30 px-3 py-2.5">
                    <ShieldAlert className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-purple-700 dark:text-purple-400">
                      {tr
                        ? "Bakıcı modu aktif. İlaç ve takviye değişikliklerinde doktora danışın."
                        : "Caregiver mode active. Consult a doctor for any medication or supplement changes."}
                    </p>
                  </div>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30"
                  onClick={() => handleDelete(member.id)}
                  disabled={deleting === member.id}
                >
                  {deleting === member.id ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  {tx("family.removeProfile", lang)}
                </Button>
              </div>
            )}
          </div>
        )
      })}

      {/* Empty State */}
      {members.length === 0 && !showAddForm && (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/30 p-8 sm:p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-50 dark:bg-teal-900/20 mb-5">
            <Users className="h-10 w-10 text-teal-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            {tx("family.emptyTitle", lang)}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
            {tx("family.emptyDesc", lang)}
          </p>
          <Button
            className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
            onClick={() => setShowAddForm(true)}
          >
            <UserPlus className="h-4 w-4" />
            {tx("family.add", lang)}
          </Button>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="rounded-xl bg-white dark:bg-gray-800 border-2 border-teal-200 dark:border-teal-800 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-teal-500" />
              {tx("family.newMember", lang)}
            </h3>
            <button onClick={() => setShowAddForm(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">
              {tx("family.fullNameLabel", lang)} *
            </label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))}
              placeholder={tx("family.namePlaceholder", lang)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 text-gray-900 dark:text-white"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">
                {tx("family.birthDate", lang)}
              </label>
              <input
                type="date"
                value={form.birth_date}
                onChange={(e) => setForm(f => ({ ...f, birth_date: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-sm outline-none focus:border-teal-500 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">
                {tx("family.genderLabel", lang)}
              </label>
              <select
                value={form.gender}
                onChange={(e) => setForm(f => ({ ...f, gender: e.target.value as Gender }))}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-sm outline-none focus:border-teal-500 text-gray-900 dark:text-white"
              >
                <option value="">{tx("family.selectGender", lang)}</option>
                {Object.entries(GENDER_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label[lang]}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">
              {tx("family.relationship", lang)}
            </label>
            <select
              value={form.relationship}
              onChange={(e) => setForm(f => ({ ...f, relationship: e.target.value as FamilyRelationship }))}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-sm outline-none focus:border-teal-500 text-gray-900 dark:text-white"
            >
              {Object.entries(RELATIONSHIP_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label[lang]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">
              {tx("family.chronicLabel", lang)}
            </label>
            <input
              type="text"
              value={form.chronic_conditions}
              onChange={(e) => setForm(f => ({ ...f, chronic_conditions: e.target.value }))}
              placeholder={tx("family.chronicPlaceholder", lang)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-sm outline-none focus:border-teal-500 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-5">
            <label className="flex items-center gap-2 text-sm cursor-pointer text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={form.is_pregnant}
                onChange={(e) => setForm(f => ({ ...f, is_pregnant: e.target.checked }))}
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              {tx("family.pregnantFlag", lang)}
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={form.is_breastfeeding}
                onChange={(e) => setForm(f => ({ ...f, is_breastfeeding: e.target.checked }))}
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              {tx("family.breastfeedingFlag", lang)}
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
              onClick={handleAdd}
              disabled={saving || !form.full_name.trim()}
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              {tx("profile.save", lang)}
            </Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)} className="px-6">
              {tx("profile.cancel", lang)}
            </Button>
          </div>
        </div>
      )}

      {/* Limit Reached */}
      {members.length >= maxMembers && !isPremium && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 text-center">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            {tx("family.limitReached", lang)}
          </p>
        </div>
      )}
    </div>
  )
}
