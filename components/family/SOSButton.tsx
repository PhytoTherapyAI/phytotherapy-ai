// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState } from "react"
import { Siren, Loader2 } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase"
import { tx } from "@/lib/translations"
import type { Lang } from "@/lib/translations"

interface Props {
  groupId: string
  targetName: string | null
  lang: Lang
  disabled?: boolean
}

/**
 * Emergency SOS button — renders a red button + confirm modal.
 * Visible on the /profile page when the caller is viewing a family
 * member they have a manage role for. Tapping broadcasts a type=emergency
 * notification to every other accepted member of the same group.
 */
export function SOSButton({ groupId, targetName, lang, disabled }: Props) {
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const tr = lang === "tr"

  async function handleSend() {
    setSending(true)
    setErrorMsg(null)
    try {
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setErrorMsg(tr ? "Oturum bulunamadı" : "Session not found")
        setSending(false)
        return
      }

      const message = targetName
        ? (tr
          ? `🚨 ${targetName} için acil durum bildirimi`
          : `🚨 Emergency alert for ${targetName}`)
        : (tr ? "🚨 Acil durum bildirimi" : "🚨 Emergency alert")

      const res = await fetch("/api/family/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          groupId,
          type: "emergency",
          message,
          broadcast: true,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErrorMsg(data.error || (tr ? "Gönderilemedi" : "Failed to send"))
        setSending(false)
        return
      }

      setSent(true)
      setTimeout(() => {
        setOpen(false)
        setSent(false)
      }, 2500)
    } catch {
      setErrorMsg(tr ? "Sunucu hatası" : "Server error")
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-bold text-white shadow-md transition-colors"
        aria-label={tx("family.sosButton", lang)}
      >
        <Siren className="h-4 w-4" />
        {tx("family.sosButton", lang)}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => !sending && !sent && setOpen(false)}
        >
          <div
            className="bg-card border border-red-300 dark:border-red-700 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
              <Siren className="h-8 w-8 text-red-600 dark:text-red-400 animate-pulse" />
            </div>

            {sent ? (
              <>
                <h3 className="text-lg font-bold mb-2 text-foreground">
                  {tx("family.sosSent", lang)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {tr ? "Tüm hane üyelerine bildirildi" : "All household members notified"}
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold mb-2 text-foreground">
                  {tx("family.sosButton", lang)}
                </h3>
                <p className="text-sm text-muted-foreground mb-5">
                  {tx("family.sosConfirm", lang)}
                </p>
                {errorMsg && (
                  <p className="text-sm text-red-600 dark:text-red-400 mb-3">{errorMsg}</p>
                )}
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={sending}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 px-4 py-2.5 text-sm font-bold text-white transition-colors"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Siren className="h-4 w-4" />}
                    {sending
                      ? (tr ? "Gönderiliyor..." : "Sending...")
                      : (tr ? "Evet, SOS Gönder" : "Yes, Send SOS")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={sending}
                    className="text-muted-foreground hover:text-foreground text-sm py-2"
                  >
                    {tr ? "Vazgeç" : "Cancel"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
