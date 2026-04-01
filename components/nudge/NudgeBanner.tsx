// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Users, Clock, Flame, TrendingUp, Sparkles } from "lucide-react"

type NudgeType = "social_proof" | "fomo" | "timing" | "streak"

interface NudgeBannerProps {
  type: NudgeType
  data?: {
    count?: number
    percentage?: number
    streakDays?: number
    supplement?: string
    timeLeft?: string
  }
  lang: string
  onDismiss?: () => void
}

const nudgeConfig: Record<NudgeType, {
  icon: any
  gradient: string
  borderColor: string
  messages: { en: (d: any) => string; tr: (d: any) => string }[]
}> = {
  social_proof: {
    icon: Users,
    gradient: "from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30",
    borderColor: "border-l-blue-500",
    messages: [
      {
        en: (d) => `${d?.percentage || 80}% of users take ${d?.supplement || "this supplement"} for 3+ months`,
        tr: (d) => `Kullanicilarin %${d?.percentage || 80}'i ${d?.supplement || "bu takviyeyi"} 3+ ay kullaniyor`,
      },
      {
        en: (d) => `${d?.count || 1200}+ users improved their health score this week`,
        tr: (d) => `Bu hafta ${d?.count || 1200}+ kullanici sağlık skorunu iyilestirdi`,
      },
    ],
  },
  fomo: {
    icon: TrendingUp,
    gradient: "from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30",
    borderColor: "border-l-amber-500",
    messages: [
      {
        en: (d) => `${d?.percentage || 92}% of users have already taken their meds today`,
        tr: (d) => `Kullanicilarin %${d?.percentage || 92}'si bugun ilaclarini aldi`,
      },
      {
        en: (d) => `Don't fall behind - ${d?.count || 340} users logged their vitals today`,
        tr: (d) => `Geride kalma - bugun ${d?.count || 340} kullanici vital degerlerini girdi`,
      },
    ],
  },
  timing: {
    icon: Clock,
    gradient: "from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30",
    borderColor: "border-l-purple-500",
    messages: [
      {
        en: (d) => `Take now - forgetting risk increases ${d?.percentage || 60}% in ${d?.timeLeft || "2 hours"}`,
        tr: (d) => `Simdi al - ${d?.timeLeft || "2 saat"} icinde unutma riski %${d?.percentage || 60} artiyor`,
      },
      {
        en: () => "Best absorption time is within the next 30 minutes",
        tr: () => "En iyi emilim zamani onumuzdeki 30 dakika icinde",
      },
    ],
  },
  streak: {
    icon: Flame,
    gradient: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30",
    borderColor: "border-l-green-500",
    messages: [
      {
        en: (d) => `You're on a ${d?.streakDays || 7}-day streak! Don't break it!`,
        tr: (d) => `${d?.streakDays || 7} gunluk seri! Kirma!`,
      },
      {
        en: (d) => `${d?.streakDays || 14} days strong! Top 10% of users`,
        tr: (d) => `${d?.streakDays || 14} gun boyunca! Kullanicilarin ilk %10'u`,
      },
    ],
  },
}

export default function NudgeBanner({ type, data, lang, onDismiss }: NudgeBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const config = nudgeConfig[type]
  const Icon = config.icon
  const msgIdx = Math.floor(Math.random() * config.messages.length)
  const message = config.messages[0][lang as "en" | "tr"](data)

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  const typeLabel: Record<NudgeType, { en: string; tr: string }> = {
    social_proof: { en: "Community", tr: "Topluluk" },
    fomo: { en: "Trend", tr: "Trend" },
    timing: { en: "Reminder", tr: "Hatirlatma" },
    streak: { en: "Streak", tr: "Seri" },
  }

  return (
    <Card className={`relative overflow-hidden border-l-4 ${config.borderColor} bg-gradient-to-r ${config.gradient} p-3 pr-10`}>
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              <Sparkles className="w-3 h-3 mr-1" />
              {typeLabel[type][lang as "en" | "tr"]}
            </Badge>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">{message}</p>
        </div>
      </div>
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4 text-gray-400" />
      </button>
    </Card>
  )
}
