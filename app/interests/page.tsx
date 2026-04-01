// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles, Moon, Zap, Scale, Brain, Heart, Apple, Leaf,
  Activity, Eye, Dumbbell, Baby, Sun, Droplets, Pill, Shield,
  Smile, ChevronRight, Check, ArrowRight,
} from "lucide-react"

// ── Interest Data ──
interface InterestChip {
  id: string
  label: { en: string; tr: string }
  icon: any
  color: string
  category: "goals" | "clinical" | "lifestyle"
}

const INTERESTS: InterestChip[] = [
  // Health Goals
  { id: "better_sleep", label: { en: "Better Sleep", tr: "Daha İyi Uyku" }, icon: Moon, color: "#818CF8", category: "goals" },
  { id: "energy_focus", label: { en: "Energy & Focus", tr: "Enerji & Odaklanma" }, icon: Zap, color: "#F59E0B", category: "goals" },
  { id: "weight_management", label: { en: "Weight Management", tr: "Kilo Yönetimi" }, icon: Scale, color: "#10B981", category: "goals" },
  { id: "stress_control", label: { en: "Stress Control", tr: "Stres Kontrolü" }, icon: Brain, color: "#8B5CF6", category: "goals" },
  { id: "immune_boost", label: { en: "Immune Boost", tr: "Bağışıklık Güçlendirme" }, icon: Shield, color: "#0EA5E9", category: "goals" },
  { id: "mood_mental", label: { en: "Mood & Mental Health", tr: "Ruh Hali & Mental Sağlık" }, icon: Smile, color: "#EC4899", category: "goals" },
  { id: "pain_management", label: { en: "Pain Management", tr: "Ağrı Yönetimi" }, icon: Activity, color: "#EF4444", category: "goals" },
  { id: "heart_health", label: { en: "Heart Health", tr: "Kalp Sağlığı" }, icon: Heart, color: "#DC2626", category: "goals" },

  // Clinical Interest
  { id: "chronic_disease", label: { en: "Chronic Disease", tr: "Kronik Hastalık Yönetimi" }, icon: Activity, color: "#F97316", category: "clinical" },
  { id: "gut_health", label: { en: "Gut & Digestion", tr: "Sindirim & Bağırsak Sağlığı" }, icon: Apple, color: "#22C55E", category: "clinical" },
  { id: "womens_health", label: { en: "Women's Health", tr: "Kadın Sağlığı" }, icon: Heart, color: "#F472B6", category: "clinical" },
  { id: "mens_health", label: { en: "Men's Health", tr: "Erkek Sağlığı" }, icon: Shield, color: "#6366F1", category: "clinical" },
  { id: "skin_care", label: { en: "Skin Care", tr: "Cilt Bakımı" }, icon: Sparkles, color: "#D946EF", category: "clinical" },
  { id: "thyroid", label: { en: "Thyroid Health", tr: "Tiroid Sağlığı" }, icon: Activity, color: "#14B8A6", category: "clinical" },
  { id: "diabetes", label: { en: "Blood Sugar", tr: "Kan Şekeri Yönetimi" }, icon: Droplets, color: "#F59E0B", category: "clinical" },
  { id: "drug_interactions", label: { en: "Drug Interactions", tr: "İlaç Etkileşimleri" }, icon: Pill, color: "#EF4444", category: "clinical" },

  // Lifestyle
  { id: "functional_nutrition", label: { en: "Functional Nutrition", tr: "Fonksiyonel Beslenme" }, icon: Apple, color: "#22C55E", category: "lifestyle" },
  { id: "anti_aging", label: { en: "Anti-Aging", tr: "Anti-Aging & Yaşlanma Karşıtı" }, icon: Sun, color: "#F59E0B", category: "lifestyle" },
  { id: "sports_supplements", label: { en: "Sports Supplements", tr: "Sporcu Takviyeleri" }, icon: Dumbbell, color: "#3B82F6", category: "lifestyle" },
  { id: "herbal_medicine", label: { en: "Herbal Medicine", tr: "Bitkisel İlaç" }, icon: Leaf, color: "#059669", category: "lifestyle" },
  { id: "pregnancy", label: { en: "Pregnancy & Fertility", tr: "Gebelik & Doğurganlık" }, icon: Baby, color: "#EC4899", category: "lifestyle" },
  { id: "detox_cleanse", label: { en: "Detox & Cleanse", tr: "Detoks & Arınma" }, icon: Droplets, color: "#06B6D4", category: "lifestyle" },
  { id: "meditation", label: { en: "Meditation & Breathwork", tr: "Meditasyon & Nefes" }, icon: Brain, color: "#8B5CF6", category: "lifestyle" },
  { id: "eye_care", label: { en: "Eye Health", tr: "Göz Sağlığı" }, icon: Eye, color: "#0EA5E9", category: "lifestyle" },
]

const CATEGORIES = [
  { id: "goals" as const, label: { en: "Health Goals", tr: "Sağlık Hedefleri" }, emoji: "🎯" },
  { id: "clinical" as const, label: { en: "Clinical Interests", tr: "Klinik İlgi Alanları" }, emoji: "🩺" },
  { id: "lifestyle" as const, label: { en: "Lifestyle", tr: "Yaşam Tarzı" }, emoji: "🌿" },
]

export default function InterestsPage() {
  const { user } = useAuth()
  const { lang } = useLang()
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [primaryGoal, setPrimaryGoal] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showPrimary, setShowPrimary] = useState(false)

  // Load saved interests
  useEffect(() => {
    const saved = localStorage.getItem(`user_interests_${user?.id || "guest"}`)
    if (saved) {
      const data = JSON.parse(saved)
      setSelected(new Set(data.selectedInterests || []))
      setPrimaryGoal(data.primaryGoal || null)
    }
  }, [user])

  const toggleInterest = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleContinue = () => {
    if (selected.size >= 3 && !showPrimary) {
      setShowPrimary(true)
      return
    }
    if (!primaryGoal && selected.size > 0) {
      setPrimaryGoal(Array.from(selected)[0])
    }
    handleSave()
  }

  const handleSave = async () => {
    setSaving(true)
    const data = {
      userId: user?.id || "guest",
      selectedInterests: Array.from(selected),
      primaryGoal: primaryGoal || Array.from(selected)[0],
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(`user_interests_${user?.id || "guest"}`, JSON.stringify(data))

    // Simulate AI processing
    await new Promise(r => setTimeout(r, 1500))
    setSaving(false)
    router.push("/dashboard")
  }

  const minRequired = 3
  const canContinue = selected.size >= minRequired

  const t = (key: string) => {
    const map: Record<string, Record<string, string>> = {
      title: { en: "What matters most to you?", tr: "Sizin için en önemli olan nedir?" },
      subtitle: { en: "Select at least 3 topics to personalize your experience. Our AI will tailor everything to your needs.", tr: "Deneyiminizi kişiselleştirmek için en az 3 konu seçin. Yapay zekamız her şeyi ihtiyaçlarınıza göre uyarlayacak." },
      selected_count: { en: "selected", tr: "seçildi" },
      min_hint: { en: `Select at least ${minRequired} topics`, tr: `En az ${minRequired} konu seçin` },
      continue: { en: "Create My Personalized Page", tr: "Kişiselleştirilmiş Sayfamı Oluştur" },
      primary_title: { en: "What's your #1 priority?", tr: "1 numaralı önceliğiniz nedir?" },
      primary_subtitle: { en: "This will be your main focus area", tr: "Bu, ana odak alanınız olacak" },
      saving: { en: "Personalizing your experience...", tr: "Deneyiminiz kişiselleştiriliyor..." },
      skip: { en: "Skip for now", tr: "Şimdilik atla" },
    }
    return map[key]?.[lang] || key
  }

  // ── Primary Goal Selection ──
  if (showPrimary) {
    const selectedItems = INTERESTS.filter(i => selected.has(i.id))
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{t("primary_title")}</h1>
          <p className="text-muted-foreground mb-8">{t("primary_subtitle")}</p>

          <div className="space-y-3 mb-8">
            {selectedItems.map(item => {
              const Icon = item.icon
              const isSelected = primaryGoal === item.id
              return (
                <button key={item.id} onClick={() => setPrimaryGoal(item.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                    isSelected ? "border-primary bg-primary/5 shadow-md scale-[1.02]" : "border-border hover:border-primary/30"
                  }`}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${item.color}15` }}>
                    <Icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <span className="font-medium flex-1 text-left">{item.label[lang as "en" | "tr"]}</span>
                  {isSelected && <Check className="w-5 h-5 text-primary" />}
                </button>
              )
            })}
          </div>

          <Button size="lg" className="w-full h-12 text-base gap-2" onClick={handleSave}
            disabled={!primaryGoal || saving}>
            {saving ? (
              <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t("saving")}</>
            ) : (
              <>{t("continue")} <ArrowRight className="w-5 h-5" /></>
            )}
          </Button>
        </div>
      </div>
    )
  }

  // ── Main Interest Selection ──
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 mb-6">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">{t("title")}</h1>
          <p className="text-muted-foreground max-w-md mx-auto">{t("subtitle")}</p>
        </div>

        {/* Selection counter */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Badge variant={canContinue ? "default" : "outline"} className="text-sm px-3 py-1 gap-1">
            {canContinue ? <Check className="w-3.5 h-3.5" /> : null}
            {selected.size} {t("selected_count")}
          </Badge>
          {!canContinue && (
            <span className="text-xs text-muted-foreground">{t("min_hint")}</span>
          )}
        </div>

        {/* Categories */}
        <div className="space-y-8">
          {CATEGORIES.map(category => {
            const categoryInterests = INTERESTS.filter(i => i.category === category.id)
            return (
              <div key={category.id}>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span>{category.emoji}</span>
                  {category.label[lang as "en" | "tr"]}
                </h2>
                <div className="flex flex-wrap gap-2.5">
                  {categoryInterests.map(interest => {
                    const Icon = interest.icon
                    const isActive = selected.has(interest.id)
                    return (
                      <button key={interest.id} onClick={() => toggleInterest(interest.id)}
                        className={`group inline-flex items-center gap-2 px-4 py-2.5 rounded-full border-2 transition-all duration-200 select-none ${
                          isActive
                            ? "border-transparent shadow-md scale-[1.03]"
                            : "border-border hover:border-primary/30 hover:bg-muted/30 hover:scale-[1.02]"
                        }`}
                        style={isActive ? { backgroundColor: `${interest.color}15`, borderColor: `${interest.color}40` } : {}}>
                        <Icon className={`w-4 h-4 transition-colors ${isActive ? "" : "text-muted-foreground group-hover:text-foreground"}`}
                          style={isActive ? { color: interest.color } : {}} />
                        <span className={`text-sm font-medium transition-colors ${isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
                          {interest.label[lang as "en" | "tr"]}
                        </span>
                        {isActive && (
                          <Check className="w-3.5 h-3.5 ml-0.5" style={{ color: interest.color }} />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border mt-10 -mx-4 px-4 py-4 md:mx-0 md:px-0 md:border-0 md:bg-transparent md:backdrop-blur-none">
          <div className="flex gap-3 max-w-md mx-auto">
            <Button variant="ghost" className="text-muted-foreground" onClick={() => router.push("/dashboard")}>
              {t("skip")}
            </Button>
            <Button size="lg" className="flex-1 h-12 text-base gap-2" disabled={!canContinue || saving}
              onClick={handleContinue}>
              {saving ? (
                <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t("saving")}</>
              ) : (
                <>{t("continue")} <ChevronRight className="w-5 h-5" /></>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
