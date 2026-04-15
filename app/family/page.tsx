// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useFamily } from "@/lib/family-context"
import { useLang } from "@/components/layout/language-toggle"
import { getAvatarDataUri, type AvatarStyle } from "@/lib/avatar"
import { createBrowserClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users, UserPlus, Crown, Shield, Trash2, Pencil, Check, X, Loader2, Home,
  Heart, Bell, Siren, Info, ChevronDown,
} from "lucide-react"
import { PageSkeleton } from "@/components/ui/page-skeleton"
import type { FamilyMember } from "@/types/family"

// 5 preset hane ikonu — basit, karmaşık olmasın
const HOUSEHOLD_ICONS = ["🏠", "❤️", "🌳", "🏡", "🌟"] as const

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
    isOwner,
    isAdmin,
    createGroup,
    updateGroupName,
    updateNickname,
    promoteToAdmin,
    removeMember,
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

  // Hane ismi ve ikon düzenleme
  const [editingGroupName, setEditingGroupName] = useState(false)
  const [draftGroupName, setDraftGroupName] = useState("")
  const [savingGroupName, setSavingGroupName] = useState(false)
  const [iconPickerOpen, setIconPickerOpen] = useState(false)
  const [householdIcon, setHouseholdIcon] = useState<string>(HOUSEHOLD_ICONS[0])

  // Roles info accordion
  const [rolesOpen, setRolesOpen] = useState(false)

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

  async function handleSaveNickname(memberId: string) {
    await updateNickname(memberId, newNickname)
    setEditingId(null)
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

            {/* ─── Üye listesi ─── */}
            <div className="bg-card rounded-2xl shadow-sm border mb-6 overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-foreground">
                  {tr ? "Üyeler" : "Members"}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {sortedMembers.length} {tr ? "kişi" : sortedMembers.length === 1 ? "person" : "people"}
                </span>
              </div>
              <div className="divide-y divide-border">
                {sortedMembers.map(member => {
                  const isSelf = member.user_id === user.id
                  const avatarSeed = member.profile?.avatar_seed || member.user_id || member.invite_email
                  const avatarStyle = (member.profile?.avatar_style as AvatarStyle) || "adventurer"
                  const displayName = member.nickname
                    ?? member.profile?.display_name
                    ?? (isSelf ? (profile?.full_name || user.email?.split("@")[0]) : null)
                    ?? member.invite_email

                  return (
                    <div key={member.id} className={`p-4 flex items-center gap-4 ${
                      isSelf ? "bg-emerald-50/40 dark:bg-emerald-950/10" : ""
                    }`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getAvatarDataUri(avatarSeed, avatarStyle)}
                        alt={displayName}
                        className="w-12 h-12 rounded-full bg-muted flex-shrink-0 ring-2 ring-background"
                      />

                      <div className="flex-1 min-w-0">
                        {editingId === member.id ? (
                          <div className="flex gap-2 items-center">
                            <input
                              value={newNickname}
                              onChange={e => setNewNickname(e.target.value)}
                              className="border border-border rounded-lg px-2 py-1 text-sm flex-1 bg-background text-foreground"
                              autoFocus
                              onKeyDown={e => e.key === "Enter" && handleSaveNickname(member.id)}
                            />
                            <button
                              onClick={() => handleSaveNickname(member.id)}
                              className="text-emerald-500 hover:text-emerald-600"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground truncate">
                              {displayName}
                            </span>
                            {isSelf && (
                              <Badge variant="secondary" className="text-[9px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0 px-1.5 py-0">
                                {tr ? "Sen" : "You"}
                              </Badge>
                            )}
                            {(isOwner || isAdmin) && !isSelf && (
                              <button
                                onClick={() => {
                                  setEditingId(member.id)
                                  setNewNickname(member.nickname ?? "")
                                }}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge
                            variant="secondary"
                            className={`text-[10px] border-0 ${
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
                          {member.allows_management && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                              {tr ? "Yönetim izni var" : "Can be managed"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Aksiyonlar */}
                      {isOwner && !isSelf && member.id && !member.id.startsWith("synth-") && (
                        <div className="flex gap-1.5 flex-shrink-0">
                          {member.role === "member" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-[10px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                              onClick={() => promoteToAdmin(member.id)}
                            >
                              <Shield className="h-3 w-3 mr-0.5" />
                              {tr ? "Yönetici Yap" : "Promote"}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              const name = member.nickname || displayName
                              if (confirm(tr
                                ? `${name} haneden çıkarılsın mı?`
                                : `Remove ${name} from household?`
                              )) {
                                removeMember(member.id)
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

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

            {/* ─── Üye davet et ─── */}
            {(isOwner || isAdmin) && (
              <div className="bg-card rounded-2xl shadow-sm border p-6 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <UserPlus className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-semibold text-foreground">
                    {tr ? "Üye Davet Et" : "Invite a Member"}
                  </h3>
                </div>
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
                <Button
                  onClick={handleInvite}
                  disabled={inviting || !inviteEmail.trim()}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold"
                >
                  {inviting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {inviting
                    ? (tr ? "Gönderiliyor..." : "Sending...")
                    : (tr ? "Davet Gönder" : "Send Invite")}
                </Button>
              </div>
            )}

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
    </div>
  )
}
