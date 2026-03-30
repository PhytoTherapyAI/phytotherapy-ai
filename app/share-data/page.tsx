// © 2026 Phytotherapy.ai — All Rights Reserved
// Share Data (FHIR) — Data Vault with toggle switches + self-destructing links
"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { InnovationShell } from "@/components/innovation/InnovationShell"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { CONSENT_DISCLOSURES, type ConsentPurpose } from "@/lib/consent-management"
import {
  Shield, Lock, Check, ChevronDown, ChevronUp, FileText,
  Stethoscope, Building2, ArrowLeft, Loader2, Clock,
  Fingerprint, CheckCircle, QrCode, Link2,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Data sharing options with value propositions
const SHARE_OPTIONS = [
  {
    purpose: "lab_result_sharing" as ConsentPurpose,
    emoji: "🩸",
    valueEn: "Give your doctor instant access to interpret your blood work and prescribe the right phytotherapy protocol.",
    valueTr: "Doktorunuza kan tahlillerinizi yorumlayıp doğru fitoterapi protokolünü yazması için anlık erişim verin.",
  },
  {
    purpose: "herbal_interaction_analysis" as ConsentPurpose,
    emoji: "💊",
    valueEn: "Enable real-time drug-herb interaction monitoring when your doctor adjusts your medication.",
    valueTr: "Doktorunuz ilacınızı ayarlarken gerçek zamanlı ilaç-bitki etkileşim izlemesini etkinleştirin.",
  },
  {
    purpose: "health_profile_sharing" as ConsentPurpose,
    emoji: "📋",
    valueEn: "Share your complete health profile for a holistic consultation — allergies, conditions, supplements.",
    valueTr: "Bütüncül konsültasyon için tam sağlık profilinizi paylaşın — alerjiler, durumlar, takviyeler.",
  },
]

const EXPIRY_OPTIONS = [
  { value: "24h", labelEn: "24 Hours", labelTr: "24 Saat", desc: { en: "Self-destructs after 24h", tr: "24 saat sonra kendini imha eder" } },
  { value: "7d", labelEn: "7 Days", labelTr: "7 Gün", desc: { en: "Expires in 1 week", tr: "1 haftada sona erer" } },
  { value: "30d", labelEn: "30 Days", labelTr: "30 Gün", desc: { en: "Standard sharing period", tr: "Standart paylaşım süresi" } },
  { value: "until_withdrawn", labelEn: "Until Revoked", labelTr: "İptal Edilene Kadar", desc: { en: "You can revoke anytime", tr: "İstediğiniz zaman iptal edebilirsiniz" } },
]

export default function ShareDataPage() {
  const { user } = useAuth()
  const { lang } = useLang()
  const isTr = lang === "tr"

  // Toggle states for each purpose
  const [toggles, setToggles] = useState<Record<string, boolean>>({})
  const [recipientName, setRecipientName] = useState("")
  const [recipientId, setRecipientId] = useState("")
  const [recipientType, setRecipientType] = useState<"doctor" | "hospital">("doctor")
  const [expiry, setExpiry] = useState("24h")
  const [acknowledged, setAcknowledged] = useState(false)
  const [showLegal, setShowLegal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [signature, setSignature] = useState("")

  const anyEnabled = Object.values(toggles).some(Boolean)
  const enabledPurposes = Object.entries(toggles).filter(([, v]) => v).map(([k]) => k)

  const togglePurpose = (purpose: string) => {
    setToggles(prev => ({ ...prev, [purpose]: !prev[purpose] }))
  }

  const handleSubmit = async () => {
    if (!anyEnabled || !recipientName || !acknowledged) return
    setSubmitting(true)
    try {
      const { createBrowserClient } = await import("@/lib/supabase")
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}) },
        body: JSON.stringify({
          purpose: enabledPurposes[0],
          dataCategories: enabledPurposes,
          recipientId: recipientId || `manual-${Date.now()}`,
          recipientName, recipientType,
          retentionPeriod: expiry,
          layeredDisclosureVersion: "1.0",
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success) { setSignature(data.digitalSignature || ""); setSuccess(true) }
      }
    } catch (err) { console.error(err) }
    setSubmitting(false)
  }

  // ── Success State ──
  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border bg-card p-8 text-center shadow-soft">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40"
            style={{ animation: "scaleIn 0.5s ease-out" }}>
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold mb-2">{isTr ? "Veri Paylaşımı Yetkilendirildi" : "Data Sharing Authorized"}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {isTr ? "Dijital imzalı rıza kaydı oluşturuldu. Verileriniz FHIR protokolü ile güvenli şekilde paylaşılacak." : "Digitally signed consent record created. Your data will be shared securely via FHIR protocol."}
          </p>
          <div className="flex items-center justify-center gap-2 mb-3 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {EXPIRY_OPTIONS.find(e => e.value === expiry)?.[isTr ? "labelTr" : "labelEn"]}
          </div>
          {signature && (
            <div className="p-3 rounded-xl bg-muted/50 mb-4">
              <p className="text-[9px] text-muted-foreground mb-1">{isTr ? "Dijital İmza" : "Digital Signature"}</p>
              <code className="text-[8px] font-mono break-all">{signature}</code>
            </div>
          )}
          <Button onClick={() => { setSuccess(false); setToggles({}); setAcknowledged(false) }} className="w-full rounded-xl">
            {isTr ? "Tamam" : "Done"}
          </Button>
          <style jsx>{`@keyframes scaleIn { from { transform: scale(0); } to { transform: scale(1); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <InnovationShell>
    <div className="mx-auto max-w-lg px-4 py-8">
      <Link href="/profile" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-3.5 h-3.5" />{isTr ? "Geri" : "Back"}
      </Link>

      {/* ── Hero: Data Vault ── */}
      <div className="text-center mb-6">
        <div className="relative mx-auto mb-4">
          <div className="absolute inset-0 rounded-full bg-primary/5 blur-3xl scale-150 mx-auto w-20 h-20" />
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-500/10 border border-primary/20">
            <Shield className="h-9 w-9 text-primary/40" strokeWidth={1.2} />
            <Lock className="absolute -right-1.5 -bottom-1.5 h-6 w-6 text-emerald-500 bg-card rounded-full p-1 border" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">{isTr ? "Veri Kasası" : "Data Vault"}</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
          {isTr ? "Kontrol tamamen sizde. İstediğiniz veriyi, istediğiniz süre paylaşın." : "You're in full control. Share what you want, for as long as you want."}
        </p>
        {/* Trust badge */}
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
          <Shield className="h-3 w-3" />
          {isTr ? "Uçtan Uca Şifreli · FHIR R4 Standardında" : "End-to-End Encrypted · FHIR R4 Standard"}
        </div>
      </div>

      {/* ── Toggle Cards (Granular Control) ── */}
      <div className="space-y-3 mb-5">
        {SHARE_OPTIONS.map(({ purpose, emoji, valueEn, valueTr }) => {
          const disc = CONSENT_DISCLOSURES[purpose]
          const isOn = toggles[purpose] || false
          return (
            <div key={purpose} className={`rounded-2xl border p-4 shadow-soft transition-all ${isOn ? "border-primary/30 bg-primary/5" : "bg-card"}`}>
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{emoji}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold">{disc.title[lang as "en" | "tr"]}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{isTr ? valueTr : valueEn}</p>
                </div>
                {/* iOS-style toggle */}
                <button onClick={() => togglePurpose(purpose)}
                  className={`relative shrink-0 mt-1 h-7 w-12 rounded-full transition-all duration-300 ${
                    isOn ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                  }`}>
                  <div className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-300 ${
                    isOn ? "left-[22px]" : "left-0.5"
                  }`} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Recipient + Expiry (shown when any toggle is on) ── */}
      {anyEnabled && (
        <div className="space-y-4 mb-5" style={{ animation: "slideUp 0.3s ease-out" }}>
          {/* Recipient */}
          <div className="rounded-2xl border bg-card p-4 shadow-soft">
            <h3 className="text-xs font-bold mb-3">{isTr ? "Alıcı" : "Recipient"}</h3>
            <div className="flex gap-2 mb-3">
              {(["doctor", "hospital"] as const).map(type => (
                <button key={type} onClick={() => setRecipientType(type)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                    recipientType === type ? "border-primary bg-primary/10 text-primary" : ""
                  }`}>
                  {type === "doctor" ? <Stethoscope className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                  {type === "doctor" ? (isTr ? "Doktor" : "Doctor") : (isTr ? "Hastane" : "Hospital")}
                </button>
              ))}
            </div>
            <Input placeholder={isTr ? "Doktor veya kurum adı" : "Doctor or institution name"}
              value={recipientName} onChange={e => setRecipientName(e.target.value)} className="mb-2 rounded-xl" />
            <Input placeholder={isTr ? "ID veya kod (opsiyonel)" : "ID or code (optional)"}
              value={recipientId} onChange={e => setRecipientId(e.target.value)} className="rounded-xl" />
          </div>

          {/* Expiry — self-destruct timer */}
          <div className="rounded-2xl border bg-card p-4 shadow-soft">
            <h3 className="text-xs font-bold mb-2 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              {isTr ? "Bağlantı Süresi" : "Link Expiry"}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {EXPIRY_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setExpiry(opt.value)}
                  className={`rounded-xl border p-2.5 text-left transition-all ${
                    expiry === opt.value ? "border-primary bg-primary/5" : "hover:border-primary/30"
                  }`}>
                  <p className="text-xs font-bold">{isTr ? opt.labelTr : opt.labelEn}</p>
                  <p className="text-[9px] text-muted-foreground">{opt.desc[lang as "en" | "tr"]}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Legal text */}
          <button onClick={() => setShowLegal(!showLegal)}
            className="flex w-full items-center justify-between rounded-2xl border bg-card p-3 text-xs shadow-soft">
            <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" />{isTr ? "Yasal metni oku" : "Read legal text"}</span>
            {showLegal ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {showLegal && (
            <div className="rounded-xl bg-muted/30 p-3 text-[10px] text-muted-foreground leading-relaxed">
              {CONSENT_DISCLOSURES[enabledPurposes[0] as ConsentPurpose]?.details[lang as "en" | "tr"] || ""}
            </div>
          )}

          {/* Acknowledgment */}
          <button onClick={() => setAcknowledged(!acknowledged)}
            className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition-all ${
              acknowledged ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/10" : "border-border"
            }`}>
            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
              acknowledged ? "border-emerald-500 bg-emerald-500 text-white" : "border-gray-300"
            }`}>
              {acknowledged && <Check className="h-3 w-3" />}
            </div>
            <span className="text-xs">{isTr ? "Veri paylaşım koşullarını okudum ve anladım" : "I have read and understand the data sharing terms"}</span>
          </button>

          {/* CTA — slides up when ready */}
          <button onClick={handleSubmit}
            disabled={!acknowledged || !recipientName || submitting}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-40">
            {submitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" />{isTr ? "Oluşturuluyor..." : "Creating..."}</>
            ) : (
              <><Lock className="h-4 w-4" />{isTr ? "Güvenli Link Oluştur" : "Create Secure Link"}</>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-[9px] text-muted-foreground">
            <Lock className="h-2.5 w-2.5" />
            KVKK m.6/1 · TLS 1.3 · AES-256 · FHIR R4
          </div>
        </div>
      )}

      <style jsx>{`@keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <p className="text-center text-[10px] text-muted-foreground/40 mt-6">{tx("disclaimer.tool", lang)}</p>
    </div>
    </InnovationShell>
  )
}
