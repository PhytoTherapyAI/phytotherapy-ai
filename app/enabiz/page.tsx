// © 2026 Phytotherapy.ai — All Rights Reserved
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  Shield,
  Database,
} from "lucide-react"

interface ImportedRecord {
  type: string
  date: string
  value: string
  unit: string
}

export default function EnabizPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const { lang } = useLang()
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [imported, setImported] = useState<ImportedRecord[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/auth/login")
  }, [isLoading, isAuthenticated, router])

  const handleImport = async () => {
    if (!file) return
    setImporting(true)
    setError("")

    try {
      // Simulate PDF parsing — in real implementation this would use
      // Gemini Vision to extract structured data from E-Nabız PDF
      await new Promise((r) => setTimeout(r, 2000))

      // Mock imported data for demonstration
      const mockData: ImportedRecord[] = [
        { type: "Hemoglobin", date: "2026-01-15", value: "14.2", unit: "g/dL" },
        { type: "Vitamin D", date: "2026-01-15", value: "28", unit: "ng/mL" },
        { type: "TSH", date: "2026-01-15", value: "2.1", unit: "mIU/L" },
        { type: "Glucose", date: "2026-01-15", value: "95", unit: "mg/dL" },
        { type: "Total Cholesterol", date: "2026-01-15", value: "198", unit: "mg/dL" },
      ]

      setImported(mockData)
    } catch {
      setError(tx("enabiz.error", lang))
    } finally {
      setImporting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          {tx("enabiz.title", lang)}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{tx("enabiz.subtitle", lang)}</p>
      </div>

      {/* How it works */}
      <div className="mb-6 rounded-xl border bg-card p-5">
        <h3 className="mb-3 font-semibold">
          {tx("enabiz.howItWorks", lang)}
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-start gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">1</div>
            <div>
              <p className="text-sm font-medium">{tx("enabiz.step1", lang)}</p>
              <p className="text-xs text-muted-foreground">enabiz.gov.tr</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">2</div>
            <div>
              <p className="text-sm font-medium">{tx("enabiz.step2", lang)}</p>
              <p className="text-xs text-muted-foreground">{tx("enabiz.step2Desc", lang)}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">3</div>
            <div>
              <p className="text-sm font-medium">{tx("enabiz.step3", lang)}</p>
              <p className="text-xs text-muted-foreground">{tx("enabiz.step3Desc", lang)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload */}
      <div className="mb-6">
        <div className="rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/20 p-8 text-center">
          <Upload className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="mb-3 text-sm font-medium">
            {tx("enabiz.uploadPdf", lang)}
          </p>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mx-auto block text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary file:cursor-pointer"
          />
          {file && (
            <div className="mt-3 flex items-center justify-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm">{file.name}</span>
              <button
                onClick={handleImport}
                disabled={importing}
                className="ml-2 rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {importing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  tx("enabiz.import", lang)
                )}
              </button>
            </div>
          )}
        </div>
        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* Imported Results */}
      {imported.length > 0 && (
        <div className="mb-6 rounded-xl border bg-card">
          <div className="flex items-center gap-2 border-b p-4">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold">
              {`${imported.length} ${tx("enabiz.recordsImported", lang)}`}
            </h3>
          </div>
          <div className="divide-y">
            {imported.map((record, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <Database className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{record.type}</p>
                  <p className="text-xs text-muted-foreground">{record.date}</p>
                </div>
                <p className="text-sm font-semibold">{record.value} <span className="text-xs text-muted-foreground">{record.unit}</span></p>
              </div>
            ))}
          </div>
          <div className="border-t p-4">
            <button
              onClick={() => router.push("/blood-test")}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <FileText className="h-4 w-4" />
              {tx("enabiz.goToBloodTest", lang)}
            </button>
          </div>
        </div>
      )}

      {/* Security note */}
      <div className="rounded-xl border bg-muted/30 p-4">
        <div className="flex items-start gap-2">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
          <div>
            <p className="text-sm font-medium">{tx("enabiz.dataSecurity", lang)}</p>
            <p className="text-xs text-muted-foreground">
              {tx("enabiz.dataSecurityDesc", lang)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
