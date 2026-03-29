"use client"

import { useState, useMemo, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  calculateRiskScore, CARE_PACKAGES, detectVariances, TIER_CONFIG,
  type PatientData, type RiskAssessment, type CarePackage, type VarianceAlert,
} from "@/lib/care-pathways"
import {
  Shield, Activity, AlertTriangle, ChevronDown, ChevronUp, Check,
  ArrowRight, Target, Moon, Heart, Droplets, Pill, Apple, Dumbbell,
  Brain, Stethoscope, Clock, Flame, TrendingUp, Bell, Loader2,
  CheckCircle, Circle, AlertCircle,
} from "lucide-react"

const COMPONENT_ICONS: Record<string, any> = { supplement: Pill, nutrition: Apple, exercise: Dumbbell, monitoring: Activity, ai_coaching: Brain, doctor_visit: Stethoscope }
const TIER_ICONS: Record<string, any> = { Shield, Activity, AlertTriangle }
const PACKAGE_ICONS: Record<string, any> = { Droplets, Moon, Heart }

export default function HealthRoadmapPage() {
  const { user } = useAuth()
  const { lang } = useLang()
  const [loading, setLoading] = useState(true)
  const [patientData, setPatientData] = useState<PatientData | null>(null)
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [expandedComponent, setExpandedComponent] = useState<number | null>(null)
  const [alerts, setAlerts] = useState<VarianceAlert[]>([])

  useEffect(() => {
    loadPatientData()
  }, [user])

  const loadPatientData = async () => {
    if (!user) { setLoading(false); return }
    try {
      const supabase = createBrowserClient()
      const [profileRes, medsRes] = await Promise.all([
        supabase.from("user_profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("user_medications").select("brand_name, generic_name").eq("user_id", user.id),
      ])
      const profile = profileRes.data
      const medCount = medsRes.data?.length || 0

      setPatientData({
        age: (() => { try { if (profile?.date_of_birth) { const ms = Date.now() - new Date(profile.date_of_birth).getTime(); return ms > 0 ? Math.floor(ms / 31557600000) : 35; } return 35; } catch { return 35; } })(),
        gender: profile?.gender || "unknown",
        conditions: (profile?.chronic_conditions || "").split(",").filter(Boolean),
        medicationCount: medCount,
        allergies: [],
        recentLabFlags: 1,
        symptomSeverity: 3,
        complianceRate: 85,
        hospitalizationsLastYear: 0,
        polypharmacy: medCount >= 5,
      })
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const risk = useMemo(() => patientData ? calculateRiskScore(patientData) : null, [patientData])
  const tierConfig = risk ? TIER_CONFIG[risk.tier] : null
  const TierIcon = tierConfig ? TIER_ICONS[tierConfig.icon] || Shield : Shield

  const applicablePackages = CARE_PACKAGES.filter(pkg =>
    risk && (risk.tier === "complex" || risk.tier === "management" || pkg.tier === "wellness")
  )

  const activePackage = selectedPackage ? CARE_PACKAGES.find(p => p.id === selectedPackage) : null

  const t = (key: string) => {
    const map: Record<string, Record<string, string>> = {
      title: { en: "Your Health Roadmap", tr: "Sağlık Yol Haritanız" },
      subtitle: { en: "Personalized care pathway based on your risk profile", tr: "Risk profilinize dayalı kişiselleştirilmiş bakım yolu" },
      risk_title: { en: "Risk Assessment", tr: "Risk Değerlendirmesi" },
      score: { en: "Risk Score", tr: "Risk Skoru" },
      factors: { en: "Contributing Factors", tr: "Katkıda Bulunan Faktörler" },
      packages: { en: "Recommended Care Packages", tr: "Önerilen Bakım Paketleri" },
      activate: { en: "Start This Package", tr: "Bu Paketi Başlat" },
      components: { en: "Package Components", tr: "Paket Bileşenleri" },
      milestones: { en: "Milestones", tr: "Kilometre Taşları" },
      week: { en: "Week", tr: "Hafta" },
      schedule: { en: "Today's Schedule", tr: "Bugünün Programı" },
      alerts_title: { en: "Variance Alerts", tr: "Varyans Uyarıları" },
      no_alerts: { en: "No variance alerts — you're on track!", tr: "Varyans uyarısı yok — yoldasınız!" },
      loading: { en: "Analyzing your health profile...", tr: "Sağlık profiliniz analiz ediliyor..." },
      priority: { en: "Priority", tr: "Öncelik" },
      critical: { en: "Critical", tr: "Kritik" },
      important: { en: "Important", tr: "Önemli" },
      recommended: { en: "Recommended", tr: "Önerilen" },
    }
    return map[key]?.[lang] || key
  }

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center flex-col gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{t("loading")}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>

        {/* ═══ Risk Assessment Card ═══ */}
        {risk && tierConfig && (
          <Card className="p-6 mb-6" style={{ borderLeftWidth: "4px", borderLeftColor: tierConfig.color }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${tierConfig.bgLight} flex items-center justify-center`}>
                  <TierIcon className="w-6 h-6" style={{ color: tierConfig.color }} />
                </div>
                <div>
                  <h2 className="font-bold">{t("risk_title")}</h2>
                  <Badge style={{ backgroundColor: `${tierConfig.color}15`, color: tierConfig.color, borderColor: `${tierConfig.color}30` }}>
                    {tierConfig.label[lang as "en" | "tr"]}
                  </Badge>
                </div>
              </div>
              {/* Score ring */}
              <div className="relative w-16 h-16">
                <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/20" />
                  <circle cx="32" cy="32" r="28" fill="none" strokeWidth="4" strokeLinecap="round"
                    stroke={tierConfig.color}
                    strokeDasharray={`${(risk.score / 100) * 176} 176`} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">{risk.score}</span>
              </div>
            </div>

            {/* Risk factors */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t("factors")}</p>
              <div className="space-y-1.5">
                {risk.factors.slice(0, 5).map((factor, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{factor.detail[lang as "en" | "tr"]}</span>
                    <Badge variant="outline" className="text-[10px]">+{factor.points}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Monitoring level */}
            <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{tierConfig.monitoring[lang as "en" | "tr"]}</span>
            </div>
          </Card>
        )}

        {/* ═══ Variance Alerts ═══ */}
        {alerts.length > 0 && (
          <div className="mb-6 space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />{t("alerts_title")}
            </h3>
            {alerts.map(alert => (
              <Card key={alert.id} className={`p-3 ${alert.severity === "critical" ? "border-red-500/30 bg-red-500/5" : "border-amber-500/30 bg-amber-500/5"}`}>
                <div className="flex items-start gap-2">
                  {alert.severity === "critical" ? <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" /> : <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />}
                  <div>
                    <p className="text-sm font-medium">{alert.title[lang as "en" | "tr"]}</p>
                    <p className="text-xs text-muted-foreground">{alert.suggestedAction[lang as "en" | "tr"]}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* ═══ Care Packages ═══ */}
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t("packages")}</h3>
        <div className="space-y-3 mb-6">
          {applicablePackages.map(pkg => {
            const PkgIcon = PACKAGE_ICONS[pkg.icon] || Activity
            const isSelected = selectedPackage === pkg.id
            return (
              <Card key={pkg.id}
                className={`p-5 cursor-pointer transition-all ${isSelected ? "ring-2 ring-primary" : "hover:shadow-md"}`}
                onClick={() => setSelectedPackage(isSelected ? null : pkg.id)}>
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${pkg.color}15` }}>
                    <PkgIcon className="w-5 h-5" style={{ color: pkg.color }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{pkg.title[lang as "en" | "tr"]}</h4>
                    <p className="text-sm text-muted-foreground mt-0.5">{pkg.description[lang as "en" | "tr"]}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-[10px]">{pkg.components.length} {tx("roadmap.components", lang)}</Badge>
                      <Badge variant="outline" className="text-[10px]">{pkg.milestones.length} {tx("roadmap.milestones", lang)}</Badge>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isSelected ? "rotate-180" : ""}`} />
                </div>
              </Card>
            )
          })}
        </div>

        {/* ═══ Active Package Details ═══ */}
        {activePackage && (
          <div className="space-y-4">
            {/* Components */}
            <Card className="p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Pill className="w-4 h-4 text-primary" />{t("components")}
              </h3>
              <div className="space-y-2">
                {activePackage.components.map((comp, i) => {
                  const CompIcon = COMPONENT_ICONS[comp.type] || Activity
                  const isExpanded = expandedComponent === i
                  const priorityColors = { critical: "text-red-600 bg-red-500/10", important: "text-amber-600 bg-amber-500/10", recommended: "text-blue-600 bg-blue-500/10" }
                  return (
                    <div key={i} className="border border-border rounded-lg overflow-hidden">
                      <button onClick={() => setExpandedComponent(isExpanded ? null : i)}
                        className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/30 transition-colors">
                        <CompIcon className="w-4 h-4 text-primary shrink-0" />
                        <div className="flex-1">
                          <span className="text-sm font-medium">{comp.title[lang as "en" | "tr"]}</span>
                          <span className="text-xs text-muted-foreground ml-2">{comp.frequency}</span>
                        </div>
                        <Badge className={`text-[9px] ${priorityColors[comp.priority]}`}>
                          {t(comp.priority)}
                        </Badge>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      {isExpanded && (
                        <div className="px-3 pb-3 pt-0 text-sm text-muted-foreground border-t border-border mt-0 pt-2">
                          {comp.details[lang as "en" | "tr"]}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Milestones */}
            <Card className="p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />{t("milestones")}
              </h3>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                {activePackage.milestones.map((ms, i) => (
                  <div key={i} className="relative pl-10 pb-4 last:pb-0">
                    <div className="absolute left-1.5 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center border-2 border-background z-10">
                      <Circle className="w-3 h-3 text-primary" />
                    </div>
                    <div>
                      <Badge variant="outline" className="text-[10px] mb-1">{t("week")} {ms.week}</Badge>
                      <p className="text-sm">{ms.target[lang as "en" | "tr"]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Daily Schedule (if available) */}
            {activePackage.weeklySchedule.length > 0 && (
              <Card className="p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />{t("schedule")}
                </h3>
                <div className="space-y-2">
                  {activePackage.weeklySchedule[0]?.tasks.map((task, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30">
                      <span className="text-xs font-mono text-muted-foreground w-12">{task.time}</span>
                      <div className={`w-2 h-2 rounded-full ${task.type === "monitoring" ? "bg-blue-500" : task.type === "supplement" ? "bg-green-500" : task.type === "nutrition" ? "bg-amber-500" : "bg-purple-500"}`} />
                      <span className="text-sm">{task.task[lang as "en" | "tr"]}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
