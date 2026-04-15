// © 2026 DoctoPal — All Rights Reserved
// Doctor Panel — Clinical Copilot with AI Greeting + Triage Queue + Bento Population
"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

import { useAuth } from "@/lib/auth-context"
import { DoctorShell } from "@/components/doctor/DoctorShell"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import {
  Stethoscope, Users, UserPlus, Shield, Copy, Check, Loader2,
  AlertCircle, Upload, QrCode, Brain, X, Sparkles,
  ChevronRight, MessageCircle, ClipboardCheck, Heart, Droplets, Activity,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface Patient {
  id: string; patient_id: string; status: string; invite_code: string | null;
  created_at: string; patient_name?: string; patient_email?: string; compliance_score?: number | null;
}

export default function DoctorPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, profile, session } = useAuth()
  const { lang: rawLang } = useLang()
  const lang: "en" | "tr" = rawLang === "tr" ? "tr" : "en"
  const isTr = lang === "tr"
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [showVerification, setShowVerification] = useState(false)
  const [showQR, setShowQR] = useState<string | null>(null)
  const [summaryLoading, setSummaryLoading] = useState<string | null>(null)
  const [summaryData, setSummaryData] = useState<Record<string, string>>({})
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())

  const isVerified = profile?.is_doctor_verified === true
  const doctorName = profile?.full_name?.split(" ").slice(0, 2).join(" ") || ""

  const fetchPatients = useCallback(async () => {
    if (!user) return
    const supabase = createBrowserClient()
    setLoading(true)
    const { data } = await supabase.from("doctor_patients").select("*").eq("doctor_id", user.id).order("created_at", { ascending: false })
    if (data) {
      const patientIds = data.map((p: { patient_id: string }) => p.patient_id)
      const { data: profiles } = await supabase.from("user_profiles").select("id, full_name").in("id", patientIds)
      const enriched = data.map((p: Patient) => {
        const prof = (profiles || []).find((pr: { id: string }) => pr.id === p.patient_id)
        return { ...p, patient_name: (prof as { full_name?: string } | undefined)?.full_name || "—", compliance_score: null }
      })
      setPatients(enriched)
    }
    setLoading(false)
  }, [user])

  useEffect(() => { if (!isLoading && !isAuthenticated) router.push("/auth/login") }, [isLoading, isAuthenticated, router])
  useEffect(() => { if (user) fetchPatients() }, [user, fetchPatients])

  const createInvite = async () => {
    if (!user) return
    const supabase = createBrowserClient()
    const code = `DR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    await supabase.from("doctor_patients").insert({ doctor_id: user.id, patient_id: user.id, invite_code: code, status: "pending" })
    fetchPatients()
  }

  const copyInviteLink = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/doctor/join?code=${code}`)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const fetchAISummary = async (patientId: string) => {
    if (!session?.access_token) return
    setSummaryLoading(patientId)
    try {
      const res = await fetch("/api/doctor-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ patient_id: patientId, lang }),
      })
      if (res.ok) {
        const data = await res.json()
        setSummaryData((prev) => ({ ...prev, [patientId]: data.summary || data.error }))
      }
    } catch { /* silent */ } finally { setSummaryLoading(null) }
  }

  const dismissAlert = (patientId: string) => {
    setDismissedAlerts((prev) => new Set([...prev, patientId]))
  }

  const activePatients = patients.filter(p => p.status === "active")
  const pendingPatients = patients.filter(p => p.status === "pending")
  const visibleAlerts = activePatients.filter(p => !dismissedAlerts.has(p.id))

  if (isLoading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  return (
    <DoctorShell>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
      className="mx-auto max-w-5xl px-4 md:px-8 py-8 space-y-5">
      {/* ── AI Clinical Copilot Greeting ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl border bg-gradient-to-r from-primary/5 to-sage/5 p-5 dark:from-primary/10 dark:to-sage/10">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm leading-relaxed">
              {getTimeGreeting(lang)} <strong>Dr. {doctorName}</strong>.{" "}
              {activePatients.length > 0 ? (
                <>
                  {isTr
                    ? `Popülasyonunuzdaki ${activePatients.length} hasta stabil.`
                    : `${activePatients.length} patients in your population are stable.`}
                  {visibleAlerts.length > 0 && (
                    <span className="text-red-600 dark:text-red-400 font-semibold cursor-pointer">
                      {" "}{isTr
                        ? `Ancak ${visibleAlerts.length} hastanızda dikkat gerektiren durum tespit ettim.`
                        : `However, I detected ${visibleAlerts.length} patient(s) requiring attention.`}
                    </span>
                  )}
                </>
              ) : (
                <>{tx("doctor.noPatientsGreeting", lang)}</>
              )}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Verification banner */}
      {!isVerified && (
        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800 dark:text-amber-300">{tx("doctor.verification", lang)}</h3>
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">{tx("doctor.verificationDesc", lang)}</p>
              <button onClick={() => setShowVerification(!showVerification)}
                className="mt-2 flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-medium text-white hover:bg-amber-600">
                <Upload className="h-3.5 w-3.5" /> {tx("doctor.uploadDoc", lang)}
              </button>
              {showVerification && (
                <div className="mt-3 rounded-xl border bg-background p-4">
                  <p className="text-xs text-muted-foreground">{tx("doctor.verificationInstructions", lang)}</p>
                  <input type="file" accept="image/*,.pdf" className="mt-2 text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Triage Queue (Inbox Zero) ── */}
      {visibleAlerts.length > 0 && (
        <div className="space-y-2">
          <h2 className="flex items-center gap-2 text-sm font-bold">
            <AlertCircle className="h-4 w-4 text-red-500" />
            {tx("doctor.triageQueue", lang)}
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-900/40 dark:text-red-300">
              {visibleAlerts.length}
            </span>
          </h2>
          <AnimatePresence>
          {visibleAlerts.map((patient) => (
            <motion.div key={patient.id}
              initial={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300, transition: { duration: 0.3 } }}
              drag="x" dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.3}
              onDragEnd={(_, info) => { if (info.offset.x > 120) dismissAlert(patient.id); }}
              whileDrag={{ cursor: "grabbing" }}
              className="group rounded-2xl border border-red-200 bg-red-50/50 p-4 transition-all dark:border-red-800/40 dark:bg-red-950/10 cursor-grab">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/40">
                  <Users className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{patient.patient_name}</span>
                    <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                      {tx("doctor.critical", lang)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {tx("doctor.attentionRequired", lang)}
                  </p>
                  {/* Action chips */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <button onClick={() => fetchAISummary(patient.patient_id)}
                      className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors hover:border-primary hover:text-primary">
                      {summaryLoading === patient.patient_id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Brain className="h-3 w-3" />}
                      {tx("doctor.reviewProtocol", lang)}
                    </button>
                    <button className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-medium hover:border-primary hover:text-primary">
                      <MessageCircle className="h-3 w-3" /> {tx("doctor.messagePatient", lang)}
                    </button>
                    <button onClick={() => dismissAlert(patient.id)}
                      className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
                      <ClipboardCheck className="h-3 w-3" /> {tx("doctor.approveClose", lang)}
                    </button>
                  </div>
                </div>
              </div>
              {/* AI Summary */}
              {summaryData[patient.patient_id] && (
                <div className="mt-3 rounded-xl border bg-background p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Brain className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-bold text-primary uppercase">AI Summary</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{summaryData[patient.patient_id]}</p>
                </div>
              )}
            </motion.div>
          ))}
          </AnimatePresence>
          <p className="text-[9px] text-muted-foreground text-center mt-1">
            {tx("doctor.swipeHint", lang)}
          </p>
        </div>
      )}

      {/* Inbox Zero success */}
      {activePatients.length > 0 && visibleAlerts.length === 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="rounded-2xl border bg-emerald-50/50 p-6 text-center dark:bg-emerald-950/10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
            <Check className="h-6 w-6 text-emerald-600" />
          </motion.div>
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
            {tx("doctor.allSafe", lang)}
          </p>
        </motion.div>
      )}

      {/* ── Add Patient ── */}
      <div className="flex items-center gap-3">
        <Button onClick={createInvite} className="gap-2 rounded-xl">
          <UserPlus className="h-4 w-4" /> {tx("doctor.addPatient", lang)}
        </Button>
        {isVerified && (
          <span className="flex items-center gap-1 text-[10px] text-emerald-600">
            <Shield className="h-3 w-3" /> {tx("doctor.verified", lang)}
          </span>
        )}
      </div>

      {/* ── Patient List ── */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : patients.length === 0 ? (
        <div className="rounded-2xl border bg-card p-8 text-center">
          <Stethoscope className="mx-auto mb-3 h-10 w-10 text-muted-foreground/20" />
          <p className="text-sm text-muted-foreground">{tx("doctor.noPatients", lang)}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {patients.map((patient) => (
            <div key={patient.id} className="rounded-2xl border bg-card p-4 transition-all hover:shadow-soft">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{patient.patient_name}</p>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      patient.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700"
                    }`}>{patient.status}</span>
                    {patient.invite_code && patient.status === "pending" && (
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => copyInviteLink(patient.invite_code!)} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground">
                          {copiedCode === patient.invite_code ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          {copiedCode === patient.invite_code ? "Copied" : "Copy"}
                        </button>
                        <button onClick={() => setShowQR(showQR === patient.invite_code ? null : patient.invite_code)} className="text-[10px] text-muted-foreground hover:text-foreground">
                          <QrCode className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {patient.status === "active" && (
                  <Button variant="outline" size="sm" onClick={() => fetchAISummary(patient.patient_id)}
                    disabled={summaryLoading === patient.patient_id} className="gap-1 text-xs rounded-xl">
                    {summaryLoading === patient.patient_id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Brain className="h-3 w-3" />}
                    AI
                  </Button>
                )}
              </div>

              {showQR === patient.invite_code && patient.invite_code && (
                <div className="mt-3 flex flex-col items-center gap-2 rounded-xl border bg-muted/30 p-4">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${typeof window !== "undefined" ? window.location.origin : ""}/doctor/join?code=${patient.invite_code}`)}`}
                    alt="QR" className="h-36 w-36 rounded-lg bg-white p-2" />
                  <p className="font-mono text-[10px] text-muted-foreground">{patient.invite_code}</p>
                  <button onClick={() => setShowQR(null)} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <X className="h-3 w-3" /> Close
                  </button>
                </div>
              )}

              {summaryData[patient.patient_id] && (
                <div className="mt-3 rounded-xl border bg-primary/5 p-3">
                  <div className="flex items-center gap-1.5 mb-1.5"><Brain className="h-3.5 w-3.5 text-primary" /><span className="text-[10px] font-bold text-primary">AI Summary</span></div>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{summaryData[patient.patient_id]}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Bento Population Overview ── */}
      {activePatients.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { emoji: "👥", label: isTr ? "Aktif Hasta" : "Active Patients", value: activePatients.length, icon: Users, color: "text-blue-500" },
            { emoji: "⏳", label: isTr ? "Bekleyen" : "Pending", value: pendingPatients.length, icon: ClipboardCheck, color: "text-amber-500" },
            { emoji: "🩸", label: isTr ? "Diyabet" : "Diabetes", value: 0, icon: Droplets, color: "text-rose-500" },
            { emoji: "❤️", label: isTr ? "Hipertansiyon" : "Hypertension", value: 0, icon: Heart, color: "text-red-500" },
          ].map(({ label, value, icon: Icon, color }, i) => (
            <div key={i} className="rounded-2xl border bg-card p-3 text-center">
              <Icon className={`mx-auto h-5 w-5 ${color} opacity-30 mb-1`} />
              <p className="text-lg font-bold">{value}</p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      )}

      <p className="text-center text-[10px] text-muted-foreground/70">{tx("disclaimer.tool", lang)}</p>
    </motion.div>
    </DoctorShell>
  )
}

function getTimeGreeting(lang: "en" | "tr"): string {
  const h = new Date().getHours()
  if (h < 12) return tx("doctor.greetMorning", lang)
  if (h < 17) return tx("doctor.greetAfternoon", lang)
  return tx("doctor.greetEvening", lang)
}
