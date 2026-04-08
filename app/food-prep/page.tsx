// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState } from "react"
import { useLang } from "@/components/layout/language-toggle"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ChefHat, Search, Flame, Droplets, Snowflake, Zap, AlertTriangle } from "lucide-react"
import { tx } from "@/lib/translations"

interface FoodPrepTip {
  food: { en: string; tr: string }
  emoji: string
  method: { en: string; tr: string }
  benefit: { en: string; tr: string }
  avoid: { en: string; tr: string }
  nutrientImpact: "preserves" | "enhances" | "reduces"
  keyNutrient: string
}

const PREP_TIPS: FoodPrepTip[] = [
  { food: { en: "Broccoli", tr: "Brokoli" }, emoji: "🥦", method: { en: "Steam for 3-5 minutes", tr: "3-5 dakika buharda pişir" }, benefit: { en: "Preserves 90% of vitamin C and sulforaphane", tr: "C vitamini ve sülfrofanın %90'ını korur" }, avoid: { en: "Boiling destroys 50% of vitamin C", tr: "Haşlama C vitamininin %50'sini yok eder" }, nutrientImpact: "preserves", keyNutrient: "Vitamin C" },
  { food: { en: "Turmeric", tr: "Zerdeçal" }, emoji: "🟡", method: { en: "Always add black pepper", tr: "Her zaman karabiber ekle" }, benefit: { en: "Piperine increases curcumin absorption 2000%", tr: "Piperin kurkumin emilimini %2000 artırır" }, avoid: { en: "Using turmeric alone — very poor absorption", tr: "Zerdeçalı tek başına kullanma — çok düşük emilim" }, nutrientImpact: "enhances", keyNutrient: "Curcumin" },
  { food: { en: "Tomato", tr: "Domates" }, emoji: "🍅", method: { en: "Cook with olive oil", tr: "Zeytinyağı ile pişir" }, benefit: { en: "Cooking increases lycopene availability 5x", tr: "Pişirme likopen erişilebilirliğini 5 kat artırır" }, avoid: { en: "Raw has less bioavailable lycopene", tr: "Çiğ halde likopen daha az biyoyararlı" }, nutrientImpact: "enhances", keyNutrient: "Lycopene" },
  { food: { en: "Garlic", tr: "Sarımsak" }, emoji: "🧄", method: { en: "Crush and wait 10 minutes before cooking", tr: "Ez ve pişirmeden 10 dakika bekle" }, benefit: { en: "Allows allicin to form (the active compound)", tr: "Allisinin oluşmasını sağlar (aktif bileşen)" }, avoid: { en: "Cooking immediately after cutting destroys allicin", tr: "Kestikten hemen sonra pişirme allisini yok eder" }, nutrientImpact: "enhances", keyNutrient: "Allicin" },
  { food: { en: "Spinach", tr: "Ispanak" }, emoji: "🥬", method: { en: "Light sauté or steam, add lemon", tr: "Hafif sotele veya buharda pişir, limon ekle" }, benefit: { en: "Lemon vitamin C enhances iron absorption 6x", tr: "Limonun C vitamini demir emilimini 6 kat artırır" }, avoid: { en: "Eating raw with high-calcium foods blocks iron", tr: "Yüksek kalsiyumlu yiyeceklerle çiğ yemek demiri engeller" }, nutrientImpact: "enhances", keyNutrient: "Iron" },
  { food: { en: "Carrots", tr: "Havuç" }, emoji: "🥕", method: { en: "Cook lightly with fat (olive oil)", tr: "Yağla hafif pişir (zeytinyağı)" }, benefit: { en: "Cooking + fat increases beta-carotene absorption 6.5x", tr: "Pişirme + yağ beta-karoten emilimini 6.5 kat artırır" }, avoid: { en: "Raw whole carrots — poor absorption", tr: "Bütün çiğ havuç — düşük emilim" }, nutrientImpact: "enhances", keyNutrient: "Beta-carotene" },
  { food: { en: "Green Tea", tr: "Yeşil Çay" }, emoji: "🍵", method: { en: "Brew at 70-80°C, not boiling water", tr: "70-80°C'de demle, kaynar su kullanma" }, benefit: { en: "Preserves catechins (EGCG), the key antioxidant", tr: "Kateşinleri (EGCG) korur, anahtar antioksidan" }, avoid: { en: "Boiling water destroys catechins", tr: "Kaynar su kateşinleri yok eder" }, nutrientImpact: "preserves", keyNutrient: "EGCG" },
  { food: { en: "Nuts", tr: "Kuruyemiş" }, emoji: "🥜", method: { en: "Soak overnight or lightly toast", tr: "Bir gece ıslat veya hafif kavur" }, benefit: { en: "Reduces phytic acid, improves mineral absorption", tr: "Fitik asidi azaltır, mineral emilimini artırır" }, avoid: { en: "Eating large amounts unsorted — phytic acid blocks minerals", tr: "İşlenmeden bol yemek — fitik asit mineralleri engeller" }, nutrientImpact: "enhances", keyNutrient: "Minerals" },
  { food: { en: "Eggs", tr: "Yumurta" }, emoji: "🥚", method: { en: "Soft-boil or poach (runny yolk)", tr: "Rafadan veya poşe (akıcı sarısı)" }, benefit: { en: "Preserves maximum choline and B12", tr: "Maksimum kolin ve B12 korur" }, avoid: { en: "High heat scrambling reduces B12 by 20%", tr: "Yüksek ateşte çırpma B12'yi %20 azaltır" }, nutrientImpact: "preserves", keyNutrient: "B12" },
  { food: { en: "Bell Pepper", tr: "Biber" }, emoji: "🫑", method: { en: "Eat raw or quick stir-fry", tr: "Çiğ ye veya hızlıca sotele" }, benefit: { en: "Raw has 3x more vitamin C than oranges", tr: "Çiğ halde portakaldan 3 kat fazla C vitamini" }, avoid: { en: "Long cooking destroys vitamin C", tr: "Uzun pişirme C vitaminini yok eder" }, nutrientImpact: "preserves", keyNutrient: "Vitamin C" },
  { food: { en: "Flaxseed", tr: "Keten Tohumu" }, emoji: "🌾", method: { en: "Grind just before eating", tr: "Yemeden hemen önce öğüt" }, benefit: { en: "Ground form releases omega-3 (ALA)", tr: "Öğütülmüş form omega-3 (ALA) salar" }, avoid: { en: "Whole seeds pass through undigested", tr: "Bütün tohumlar sindirilmeden geçer" }, nutrientImpact: "enhances", keyNutrient: "Omega-3" },
  { food: { en: "Yogurt", tr: "Yoğurt" }, emoji: "🥛", method: { en: "Don't heat — eat at room temp or cold", tr: "Isıtma — oda sıcaklığında veya soğuk ye" }, benefit: { en: "Preserves live probiotics", tr: "Canlı probiyotikleri korur" }, avoid: { en: "Heating kills beneficial bacteria", tr: "Isı yararlı bakterileri öldürür" }, nutrientImpact: "preserves", keyNutrient: "Probiotics" },
]

const IMPACT_CONFIG = {
  preserves: { label: { en: "Preserves", tr: "Korur" }, color: "bg-blue-500/10 text-blue-600", icon: Snowflake },
  enhances: { label: { en: "Enhances", tr: "Artırır" }, color: "bg-green-500/10 text-green-600", icon: Zap },
  reduces: { label: { en: "Reduces", tr: "Azaltır" }, color: "bg-red-500/10 text-red-600", icon: Flame },
}

export default function FoodPrepPage() {
  const { lang } = useLang()
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<string>("all")

  const filtered = PREP_TIPS.filter(tip => {
    const matchesSearch = !search || tip.food.en.toLowerCase().includes(search.toLowerCase()) || tip.food.tr.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === "all" || tip.nutrientImpact === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <ChefHat className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{tx("foodPrep.title", lang)}</h1>
          <p className="text-muted-foreground mt-1">{tx("foodPrep.subtitle", lang)}</p>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder={tx("foodPrep.searchPlaceholder", lang)} value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="flex gap-2 mb-6 justify-center">
          {["all", "enhances", "preserves"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {f === "all" ? tx("common.all", lang) : IMPACT_CONFIG[f as keyof typeof IMPACT_CONFIG]?.label[lang]}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.map((tip, i) => {
            const impact = IMPACT_CONFIG[tip.nutrientImpact]
            const ImpactIcon = impact.icon
            return (
              <Card key={i} className="p-5">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{tip.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{tip.food[lang]}</h3>
                      <Badge className={impact.color}>
                        <ImpactIcon className="w-3 h-3 mr-1" />{impact.label[lang]} {tip.keyNutrient}
                      </Badge>
                    </div>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <div>
                          <p className="text-sm font-medium text-green-700 dark:text-green-400">{tip.method[lang]}</p>
                          <p className="text-xs text-muted-foreground">{tip.benefit[lang]}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-muted-foreground">{tip.avoid[lang]}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
