"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { MedicationScanner } from "@/components/scanner/MedicationScanner"
import { BarcodeScanner } from "@/components/scanner/BarcodeScanner"
import { Camera, Loader2 } from "lucide-react"

export default function ScannerPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, refreshProfile } = useAuth()
  const { lang } = useLang()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Camera className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-semibold">{tx("scanner.title", lang)}</h1>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <MedicationScanner
          userId={user.id}
          lang={lang}
          onMedicationFound={() => refreshProfile()}
        />
        <BarcodeScanner
          userId={user.id}
          lang={lang}
        />
      </div>
    </div>
  )
}
