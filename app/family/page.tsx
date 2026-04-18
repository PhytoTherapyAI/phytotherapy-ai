// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useFamily } from "@/lib/family-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { getAvatarDataUri, type AvatarStyle } from "@/lib/avatar"
import { createBrowserClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users, UserPlus, Crown, Shield, Trash2, Pencil, Check, X, Loader2, Home,
  Heart, Bell, Siren, Info, ChevronDown, Settings2, Mail, Clock, AlertCircle,
  Pill, ShieldAlert, Activity, ChevronRight, CheckCircle2, Droplet, Send,
} from "lucide-react"
import { PageSkeleton } from "@/components/ui/page-skeleton"
import type { FamilyMember, FamilyRelationship } from "@/types/family"

// Order matters: used as the select dropdown order.
const RELATIONSHIP_OPTIONS: ReadonlyArray<{ value: FamilyRelationship; emoji: string }> = [
  { value: "self",        emoji: "⭐" },
  { value: "spouse",      emoji: "💍" },
  { value: "parent",      emoji: "👨‍👩" },
  { value: "child",       emoji: "🧒" },
  { value: "sibling",     emoji: "🧑‍🤝‍🧑" },
  { value: "grandparent", emoji: "👴" },
  { value: "grandchild",  emoji: "👶" },
  { value: "other",       emoji: "👤" },
]

// 5 preset hane ikonu — basit, karmaşık olmasın
const HOUSEHOLD_ICONS = ["🏠", "❤️", "🌳", "🏡", "🌟"] as const

// Relative time — "2 saat önce", "3 gün önce", "1 ay önce"
function relativeTime(iso: string | null | undefined, lang: "tr" | "en"): string {
  if (!iso) return ""
  const now = Date.now()
  const t = new Date(iso).getTime()
  const diff = now - t
  if (Number.isNaN(diff) || diff < 0) return ""
  const min = Math.floor(diff / 60_000)
  const hr = Math.floor(diff / 3_600_000)
  const day = Math.floor(diff / 86_400_000)
  const tr = lang === "tr"
  if (min < 1) return tr ? "az önce" : "just now"
  if (min < 60) return tr ? `${min} dk önce` : `${min}m ago`
  if (hr < 24) return tr ? `${hr} saat önce` : `${hr}h ago`
  if (day < 30) return tr ? `${day} gün önce` : `${day}d ago`
  const mo = Math.floor(day / 30)
  if (mo < 12) return tr ? `${mo} ay önce` : `${mo}mo ago`
  const yr = Math.floor(day / 365)
  return tr ? `${yr} yıl önce` : `${yr}y ago`
}

// Days remaining helper for invite expiry
function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null
  const ms = new Date(iso).getTime() - Date.now()
  if (Number.isNaN(ms)) return null
  return Math.ceil(ms / 86_400_000)
}

function getStoredIcon(groupId: string): string {
  if (typeof window === "undefined") return HOUSEHOLD_ICONS[0]
  try {
    return localStorage.getItem(`family_group_icon_${groupId}`) || HOUSEHOLD_ICONS[0]
  } catch {
    return HOUSEHOLD_ICONS[0]
  }
}

function setStoredIcon(groupId: string, icon: string) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(`family_group_icon_${groupId}`, icon)
  } catch {
    /* noop */
  }
}

export default function FamilyPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, profile } = useAuth()
  const {
    familyGroup,
    familyMembers,
    pendingInvites,
    isOwner,
    isAdmin,
    createGroup,
    updateGroupName,
    updateNickname,
    promoteToAdmin,
    removeMember,
    cancelInvite,
    updateSharingPrefs,
    updateRelationship,
    setActiveProfile,
    loading: familyLoading,
    refetch,
  } = useFamily()
  const { lang } = useLang()
  const tr = lang === "tr"

  const [groupName, setGroupName] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteNickname, setInviteNickname] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newNickname, setNewNickname] = useState("")
  const [creating, setCreating] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null)

  // Invite tab + code-invite state
  const [inviteTab, setInviteTab] = useState<"email" | "code">("email")
  const [generatingCode, setGeneratingCode] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [generatedCodeExpiry, setGeneratedCodeExpiry] = useState<string | null>(null)
  const [codeCopied, setCodeCopied] = useState(false)

  // Hane ismi ve ikon düzenleme
  const [editingGroupName, setEditingGroupName] = useState(false)
  const [draftGroupName, setDraftGroupName] = useState("")
  const [savingGroupName, setSavingGroupName] = useState(false)
  const [iconPickerOpen, setIconPickerOpen] = useState(false)
  const [householdIcon, setHouseholdIcon] = useState<string>(HOUSEHOLD_ICONS[0])

  // Roles info accordion
  const [rolesOpen, setRolesOpen] = useState(false)

  // Reminder send modal
  const [reminderTarget, setReminderTarget] = useState<FamilyMember | null>(null)
  const [sendingReminder, setSendingReminder] = useState(false)

  // Sharing prefs modal
  const [sharingModalOpen, setSharingModalOpen] = useState(false)
  const [sharingDraft, setSharingDraft] = useState({
    shares_health_score: false,
    shares_medications: false,
    shares_allergies: false,
    shares_emergency: true,
  })
  const [savingSharing, setSavingSharing] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [authLoading, isAuthenticated, router])

  // Hane ikonunu localStorage'dan yükle
  useEffect(() => {
    if (familyGroup?.id) {
      setHouseholdIcon(getStoredIcon(familyGroup.id))
    }
  }, [familyGroup?.id])

  // Self üyenin mevcut sharing prefs'ini modal'a yükle
  useEffect(() => {
    if (!user) return
    const self = familyMembers.find(m => m.user_id === user.id)
    if (self) {
      setSharingDraft({
        shares_health_score: self.shares_health_score ?? false,
        shares_medications: self.shares_medications ?? false,
        shares_allergies: self.shares_allergies ?? false,
        shares_emergency: self.shares_emergency ?? true,
      })
    }
  }, [familyMembers, user])

  // Auto-dismiss feedback (longer if link is shown)
  useEffect(() => {
    if (feedback) {
      const delay = inviteLink ? 30000 : 4000
      const t = setTimeout(() => { setFeedback(null); setInviteLink(null) }, delay)
      return () => clearTimeout(t)
    }
  }, [feedback, inviteLink])

  // ── Üyeleri kurucu en üstte olacak şekilde sırala + kurucu listede yoksa sentezle ──
  const sortedMembers: FamilyMember[] = useMemo(() => {
    if (!user) return familyMembers
    const selfIndex = familyMembers.findIndex(m => m.user_id === user.id)
    if (selfIndex >= 0) {
      // Kurucu/self listede var — en üste taşı
      const self = familyMembers[selfIndex]
      const others = familyMembers.filter((_, i) => i !== selfIndex)
      // Owner'ı başa, sonra adminler, sonra members (rol önceliği)
      const rolePriority = (r: string) => (r === "owner" ? 0 : r === "admin" ? 1 : 2)
      others.sort((a, b) => rolePriority(a.role) - rolePriority(b.role))
      return [self, ...others]
    }
    // Defansif: kurucu listede yoksa (RLS race vb.) auth profilinden sentezle
    if (familyGroup) {
      const synthSelf: FamilyMember = {
        id: `synth-${user.id}`,
        group_id: familyGroup.id,
        user_id: user.id,
        role: familyGroup.owner_id === user.id ? "owner" : "member",
        nickname: null,
        allows_management: false,
        invite_token: "",
        invite_email: user.email || "",
        invite_status: "accepted",
        invited_at: new Date().toISOString(),
        accepted_at: new Date().toISOString(),
        profile: profile ? {
          id: user.id,
          display_name: profile.full_name || user.email?.split("@")[0] || "",
          avatar_style: (profile as { avatar_style?: string }).avatar_style || "adventurer",
          avatar_seed: (profile as { avatar_seed?: string }).avatar_seed || user.id,
        } : undefined,
      }
      return [synthSelf, ...familyMembers]
    }
    return familyMembers
  }, [familyMembers, user, familyGroup, profile])

  const otherMembersCount = useMemo(
    () => sortedMembers.filter(m => m.user_id !== user?.id).length,
    [sortedMembers, user?.id],
  )

  async function handleCreateGroup() {
    if (!groupName.trim()) return
    setCreating(true)
    try {
      const ok = await createGroup(groupName)
      if (ok) {
        setFeedback({ type: "success", msg: tr ? "Hane oluşturuldu!" : "Household created!" })
        setGroupName("")
      } else {
        setFeedback({ type: "error", msg: tr ? "Hane oluşturulamadı. Konsolu kontrol edin (F12)." : "Failed to create household. Check console (F12)." })
      }
    } catch (err) {
      console.error("[Family] createGroup failed:", err)
      setFeedback({ type: "error", msg: tr ? "Hane oluşturulamadı, tekrar deneyin." : "Failed to create household, try again." })
    } finally {
      setCreating(false)
    }
  }

  async function handleSaveGroupName() {
    const next = draftGroupName.trim()
    if (!next || next === familyGroup?.name) {
      setEditingGroupName(false)
      return
    }
    setSavingGroupName(true)
    const ok = await updateGroupName(next)
    setSavingGroupName(false)
    if (ok) {
      setEditingGroupName(false)
      setFeedback({ type: "success", msg: tr ? "Hane adı güncellendi" : "Household name updated" })
    } else {
      setFeedback({ type: "error", msg: tr ? "Güncellenemedi" : "Update failed" })
    }
  }

  function handlePickIcon(icon: string) {
    if (!familyGroup) return
    setHouseholdIcon(icon)
    setStoredIcon(familyGroup.id, icon)
    setIconPickerOpen(false)
  }

  async function handleInvite() {
    if (!inviteEmail.trim() || !familyGroup) return
    setInviting(true)
    try {
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setFeedback({ type: "error", msg: tr ? "Oturum bulunamadı, tekrar giriş yapın." : "Session not found, please log in again." })
        setInviting(false)
        return
      }

      const res = await fetch("/api/family/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          groupId: familyGroup.id,
          email: inviteEmail,
          nickname: inviteNickname,
          inviterName: profile?.full_name || user?.email,
          lang,
        }),
      })

      const resData = await res.json().catch(() => ({}))

      if (!res.ok) {
        setFeedback({
          type: "error",
          msg: tr
            ? `Davet gönderilemedi: ${resData.error || "Bilinmeyen hata"}`
            : `Failed to send invite: ${resData.error || "Unknown error"}`
        })
        setInviting(false)
        return
      }

      const sentTo = inviteNickname.trim() || inviteEmail
      setInviteEmail("")
      setInviteNickname("")

      if (resData.inviteUrl) {
        setInviteLink(resData.inviteUrl)
        setFeedback({
          type: "success",
          msg: resData.emailSent
            ? (tr ? `Davet gönderildi! ${sentTo} e-postasını kontrol etsin.` : `Invite sent! Ask ${sentTo} to check their email.`)
            : (tr ? "Davet oluşturuldu! Linki paylaşın:" : "Invite created! Share the link:")
        })
      } else {
        setFeedback({ type: "success", msg: tr ? `Davet gönderildi! ${sentTo} e-postasını kontrol etsin.` : `Invite sent! Ask ${sentTo} to check their email.` })
      }
      await refetch()
    } catch (err) {
      console.error("[Family] handleInvite failed:", err)
      setFeedback({ type: "error", msg: tr ? "Davet gönderilemedi." : "Failed to send invite." })
    } finally {
      setInviting(false)
    }
  }

  async function handleGenerateCode() {
    if (!familyGroup) {
      setFeedback({ type: "error", msg: tr ? "Aile grubu bulunamadı." : "No family group." })
      return
    }
    setGeneratingCode(true)
    setFeedback(null)
    try {
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setFeedback({ type: "error", msg: tr ? "Oturum bulunamadı, tekrar giriş yapın." : "Session not found, please log in again." })
        setGeneratingCode(false)
        return
      }

      const res = await fetch("/api/family/invite-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          groupId: familyGroup.id,
          nickname: inviteNickname.trim() || null,
        }),
      })

      const resData = await res.json().catch(() => ({}))

      if (!res.ok) {
        if (res.status === 402) {
          setFeedback({ type: "error", msg: tr ? "Kod oluşturmak için Premium üyelik gerekli." : "Premium required to generate codes." })
        } else {
          setFeedback({
            type: "error",
            msg: tr
              ? `Kod oluşturulamadı: ${resData.error || "Bilinmeyen hata"}`
              : `Could not generate code: ${resData.error || "Unknown error"}`,
          })
        }
        setGeneratingCode(false)
        return
      }

      setGeneratedCode(resData.code)
      setGeneratedCodeExpiry(resData.expiresAt)
      setInviteNickname("")
      await refetch()
    } catch (err) {
      console.error("[Family] handleGenerateCode failed:", err)
      setFeedback({ type: "error", msg: tr ? "Kod oluşturulamadı." : "Could not generate code." })
    } finally {
      setGeneratingCode(false)
    }
  }

  async function handleCopyCode() {
    if (!generatedCode) return
    try {
      await navigator.clipboard.writeText(generatedCode)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    } catch {
      setFeedback({ type: "error", msg: tr ? "Kopyalanamadı." : "Copy failed." })
    }
  }

  async function handleSaveNickname(memberId: string) {
    await updateNickname(memberId, newNickname)
    setEditingId(null)
  }

  async function handleViewMemberProfile(memberUserId: string | null) {
    if (!memberUserId) return
    await setActiveProfile(memberUserId)
    router.push("/profile")
  }

  async function handleSaveSharing() {
    setSavingSharing(true)
    const ok = await updateSharingPrefs(sharingDraft)
    setSavingSharing(false)
    if (ok) {
      setSharingModalOpen(false)
      setFeedback({ type: "success", msg: tr ? "Paylaşım ayarları kaydedildi" : "Sharing preferences saved" })
    } else {
      setFeedback({ type: "error", msg: tr ? "Kaydedilemedi" : "Failed to save" })
    }
  }

  async function handleCancelInvite(invite: FamilyMember) {
    const target = invite.nickname || invite.invite_email
    if (!confirm(tr ? `${target} davetini iptal et?` : `Cancel invite for ${target}?`)) return
    const ok = await cancelInvite(invite.id)
    if (ok) {
      setFeedback({ type: "success", msg: tr ? "Davet iptal edildi" : "Invite cancelled" })
    } else {
      setFeedback({ type: "error", msg: tr ? "İptal edilemedi" : "Failed to cancel" })
    }
  }

  async function handleSendReminder(type: "reminder_meds" | "reminder_checkin" | "reminder_water" | "custom", customMessage?: string) {
    if (!reminderTarget?.user_id || !familyGroup) return
    setSendingReminder(true)
    try {
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setFeedback({ type: "error", msg: tr ? "Oturum bulunamadı" : "Session not found" })
        return
      }

      const messageMap: Record<string, { tr: string; en: string }> = {
        reminder_meds: { tr: "İlacını aldın mı?", en: "Did you take your meds?" },
        reminder_checkin: { tr: "Bugün nasılsın? Kontrol ediver.", en: "How are you today? Check in please." },
        reminder_water: { tr: "Su içmeyi unutma!", en: "Don't forget to drink water!" },
        custom: { tr: customMessage || "", en: customMessage || "" },
      }
      const msg = type === "custom" ? (customMessage || "") : (tr ? messageMap[type].tr : messageMap[type].en)
      if (!msg.trim()) {
        setFeedback({ type: "error", msg: tr ? "Mesaj boş olamaz" : "Message cannot be empty" })
        return
      }

      const res = await fetch("/api/family/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          groupId: familyGroup.id,
          toUserId: reminderTarget.user_id,
          type,
          message: msg,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setFeedback({ type: "error", msg: tr ? `Gönderilemedi: ${data.error || ""}` : `Failed: ${data.error || ""}` })
        return
      }
      const targetName = reminderTarget.nickname || reminderTarget.profile?.display_name || reminderTarget.invite_email
      setFeedback({ type: "success", msg: tr ? `Hatırlatma ${targetName}'a gönderildi` : `Reminder sent to ${targetName}` })
      setReminderTarget(null)
    } catch {
      setFeedback({ type: "error", msg: tr ? "Hatırlatma gönderilemedi" : "Failed to send reminder" })
    } finally {
      setSendingReminder(false)
    }
  }

  async function handleCopyInviteLink(invite: FamilyMember) {
    const url = `${window.location.origin}/family/accept?token=${invite.invite_token}`
    try {
      await navigator.clipboard.writeText(url)
      setFeedback({ type: "success", msg: tr ? "Davet linki kopyalandı" : "Invite link copied" })
    } catch {
      setFeedback({ type: "error", msg: tr ? "Kopyalanamadı" : "Failed to copy" })
    }
  }

  if (authLoading || familyLoading) return <PageSkeleton />
  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-background to-background dark:from-emerald-950/20 dark:via-background dark:to-background">
      <div className="mx-auto max-w-2xl px-4 md:px-8 py-8 sm:py-12 min-h-[80vh]">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 mb-4 shadow-sm">
            <Users className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {tr ? "Hane & Aile" : "Household & Family"}
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto text-sm">
            {tr
              ? "Aile üyelerinin sağlık profillerini birlikte yönetin."
              : "Manage your family members' health profiles together."}
          </p>
        </div>

        {/* Feedback toast */}
        {feedback && (
          <div className={`mb-4 rounded-xl border px-4 py-3 text-center text-sm font-medium ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50/80 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}>
            {feedback.msg}
          </div>
        )}

        {/* Invite link — kopyalanabilir */}
        {inviteLink && (
          <div className="mb-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/20 p-4">
            <p className="text-xs text-muted-foreground mb-2">
              {tr ? "Davet linki:" : "Invite link:"}
            </p>
            <div className="flex gap-2 items-center">
              <input
                readOnly
                value={inviteLink}
                className="flex-1 text-xs bg-background border border-border rounded-lg px-3 py-2 text-foreground font-mono"
                onClick={e => (e.target as HTMLInputElement).select()}
              />
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs shrink-0"
                onClick={() => {
                  navigator.clipboard.writeText(inviteLink)
                  setFeedback({ type: "success", msg: tr ? "Link kopyalandı!" : "Link copied!" })
                }}
              >
                {tr ? "Kopyala" : "Copy"}
              </Button>
            </div>
          </div>
        )}

        {/* Grup yoksa oluştur */}
        {!familyGroup ? (
          <div className="bg-card rounded-2xl shadow-sm border p-6">
            <div className="text-center mb-6">
              <Home className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
              <h2 className="font-semibold text-lg text-foreground">
                {tr ? "Haneni Kur" : "Create Your Household"}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {tr
                  ? "Aile üyelerinin sağlık profillerini birlikte yönetmek için bir hane oluştur."
                  : "Create a household to manage your family's health profiles together."}
              </p>
            </div>
            <input
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder={tr ? "Hane adı (örn: Ailem)" : "Household name (e.g. My Family)"}
              className="w-full border border-border rounded-xl px-4 py-3 mb-3 bg-background text-foreground focus:ring-2 focus:ring-emerald-400 outline-none"
              onKeyDown={e => e.key === "Enter" && handleCreateGroup()}
            />
            <Button
              onClick={handleCreateGroup}
              disabled={creating || !groupName.trim()}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold"
            >
              {creating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {creating
                ? (tr ? "Oluşturuluyor..." : "Creating...")
                : (tr ? "Hane Oluştur" : "Create Household")}
            </Button>

            {/* Or — join with code */}
            <div className="relative my-5 flex items-center">
              <div className="flex-1 border-t border-border" />
              <span className="px-3 text-[11px] uppercase tracking-wider text-muted-foreground">
                {tr ? "veya" : "or"}
              </span>
              <div className="flex-1 border-t border-border" />
            </div>
            <Link
              href="/family/join"
              className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl font-semibold transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              {tx("family.joinWithCode", lang)}
            </Link>
            <p className="text-[11px] text-muted-foreground text-center mt-2">
              {tx("family.joinCtaDesc", lang)}
            </p>
          </div>
        ) : (
          <>
            {/* ─── Hane başlığı (gradient + ikon picker + isim düzenleme) ─── */}
            <div className="relative bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 mb-6 shadow-sm">
              <div className="flex items-center gap-4">
                {/* Hane ikonu — tıklanabilir picker */}
                <button
                  type="button"
                  onClick={() => isOwner && setIconPickerOpen(o => !o)}
                  disabled={!isOwner}
                  className={`flex items-center justify-center w-14 h-14 rounded-xl bg-white dark:bg-emerald-900/40 text-3xl shadow-sm transition-all ${
                    isOwner ? "hover:scale-105 cursor-pointer" : "cursor-default"
                  }`}
                  aria-label={tr ? "Hane ikonunu değiştir" : "Change household icon"}
                  title={isOwner ? (tr ? "İkonu değiştir" : "Change icon") : undefined}
                >
                  {householdIcon}
                </button>

                <div className="flex-1 min-w-0">
                  {editingGroupName ? (
                    <div className="flex gap-2 items-center">
                      <input
                        value={draftGroupName}
                        onChange={e => setDraftGroupName(e.target.value)}
                        autoFocus
                        maxLength={50}
                        className="flex-1 border border-emerald-300 rounded-lg px-2 py-1 text-base font-bold bg-background text-foreground focus:ring-2 focus:ring-emerald-400 outline-none"
                        onKeyDown={e => {
                          if (e.key === "Enter") handleSaveGroupName()
                          if (e.key === "Escape") setEditingGroupName(false)
                        }}
                      />
                      <button
                        onClick={handleSaveGroupName}
                        disabled={savingGroupName}
                        className="text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
                        aria-label={tr ? "Kaydet" : "Save"}
                      >
                        {savingGroupName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-5 w-5" />}
                      </button>
                      <button
                        onClick={() => setEditingGroupName(false)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={tr ? "İptal" : "Cancel"}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-lg text-emerald-800 dark:text-emerald-200 truncate">
                        {familyGroup.name}
                      </h2>
                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => {
                            setDraftGroupName(familyGroup.name)
                            setEditingGroupName(true)
                          }}
                          className="text-emerald-600/70 hover:text-emerald-700 dark:text-emerald-400/70 dark:hover:text-emerald-300 transition-colors"
                          aria-label={tr ? "Hane adını düzenle" : "Edit household name"}
                          title={tr ? "Hane adını düzenle" : "Edit household name"}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                  <p className="text-emerald-700/80 dark:text-emerald-400/90 text-sm mt-0.5">
                    {sortedMembers.length} {tr
                      ? (sortedMembers.length === 1 ? "üye" : "üye")
                      : (sortedMembers.length === 1 ? "member" : "members")}
                    {otherMembersCount === 0 && (
                      <span className="text-muted-foreground ml-1">
                        · {tr ? "sadece sen" : "just you"}
                      </span>
                    )}
                  </p>
                </div>

                {isOwner && (
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 text-[10px] shrink-0">
                    <Crown className="h-3 w-3 mr-0.5" />
                    {tr ? "Kurucu" : "Owner"}
                  </Badge>
                )}
              </div>

              {/* Icon picker pop-up */}
              {iconPickerOpen && isOwner && (
                <div className="mt-4 pt-4 border-t border-emerald-200/60 dark:border-emerald-800/60">
                  <p className="text-xs text-muted-foreground mb-2">
                    {tr ? "Bir ikon seç:" : "Pick an icon:"}
                  </p>
                  <div className="flex gap-2">
                    {HOUSEHOLD_ICONS.map(ic => (
                      <button
                        key={ic}
                        type="button"
                        onClick={() => handlePickIcon(ic)}
                        className={`w-11 h-11 rounded-xl text-2xl flex items-center justify-center transition-all ${
                          householdIcon === ic
                            ? "bg-emerald-500 text-white shadow-md scale-105"
                            : "bg-white dark:bg-emerald-900/30 hover:scale-105 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                        }`}
                      >
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ─── STAGE 4: Dashboard summary ─── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="rounded-xl border bg-card p-3 text-center">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 mx-auto mb-1.5">
                  <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-lg font-bold text-foreground leading-none">{sortedMembers.length}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{tr ? "Üye" : "Members"}</p>
              </div>
              <div className="rounded-xl border bg-card p-3 text-center">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 mx-auto mb-1.5">
                  <Mail className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-lg font-bold text-foreground leading-none">{pendingInvites.length}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{tr ? "Bekleyen" : "Pending"}</p>
              </div>
              <div className="rounded-xl border bg-card p-3 text-center">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-rose-100 dark:bg-rose-900/30 mx-auto mb-1.5">
                  <Activity className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                </div>
                <p className="text-lg font-bold text-foreground leading-none">—</p>
                <p className="text-[10px] text-muted-foreground mt-1">{tr ? "Ort. Skor" : "Avg Score"}</p>
              </div>
              <div className="rounded-xl border bg-card p-3 text-center">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 mx-auto mb-1.5">
                  <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-lg font-bold text-foreground leading-none">—</p>
                <p className="text-[10px] text-muted-foreground mt-1">{tr ? "Hatırlatma" : "Reminders"}</p>
              </div>
            </div>
            {/* Sharing-aware fallback hint */}
            <p className="text-[11px] text-muted-foreground text-center mb-6 -mt-3 px-4">
              {tr
                ? "Veri paylaşımı açıldığında ortalama skor ve aktif hatırlatmalar burada görünecek."
                : "Average score and active reminders appear here once members enable data sharing."}
            </p>

            {/* ─── STAGE 1: Üye kartları (grid) ─── */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-semibold text-foreground text-sm">
                  {tr ? "Üyeler" : "Members"}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {sortedMembers.length} {tr ? "kişi" : sortedMembers.length === 1 ? "person" : "people"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                {sortedMembers.map(member => {
                  const isSelf = member.user_id === user.id
                  const avatarSeed = member.profile?.avatar_seed || member.user_id || member.invite_email
                  const avatarStyle = (member.profile?.avatar_style as AvatarStyle) || "adventurer"
                  // Name fallback chain: full_name → nickname → display_name → email@prefix → "Üye"
                  const emailPrefix = member.invite_email?.split("@")[0] ?? null
                  const baseName = isSelf
                    ? (profile?.full_name ?? user.email?.split("@")[0] ?? (tr ? "Ben" : "You"))
                    : (
                        member.profile?.full_name
                        ?? member.nickname
                        ?? member.profile?.display_name
                        ?? emailPrefix
                        ?? (tr ? "Üye" : "Member")
                      )
                  // If nickname exists AND differs from baseName, append as suffix
                  const displayName = member.nickname && member.nickname !== baseName
                    ? `${baseName} — ${member.nickname}`
                    : baseName
                  const isSynth = member.id?.startsWith("synth-")

                  return (
                    <div
                      key={member.id}
                      className={`group relative rounded-2xl border bg-card p-4 transition-all hover:shadow-md flex flex-col min-h-[240px] ${
                        isSelf ? "ring-1 ring-emerald-200 dark:ring-emerald-800 bg-gradient-to-br from-emerald-50/40 to-transparent dark:from-emerald-950/10" : ""
                      } ${member.user_id ? "cursor-pointer" : ""}`}
                      onClick={() => member.user_id && !editingId && handleViewMemberProfile(member.user_id)}
                      role={member.user_id ? "button" : undefined}
                      tabIndex={member.user_id ? 0 : undefined}
                      onKeyDown={e => {
                        if (member.user_id && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault()
                          handleViewMemberProfile(member.user_id)
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getAvatarDataUri(avatarSeed, avatarStyle)}
                          alt={displayName}
                          className="w-14 h-14 rounded-full bg-muted flex-shrink-0 ring-2 ring-background"
                        />
                        <div className="flex-1 min-w-0">
                          {editingId === member.id ? (
                            <div className="flex gap-1 items-center" onClick={e => e.stopPropagation()}>
                              <input
                                value={newNickname}
                                onChange={e => setNewNickname(e.target.value)}
                                placeholder={tr ? "Takma ad" : "Nickname"}
                                className="border border-border rounded-lg px-2 py-1 text-sm flex-1 min-w-0 bg-background text-foreground"
                                autoFocus
                                onKeyDown={e => e.key === "Enter" && handleSaveNickname(member.id)}
                              />
                              <button onClick={() => handleSaveNickname(member.id)} className="text-emerald-500 hover:text-emerald-600">
                                <Check className="h-4 w-4" />
                              </button>
                              <button onClick={() => setEditingId(null)} className="text-destructive hover:text-destructive/80">
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <p className="font-semibold text-sm text-foreground truncate" title={displayName}>
                              {displayName}
                            </p>
                          )}
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <Badge
                              variant="secondary"
                              className={`text-[9px] border-0 px-1.5 py-0 ${
                                member.role === "owner"
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                  : member.role === "admin"
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                    : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {member.role === "owner" && <Crown className="h-2.5 w-2.5 mr-0.5" />}
                              {member.role === "admin" && <Shield className="h-2.5 w-2.5 mr-0.5" />}
                              {member.role === "owner"
                                ? (tr ? "Kurucu" : "Owner")
                                : member.role === "admin"
                                  ? (tr ? "Yönetici" : "Admin")
                                  : (tr ? "Üye" : "Member")}
                            </Badge>
                            {isSelf && (
                              <Badge variant="secondary" className="text-[9px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0 px-1.5 py-0">
                                {tr ? "Sen" : "You"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Relationship picker */}
                      {!isSynth && member.user_id && (
                        <div className="mt-3 space-y-1">
                          <span className="text-muted-foreground text-[10px] block">
                            {tx("family.relationshipLabel", lang)}
                          </span>
                          {(isSelf || isOwner || isAdmin) ? (
                            <select
                              value={(member.relationship as string | null | undefined) || ""}
                              onClick={e => e.stopPropagation()}
                              onChange={e => {
                                const next = (e.target.value || null) as FamilyRelationship | null
                                if (next) void updateRelationship(member.id, next)
                              }}
                              className="w-full rounded-md border border-border bg-background px-2 py-1 text-[11px] focus:ring-1 focus:ring-emerald-400 outline-none"
                            >
                              <option value="">{tr ? "Seç…" : "Select…"}</option>
                              {RELATIONSHIP_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.emoji} {tx(`family.rel.${opt.value}`, lang)}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-muted-foreground font-medium text-xs block">
                              {member.relationship
                                ? `${RELATIONSHIP_OPTIONS.find(o => o.value === member.relationship)?.emoji || ""} ${tx(`family.rel.${member.relationship}`, lang)}`
                                : "—"}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Sağlık skoru / fallback — push to bottom with mt-auto */}
                      <div className="mt-auto pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Activity className="h-3 w-3" />
                          <span>
                            {member.shares_health_score
                              ? "—"
                              : (tr ? "Henüz veri yok" : "No data yet")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground/70 text-[10px]">
                          <Clock className="h-2.5 w-2.5" />
                          <span>{tr ? "Katıldı: " : "Joined: "}{relativeTime(member.accepted_at || member.invited_at, lang as "tr" | "en") || "—"}</span>
                        </div>
                      </div>

                      {/* Aksiyonlar — kart altı */}
                      <div className="mt-3 flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        {isSelf && !isSynth && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[10px] flex-1"
                            onClick={() => setSharingModalOpen(true)}
                          >
                            <Settings2 className="h-3 w-3 mr-1" />
                            {tr ? "Paylaşım" : "Sharing"}
                          </Button>
                        )}
                        {!isSelf && !isSynth && member.user_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[10px] flex-1"
                            onClick={() => setReminderTarget(member)}
                            title={tr ? "Hatırlatma gönder" : "Send reminder"}
                          >
                            <Bell className="h-3 w-3 mr-1" />
                            {tr ? "Hatırlat" : "Remind"}
                          </Button>
                        )}
                        {(isOwner || isAdmin) && !isSelf && !isSynth && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[10px]"
                            onClick={() => {
                              setEditingId(member.id)
                              setNewNickname(member.nickname ?? "")
                            }}
                            title={tr ? "Takma ad düzenle" : "Edit nickname"}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        )}
                        {isOwner && !isSelf && !isSynth && member.role === "member" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[10px] text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                            onClick={() => promoteToAdmin(member.id)}
                            title={tr ? "Yönetici Yap" : "Promote"}
                          >
                            <Shield className="h-3 w-3" />
                          </Button>
                        )}
                        {isOwner && !isSelf && !isSynth && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[10px] text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              const name = member.nickname || baseName
                              if (confirm(tr
                                ? `${name} haneden çıkarılsın mı?`
                                : `Remove ${name} from household?`
                              )) {
                                removeMember(member.id)
                              }
                            }}
                            title={tr ? "Üyeyi çıkar" : "Remove member"}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                        {member.user_id && !editingId && (
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 ml-auto" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ─── STAGE 2: Bekleyen davetler ─── */}
            {pendingInvites.length > 0 && (isOwner || isAdmin) && (
              <div className="mb-6 rounded-2xl border bg-card overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-amber-500" />
                    <h3 className="font-semibold text-sm text-foreground">
                      {tr ? "Bekleyen Davetler" : "Pending Invitations"}
                    </h3>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {pendingInvites.length}
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {pendingInvites.map(invite => {
                    const remaining = daysUntil(invite.expires_at)
                    const expired = remaining !== null && remaining <= 0
                    return (
                      <div key={invite.id} className="p-3 sm:p-4 flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                          expired ? "bg-destructive/10" : "bg-amber-100 dark:bg-amber-900/30"
                        }`}>
                          <Mail className={`h-4 w-4 ${expired ? "text-destructive" : "text-amber-600 dark:text-amber-400"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {invite.nickname || invite.invite_email}
                          </p>
                          {invite.nickname && (
                            <p className="text-[11px] text-muted-foreground truncate">{invite.invite_email}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" />
                              {tr ? "Gönderildi: " : "Sent: "}{relativeTime(invite.invited_at, lang as "tr" | "en")}
                            </span>
                            {expired ? (
                              <Badge variant="secondary" className="text-[9px] bg-destructive/10 text-destructive border-0 px-1.5 py-0">
                                <AlertCircle className="h-2.5 w-2.5 mr-0.5" />
                                {tr ? "Süresi doldu" : "Expired"}
                              </Badge>
                            ) : remaining !== null ? (
                              <Badge variant="secondary" className="text-[9px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 px-1.5 py-0">
                                {tr ? `${remaining} gün kaldı` : `${remaining}d left`}
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[10px]"
                            onClick={() => handleCopyInviteLink(invite)}
                            title={tr ? "Davet linkini kopyala" : "Copy invite link"}
                          >
                            {tr ? "Link" : "Link"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[10px] text-destructive hover:bg-destructive/10"
                            onClick={() => handleCancelInvite(invite)}
                            title={tr ? "Daveti iptal et" : "Cancel invite"}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ─── Boş state — sadece kurucu varsa motivasyon kartı ─── */}
            {otherMembersCount === 0 && (
              <div className="mb-6 rounded-2xl border-2 border-dashed border-emerald-200 dark:border-emerald-800/60 bg-gradient-to-br from-emerald-50/80 to-teal-50/40 dark:from-emerald-950/20 dark:to-teal-950/10 p-6">
                <div className="text-center mb-5">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 mb-3">
                    <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-base text-foreground mb-1.5">
                    {tr ? "Aileni DoctoPal'a Ekle" : "Add Your Family to DoctoPal"}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    {tr
                      ? "Aile üyelerini ekleyerek birbirinizin sağlık durumunu takip edebilir, ilaç hatırlatmalarını paylaşabilir ve acil durumlarda bilgilendirilebilirsiniz."
                      : "Add family members to track each other's health, share medication reminders, and be notified in emergencies."}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 rounded-xl bg-white/70 dark:bg-card/60 p-3 border border-emerald-100 dark:border-emerald-900/40">
                    <div className="w-9 h-9 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
                      <Heart className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground">
                        {tr ? "Sağlık takibi" : "Health tracking"}
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        {tr ? "Aile bireylerinin sağlık skorlarını gör" : "See your family's health scores"}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 rounded-xl bg-white/70 dark:bg-card/60 p-3 border border-emerald-100 dark:border-emerald-900/40">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground">
                        {tr ? "İlaç hatırlatma" : "Med reminders"}
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        {tr ? "Birbirinize hatırlatma gönderin" : "Send reminders to each other"}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 rounded-xl bg-white/70 dark:bg-card/60 p-3 border border-emerald-100 dark:border-emerald-900/40">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                      <Siren className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground">
                        {tr ? "Acil durum" : "Emergency"}
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        {tr ? "Acil durumda aile bildirimi" : "Family alerts in emergencies"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Üye davet et (2-tab: email / code) ─── */}
            {(isOwner || isAdmin) && (
              <div className="bg-card rounded-2xl shadow-sm border p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <UserPlus className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-semibold text-foreground">
                    {tr ? "Üye Davet Et" : "Invite a Member"}
                  </h3>
                </div>

                {/* Tab switcher */}
                <div className="flex gap-1 p-1 bg-muted rounded-xl mb-4">
                  <button
                    type="button"
                    onClick={() => setInviteTab("email")}
                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors ${
                      inviteTab === "email"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tr ? "Email ile" : "By Email"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setInviteTab("code")}
                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors ${
                      inviteTab === "code"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tr ? "Kod ile" : "By Code"}
                  </button>
                </div>

                {inviteTab === "email" ? (
                  <>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                      {tr
                        ? "Davet edilen kişi bir e-posta alacak ve DoctoPal hesabı oluşturarak hanenize katılabilecek."
                        : "The invitee will receive an email and can join your household by creating a DoctoPal account."}
                    </p>
                    <input
                      value={inviteNickname}
                      onChange={e => setInviteNickname(e.target.value)}
                      placeholder={tr ? "Takma ad (örn: Babam, Annem)" : "Nickname (e.g. Dad, Mom)"}
                      className="w-full border border-border rounded-xl px-4 py-3 mb-3 bg-background text-foreground focus:ring-2 focus:ring-emerald-400 outline-none"
                    />
                    <input
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      placeholder={tr ? "E-posta adresi" : "Email address"}
                      type="email"
                      className="w-full border border-border rounded-xl px-4 py-3 bg-background text-foreground focus:ring-2 focus:ring-emerald-400 outline-none"
                      onKeyDown={e => e.key === "Enter" && handleInvite()}
                    />
                    <p className="text-[11px] text-muted-foreground mt-2 mb-3 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      {tr ? "Davet bağlantısı 7 gün geçerlidir." : "The invite link is valid for 7 days."}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleInvite()}
                      disabled={inviting || !inviteEmail.trim()}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                    >
                      {inviting && <Loader2 className="h-4 w-4 animate-spin" />}
                      {inviting
                        ? (tr ? "Gönderiliyor..." : "Sending...")
                        : (tr ? "Davet Gönder" : "Send Invite")}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                      {tr
                        ? "6 haneli bir kod oluşturun. Davet edilecek kişi bu kodu /family/join sayfasında girerek hanenize katılır."
                        : "Generate a 6-character code. The invitee enters it at /family/join to join your household."}
                    </p>

                    {generatedCode ? (
                      <div className="space-y-3">
                        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5 text-center">
                          <p className="text-xs text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-2 font-semibold">
                            {tr ? "Davet Kodu" : "Invite Code"}
                          </p>
                          <p className="text-3xl font-mono font-bold tracking-[0.3em] text-emerald-900 dark:text-emerald-100 mb-3">
                            {generatedCode}
                          </p>
                          <button
                            type="button"
                            onClick={handleCopyCode}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:text-emerald-800"
                          >
                            {codeCopied ? (
                              <><Check className="h-4 w-4" /> {tr ? "Kopyalandı!" : "Copied!"}</>
                            ) : (
                              <>{tr ? "Kopyala" : "Copy"}</>
                            )}
                          </button>
                        </div>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {tr ? "48 saat geçerlidir." : "Valid for 48 hours."}
                        </p>
                        <Button
                          type="button"
                          onClick={() => { setGeneratedCode(null); setGeneratedCodeExpiry(null) }}
                          variant="outline"
                          className="w-full py-2.5 rounded-xl font-medium"
                        >
                          {tr ? "Yeni Kod Oluştur" : "Generate New Code"}
                        </Button>
                      </div>
                    ) : (
                      <>
                        <input
                          value={inviteNickname}
                          onChange={e => setInviteNickname(e.target.value)}
                          placeholder={tr ? "Takma ad (opsiyonel)" : "Nickname (optional)"}
                          className="w-full border border-border rounded-xl px-4 py-3 mb-3 bg-background text-foreground focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                        <p className="text-[11px] text-muted-foreground mb-3 flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          {tr ? "Kod 48 saat geçerlidir. Premium gerekir." : "Code valid for 48 hours. Premium required."}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleGenerateCode()}
                          disabled={generatingCode}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                        >
                          {generatingCode && <Loader2 className="h-4 w-4 animate-spin" />}
                          {generatingCode
                            ? (tr ? "Oluşturuluyor..." : "Generating...")
                            : (tr ? "Kod Oluştur" : "Generate Code")}
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ─── Davet kodu ile başka aileye katılma CTA ─── */}
            <div className="bg-card rounded-2xl border shadow-sm p-5 mb-6 text-center">
              <p className="text-sm font-medium text-foreground mb-1">
                {tx("family.joinCtaTitle", lang)}
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                {tx("family.joinCtaDesc", lang)}
              </p>
              <Link
                href="/family/join"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                {tx("family.joinWithCode", lang)}
              </Link>
            </div>

            {/* ─── Roller & izinler bilgi accordion'u ─── */}
            <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setRolesOpen(o => !o)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/40 transition-colors"
                aria-expanded={rolesOpen}
              >
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-semibold text-foreground">
                    {tr ? "Roller ve İzinler" : "Roles & Permissions"}
                  </span>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${rolesOpen ? "rotate-180" : ""}`} />
              </button>
              {rolesOpen && (
                <div className="px-4 pb-4 pt-1 space-y-3 text-sm">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/20">
                    <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground text-xs">
                        {tr ? "Kurucu" : "Owner"}
                      </p>
                      <p className="text-[12px] text-muted-foreground leading-relaxed mt-0.5">
                        {tr
                          ? "Tüm üyeleri yönetebilir, davet gönderebilir, hane adını ve ikonunu düzenleyebilir, üyeleri kaldırabilir."
                          : "Can manage all members, send invites, edit household name & icon, and remove members."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/20">
                    <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground text-xs">
                        {tr ? "Yönetici" : "Admin"}
                      </p>
                      <p className="text-[12px] text-muted-foreground leading-relaxed mt-0.5">
                        {tr
                          ? "Davet gönderebilir ve üyelerin takma adlarını düzenleyebilir. Hane ayarlarını değiştiremez."
                          : "Can send invites and edit member nicknames. Cannot change household settings."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/60">
                    <Users className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground text-xs">
                        {tr ? "Üye" : "Member"}
                      </p>
                      <p className="text-[12px] text-muted-foreground leading-relaxed mt-0.5">
                        {tr
                          ? "Hane üyelerinin paylaşılan sağlık bilgilerini görebilir. \"Yönetim izni\" verirse kurucu/yönetici onun profilini düzenleyebilir."
                          : "Can view shared health info of household members. If they grant 'manage permission', the owner/admin can edit their profile."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ─── STAGE 5: Send reminder modal ─── */}
      {reminderTarget && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
          onClick={() => !sendingReminder && setReminderTarget(null)}
        >
          <div
            className="bg-card w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl border max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-emerald-500" />
                <h3 className="font-semibold text-foreground">
                  {tr ? "Hatırlatma Gönder" : "Send Reminder"}
                </h3>
              </div>
              <button onClick={() => !sendingReminder && setReminderTarget(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-xs text-muted-foreground mb-4">
                {tr ? "Alıcı:" : "To:"} <span className="font-semibold text-foreground">
                  {reminderTarget.nickname || reminderTarget.profile?.display_name || reminderTarget.invite_email}
                </span>
              </p>

              <div className="grid grid-cols-1 gap-2 mb-4">
                {[
                  { type: "reminder_meds" as const, icon: Pill, color: "text-blue-500", labelTr: "İlacını aldın mı?", labelEn: "Did you take your meds?" },
                  { type: "reminder_checkin" as const, icon: CheckCircle2, color: "text-emerald-500", labelTr: "Bugün nasılsın?", labelEn: "How are you today?" },
                  { type: "reminder_water" as const, icon: Droplet, color: "text-cyan-500", labelTr: "Su içmeyi unutma", labelEn: "Drink water reminder" },
                ].map(({ type, icon: Icon, color, labelTr, labelEn }) => (
                  <button
                    key={type}
                    type="button"
                    disabled={sendingReminder}
                    onClick={() => handleSendReminder(type)}
                    className="flex items-center gap-3 p-3 rounded-xl border bg-muted/30 hover:bg-muted/60 transition-colors disabled:opacity-50 text-left"
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${color}`} />
                    <span className="text-sm font-medium text-foreground flex-1">
                      {tr ? labelTr : labelEn}
                    </span>
                    <Send className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                ))}
              </div>

              {sendingReminder && (
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {tr ? "Gönderiliyor…" : "Sending…"}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── STAGE 3: Sharing prefs modal ─── */}
      {sharingModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
          onClick={() => setSharingModalOpen(false)}
        >
          <div
            className="bg-card w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl border max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-emerald-500" />
                <h3 className="font-semibold text-foreground">
                  {tr ? "Paylaşım Ayarları" : "Sharing Preferences"}
                </h3>
              </div>
              <button onClick={() => setSharingModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                {tr
                  ? "Hangi sağlık bilgilerinin hane üyeleriyle paylaşılacağını seç. Acil durum bilgileri varsayılan olarak açıktır."
                  : "Choose what health information is shared with household members. Emergency info is on by default."}
              </p>

              {[
                { key: "shares_health_score", icon: Activity, color: "text-rose-500", labelTr: "Sağlık skoru", labelEn: "Health score", descTr: "Günlük sağlık skorunu üyeler görebilsin", descEn: "Members can see your daily health score" },
                { key: "shares_medications", icon: Pill, color: "text-blue-500", labelTr: "İlaç listesi", labelEn: "Medication list", descTr: "Aktif ilaçlarınızı üyeler görebilsin", descEn: "Members can see your active medications" },
                { key: "shares_allergies", icon: AlertCircle, color: "text-amber-500", labelTr: "Alerji bilgileri", labelEn: "Allergy info", descTr: "Alerjilerinizi üyeler görebilsin", descEn: "Members can see your allergies" },
                { key: "shares_emergency", icon: ShieldAlert, color: "text-red-500", labelTr: "Acil durum bilgileri", labelEn: "Emergency info", descTr: "Acil iletişim ve kritik tıbbi bilgileriniz (önerilen)", descEn: "Emergency contacts and critical medical info (recommended)" },
              ].map(({ key, icon: Icon, color, labelTr, labelEn, descTr, descEn }) => {
                const checked = sharingDraft[key as keyof typeof sharingDraft]
                return (
                  <label
                    key={key}
                    className="flex items-start gap-3 p-3 rounded-xl border bg-muted/30 hover:bg-muted/50 cursor-pointer mb-2 transition-colors"
                  >
                    <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{tr ? labelTr : labelEn}</p>
                      <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{tr ? descTr : descEn}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={checked}
                      onClick={() => setSharingDraft(d => ({ ...d, [key]: !d[key as keyof typeof d] }))}
                      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 mt-0.5 ${
                        checked ? "bg-emerald-500" : "bg-muted-foreground/30"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          checked ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </label>
                )
              })}

              <div className="flex gap-2 mt-5">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSharingModalOpen(false)}
                  disabled={savingSharing}
                >
                  {tr ? "İptal" : "Cancel"}
                </Button>
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleSaveSharing}
                  disabled={savingSharing}
                >
                  {savingSharing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {tr ? "Kaydet" : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
