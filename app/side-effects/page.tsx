// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import {
  AlertTriangle,
  Plus,
  Loader2,
  TrendingUp,
  Shield,
  Eye,
  Send,
  CheckCircle2,
  BarChart3,
} from "lucide-react"

interface SideEffectReport {
  id: string
  supplement_name: string
  medication_name: string | null
  effect_description: string
  severity: "mild" | "moderate" | "severe"
  reported_at: string
}

// Simulated community signals
const COMMUNITY_SIGNALS = [
  { supplement: "St. John's Wort", signal: "Increased photosensitivity reports", count: 47, trend: "up" },
  { supplement: "Ashwagandha", signal: "Sleep disruption at high doses", count: 23, trend: "stable" },
  { supplement: "Turmeric", signal: "GI discomfort with empty stomach", count: 31, trend: "up" },
  { supplement: "Omega-3", signal: "Fishy burps / reflux", count: 18, trend: "down" },
]

export default function SideEffectsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { lang } = useLang()
  const [reports, setReports] = useState<SideEffectReport[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    supplement: "",
    medication: "",
    description: "",
    severity: "mild" as "mild" | "moderate" | "severe",
  })

  const fetchReports = useCallback(async () => {
    if (!user) return
    const supabase = createBrowserClient()
    setLoading(true)
    const { data } = await supabase
      .from("side_effect_reports")
      .select("*")
      .eq("user_id", user.id)
      .order("reported_at", { ascending: false })
      .limit(50)
    setReports((data as SideEffectReport[]) || [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/auth/login")
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (user) fetchReports()
  }, [user, fetchReports])

  const submitReport = async () => {
    if (!user || !form.supplement || !form.description) return
    const supabase = createBrowserClient()
    await supabase.from("side_effect_reports").insert({
      user_id: user.id,
      supplement_name: form.supplement,
      medication_name: form.medication || null,
      effect_description: form.description,
      severity: form.severity,
      is_anonymous: true,
    })
    setSubmitted(true)
    setForm({ supplement: "", medication: "", description: "", severity: "mild" })
    setTimeout(() => {
      setSubmitted(false)
      setShowForm(false)
    }, 2000)
    fetchReports()
  }

  const severityColors = {
    mild: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    moderate: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    severe: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            {tx("sideeffect.title", lang)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{tx("sideeffect.subtitle", lang)}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {tx("sideeffect.report", lang)}
        </button>
      </div>

      {/* Report Form */}
      {showForm && (
        <div className="mb-6 rounded-xl border bg-card p-5">
          {submitted ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">{tx("sideeffect.submitted", lang)}</span>
            </div>
          ) : (
            <>
              <h3 className="mb-3 font-semibold">{tx("sideeffect.reportTitle", lang)}</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  value={form.supplement}
                  onChange={(e) => setForm({ ...form, supplement: e.target.value })}
                  placeholder={tx("sideeffect.supplementName", lang)}
                  className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <input
                  type="text"
                  value={form.medication}
                  onChange={(e) => setForm({ ...form, medication: e.target.value })}
                  placeholder={tx("sideeffect.medicationName", lang)}
                  className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={tx("sideeffect.descPlaceholder", lang)}
                className="mt-3 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                rows={3}
              />
              <div className="mt-3 flex items-center gap-3">
                <span className="text-sm font-medium">{tx("sideeffect.severity", lang)}</span>
                {(["mild", "moderate", "severe"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setForm({ ...form, severity: s })}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      form.severity === s ? severityColors[s] : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tx(`sideeffect.${s}`, lang)}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {tx("sideeffect.anonymousNote", lang)}
                </span>
              </div>
              <button
                onClick={submitReport}
                disabled={!form.supplement || !form.description}
                className="mt-3 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {tx("sideeffect.submit", lang)}
              </button>
            </>
          )}
        </div>
      )}

      {/* Community Signals */}
      <div className="mb-6 rounded-xl border bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/10 dark:to-orange-950/10 p-5">
        <h3 className="mb-3 flex items-center gap-2 font-semibold">
          <BarChart3 className="h-5 w-5 text-amber-500" />
          {tx("sideeffect.communitySignals", lang)}
        </h3>
        <div className="space-y-2">
          {COMMUNITY_SIGNALS.map((signal, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg bg-background/80 px-3 py-2">
              <AlertTriangle className={`h-4 w-4 shrink-0 ${signal.trend === "up" ? "text-red-500" : signal.trend === "down" ? "text-green-500" : "text-amber-500"}`} />
              <div className="flex-1">
                <p className="text-sm font-medium">{signal.supplement}</p>
                <p className="text-xs text-muted-foreground">{signal.signal}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{signal.count}</p>
                <div className="flex items-center gap-0.5">
                  <TrendingUp className={`h-3 w-3 ${signal.trend === "up" ? "text-red-500" : signal.trend === "down" ? "text-green-500 rotate-180" : "text-amber-500"}`} />
                  <span className="text-[10px] text-muted-foreground">{signal.trend}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[10px] text-muted-foreground">
          {tx("sideeffect.signalDisclaimer", lang)}
        </p>
      </div>

      {/* My Reports */}
      <div className="rounded-xl border bg-card">
        <div className="border-b p-4">
          <h3 className="font-semibold">
            {tx("sideeffect.myReports", lang)} ({reports.length})
          </h3>
        </div>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center">
            <Shield className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              {tx("sideeffect.noReports", lang)}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {reports.map((report) => (
              <div key={report.id} className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{report.supplement_name}</span>
                  {report.medication_name && (
                    <span className="text-xs text-muted-foreground">+ {report.medication_name}</span>
                  )}
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${severityColors[report.severity]}`}>
                    {report.severity}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{report.effect_description}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {new Date(report.reported_at).toLocaleDateString(tx("common.locale", lang))}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
