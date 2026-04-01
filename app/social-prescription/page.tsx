// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState } from "react"
import { useLang } from "@/components/layout/language-toggle"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, TreePine, Palette, Heart, Music, BookOpen, Dog, Bike, Coffee, ChevronDown, ChevronUp, Plus, Check } from "lucide-react"
import { tx } from "@/lib/translations"

interface SocialRx {
  category: string
  icon: any
  color: string
  title: { en: string; tr: string }
  description: { en: string; tr: string }
  evidence: { en: string; tr: string }
  activities: { en: string; tr: string }[]
  forConditions: string[]
}

const SOCIAL_PRESCRIPTIONS: SocialRx[] = [
  {
    category: "nature", icon: TreePine, color: "text-green-500 bg-green-500/10",
    title: { en: "Nature Therapy", tr: "Doğa Terapisi" },
    description: { en: "Spending time in nature reduces cortisol, blood pressure, and anxiety", tr: "Doğada zaman geçirmek kortizol, tansiyon ve anksiyeteyi azaltır" },
    evidence: { en: "Grade B - Multiple RCTs show 20min/day in nature reduces stress hormones by 20%", tr: "Kanıt B - Çoklu RCT'ler günde 20dk doğanın stres hormonlarını %20 azalttığını gösterir" },
    activities: [
      { en: "Walk in a park 3x/week (30 min)", tr: "Haftada 3x parkta yürü (30 dk)" },
      { en: "Garden therapy (planting, tending)", tr: "Bahçe terapisi (ekim, bakım)" },
      { en: "Forest bathing (shinrin-yoku)", tr: "Orman banyosu (shinrin-yoku)" },
    ],
    forConditions: ["Depression", "Anxiety", "Hypertension", "Chronic pain"],
  },
  {
    category: "art", icon: Palette, color: "text-purple-500 bg-purple-500/10",
    title: { en: "Art & Creative Therapy", tr: "Sanat & Yaratıcı Terapi" },
    description: { en: "Creative activities activate reward pathways and reduce rumination", tr: "Yaratıcı aktiviteler ödül yollarını aktive eder ve ruminasyonu azaltır" },
    evidence: { en: "Grade B - WHO report: arts engagement improves mental health outcomes", tr: "Kanıt B - WHO raporu: sanat katılımı mental sağlık sonuçlarını iyileştirir" },
    activities: [
      { en: "Join a local art workshop", tr: "Yerel sanat atölyesine katıl" },
      { en: "Pottery or ceramics class", tr: "Çömlek veya seramik kursu" },
      { en: "Journaling or creative writing", tr: "Günlük tutma veya yaratıcı yazarlık" },
    ],
    forConditions: ["Depression", "PTSD", "Dementia", "Chronic pain"],
  },
  {
    category: "music", icon: Music, color: "text-pink-500 bg-pink-500/10",
    title: { en: "Music Therapy", tr: "Müzik Terapisi" },
    description: { en: "Music reduces pain perception, anxiety, and improves mood", tr: "Müzik ağrı algısını, anksiyeteyi azaltır ve ruh halini iyileştirir" },
    evidence: { en: "Grade A - Strong evidence for pain reduction and anxiety management", tr: "Kanıt A - Ağrı azaltma ve anksiyete yönetimi için güçlü kanıt" },
    activities: [
      { en: "Listen to calming music 30 min/day", tr: "Günde 30 dk sakinleştirici müzik dinle" },
      { en: "Join a community choir", tr: "Topluluk korosuna katıl" },
      { en: "Learn an instrument", tr: "Bir enstrüman öğren" },
    ],
    forConditions: ["Anxiety", "Chronic pain", "Insomnia", "Depression"],
  },
  {
    category: "volunteer", icon: Heart, color: "text-red-500 bg-red-500/10",
    title: { en: "Volunteering", tr: "Gönüllülük" },
    description: { en: "Helping others activates reward circuits and reduces mortality risk", tr: "Başkalarına yardım etmek ödül devrelerini aktive eder ve mortalite riskini azaltır" },
    evidence: { en: "Grade B - Volunteering 2h/week associated with 40% lower mortality in elderly", tr: "Kanıt B - Haftada 2 saat gönüllülük yaşlılarda %40 düşük mortalite ile ilişkili" },
    activities: [
      { en: "Animal shelter volunteering", tr: "Hayvan barınağında gönüllülük" },
      { en: "Community kitchen/food bank", tr: "Topluluk mutfağı/gıda bankası" },
      { en: "Elderly visit programs", tr: "Yaşlı ziyaret programları" },
    ],
    forConditions: ["Social isolation", "Depression", "Retirement adjustment"],
  },
  {
    category: "social", icon: Coffee, color: "text-amber-500 bg-amber-500/10",
    title: { en: "Social Connection", tr: "Sosyal Bağlantı" },
    description: { en: "Social isolation is as harmful as smoking 15 cigarettes/day", tr: "Sosyal izolasyon günde 15 sigara içmek kadar zararlı" },
    evidence: { en: "Grade A - Meta-analysis: strong social connections reduce mortality by 50%", tr: "Kanıt A - Meta-analiz: güçlü sosyal bağlantılar mortaliteyi %50 azaltır" },
    activities: [
      { en: "Weekly coffee with a friend", tr: "Bir arkadaşla haftalık kahve" },
      { en: "Join a walking group", tr: "Yürüyüş grubuna katıl" },
      { en: "Community meal sharing", tr: "Topluluk yemek paylaşımı" },
    ],
    forConditions: ["Social isolation", "Depression", "Elderly loneliness"],
  },
  {
    category: "exercise", icon: Bike, color: "text-blue-500 bg-blue-500/10",
    title: { en: "Group Exercise", tr: "Grup Egzersizi" },
    description: { en: "Exercise in groups has added social benefits beyond solo exercise", tr: "Grupla egzersiz bireysel egzersizin ötesinde sosyal faydalar sağlar" },
    evidence: { en: "Grade A - Exercise is as effective as antidepressants for mild-moderate depression", tr: "Kanıt A - Egzersiz hafif-orta depresyon için antidepresanlar kadar etkili" },
    activities: [
      { en: "Yoga class (2x/week)", tr: "Yoga dersi (haftada 2x)" },
      { en: "Swimming group", tr: "Yüzme grubu" },
      { en: "Dance class", tr: "Dans dersi" },
    ],
    forConditions: ["Depression", "Anxiety", "Obesity", "Chronic pain"],
  },
  {
    category: "reading", icon: BookOpen, color: "text-indigo-500 bg-indigo-500/10",
    title: { en: "Bibliotherapy", tr: "Biblioterapi" },
    description: { en: "Reading self-help books prescribed by health professionals", tr: "Sağlık profesyonellerinin önerdiği öz-yardım kitapları okuma" },
    evidence: { en: "Grade B - NICE guidelines recommend for mild depression and anxiety", tr: "Kanıt B - NICE kılavuzları hafif depresyon ve anksiyete için önerir" },
    activities: [
      { en: "Join a book club", tr: "Kitap kulübüne katıl" },
      { en: "CBT self-help workbook", tr: "BDT öz-yardım çalışma kitabı" },
      { en: "Reading 30 min before bed", tr: "Yatmadan önce 30 dk okuma" },
    ],
    forConditions: ["Mild depression", "Anxiety", "Insomnia"],
  },
  {
    category: "animal", icon: Dog, color: "text-orange-500 bg-orange-500/10",
    title: { en: "Animal-Assisted Therapy", tr: "Hayvan Destekli Terapi" },
    description: { en: "Interaction with animals reduces cortisol and increases oxytocin", tr: "Hayvanlarla etkileşim kortizolü azaltır ve oksitosini artırır" },
    evidence: { en: "Grade B - Pet therapy reduces anxiety in hospitalized patients by 30%", tr: "Kanıt B - Hayvan terapisi hastanedeki hastalarda anksiyeteyi %30 azaltır" },
    activities: [
      { en: "Pet therapy visits", tr: "Evcil hayvan terapisi ziyaretleri" },
      { en: "Dog walking volunteering", tr: "Köpek gezdirme gönüllülüğü" },
      { en: "Equine therapy", tr: "At terapisi" },
    ],
    forConditions: ["PTSD", "Autism", "Elderly loneliness", "Anxiety"],
  },
]

export default function SocialPrescriptionPage() {
  const { lang } = useLang()
  const [expanded, setExpanded] = useState<string | null>("nature")
  const [prescriptions, setPrescriptions] = useState<string[]>([])

  const togglePrescription = (category: string) => {
    setPrescriptions(prev => prev.includes(category) ? prev.filter(p => p !== category) : [...prev, category])
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{tx("socialRx.title", lang)}</h1>
          <p className="text-muted-foreground mt-1">{tx("socialRx.subtitle", lang)}</p>
        </div>

        <Card className="p-4 mb-6 bg-primary/5 border-primary/30">
          <p className="text-sm text-center">
            {tx("socialRx.nhsNote", lang)}
          </p>
        </Card>

        {prescriptions.length > 0 && (
          <Card className="p-4 mb-6">
            <h3 className="font-semibold text-sm mb-2">{tx("socialRx.yourPrescription", lang)}</h3>
            <div className="flex flex-wrap gap-2">
              {prescriptions.map(p => {
                const rx = SOCIAL_PRESCRIPTIONS.find(s => s.category === p)
                if (!rx) return null
                return <Badge key={p} className="bg-primary/10 text-primary">{rx.title[lang]}</Badge>
              })}
            </div>
          </Card>
        )}

        <div className="space-y-3">
          {SOCIAL_PRESCRIPTIONS.map(rx => {
            const Icon = rx.icon
            const isExpanded = expanded === rx.category
            const isSelected = prescriptions.includes(rx.category)
            return (
              <Card key={rx.category} className={`overflow-hidden ${isSelected ? "border-primary/50" : ""}`}>
                <button className="w-full p-4 flex items-center justify-between text-left" onClick={() => setExpanded(isExpanded ? null : rx.category)}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${rx.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{rx.title[lang]}</h4>
                      <p className="text-xs text-muted-foreground">{rx.description[lang]}</p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border pt-3">
                    <Badge variant="outline" className="text-xs mb-3">{rx.evidence[lang]}</Badge>
                    <h5 className="text-xs font-medium text-muted-foreground mb-2">{tx("socialRx.suggestedActivities", lang)}</h5>
                    <ul className="space-y-1 mb-3">
                      {rx.activities.map((a, i) => (
                        <li key={i} className="text-sm flex items-center gap-2"><Check className="w-3 h-3 text-green-500" />{a[lang]}</li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {rx.forConditions.map(c => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}
                    </div>
                    <Button size="sm" variant={isSelected ? "default" : "outline"} onClick={() => togglePrescription(rx.category)}>
                      {isSelected ? <Check className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                      {isSelected ? tx("socialRx.added", lang) : tx("socialRx.addToPrescription", lang)}
                    </Button>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
