"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShieldAlert, Pill, Brain, Bone, Heart, Droplets, AlertTriangle, TrendingUp, Loader2, ChevronDown, ChevronUp } from "lucide-react"

interface RiskFactor {
  category: string
  categoryTr: string
  score: number
  maxScore: number
  level: "low" | "medium" | "high"
  details: { en: string; tr: string }[]
  icon: any
}

const ANTICHOLINERGIC_DRUGS: Record<string, number> = {
  amitriptyline: 3, nortriptyline: 3, doxepin: 3, paroxetine: 3, olanzapine: 3, quetiapine: 3,
  chlorpheniramine: 3, diphenhydramine: 3, hydroxyzine: 2, oxybutynin: 3, tolterodine: 3,
  ranitidine: 1, cetirizine: 1, loratadine: 1, metformin: 0, amlodipine: 0, atorvastatin: 0,
}

const FALL_RISK_DRUGS = [
  "benzodiazepine", "diazepam", "alprazolam", "lorazepam", "zolpidem",
  "antidepressant", "ssri", "snri", "opioid", "tramadol", "pregabalin",
  "gabapentin", "antihypertensive", "amlodipine", "doxazosin", "tamsulosin",
  "antipsychotic", "quetiapine", "risperidone", "insulin",
]

const NEPHROTOXIC_DRUGS = ["nsaid", "ibuprofen", "naproxen", "diclofenac", "gentamicin", "vancomycin", "lithium", "methotrexate", "cisplatin", "acyclovir"]
const HEPATOTOXIC_DRUGS = ["acetaminophen", "paracetamol", "methotrexate", "isoniazid", "valproic", "amiodarone", "statin"]

export default function PolypharmacyPage() {
  const { user } = useAuth()
  const { lang } = useLang()
  const [meds, setMeds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  useEffect(() => {
    loadMeds()
  }, [user])

  const loadMeds = async () => {
    if (!user) { setLoading(false); return }
    try {
      const supabase = createBrowserClient()
      const { data } = await supabase.from("user_medications").select("brand_name, generic_name").eq("user_id", user.id)
      if (data) setMeds((data || []).map((d: any) => (d.generic_name || d.brand_name) || ""))
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const checkDrug = (med: string, list: string[]) => list.some(d => med.toLowerCase().includes(d))

  const calculateRisks = (): RiskFactor[] => {
    const risks: RiskFactor[] = []

    // Anticholinergic burden
    let acbTotal = 0
    const acbDetails: { en: string; tr: string }[] = []
    meds.forEach(m => {
      const lower = m.toLowerCase()
      for (const [drug, score] of Object.entries(ANTICHOLINERGIC_DRUGS)) {
        if (lower.includes(drug) && score > 0) {
          acbTotal += score
          acbDetails.push({ en: `${m}: ACB score ${score}`, tr: `${m}: AKB skoru ${score}` })
        }
      }
    })
    risks.push({
      category: "Anticholinergic Burden", categoryTr: "Antikolinerjik Yük",
      score: acbTotal, maxScore: 9,
      level: acbTotal >= 6 ? "high" : acbTotal >= 3 ? "medium" : "low",
      details: acbDetails.length ? acbDetails : [{ en: "No significant anticholinergic burden", tr: "Belirgin antikolinerjik yük yok" }],
      icon: Brain,
    })

    // Fall risk
    const fallMeds = meds.filter(m => checkDrug(m, FALL_RISK_DRUGS))
    risks.push({
      category: "Fall Risk", categoryTr: "Düşme Riski",
      score: fallMeds.length, maxScore: 5,
      level: fallMeds.length >= 3 ? "high" : fallMeds.length >= 1 ? "medium" : "low",
      details: fallMeds.map(m => ({ en: `${m} increases fall risk`, tr: `${m} düşme riskini artırır` })),
      icon: Bone,
    })

    // Kidney burden
    const nephroMeds = meds.filter(m => checkDrug(m, NEPHROTOXIC_DRUGS))
    risks.push({
      category: "Kidney Burden", categoryTr: "Böbrek Yükü",
      score: nephroMeds.length, maxScore: 4,
      level: nephroMeds.length >= 3 ? "high" : nephroMeds.length >= 1 ? "medium" : "low",
      details: nephroMeds.map(m => ({ en: `${m} is potentially nephrotoxic`, tr: `${m} potansiyel nefrotoksik` })),
      icon: Droplets,
    })

    // Liver burden
    const hepatoMeds = meds.filter(m => checkDrug(m, HEPATOTOXIC_DRUGS))
    risks.push({
      category: "Liver Burden", categoryTr: "Karaciğer Yükü",
      score: hepatoMeds.length, maxScore: 4,
      level: hepatoMeds.length >= 3 ? "high" : hepatoMeds.length >= 1 ? "medium" : "low",
      details: hepatoMeds.map(m => ({ en: `${m} is potentially hepatotoxic`, tr: `${m} potansiyel hepatotoksik` })),
      icon: Heart,
    })

    // Total interaction count
    const interactionCount = Math.floor(meds.length * (meds.length - 1) / 2)
    risks.push({
      category: "Interaction Complexity", categoryTr: "Etkileşim Karmaşıklığı",
      score: interactionCount, maxScore: 30,
      level: interactionCount >= 15 ? "high" : interactionCount >= 6 ? "medium" : "low",
      details: [{ en: `${interactionCount} possible drug pairs to check`, tr: `Kontrol edilecek ${interactionCount} olası ilaç çifti` }],
      icon: ShieldAlert,
    })

    return risks
  }

  const overallRisk = () => {
    if (meds.length < 5) return { level: "low", label: { en: "Low Risk", tr: "Düşük Risk" }, color: "bg-green-500" }
    if (meds.length < 10) return { level: "medium", label: { en: "Moderate Risk", tr: "Orta Risk" }, color: "bg-amber-500" }
    return { level: "high", label: { en: "High Risk", tr: "Yüksek Risk" }, color: "bg-red-500" }
  }

  const risks = calculateRisks()
  const overall = overallRisk()

  const LEVEL_COLORS = { low: "text-green-600 bg-green-500/10", medium: "text-amber-600 bg-amber-500/10", high: "text-red-600 bg-red-500/10" }

  const t = (key: string) => {
    const map: Record<string, Record<string, string>> = {
      title: { en: "Polypharmacy Risk Score", tr: "Polifarmasi Risk Skoru" },
      subtitle: { en: "Comprehensive risk assessment for patients taking 5+ medications", tr: "5+ ilaç kullanan hastalar için kapsamlı risk değerlendirmesi" },
      medications: { en: "medications", tr: "ilaç" },
      overall: { en: "Overall Polypharmacy Risk", tr: "Genel Polifarmasi Riski" },
      no_meds: { en: "Add medications to see risk assessment.", tr: "Risk değerlendirmesi için ilaç ekle." },
      disclaimer: { en: "Discuss this assessment with your doctor. Never stop medications without medical advice.", tr: "Bu değerlendirmeyi doktorunuzla tartışın. Tıbbi tavsiye olmadan ilaçları bırakmayın." },
      share_doctor: { en: "Share with Doctor", tr: "Doktorla Paylaş" },
    }
    return map[key]?.[lang] || key
  }

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <ShieldAlert className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>

        {meds.length === 0 ? (
          <Card className="p-8 text-center">
            <Pill className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">{t("no_meds")}</p>
          </Card>
        ) : (
          <>
            {/* Overall score */}
            <Card className="p-6 mb-6 text-center">
              <h3 className="text-sm text-muted-foreground mb-2">{t("overall")}</h3>
              <div className="flex items-center justify-center gap-4 mb-3">
                <div className={`w-20 h-20 rounded-full ${overall.color} flex items-center justify-center`}>
                  <span className="text-2xl font-bold text-white">{meds.length}</span>
                </div>
                <div className="text-left">
                  <p className="text-lg font-semibold">{overall.label[lang]}</p>
                  <p className="text-sm text-muted-foreground">{meds.length} {t("medications")}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 justify-center">
                {meds.map(m => <Badge key={m} variant="outline" className="text-xs">{m}</Badge>)}
              </div>
            </Card>

            {/* Risk factors */}
            <div className="space-y-3">
              {risks.map(risk => {
                const Icon = risk.icon
                const isExpanded = expandedSection === risk.category
                return (
                  <Card key={risk.category} className="overflow-hidden">
                    <button className="w-full p-4 flex items-center justify-between text-left"
                      onClick={() => setExpandedSection(isExpanded ? null : risk.category)}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${LEVEL_COLORS[risk.level]} flex items-center justify-center`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{lang === "tr" ? risk.categoryTr : risk.category}</h4>
                          <Badge className={`mt-1 ${LEVEL_COLORS[risk.level]}`}>
                            {risk.level === "low" ? tx("common.low", lang) :
                             risk.level === "medium" ? tx("common.moderate", lang) :
                             tx("common.high", lang)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{risk.score}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-border pt-3">
                        <ul className="space-y-1">
                          {risk.details.map((d, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0" />
                              {lang === "tr" ? d.tr : d.en}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>

            <Card className="p-4 mt-6 border-amber-500/30 bg-amber-500/5">
              <div className="flex gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-sm text-muted-foreground">{t("disclaimer")}</p>
              </div>
            </Card>

            <Button className="w-full mt-4" onClick={() => window.location.href = "/appointment-prep"}>
              <TrendingUp className="w-4 h-4 mr-2" />{t("share_doctor")}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
