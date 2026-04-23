// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Camera, ScanBarcode, Loader2, CheckCircle2, AlertTriangle,
  X, RotateCcw, Pill, Plus,
} from "lucide-react"
import { tx, type Lang } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import { normalizeMedFields } from "@/lib/safety/normalize-med-name"

interface MedicationScannerProps {
  userId: string
  lang: Lang
  onMedicationFound?: (brandName: string, genericName: string, dosage: string) => void
}

interface ScanResult {
  brand_name?: string
  generic_name?: string
  dosage?: string
  form?: string
  confidence?: "high" | "medium" | "low"
  error?: string
}

export function MedicationScanner({ userId, lang, onMedicationFound }: MedicationScannerProps) {
  const [mode, setMode] = useState<"idle" | "camera" | "scanning" | "result">("idle")
  const [result, setResult] = useState<ScanResult | null>(null)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const tr = lang === "tr"

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setMode("camera")
    } catch {
      // Camera not available — fall back to file input
      fileInputRef.current?.click()
    }
  }

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }, [])

  const capturePhoto = () => {
    if (!videoRef.current) return
    const canvas = document.createElement("canvas")
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(videoRef.current, 0, 0)
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8)
    setCapturedImage(dataUrl)
    stopCamera()
    analyzeImage(dataUrl)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setCapturedImage(dataUrl)
      analyzeImage(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const analyzeImage = async (imageData: string) => {
    setMode("scanning")

    // F-SCANNER-001: AbortController matches endpoint maxDuration=50s
    // with a 5s safety margin. Before this change the fetch had no
    // timeout — a slow Claude response could spin the loader for the
    // browser's default (~5 min) with no user signal.
    const controller = new AbortController()
    const timeoutHandle = window.setTimeout(() => controller.abort(), 55_000)

    try {
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()

      const res = await fetch("/api/scan-medication", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
        },
        body: JSON.stringify({ image: imageData, lang }),
        signal: controller.signal,
      })

      window.clearTimeout(timeoutHandle)

      if (res.ok) {
        const data = await res.json()
        setResult(data)
        setMode("result")
        return
      }

      // F-SCANNER-001: the endpoint returns `{ error, code, stage, detail }`
      // on failure — map the code to a specific i18n key so the user
      // sees an actionable message instead of the old generic
      // "Analiz başarısız" that swallowed every failure mode.
      let payload: { error?: string; code?: string; stage?: string; detail?: string } = {}
      try {
        payload = await res.json()
      } catch {
        // Non-JSON response (e.g. Vercel edge timeout HTML) — fall through
        // to the status-code branch below.
      }

      if (process.env.NODE_ENV !== "production") {
        // Dev-only diagnostic so the developer can see `stage` + `detail`
        // without opening Sentry. Prod stays quiet per KVKK — no PII
        // surfaces even though this path never touches base64 anyway.
        // eslint-disable-next-line no-console
        console.error("[scanner] analysis failed", {
          status: res.status,
          ...payload,
        })
      }

      let errorKey = "scan.error.ocrFailed"
      let replaceN: string | null = null
      const code = payload.code ?? ""

      if (res.status === 401 || code === "auth_required") {
        errorKey = "scan.error.authExpired"
      } else if (res.status === 429 || code === "rate_limited") {
        errorKey = "scan.error.rateLimited"
        // Endpoint writes the wait in `detail` as `resetInSeconds=NN`.
        const match = /resetInSeconds=(\d+)/.exec(payload.detail ?? "")
        replaceN = match ? match[1] : "60"
      } else if (code === "consent_blocked") {
        errorKey = "scan.error.consentBlocked"
      }

      let message = tx(errorKey, lang)
      if (replaceN !== null) {
        message = message.replace("{n}", replaceN)
      }
      setResult({ error: message })
      setMode("result")
    } catch (err) {
      window.clearTimeout(timeoutHandle)
      // F-SCANNER-001: distinguish AbortController timeout from generic
      // fetch failure so the user knows whether to check their network
      // or wait for the server to catch up.
      const isAbort =
        err instanceof Error &&
        (err.name === "AbortError" || err.message.includes("aborted"))
      const errorKey = isAbort ? "scan.error.timeout" : "scan.connectionError"

      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.error("[scanner] fetch threw", { isAbort, err })
      }

      setResult({ error: tx(errorKey, lang) })
      setMode("result")
    }
  }

  const addToProfile = async () => {
    if (!result?.brand_name) return
    setAdding(true)
    try {
      const supabase = createBrowserClient()
      // F-SAFETY-002: every ingest path runs the same normaliser so
      // OpenFDA-style underscores and OCR slop don't reach the DB.
      const cleaned = normalizeMedFields({
        brand_name: result.brand_name,
        generic_name: result.generic_name || null,
      })
      await supabase.from("user_medications").insert({
        user_id: userId,
        brand_name: cleaned.brand_name,
        generic_name: cleaned.generic_name,
        dosage: result.dosage || null,
        is_active: true,
      })
      setAdded(true)
      onMedicationFound?.(cleaned.brand_name, cleaned.generic_name ?? "", result.dosage || "")
      // F-SAFETY-002: notify any mounted profile page (or future
      // dashboard surface) that a new med just landed so the
      // interaction-map check + banner can fire. Modal close animation
      // settles in ~300 ms — wait so the banner doesn't render
      // beneath a fading overlay.
      window.setTimeout(() => {
        window.dispatchEvent(new Event("safety:med-added"))
      }, 300)
    } catch {
      // silently fail
    } finally {
      setAdding(false)
    }
  }

  const reset = () => {
    stopCamera()
    setMode("idle")
    setResult(null)
    setCapturedImage(null)
    setAdded(false)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Camera className="h-4 w-4 text-primary" />
          {tx("scanner.title", lang)}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {tx("scanner.subtitle", lang)}
        </p>
      </CardHeader>
      <CardContent>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileInput}
        />

        {/* Idle state */}
        {mode === "idle" && (
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={startCamera}>
              <Camera className="mr-1.5 h-3.5 w-3.5" />
              {tx("scanner.takePhoto", lang)}
            </Button>
            <Button size="sm" variant="outline" className="flex-1" onClick={() => fileInputRef.current?.click()}>
              <ScanBarcode className="mr-1.5 h-3.5 w-3.5" />
              {tx("scanner.uploadPhoto", lang)}
            </Button>
          </div>
        )}

        {/* Camera view */}
        {mode === "camera" && (
          <div className="space-y-2">
            <div className="relative overflow-hidden rounded-lg">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-32 w-48 rounded-lg border-2 border-white/50" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={capturePhoto}>
                <Camera className="mr-1.5 h-3.5 w-3.5" />
                {tx("scan.capture", lang)}
              </Button>
              <Button size="sm" variant="outline" onClick={() => { stopCamera(); setMode("idle") }}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Scanning state */}
        {mode === "scanning" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {tx("scanner.analyzing", lang)}
            </p>
            {capturedImage && (
              <img src={capturedImage} alt="Captured" className="max-h-32 rounded-lg opacity-50" />
            )}
          </div>
        )}

        {/* Result state */}
        {mode === "result" && result && (
          <div className="space-y-3">
            {result.error ? (
              <div className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 px-3 py-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <p className="text-sm text-amber-700 dark:text-amber-400">{result.error}</p>
              </div>
            ) : (
              <>
                <div className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{tx("scan.brand", lang)}</span>
                    <Badge
                      variant="secondary"
                      className={`text-[9px] ${
                        result.confidence === "high" ? "bg-green-100 text-green-700" :
                        result.confidence === "medium" ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      }`}
                    >
                      {result.confidence === "high" ? "✓ " : ""}{result.confidence}
                    </Badge>
                  </div>
                  <p className="text-lg font-bold">{result.brand_name || "—"}</p>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-[10px] text-muted-foreground">{tx("scan.active", lang)}</span>
                      <p className="font-medium">{result.generic_name || "—"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground">{tx("scan.dosage", lang)}</span>
                      <p className="font-medium">{result.dosage || "—"}</p>
                    </div>
                  </div>

                  {result.form && (
                    <div>
                      <span className="text-[10px] text-muted-foreground">{tx("scan.form", lang)}</span>
                      <p className="text-sm">{result.form}</p>
                    </div>
                  )}
                </div>

                {/* Add to profile button */}
                {result.brand_name && (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={addToProfile}
                    disabled={adding || added}
                  >
                    {adding ? (
                      <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                    ) : added ? (
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                    ) : (
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    {added
                      ? tx("scan.addedToProfile", lang)
                      : tx("scan.addToMeds", lang)
                    }
                  </Button>
                )}
              </>
            )}

            <Button size="sm" variant="outline" className="w-full" onClick={reset}>
              <RotateCcw className="mr-1.5 h-3 w-3" />
              {tx("scan.tryAgain", lang)}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
