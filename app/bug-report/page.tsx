// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState } from "react"
import { useLang } from "@/components/layout/language-toggle"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bug, Upload, CheckCircle2, ArrowLeft, Image, Trash2, Send } from "lucide-react"
import Link from "next/link"

interface BugReport {
  id: string
  description: string
  steps: string
  expected: string
  email: string
  screenshots: string[]
  timestamp: string
  status: "submitted"
}

const tx: Record<string, { en: string; tr: string }> = {
  title: { en: "Bug Report", tr: "Hata Bildirimi" },
  subtitle: { en: "Help us improve by reporting issues you encounter", tr: "Karşılastginiz sorunları bildirerek gelistirmemize yardımcı olun" },
  description: { en: "Describe the bug", tr: "Hatayi aciklayin" },
  descPlaceholder: { en: "What happened? Be as specific as possible...", tr: "Ne oldu? Mumkun olduğunca detayli anlatiniz..." },
  steps: { en: "Steps to reproduce", tr: "Yeniden oluşturma adimlari" },
  stepsPlaceholder: { en: "1. Go to...\n2. Click on...\n3. See error...", tr: "1. ... sayfasina gidin\n2. ... butonuna tiklayin\n3. Hatayi gorun..." },
  expected: { en: "Expected behavior", tr: "Beklenen davranis" },
  expectedPlaceholder: { en: "What should have happened instead?", tr: "Bunun yerine ne olmasi gerekiyordu?" },
  email: { en: "Email (optional)", tr: "E-posta (isteğe bağlı)" },
  emailPlaceholder: { en: "your@email.com — for follow-up", tr: "email@adresiniz.com — geri donus icin" },
  screenshots: { en: "Screenshots", tr: "Ekran görüntüleri" },
  uploadHint: { en: "Click or drag images here (max 3)", tr: "Resimleri buraya tiklayin veya surukleyin (maks 3)" },
  submit: { en: "Submit Report", tr: "Rapor Gonder" },
  required: { en: "Required", tr: "Zorunlu" },
  optional: { en: "Optional", tr: "Istege bagli" },
  thankTitle: { en: "Thank you!", tr: "Tesekkurler!" },
  thankMsg: { en: "Your bug report has been saved. We'll look into it as soon as possible.", tr: "Hata bildiriminiz kaydedildi. En kisa surede inceleyecegiz." },
  another: { en: "Submit another report", tr: "Baska bir rapor gonder" },
  back: { en: "Back to Dashboard", tr: "Panele Don" },
  history: { en: "Previous Reports", tr: "Onceki Raporlar" },
  noHistory: { en: "No previous reports", tr: "Onceki rapor yok" },
  descError: { en: "Please describe the bug", tr: "Lütfen hatayi aciklayin" },
}

export default function BugReportPage() {
  const { lang } = useLang()
  const t = (key: string) => tx[key]?.[lang as "en" | "tr"] || tx[key]?.en || key

  const [description, setDescription] = useState("")
  const [steps, setSteps] = useState("")
  const [expected, setExpected] = useState("")
  const [email, setEmail] = useState("")
  const [screenshots, setScreenshots] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const remaining = 3 - screenshots.length
    const toProcess = Array.from(files).slice(0, remaining)
    toProcess.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const result = ev.target?.result as string
        if (result) setScreenshots((prev) => [...prev.slice(0, 2), result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeScreenshot = (idx: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = () => {
    if (!description.trim()) {
      setError(t("descError"))
      return
    }
    setError("")
    const report: BugReport = {
      id: `bug_${Date.now()}`,
      description: description.trim(),
      steps: steps.trim(),
      expected: expected.trim(),
      email: email.trim(),
      screenshots,
      timestamp: new Date().toISOString(),
      status: "submitted",
    }
    let existing: BugReport[] = []
    try { existing = JSON.parse(localStorage.getItem("phyto_bug_reports") || "[]") } catch {}
    existing.unshift(report)
    localStorage.setItem("phyto_bug_reports", JSON.stringify(existing.slice(0, 50)))
    setSubmitted(true)
  }

  const resetForm = () => {
    setDescription("")
    setSteps("")
    setExpected("")
    setEmail("")
    setScreenshots([])
    setSubmitted(false)
    setError("")
  }

  let history: BugReport[] = []
  if (typeof window !== "undefined") {
    try { history = JSON.parse(localStorage.getItem("phyto_bug_reports") || "[]") } catch {}
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 md:p-8">
        <div className="max-w-2xl mx-auto pt-12">
          <Card className="p-8 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("thankTitle")}</h1>
            <p className="text-gray-600 dark:text-gray-400">{t("thankMsg")}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button onClick={resetForm} variant="outline">
                <Bug className="w-4 h-4 mr-2" />{t("another")}
              </Button>
              <Link href="/dashboard">
                <Button><ArrowLeft className="w-4 h-4 mr-2" />{t("back")}</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bug className="w-6 h-6 text-red-500" />{t("title")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("subtitle")}</p>
          </div>
        </div>

        {/* Form */}
        <Card className="p-6 space-y-5">
          {/* Description */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("description")} <Badge variant="destructive" className="text-xs">{t("required")}</Badge>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("descPlaceholder")}
              rows={4}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          {/* Steps */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("steps")} <Badge variant="secondary" className="text-xs">{t("optional")}</Badge>
            </label>
            <textarea
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              placeholder={t("stepsPlaceholder")}
              rows={3}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Expected */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("expected")} <Badge variant="secondary" className="text-xs">{t("optional")}</Badge>
            </label>
            <textarea
              value={expected}
              onChange={(e) => setExpected(e.target.value)}
              placeholder={t("expectedPlaceholder")}
              rows={2}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Screenshots */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Image className="w-4 h-4" />{t("screenshots")}
            </label>
            <div className="flex gap-3 flex-wrap">
              {screenshots.map((src, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <img src={src} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                  <button onClick={() => removeScreenshot(idx)} className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {screenshots.length < 3 && (
                <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 transition-colors">
                  <Upload className="w-5 h-5 text-gray-400" />
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>
            <p className="text-xs text-gray-400">{t("uploadHint")}</p>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("email")} <Badge variant="secondary" className="text-xs">{t("optional")}</Badge>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Submit */}
          <Button onClick={handleSubmit} className="w-full bg-red-500 hover:bg-red-600 text-white">
            <Send className="w-4 h-4 mr-2" />{t("submit")}
          </Button>
        </Card>

        {/* History */}
        {history.length > 0 && (
          <Card className="p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">{t("history")}</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {history.slice(0, 5).map((r) => (
                <div key={r.id} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-sm">
                  <Bug className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-gray-700 dark:text-gray-300 truncate">{r.description}</p>
                    <p className="text-xs text-gray-400">{new Date(r.timestamp).toLocaleDateString()}</p>
                  </div>
                  <Badge variant="outline" className="ml-auto text-xs shrink-0">{r.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
