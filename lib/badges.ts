// © 2026 DoctoPal — All Rights Reserved
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
  vaccinesTracked: number
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

  // New Badges — V2.0
  {
    id: "hydration_master",
    icon: "💧",
    nameEn: "Hydration Master",
    nameTr: "Hidrasyon Ustası",
    descEn: "7 days of consistent water intake",
    descTr: "7 gün tutarlı su takibi",
    category: "engagement",
    condition: (s) => s.waterGoalHits >= 7,
  },
  {
    id: "phyto_streak",
    icon: "🌿",
    nameEn: "Phyto Streak",
    nameTr: "Fitoterapist",
    descEn: "7-day supplement streak",
    descTr: "7 günlük takviye serisi",
    category: "engagement",
    condition: (s) => s.supplementsTracked >= 7,
  },
  {
    id: "lab_warrior",
    icon: "🩸",
    nameEn: "Lab Warrior",
    nameTr: "Laboratuvar Savaşçısı",
    descEn: "Uploaded 3+ lab reports",
    descTr: "3+ kan tahlili yüklendi",
    category: "health",
    condition: (s) => s.bloodTestCount >= 3,
  },
  {
    id: "shield_master",
    icon: "🛡️",
    nameEn: "Shield Master",
    nameTr: "Kalkan Ustası",
    descEn: "Maintain a 30-day health streak",
    descTr: "30 günlük sağlık serisi",
    category: "milestone",
    condition: (s) => s.streakDays >= 30,
  },
  {
    id: "dna_explorer",
    icon: "🧬",
    nameEn: "DNA Explorer",
    nameTr: "DNA Kaşifi",
    descEn: "Complete your family health tree",
    descTr: "Aile sağlık ağacını tamamla",
    category: "social",
    condition: (s) => s.familyMembers >= 3,
  },
  {
    id: "challenge_champion",
    icon: "🏔️",
    nameEn: "Challenge Champion",
    nameTr: "Meydan Okuma Şampiyonu",
    descEn: "Complete 3 biological challenges",
    descTr: "3 biyolojik meydan okumayı tamamla",
    category: "milestone",
    condition: (s) => s.totalCheckIns >= 21,
  },
  {
    id: "knowledge_seeker",
    icon: "📚",
    nameEn: "Knowledge Seeker",
    nameTr: "Bilgi Arayıcısı",
    descEn: "Read 10+ health articles",
    descTr: "10+ sağlık makalesi oku",
    category: "engagement",
    condition: (s) => s.totalQueries >= 10,
  },
  {
    id: "iron_will",
    icon: "💪",
    nameEn: "Iron Will",
    nameTr: "Demir İrade",
    descEn: "90-day unbroken streak",
    descTr: "90 günlük kesintisiz seri",
    category: "milestone",
    condition: (s) => s.streakDays >= 90,
  },
  {
    id: "global_citizen",
    icon: "🌍",
    nameEn: "Global Citizen",
    nameTr: "Dünya Vatandaşı",
    descEn: "Compare health data with 5+ countries",
    descTr: "5+ ülke ile sağlık verisi karşılaştır",
    category: "social",
    condition: (s) => s.totalQueries >= 50,
  },
  {
    id: "early_bird",
    icon: "🌅",
    nameEn: "Early Bird",
    nameTr: "Erken Kuş",
    descEn: "Log health status before 9 AM for 7 days",
    descTr: "7 gün sabah 9'dan önce sağlık durumu kaydet",
    category: "engagement",
    condition: (s) => s.totalCheckIns >= 7,
  },
  {
    id: "community_star",
    icon: "💬",
    nameEn: "Community Star",
    nameTr: "Topluluk Yıldızı",
    descEn: "Share 10+ posts in Healing Circle",
    descTr: "Şifa Çemberinde 10+ paylaşım yap",
    category: "social",
    condition: (s) => s.totalQueries >= 30,
  },
  {
    id: "zen_master",
    icon: "🧘",
    nameEn: "Zen Master",
    nameTr: "Zen Ustası",
    descEn: "Complete 30 breathing exercises",
    descTr: "30 nefes egzersizi tamamla",
    category: "milestone",
    condition: (s) => s.totalCheckIns >= 30,
  },

  // Onboarding
  {
    id: "identity_revealed",
    icon: "👤",
    nameEn: "Identity Revealed",
    nameTr: "Kimliğini Tanıttın",
    descEn: "Filled in your name and profile photo",
    descTr: "Adını ve profil fotoğrafını doldurdun",
    category: "milestone",
    condition: () => false, // awarded programmatically
  },
  {
    id: "family_guardian",
    icon: "🛡️",
    nameEn: "Family Guardian",
    nameTr: "Aile Koruyucusu",
    descEn: "Added your first family member",
    descTr: "İlk aile üyesini ekledin",
    category: "social",
    condition: (s) => s.familyMembers >= 1,
  },
  {
    id: "first_med",
    icon: "💊",
    nameEn: "First Step",
    nameTr: "İlk Adım",
    descEn: "Saved your first medication",
    descTr: "İlk ilacını kaydettin",
    category: "health",
    condition: () => false,
  },
  {
    id: "no_dose_missed",
    icon: "🔔",
    nameEn: "Never Miss a Dose",
    nameTr: "Hiçbir Dozu Kaçırmam",
    descEn: "Enabled notification reminders",
    descTr: "Bildirim hatırlatıcılarını etkinleştirdin",
    category: "engagement",
    condition: () => false,
  },
  {
    id: "met_ai",
    icon: "🤖",
    nameEn: "Met the AI",
    nameTr: "AI ile Tanıştım",
    descEn: "Used an AI tool for the first time",
    descTr: "İlk kez bir AI aracı kullandın",
    category: "health",
    condition: (s) => s.totalQueries >= 1,
  },
  {
    id: "welcome_doctopal",
    icon: "🎉",
    nameEn: "Welcome to DoctoPal",
    nameTr: "DoctoPal'a Hoş Geldin",
    descEn: "Completed your onboarding journey",
    descTr: "Başlangıç yolculuğunu tamamladın",
    category: "milestone",
    condition: () => false,
  },
  {
    id: "conscious_user",
    icon: "🧬",
    nameEn: "Conscious User",
    nameTr: "Bilinçli Kullanıcı",
    descEn: "Added your first supplement",
    descTr: "İlk takviyeni ekledin",
    category: "health",
    condition: () => false,
  },
  {
    id: "health_tracker",
    icon: "📊",
    nameEn: "Health Tracker",
    nameTr: "Sağlık Takipçisi",
    descEn: "Tracking 3+ supplements",
    descTr: "3+ takviye takip ediyorsun",
    category: "health",
    condition: () => false,
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
  // Vaccine
  {
    id: "immune_shield",
    icon: "🛡️",
    nameEn: "Immune Shield",
    nameTr: "Bağışıklık Kalkanı",
    descEn: "All essential vaccines recorded",
    descTr: "Tüm temel aşılar kayıt altında",
    category: "health",
    condition: (s) => s.vaccinesTracked >= 5,
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

// Onboarding badge points
export const BADGE_POINTS: Record<string, number> = {
  identity_revealed: 50,
  family_guardian: 75,
  first_med: 50,
  conscious_user: 50,
  health_tracker: 75,
  no_dose_missed: 30,
  met_ai: 100,
  welcome_doctopal: 200,
}

// Get badge by ID
export function getBadgeById(id: string): Badge | undefined {
  return BADGES.find(b => b.id === id)
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
