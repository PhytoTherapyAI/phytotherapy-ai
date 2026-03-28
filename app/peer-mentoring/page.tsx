"use client"

import { useState } from "react"
import { useLang } from "@/components/layout/language-toggle"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Users, MessageCircle, Shield, Heart, Star, Search, UserPlus } from "lucide-react"

interface Mentor {
  id: string
  name: string
  condition: string
  years: number
  bio: { en: string; tr: string }
  tags: string[]
  rating: number
  sessions: number
}

const DEMO_MENTORS: Mentor[] = [
  { id: "1", name: "Ayşe K.", condition: "Type 2 Diabetes", years: 5, bio: { en: "I've managed diabetes for 5 years with diet and exercise. Happy to share my journey.", tr: "5 yıldır diyeti ve egzersizle diyabet yönetiyorum. Yolculuğumu paylaşmaktan mutluluk duyarım." }, tags: ["diabetes", "nutrition", "exercise"], rating: 4.8, sessions: 24 },
  { id: "2", name: "Mehmet D.", condition: "Hypertension", years: 8, bio: { en: "Living with high blood pressure since 2018. I know the medication journey well.", tr: "2018'den beri yüksek tansiyonla yaşıyorum. İlaç yolculuğunu iyi biliyorum." }, tags: ["hypertension", "medication", "stress"], rating: 4.9, sessions: 31 },
  { id: "3", name: "Zeynep A.", condition: "Thyroid (Hashimoto)", years: 6, bio: { en: "Hashimoto's warrior. I can help with medication timing, diet, and energy management.", tr: "Hashimoto savaşçısı. İlaç zamanlaması, diyet ve enerji yönetiminde yardımcı olabilirim." }, tags: ["thyroid", "autoimmune", "fatigue"], rating: 4.7, sessions: 18 },
  { id: "4", name: "Ali R.", condition: "Depression Recovery", years: 3, bio: { en: "Recovered from major depression. I understand the dark days and the light ahead.", tr: "Majör depresyondan iyileştim. Karanlık günleri ve önümüzdeki aydınlığı anlıyorum." }, tags: ["depression", "mental-health", "recovery"], rating: 5.0, sessions: 42 },
  { id: "5", name: "Fatma S.", condition: "IBS", years: 4, bio: { en: "FODMAP diet expert through personal experience. IBS doesn't have to control your life.", tr: "Kişisel deneyimle FODMAP diyet uzmanı. IBS hayatınızı kontrol etmek zorunda değil." }, tags: ["ibs", "fodmap", "gut-health"], rating: 4.6, sessions: 15 },
  { id: "6", name: "Hasan T.", condition: "Quitting Smoking", years: 2, bio: { en: "Quit after 20 years. If I can do it, you can too. Let me help.", tr: "20 yıl sonra bıraktım. Ben yapabildimse sen de yapabilirsin. Yardım edeyim." }, tags: ["smoking", "addiction", "willpower"], rating: 4.9, sessions: 37 },
]

const CONDITION_FILTERS = [
  { en: "All", tr: "Tümü", value: "all" },
  { en: "Diabetes", tr: "Diyabet", value: "diabetes" },
  { en: "Heart", tr: "Kalp", value: "hypertension" },
  { en: "Thyroid", tr: "Tiroid", value: "thyroid" },
  { en: "Mental Health", tr: "Mental Sağlık", value: "mental-health" },
  { en: "Gut Health", tr: "Sindirim", value: "gut-health" },
]

export default function PeerMentoringPage() {
  const { lang } = useLang()
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")

  const filtered = DEMO_MENTORS.filter(m => {
    const matchesSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.condition.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === "all" || m.tags.includes(filter)
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{lang === "tr" ? "Akran Sağlık Mentorluğu" : "Peer Health Mentoring"}</h1>
          <p className="text-muted-foreground mt-1">{lang === "tr" ? "Aynı yoldan geçmiş birinden 1-1 gönüllü destek" : "1-on-1 volunteer support from someone who's been there"}</p>
        </div>

        <Card className="p-4 mb-6 bg-green-500/5 border-green-500/30">
          <div className="flex gap-2">
            <Shield className="w-5 h-5 text-green-500 shrink-0" />
            <p className="text-sm text-muted-foreground">
              {lang === "tr"
                ? "Tüm mentorlar doğrulanmış ve moderasyonlu. Tıbbi tavsiye vermezler, deneyim paylaşırlar."
                : "All mentors are verified and moderated. They share experience, not medical advice."}
            </p>
          </div>
        </Card>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder={lang === "tr" ? "Mentor ara..." : "Search mentors..."} value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {CONDITION_FILTERS.map(f => (
            <Button key={f.value} size="sm" variant={filter === f.value ? "default" : "outline"} onClick={() => setFilter(f.value)} className="whitespace-nowrap">
              {f[lang]}
            </Button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.map(mentor => (
            <Card key={mentor.id} className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0">
                  {mentor.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{mentor.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-amber-500">
                      <Star className="w-4 h-4 fill-current" />{mentor.rating}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{mentor.condition}</Badge>
                    <span className="text-xs text-muted-foreground">{mentor.years} {lang === "tr" ? "yıl deneyim" : "years experience"}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{mentor.bio[lang]}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground">
                      <MessageCircle className="w-3 h-3 inline mr-1" />{mentor.sessions} {lang === "tr" ? "seans" : "sessions"}
                    </span>
                    <Button size="sm">
                      <UserPlus className="w-4 h-4 mr-1" />{lang === "tr" ? "Bağlan" : "Connect"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <Card className="p-8 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">{lang === "tr" ? "Bu kriterlere uygun mentor bulunamadı." : "No mentors found for this criteria."}</p>
          </Card>
        )}

        <Card className="p-5 mt-6 text-center">
          <Heart className="w-8 h-8 text-primary mx-auto mb-2" />
          <h3 className="font-semibold">{lang === "tr" ? "Mentor Olmak İster Misin?" : "Want to Become a Mentor?"}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === "tr"
              ? "En az 2 yıl kronik hastalık deneyimin varsa başvur"
              : "Apply if you have 2+ years of chronic condition experience"}
          </p>
          <Button className="mt-3" variant="outline">{lang === "tr" ? "Başvur" : "Apply"}</Button>
        </Card>
      </div>
    </div>
  )
}
