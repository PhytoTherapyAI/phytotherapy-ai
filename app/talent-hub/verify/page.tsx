"use client"

import { useState, useRef, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DOCUMENT_TYPES, VERIFICATION_STATUS_CONFIG,
  type VerificationStatus, type VerificationDocument, type DocumentType,
} from "@/lib/talent-hub-data"
import {
  ShieldCheck, Upload, FileText, Image, X, Check, Clock, AlertTriangle,
  ChevronLeft, Loader2, BadgeCheck, ShieldX, ShieldQuestion, Phone,
  Lock, Eye, Sparkles, Building2, GraduationCap,
} from "lucide-react"
import Link from "next/link"

interface UploadedFile {
  id: string
  type: DocumentType
  file: File
  preview?: string
}

const ICON_MAP: Record<string, any> = { BadgeCheck, Clock, ShieldX, ShieldQuestion }

export default function VerifyPage() {
  const { user } = useAuth()
  const { lang } = useLang()
  const [status, setStatus] = useState<VerificationStatus>("unverified")
  const [diplomaNumber, setDiplomaNumber] = useState("")
  const [ttbNumber, setTtbNumber] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dragOver, setDragOver] = useState<string | null>(null)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // Load status from localStorage
  useState(() => {
    try {
      const saved = localStorage.getItem(`verification_${user?.id || "guest"}`)
      if (saved) {
        const data = JSON.parse(saved)
        setStatus(data.status || "unverified")
        setDiplomaNumber(data.diplomaNumber || "")
      }
    } catch {}
  })

  const t = (key: string) => {
    const map: Record<string, Record<string, string>> = {
      title: { en: "Verify Your Professional Profile", tr: "Profesyonel Profilini Doğrula" },
      subtitle: { en: "Complete verification to earn the trusted badge and increase your visibility", tr: "Güvenilir rozeti kazanmak ve görünürlüğünü artırmak için doğrulamayı tamamla" },
      why_title: { en: "Why Get Verified?", tr: "Neden Doğrulanmalısın?" },
      why_1: { en: "Verified badge next to your name — builds instant trust", tr: "İsminin yanında doğrulanmış rozet — anında güven oluşturur" },
      why_2: { en: "Priority placement in search results", tr: "Arama sonuçlarında öncelikli sıralama" },
      why_3: { en: "Access to premium professional features", tr: "Premium profesyonel özelliklere erişim" },
      why_4: { en: "Eligible for clinic & enterprise partnerships", tr: "Klinik ve kurumsal ortaklıklara uygunluk" },
      step1: { en: "Step 1: Diploma Registration", tr: "Adım 1: Diploma Tescil" },
      step1_desc: { en: "Enter your Ministry of Health diploma registration number", tr: "Sağlık Bakanlığı diploma tescil numaranızı girin" },
      step2: { en: "Step 2: Upload Documents", tr: "Adım 2: Belge Yükleme" },
      step2_desc: { en: "Upload at least one supporting document for verification", tr: "Doğrulama için en az bir destekleyici belge yükleyin" },
      drag_drop: { en: "Drag & drop or click to upload", tr: "Sürükle & bırak veya tıklayarak yükle" },
      max_size: { en: "Max 10MB per file. PDF, JPG, PNG accepted.", tr: "Dosya başına maks 10MB. PDF, JPG, PNG kabul edilir." },
      submit: { en: "Submit for Verification", tr: "Doğrulama İçin Gönder" },
      submitting: { en: "Submitting...", tr: "Gönderiliyor..." },
      security: { en: "Your documents are encrypted and only reviewed by our verification team", tr: "Belgeleriniz şifrelidir ve yalnızca doğrulama ekibimiz tarafından incelenir" },
      pending_title: { en: "Verification In Progress", tr: "Doğrulama Devam Ediyor" },
      pending_msg: { en: "Your documents are being reviewed by our team and AI verification system. This typically takes 24-48 hours.", tr: "Belgeleriniz ekibimiz ve AI doğrulama sistemi tarafından inceleniyor. Bu genellikle 24-48 saat sürer." },
      approved_title: { en: "Profile Verified!", tr: "Profil Doğrulandı!" },
      approved_msg: { en: "Congratulations! Your professional credentials have been verified. The verified badge is now visible on your profile.", tr: "Tebrikler! Profesyonel belgeleriniz doğrulandı. Doğrulanmış rozet artık profilinizde görünür." },
      rejected_title: { en: "Verification Unsuccessful", tr: "Doğrulama Başarısız" },
      rejected_msg: { en: "We could not verify your documents. Please check the feedback below and resubmit.", tr: "Belgelerinizi doğrulayamadık. Lütfen aşağıdaki geri bildirimi kontrol edin ve yeniden gönderin." },
      diploma_placeholder: { en: "e.g., 123456", tr: "ör., 123456" },
      ttb_placeholder: { en: "TTB/TEB Registration Number (optional)", tr: "TTB/TEB Sicil Numarası (opsiyonel)" },
      back: { en: "Back to Talent Hub", tr: "Yetenek Ağına Dön" },
    }
    return map[key]?.[lang] || key
  }

  const handleDrop = useCallback((e: React.DragEvent, docType: DocumentType) => {
    e.preventDefault()
    setDragOver(null)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) addFile(files[0], docType)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, docType: string) => {
    e.preventDefault()
    setDragOver(docType)
  }, [])

  const addFile = (file: File, type: DocumentType) => {
    if (file.size > 10 * 1024 * 1024) return // 10MB limit
    const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined
    setUploadedFiles(prev => [...prev.filter(f => f.type !== type), { id: Date.now().toString(), type, file, preview }])
  }

  const removeFile = (type: DocumentType) => {
    setUploadedFiles(prev => prev.filter(f => f.type !== type))
  }

  const handleSubmit = async () => {
    if (!diplomaNumber && uploadedFiles.length === 0) return
    setIsSubmitting(true)
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    setStatus("pending")
    localStorage.setItem(`verification_${user?.id || "guest"}`, JSON.stringify({ status: "pending", diplomaNumber, submittedAt: new Date().toISOString() }))
    setIsSubmitting(false)
  }

  const statusConfig = VERIFICATION_STATUS_CONFIG[status]
  const StatusIcon = ICON_MAP[statusConfig.icon] || ShieldQuestion

  // ── Status: Pending ──
  if (status === "pending") {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Clock className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold mb-3">{t("pending_title")}</h1>
          <p className="text-muted-foreground mb-8">{t("pending_msg")}</p>

          {/* Progress steps */}
          <Card className="p-5 text-left mb-6">
            <div className="space-y-4">
              {[
                { label: { en: "Documents received", tr: "Belgeler alındı" }, done: true },
                { label: { en: "AI pre-screening", tr: "AI ön tarama" }, done: true },
                { label: { en: "Manual review by our team", tr: "Ekibimiz tarafından manuel inceleme" }, done: false },
                { label: { en: "Verification complete", tr: "Doğrulama tamamlandı" }, done: false },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${step.done ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"}`}>
                    {step.done ? <Check className="w-4 h-4" /> : <span className="text-xs">{i + 1}</span>}
                  </div>
                  <span className={`text-sm ${step.done ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {step.label[lang as "en" | "tr"]}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-6">
            <Lock className="w-3 h-3" />
            {t("security")}
          </div>

          <Link href="/talent-hub">
            <Button variant="outline"><ChevronLeft className="w-4 h-4 mr-1" />{t("back")}</Button>
          </Link>
        </div>
      </div>
    )
  }

  // ── Status: Approved ──
  if (status === "approved") {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-6">
            <BadgeCheck className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold mb-3">{t("approved_title")}</h1>
          <p className="text-muted-foreground mb-6">{t("approved_msg")}</p>

          {/* Verified badge preview */}
          <Card className="p-6 mb-8 inline-block">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">AK</div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Prof. Dr. Ayşe Kara</span>
                  <VerifiedBadge size="md" lang={lang} />
                </div>
                <p className="text-sm text-muted-foreground">Endocrinology · Physician</p>
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            <Link href="/talent-hub">
              <Button className="w-full">{t("back")}</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Status: Unverified / Rejected — Show form ──
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <Link href="/talent-hub" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ChevronLeft className="w-4 h-4" />{t("back")}
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 mb-4">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
        </div>

        {/* Rejected notice */}
        {status === "rejected" && (
          <Card className="p-4 mb-6 border-red-500/30 bg-red-500/5">
            <div className="flex gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <p className="font-medium text-red-600 text-sm">{t("rejected_title")}</p>
                <p className="text-sm text-muted-foreground">{t("rejected_msg")}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Why verify */}
        <Card className="p-5 mb-6 border-emerald-500/20 bg-emerald-500/5">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />{t("why_title")}
          </h3>
          <ul className="space-y-2">
            {["why_1", "why_2", "why_3", "why_4"].map(key => (
              <li key={key} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />{t(key)}
              </li>
            ))}
          </ul>
        </Card>

        {/* Step 1: Diploma Registration Number */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold flex items-center gap-2 mb-1">
            <GraduationCap className="w-5 h-5 text-primary" />{t("step1")}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">{t("step1_desc")}</p>
          <div className="space-y-3">
            <Input
              value={diplomaNumber}
              onChange={e => setDiplomaNumber(e.target.value)}
              placeholder={t("diploma_placeholder")}
              className="h-12 text-base font-mono tracking-wider"
            />
            <Input
              value={ttbNumber}
              onChange={e => setTtbNumber(e.target.value)}
              placeholder={t("ttb_placeholder")}
              className="h-11"
            />
          </div>
        </Card>

        {/* Step 2: Document Upload */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold flex items-center gap-2 mb-1">
            <Upload className="w-5 h-5 text-primary" />{t("step2")}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">{t("step2_desc")}</p>

          <div className="space-y-4">
            {DOCUMENT_TYPES.filter(d => d.id !== "diploma_registration").map(docType => {
              const uploaded = uploadedFiles.find(f => f.type === docType.id)
              const isDraggedOver = dragOver === docType.id
              return (
                <div key={docType.id}>
                  <label className="text-sm font-medium mb-1 block">
                    {docType.label[lang as "en" | "tr"]}
                    {docType.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">{docType.description[lang as "en" | "tr"]}</p>

                  {uploaded ? (
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-green-500/30 bg-green-500/5">
                      {uploaded.preview ? (
                        <img src={uploaded.preview} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{uploaded.file.name}</p>
                        <p className="text-xs text-muted-foreground">{(uploaded.file.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeFile(docType.id)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                        isDraggedOver ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/40 hover:bg-muted/30"
                      }`}
                      onDrop={e => handleDrop(e, docType.id)}
                      onDragOver={e => handleDragOver(e, docType.id)}
                      onDragLeave={() => setDragOver(null)}
                      onClick={() => fileInputRefs.current[docType.id]?.click()}
                    >
                      <input
                        ref={el => { fileInputRefs.current[docType.id] = el }}
                        type="file"
                        className="hidden"
                        accept={docType.accepts || ".pdf,image/*"}
                        onChange={e => { if (e.target.files?.[0]) addFile(e.target.files[0], docType.id) }}
                      />
                      <Upload className={`w-8 h-8 mx-auto mb-2 ${isDraggedOver ? "text-primary" : "text-muted-foreground"}`} />
                      <p className="text-sm font-medium">{t("drag_drop")}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t("max_size")}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        {/* Security note */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-6">
          <Lock className="w-3 h-3" />
          {t("security")}
        </div>

        {/* Submit */}
        <Button
          className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={handleSubmit}
          disabled={isSubmitting || (!diplomaNumber && uploadedFiles.length === 0)}
        >
          {isSubmitting ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" />{t("submitting")}</>
          ) : (
            <><ShieldCheck className="w-5 h-5 mr-2" />{t("submit")}</>
          )}
        </Button>
      </div>
    </div>
  )
}

// ── Verified Badge Component (Exportable) ──
export function VerifiedBadge({ size = "sm", lang = "en" }: { size?: "sm" | "md" | "lg"; lang?: string }) {
  const sizes = {
    sm: { badge: "text-[10px] px-1.5 py-0.5", icon: "w-3 h-3" },
    md: { badge: "text-xs px-2 py-1", icon: "w-3.5 h-3.5" },
    lg: { badge: "text-sm px-2.5 py-1", icon: "w-4 h-4" },
  }
  const s = sizes[size]
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border border-emerald-200 dark:border-emerald-800 font-medium ${s.badge}`}>
      <BadgeCheck className={s.icon} />
      {size !== "sm" && (lang === "tr" ? "Onaylı" : "Verified")}
    </span>
  )
}
