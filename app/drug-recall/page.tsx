"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { createBrowserClient } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Shield, ArrowLeft, Search, Bell, ExternalLink, AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"

interface RecallEntry {
  id: string
  drugName: string
  genericName: string
  reason: { en: string; tr: string }
  date: string
  severity: "critical" | "moderate" | "low"
  action: { en: string; tr: string }
  source: string
  lot?: string
}

const RECALL_DATABASE: RecallEntry[] = [
  { id: "r1", drugName: "Losartan Potassium", genericName: "losartan", reason: { en: "NDEA impurity above acceptable limit", tr: "NDEA safsizligi kabul edilebilir sinirin uzerinde" }, date: "2026-03-15", severity: "critical", action: { en: "Stop taking immediately, consult doctor for alternative", tr: "Hemen kullanmayi birakin, alternatif icin doktorunuza danisin" }, source: "FDA" },
  { id: "r2", drugName: "Metformin HCl ER", genericName: "metformin", reason: { en: "NDMA levels exceed acceptable daily intake", tr: "NDMA seviyeleri kabul edilebilir gunluk alimi asiyor" }, date: "2026-03-10", severity: "critical", action: { en: "Contact pharmacist for non-extended-release alternative", tr: "Uzatilmis salimli olmayan alternatif icin eczaciniza danisin" }, source: "FDA", lot: "LOT-2026-0312" },
  { id: "r3", drugName: "Ranitidine (Zantac)", genericName: "ranitidine", reason: { en: "NDMA contamination risk increases with storage", tr: "Depolama ile NDMA kontaminasyon riski artiyor" }, date: "2026-02-28", severity: "critical", action: { en: "Dispose of all remaining tablets, switch to famotidine", tr: "Kalan tum tabletleri atin, famotidine'e gecin" }, source: "EMA" },
  { id: "r4", drugName: "Valsartan", genericName: "valsartan", reason: { en: "Potential NDEA carcinogen detected in batch", tr: "Partide potansiyel NDEA kanserojen tespit edildi" }, date: "2026-02-20", severity: "critical", action: { en: "Return to pharmacy, request replacement from different manufacturer", tr: "Eczaneye iade edin, farkli uretici urununu isteyin" }, source: "FDA" },
  { id: "r5", drugName: "Acetaminophen 500mg (Parol)", genericName: "acetaminophen", reason: { en: "Dosing instructions missing from packaging", tr: "Ambalajda dozaj talimatlari eksik" }, date: "2026-02-15", severity: "moderate", action: { en: "Check lot number, contact manufacturer for correct dosing label", tr: "Lot numarasini kontrol edin, dogru dozaj etiketi icin ureticiye ulas" }, source: "TITCK", lot: "LOT-PR-2026" },
  { id: "r6", drugName: "Omeprazole 20mg", genericName: "omeprazole", reason: { en: "Cross-contamination with another active ingredient", tr: "Baska bir etkin madde ile capraz kontaminasyon" }, date: "2026-02-01", severity: "critical", action: { en: "Stop use and return to pharmacy immediately", tr: "Kullanimi durdurun ve hemen eczaneye iade edin" }, source: "TITCK" },
  { id: "r7", drugName: "Ibuprofen 400mg", genericName: "ibuprofen", reason: { en: "Tablet hardness below specification - may dissolve too fast", tr: "Tablet sertligi spesifikasyonun altinda - cok hizli cozunebilir" }, date: "2026-01-25", severity: "low", action: { en: "No health risk, but exchange at pharmacy if concerned", tr: "Sağlık riski yok ama endise duyarsaniz eczanede degistirin" }, source: "TITCK" },
  { id: "r8", drugName: "Atorvastatin 20mg", genericName: "atorvastatin", reason: { en: "Mislabeled dosage strength on bottle", tr: "Sisede yanlis dozaj gucu etiketi" }, date: "2026-01-18", severity: "moderate", action: { en: "Verify tablet markings match prescribed dose", tr: "Tablet isaretlerinin recelenen dozla eslesmesini dogrulayin" }, source: "FDA" },
  { id: "r9", drugName: "Amoxicillin 500mg", genericName: "amoxicillin", reason: { en: "Reduced potency detected before expiration date", tr: "Son kullanma tarihinden once azalmis potens tespit edildi" }, date: "2026-01-10", severity: "moderate", action: { en: "Get new prescription filled, report to pharmacist", tr: "Yeni recete yazdirin, eczaciya bildirin" }, source: "EMA" },
  { id: "r10", drugName: "Amlodipine 5mg", genericName: "amlodipine", reason: { en: "Foreign particle found in select batches", tr: "Belirli partilerde yabanci parcacik bulundu" }, date: "2026-01-05", severity: "moderate", action: { en: "Check lot number, return affected batch to pharmacy", tr: "Lot numarasini kontrol edin, etkilenen partiyi eczaneye iade edin" }, source: "FDA", lot: "AML-2025-1198" },
  { id: "r11", drugName: "Levothyroxine 50mcg", genericName: "levothyroxine", reason: { en: "Sub-potent tablets detected in quality testing", tr: "Kalite testinde düşük potensli tabletler tespit edildi" }, date: "2025-12-28", severity: "critical", action: { en: "Get thyroid levels checked, switch to verified batch", tr: "Tiroid degerlerini kontrol ettirin, dogrulanmis partiye gecin" }, source: "FDA" },
  { id: "r12", drugName: "Pantoprazole 40mg", genericName: "pantoprazole", reason: { en: "Discoloration observed in tablets", tr: "Tabletlerde renk degisikligi gozlemlendi" }, date: "2025-12-15", severity: "low", action: { en: "Visual inspection - discolored tablets should not be taken", tr: "Gorsel kontrol - rengi degismis tabletler alinmamali" }, source: "TITCK" },
]

const tx: Record<string, { en: string; tr: string }> = {
  title: { en: "Drug Recall Alerts", tr: "İlaç Geri Cagirma Uyarılari" },
  subtitle: { en: "Stay informed about recalled medications", tr: "Geri cagirilan ilaclar hakkinda bilgi edinin" },
  affectsYou: { en: "AFFECTS YOUR MEDICATION", tr: "ILACINIZI ETKILIYOR" },
  critical: { en: "Critical", tr: "Kritik" },
  moderate: { en: "Moderate", tr: "Orta" },
  low: { en: "Low", tr: "Düşük" },
  action: { en: "Recommended Action", tr: "Onerilen Islem" },
  search: { en: "Search recalls...", tr: "Geri cagirma ara..." },
  yourMeds: { en: "Your Medications", tr: "İlaçlariniz" },
  allRecalls: { en: "All Recent Recalls", tr: "Tum Son Geri Cagirmalar" },
  noMatch: { en: "None of your medications are currently recalled", tr: "İlaçlarinizin hicbiri su anda geri cagrilmamis" },
  safe: { en: "You're safe", tr: "Guvendesiniz" },
  source: { en: "Source", tr: "Kaynak" },
  lot: { en: "Lot", tr: "Lot" },
  back: { en: "Back", tr: "Geri" },
  loginHint: { en: "Log in to check against your medication profile", tr: "İlaç profilinizle kontrol etmek icin giris yapin" },
}

export default function DrugRecallPage() {
  const { user } = useAuth()
  const { lang } = useLang()
  const t = (key: string) => tx[key]?.[lang as "en" | "tr"] || tx[key]?.en || key

  const [userMeds, setUserMeds] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMeds()
  }, [user])

  const loadMeds = async () => {
    if (!user) { setLoading(false); return }
    try {
      const supabase = createBrowserClient()
      const { data } = await supabase
        .from("user_medications")
        .select("medication_name")
        .eq("user_id", user.id)
      setUserMeds((data || []).map((d: any) => d.medication_name.toLowerCase()))
    } catch { /* ignore */ }
    setLoading(false)
  }

  const isAffected = (entry: RecallEntry) =>
    userMeds.some((med) =>
      med.includes(entry.genericName.toLowerCase()) ||
      entry.drugName.toLowerCase().includes(med) ||
      med.includes(entry.drugName.toLowerCase())
    )

  const filtered = RECALL_DATABASE.filter((r) => {
    if (!search) return true
    const s = search.toLowerCase()
    return r.drugName.toLowerCase().includes(s) || r.genericName.toLowerCase().includes(s)
  })

  const affected = filtered.filter(isAffected)
  const rest = filtered.filter((r) => !isAffected(r))

  const severityColor = (s: string) => {
    if (s === "critical") return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
    if (s === "moderate") return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
    return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
  }

  const severityBorder = (s: string) => {
    if (s === "critical") return "border-l-red-500"
    if (s === "moderate") return "border-l-amber-500"
    return "border-l-green-500"
  }

  const RecallCard = ({ entry, highlight }: { entry: RecallEntry; highlight: boolean }) => (
    <Card className={`p-4 border-l-4 ${severityBorder(entry.severity)} ${highlight ? "ring-2 ring-red-500 bg-red-50/50 dark:bg-red-950/20" : ""}`}>
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 dark:text-white">{entry.drugName}</h3>
              <Badge className={`text-xs ${severityColor(entry.severity)}`}>
                {t(entry.severity)}
              </Badge>
              {highlight && (
                <Badge className="text-xs bg-red-500 text-white animate-pulse">
                  <AlertTriangle className="w-3 h-3 mr-1" />{t("affectsYou")}
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {entry.genericName} | {entry.date} | {t("source")}: {entry.source}
              {entry.lot && <> | {t("lot")}: {entry.lot}</>}
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {entry.reason[lang as "en" | "tr"] || entry.reason.en}
        </p>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mt-1">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t("action")}:</p>
          <p className="text-sm text-gray-800 dark:text-gray-200">
            {entry.action[lang as "en" | "tr"] || entry.action.en}
          </p>
        </div>
      </div>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="w-6 h-6 text-red-500" />{t("title")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("subtitle")}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search")}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Login hint */}
        {!user && !loading && (
          <Card className="p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />{t("loginHint")}
            </p>
          </Card>
        )}

        {/* Affected medications */}
        {user && !loading && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5" />{t("yourMeds")}
            </h2>
            {affected.length > 0 ? (
              affected.map((entry) => <RecallCard key={entry.id} entry={entry} highlight />)
            ) : (
              <Card className="p-4 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span><strong>{t("safe")}</strong> - {t("noMatch")}</span>
                </p>
              </Card>
            )}
          </div>
        )}

        {/* All recalls */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t("allRecalls")}</h2>
          {rest.map((entry) => <RecallCard key={entry.id} entry={entry} highlight={false} />)}
        </div>
      </div>
    </div>
  )
}
