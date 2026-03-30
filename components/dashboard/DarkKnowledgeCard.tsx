"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Lightbulb, X, ChevronRight } from "lucide-react"
import { tx, type Lang } from "@/lib/translations"
import Link from "next/link"

interface DarkKnowledgeCardProps {
  lang: Lang
  medications?: string[]
  conditions?: string[]
}

interface KnowledgeFact {
  id: string
  triggers: string[]
  en: string
  tr: string
  link: string
  type: "medication" | "general"
}

const KNOWLEDGE_FACTS: KnowledgeFact[] = [
  // ── Medication-specific facts ──
  {
    id: "metformin-b12",
    triggers: ["metformin"],
    en: "Metformin can lower your B12 levels over time. Ask your doctor about yearly B12 testing.",
    tr: "Metformin zamanla B12 seviyenizi dusürebilir. Yillik B12 testi için doktorunuza danisın.",
    link: "/health-assistant",
    type: "medication",
  },
  {
    id: "ppi-calcium",
    triggers: ["omeprazole", "lansoprazole", "pantoprazole", "esomeprazole", "ppi"],
    en: "PPIs reduce calcium absorption. Take calcium supplements at least 4 hours apart from your PPI.",
    tr: "PPI'lar kalsiyum emilimini azaltır. Kalsiyum takviyenizi PPI'dan en az 4 saat arayla alin.",
    link: "/interaction-checker",
    type: "medication",
  },
  {
    id: "statin-grapefruit",
    triggers: ["atorvastatin", "simvastatin", "lovastatin", "statin"],
    en: "Grapefruit can increase statin levels in your blood. Consider avoiding grapefruit or grapefruit juice.",
    tr: "Greyfurt kanınızdaki statin seviyesini artırabilir. Greyfurt veya suyundan kacinmayi dusunun.",
    link: "/food-interaction",
    type: "medication",
  },
  {
    id: "warfarin-vitk",
    triggers: ["warfarin", "coumadin"],
    en: "Vitamin K affects warfarin. Keep consistent intake of leafy greens — don't suddenly increase or decrease.",
    tr: "K vitamini warfarini etkiler. Yesil yaprakli sebze tuketiminizi sabit tutun — aniden artirmayın veya azaltmayın.",
    link: "/food-interaction",
    type: "medication",
  },
  {
    id: "ssri-serotonin",
    triggers: ["sertraline", "fluoxetine", "citalopram", "escitalopram", "paroxetine", "ssri"],
    en: "St. John's Wort can cause serotonin syndrome with SSRIs. Never combine them without medical supervision.",
    tr: "Sarı kantaron SSRI'larla serotonin sendromuna neden olabilir. Tıbbi gözetim olmadan birlikte kullanmayın.",
    link: "/interaction-checker",
    type: "medication",
  },
  {
    id: "thyroid-timing",
    triggers: ["levothyroxine", "synthroid", "euthyrox"],
    en: "Take levothyroxine on an empty stomach, 30-60 min before food. Coffee and calcium reduce absorption.",
    tr: "Levotiroksin'i ac karnına, yemekten 30-60 dk once alin. Kahve ve kalsiyum emilimi azaltır.",
    link: "/health-assistant",
    type: "medication",
  },
  {
    id: "ace-potassium",
    triggers: ["lisinopril", "enalapril", "ramipril", "ace inhibitor"],
    en: "ACE inhibitors can raise potassium levels. Avoid excessive high-potassium foods like bananas and oranges.",
    tr: "ACE inhibitorleri potasyum seviyesini yukseltebilir. Muz ve portakal gibi yuksek potasyumlu gıdalardan kacınin.",
    link: "/food-interaction",
    type: "medication",
  },
  {
    id: "nsaid-stomach",
    triggers: ["ibuprofen", "naproxen", "aspirin", "nsaid", "diclofenac"],
    en: "NSAIDs can irritate your stomach lining. Always take them with food and avoid long-term daily use.",
    tr: "NSAID'ler mide mukozanizi tahris edebilir. Her zaman yemekle alin ve uzun sureli gunluk kullanindan kacinin.",
    link: "/health-assistant",
    type: "medication",
  },
  {
    id: "diabetes-feet",
    triggers: ["metformin", "insulin", "glipizide", "gliclazide"],
    en: "If you take diabetes medication, check your feet daily for cuts or sores. Early detection prevents complications.",
    tr: "Diyabet ilaci kullaniyorsanız ayaklarinizi gunluk kesik veya yara için kontrol edin.",
    link: "/diabetic-foot",
    type: "medication",
  },
  {
    id: "beta-blocker-exercise",
    triggers: ["metoprolol", "atenolol", "propranolol", "bisoprolol", "beta blocker"],
    en: "Beta-blockers lower your heart rate. Don't rely on heart rate alone to gauge exercise intensity — use perceived exertion instead.",
    tr: "Beta-blokerler kalp hizinizi dusurur. Egzersiz yogunlugunu sadece kalp hızıyla olcmeyin — hissedilen efor seviyesini kullaniın.",
    link: "/sports-performance",
    type: "medication",
  },
  // ── General health facts ──
  {
    id: "vitamin-d-sun",
    triggers: [],
    en: "15-20 minutes of midday sun exposure can produce 10,000-20,000 IU of vitamin D. But sunscreen above SPF 15 blocks 99% of production.",
    tr: "15-20 dakika ogle gunes maruziyeti 10.000-20.000 IU D vitamini uretebilir. Ancak SPF 15 ustu gunes kremi uretimin %99'unu engeller.",
    link: "/sun-exposure",
    type: "general",
  },
  {
    id: "sleep-7hours",
    triggers: [],
    en: "Adults who sleep less than 7 hours have a 12% higher risk of early mortality. Prioritize consistent sleep schedules.",
    tr: "7 saatten az uyuyan yetiskinlerde erken olum riski %12 daha yuksek. Duzenlı uyku rutini olusturun.",
    link: "/sleep-analysis",
    type: "general",
  },
  {
    id: "water-kidney",
    triggers: [],
    en: "Drinking 8 glasses of water daily supports kidney function and can reduce kidney stone risk by up to 40%.",
    tr: "Gunluk 8 bardak su bobrek fonksiyonunu destekler ve bobrek tasi riskini %40'a kadar azaltabilir.",
    link: "/hydration",
    type: "general",
  },
  {
    id: "walking-10min",
    triggers: [],
    en: "Just 10 minutes of brisk walking after meals can lower blood sugar spikes by 22%. No gym needed.",
    tr: "Yemeklerden sonra sadece 10 dakika tempolu yuruyus kan sekeri sivriliklerini %22 azaltabilir.",
    link: "/walking-tracker",
    type: "general",
  },
  {
    id: "gut-fiber",
    triggers: [],
    en: "Your gut microbiome needs 30+ different plant foods per week for optimal diversity. Variety matters more than quantity.",
    tr: "Bagirsak mikrobiyomunuz için haftada 30+ farkli bitkisel gida tuketin. Cesitlilik miktardan onemlidir.",
    link: "/gut-health",
    type: "general",
  },
  {
    id: "magnesium-sleep",
    triggers: [],
    en: "Magnesium glycinate before bed can improve sleep quality. Most adults are deficient without knowing it.",
    tr: "Yatmadan once magnezyum glisinat uyku kalitesini artırabilir. Cogu yetiskin bilmeden magnezyum eksikligi yasıyor.",
    link: "/health-assistant",
    type: "general",
  },
  {
    id: "omega3-inflammation",
    triggers: [],
    en: "Omega-3 fatty acids reduce chronic inflammation. Aim for 2-3 servings of fatty fish per week or a quality supplement.",
    tr: "Omega-3 yag asitleri kronik iltihabi azaltır. Haftada 2-3 porsiyon yagli balik veya kaliteli takviye hedefleyin.",
    link: "/anti-inflammatory",
    type: "general",
  },
  {
    id: "caffeine-halflife",
    triggers: [],
    en: "Caffeine has a half-life of 5-6 hours. A 3 PM coffee means half the caffeine is still active at 9 PM.",
    tr: "Kafeinin yarilama omru 5-6 saattir. 15:00'te icilen kahvenin yarisi 21:00'de hala aktiftir.",
    link: "/caffeine-tracker",
    type: "general",
  },
  {
    id: "stress-cortisol",
    triggers: [],
    en: "Chronic stress keeps cortisol elevated, weakening immunity and increasing belly fat. Even 5 minutes of deep breathing helps.",
    tr: "Kronik stres kortizolu yuksek tutar, bagisikligi zayiflatir ve karin yagini artırır. 5 dakika derin nefes bile yardimci olur.",
    link: "/breathing-exercises",
    type: "general",
  },
  {
    id: "posture-back",
    triggers: [],
    en: "Sitting for 8+ hours daily increases lower back pain risk by 40%. Stand up and stretch every 30 minutes.",
    tr: "Gunluk 8+ saat oturma bel agrisi riskini %40 artırır. Her 30 dakikada kalkip gerinme yapin.",
    link: "/posture-ergonomics",
    type: "general",
  },
]

function getFactForToday(
  medications: string[],
  conditions: string[],
): KnowledgeFact {
  const medsLower = medications.map((m) => m.toLowerCase())

  // Find medication-specific facts that match user's meds
  const matchingFacts = KNOWLEDGE_FACTS.filter(
    (f) =>
      f.type === "medication" &&
      f.triggers.some((t) => medsLower.some((m) => m.includes(t) || t.includes(m)))
  )

  const generalFacts = KNOWLEDGE_FACTS.filter((f) => f.type === "general")
  const pool = matchingFacts.length > 0 ? [...matchingFacts, ...generalFacts] : generalFacts

  // Use day-of-year as seed for consistent daily selection
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000)
  const index = dayOfYear % pool.length

  return pool[index]
}

export function DarkKnowledgeCard({
  lang,
  medications = [],
  conditions = [],
}: DarkKnowledgeCardProps) {
  const [dismissed, setDismissed] = useState(false)

  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    if (typeof window !== "undefined") {
      const wasDismissed = localStorage.getItem(`dk-dismissed-${today}`)
      if (wasDismissed) setDismissed(true)
    }
  }, [today])

  const fact = useMemo(
    () => getFactForToday(medications, conditions),
    [medications, conditions]
  )

  const handleDismiss = () => {
    localStorage.setItem(`dk-dismissed-${today}`, "true")
    setDismissed(true)
  }

  if (dismissed) return null

  const text = lang === "tr" ? fact.tr : fact.en

  return (
    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent ring-1 ring-amber-500/20 transition-all hover:ring-amber-500/40">
      <CardContent className="p-4">
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground/50 transition-colors hover:bg-muted hover:text-muted-foreground"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="flex gap-3">
          {/* Icon */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
            <Lightbulb className="h-5 w-5 text-amber-500" />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1 pr-4">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              {tx("darkKnowledge.didYouKnow", lang)}
            </p>
            <p className="text-sm leading-relaxed text-foreground/90">
              {text}
            </p>
            <Link
              href={fact.link}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-600 transition-colors hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
            >
              {tx("darkKnowledge.learnMore", lang)}
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
