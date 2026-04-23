// © 2026 DoctoPal — All Rights Reserved
//
// F-PROFILE-001 Commit 3: Reproductive Health tab — minimal cut.
// Only the two boolean flags (is_pregnant + is_breastfeeding) for now;
// menstrual cycle + contraception + hormone profile arrive in a later
// sprint after a schema migration. Sidebar already gender-gates the
// tab (`gender !== "male"` in ProfileSidebar) but the URL is still
// keyboard-typeable, so the tab itself ALSO checks gender and silently
// redirects male profiles back to ?tab=genel — defence in depth.
//
// Note: pregnancy + breastfeeding ALSO live in MedicalHistoryTab's
// "Kritik Durumlar" block. Two edit points are intentional — clinicians
// expect repro flags here, the safety matrix needs them in the medical
// history. They share the same user_profiles columns + 800 ms debounce,
// so a save here is canonical the moment the next mount hydrates.
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Loader2, Check, AlertCircle, Baby, Info } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase"
import { Checkbox } from "@/components/ui/checkbox"

interface ReproductiveTabProps {
  lang: "tr" | "en"
  userId: string
  gender?: string | null
  profile: {
    is_pregnant?: boolean | null
    is_breastfeeding?: boolean | null
  } | null
  onSaved?: () => void
}

export function ReproductiveTab({ lang, userId, gender, profile, onSaved }: ReproductiveTabProps) {
  const tr = lang === "tr"
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Defence in depth: sidebar hides the tab for male profiles, but the
  // URL ?tab=ureme is still keyboard-typeable. We render a neutral
  // "this tab covers pregnancy / breastfeeding" message and silently
  // redirect to ?tab=genel after a short pause so the user isn't
  // confused by an empty-looking screen.
  const isMale = gender === "male"
  useEffect(() => {
    if (!isMale) return
    const next = new URLSearchParams(searchParams.toString())
    next.set("tab", "genel")
    const t = setTimeout(() => {
      router.replace(`${pathname}?${next.toString()}`, { scroll: false })
    }, 1500)
    return () => clearTimeout(t)
  }, [isMale, pathname, router, searchParams])

  const [flags, setFlags] = useState({
    is_pregnant: !!profile?.is_pregnant,
    is_breastfeeding: !!profile?.is_breastfeeding,
  })
  const lastIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (!profile) return
    if (lastIdRef.current === userId) return
    lastIdRef.current = userId
    setFlags({
      is_pregnant: !!profile.is_pregnant,
      is_breastfeeding: !!profile.is_breastfeeding,
    })
  }, [userId, profile])

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleSave = useCallback(
    (next: { is_pregnant: boolean; is_breastfeeding: boolean }) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(async () => {
        setSaveStatus("saving")
        try {
          const supabase = createBrowserClient()
          const { error } = await supabase
            .from("user_profiles")
            .update({
              is_pregnant: next.is_pregnant,
              is_breastfeeding: next.is_breastfeeding,
            })
            .eq("id", userId)
          if (error) throw error
          setSaveStatus("saved")
          onSaved?.()
          setTimeout(() => setSaveStatus("idle"), 1500)
        } catch {
          setSaveStatus("error")
          setTimeout(() => setSaveStatus("idle"), 3000)
        }
      }, 800)
    },
    [userId, onSaved],
  )

  useEffect(() => () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
  }, [])

  const toggleFlag = (key: "is_pregnant" | "is_breastfeeding", value: boolean) => {
    setFlags((prev) => {
      const next = { ...prev, [key]: value }
      scheduleSave(next)
      return next
    })
  }

  // ── Male profile soft redirect (URL trick fallback) ────────────
  if (isMale) {
    return (
      <section className="mx-auto max-w-md py-10 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Baby className="h-5 w-5" />
        </div>
        <h2 className="font-heading text-lg font-bold mb-2">
          {tr ? "Üreme Sağlığı" : "Reproductive Health"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {tr
            ? "Bu sekme hamilelik ve emzirme bilgisi içindir. Ana sayfaya yönlendiriliyorsun…"
            : "This tab covers pregnancy and breastfeeding. Redirecting to the main tab…"}
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{tr ? "Üreme Sağlığı" : "Reproductive Health"}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {tr
              ? "Hamilelik ve emzirme durumu. Bu bilgiler ilaç güvenlik taramasında otomatik olarak kullanılır."
              : "Pregnancy and breastfeeding status. Used automatically in the medication safety matrix."}
          </p>
        </div>
        <SaveStatusChip status={saveStatus} lang={lang} />
      </div>

      {/* Flags */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <FlagRow
            id="rep-pregnant"
            checked={flags.is_pregnant}
            label={tr ? "Hamilelik" : "Pregnancy"}
            onChange={(v) => toggleFlag("is_pregnant", v)}
          />
          <FlagRow
            id="rep-breastfeeding"
            checked={flags.is_breastfeeding}
            label={tr ? "Emzirme" : "Breastfeeding"}
            onChange={(v) => toggleFlag("is_breastfeeding", v)}
          />
        </div>
      </div>

      {/* "Yakında burada" info card. Same surface, different content
          than PlaceholderTab — placeholder is "this tab is being
          built", this is "more is coming on top of what's here". */}
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
            <Info className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">
              {tr ? "Yakında genişletilecek" : "Expanding soon"}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
              {tr
                ? "Yakında burada adet döngüsü takibi, kontraseptif kayıtları ve hormon profili yönetimi yer alacak. Şu an temel üreme sağlığı bilgilerini Tıbbi Geçmiş altında da bulabilirsin."
                : "Menstrual cycle tracking, contraception records, and hormonal profile management arrive here soon. For now, the same flags also live under Medical History."}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function FlagRow({
  id, checked, label, onChange,
}: { id: string; checked: boolean; label: string; onChange: (v: boolean) => void }) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-2.5 cursor-pointer hover:bg-muted/40 transition-colors"
    >
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(v === true)} />
      <span className="text-sm font-medium">{label}</span>
    </label>
  )
}

function SaveStatusChip({ status, lang }: { status: "idle" | "saving" | "saved" | "error"; lang: "tr" | "en" }) {
  const tr = lang === "tr"
  if (status === "idle") return null
  if (status === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
        <Loader2 className="h-3 w-3 animate-spin" />
        {tr ? "Kaydediliyor…" : "Saving…"}
      </span>
    )
  }
  if (status === "saved") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
        <Check className="h-3 w-3" />
        {tr ? "Kaydedildi" : "Saved"}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 whitespace-nowrap">
      <AlertCircle className="h-3 w-3" />
      {tr ? "Hata" : "Error"}
    </span>
  )
}
