"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import { PremiumGate } from "@/components/premium/PremiumGate"
import {
  Stethoscope,
  Users,
  UserPlus,
  ClipboardList,
  TrendingUp,
  Shield,
  Copy,
  Check,
  Loader2,
  FileText,
  AlertCircle,
  Upload,
} from "lucide-react"

interface Patient {
  id: string
  patient_id: string
  status: string
  invite_code: string | null
  created_at: string
  patient_name?: string
  patient_email?: string
  compliance_score?: number
}

export default function DoctorPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, profile, premiumStatus } = useAuth()
  const { lang } = useLang()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [showVerification, setShowVerification] = useState(false)

  const isVerified = profile?.is_doctor_verified === true

  const fetchPatients = useCallback(async () => {
    if (!user) return
    const supabase = createBrowserClient()
    setLoading(true)

    const { data } = await supabase
      .from("doctor_patients")
      .select("*")
      .eq("doctor_id", user.id)
      .order("created_at", { ascending: false })

    if (data) {
      // Fetch patient names
      const patientIds = data.map((p: { patient_id: string }) => p.patient_id)
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("id, full_name")
        .in("id", patientIds)

      const enriched = data.map((p: Patient) => {
        const profile = (profiles || []).find((pr: { id: string }) => pr.id === p.patient_id)
        return {
          ...p,
          patient_name: (profile as { full_name?: string } | undefined)?.full_name || "—",
          compliance_score: Math.floor(Math.random() * 40 + 60), // placeholder
        }
      })
      setPatients(enriched)
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/auth/login")
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (user) fetchPatients()
  }, [user, fetchPatients])

  const createInvite = async () => {
    if (!user) return
    const supabase = createBrowserClient()
    const code = `DR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    await supabase.from("doctor_patients").insert({
      doctor_id: user.id,
      patient_id: user.id, // placeholder — real patient joins via code
      invite_code: code,
      status: "pending",
    })

    fetchPatients()
  }

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/doctor/join?code=${code}`)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <PremiumGate
        feature="doctor_pdf_email"
        status={premiumStatus}
        fallback="teaser"
        teaserText={lang === "tr" ? "Doktor paneli Doktor paketi ile kullanılabilir" : "Doctor panel requires Doctor plan"}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              {tx("doctor.title", lang)}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{tx("doctor.subtitle", lang)}</p>
          </div>
          {isVerified && (
            <div className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <Shield className="h-3.5 w-3.5" />
              {tx("doctor.verified", lang)}
            </div>
          )}
        </div>

        {/* Doctor Verification */}
        {!isVerified && (
          <div className="mb-6 rounded-xl border-2 border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800 dark:text-amber-300">
                  {tx("doctor.verification", lang)}
                </h3>
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                  {tx("doctor.verificationDesc", lang)}
                </p>
                <button
                  onClick={() => setShowVerification(!showVerification)}
                  className="mt-3 flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
                >
                  <Upload className="h-4 w-4" />
                  {tx("doctor.uploadDoc", lang)}
                </button>
                {showVerification && (
                  <div className="mt-3 rounded-lg border bg-background p-4">
                    <p className="text-sm text-muted-foreground">
                      {tx("doctor.verificationInstructions", lang)}
                    </p>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="mt-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      {tx("doctor.supportedFormats", lang)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard icon={<Users className="h-5 w-5 text-blue-500" />} value={patients.filter(p => p.status === "active").length} label={tx("doctor.activePatients", lang)} />
          <StatCard icon={<ClipboardList className="h-5 w-5 text-green-500" />} value={patients.length} label={tx("doctor.total", lang)} />
          <StatCard icon={<TrendingUp className="h-5 w-5 text-purple-500" />} value={patients.length > 0 ? Math.round(patients.reduce((a, p) => a + (p.compliance_score || 0), 0) / patients.length) : 0} label={tx("doctor.avgCompliance", lang)} />
          <StatCard icon={<FileText className="h-5 w-5 text-amber-500" />} value={0} label={tx("doctor.visitsThisWeek", lang)} />
        </div>

        {/* Invite Patient */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={createInvite}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <UserPlus className="h-4 w-4" />
            {tx("doctor.addPatient", lang)}
          </button>
        </div>

        {/* Patient List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : patients.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center">
            <Stethoscope className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{tx("doctor.noPatients", lang)}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {patients.map((patient) => (
              <div key={patient.id} className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{patient.patient_name || "—"}</p>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      patient.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}>
                      {patient.status}
                    </span>
                    {patient.invite_code && patient.status === "pending" && (
                      <button
                        onClick={() => copyInviteCode(patient.invite_code!)}
                        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
                      >
                        {copiedCode === patient.invite_code ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        {patient.invite_code}
                      </button>
                    )}
                  </div>
                </div>
                {patient.compliance_score !== undefined && patient.status === "active" && (
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{patient.compliance_score}%</p>
                    <p className="text-[10px] text-muted-foreground">{tx("doctor.compliance", lang)}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </PremiumGate>
    </div>
  )
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="rounded-xl border bg-card p-4 text-center">
      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        {icon}
      </div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
