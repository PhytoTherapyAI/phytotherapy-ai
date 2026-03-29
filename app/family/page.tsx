"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { FamilyManager } from "@/components/family/FamilyManager"
import { Users, Loader2 } from "lucide-react"

export default function FamilyPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
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
    <div className="min-h-screen bg-gradient-to-b from-teal-50/50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-100 dark:bg-teal-900/30 mb-4">
            <Users className="h-8 w-8 text-teal-600 dark:text-teal-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {tx("family.title", lang)}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {lang === "tr"
              ? "Ailenizin sağlık profillerini yönetin, herkes için kişiselleştirilmiş öneriler alın"
              : "Manage your family's health profiles and get personalized recommendations for everyone"}
          </p>
        </div>

        <FamilyManager
          userId={user.id}
          lang={lang}
          isPremium={true}
        />
      </div>
    </div>
  )
}
