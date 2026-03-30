"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { tx } from "@/lib/translations"
import { CONSENT_DISCLOSURES, type ConsentPurpose } from "@/lib/consent-management"
import {
  Share2, Shield, Lock, Check, ChevronDown, ChevronUp, FileText,
  Stethoscope, Building2, ArrowLeft, Loader2, AlertTriangle, Clock,
  Eye, X, Fingerprint, CheckCircle,
} from "lucide-react"
import Link from "next/link"

export default function ShareDataPage() {
  const { user } = useAuth()
  const { lang } = useLang()
  const [selectedPurpose, setSelectedPurpose] = useState<ConsentPurpose | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [recipientId, setRecipientId] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [recipientType, setRecipientType] = useState<"doctor" | "hospital">("doctor")
  const [retention, setRetention] = useState("")
  const [showFullText, setShowFullText] = useState(false)
  const [acknowledged, setAcknowledged] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [signature, setSignature] = useState("")

  const disclosure = selectedPurpose ? CONSENT_DISCLOSURES[selectedPurpose] : null

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSubmit = async () => {
    if (!selectedPurpose || !recipientName || !acknowledged || selectedCategories.size === 0) return
    setSubmitting(true)

    try {
      const { createBrowserClient } = await import("@/lib/supabase")
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()

      const res = await fetch("/api/consent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          purpose: selectedPurpose,
          dataCategories: Array.from(selectedCategories),
          recipientId: recipientId || `manual-${Date.now()}`,
          recipientName,
          recipientType,
          retentionPeriod: retention || "until_withdrawn",
          layeredDisclosureVersion: "1.0",
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.success) {
        setSignature(data.digitalSignature || "")
        setSuccess(true)
      }
    } catch (err) {
      console.error("Consent error:", err)
    }

    setSubmitting(false)
  }

  const t = (key: string) => {
    const map: Record<string, Record<string, string>> = {
      title: { en: "Share Health Data", tr: "Sağlık Verisini Paylaş" },
      subtitle: { en: "Securely share your data with your doctor or hospital", tr: "Verilerinizi doktorunuz veya hastanenizle güvenle paylaşın" },
      purpose: { en: "What do you want to share?", tr: "Ne paylaşmak istiyorsunuz?" },
      recipient: { en: "Who are you sharing with?", tr: "Kiminle paylaşıyorsunuz?" },
      doctor: { en: "Doctor", tr: "Doktor" },
      hospital: { en: "Hospital", tr: "Hastane" },
      name: { en: "Name of doctor or institution", tr: "Doktor veya kurum adı" },
      id: { en: "Doctor ID or code (optional)", tr: "Doktor ID veya kodu (opsiyonel)" },
      data_select: { en: "Select data to share", tr: "Paylaşılacak veriyi seçin" },
      retention_label: { en: "How long?", tr: "Ne kadar süreyle?" },
      full_text: { en: "Read full legal text", tr: "Tam yasal metni oku" },
      hide_text: { en: "Hide full text", tr: "Tam metni gizle" },
      acknowledge: { en: "I have read and understand the data sharing terms", tr: "Veri paylaşım koşullarını okudum ve anladım" },
      share: { en: "Share My Data", tr: "Verilerimi Paylaş" },
      sharing: { en: "Creating consent record...", tr: "Rıza kaydı oluşturuluyor..." },
      success_title: { en: "Data Sharing Authorized", tr: "Veri Paylaşımı Yetkilendirildi" },
      success_msg: { en: "A digitally signed consent record has been created. Your data will be shared securely via FHIR protocol.", tr: "Dijital olarak imzalanmış bir rıza kaydı oluşturuldu. Verileriniz FHIR protokolü ile güvenli şekilde paylaşılacak." },
      signature: { en: "Digital Signature", tr: "Dijital İmza" },
      done: { en: "Done", tr: "Tamam" },
      back: { en: "Back", tr: "Geri" },
    }
    return map[key]?.[lang] || key
  }

  // ── Success State ──
  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">{t("success_title")}</h2>
          <p className="text-sm text-muted-foreground mb-4">{t("success_msg")}</p>
          {signature && (
            <div className="p-3 rounded-lg bg-muted/50 mb-4">
              <p className="text-[10px] text-muted-foreground mb-1">{t("signature")}</p>
              <code className="text-[9px] font-mono text-foreground break-all">{signature}</code>
            </div>
          )}
          <div className="flex items-center justify-center gap-2 mb-4 text-xs text-muted-foreground">
            <Fingerprint className="w-4 h-4 text-primary" />
            <span>SHA-256 {tx("shareData.signedConsent", lang)}</span>
          </div>
          <Button onClick={() => { setSuccess(false); setSelectedPurpose(null); setAcknowledged(false); setSelectedCategories(new Set()) }} className="w-full">
            {t("done")}
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 md:px-8 py-8">
        <Link href="/profile" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />{t("back")}
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Share2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>

        {/* Step 1: Purpose */}
        <Card className="p-5 mb-4">
          <h3 className="font-semibold text-sm mb-3">{t("purpose")}</h3>
          <div className="space-y-2">
            {(["lab_result_sharing", "herbal_interaction_analysis", "health_profile_sharing"] as ConsentPurpose[]).map(purpose => {
              const disc = CONSENT_DISCLOSURES[purpose]
              const isActive = selectedPurpose === purpose
              return (
                <button key={purpose} onClick={() => { setSelectedPurpose(purpose); setSelectedCategories(new Set()) }}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${isActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                  <p className="text-sm font-medium">{disc.title[lang as "en" | "tr"]}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{disc.summary[lang as "en" | "tr"]}</p>
                </button>
              )
            })}
          </div>
        </Card>

        {selectedPurpose && disclosure && (
          <>
            {/* Step 2: Recipient */}
            <Card className="p-5 mb-4">
              <h3 className="font-semibold text-sm mb-3">{t("recipient")}</h3>
              <div className="flex gap-2 mb-3">
                <Button size="sm" variant={recipientType === "doctor" ? "default" : "outline"} onClick={() => setRecipientType("doctor")} className="gap-1">
                  <Stethoscope className="w-3.5 h-3.5" />{t("doctor")}
                </Button>
                <Button size="sm" variant={recipientType === "hospital" ? "default" : "outline"} onClick={() => setRecipientType("hospital")} className="gap-1">
                  <Building2 className="w-3.5 h-3.5" />{t("hospital")}
                </Button>
              </div>
              <Input placeholder={t("name")} value={recipientName} onChange={e => setRecipientName(e.target.value)} className="mb-2" />
              <Input placeholder={t("id")} value={recipientId} onChange={e => setRecipientId(e.target.value)} />
            </Card>

            {/* Step 3: Data categories */}
            <Card className="p-5 mb-4">
              <h3 className="font-semibold text-sm mb-3">{t("data_select")}</h3>
              <div className="space-y-2">
                {disclosure.dataCategories.map(cat => (
                  <button key={cat.id} onClick={() => toggleCategory(cat.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${selectedCategories.has(cat.id) ? "border-primary bg-primary/5" : "border-border"}`}>
                    <div className={`w-5 h-5 rounded flex items-center justify-center ${selectedCategories.has(cat.id) ? "bg-primary text-white" : "bg-muted"}`}>
                      {selectedCategories.has(cat.id) && <Check className="w-3 h-3" />}
                    </div>
                    <span className="text-sm">{cat.label[lang as "en" | "tr"]}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Step 4: Retention */}
            <Card className="p-5 mb-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Clock className="w-4 h-4" />{t("retention_label")}</h3>
              <div className="flex flex-wrap gap-2">
                {disclosure.retentionOptions.map(opt => (
                  <button key={opt.value} onClick={() => setRetention(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${retention === opt.value ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/30"}`}>
                    {opt.label[lang as "en" | "tr"]}
                  </button>
                ))}
              </div>
            </Card>

            {/* Legal text */}
            <Card className="p-5 mb-4">
              <button onClick={() => setShowFullText(!showFullText)} className="w-full flex items-center justify-between text-sm">
                <span className="flex items-center gap-2"><FileText className="w-4 h-4" />{showFullText ? t("hide_text") : t("full_text")}</span>
                {showFullText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showFullText && (
                <div className="mt-3 p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                  {disclosure.details[lang as "en" | "tr"]}
                </div>
              )}
            </Card>

            {/* Acknowledgment */}
            <button onClick={() => setAcknowledged(!acknowledged)}
              className="w-full flex items-center gap-3 p-4 rounded-lg border-2 mb-4 transition-all text-left"
              style={{ borderColor: acknowledged ? "#22C55E" : undefined }}>
              <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${acknowledged ? "bg-green-500 text-white" : "bg-muted"}`}>
                {acknowledged && <Check className="w-3 h-3" />}
              </div>
              <span className="text-sm">{t("acknowledge")}</span>
            </button>

            {/* Submit */}
            <Button className="w-full h-12 text-base gap-2" disabled={!acknowledged || !recipientName || selectedCategories.size === 0 || submitting}
              onClick={handleSubmit}>
              {submitting ? <><Loader2 className="w-5 h-5 animate-spin" />{t("sharing")}</> : <><Shield className="w-5 h-5" />{t("share")}</>}
            </Button>

            <div className="flex items-center justify-center gap-2 mt-3 text-[10px] text-muted-foreground">
              <Lock className="w-3 h-3" />
              <span>KVKK m.6/1 · TLS 1.3 · AES-256 · FHIR R4</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
