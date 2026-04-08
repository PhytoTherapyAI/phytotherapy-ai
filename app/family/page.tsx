// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useEffect, useState } from "react"
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
} from "lucide-react"
import { PageSkeleton } from "@/components/ui/page-skeleton"

export default function FamilyPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, profile } = useAuth()
  const {
    familyGroup,
    familyMembers,
    isOwner,
    isAdmin,
    createGroup,
    inviteMember,
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

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [authLoading, isAuthenticated, router])

  // Auto-dismiss feedback (longer if link is shown)
  useEffect(() => {
    if (feedback) {
      const delay = inviteLink ? 30000 : 4000
      const t = setTimeout(() => { setFeedback(null); setInviteLink(null) }, delay)
      return () => clearTimeout(t)
    }
  }, [feedback, inviteLink])

  async function handleCreateGroup() {
    if (!groupName.trim()) return
    setCreating(true)
    try {
      const ok = await createGroup(groupName)
      if (ok) {
        setFeedback({ type: "success", msg: tr ? "Grup oluşturuldu!" : "Group created!" })
        setGroupName("")
      } else {
        setFeedback({ type: "error", msg: tr ? "Grup oluşturulamadı. Konsolu kontrol edin (F12)." : "Failed to create group. Check console (F12)." })
      }
    } catch (err) {
      console.error("[Family] createGroup failed:", err)
      setFeedback({ type: "error", msg: tr ? "Grup oluşturulamadı, tekrar deneyin." : "Failed to create group, try again." })
    } finally {
      setCreating(false)
    }
  }

  async function handleInvite() {
    if (!inviteEmail.trim() || !familyGroup) return
    setInviting(true)
    console.log("[Family] handleInvite başladı:", {
      email: inviteEmail,
      nickname: inviteNickname,
      groupId: familyGroup.id
    })
    try {
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      console.log("[Family] Session:", { hasToken: !!session?.access_token })

      if (!session?.access_token) {
        setFeedback({ type: "error", msg: tr ? "Oturum bulunamadı, tekrar giriş yapın." : "Session not found, please log in again." })
        setInviting(false)
        return
      }

      console.log("[Family] Calling invite API...")
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
      console.log("[Family] invite API response:", { status: res.status, resData })

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

      setInviteEmail("")
      setInviteNickname("")

      // Invite link'i göster
      if (resData.inviteUrl) {
        setInviteLink(resData.inviteUrl)
        setFeedback({
          type: "success",
          msg: resData.emailSent
            ? (tr ? "Davet gönderildi!" : "Invite sent!")
            : (tr ? "Davet oluşturuldu! Linki paylaşın:" : "Invite created! Share the link:")
        })
      } else {
        setFeedback({ type: "success", msg: tr ? "Davet oluşturuldu!" : "Invite created!" })
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
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 to-background dark:from-gray-950 dark:to-gray-900">
      <div className="mx-auto max-w-2xl px-4 md:px-8 py-8 sm:py-12">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 mb-4">
            <Users className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {tr ? "Aile Profilleri" : "Family Profiles"}
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto text-sm">
            {tr
              ? "Aile üyelerinin sağlık profillerini yönet"
              : "Manage your family members' health profiles"}
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
                {tr ? "Aile Grubunu Kur" : "Create Family Group"}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {tr
                  ? "Aile üyelerinin sağlık profillerini yönetmek için bir grup oluştur."
                  : "Create a group to manage your family's health profiles."}
              </p>
            </div>
            <input
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder={tr ? "Grup adı (örn: Ailem)" : "Group name (e.g. My Family)"}
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
                : (tr ? "Grup Oluştur" : "Create Group")}
            </Button>
          </div>
        ) : (
          <>
            {/* Grup başlığı */}
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 mb-6 flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                <Home className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-emerald-800 dark:text-emerald-200">
                  {familyGroup.name}
                </h2>
                <p className="text-emerald-600 dark:text-emerald-400 text-sm">
                  {familyMembers.length} {tr ? "üye" : "members"}
                </p>
              </div>
              {isOwner && (
                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 text-[10px]">
                  <Crown className="h-3 w-3 mr-0.5" />
                  {tr ? "Kurucu" : "Owner"}
                </Badge>
              )}
            </div>

            {/* Üye listesi */}
            <div className="bg-card rounded-2xl shadow-sm border mb-6 overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground">
                  {tr ? "Üyeler" : "Members"}
                </h3>
              </div>
              <div className="divide-y divide-border">
                {familyMembers.map(member => {
                  const avatarSeed = member.profile?.avatar_seed || member.user_id || member.invite_email
                  const avatarStyle = (member.profile?.avatar_style as AvatarStyle) || "adventurer"
                  const displayName = member.nickname
                    ?? member.profile?.display_name
                    ?? member.invite_email

                  return (
                    <div key={member.id} className="p-4 flex items-center gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getAvatarDataUri(avatarSeed, avatarStyle)}
                        alt={displayName}
                        className="w-12 h-12 rounded-full bg-muted flex-shrink-0"
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
                            {(isOwner || isAdmin) && member.user_id !== user.id && (
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
                      {isOwner && member.user_id !== user.id && (
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
                                ? `${name} gruptan çıkarılsın mı?`
                                : `Remove ${name} from group?`
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

                {familyMembers.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    {tr ? "Henüz üye yok. Aşağıdan davet gönder." : "No members yet. Send an invite below."}
                  </div>
                )}
              </div>
            </div>

            {/* Üye davet et */}
            {(isOwner || isAdmin) && (
              <div className="bg-card rounded-2xl shadow-sm border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <UserPlus className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-semibold text-foreground">
                    {tr ? "Üye Davet Et" : "Invite Member"}
                  </h3>
                </div>
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
                  className="w-full border border-border rounded-xl px-4 py-3 mb-3 bg-background text-foreground focus:ring-2 focus:ring-emerald-400 outline-none"
                  onKeyDown={e => e.key === "Enter" && handleInvite()}
                />
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
          </>
        )}
      </div>
    </div>
  )
}
