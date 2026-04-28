// © 2026 DoctoPal — All Rights Reserved
//
// F-INTERACTION-VISION-001 — universal scan for the interaction
// checker. Light fork of components/scanner/MedicationScanner.tsx
// (the canonical Profile-tab scanner). Differences vs that file:
//
//   - Renders as a centred modal/dialog instead of an inline card.
//   - Outcome is a STRING (medication brand name) handed back to a
//     parent setState, NOT a row written to user_medications. The
//     interaction checker maintains an in-memory `medications`
//     array; the safety analysis runs against that.
//   - Low-confidence handling is explicit: the user MUST confirm
//     the recognised name (input is editable + amber "verify"
//     hint). Honours the F-SCAN-SAFETY-001 lesson — never let
//     unverified medical text propagate into a safety check.
//
// Reuse list:
//   - /api/scan-medication endpoint (untouched, F-SAFETY-002 +
//     Sprint 1.5 base64 validation already in place).
//   - F-SCAN-SAFETY-002 client-side 4-Layer Defense (3 of the 4
//     guards — server-side base64 charset is the 4th, on the
//     endpoint side).
//   - F-CHECKIN-MOBILE-001 round-4 modal pattern: items-center +
//     px-4 + rounded-3xl + zoom-in-95 fade-in-0.
//   - F-MOBILE-002b input/button: text-base sm:text-sm,
//     min-h-11 md:min-h-9.
//   - scan.error.noFrame i18n key (Sprint 1, lib/translations/
//     tools.ts:1057) — re-used for all three Sprint 2 client
//     guards so the user sees a consistent message.
"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, Upload, X, Pencil, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { tx, type Lang } from "@/lib/translations"
import { toast } from "sonner"
import { createBrowserClient } from "@/lib/supabase"

interface Props {
  open: boolean
  onClose: () => void
  /** Parent's medications setter. Called once with the trimmed,
   *  user-confirmed name when the user taps "Add to list". */
  onAdd: (medicationName: string) => void
  lang: Lang
}

interface ScanResult {
  brand_name?: string
  generic_name?: string
  dosage?: string
  form?: string
  confidence?: "high" | "medium" | "low"
  error?: string
  /** F-INTERACTION-VISION-002: AI-fail fallback marker. Set by
   *  `handleNotRecognized` when the vision API couldn't identify
   *  the medication (HTTP error, 200 + empty brand_name, network
   *  catch). The result mode UI branches on this to show a
   *  "type the name manually" amber banner instead of the
   *  optimistic "Recognized as" header — the user lands on the
   *  same manual edit input they would have used to correct a
   *  low-confidence reading, so the dead-end (modal stuck on
   *  preview with only X / retake) goes away. */
  notRecognized?: boolean
}

type Mode = "choose" | "camera" | "preview" | "result"

export function InteractionPhotoCapture({ open, onClose, onAdd, lang }: Props) {
  const [mode, setMode] = useState<Mode>("choose")
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [editedName, setEditedName] = useState("")

  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Cleanup camera stream + reset state on close. The effect re-
  // runs on `open` flip so the next time the modal opens the user
  // lands back on the choose screen instead of stale result data.
  useEffect(() => {
    if (!open) {
      stopCamera()
      setMode("choose")
      setImageDataUrl(null)
      setScanResult(null)
      setEditedName("")
      setIsScanning(false)
    }
    return () => stopCamera()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Hooking the camera stream to the <video> element has to wait
  // until the element is mounted — switching to "camera" mode
  // mounts the <video>, then this effect attaches srcObject.
  useEffect(() => {
    if (mode === "camera" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [mode])

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      setMode("camera")
    } catch {
      // Permission denied / no camera / in-app webview — surface a
      // toast and offer the gallery path instead. Mode stays
      // "choose" so the user can pick the gallery button right
      // after.
      toast.error(tx("interaction.photoScan.cameraError", lang))
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current) return
    const video = videoRef.current

    // F-SCAN-SAFETY-002 guard 1: stream must have at least one
    // decoded frame before we can extract pixels. readyState < 2
    // (HAVE_CURRENT_DATA) means the canvas would be empty;
    // videoWidth/Height === 0 means metadata hasn't landed yet.
    if (
      video.readyState < 2 ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      toast.error(tx("scan.error.noFrame", lang))
      return
    }

    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85)
    setImageDataUrl(dataUrl)
    stopCamera()
    setMode("preview")
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      // User cancelled the picker — silent, mode stays "choose".
      return
    }

    // F-SCAN-SAFETY-002 guard 2: some Android WebViews surface a
    // 0-byte File object when the picker is cancelled mid-flight.
    // Same guard as MedicationScanner.tsx; rejects non-image MIMEs
    // up front.
    if (file.size === 0 || !file.type.startsWith("image/")) {
      toast.error(tx("scan.error.noFrame", lang))
      e.target.value = ""
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setImageDataUrl(dataUrl)
      setMode("preview")
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  // F-INTERACTION-VISION-002: shared fallback for every code path
  // that ends in "AI couldn't tell us what's in the photo". Lands
  // the user on the result mode with an empty input + a banner
  // that asks them to type the name themselves; the existing
  // handleConfirm emptyName guard (line ~252) keeps the addToList
  // button honest for blank submissions.
  const handleNotRecognized = () => {
    setScanResult({ notRecognized: true })
    setEditedName("")
    setMode("result")
    setIsScanning(false)
  }

  const analyzeImage = async () => {
    if (!imageDataUrl) return

    // F-SCAN-SAFETY-002 guard 3: belt-and-suspenders sanity. A real
    // JPEG-as-data-URL clears 4 KB easily; anything below is empty
    // / 1×1 / placeholder and shouldn't burn a Vision API call.
    if (
      !imageDataUrl.startsWith("data:image/") ||
      imageDataUrl.length < 4096
    ) {
      toast.error(tx("scan.error.noFrame", lang))
      return
    }

    setIsScanning(true)
    try {
      // F-INTERACTION-VISION-001 hotfix: /api/scan-medication
      // Stage 1 rejects requests without a Bearer token (401
      // auth_required). Initial implementation assumed the auth
      // header was optional — reading MedicationScanner.tsx:154-159
      // shows the canonical pattern is `createBrowserClient` →
      // `getSession` → conditional Bearer. Mirroring that here.
      // If the session can't be loaded (guest, expired token,
      // signed-out tab), surface the same "sign in to use this
      // tool" copy used by the Etkileşim Denetleyicisi DrugInput
      // "Profilden yükle" auth gate, then close the modal so the
      // user lands back on the page where they can sign in.
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        toast.error(tx("nav.loginRequired", lang))
        setIsScanning(false)
        onClose()
        return
      }

      const res = await fetch("/api/scan-medication", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ image: imageDataUrl, lang }),
      })

      // F-INTERACTION-VISION-002: every "AI couldn't tell us what's
      // in this photo" branch — HTTP non-2xx, 200 with an empty /
      // error envelope, network catch — flows into
      // handleNotRecognized() instead of the previous toast +
      // dead-end on the preview screen. The auth_required (401)
      // case is intercepted earlier by the session guard above
      // (hotfix 41b5eed), so the !res.ok arm here is the leftover
      // rate_limited / image_invalid / parse_failed / ocr_failed /
      // consent_blocked surface — all of which are genuine "AI
      // didn't help" rather than user / app errors, so the
      // manual-entry fallback is the right escape.
      if (!res.ok) {
        handleNotRecognized()
        return
      }

      const data = (await res.json()) as ScanResult

      // 200 with no recognised name — Stage 6 success path that
      // returns Claude's raw JSON when it shaped a "blocked" or
      // "couldn't read" envelope. Same fallback.
      if (data.error || (!data.brand_name && !data.generic_name)) {
        handleNotRecognized()
        return
      }

      setScanResult(data)
      setEditedName((data.brand_name || data.generic_name || "").trim())
      setMode("result")
      // Success path explicit cleanup. The previous version relied
      // on a `finally { setIsScanning(false) }` block; that's gone
      // now because every failure branch terminates inside
      // handleNotRecognized() (which already sets isScanning to
      // false). The success arm has to mirror that.
      setIsScanning(false)
    } catch {
      // Network / abort / JSON throw. The toast still fires here
      // because the user genuinely needs to know they're offline
      // (vs the AI just not recognising their photo) — but we
      // ALSO drop them into the manual-entry fallback so they
      // can keep working offline-ish if they know the med name.
      toast.error(tx("interaction.photoScan.networkError", lang))
      handleNotRecognized()
    }
  }

  const handleConfirm = () => {
    const trimmed = editedName.trim()
    if (!trimmed) {
      toast.error(tx("interaction.photoScan.emptyName", lang))
      return
    }
    onAdd(trimmed)
    toast.success(tx("interaction.photoScan.added", lang))
    onClose()
  }

  const handleRetake = () => {
    setImageDataUrl(null)
    setScanResult(null)
    setEditedName("")
    setMode("choose")
  }

  if (!open) return null

  return (
    // F-CHECKIN-MOBILE-001 round-4 modal pattern: centred dialog,
    // px-4 outer gutter on narrow phones, rounded-3xl + zoom/fade
    // entrance instead of a slide-up sheet.
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative w-full max-w-md bg-card shadow-2xl border max-h-[90vh] overflow-y-auto rounded-3xl animate-in zoom-in-95 fade-in-0 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ipc-title"
      >
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 id="ipc-title" className="text-lg font-bold">
              {tx("interaction.photoScan.title", lang)}
            </h2>
            <button
              onClick={onClose}
              aria-label={tx("interaction.photoScan.close", lang)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* MODE: choose ── camera or gallery */}
          {mode === "choose" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                {tx("interaction.photoScan.chooseDesc", lang)}
              </p>
              <Button onClick={startCamera} className="w-full min-h-11">
                <Camera className="h-4 w-4 mr-2" />
                {tx("interaction.photoScan.useCamera", lang)}
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full min-h-11"
              >
                <Upload className="h-4 w-4 mr-2" />
                {tx("interaction.photoScan.useGallery", lang)}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          )}

          {/* MODE: camera ── live viewfinder */}
          {mode === "camera" && (
            <div className="space-y-3">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-h-[60vh] sm:max-h-[400px] rounded-lg bg-black object-contain"
              />
              <Button onClick={capturePhoto} className="w-full min-h-11">
                <Camera className="h-4 w-4 mr-2" />
                {tx("interaction.photoScan.capture", lang)}
              </Button>
              <Button
                onClick={() => {
                  stopCamera()
                  setMode("choose")
                }}
                variant="ghost"
                className="w-full"
              >
                {tx("interaction.photoScan.retake", lang)}
              </Button>
            </div>
          )}

          {/* MODE: preview ── confirm or retake before analyse */}
          {mode === "preview" && imageDataUrl && (
            <div className="space-y-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageDataUrl}
                alt=""
                className="w-full max-h-[60vh] sm:max-h-[400px] rounded-lg object-contain bg-muted/40"
              />
              <Button
                onClick={analyzeImage}
                disabled={isScanning}
                className="w-full min-h-11"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {tx("interaction.photoScan.analyzing", lang)}
                  </>
                ) : (
                  tx("interaction.photoScan.analyze", lang)
                )}
              </Button>
              <Button
                onClick={handleRetake}
                variant="ghost"
                className="w-full"
                disabled={isScanning}
              >
                {tx("interaction.photoScan.retake", lang)}
              </Button>
            </div>
          )}

          {/* MODE: result ── confirm + manual edit + add to list.
              F-INTERACTION-VISION-002 — header + banner branching:
                - notRecognized=true (AI fail fallback)  → header
                  reuses namePlaceholder copy ("İlaç adı"), banner
                  shows the manual-entry prompt.
                - confidence="low" (AI guessed but unsure) → header
                  stays optimistic ("Tanınan ilaç"), banner shows
                  the verify-the-name hint.
                - default (high/medium confidence)        → no
                  banner, header optimistic.
              The two amber banners are mutually exclusive — when
              the AI fully failed there's nothing to verify, just
              an empty input to fill. */}
          {mode === "result" && scanResult && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/20 p-4 space-y-2">
                <p className="text-xs text-muted-foreground">
                  {scanResult.notRecognized
                    ? tx("interaction.photoScan.namePlaceholder", lang)
                    : tx("interaction.photoScan.recognizedAs", lang)}
                </p>
                {/* F-MOBILE-002b: text-base sm:text-sm prevents iOS
                    Safari auto-zoom; min-h-11 md:min-h-9 for touch
                    target. */}
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="text-base sm:text-sm min-h-11 md:min-h-9 font-medium"
                  placeholder={tx("interaction.photoScan.namePlaceholder", lang)}
                  autoFocus
                />
                {scanResult.notRecognized ? (
                  <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Pencil className="h-3 w-3" />
                    {tx("interaction.photoScan.notRecognizedManual", lang)}
                  </p>
                ) : scanResult.confidence === "low" ? (
                  <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Pencil className="h-3 w-3" />
                    {tx("interaction.photoScan.lowConfidence", lang)}
                  </p>
                ) : null}
                {scanResult.dosage && (
                  <p className="text-xs text-muted-foreground">
                    {tx("interaction.photoScan.dosageHint", lang)}: {scanResult.dosage}
                  </p>
                )}
              </div>
              <Button onClick={handleConfirm} className="w-full min-h-11">
                <Check className="h-4 w-4 mr-2" />
                {tx("interaction.photoScan.addToList", lang)}
              </Button>
              <Button onClick={handleRetake} variant="ghost" className="w-full">
                {tx("interaction.photoScan.retake", lang)}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
