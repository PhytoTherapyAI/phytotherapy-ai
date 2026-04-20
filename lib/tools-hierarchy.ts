// © 2026 DoctoPal — All Rights Reserved
// ============================================
// Tools Information Architecture — v2.0
// Single source of truth for all tool categories
// Used by: MegaMenu, Tools Hub, Dashboard, Redirects
// hidden: true = tool exists in codebase but invisible in all UI
// ============================================

export interface ToolModule {
  id: string
  title: { en: string; tr: string }
  icon: string
  href: string // current URL (kept for backward compat)
  hidden?: boolean // true = kept in codebase but hidden from all menus/lists
}

export interface ToolCategory {
  id: string
  slug: string
  icon: string
  color: string
  bgLight: string
  bgDark: string
  title: { en: string; tr: string }
  description: { en: string; tr: string }
  defaultModule: string
  layout: "tabs" | "grid" // tabs for <8 modules, grid for 8+
  modules: ToolModule[]
}

export const TOOL_CATEGORIES: ToolCategory[] = [
  // ── 1. Medical Analysis ─────────────────
  {
    id: "medical-analysis",
    slug: "medical-analysis",
    icon: "Microscope",
    color: "#8B5CF6",
    bgLight: "bg-violet-50",
    bgDark: "dark:bg-violet-950/20",
    title: { en: "Medical Analysis", tr: "Tıbbi Analiz" },
    description: { en: "Blood tests, radiology, symptoms & body analysis", tr: "Kan tahlili, radyoloji, semptom ve vücut analizi" },
    defaultModule: "blood-test",
    layout: "tabs",
    modules: [
      { id: "blood-test", title: { en: "Blood Test", tr: "Kan Tahlili" }, icon: "TestTube", href: "/blood-test" },
      { id: "radiology", title: { en: "Radiology", tr: "Radyoloji" }, icon: "Scan", href: "/radiology" },
      { id: "body-analysis", title: { en: "Body Analysis", tr: "Vücut Analizi" }, icon: "Activity", href: "/body-analysis" },
      { id: "symptom-checker", title: { en: "Smart Symptom Assessment", tr: "Akıllı Semptom Değerlendirmesi" }, icon: "HeartPulse", href: "/symptom-checker" },
      { id: "scanner", title: { en: "Smart Lens Scanner", tr: "Akıllı Lens Tarayıcı" }, icon: "ScanLine", href: "/scan-medication" },
      { id: "health-report", title: { en: "Health Report Card", tr: "Sağlık Karnesi" }, icon: "FileText", href: "/health-report-card" },
    ],
  },

  // ── 2. Medications ──────────────────────
  {
    id: "medications",
    slug: "medications",
    icon: "Pill",
    color: "#EC4899",
    bgLight: "bg-pink-50",
    bgDark: "dark:bg-pink-950/20",
    title: { en: "Medications", tr: "İlaçlar" },
    description: { en: "Drug info, interactions & safety tools", tr: "İlaç bilgisi, etkileşim ve güvenlik araçları" },
    defaultModule: "drug-info",
    layout: "grid",
    modules: [
      { id: "drug-info", title: { en: "Drug Information", tr: "İlaç Bilgisi" }, icon: "Info", href: "/drug-info" },
      { id: "interaction-map", title: { en: "Interaction Map", tr: "Etkileşim Haritası" }, icon: "Network", href: "/interaction-map" },
      { id: "food-interaction", title: { en: "Food Interactions", tr: "Besin-İlaç Etkileşimi" }, icon: "Apple", href: "/food-interaction" },
      { id: "medication-hub", title: { en: "Medication Hub", tr: "İlaç Merkezi" }, icon: "CalendarClock", href: "/medication-hub" },
      { id: "polypharmacy", title: { en: "Polypharmacy Risk", tr: "Polifarmasi Riski" }, icon: "ShieldAlert", href: "/polypharmacy" },
      { id: "prospectus-reader", title: { en: "Prospectus Reader", tr: "Prospektüs Okuyucu" }, icon: "BookOpen", href: "/prospectus-reader" },
      { id: "side-effects", title: { en: "Side Effects", tr: "Yan Etkiler" }, icon: "AlertTriangle", href: "/side-effects" },
    ],
  },

  // ── 3. Supplements & Natural ────────────
  {
    id: "supplements",
    slug: "supplements",
    icon: "Leaf",
    color: "#10B981",
    bgLight: "bg-emerald-50",
    bgDark: "dark:bg-emerald-950/20",
    title: { en: "Supplements & Natural", tr: "Takviye & Doğal" },
    description: { en: "Compare supplements, favorites, allergy & guide", tr: "Takviye karşılaştır, favoriler, alerji ve rehber" },
    defaultModule: "compare",
    layout: "tabs",
    modules: [
      { id: "compare", title: { en: "Compare", tr: "Karşılaştır" }, icon: "GitCompare", href: "/supplement-compare" },
      { id: "favorites", title: { en: "Favorites", tr: "Favoriler" }, icon: "Heart", href: "/favorite-supplements" },
      { id: "anti-inflammatory", title: { en: "Anti-Inflammatory", tr: "Anti-İnflamatuar" }, icon: "Flame", href: "/anti-inflammatory" },
      { id: "cross-allergy", title: { en: "Cross Allergy", tr: "Çapraz Alerji" }, icon: "AlertCircle", href: "/cross-allergy" },
      { id: "supplement-guide", title: { en: "Supplement Guide", tr: "Takviye Rehberi" }, icon: "BookOpen", href: "/supplement-guide" },
    ],
  },

  // ── 4. Mental Health ────────────────────
  {
    id: "mental-health",
    slug: "mental-health",
    icon: "Brain",
    color: "#6366F1",
    bgLight: "bg-indigo-50",
    bgDark: "dark:bg-indigo-950/20",
    title: { en: "Mental Health", tr: "Mental Sağlık" },
    description: { en: "Mood tracking & clinical screening tests", tr: "Ruh hali takibi ve klinik tarama testleri" },
    defaultModule: "mood-tracker",
    layout: "tabs",
    modules: [
      { id: "mood-tracker", title: { en: "Mood Tracker", tr: "Ruh Hali Takibi" }, icon: "SmilePlus", href: "/mental-wellness" },
      { id: "clinical-tests", title: { en: "Clinical Tests", tr: "Klinik Testler" }, icon: "ClipboardList", href: "/clinical-tests" },
    ],
  },

  // ── 5. Nutrition & Diet ─────────────────
  {
    id: "nutrition",
    slug: "nutrition-hub",
    icon: "UtensilsCrossed",
    color: "#F59E0B",
    bgLight: "bg-amber-50",
    bgDark: "dark:bg-amber-950/20",
    title: { en: "Nutrition & Diet", tr: "Beslenme & Diyet" },
    description: { en: "Meal logging, fasting, hydration & calorie tools", tr: "Öğün kaydı, oruç, hidrasyon ve kalori araçları" },
    defaultModule: "nutrition-log",
    layout: "tabs",
    modules: [
      { id: "nutrition-log", title: { en: "Nutrition Log", tr: "Beslenme Günlüğü" }, icon: "Utensils", href: "/nutrition" },
      { id: "fasting", title: { en: "Intermittent Fasting", tr: "Aralıklı Oruç" }, icon: "Timer", href: "/intermittent-fasting" },
      { id: "hydration", title: { en: "Hydration Tracker", tr: "Su Takibi" }, icon: "Droplets", href: "/hydration" },
      { id: "calorie", title: { en: "Calorie Calculator", tr: "Kalori Hesaplama" }, icon: "Calculator", href: "/calorie" },
    ],
  },

  // ── 6. Sleep & Recovery ─────────────────
  {
    id: "sleep",
    slug: "sleep",
    icon: "Moon",
    color: "#818CF8",
    bgLight: "bg-indigo-50",
    bgDark: "dark:bg-indigo-950/20",
    title: { en: "Sleep & Recovery", tr: "Uyku & Toparlanma" },
    description: { en: "Sleep tracking & circadian rhythm", tr: "Uyku takibi ve sirkadyen ritim" },
    defaultModule: "sleep-log",
    layout: "tabs",
    modules: [
      { id: "sleep-log", title: { en: "Sleep Log", tr: "Uyku Kaydı" }, icon: "BedDouble", href: "/sleep-analysis" },
      { id: "circadian", title: { en: "Circadian Rhythm", tr: "Sirkadyen Ritim" }, icon: "Sun", href: "/circadian-rhythm" },
    ],
  },

  // ── 7. Fitness & Movement ───────────────
  {
    id: "fitness",
    slug: "fitness",
    icon: "Dumbbell",
    color: "#22C55E",
    bgLight: "bg-green-50",
    bgDark: "dark:bg-green-950/20",
    title: { en: "Fitness & Movement", tr: "Fitness & Hareket" },
    description: { en: "Sports performance & posture", tr: "Spor performansı ve duruş" },
    defaultModule: "sports",
    layout: "tabs",
    modules: [
      { id: "sports", title: { en: "Sports Performance", tr: "Spor Performansı" }, icon: "Trophy", href: "/sports-performance" },
      { id: "posture", title: { en: "Posture & Ergonomics", tr: "Duruş & Ergonomi" }, icon: "PersonStanding", href: "/posture-ergonomics" },
    ],
  },

  // ── 8. Organ Health ─────────────────────
  {
    id: "organ-health",
    slug: "organ-health",
    icon: "HeartPulse",
    color: "#EF4444",
    bgLight: "bg-red-50",
    bgDark: "dark:bg-red-950/20",
    title: { en: "Organ Health", tr: "Organ Sağlığı" },
    description: { en: "Heart, kidney, liver & thyroid monitoring", tr: "Kalp, böbrek, karaciğer ve tiroid takibi" },
    defaultModule: "cardiovascular",
    layout: "tabs",
    modules: [
      { id: "cardiovascular", title: { en: "Heart & Cardiovascular", tr: "Kalp & Kardiyovasküler" }, icon: "Heart", href: "/cardiovascular-risk" },
      { id: "kidney", title: { en: "Kidney", tr: "Böbrek" }, icon: "Droplets", href: "/kidney-dashboard" },
      { id: "liver", title: { en: "Liver", tr: "Karaciğer" }, icon: "Activity", href: "/liver-monitor" },
      { id: "thyroid", title: { en: "Thyroid", tr: "Tiroid" }, icon: "Gauge", href: "/thyroid-dashboard" },
    ],
  },

  // ── 9. Women & Men Health ───────────────
  {
    id: "gender-health",
    slug: "gender-health",
    icon: "Users",
    color: "#F472B6",
    bgLight: "bg-pink-50",
    bgDark: "dark:bg-pink-950/20",
    title: { en: "Women & Men Health", tr: "Kadın & Erkek Sağlığı" },
    description: { en: "Pregnancy tracking & women's health", tr: "Gebelik takibi ve kadın sağlığı" },
    defaultModule: "womens-health",
    layout: "tabs",
    modules: [
      { id: "womens-health", title: { en: "Women's Health", tr: "Kadın Sağlığı" }, icon: "Heart", href: "/womens-health" },
      { id: "pregnancy", title: { en: "Pregnancy Tracker", tr: "Gebelik Takibi" }, icon: "Baby", href: "/pregnancy-tracker" },
    ],
  },

  // ── 10. Tracking & Diaries ──────────────
  {
    id: "tracking",
    slug: "tracking",
    icon: "BarChart3",
    color: "#0EA5E9",
    bgLight: "bg-sky-50",
    bgDark: "dark:bg-sky-950/20",
    title: { en: "Tracking & Diaries", tr: "Takip & Günlükler" },
    description: { en: "Health diary, pain tracking, caffeine & biomarkers", tr: "Sağlık günlüğü, ağrı takibi, kafein ve biyobelirteçler" },
    defaultModule: "health-diary",
    layout: "tabs",
    modules: [
      { id: "health-diary", title: { en: "Health Diary", tr: "Sağlık Günlüğü" }, icon: "BookOpen", href: "/health-diary" },
      { id: "pain-diary", title: { en: "Pain Diary", tr: "Ağrı Günlüğü" }, icon: "Frown", href: "/pain-diary" },
      { id: "caffeine", title: { en: "Caffeine Tracker", tr: "Kafein Takibi" }, icon: "Coffee", href: "/caffeine-tracker" },
      { id: "biomarkers", title: { en: "Biomarker Trends", tr: "Biyobelirteç Trendleri" }, icon: "TrendingUp", href: "/biomarker-trends" },
      // ── hidden ──
      { id: "voice-diary", title: { en: "Voice Diary", tr: "Sesli Günlük" }, icon: "Mic", href: "/voice-diary", hidden: true },
      { id: "alcohol", title: { en: "Alcohol Tracker", tr: "Alkol Takibi" }, icon: "Wine", href: "/alcohol-tracker", hidden: true },
      { id: "smoking", title: { en: "Quit Smoking", tr: "Sigarayı Bırak" }, icon: "CigaretteOff", href: "/smoking-cessation", hidden: true },
      { id: "screen-time", title: { en: "Screen Time", tr: "Ekran Süresi" }, icon: "Monitor", href: "/screen-time", hidden: true },
      { id: "noise", title: { en: "Noise Exposure", tr: "Gürültü Maruziyeti" }, icon: "Volume2", href: "/noise-exposure", hidden: true },
      { id: "sun-exposure", title: { en: "Sun Exposure", tr: "Güneş Maruziyeti" }, icon: "Sun", href: "/sun-exposure", hidden: true },
      { id: "air-quality", title: { en: "Air Quality", tr: "Hava Kalitesi" }, icon: "Cloud", href: "/air-quality", hidden: true },
      { id: "water-quality", title: { en: "Water Quality", tr: "Su Kalitesi" }, icon: "Droplets", href: "/water-quality", hidden: true },
      { id: "timeline", title: { en: "Health Timeline", tr: "Sağlık Zaman Çizelgesi" }, icon: "Clock", href: "/health-timeline", hidden: true },
      { id: "radar", title: { en: "Health Radar", tr: "Sağlık Radarı" }, icon: "Radar", href: "/health-radar", hidden: true },
      { id: "micro-habits", title: { en: "Micro Habits", tr: "Mikro Alışkanlıklar" }, icon: "Sparkles", href: "/micro-habits", hidden: true },
      { id: "friend-goals", title: { en: "Friend Goals", tr: "Arkadaş Hedefleri" }, icon: "Users", href: "/friend-goals", hidden: true },
      { id: "time-capsule", title: { en: "Time Capsule", tr: "Zaman Kapsülü" }, icon: "Clock", href: "/time-capsule", hidden: true },
      { id: "weekly-newsletter", title: { en: "Weekly Summary", tr: "Haftalık Bülten" }, icon: "Mail", href: "/weekly-newsletter", hidden: true },
    ],
  },

  // ── 11. Prevention & Screening ──────────
  {
    id: "prevention",
    slug: "prevention",
    icon: "ShieldCheck",
    color: "#14B8A6",
    bgLight: "bg-teal-50",
    bgDark: "dark:bg-teal-950/20",
    title: { en: "Prevention & Screening", tr: "Önleme & Tarama" },
    description: { en: "Check-ups & vaccination tracking", tr: "Check-up ve aşı takibi" },
    defaultModule: "checkup-planner",
    layout: "tabs",
    modules: [
      { id: "checkup-planner", title: { en: "Check-up Planner", tr: "Check-up Planlayıcı" }, icon: "CalendarCheck", href: "/checkup-planner" },
      { id: "vaccination", title: { en: "Vaccinations", tr: "Aşılar" }, icon: "Syringe", href: "/vaccine-tracker" },
      // ── hidden (kept: Aile Sağlık Yönetimi consolidation pending) ──
      { id: "family-tree", title: { en: "Family Health Tree", tr: "Aile Sağlık Ağacı" }, icon: "GitBranch", href: "/family-health-tree", hidden: true },
    ],
  },

  // ── 12. Medical Tools & Emergency ───────
  {
    id: "medical-tools",
    slug: "medical-tools",
    icon: "Stethoscope",
    color: "#0D9488",
    bgLight: "bg-teal-50",
    bgDark: "dark:bg-teal-950/20",
    title: { en: "Medical Tools", tr: "Tıbbi Araçlar" },
    description: { en: "Emergency ID, health guides & doctor communication", tr: "Acil kimlik, sağlık rehberleri ve doktor iletişimi" },
    defaultModule: "emergency-id",
    layout: "tabs",
    modules: [
      { id: "emergency-id", title: { en: "Emergency ID", tr: "Acil Kimlik" }, icon: "CreditCard", href: "/emergency-id" },
      { id: "qr-profile", title: { en: "QR Health Card", tr: "QR Sağlık Kartı" }, icon: "QrCode", href: "/qr-profile" },
      { id: "health-guides", title: { en: "Health Guides", tr: "Sağlık Rehberleri" }, icon: "BookOpen", href: "/health-guides" },
      { id: "doctor-comm", title: { en: "Doctor Communication", tr: "Doktor İletişimi" }, icon: "MessageSquare", href: "/doctor-communication" },
    ],
  },

  // ── 13. Life Stages & Special ───────────
  {
    id: "life-stages",
    slug: "life-stages",
    icon: "Users",
    color: "#A855F7",
    bgLight: "bg-purple-50",
    bgDark: "dark:bg-purple-950/20",
    title: { en: "Life Stages & Special", tr: "Yaşam Dönemleri & Özel" },
    description: { en: "Chronic care, travel & seasonal health", tr: "Kronik bakım, seyahat ve mevsimsel sağlık" },
    defaultModule: "chronic-care",
    layout: "tabs",
    modules: [
      { id: "chronic-care", title: { en: "Chronic Care", tr: "Kronik Bakım" }, icon: "Activity", href: "/chronic-care" },
      { id: "travel", title: { en: "Travel Health", tr: "Seyahat Sağlığı" }, icon: "Plane", href: "/travel-health" },
      { id: "seasonal", title: { en: "Seasonal Health", tr: "Mevsimsel Sağlık" }, icon: "Snowflake", href: "/seasonal-health" },
      // ── hidden ──
      { id: "cancer-support", title: { en: "Cancer Support", tr: "Kanser Destek" }, icon: "Ribbon", href: "/cancer-support", hidden: true },
      { id: "dialysis", title: { en: "Dialysis", tr: "Diyaliz" }, icon: "Droplets", href: "/dialysis-tracker", hidden: true },
      { id: "autism", title: { en: "Autism Support", tr: "Otizm Desteği" }, icon: "Puzzle", href: "/autism-support", hidden: true },
      { id: "rare-diseases", title: { en: "Rare Diseases", tr: "Nadir Hastalıklar" }, icon: "Search", href: "/rare-diseases", hidden: true },
      { id: "interests", title: { en: "Interests Setup", tr: "İlgi Alanları" }, icon: "Sparkles", href: "/interests", hidden: true },
    ],
  },

  // ── 14. Community & Learning ────────────
  {
    id: "community",
    slug: "community",
    icon: "MessageCircle",
    color: "#F97316",
    bgLight: "bg-orange-50",
    bgDark: "dark:bg-orange-950/20",
    title: { en: "Community & Learning", tr: "Topluluk & Öğrenme" },
    description: { en: "Courses, dictionary & expert content", tr: "Kurslar, sözlük ve uzman içerikleri" },
    defaultModule: "courses",
    layout: "tabs",
    modules: [
      { id: "courses", title: { en: "Courses", tr: "Kurslar" }, icon: "GraduationCap", href: "/courses" },
      { id: "dictionary", title: { en: "Medical Dictionary", tr: "Tıbbi Sözlük" }, icon: "BookOpen", href: "/medical-dictionary" },
      { id: "expert-content", title: { en: "Expert Content", tr: "Uzman İçerikleri" }, icon: "FileText", href: "/expert-content" },
      // ── hidden ──
      { id: "discover", title: { en: "Discovery Hub", tr: "Keşif Merkezi" }, icon: "Compass", href: "/discover", hidden: true },
      { id: "community-feed", title: { en: "Healing Circle", tr: "Şifa Çemberi" }, icon: "Heart", href: "/community", hidden: true },
      { id: "forum", title: { en: "Health Forum", tr: "Sağlık Forumu" }, icon: "MessageSquare", href: "/health-forum", hidden: true },
      { id: "support-groups", title: { en: "Support Groups", tr: "Destek Grupları" }, icon: "Users", href: "/support-groups", hidden: true },
      { id: "peer-mentoring", title: { en: "Peer Mentoring", tr: "Akran Mentorluğu" }, icon: "UserPlus", href: "/peer-mentoring", hidden: true },
      { id: "quiz", title: { en: "Health Quiz", tr: "Sağlık Bilmecesi" }, icon: "HelpCircle", href: "/health-quiz", hidden: true },
      { id: "podcasts", title: { en: "Podcasts", tr: "Podcastler" }, icon: "Headphones", href: "/health-podcasts", hidden: true },
      { id: "news-verifier", title: { en: "News Verifier", tr: "Haber Doğrulama" }, icon: "CheckCircle", href: "/health-news-verifier", hidden: true },
      { id: "challenges", title: { en: "Health Challenges", tr: "Sağlık Yarışmaları" }, icon: "Trophy", href: "/health-challenges", hidden: true },
      { id: "talent-hub", title: { en: "Talent Hub", tr: "Yetenek Ağı" }, icon: "Users", href: "/talent-hub", hidden: true },
    ],
  },

  // ── 15. Advanced & Research ─────────
  {
    id: "advanced",
    slug: "advanced",
    icon: "Globe",
    color: "#0369A1",
    bgLight: "bg-sky-50",
    bgDark: "dark:bg-sky-950/20",
    title: { en: "Advanced & Research", tr: "İleri & Araştırma" },
    description: { en: "Health roadmap & advanced tools", tr: "Sağlık yol haritası ve ileri araçlar" },
    defaultModule: "health-roadmap",
    layout: "tabs",
    modules: [
      { id: "health-roadmap", title: { en: "Health Roadmap", tr: "Sağlık Yol Haritası" }, icon: "Map", href: "/health-roadmap" },
    ],
  },

  // ── 16. Settings & Account ──────────────
  {
    id: "settings",
    slug: "settings",
    icon: "Settings",
    color: "#64748B",
    bgLight: "bg-slate-50",
    bgDark: "dark:bg-slate-950/20",
    title: { en: "Settings & Account", tr: "Ayarlar & Hesap" },
    description: { en: "Notifications, privacy, devices & data management", tr: "Bildirimler, gizlilik, cihazlar ve veri yönetimi" },
    defaultModule: "notifications",
    layout: "grid",
    modules: [
      { id: "notifications", title: { en: "Notifications", tr: "Bildirimler" }, icon: "Bell", href: "/notifications" },
      { id: "connected-devices", title: { en: "Connected Devices", tr: "Bağlı Cihazlar" }, icon: "Smartphone", href: "/connected-devices" },
      { id: "privacy-controls", title: { en: "Privacy Controls", tr: "Gizlilik Kontrolleri" }, icon: "Lock", href: "/privacy-controls" },
      { id: "data-export", title: { en: "Export Data (KVKK)", tr: "Veri İndir (KVKK)" }, icon: "Download", href: "/data-export" },
      { id: "data-delete", title: { en: "Delete Data (KVKK)", tr: "Veri Sil (KVKK)" }, icon: "Trash2", href: "/data-delete" },
    ],
  },

  // ── 17. Doctor Tools ──────────────────────
  {
    id: "doctor-tools",
    slug: "doctor-tools",
    icon: "Stethoscope",
    color: "#0891B2",
    bgLight: "bg-cyan-50",
    bgDark: "dark:bg-cyan-950/20",
    title: { en: "Doctor Tools", tr: "Doktor Araçları" },
    description: { en: "Doctor panel, patient analytics, prescriptions & messaging", tr: "Doktor paneli, hasta analitiği, reçete ve mesajlaşma" },
    defaultModule: "doctor-dashboard",
    layout: "tabs",
    modules: [
      { id: "doctor-dashboard", title: { en: "Doctor Panel", tr: "Doktor Paneli" }, icon: "Stethoscope", href: "/doctor-dashboard" },
      { id: "doctor-messages", title: { en: "Doctor Messages", tr: "Doktor Mesajları" }, icon: "MessageSquare", href: "/doctor-messages" },
      { id: "doctor-prescribe", title: { en: "Prescription Helper", tr: "Reçete Asistanı" }, icon: "FileText", href: "/doctor-prescribe" },
      { id: "doctor-analytics", title: { en: "Patient Analytics", tr: "Hasta Analitiği" }, icon: "BarChart3", href: "/doctor-analytics" },
    ],
  },
]

// ── Helper Functions ────────────────────

/** Filter out hidden modules from a category */
export function getVisibleModules(category: ToolCategory): ToolModule[] {
  return category.modules.filter(m => !m.hidden)
}

/** Get categories with only visible modules (for UI rendering) */
export function getVisibleCategories(): (ToolCategory & { visibleModules: ToolModule[] })[] {
  return TOOL_CATEGORIES
    .map(cat => ({ ...cat, visibleModules: getVisibleModules(cat) }))
    .filter(cat => cat.visibleModules.length > 0)
}

/** Find which category a legacy path belongs to (includes hidden for routing) */
export function findCategoryByHref(href: string): { category: ToolCategory; module: ToolModule } | null {
  for (const cat of TOOL_CATEGORIES) {
    const mod = cat.modules.find(m => m.href === href)
    if (mod) return { category: cat, module: mod }
  }
  return null
}

/** Get category by slug */
export function getCategoryBySlug(slug: string): ToolCategory | null {
  return TOOL_CATEGORIES.find(c => c.slug === slug) || null
}

/** Get all visible modules flattened (for menus, search, tools hub) */
export function getAllModules(): (ToolModule & { categoryId: string; categorySlug: string })[] {
  return TOOL_CATEGORIES.flatMap(cat =>
    cat.modules
      .filter(m => !m.hidden)
      .map(mod => ({ ...mod, categoryId: cat.id, categorySlug: cat.slug }))
  )
}

/** Get ALL modules including hidden (for routing/backward compat) */
export function getAllModulesIncludingHidden(): (ToolModule & { categoryId: string; categorySlug: string })[] {
  return TOOL_CATEGORIES.flatMap(cat =>
    cat.modules.map(mod => ({ ...mod, categoryId: cat.id, categorySlug: cat.slug }))
  )
}

/** Search modules by query (only visible modules) */
export function searchModules(query: string): (ToolModule & { categoryId: string; categoryTitle: { en: string; tr: string } })[] {
  const q = query.toLowerCase()
  return TOOL_CATEGORIES.flatMap(cat =>
    cat.modules
      .filter(m => !m.hidden && (m.title.en.toLowerCase().includes(q) || m.title.tr.toLowerCase().includes(q)))
      .map(m => ({ ...m, categoryId: cat.id, categoryTitle: cat.title }))
  )
}

/** Total visible module count */
export const TOTAL_MODULE_COUNT = TOOL_CATEGORIES.reduce((sum, cat) => sum + cat.modules.filter(m => !m.hidden).length, 0)

/** Total hidden module count */
export const HIDDEN_MODULE_COUNT = TOOL_CATEGORIES.reduce((sum, cat) => sum + cat.modules.filter(m => m.hidden).length, 0)
