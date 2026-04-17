// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Users, Loader2, AlertCircle, Check } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useFamily } from "@/lib/family-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"

const CODE_LENGTH = 6

export default function JoinFamilyPage() {
  const router = useRouter()
  const { user, isLoading: authLoading, session } = useAuth()
  const { refetch } = useFamily()
  const { lang } = useLang()
  const tr = lang === "tr"

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""))
  const [validating, setValidating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewGroup, setPreviewGroup] = useState<{ groupName: string; inviterName: string } | null>(null)
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/auth/login?redirect=/family/join`)
    }
  }, [authLoading, user, router])

  const code = digits.join("")
  const codeComplete = code.length === CODE_LENGTH

  // Auto-validate when all 6 digits entered
  useEffect(() => {
    if (!codeComplete) {
      setPreviewGroup(null)
      setError(null)
      return
    }
    let cancelled = false
    async function validate() {
      setValidating(true)
      setError(null)
      try {
        const res = await fetch(`/api/family/invite-code?code=${encodeURIComponent(code)}`)
        const data = await res.json()
        if (cancelled) return
        if (data.valid) {
          setPreviewGroup({ groupName: data.groupName, inviterName: data.inviterName })
        } else {
          const reasonMap: Record<string, string> = {
            expired: tr ? "Bu kodun süresi dolmuş." : "This code has expired.",
            used: tr ? "Bu kod zaten kullanılmış." : "This code has already been used.",
            not_found: tr ? "Geçersiz kod." : "Invalid code.",
          }
          setError(reasonMap[data.reason] || (tr ? "Geçersiz kod." : "Invalid code."))
          setPreviewGroup(null)
        }
      } catch {
        if (!cancelled) setError(tr ? "Kod doğrulanamadı." : "Could not validate code.")
      } finally {
        if (!cancelled) setValidating(false)
      }
    }
    validate()
    return () => { cancelled = true }
  }, [code, codeComplete, tr])

  function handleDigitChange(index: number, value: string) {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 1)
    const next = [...digits]
    next[index] = clean
    setDigits(next)
    // Auto-advance
    if (clean && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, CODE_LENGTH)
    if (!pasted) return
    const next = Array(CODE_LENGTH).fill("")
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]
    setDigits(next)
    const focusIdx = Math.min(pasted.length, CODE_LENGTH - 1)
    inputsRef.current[focusIdx]?.focus()
  }

  async function handleJoin() {
    if (!session?.access_token) {
      router.push("/auth/login?redirect=/family/join")
      return
    }
    setJoining(true)
    setError(null)
    try {
      const res = await fetch("/api/family/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || (tr ? "Gruba katılınamadı." : "Failed to join group."))
        setJoining(false)
        return
      }
      await refetch?.()
      router.push("/select-profile")
    } catch {
      setError(tr ? "Sunucu hatası." : "Server error.")
      setJoining(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary rounded-full border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 to-background dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Users className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {tx("family.joinTitle", lang)}
          </h1>
          <p className="text-muted-foreground text-sm">
            {tx("family.joinSubtitle", lang)}
          </p>
        </div>

        {/* 6-digit code input */}
        <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputsRef.current[i] = el }}
              type="text"
              inputMode="text"
              autoComplete="one-time-code"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-14 text-center text-2xl font-bold font-mono border-2 border-border rounded-xl bg-card text-foreground focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition uppercase"
              aria-label={`Code digit ${i + 1}`}
            />
          ))}
        </div>

        {/* Status area */}
        <div className="min-h-[80px] flex items-center justify-center">
          {validating && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              {tr ? "Kod doğrulanıyor..." : "Validating code..."}
            </div>
          )}

          {error && !validating && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {previewGroup && !validating && !error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 w-full"
            >
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-emerald-900 dark:text-emerald-100">
                    {tr ? "Geçerli kod" : "Valid code"}
                  </p>
                  <p className="text-emerald-700 dark:text-emerald-300 mt-1">
                    <strong>{previewGroup.inviterName}</strong>
                    {tr
                      ? ` tarafından oluşturulan `
                      : ` created an invite to `}
                    <strong>{previewGroup.groupName}</strong>
                    {tr ? " grubu" : ""}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Join button */}
        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={handleJoin}
            disabled={!previewGroup || joining}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {joining ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Users className="h-4 w-4" />
            )}
            {tx("family.joinButton", lang)}
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full border border-border text-muted-foreground font-medium py-2.5 px-6 rounded-xl hover:bg-muted transition-colors"
          >
            {tr ? "Vazgeç" : "Cancel"}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
