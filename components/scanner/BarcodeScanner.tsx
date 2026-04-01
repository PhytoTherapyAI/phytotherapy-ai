// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ScanBarcode, Loader2, CheckCircle2, AlertTriangle,
  X, RotateCcw, Plus,
} from "lucide-react"
import { tx, type Lang } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"

interface BarcodeScannerProps {
  userId: string
  lang: Lang
  onSupplementFound?: (name: string) => void
}

interface ProductInfo {
  name: string
  brand: string
  barcode: string
  found: boolean
}

export function BarcodeScanner({ userId, lang, onSupplementFound }: BarcodeScannerProps) {
  const [mode, setMode] = useState<"idle" | "scanning" | "looking-up" | "result">("idle")
  const [product, setProduct] = useState<ProductInfo | null>(null)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scannerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const tr = lang === "tr"

  const stopCamera = useCallback(() => {
    if (scannerRef.current) {
      clearInterval(scannerRef.current)
      scannerRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }, [])

  const lookupBarcode = async (code: string) => {
    setMode("looking-up")
    try {
      // Use Open Food Facts API (free, no key needed)
      const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`)
      if (res.ok) {
        const data = await res.json()
        if (data.status === 1 && data.product) {
          setProduct({
            name: data.product.product_name || code,
            brand: data.product.brands || "",
            barcode: code,
            found: true,
          })
        } else {
          setProduct({ name: "", brand: "", barcode: code, found: false })
        }
      } else {
        setProduct({ name: "", brand: "", barcode: code, found: false })
      }
    } catch {
      setProduct({ name: "", brand: "", barcode: code, found: false })
    }
    setMode("result")
  }

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setMode("scanning")

      // Use Quagga2 for barcode detection
      const Quagga = (await import("@ericblade/quagga2")).default

      // Poll video frames for barcodes
      scannerRef.current = setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) return

        const canvas = document.createElement("canvas")
        canvas.width = videoRef.current.videoWidth
        canvas.height = videoRef.current.videoHeight
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        ctx.drawImage(videoRef.current, 0, 0)

        try {
          const result = await Quagga.decodeSingle({
            src: canvas.toDataURL("image/jpeg", 0.8),
            numOfWorkers: 0,
            decoder: {
              readers: ["ean_reader", "ean_8_reader", "upc_reader", "upc_e_reader"],
            },
            locate: true,
          })

          if (result?.codeResult?.code) {
            stopCamera()
            lookupBarcode(result.codeResult.code)
          }
        } catch {
          // No barcode found in this frame — continue scanning
        }
      }, 500)
    } catch {
      // Camera not available
      setMode("idle")
    }
  }

  const addToSupplements = async () => {
    if (!product?.name) return
    setAdding(true)
    try {
      const supabase = createBrowserClient()
      const today = new Date().toISOString().split("T")[0]
      await supabase.from("calendar_events").insert({
        user_id: userId,
        event_type: "supplement",
        title: product.name,
        event_date: today,
        recurrence: "daily",
        metadata: {
          barcode: product.barcode,
          brand: product.brand,
          addedFromBarcode: true,
        },
      })
      setAdded(true)
      onSupplementFound?.(product.name)
    } catch {
      // silently fail
    } finally {
      setAdding(false)
    }
  }

  const reset = () => {
    stopCamera()
    setMode("idle")
    setProduct(null)
    setAdded(false)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera()
  }, [stopCamera])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <ScanBarcode className="h-4 w-4 text-primary" />
          {tx("scanner.barcodeTitle", lang)}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {tx("scanner.barcodeSubtitle", lang)}
        </p>
      </CardHeader>
      <CardContent>
        {/* Idle */}
        {mode === "idle" && (
          <Button size="sm" className="w-full" onClick={startScanning}>
            <ScanBarcode className="mr-1.5 h-3.5 w-3.5" />
            {tx("scanner.startScan", lang)}
          </Button>
        )}

        {/* Scanning */}
        {mode === "scanning" && (
          <div className="space-y-2">
            <div className="relative overflow-hidden rounded-lg">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-16 w-48 rounded border-2 border-primary/50 bg-primary/5" />
              </div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1">
                <p className="text-[10px] text-white">
                  {tx("scan.alignBarcode", lang)}
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="w-full" onClick={() => { stopCamera(); setMode("idle") }}>
              <X className="mr-1.5 h-3 w-3" />
              {tx("scan.cancel", lang)}
            </Button>
          </div>
        )}

        {/* Looking up */}
        {mode === "looking-up" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {tx("scan.lookingUp", lang)}
            </p>
          </div>
        )}

        {/* Result */}
        {mode === "result" && product && (
          <div className="space-y-3">
            {product.found ? (
              <div className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[9px] bg-green-100 text-green-700">
                    <CheckCircle2 className="mr-0.5 h-2.5 w-2.5" />
                    {tx("scan.found", lang)}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">{product.barcode}</span>
                </div>
                <p className="text-sm font-bold">{product.name}</p>
                {product.brand && (
                  <p className="text-xs text-muted-foreground">{product.brand}</p>
                )}

                <Button
                  size="sm"
                  className="w-full"
                  onClick={addToSupplements}
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
                    ? tx("scan.addedSupplement", lang)
                    : tx("scan.addToSupplements", lang)
                  }
                </Button>
              </div>
            ) : (
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 px-3 py-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    {tx("scan.notFound", lang)}
                  </p>
                  <p className="text-[10px] text-amber-600 dark:text-amber-500">
                    {tr ? `Barkod: ${product.barcode}` : `Barcode: ${product.barcode}`}
                  </p>
                </div>
              </div>
            )}

            <Button size="sm" variant="outline" className="w-full" onClick={reset}>
              <RotateCcw className="mr-1.5 h-3 w-3" />
              {tx("scan.scanAgain", lang)}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
