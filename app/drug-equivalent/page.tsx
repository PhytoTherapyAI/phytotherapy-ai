"use client"

import { useState } from "react"
import { useLang } from "@/components/layout/language-toggle"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowLeft, Pill, DollarSign, Shield, TrendingDown, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"

interface DrugEntry {
  brand: string
  generic: string
  category: { en: string; tr: string }
  brandPrice: number
  genericPrice: number
  sgkCovered: boolean
  genericBrands: string[]
  strength: string
}

const DRUG_DATABASE: DrugEntry[] = [
  { brand: "Lipitor", generic: "Atorvastatin", category: { en: "Cholesterol", tr: "Kolesterol" }, brandPrice: 185, genericPrice: 42, sgkCovered: true, genericBrands: ["Ator", "Atorva", "Kolester"], strength: "20mg" },
  { brand: "Coumadin", generic: "Warfarin", category: { en: "Blood Thinner", tr: "Kan Sulandirici" }, brandPrice: 95, genericPrice: 28, sgkCovered: true, genericBrands: ["Orfarin", "Varfarin"], strength: "5mg" },
  { brand: "Glucophage", generic: "Metformin", category: { en: "Diabetes", tr: "Diyabet" }, brandPrice: 78, genericPrice: 22, sgkCovered: true, genericBrands: ["Glifor", "Matofin", "Diaformin"], strength: "1000mg" },
  { brand: "Norvasc", generic: "Amlodipine", category: { en: "Blood Pressure", tr: "Tansiyon" }, brandPrice: 110, genericPrice: 32, sgkCovered: true, genericBrands: ["Amlodis", "Amlopin"], strength: "5mg" },
  { brand: "Zoloft", generic: "Sertraline", category: { en: "Antidepressant", tr: "Antidepresan" }, brandPrice: 145, genericPrice: 55, sgkCovered: true, genericBrands: ["Lustral", "Serteva", "Seralina"], strength: "50mg" },
  { brand: "Nexium", generic: "Esomeprazole", category: { en: "Stomach Acid", tr: "Mide Asidi" }, brandPrice: 165, genericPrice: 38, sgkCovered: true, genericBrands: ["Esopraz", "Nexoper"], strength: "40mg" },
  { brand: "Augmentin", generic: "Amoxicillin/Clavulanate", category: { en: "Antibiotic", tr: "Antibiyotik" }, brandPrice: 120, genericPrice: 45, sgkCovered: true, genericBrands: ["Amoklavin", "Klamoks"], strength: "1000mg" },
  { brand: "Ventolin", generic: "Salbutamol", category: { en: "Asthma", tr: "Astim" }, brandPrice: 65, genericPrice: 30, sgkCovered: true, genericBrands: ["Salbulin", "Broncovaleas"], strength: "100mcg" },
  { brand: "Lyrica", generic: "Pregabalin", category: { en: "Nerve Pain", tr: "Sinir Agrisi" }, brandPrice: 210, genericPrice: 68, sgkCovered: true, genericBrands: ["Pregabin", "Preganox"], strength: "75mg" },
  { brand: "Crestor", generic: "Rosuvastatin", category: { en: "Cholesterol", tr: "Kolesterol" }, brandPrice: 195, genericPrice: 48, sgkCovered: true, genericBrands: ["Rosact", "Rozavel"], strength: "10mg" },
  { brand: "Plavix", generic: "Clopidogrel", category: { en: "Blood Thinner", tr: "Kan Sulandirici" }, brandPrice: 175, genericPrice: 55, sgkCovered: true, genericBrands: ["Karum", "Klopidex"], strength: "75mg" },
  { brand: "Euthyrox", generic: "Levothyroxine", category: { en: "Thyroid", tr: "Tiroid" }, brandPrice: 48, genericPrice: 22, sgkCovered: true, genericBrands: ["Tefor", "Levotiron"], strength: "50mcg" },
  { brand: "Cipro", generic: "Ciprofloxacin", category: { en: "Antibiotic", tr: "Antibiyotik" }, brandPrice: 95, genericPrice: 28, sgkCovered: true, genericBrands: ["Ciproktan", "Siprosan"], strength: "500mg" },
  { brand: "Xanax", generic: "Alprazolam", category: { en: "Anxiety", tr: "Anksiyete" }, brandPrice: 85, genericPrice: 32, sgkCovered: false, genericBrands: ["Alpraz", "Xanor"], strength: "0.5mg" },
  { brand: "Parol", generic: "Acetaminophen", category: { en: "Pain Relief", tr: "Agri Kesici" }, brandPrice: 32, genericPrice: 15, sgkCovered: false, genericBrands: ["Minoset", "Tamol"], strength: "500mg" },
  { brand: "Concerta", generic: "Methylphenidate", category: { en: "ADHD", tr: "DEHB" }, brandPrice: 320, genericPrice: 145, sgkCovered: false, genericBrands: ["Ritalin", "Medikinet"], strength: "36mg" },
  { brand: "Diflucan", generic: "Fluconazole", category: { en: "Antifungal", tr: "Antifungal" }, brandPrice: 88, genericPrice: 25, sgkCovered: true, genericBrands: ["Fluzol", "Triflucan"], strength: "150mg" },
  { brand: "Abilify", generic: "Aripiprazole", category: { en: "Antipsychotic", tr: "Antipsikotik" }, brandPrice: 285, genericPrice: 95, sgkCovered: true, genericBrands: ["Ariprizol", "Aripipra"], strength: "10mg" },
  { brand: "Januvia", generic: "Sitagliptin", category: { en: "Diabetes", tr: "Diyabet" }, brandPrice: 245, genericPrice: 110, sgkCovered: true, genericBrands: ["Sitavig", "Sitagal"], strength: "100mg" },
  { brand: "Lantus", generic: "Insulin Glargine", category: { en: "Diabetes (Insulin)", tr: "Diyabet (Insulin)" }, brandPrice: 380, genericPrice: 195, sgkCovered: true, genericBrands: ["Basaglar", "Toujeo"], strength: "100U/mL" },
]

const tx: Record<string, { en: string; tr: string }> = {
  title: { en: "Generic Drug Finder", tr: "Jenerik Ilac Bulucu" },
  subtitle: { en: "Find affordable generic alternatives for brand-name drugs", tr: "Marka ilaclar icin uygun fiyatli jenerik alternatifleri bulun" },
  search: { en: "Search brand or generic name...", tr: "Marka veya jenerik adi arayin..." },
  brandName: { en: "Brand", tr: "Marka" },
  genericName: { en: "Generic", tr: "Jenerik" },
  alternatives: { en: "Generic Alternatives", tr: "Jenerik Alternatifler" },
  sgkYes: { en: "SGK Covered", tr: "SGK Kapsaminda" },
  sgkNo: { en: "Not SGK Covered", tr: "SGK Kapsaminda Degil" },
  savings: { en: "Monthly Savings", tr: "Aylik Tasarruf" },
  perMonth: { en: "/month", tr: "/ay" },
  brandPrice: { en: "Brand Price", tr: "Marka Fiyat" },
  genericPrice: { en: "Generic Price", tr: "Jenerik Fiyat" },
  savingsCalc: { en: "Savings Calculator", tr: "Tasarruf Hesaplayici" },
  monthsLabel: { en: "Duration (months)", tr: "Sure (ay)" },
  totalSavings: { en: "Total Savings", tr: "Toplam Tasarruf" },
  yearly: { en: "Yearly Savings", tr: "Yillik Tasarruf" },
  disclaimer: { en: "Always consult your doctor before switching medications. Generic equivalents contain the same active ingredient but may differ in inactive ingredients.", tr: "Ilac degistirmeden once mutlaka doktorunuza danisin. Jenerik esdegerler ayni etken maddeyi icerir ancak yardimci maddeler farklilik gosterebilir." },
  noResults: { en: "No drugs found. Try a different search term.", tr: "Ilac bulunamadi. Farkli bir arama terimi deneyin." },
  back: { en: "Back", tr: "Geri" },
  allDrugs: { en: "All Medications", tr: "Tum Ilaclar" },
  results: { en: "results", tr: "sonuc" },
}

export default function DrugEquivalentPage() {
  const { lang } = useLang()
  const t = (key: string) => tx[key]?.[lang as "en" | "tr"] || tx[key]?.en || key

  const [search, setSearch] = useState("")
  const [selectedDrug, setSelectedDrug] = useState<DrugEntry | null>(null)
  const [months, setMonths] = useState(12)

  const filtered = DRUG_DATABASE.filter((d) => {
    if (!search) return true
    const s = search.toLowerCase()
    return d.brand.toLowerCase().includes(s) ||
      d.generic.toLowerCase().includes(s) ||
      d.genericBrands.some((b) => b.toLowerCase().includes(s))
  })

  const savingsPerMonth = selectedDrug ? selectedDrug.brandPrice - selectedDrug.genericPrice : 0

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
              <Pill className="w-6 h-6 text-green-500" />{t("title")}
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

        {/* Results count */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {filtered.length} {t("results")}
        </p>

        {/* Drug list */}
        {filtered.length === 0 ? (
          <Card className="p-6 text-center text-gray-500 dark:text-gray-400">{t("noResults")}</Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((drug) => {
              const saving = drug.brandPrice - drug.genericPrice
              const savingPct = Math.round((saving / drug.brandPrice) * 100)
              const isSelected = selectedDrug?.brand === drug.brand

              return (
                <Card
                  key={drug.brand}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${isSelected ? "ring-2 ring-green-500" : ""}`}
                  onClick={() => setSelectedDrug(isSelected ? null : drug)}
                >
                  <div className="flex flex-col gap-3">
                    {/* Top row */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-900 dark:text-white">{drug.brand}</h3>
                          <Badge variant="secondary" className="text-xs">{drug.strength}</Badge>
                          <Badge className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            {drug.category[lang as "en" | "tr"] || drug.category.en}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          {t("genericName")}: <span className="font-medium">{drug.generic}</span>
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 text-sm">
                          <TrendingDown className="w-3 h-3 mr-1" />%{savingPct}
                        </Badge>
                      </div>
                    </div>

                    {/* Price comparison */}
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">{t("brandPrice")}: </span>
                        <span className="font-medium text-red-500 line-through">{drug.brandPrice} TL</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">{t("genericPrice")}: </span>
                        <span className="font-bold text-green-600">{drug.genericPrice} TL</span>
                      </div>
                    </div>

                    {/* SGK + alternatives */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {drug.sgkCovered ? (
                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" />{t("sgkYes")}
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 text-xs">
                          <XCircle className="w-3 h-3 mr-1" />{t("sgkNo")}
                        </Badge>
                      )}
                    </div>

                    {/* Expanded: generic brands */}
                    {isSelected && (
                      <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("alternatives")}:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {drug.genericBrands.map((b) => (
                              <Badge key={b} variant="outline" className="text-sm">{b}</Badge>
                            ))}
                          </div>
                        </div>

                        {/* Savings calculator */}
                        <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 space-y-2">
                          <p className="text-sm font-semibold text-green-700 dark:text-green-300 flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />{t("savingsCalc")}
                          </p>
                          <div className="flex items-center gap-3">
                            <label className="text-xs text-gray-600 dark:text-gray-400">{t("monthsLabel")}:</label>
                            <input
                              type="range"
                              min={1}
                              max={24}
                              value={months}
                              onChange={(e) => setMonths(Number(e.target.value))}
                              className="flex-1 accent-green-500"
                            />
                            <span className="text-sm font-medium w-8 text-right">{months}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{t("savings")} ({months} {lang === "tr" ? "ay" : "mo"}):</span>
                            <span className="font-bold text-green-600 text-lg">{saving * months} TL</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{t("yearly")}:</span>
                            <span className="font-medium">{saving * 12} TL</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Disclaimer */}
        <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
            <Shield className="w-4 h-4 shrink-0 mt-0.5" />
            {t("disclaimer")}
          </p>
        </Card>
      </div>
    </div>
  )
}
