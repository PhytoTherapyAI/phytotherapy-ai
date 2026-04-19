// © 2026 DoctoPal — All Rights Reserved
// Gizlilik guard'ı — bir sayfa/alan yalnızca kullanıcının kendi profili için
// güvenli şekilde veri render edebiliyorsa (örn. query_history, check-ins,
// rozet istatistikleri), aile üyesi profili aktifken bu sayfayı `children`
// render etmek yerine bir "İzin Yok" kart'ıyla değiştirir.
//
// Kullanım (hook-safe early return pattern):
//   const { isOwnProfile } = useActiveProfile()
//   // ... diğer hook'lar ...
//   if (!isOwnProfile) {
//     return <FamilyProfileGuard pageTitleTr="Arama Geçmişi" pageTitleEn="Search History" />
//   }
//   return <div>normal içerik</div>
//
// İpek'in KVKK kuralı: aile üyesi profilindeyken (isOwnProfile=false) login
// user'ın kendi verisi başkasının ekranında görünmemelidir. `allows_management`
// gelecekte bazı sayfaları aile üyesi adına gösterecek şekilde gevşetebilir,
// ama şu an için en güvenli davranış tamamen engellemek.
"use client"

import Link from "next/link"
import { ShieldAlert, User } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useActiveProfile } from "@/lib/use-active-profile"
import { useFamily } from "@/lib/family-context"
import { useLang } from "@/components/layout/language-toggle"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Props {
  pageTitleTr: string
  pageTitleEn: string
}

export function FamilyProfileGuard({ pageTitleTr, pageTitleEn }: Props) {
  const { user } = useAuth()
  const { activeUserId } = useActiveProfile()
  const { familyMembers, setActiveProfile } = useFamily()
  const { lang } = useLang()
  const tr = lang === "tr"

  const member = familyMembers.find((m) => m.user_id === activeUserId)
  const memberName =
    member?.profile?.full_name?.trim()
    || member?.nickname
    || (member?.profile?.display_name as string | undefined)?.trim()
    || (tr ? "Aile üyesi" : "Family member")
  const pageTitle = tr ? pageTitleTr : pageTitleEn

  return (
    <div className="mx-auto max-w-2xl px-4 md:px-8 py-12">
      <Card className="p-6 sm:p-8 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40 flex-shrink-0">
            <ShieldAlert className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground">
              {tr ? "Bu bilgiyi görüntüleme izniniz yok" : "You don't have permission to view this"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {tr ? (
                <>
                  Şu an <strong>{memberName}</strong> profilini görüntülüyorsunuz.
                  <strong> {pageTitle}</strong> kişisel veri içerdiği için yalnızca
                  profil sahibi tarafından görülebilir. KVKK gereği başka bir kullanıcının
                  kişisel geçmişi, istatistikleri ve aktivitesi sizinle paylaşılmaz.
                </>
              ) : (
                <>
                  You're currently viewing <strong>{memberName}</strong>'s profile.
                  <strong> {pageTitle}</strong> contains personal data and is only
                  accessible to the profile owner. Under KVKK, another user's personal
                  history, stats and activity cannot be shared with you.
                </>
              )}
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                onClick={async () => {
                  if (user?.id) await setActiveProfile(user.id)
                }}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                {tr ? "Kendi Profilime Dön" : "Switch to my profile"}
              </Button>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                {tr ? "Ana Sayfa" : "Home"}
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
