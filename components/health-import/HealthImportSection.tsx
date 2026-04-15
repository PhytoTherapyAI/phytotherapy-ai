// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Heart, Activity, Upload, Check, X, Loader2, Trash2, Clock,
  ChevronDown, FileWarning, FileCheck2, Footprints, Moon, Flame,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { createBrowserClient } from "@/lib/supabase"
import { parseAppleHealth } from "@/lib/health-import/apple-health-parser"
import { parseGoogleFit } from "@/lib/health-import/google-fit-parser"
import type { HealthImport, ParseProgress, HealthImportSource } from "@/types/health-import"

const MAX_FILE_BYTES = 500 * 1024 * 1024 // 500 MB
const CHUNK_SIZE = 1000

interface ImportState {
  source: HealthImportSource
  fileName: string
  fileSize: number
  status: "idle" | "parsing" | "uploading" | "completed" | "failed"
  progress: ParseProgress | null
  uploaded: number
  total: number
  error: string | null
  importId: string | null
}

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`
}

function fmtDate(iso: string | null, lang: "tr" | "en"): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", {
    year: "numeric", month: "short", day: "numeric",
  })
}

export function HealthImportSection() {
  const { user } = useAuth()
  const { lang } = useLang()
  const tr = lang === "tr"

  const [appleGuide, setAppleGuide] = useState(false)
  const [googleGuide, setGoogleGuide] = useState(false)
  const [history, setHistory] = useState<HealthImport[]>([])
  const [imports, setImports] = useState<Record<HealthImportSource, ImportState | null>>({
    apple_health: null,
    google_fit: null,
  })
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null)
  const [summary, setSummary] = useState<{
    avgSteps: number | null
    avgHr: number | null
    totalSleep: number | null
    range: string
  } | null>(null)
  const cancelRef = useRef<{ cancelled: boolean }>({ cancelled: false })
  const appleInputRef = useRef<HTMLInputElement>(null)
  const googleInputRef = useRef<HTMLInputElement>(null)

  // ── Auth helper ──
  const getToken = useCallback(async (): Promise<string | null> => {
    const supabase = createBrowserClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  }, [])

  // ── Load past imports + 7-day summary ──
  const refresh = useCallback(async () => {
    const token = await getToken()
    if (!token) return
    try {
      const [importsRes, sumRes] = await Promise.all([
        fetch("/api/health-imports", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/health-metrics?from=" +
          new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10) +
          "&granularity=daily", { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (importsRes.ok) {
        const j = await importsRes.json()
        setHistory(Array.isArray(j.imports) ? j.imports : [])
      }
      if (sumRes.ok) {
        const j = await sumRes.json() as { metrics?: Array<{ metric_type: string; value: number }> }
        const m = j.metrics || []
        const stepsArr = m.filter(x => x.metric_type === "steps").map(x => x.value)
        const hrArr    = m.filter(x => x.metric_type === "heart_rate").map(x => x.value)
        const slpArr   = m.filter(x => x.metric_type === "sleep_duration").map(x => x.value)
        const avg = (a: number[]) => a.length ? a.reduce((s, v) => s + v, 0) / a.length : null
        const sum = (a: number[]) => a.length ? a.reduce((s, v) => s + v, 0) : null
        setSummary({
          avgSteps: stepsArr.length ? Math.round(avg(stepsArr) || 0) : null,
          avgHr: hrArr.length ? Math.round((avg(hrArr) || 0) * 10) / 10 : null,
          totalSleep: slpArr.length ? Math.round((sum(slpArr) || 0) * 10) / 10 : null,
          range: tr ? "Son 7 gün" : "Last 7 days",
        })
      }
    } catch { /* silent */ }
  }, [getToken, tr])

  useEffect(() => {
    if (user) refresh()
  }, [user, refresh])

  // ── File pick + parse + batch upload pipeline ──
  async function handleFile(source: HealthImportSource, file: File) {
    if (file.size > MAX_FILE_BYTES) {
      setFeedback({ type: "error", msg: tr ? "Dosya 500 MB sınırını aşıyor." : "File exceeds the 500 MB limit." })
      return
    }
    const token = await getToken()
    if (!token) {
      setFeedback({ type: "error", msg: tr ? "Oturum bulunamadı." : "Session not found." })
      return
    }

    cancelRef.current = { cancelled: false }
    setImports(prev => ({
      ...prev,
      [source]: {
        source, fileName: file.name, fileSize: file.size,
        status: "parsing", progress: null, uploaded: 0, total: 0,
        error: null, importId: null,
      },
    }))

    let importId: string | null = null
    try {
      // 1) Parse client-side (large XML/JSON, never sent to server)
      const parser = source === "apple_health" ? parseAppleHealth : parseGoogleFit
      const parsed = await parser(file, p => {
        setImports(prev => {
          const cur = prev[source]
          if (!cur) return prev
          return { ...prev, [source]: { ...cur, progress: p, total: p.total ?? 0 } }
        })
      })

      if (cancelRef.current.cancelled) throw new Error("cancelled")

      if (parsed.metrics.length === 0) {
        throw new Error(tr ? "Bu dosyada içe aktarılacak veri bulunamadı." : "No importable data found in this file.")
      }

      // 2) Create the health_imports row
      const createRes = await fetch("/api/health-imports", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          source,
          fileName: file.name,
          dateRangeStart: parsed.dateRangeStart,
          dateRangeEnd: parsed.dateRangeEnd,
          recordsImported: 0,
        }),
      })
      const createJson = await createRes.json().catch(() => ({}))
      if (!createRes.ok) throw new Error(createJson.error || "Failed to create import")
      importId = createJson.import?.id ?? null
      if (!importId) throw new Error("Missing import id")

      setImports(prev => {
        const cur = prev[source]
        if (!cur) return prev
        return { ...prev, [source]: { ...cur, status: "uploading", importId, total: parsed.metrics.length, uploaded: 0 } }
      })

      // 3) Upload in 1000-row chunks
      let uploaded = 0
      for (let i = 0; i < parsed.metrics.length; i += CHUNK_SIZE) {
        if (cancelRef.current.cancelled) throw new Error("cancelled")
        const chunk = parsed.metrics.slice(i, i + CHUNK_SIZE)
        const res = await fetch("/api/health-metrics", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            importId,
            source,
            metrics: chunk.map(m => ({
              metricType: m.metric_type,
              value: m.value,
              unit: m.unit,
              measuredAt: m.measured_at,
              sourceId: m.source_id,
            })),
          }),
        })
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          throw new Error(j.error || "Batch upload failed")
        }
        uploaded += chunk.length
        setImports(prev => {
          const cur = prev[source]
          if (!cur) return prev
          return { ...prev, [source]: { ...cur, uploaded } }
        })
      }

      // 4) Mark complete
      await fetch("/api/health-imports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: importId, status: "completed", recordsImported: uploaded }),
      })

      setImports(prev => {
        const cur = prev[source]
        if (!cur) return prev
        return { ...prev, [source]: { ...cur, status: "completed" } }
      })
      setFeedback({
        type: "success",
        msg: tr
          ? `${uploaded.toLocaleString("tr-TR")} kayıt başarıyla içe aktarıldı (${fmtDate(parsed.dateRangeStart, "tr")} — ${fmtDate(parsed.dateRangeEnd, "tr")})`
          : `${uploaded.toLocaleString("en-US")} records imported (${fmtDate(parsed.dateRangeStart, "en")} — ${fmtDate(parsed.dateRangeEnd, "en")})`,
      })
      await refresh()
    } catch (err) {
      const message = (err instanceof Error ? err.message : String(err)) || "unknown"
      const wasCancel = message === "cancelled"
      if (importId) {
        await fetch("/api/health-imports", {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ id: importId, status: "failed", errorMessage: wasCancel ? "Cancelled by user" : message }),
        }).catch(() => {})
      }
      setImports(prev => {
        const cur = prev[source]
        if (!cur) return prev
        return { ...prev, [source]: { ...cur, status: "failed", error: wasCancel ? (tr ? "İptal edildi" : "Cancelled") : message } }
      })
      if (!wasCancel) {
        setFeedback({ type: "error", msg: tr ? `İçe aktarma başarısız: ${message}` : `Import failed: ${message}` })
      }
      await refresh()
    }
  }

  function cancelImport(source: HealthImportSource) {
    cancelRef.current = { cancelled: true }
    setImports(prev => ({ ...prev, [source]: prev[source] ? { ...prev[source]!, status: "failed", error: tr ? "İptal edildi" : "Cancelled" } : null }))
  }

  function clearImport(source: HealthImportSource) {
    setImports(prev => ({ ...prev, [source]: null }))
  }

  async function deleteImport(id: string) {
    if (!confirm(tr ? "Bu içe aktarmayı ve tüm metriklerini sil?" : "Delete this import and all its metrics?")) return
    const token = await getToken()
    if (!token) return
    const res = await fetch(`/api/health-imports?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      setFeedback({ type: "success", msg: tr ? "İçe aktarma silindi" : "Import deleted" })
      await refresh()
    } else {
      setFeedback({ type: "error", msg: tr ? "Silinemedi" : "Delete failed" })
    }
  }

  // ── Render helpers ──
  const renderImportCard = (
    source: HealthImportSource,
    title: string,
    subtitle: string,
    Icon: typeof Heart,
    color: string,
    bg: string,
    accept: string,
    inputRef: React.RefObject<HTMLInputElement | null>,
    guideOpen: boolean,
    setGuideOpen: (o: boolean) => void,
    guide: string[],
  ) => {
    const state = imports[source]
    const busy = state?.status === "parsing" || state?.status === "uploading"
    return (
      <Card className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
        </div>

        {/* Guide accordion */}
        <button
          type="button"
          onClick={() => setGuideOpen(!guideOpen)}
          className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground py-2 border-t border-border/60"
        >
          <span>{tr ? "Adım adım rehber" : "Step-by-step guide"}</span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${guideOpen ? "rotate-180" : ""}`} />
        </button>
        {guideOpen && (
          <ol className="text-xs text-muted-foreground space-y-1.5 pb-3 pl-1 list-decimal list-inside leading-relaxed">
            {guide.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
        )}

        {/* File pick / progress / done */}
        {!state && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0]
                if (f) handleFile(source, f)
                e.target.value = ""
              }}
            />
            <Button
              onClick={() => inputRef.current?.click()}
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Upload className="h-4 w-4 mr-2" />
              {tr ? "ZIP Dosyası Seç" : "Choose ZIP file"}
            </Button>
          </>
        )}

        {state && (
          <div className="mt-2 rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center gap-2 mb-2">
              {state.status === "completed"
                ? <FileCheck2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                : state.status === "failed"
                  ? <FileWarning className="h-4 w-4 text-destructive flex-shrink-0" />
                  : <Loader2 className="h-4 w-4 animate-spin text-emerald-500 flex-shrink-0" />}
              <p className="text-xs font-medium text-foreground truncate flex-1">{state.fileName}</p>
              <span className="text-[10px] text-muted-foreground flex-shrink-0">{fmtBytes(state.fileSize)}</span>
            </div>

            {state.status === "parsing" && state.progress && (
              <p className="text-xs text-muted-foreground">
                {tr ? "Veriler okunuyor… " : "Reading data… "}
                {state.progress.processed.toLocaleString()}{state.progress.total ? ` / ~${state.progress.total.toLocaleString()}` : ""} {tr ? "kayıt" : "records"}
              </p>
            )}
            {state.status === "uploading" && (
              <>
                <p className="text-xs text-muted-foreground mb-1.5">
                  {tr ? "Yükleniyor: " : "Uploading: "}
                  {state.uploaded.toLocaleString()} / {state.total.toLocaleString()}
                </p>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${state.total ? (state.uploaded / state.total * 100) : 0}%` }}
                  />
                </div>
              </>
            )}
            {state.status === "completed" && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ {state.uploaded.toLocaleString()} {tr ? "kayıt içe aktarıldı" : "records imported"}
              </p>
            )}
            {state.status === "failed" && (
              <p className="text-xs text-destructive">
                {state.error || (tr ? "Hata" : "Error")}
              </p>
            )}

            <div className="flex gap-1.5 mt-2.5">
              {busy && (
                <Button variant="outline" size="sm" className="h-7 text-[10px] flex-1" onClick={() => cancelImport(source)}>
                  <X className="h-3 w-3 mr-1" />{tr ? "İptal" : "Cancel"}
                </Button>
              )}
              {(state.status === "completed" || state.status === "failed") && (
                <Button variant="ghost" size="sm" className="h-7 text-[10px] flex-1" onClick={() => clearImport(source)}>
                  {tr ? "Yeni dosya yükle" : "Upload another"}
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
    )
  }

  return (
    <div className="space-y-5 mb-6">
      {feedback && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${
          feedback.type === "success"
            ? "border-emerald-200 bg-emerald-50/80 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300"
            : "border-destructive/30 bg-destructive/10 text-destructive"
        }`}>
          <div className="flex items-start gap-2">
            {feedback.type === "success" ? <Check className="h-4 w-4 mt-0.5" /> : <X className="h-4 w-4 mt-0.5" />}
            <span className="flex-1">{feedback.msg}</span>
            <button onClick={() => setFeedback(null)} className="text-current opacity-60 hover:opacity-100">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">
        {tr ? "Sağlık Verilerini İçe Aktar" : "Import Health Data"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderImportCard(
          "apple_health",
          tr ? "Apple Health Verilerini İçe Aktar" : "Import Apple Health Data",
          tr ? "iPhone → Sağlık → Profil → Sağlık Verilerini Dışa Aktar" : "iPhone → Health → Profile → Export All Health Data",
          Heart, "text-red-500", "bg-red-100 dark:bg-red-900/30", ".zip", appleInputRef,
          appleGuide, setAppleGuide,
          tr ? [
            "iPhone'da Sağlık uygulamasını aç.",
            "Sağ üstteki profil ikonuna dokun.",
            "\"Tüm Sağlık Verilerini Dışa Aktar\" seçeneğine dokun.",
            "Dosyayı kendine e-posta ile gönder veya Dosyalar'a kaydet.",
            "Bilgisayardan bu sayfaya yükle.",
          ] : [
            "Open the Health app on iPhone.",
            "Tap the profile icon at the top right.",
            "Tap \"Export All Health Data\".",
            "Email it to yourself or save to Files.",
            "Upload the .zip on this page from your computer.",
          ],
        )}
        {renderImportCard(
          "google_fit",
          tr ? "Google Fit Verilerini İçe Aktar" : "Import Google Fit Data",
          tr ? "Google Takeout → Fit → ZIP indir" : "Google Takeout → Fit → download ZIP",
          Activity, "text-blue-500", "bg-blue-100 dark:bg-blue-900/30", ".zip", googleInputRef,
          googleGuide, setGoogleGuide,
          tr ? [
            "takeout.google.com adresine git.",
            "\"Hiçbirini seçme\"ye tıkla, sonra sadece \"Fit\" kutusunu işaretle.",
            "\"Dışa aktar\"a tıkla ve ZIP dosyasını indir.",
            "Bu sayfaya yükle.",
          ] : [
            "Go to takeout.google.com.",
            "Click \"Deselect all\", then check only \"Fit\".",
            "Click \"Export\" and download the ZIP file.",
            "Upload the ZIP on this page.",
          ],
        )}
      </div>

      {/* 7-day mini summary */}
      {summary && (summary.avgSteps !== null || summary.avgHr !== null || summary.totalSleep !== null) && (
        <Card className="p-4">
          <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-emerald-500" />
            {summary.range}
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <Footprints className="h-5 w-5 text-blue-500 mx-auto mb-1" />
              <p className="text-base font-bold text-foreground">
                {summary.avgSteps !== null ? summary.avgSteps.toLocaleString() : "—"}
              </p>
              <p className="text-[10px] text-muted-foreground">{tr ? "Ort. adım/gün" : "Avg steps/day"}</p>
            </div>
            <div className="text-center">
              <Heart className="h-5 w-5 text-red-500 mx-auto mb-1" />
              <p className="text-base font-bold text-foreground">
                {summary.avgHr !== null ? `${summary.avgHr}` : "—"}
              </p>
              <p className="text-[10px] text-muted-foreground">{tr ? "Ort. nabız (bpm)" : "Avg HR (bpm)"}</p>
            </div>
            <div className="text-center">
              <Moon className="h-5 w-5 text-indigo-500 mx-auto mb-1" />
              <p className="text-base font-bold text-foreground">
                {summary.totalSleep !== null ? `${summary.totalSleep}h` : "—"}
              </p>
              <p className="text-[10px] text-muted-foreground">{tr ? "Toplam uyku" : "Total sleep"}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Past imports */}
      {history.length > 0 && (
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">
              {tr ? "Geçmiş İçe Aktarmalar" : "Past Imports"}
            </h3>
            <span className="ml-auto text-xs text-muted-foreground">{history.length}</span>
          </div>
          <div className="divide-y divide-border">
            {history.map(h => (
              <div key={h.id} className="p-3 sm:p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  h.source === "apple_health" ? "bg-red-100 dark:bg-red-900/30" : "bg-blue-100 dark:bg-blue-900/30"
                }`}>
                  {h.source === "apple_health"
                    ? <Heart className="h-4 w-4 text-red-500" />
                    : <Activity className="h-4 w-4 text-blue-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{h.file_name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {h.records_imported.toLocaleString()} {tr ? "kayıt" : "records"} ·{" "}
                    {fmtDate(h.date_range_start, lang as "tr" | "en")} — {fmtDate(h.date_range_end, lang as "tr" | "en")}
                  </p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  h.status === "completed"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : h.status === "failed"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                }`}>
                  {h.status === "completed" ? (tr ? "Tamamlandı" : "Done") : h.status === "failed" ? (tr ? "Başarısız" : "Failed") : (tr ? "İşleniyor" : "Processing")}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-destructive hover:bg-destructive/10"
                  onClick={() => deleteImport(h.id)}
                  title={tr ? "Sil" : "Delete"}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
