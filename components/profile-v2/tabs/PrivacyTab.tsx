// © 2026 DoctoPal — All Rights Reserved
//
// F-PROFILE-001 Commit 4: Privacy & Consent tab.
//
// Three blocks stacked:
//   1. <PrivacySettings /> (from components/profile/) — full 4-consent
//      toggle UI + ConsentPopup + AydinlatmaPopup. Reused verbatim.
//   2. "Verilerimi İndir" Card — GET /api/user-data → JSON blob download.
//      KVKK Md.11 access right. Honouring the "Silmeden önce indir"
//      secondary CTA from the delete modal opens this flow in a new
//      tab so the delete confirmation modal stays open underneath.
//   3. "Hesabımı Sil" Card — red-border warning block + button that
//      opens a confirmation modal. Modal requires the user's own
//      name-initials (TR-locale upper-cased) typed in + a checkbox +
//      a 5-second countdown before the destructive button goes live.
//      DELETE /api/user-data + supabase.auth.signOut() + redirect.
//
// DELETE endpoint audit (Session 45 Commit 4): auth-isolated, service
// role admin privilege, schema CASCADE + endpoint manual hybrid cleanup.
// Two follow-ups (F-PRIVACY-001 / 002) tracked for Session 46.
"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Download, Trash2, AlertTriangle, Loader2, Shield, X, ExternalLink } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { PrivacySettings } from "@/components/profile/PrivacySettings"

interface PrivacyTabProps {
  lang: "tr" | "en"
  patientName: string | null
}

/**
 * TR-locale aware initials: "Taha Ahmet Sıbıç" → "TAS",
 * "fatma özdemir" → "FÖ". Lowercase "i" becomes dotted "İ" correctly
 * via toLocaleUpperCase("tr-TR"). Filters out empty tokens + very
 * short strings (single punctuation / emoji).
 */
function computeInitials(name: string | null | undefined): string {
  if (!name) return ""
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toLocaleUpperCase("tr-TR"))
    .join("")
}

export function PrivacyTab({ lang, patientName }: PrivacyTabProps) {
  const tr = lang === "tr"
  const router = useRouter()
  const initials = useMemo(() => computeInitials(patientName), [patientName])

  // ── Delete flow ────────────────────────────────────────────────
  // Export flow lives at /data-export (separate page, richer UX with
  // category picker + estimated file size). The PrivacyTab Download
  // card and the delete-modal "indir önce" CTA both link there.
  // Inline JSON download was the original plan; F-PRIVACY-003 (P3)
  // tracks an optional one-click ZIP+JSON inline alternative.
  const [modalOpen, setModalOpen] = useState(false)
  const [typedInitials, setTypedInitials] = useState("")
  const [acknowledged, setAcknowledged] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(5)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Countdown runs only while modal is open. Reset to 5 every time
  // the modal opens so a close/reopen cycle gives a fresh grace period.
  useEffect(() => {
    if (!modalOpen) return
    setSecondsLeft(5)
    const interval = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [modalOpen])

  const openModal = () => {
    setTypedInitials("")
    setAcknowledged(false)
    setDeleteError(null)
    setModalOpen(true)
  }
  const closeModal = () => {
    if (deleting) return
    setModalOpen(false)
  }

  const initialsMatch =
    initials.length > 0
    && typedInitials.trim().toLocaleUpperCase("tr-TR") === initials

  const canConfirmDelete = initialsMatch && acknowledged && secondsLeft === 0 && !deleting

  const confirmDelete = async () => {
    if (!canConfirmDelete) return
    setDeleting(true)
    setDeleteError(null)
    try {
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error("no_session")
      const res = await fetch("/api/user-data", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `http_${res.status}`)
      }
      // Sign out locally + redirect. Server already nuked the auth row;
      // signOut() just clears the client-side session + local storage.
      await supabase.auth.signOut().catch(() => { /* already gone */ })
      if (typeof window !== "undefined") {
        // Toast via query string — landing / login route reads it.
        window.location.href = "/?deleted=1"
      }
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "unknown")
      setDeleting(false)
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">{tr ? "Gizlilik & Rıza" : "Privacy & Consent"}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {tr
            ? "KVKK kapsamında verilerini nasıl işlediğimizi yönet. Rızalarını istediğin zaman değiştirebilir, verilerini indirebilir veya hesabını kalıcı silebilirsin."
            : "Manage how we handle your data under KVKK. Update consents any time, download your data, or permanently delete your account."}
        </p>
      </div>

      {/* Consent management — existing component */}
      <PrivacySettings />

      {/* Data export — redirects to the richer /data-export page
          (category filters + estimated file size) instead of an
          inline blob download. The blob fallback was the original
          plan but the standalone page already does more, so we
          point the user there and let the dedicated UI lead.
          Inline quick-export is tracked as F-PRIVACY-003 (P3). */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400">
            <Download className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold">{tr ? "Veri İndirme Merkezi" : "Data Download Center"}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
              {tr
                ? "Veri kategorilerini seç ve indir. KVKK Md.11 erişim hakkı kapsamında ücretsiz. İlaçlar, alerjiler, aile öyküsü, tahlil geçmişi gibi veri kategorilerini ayrı ayrı filtreleyip JSON dosyası olarak indirebilirsin."
                : "Pick the data categories and download them. Free under KVKK Art.11 right of access. Medications, allergies, family history, lab tests — filter each category individually and export as JSON."}
            </p>
          </div>
        </div>
        <Link
          href="/data-export"
          className="inline-flex items-center gap-1.5 rounded-md bg-foreground text-background px-3 py-1.5 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          {tr ? "Veri İndirme Merkezine Git" : "Open Data Download Center"}
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
        <p className="mt-2 text-[11px] italic text-muted-foreground">
          {tr
            ? "Ayrı sayfada kategori seçimi ve dosya boyutu bilgisi gösterilir."
            : "The dedicated page shows category picker + estimated file size."}
        </p>
      </div>

      {/* Danger zone — account deletion */}
      <div className="rounded-2xl border-2 border-red-200 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/10 p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">
              {tr ? "Tehlikeli Bölge — Hesabımı Sil" : "Danger Zone — Delete Account"}
            </h3>
            <p className="text-xs text-red-800/80 dark:text-red-300/80 leading-relaxed mt-0.5">
              {tr
                ? "Hesabını ve tüm sağlık verilerini kalıcı olarak siler (KVKK Md.7 silme hakkı). Bu işlem GERİ ALINAMAZ."
                : "Permanently deletes your account and all health data (KVKK Art.7 right to erasure). This CANNOT be undone."}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={openModal}
          className="gap-1.5 border-red-300 text-red-700 hover:bg-red-100 hover:text-red-800 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {tr ? "Hesabımı Sil" : "Delete My Account"}
        </Button>
      </div>

      {/* Delete confirmation modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-card w-full max-w-md rounded-2xl shadow-2xl border-2 border-red-300 dark:border-red-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 pt-5 pb-3 relative">
              <button
                type="button"
                onClick={closeModal}
                disabled={deleting}
                className="absolute top-3 right-3 h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-40"
                aria-label={tr ? "Kapat" : "Close"}
              >
                <X className="h-4 w-4" />
              </button>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400">
                <Shield className="h-6 w-6" />
              </div>
              <h2 className="text-center text-lg font-bold">
                {patientName ? (
                  tr
                    ? <><strong>{patientName}</strong> hesabını silmek üzeresin</>
                    : <>You're about to delete <strong>{patientName}</strong>'s account</>
                ) : (tr ? "Hesabını silmek üzeresin" : "You're about to delete your account")}
              </h2>
              <p className="mt-2 text-center text-sm text-muted-foreground leading-relaxed">
                {tr
                  ? "Tüm sağlık verilerin (ilaçlar, alerjiler, aile öyküsü, tahlil, etkileşim uyarıları) kalıcı olarak silinecek. Bu işlem geri alınamaz."
                  : "All your health data (medications, allergies, family history, lab tests, interaction alerts) will be permanently erased. This cannot be undone."}
              </p>
            </div>

            {/* Export prompt — opens /data-export in a new tab so the
                modal stays open underneath. The user can grab their
                JSON in the new tab, return here, and the countdown
                state + initials input + checkbox are all preserved
                exactly where they left off. No accidental close,
                no countdown reset. */}
            <div className="mx-5 mb-4 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2.5">
              <Link
                href="/data-export"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-between gap-2 text-xs font-medium text-emerald-800 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-200"
              >
                <span className="flex items-center gap-1.5">
                  <Download className="h-3.5 w-3.5" />
                  {tr ? "Silmeden önce verilerini JSON olarak indir" : "Download your data first"}
                </span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            <div className="px-5 space-y-3 pb-3">
              <div>
                <Label htmlFor="initials" className="text-xs font-semibold">
                  {tr
                    ? <>Silmek için kendi isim baş harflerini yaz: <strong className="text-red-700 dark:text-red-400">{initials || "—"}</strong></>
                    : <>Type your name initials to confirm: <strong className="text-red-700 dark:text-red-400">{initials || "—"}</strong></>}
                </Label>
                <Input
                  id="initials"
                  value={typedInitials}
                  onChange={(e) => setTypedInitials(e.target.value)}
                  placeholder={initials || (tr ? "Örn. TAS" : "e.g. TAS")}
                  className={`h-9 mt-1 ${
                    typedInitials.length > 0 && !initialsMatch
                      ? "border-red-300 focus-visible:ring-red-300"
                      : ""
                  }`}
                  disabled={deleting}
                  autoComplete="off"
                />
                {typedInitials.length > 0 && !initialsMatch && (
                  <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
                    {tr ? "Baş harfler eşleşmiyor" : "Initials don't match"}
                  </p>
                )}
              </div>

              <label className="flex items-start gap-2 cursor-pointer select-none">
                <Checkbox
                  checked={acknowledged}
                  onCheckedChange={(v) => setAcknowledged(v === true)}
                  disabled={deleting}
                  className="mt-0.5"
                />
                <span className="text-xs leading-relaxed">
                  {tr
                    ? "Bu işlemi anladım ve onaylıyorum. Verilerimin geri getirilemeyeceğini biliyorum."
                    : "I understand and confirm. I know my data cannot be recovered."}
                </span>
              </label>
            </div>

            {deleteError && (
              <div className="mx-5 mb-3 rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/20 p-2.5 text-xs text-red-800 dark:text-red-300">
                {tr
                  ? "Silme başarısız. Birkaç saniye sonra tekrar dene."
                  : "Delete failed. Please try again in a few seconds."}
              </div>
            )}

            <div className="px-5 pb-5 flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={closeModal}
                disabled={deleting}
                className="flex-1"
              >
                {tr ? "İptal" : "Cancel"}
              </Button>
              <Button
                onClick={confirmDelete}
                disabled={!canConfirmDelete}
                className="flex-1 gap-1.5 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                {deleting
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Trash2 className="h-3.5 w-3.5" />}
                {secondsLeft > 0
                  ? (tr ? `Hesabımı Sil (${secondsLeft}s)` : `Delete My Account (${secondsLeft}s)`)
                  : (tr ? "Hesabımı Sil" : "Delete My Account")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Legal info footer — links to detailed documents */}
      <div className="text-center pt-2">
        <p className="text-[11px] text-muted-foreground">
          {tr
            ? <>Detaylı aydınlatma: <Link href="/aydinlatma" className="underline hover:text-foreground">KVKK Aydınlatma Metni</Link> · <Link href="/terms" className="underline hover:text-foreground">Kullanım Koşulları</Link></>
            : <>Full disclosure: <Link href="/aydinlatma" className="underline hover:text-foreground">KVKK Disclosure</Link> · <Link href="/terms" className="underline hover:text-foreground">Terms</Link></>}
        </p>
      </div>
    </section>
  )
}
