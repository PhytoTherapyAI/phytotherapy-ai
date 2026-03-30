// © 2026 Phytotherapy.ai — All Rights Reserved
// ============================================
// Gamification Badges — Sprint 15
// ============================================

export interface Badge {
  id: string
  icon: string
  nameEn: string
  nameTr: string
  descEn: string
  descTr: string
  category: "health" | "engagement" | "social" | "milestone"
  condition: (stats: UserStats) => boolean
}

export interface UserStats {
  totalQueries: number
  totalCheckIns: number
  streakDays: number
  bloodTestCount: number
  supplementsTracked: number
  waterGoalHits: number
  interactionChecks: number
  daysActive: number
  familyMembers: number
  pdfReports: number
}

export const BADGES: Badge[] = [
  // Health
  {
    id: "first_query",
    icon: "🌱",
    nameEn: "First Steps",
    nameTr: "İlk Adım",
    descEn: "Asked your first health question",
    descTr: "İlk sağlık sorunu sordun",
    category: "health",
    condition: (s) => s.totalQueries >= 1,
  },
  {
    id: "curious_mind",
    icon: "🧠",
    nameEn: "Curious Mind",
    nameTr: "Meraklı Zihin",
    descEn: "Asked 25 health questions",
    descTr: "25 sağlık sorusu sordun",
    category: "health",
    condition: (s) => s.totalQueries >= 25,
  },
  {
    id: "health_scholar",
    icon: "🎓",
    nameEn: "Health Scholar",
    nameTr: "Sağlık Araştırmacısı",
    descEn: "Asked 100 health questions",
    descTr: "100 sağlık sorusu sordun",
    category: "health",
    condition: (s) => s.totalQueries >= 100,
  },
  {
    id: "blood_detective",
    icon: "🔬",
    nameEn: "Blood Detective",
    nameTr: "Kan Dedektifi",
    descEn: "Analyzed your first blood test",
    descTr: "İlk kan tahlilini analiz ettin",
    category: "health",
    condition: (s) => s.bloodTestCount >= 1,
  },
  {
    id: "lab_master",
    icon: "🧪",
    nameEn: "Lab Master",
    nameTr: "Laboratuvar Ustası",
    descEn: "Analyzed 10 blood tests",
    descTr: "10 kan tahlili analiz ettin",
    category: "health",
    condition: (s) => s.bloodTestCount >= 10,
  },
  {
    id: "safety_first",
    icon: "🛡️",
    nameEn: "Safety First",
    nameTr: "Önce Güvenlik",
    descEn: "Checked your first drug interaction",
    descTr: "İlk ilaç etkileşimini kontrol ettin",
    category: "health",
    condition: (s) => s.interactionChecks >= 1,
  },
  {
    id: "pharmacist",
    icon: "💊",
    nameEn: "Pharmacist",
    nameTr: "Eczacı",
    descEn: "Checked 20 drug interactions",
    descTr: "20 ilaç etkileşimi kontrol ettin",
    category: "health",
    condition: (s) => s.interactionChecks >= 20,
  },

  // Engagement
  {
    id: "hydro_hero",
    icon: "💧",
    nameEn: "Hydro Hero",
    nameTr: "Hidrasyon Kahramanı",
    descEn: "Hit your water goal 7 days",
    descTr: "7 gün su hedefini tutturdu",
    category: "engagement",
    condition: (s) => s.waterGoalHits >= 7,
  },
  {
    id: "ocean_master",
    icon: "🌊",
    nameEn: "Ocean Master",
    nameTr: "Okyanus Efendisi",
    descEn: "Hit your water goal 30 days",
    descTr: "30 gün su hedefini tutturdu",
    category: "engagement",
    condition: (s) => s.waterGoalHits >= 30,
  },
  {
    id: "check_in_starter",
    icon: "📝",
    nameEn: "Daily Logger",
    nameTr: "Günlük Kaydedici",
    descEn: "Completed 7 daily check-ins",
    descTr: "7 günlük check-in yaptın",
    category: "engagement",
    condition: (s) => s.totalCheckIns >= 7,
  },
  {
    id: "consistency_king",
    icon: "🔥",
    nameEn: "Consistency King",
    nameTr: "Tutarlılık Kralı",
    descEn: "7-day streak",
    descTr: "7 günlük seri",
    category: "engagement",
    condition: (s) => s.streakDays >= 7,
  },
  {
    id: "unstoppable",
    icon: "⚡",
    nameEn: "Unstoppable",
    nameTr: "Durdurulamaz",
    descEn: "30-day streak",
    descTr: "30 günlük seri",
    category: "engagement",
    condition: (s) => s.streakDays >= 30,
  },
  {
    id: "supplement_tracker",
    icon: "🌿",
    nameEn: "Supplement Tracker",
    nameTr: "Takviye Takipçisi",
    descEn: "Tracked 5 different supplements",
    descTr: "5 farklı takviye takip ettin",
    category: "engagement",
    condition: (s) => s.supplementsTracked >= 5,
  },

  // Social
  {
    id: "family_care",
    icon: "👨‍👩‍👧",
    nameEn: "Family Care",
    nameTr: "Aile Bakımı",
    descEn: "Added a family member",
    descTr: "Bir aile üyesi ekledin",
    category: "social",
    condition: (s) => s.familyMembers >= 1,
  },
  {
    id: "report_maker",
    icon: "📄",
    nameEn: "Report Maker",
    nameTr: "Rapor Uzmanı",
    descEn: "Generated 5 PDF reports",
    descTr: "5 PDF rapor oluşturdu",
    category: "social",
    condition: (s) => s.pdfReports >= 5,
  },

  // Milestones
  {
    id: "week_one",
    icon: "🗓️",
    nameEn: "One Week In",
    nameTr: "Bir Hafta Tamam",
    descEn: "Active for 7 days",
    descTr: "7 gündür aktif",
    category: "milestone",
    condition: (s) => s.daysActive >= 7,
  },
  {
    id: "month_one",
    icon: "🏅",
    nameEn: "Monthly Regular",
    nameTr: "Aylık Düzenli",
    descEn: "Active for 30 days",
    descTr: "30 gündür aktif",
    category: "milestone",
    condition: (s) => s.daysActive >= 30,
  },
  {
    id: "quarter_hero",
    icon: "🏆",
    nameEn: "Quarter Hero",
    nameTr: "Çeyrek Kahraman",
    descEn: "Active for 90 days",
    descTr: "90 gündür aktif",
    category: "milestone",
    condition: (s) => s.daysActive >= 90,
  },
]

export function evaluateBadges(stats: UserStats): { earned: Badge[]; locked: Badge[] } {
  const earned: Badge[] = []
  const locked: Badge[] = []

  for (const badge of BADGES) {
    if (badge.condition(stats)) {
      earned.push(badge)
    } else {
      locked.push(badge)
    }
  }

  return { earned, locked }
}

// Anonymous health score (0-100) based on activity
export function calculateAnonymousScore(stats: UserStats): number {
  let score = 0

  // Activity (max 30)
  score += Math.min(30, stats.daysActive * 0.5)

  // Engagement (max 25)
  score += Math.min(10, stats.totalCheckIns * 0.5)
  score += Math.min(10, stats.waterGoalHits * 0.5)
  score += Math.min(5, stats.streakDays * 0.5)

  // Knowledge (max 25)
  score += Math.min(10, stats.totalQueries * 0.2)
  score += Math.min(10, stats.interactionChecks)
  score += Math.min(5, stats.bloodTestCount * 2)

  // Social (max 20)
  score += Math.min(10, stats.familyMembers * 5)
  score += Math.min(5, stats.supplementsTracked)
  score += Math.min(5, stats.pdfReports * 2)

  return Math.min(100, Math.round(score))
}
