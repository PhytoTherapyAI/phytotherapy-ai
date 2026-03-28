"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import type { FamilyMember } from "@/lib/database.types"
import {
  Users,
  Loader2,
  AlertTriangle,
  Heart,
  Pill,
  Bell,
  Calendar,
  UserPlus,
  ChevronRight,
  Activity,
} from "lucide-react"

interface MemberSummary extends FamilyMember {
  healthScore: number
  complianceRate: number
  missedDays: number
  nextAppointment: string | null
}

export default function FamilySummaryPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { lang } = useLang()
  const [members, setMembers] = useState<MemberSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const tr = lang === "tr"

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (!user) return
    loadFamilyData()
  }, [user])

  async function loadFamilyData() {
    try {
      setLoading(true)
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const res = await fetch("/api/family", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to load")

      // Enrich members with mock weekly summary data
      const enriched: MemberSummary[] = (json.members || []).map((m: FamilyMember) => ({
        ...m,
        healthScore: Math.floor(Math.random() * 30 + 60),
        complianceRate: Math.floor(Math.random() * 40 + 60),
        missedDays: Math.floor(Math.random() * 4),
        nextAppointment: Math.random() > 0.5
          ? new Date(Date.now() + Math.random() * 7 * 86400000).toISOString()
          : null,
      }))

      setMembers(enriched)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  function getScoreColor(score: number) {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  function getScoreBg(score: number) {
    if (score >= 80) return "bg-green-500/10"
    if (score >= 60) return "bg-yellow-500/10"
    return "bg-red-500/10"
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) return null

  const avgScore = members.length
    ? Math.round(members.reduce((s, m) => s + m.healthScore, 0) / members.length)
    : 0

  const alerts = members.filter((m) => m.missedDays >= 2)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold">
            {tr ? "Aile Haftalik Ozet" : "Family Weekly Summary"}
          </h1>
        </div>
        <button
          onClick={() => router.push("/family")}
          className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
        >
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline">{tx("family.add", lang)}</span>
        </button>
      </div>

      {/* Empty state */}
      {members.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-16 text-center">
          <Users className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <h2 className="mb-2 text-lg font-medium text-muted-foreground">
            {tr ? "Henuz aile uyesi eklenmedi" : "No family members yet"}
          </h2>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground/70">
            {tr
              ? "Profil sayfanizdan aile uyelerini ekleyerek haftalik ozetlerini gorebilirsiniz."
              : "Add family members from your profile to see their weekly health summaries."}
          </p>
          <button
            onClick={() => router.push("/family")}
            className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
          >
            {tx("family.add", lang)}
          </button>
        </div>
      )}

      {members.length > 0 && (
        <>
          {/* Family average score */}
          <div className="mb-6 rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {tr ? "Aile Saglik Ortalaması" : "Family Health Average"}
                </p>
                <p className={`text-3xl font-bold ${getScoreColor(avgScore)}`}>
                  {avgScore}
                  <span className="text-base font-normal text-muted-foreground">/100</span>
                </p>
              </div>
              <div className={`rounded-full p-3 ${getScoreBg(avgScore)}`}>
                <Activity className={`h-6 w-6 ${getScoreColor(avgScore)}`} />
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${
                  avgScore >= 80
                    ? "bg-green-500"
                    : avgScore >= 60
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
                style={{ width: `${avgScore}%` }}
              />
            </div>
          </div>

          {/* Alert cards */}
          {alerts.length > 0 && (
            <div className="mb-6 space-y-2">
              {alerts.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-950/20"
                >
                  <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">
                    {tr
                      ? `${m.full_name} ${m.missedDays} gundur ilac almadi`
                      : `${m.full_name} hasn't taken meds for ${m.missedDays} days`}
                  </p>
                  <button className="ml-auto shrink-0 rounded-full bg-red-500 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-red-600">
                    <Bell className="inline h-3 w-3 mr-1" />
                    {tr ? "Hatırlat" : "Remind"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Member cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {members.map((m) => (
              <div
                key={m.id}
                className="group rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-md"
              >
                {/* Member header */}
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {getInitials(m.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate font-semibold">{m.full_name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {m.relationship && (
                        <span className="capitalize">{m.relationship}</span>
                      )}
                      {m.age != null && (
                        <span>
                          {m.relationship ? " · " : ""}
                          {m.age} {tx("family.ageUnit", lang)}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className={`text-right ${getScoreColor(m.healthScore)}`}>
                    <p className="text-2xl font-bold">{m.healthScore}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {tx("family.healthScore", lang)}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="mb-3 grid grid-cols-2 gap-2">
                  {/* Compliance */}
                  <div className="rounded-lg bg-muted/50 p-2.5">
                    <div className="mb-1 flex items-center gap-1.5">
                      <Pill className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {tr ? "Ilac Uyumu" : "Med Compliance"}
                      </span>
                    </div>
                    <p className="text-lg font-bold">
                      {m.complianceRate}%
                    </p>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${
                          m.complianceRate >= 80
                            ? "bg-green-500"
                            : m.complianceRate >= 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${m.complianceRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Missed meds */}
                  <div className="rounded-lg bg-muted/50 p-2.5">
                    <div className="mb-1 flex items-center gap-1.5">
                      <AlertTriangle
                        className={`h-3.5 w-3.5 ${
                          m.missedDays > 0 ? "text-red-500" : "text-green-500"
                        }`}
                      />
                      <span className="text-xs text-muted-foreground">
                        {tr ? "Kacirilan" : "Missed"}
                      </span>
                    </div>
                    <p className="text-lg font-bold">
                      {m.missedDays === 0 ? (
                        <span className="text-green-500">0</span>
                      ) : (
                        <span className="text-red-500">{m.missedDays} {tr ? "gun" : "days"}</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Next appointment */}
                {m.nextAppointment && (
                  <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-2 dark:bg-blue-950/20">
                    <Calendar className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-xs text-blue-700 dark:text-blue-400">
                      {tr ? "Sonraki randevu:" : "Next appointment:"}{" "}
                      {new Date(m.nextAppointment).toLocaleDateString(
                        tr ? "tr-TR" : "en-US",
                        { month: "short", day: "numeric" }
                      )}
                    </span>
                  </div>
                )}

                {/* Quick actions */}
                <div className="mt-3 flex items-center justify-between border-t pt-3">
                  <button className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20">
                    <Bell className="h-3 w-3" />
                    {tr ? "Hatirlatma Gonder" : "Send Reminder"}
                  </button>
                  <button
                    onClick={() => router.push("/family")}
                    className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {tr ? "Detay" : "Details"}
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
