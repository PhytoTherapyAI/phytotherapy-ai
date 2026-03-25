"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import {
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserPlus,
} from "lucide-react"

export default function DoctorJoinPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <DoctorJoinContent />
    </Suspense>
  )
}

function DoctorJoinContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { lang } = useLang()
  const [status, setStatus] = useState<"loading" | "ready" | "joining" | "success" | "error" | "invalid">("loading")
  const [errorMsg, setErrorMsg] = useState("")
  const [manualCode, setManualCode] = useState("")

  const code = searchParams.get("code") || ""

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/auth/login?redirect=/doctor/join?code=${code}`)
      return
    }
    if (!isLoading && isAuthenticated) {
      setStatus(code ? "ready" : "ready")
    }
  }, [isLoading, isAuthenticated, router, code])

  const joinDoctor = async (inviteCode: string) => {
    if (!user || !inviteCode.trim()) return
    setStatus("joining")
    setErrorMsg("")

    try {
      const supabase = createBrowserClient()

      // Find the pending invite
      const { data: invite, error: findErr } = await supabase
        .from("doctor_patients")
        .select("*")
        .eq("invite_code", inviteCode.trim())
        .eq("status", "pending")
        .single()

      if (findErr || !invite) {
        setStatus("invalid")
        setErrorMsg(tx("doctor.invalidCode", lang))
        return
      }

      // Check not joining own invite
      if (invite.doctor_id === user.id) {
        setStatus("error")
        setErrorMsg(tx("doctor.cantJoinSelf", lang))
        return
      }

      // Update the invite with patient's real ID
      const { error: updateErr } = await supabase
        .from("doctor_patients")
        .update({
          patient_id: user.id,
          status: "active",
        })
        .eq("id", invite.id)

      if (updateErr) {
        setStatus("error")
        setErrorMsg(tx("doctor.joinError", lang))
        return
      }

      setStatus("success")
      setTimeout(() => router.push("/dashboard"), 3000)
    } catch {
      setStatus("error")
      setErrorMsg(tx("doctor.joinError", lang))
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border bg-card p-8 text-center">
        <Stethoscope className="mx-auto mb-4 h-12 w-12 text-primary" />
        <h1 className="font-heading text-2xl font-semibold">
          {tx("doctor.joinTitle", lang)}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {tx("doctor.joinDesc", lang)}
        </p>

        {status === "success" ? (
          <div className="mt-6 flex flex-col items-center gap-2">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
            <p className="font-medium text-green-600">{tx("doctor.joinSuccess", lang)}</p>
          </div>
        ) : status === "invalid" || status === "error" ? (
          <div className="mt-6">
            <div className="flex items-center justify-center gap-2 text-red-500">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">{errorMsg}</p>
            </div>
            <button
              onClick={() => setStatus("ready")}
              className="mt-4 text-sm text-primary underline"
            >
              {tx("doctor.tryAgain", lang)}
            </button>
          </div>
        ) : (
          <div className="mt-6">
            {code ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">{tx("doctor.inviteCode", lang)}</p>
                  <p className="text-lg font-mono font-bold">{code}</p>
                </div>
                <button
                  onClick={() => joinDoctor(code)}
                  disabled={status === "joining"}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {status === "joining" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  {tx("doctor.acceptInvite", lang)}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder={tx("doctor.enterCode", lang)}
                  className="w-full rounded-lg border bg-background px-4 py-2.5 text-center font-mono text-sm outline-none focus:border-primary"
                />
                <button
                  onClick={() => joinDoctor(manualCode)}
                  disabled={!manualCode.trim() || status === "joining"}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {status === "joining" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  {tx("doctor.acceptInvite", lang)}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
