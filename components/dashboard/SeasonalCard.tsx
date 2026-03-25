"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Leaf, Snowflake, Sun, CloudRain, Pill, Salad, Dumbbell, Share2 } from "lucide-react"
import { tx, type Lang } from "@/lib/translations"
import { ShareCardBase } from "@/components/share/ShareCardBase"
import { ShareModal } from "@/components/share/ShareModal"

interface SeasonalCardProps {
  lang: Lang
  userMedications?: string[]
  userConditions?: string[]
}

interface SeasonInfo {
  id: string
  icon: React.ReactNode
  emoji: string
  name: Record<"en" | "tr", string>
  color: string
  colorEnd: string
  tips: Array<{
    type: "supplement" | "nutrition" | "exercise" | "lifestyle"
    name: Record<"en" | "tr", string>
    detail: Record<"en" | "tr", string>
  }>
}

const SEASONS: Record<string, SeasonInfo> = {
  spring: {
    id: "spring",
    icon: <Leaf className="h-4 w-4 text-green-500" />,
    emoji: "🌸",
    name: { en: "Spring", tr: "İlkbahar" },
    color: "#22c55e",
    colorEnd: "#86efac",
    tips: [
      { type: "supplement", name: { en: "Quercetin", tr: "Kuersetin" }, detail: { en: "500mg daily for allergy prevention", tr: "Alerji önleme için günde 500mg" } },
      { type: "supplement", name: { en: "Vitamin C", tr: "C Vitamini" }, detail: { en: "1000mg daily — immune + antihistamine", tr: "Günde 1000mg — bağışıklık + antihistamin" } },
      { type: "nutrition", name: { en: "Local honey", tr: "Yerel bal" }, detail: { en: "1 tbsp daily for pollen desensitization", tr: "Polen duyarsızlaştırma için günde 1 yemek kaşığı" } },
      { type: "exercise", name: { en: "Outdoor exercise", tr: "Açık hava egzersizi" }, detail: { en: "Best between 10am-3pm (lower pollen)", tr: "En iyi 10:00-15:00 arası (düşük polen)" } },
      { type: "lifestyle", name: { en: "Air quality", tr: "Hava kalitesi" }, detail: { en: "Check pollen forecast before outdoor activities", tr: "Dışarı çıkmadan polen tahminini kontrol et" } },
    ],
  },
  summer: {
    id: "summer",
    icon: <Sun className="h-4 w-4 text-amber-500" />,
    emoji: "☀️",
    name: { en: "Summer", tr: "Yaz" },
    color: "#f59e0b",
    colorEnd: "#fde68a",
    tips: [
      { type: "supplement", name: { en: "Electrolytes", tr: "Elektrolitler" }, detail: { en: "Add to water during exercise or heat", tr: "Egzersiz veya sıcakta suya ekle" } },
      { type: "supplement", name: { en: "Vitamin D (reduce)", tr: "D Vitamini (azalt)" }, detail: { en: "Natural sun exposure may suffice — check levels", tr: "Doğal güneş yeterli olabilir — seviyeyi kontrol et" } },
      { type: "nutrition", name: { en: "Hydration focus", tr: "Hidrasyon odaklı" }, detail: { en: "3L+ daily, watermelon, cucumber, coconut water", tr: "Günde 3L+, karpuz, salatalık, hindistan cevizi suyu" } },
      { type: "exercise", name: { en: "Morning training", tr: "Sabah antrenmanı" }, detail: { en: "Exercise before 9am or after 7pm", tr: "09:00'dan önce veya 19:00'dan sonra egzersiz" } },
      { type: "lifestyle", name: { en: "Sun protection", tr: "Güneş koruması" }, detail: { en: "SPF 50+ reapply every 2hrs, avoid 12-4pm", tr: "SPF 50+ her 2 saatte yenile, 12-16 arası kaçın" } },
    ],
  },
  autumn: {
    id: "autumn",
    icon: <CloudRain className="h-4 w-4 text-orange-500" />,
    emoji: "🍂",
    name: { en: "Autumn", tr: "Sonbahar" },
    color: "#ea580c",
    colorEnd: "#fdba74",
    tips: [
      { type: "supplement", name: { en: "Vitamin D3", tr: "D3 Vitamini" }, detail: { en: "Start 2000-4000 IU as sun exposure drops", tr: "Güneş azaldıkça 2000-4000 IU başla" } },
      { type: "supplement", name: { en: "Zinc", tr: "Çinko" }, detail: { en: "15mg daily for cold prevention", tr: "Soğuk algınlığı önleme için günde 15mg" } },
      { type: "nutrition", name: { en: "Warm soups", tr: "Sıcak çorbalar" }, detail: { en: "Bone broth, turmeric soups for immunity", tr: "Kemik suyu, zerdeçal çorbaları bağışıklık için" } },
      { type: "exercise", name: { en: "Indoor transition", tr: "İç mekan geçişi" }, detail: { en: "Transition some workouts indoors as weather cools", tr: "Hava soğudukça bazı antrenmanları iç mekana taşı" } },
      { type: "lifestyle", name: { en: "Sleep schedule", tr: "Uyku düzeni" }, detail: { en: "Adjust to earlier darkness — sleep hygiene reset", tr: "Erken karanlığa uyum sağla — uyku hijyeni sıfırla" } },
    ],
  },
  winter: {
    id: "winter",
    icon: <Snowflake className="h-4 w-4 text-blue-500" />,
    emoji: "❄️",
    name: { en: "Winter", tr: "Kış" },
    color: "#3b82f6",
    colorEnd: "#93c5fd",
    tips: [
      { type: "supplement", name: { en: "Vitamin D3", tr: "D3 Vitamini" }, detail: { en: "4000 IU daily — essential in winter", tr: "Günde 4000 IU — kışın zorunlu" } },
      { type: "supplement", name: { en: "Elderberry", tr: "Mürver" }, detail: { en: "500mg daily for immune support", tr: "Bağışıklık desteği için günde 500mg" } },
      { type: "nutrition", name: { en: "Vitamin C foods", tr: "C Vitamini gıdalar" }, detail: { en: "Citrus, kiwi, bell peppers daily", tr: "Günlük narenciye, kivi, biber" } },
      { type: "exercise", name: { en: "Stay active indoors", tr: "İç mekanda aktif kal" }, detail: { en: "Home workouts, yoga, stretching — don't stop moving", tr: "Ev egzersizi, yoga, esneme — hareketi bırakma" } },
      { type: "lifestyle", name: { en: "Light therapy", tr: "Işık terapisi" }, detail: { en: "10min bright light within 30min of waking", tr: "Uyandıktan 30dk içinde 10dk parlak ışık" } },
    ],
  },
}

function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1
  if (month >= 3 && month <= 5) return "spring"
  if (month >= 6 && month <= 8) return "summer"
  if (month >= 9 && month <= 11) return "autumn"
  return "winter"
}

const tipIcon = (type: string) => {
  switch (type) {
    case "supplement": return <Pill className="h-3 w-3 text-green-500" />
    case "nutrition": return <Salad className="h-3 w-3 text-amber-500" />
    case "exercise": return <Dumbbell className="h-3 w-3 text-blue-500" />
    default: return <Sun className="h-3 w-3 text-purple-500" />
  }
}

// Known supplement-drug interaction pairs for warning display
const KNOWN_INTERACTIONS: Record<string, string[]> = {
  "elderberry": ["immunosuppressant", "cyclosporine", "azathioprine"],
  "vitamin d": ["digoxin", "thiazide"],
  "zinc": ["antibiotics", "penicillamine"],
  "quercetin": ["cyclosporine", "digoxin"],
  "vitamin c": ["warfarin", "aspirin"],
  "electrolytes": ["ace inhibitor", "lisinopril", "spironolactone"],
}

function hasInteraction(supplementName: string, medications: string[]): boolean {
  if (medications.length === 0) return false
  const lowerName = supplementName.toLowerCase()
  const interactions = Object.entries(KNOWN_INTERACTIONS).find(([k]) => lowerName.includes(k))
  if (!interactions) return false
  return medications.some(med => {
    const lowerMed = med.toLowerCase()
    return interactions[1].some(drug => lowerMed.includes(drug))
  })
}

export function SeasonalCard({ lang, userMedications = [], userConditions = [] }: SeasonalCardProps) {
  const [showShareCard, setShowShareCard] = useState(false)
  const seasonId = getCurrentSeason()
  const season = SEASONS[seasonId]
  const tr = lang === "tr"

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            {season.icon}
            {tr ? `${season.name.tr} Hazırlık` : `${season.name.en} Prep`}
            <Badge variant="secondary" className="ml-auto text-[10px]">{season.emoji}</Badge>
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {tr ? "Mevsime özel sağlık önerileri" : "Season-specific health tips"}
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {season.tips.map((tip, i) => {
            const interactionWarning = tip.type === "supplement" && hasInteraction(tip.name.en, userMedications)
            return (
              <div key={i} className={`flex items-start gap-2 rounded-lg border px-3 py-2 ${interactionWarning ? "border-amber-300 bg-amber-50/50 dark:border-amber-700 dark:bg-amber-950/20" : ""}`}>
                {tipIcon(tip.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium">{tip.name[lang]}</p>
                  <p className="text-[10px] text-muted-foreground">{tip.detail[lang]}</p>
                  {interactionWarning && (
                    <p className="text-[10px] font-medium text-amber-600 dark:text-amber-400 mt-0.5">
                      ⚠️ {tr ? "İlaçlarınızla etkileşebilir — doktorunuza danışın" : "May interact with your medications — consult your doctor"}
                    </p>
                  )}
                </div>
              </div>
            )
          })}

          <button
            onClick={() => setShowShareCard(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed px-3 py-2 text-xs font-medium text-primary hover:bg-primary/5 hover:border-primary/40 transition-all mt-2"
          >
            <Share2 className="h-3 w-3" />
            {tx("share.share", lang)}
          </button>
        </CardContent>
      </Card>

      <ShareModal open={showShareCard} onClose={() => setShowShareCard(false)}>
        <ShareCardBase
          lang={lang}
          fileName={`seasonal-${seasonId}.png`}
          shareTitle={tr ? `${season.name.tr} Sağlık Önerileri` : `${season.name.en} Health Tips`}
          shareText={
            tr
              ? `${season.emoji} ${season.name.tr} mevsimi için sağlık önerilerimi paylaşıyorum!`
              : `${season.emoji} Sharing my ${season.name.en} health prep tips!`
          }
        >
          <div
            className="relative overflow-hidden rounded-2xl"
            style={{
              width: "360px",
              minHeight: "460px",
              background: `linear-gradient(135deg, ${season.color} 0%, ${season.colorEnd} 100%)`,
              fontFamily: '"DM Sans", system-ui, sans-serif',
            }}
          >
            <div className="absolute right-4 top-12 opacity-10" style={{ fontSize: "120px", lineHeight: 1 }}>
              {season.emoji}
            </div>
            <div className="relative z-10 flex h-full flex-col p-6 text-white">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-2xl">🌿</span>
                <span className="text-sm font-semibold tracking-wide opacity-90">Phytotherapy.ai</span>
              </div>
              <h2 className="mb-1 text-xl font-extrabold">
                {season.emoji} {tr ? `${season.name.tr} Hazırlık` : `${season.name.en} Prep Guide`}
              </h2>
              <p className="mb-5 text-sm opacity-80">
                {tr ? "Mevsime özel sağlık önerileri" : "Season-specific health recommendations"}
              </p>
              <div className="space-y-2">
                {season.tips.map((tip, i) => (
                  <div key={i} className="rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.15)" }}>
                    <p className="text-xs font-bold">{tip.name[lang]}</p>
                    <p className="text-[10px] opacity-80">{tip.detail[lang]}</p>
                  </div>
                ))}
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-white/20 pt-3">
                <span className="text-[10px] opacity-60">phytotherapy.ai</span>
                <span className="text-[10px] opacity-60">
                  {new Date().toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US")}
                </span>
              </div>
            </div>
          </div>
        </ShareCardBase>
      </ShareModal>
    </>
  )
}
