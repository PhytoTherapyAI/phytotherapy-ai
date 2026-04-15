// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState } from "react"
import { useLang } from "@/components/layout/language-toggle"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Apple, Leaf, Sun, Snowflake, Flower, TreeDeciduous, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { tx } from "@/lib/translations"

interface SeasonalItem {
  name: { en: string; tr: string }
  emoji: string
  season: ("winter" | "spring" | "summer" | "autumn")[]
  nutrients: string[]
  benefits: { en: string; tr: string }
  pairsWith: string[]
}

const SEASONAL_FOODS: SeasonalItem[] = [
  { name: { en: "Pomegranate", tr: "Nar" }, emoji: "🍎", season: ["autumn", "winter"], nutrients: ["Vitamin C", "Polyphenols", "Folate"], benefits: { en: "Powerful antioxidant, heart-protective", tr: "Güçlü antioksidan, kalp koruyucu" }, pairsWith: ["Vitamin E", "Iron"] },
  { name: { en: "Spinach", tr: "Ispanak" }, emoji: "🥬", season: ["winter", "spring"], nutrients: ["Iron", "Folate", "Vitamin K", "Magnesium"], benefits: { en: "Iron-rich, bone health", tr: "Demir zengini, kemik sağlığı" }, pairsWith: ["Vitamin C", "Lemon"] },
  { name: { en: "Strawberry", tr: "Çilek" }, emoji: "🍓", season: ["spring", "summer"], nutrients: ["Vitamin C", "Manganese", "Folate"], benefits: { en: "High vitamin C, anti-inflammatory", tr: "Yüksek C vitamini, anti-inflamatuar" }, pairsWith: ["Yogurt", "Oats"] },
  { name: { en: "Watermelon", tr: "Karpuz" }, emoji: "🍉", season: ["summer"], nutrients: ["Lycopene", "Vitamin A", "Citrulline"], benefits: { en: "Hydration, muscle recovery", tr: "Hidrasyon, kas toparlanma" }, pairsWith: ["Mint", "Feta"] },
  { name: { en: "Pumpkin", tr: "Balkabağı" }, emoji: "🎃", season: ["autumn"], nutrients: ["Beta-carotene", "Vitamin A", "Fiber"], benefits: { en: "Eye health, immunity", tr: "Göz sağlığı, bağışıklık" }, pairsWith: ["Olive oil", "Cinnamon"] },
  { name: { en: "Kale", tr: "Kara Lahana" }, emoji: "🥗", season: ["winter"], nutrients: ["Vitamin K", "Vitamin C", "Calcium"], benefits: { en: "Bone health, detox support", tr: "Kemik sağlığı, detoks desteği" }, pairsWith: ["Lemon", "Garlic"] },
  { name: { en: "Cherry", tr: "Kiraz" }, emoji: "🍒", season: ["spring", "summer"], nutrients: ["Melatonin", "Anthocyanins", "Potassium"], benefits: { en: "Sleep support, anti-inflammatory", tr: "Uyku desteği, anti-inflamatuar" }, pairsWith: ["Almonds", "Dark chocolate"] },
  { name: { en: "Fig", tr: "İncir" }, emoji: "🫐", season: ["summer", "autumn"], nutrients: ["Calcium", "Potassium", "Fiber"], benefits: { en: "Digestive health, bone density", tr: "Sindirim sağlığı, kemik yoğunluğu" }, pairsWith: ["Walnut", "Honey"] },
  { name: { en: "Quince", tr: "Ayva" }, emoji: "🍐", season: ["autumn"], nutrients: ["Vitamin C", "Pectin", "Copper"], benefits: { en: "Gut health, cold prevention", tr: "Bağırsak sağlığı, soğuk algınlığı önleme" }, pairsWith: ["Cinnamon", "Clove"] },
  { name: { en: "Orange", tr: "Portakal" }, emoji: "🍊", season: ["winter"], nutrients: ["Vitamin C", "Folate", "Hesperidin"], benefits: { en: "Immunity boost, iron absorption", tr: "Bağışıklık güçlendirici, demir emilimi" }, pairsWith: ["Iron supplements", "Spinach"] },
  { name: { en: "Tomato", tr: "Domates" }, emoji: "🍅", season: ["summer"], nutrients: ["Lycopene", "Vitamin C", "Potassium"], benefits: { en: "Prostate health, heart protective", tr: "Prostat sağlığı, kalp koruyucu" }, pairsWith: ["Olive oil", "Basil"] },
  { name: { en: "Broccoli", tr: "Brokoli" }, emoji: "🥦", season: ["autumn", "winter"], nutrients: ["Sulforaphane", "Vitamin C", "Vitamin K"], benefits: { en: "Cancer-protective, liver support", tr: "Kanser koruyucu, karaciğer desteği" }, pairsWith: ["Mustard", "Turmeric"] },
  { name: { en: "Artichoke", tr: "Enginar" }, emoji: "🌿", season: ["spring"], nutrients: ["Cynarin", "Fiber", "Folate"], benefits: { en: "Liver protection, cholesterol", tr: "Karaciğer koruması, kolesterol" }, pairsWith: ["Lemon", "Olive oil"] },
  { name: { en: "Apricot", tr: "Kayısı" }, emoji: "🍑", season: ["summer"], nutrients: ["Beta-carotene", "Iron", "Potassium"], benefits: { en: "Eye health, anemia prevention", tr: "Göz sağlığı, anemi önleme" }, pairsWith: ["Almonds", "Yogurt"] },
  { name: { en: "Leek", tr: "Pırasa" }, emoji: "🧅", season: ["winter"], nutrients: ["Vitamin K", "Allicin", "Folate"], benefits: { en: "Heart health, prebiotic", tr: "Kalp sağlığı, prebiyotik" }, pairsWith: ["Olive oil", "Lemon"] },
]

const SEASONS = [
  { key: "spring" as const, label: { en: "Spring", tr: "İlkbahar" }, icon: Flower, color: "text-pink-500 bg-pink-500/10" },
  { key: "summer" as const, label: { en: "Summer", tr: "Yaz" }, icon: Sun, color: "text-amber-500 bg-amber-500/10" },
  { key: "autumn" as const, label: { en: "Autumn", tr: "Sonbahar" }, icon: TreeDeciduous, color: "text-orange-500 bg-orange-500/10" },
  { key: "winter" as const, label: { en: "Winter", tr: "Kış" }, icon: Snowflake, color: "text-blue-500 bg-blue-500/10" },
]

const getCurrentSeason = (): "spring" | "summer" | "autumn" | "winter" => {
  const month = new Date().getMonth()
  if (month >= 2 && month <= 4) return "spring"
  if (month >= 5 && month <= 7) return "summer"
  if (month >= 8 && month <= 10) return "autumn"
  return "winter"
}

export default function SeasonalFoodPage() {
  const { lang } = useLang()
  const [selectedSeason, setSelectedSeason] = useState<string>(getCurrentSeason())
  const [search, setSearch] = useState("")

  const filtered = SEASONAL_FOODS.filter(f => {
    const matchesSeason = selectedSeason === "all" || f.season.includes(selectedSeason as "winter" | "spring" | "summer" | "autumn")
    const matchesSearch = !search || f.name.en.toLowerCase().includes(search.toLowerCase()) || f.name.tr.toLowerCase().includes(search.toLowerCase())
    return matchesSeason && matchesSearch
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Apple className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{tx("seasonalFood.title", lang)}</h1>
          <p className="text-muted-foreground mt-1">{tx("seasonalFood.subtitle", lang)}</p>
        </div>

        <div className="flex gap-2 mb-4 justify-center flex-wrap">
          <Button size="sm" variant={selectedSeason === "all" ? "default" : "outline"} onClick={() => setSelectedSeason("all")}>
            {tx("common.all", lang)}
          </Button>
          {SEASONS.map(s => {
            const Icon = s.icon
            return (
              <Button key={s.key} size="sm" variant={selectedSeason === s.key ? "default" : "outline"}
                onClick={() => setSelectedSeason(s.key)}>
                <Icon className="w-4 h-4 mr-1" />{s.label[lang]}
              </Button>
            )
          })}
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder={tx("seasonalFood.searchPlaceholder", lang)} value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((food, i) => (
            <Card key={i} className="p-4 hover:border-primary/50 transition-colors">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{food.emoji}</span>
                <div className="flex-1">
                  <h3 className="font-semibold">{food.name[lang]}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{food.benefits[lang]}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {food.nutrients.map(n => <Badge key={n} variant="outline" className="text-xs">{n}</Badge>)}
                  </div>
                  <div className="flex gap-1 mt-2">
                    {food.season.map(s => {
                      const season = SEASONS.find(ss => ss.key === s)
                      return season ? (
                        <Badge key={s} className={`text-xs ${season.color}`}>{season.label[lang]}</Badge>
                      ) : null
                    })}
                  </div>
                  {food.pairsWith.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      ✨ {tx("seasonalFood.pairsWith", lang)} {food.pairsWith.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <Card className="p-8 text-center">
            <Leaf className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">{tx("seasonalFood.noResults", lang)}</p>
          </Card>
        )}
      </div>
    </div>
  )
}
