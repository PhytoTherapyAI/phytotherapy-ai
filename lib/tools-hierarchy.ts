// © 2026 Doctopal — All Rights Reserved
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
      // ── hidden ──
      { id: "drug-equivalent", title: { en: "Generic Finder", tr: "Muadil Bulucu" }, icon: "ArrowRightLeft", href: "/drug-equivalent", hidden: true },
      { id: "medication-log", title: { en: "Change Log", tr: "Değişiklik Günlüğü" }, icon: "History", href: "/medication-log", hidden: true },
      { id: "medication-buddy", title: { en: "Med Buddy", tr: "İlaç Arkadaşı" }, icon: "Users", href: "/medication-buddy", hidden: true },
      { id: "label-reader", title: { en: "Label Reader", tr: "Etiket Okuyucu" }, icon: "ScanBarcode", href: "/label-reader", hidden: true },
      { id: "pharmacogenetics", title: { en: "Pharmacogenetics", tr: "Farmakogenetik" }, icon: "Dna", href: "/pharmacogenetics", hidden: true },
      { id: "pharmacy-finder", title: { en: "Pharmacy Finder", tr: "Eczane Bulucu" }, icon: "MapPin", href: "/pharmacy-finder", hidden: true },
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
      // ── hidden ──
      { id: "marketplace", title: { en: "Marketplace", tr: "Market" }, icon: "Store", href: "/supplement-marketplace", hidden: true },
      { id: "supplement-hub", title: { en: "Healing Center", tr: "Şifa Merkezi" }, icon: "Leaf", href: "/supplement-hub", hidden: true },
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
      // ── hidden ──
      { id: "anxiety-toolkit", title: { en: "Anxiety Toolkit", tr: "Anksiyete Araç Seti" }, icon: "ShieldCheck", href: "/anxiety-toolkit", hidden: true },
      { id: "depression-screening", title: { en: "Depression Screening", tr: "Depresyon Tarama" }, icon: "HeartCrack", href: "/depression-screening", hidden: true },
      { id: "adhd", title: { en: "ADHD Management", tr: "DEHB Yönetimi" }, icon: "Zap", href: "/adhd-management", hidden: true },
      { id: "ptsd", title: { en: "PTSD Support", tr: "TSSB Destek" }, icon: "Shield", href: "/ptsd-support", hidden: true },
      { id: "addiction", title: { en: "Addiction Recovery", tr: "Bağımlılık İyileşme" }, icon: "HeartHandshake", href: "/addiction-recovery", hidden: true },
      { id: "grief", title: { en: "Grief Support", tr: "Yas Desteği" }, icon: "CloudRain", href: "/grief-support", hidden: true },
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
      // ── hidden ──
      { id: "recipes", title: { en: "Healthy Recipes", tr: "Sağlıklı Tarifler" }, icon: "ChefHat", href: "/healthy-recipes", hidden: true },
      { id: "circadian-eating", title: { en: "Circadian Eating", tr: "Sirkadyen Beslenme" }, icon: "Clock", href: "/circadian-eating", hidden: true },
      { id: "fasting-monitor", title: { en: "Fasting Monitor", tr: "Oruç Monitörü" }, icon: "Moon", href: "/fasting-monitor", hidden: true },
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
      // ── hidden ──
      { id: "dream-diary", title: { en: "Dream Diary", tr: "Rüya Günlüğü" }, icon: "Cloud", href: "/dream-diary", hidden: true },
      { id: "snoring-apnea", title: { en: "Snoring & Apnea", tr: "Horlama & Apne" }, icon: "Wind", href: "/snoring-apnea", hidden: true },
      { id: "jet-lag", title: { en: "Jet Lag", tr: "Jet Lag" }, icon: "Plane", href: "/jet-lag", hidden: true },
      { id: "shift-worker", title: { en: "Shift Work", tr: "Vardiyalı Çalışma" }, icon: "Clock4", href: "/shift-worker", hidden: true },
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
      // ── hidden ──
      { id: "stretching", title: { en: "Stretching", tr: "Esneme" }, icon: "StretchHorizontal", href: "/stretching", hidden: true },
      { id: "walking", title: { en: "Walking Tracker", tr: "Yürüyüş Takibi" }, icon: "Footprints", href: "/walking-tracker", hidden: true },
      { id: "yoga", title: { en: "Yoga & Meditation", tr: "Yoga & Meditasyon" }, icon: "Flower2", href: "/yoga-meditation", hidden: true },
      { id: "breathing", title: { en: "Breathing Exercises", tr: "Nefes Egzersizleri" }, icon: "Wind", href: "/breathing-exercises", hidden: true },
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
      // ── hidden ──
      { id: "lungs", title: { en: "Lungs", tr: "Akciğer" }, icon: "Wind", href: "/lung-monitor", hidden: true },
      { id: "gut", title: { en: "Gut Health", tr: "Bağırsak Sağlığı" }, icon: "Apple", href: "/gut-health", hidden: true },
      { id: "eyes", title: { en: "Eye Health", tr: "Göz Sağlığı" }, icon: "Eye", href: "/eye-health", hidden: true },
      { id: "ears", title: { en: "Ear & Hearing", tr: "Kulak & İşitme" }, icon: "Ear", href: "/ear-health", hidden: true },
      { id: "dental", title: { en: "Dental Health", tr: "Diş Sağlığı" }, icon: "Smile", href: "/dental-health", hidden: true },
      { id: "skin", title: { en: "Skin Health", tr: "Cilt Sağlığı" }, icon: "Sparkles", href: "/skin-health", hidden: true },
      { id: "hair-nail", title: { en: "Hair & Nails", tr: "Saç & Tırnak" }, icon: "Scissors", href: "/hair-nail-health", hidden: true },
      { id: "migraine", title: { en: "Migraine", tr: "Migren" }, icon: "Zap", href: "/migraine-dashboard", hidden: true },
      { id: "diabetic-foot", title: { en: "Diabetic Foot", tr: "Diyabetik Ayak" }, icon: "Footprints", href: "/diabetic-foot", hidden: true },
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
      // ── hidden ──
      { id: "postpartum", title: { en: "Postpartum", tr: "Doğum Sonrası" }, icon: "HeartHandshake", href: "/postpartum-support", hidden: true },
      { id: "menopause", title: { en: "Menopause", tr: "Menopoz" }, icon: "Thermometer", href: "/menopause-panel", hidden: true },
      { id: "mens-health", title: { en: "Men's Health", tr: "Erkek Sağlığı" }, icon: "Shield", href: "/mens-health", hidden: true },
      { id: "sexual-health", title: { en: "Sexual Health", tr: "Cinsel Sağlık" }, icon: "Heart", href: "/sexual-health", hidden: true },
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
      // ── hidden ──
      { id: "cancer-screening", title: { en: "Cancer Screening", tr: "Kanser Taraması" }, icon: "Search", href: "/cancer-screening", hidden: true },
      { id: "family-tree", title: { en: "Family Health Tree", tr: "Aile Sağlık Ağacı" }, icon: "GitBranch", href: "/family-health-tree", hidden: true },
      { id: "genetic-risk", title: { en: "Genetic Risk", tr: "Genetik Risk" }, icon: "Dna", href: "/genetic-risk", hidden: true },
      { id: "allergy-map", title: { en: "Allergy Map", tr: "Alerji Haritası" }, icon: "MapPin", href: "/allergy-map", hidden: true },
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
      // ── hidden ──
      { id: "appointment-prep", title: { en: "Appointment Prep", tr: "Randevu Hazırlık" }, icon: "ClipboardList", href: "/appointment-prep", hidden: true },
      { id: "medical-records", title: { en: "Medical Records", tr: "Tıbbi Kayıtlar" }, icon: "FolderOpen", href: "/medical-records", hidden: true },
      { id: "emergency-mode", title: { en: "Emergency Mode", tr: "Acil Durum Modu" }, icon: "Siren", href: "/emergency-mode", hidden: true },
      { id: "disaster-mode", title: { en: "Disaster Mode", tr: "Afet Modu" }, icon: "AlertOctagon", href: "/disaster-mode", hidden: true },
      { id: "second-opinion", title: { en: "Second Opinion", tr: "İkinci Görüş" }, icon: "Users", href: "/second-opinion", hidden: true },
      { id: "clinical-trials", title: { en: "Clinical Trials", tr: "Klinik Araştırmalar" }, icon: "FlaskConical", href: "/clinical-trials", hidden: true },
      { id: "rehabilitation", title: { en: "Rehabilitation", tr: "Rehabilitasyon" }, icon: "HeartHandshake", href: "/rehabilitation", hidden: true },
      { id: "enabiz", title: { en: "e-Nabız", tr: "e-Nabız" }, icon: "Link", href: "/enabiz", hidden: true },
      { id: "drug-recall", title: { en: "Drug Recalls", tr: "İlaç Geri Çağırma" }, icon: "AlertOctagon", href: "/drug-recall", hidden: true },
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
      { id: "child-health", title: { en: "Child Health", tr: "Çocuk Sağlığı" }, icon: "Baby", href: "/child-health", hidden: true },
      { id: "student", title: { en: "Student Health", tr: "Öğrenci Sağlığı" }, icon: "GraduationCap", href: "/student-health", hidden: true },
      { id: "new-parent", title: { en: "New Parent", tr: "Yeni Ebeveyn" }, icon: "Baby", href: "/new-parent-health", hidden: true },
      { id: "elder-care", title: { en: "Elder Care", tr: "Yaşlı Bakımı" }, icon: "Heart", href: "/elder-care", hidden: true },
      { id: "retirement", title: { en: "Retirement", tr: "Emeklilik" }, icon: "Sunset", href: "/retirement-health", hidden: true },
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

  // ── 15. Harvard HVHS & Advanced ─────────
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
      // ── hidden ──
      { id: "global-benchmark", title: { en: "Global Benchmark", tr: "Küresel Kıyaslama" }, icon: "Globe", href: "/global-benchmark", hidden: true },
      { id: "research-hub", title: { en: "Research Hub", tr: "Araştırma Hub'ı" }, icon: "FlaskConical", href: "/research-hub", hidden: true },
      { id: "share-data", title: { en: "Share Data (FHIR)", tr: "Veri Paylaş (FHIR)" }, icon: "Share2", href: "/share-data", hidden: true },
      { id: "creator-studio", title: { en: "Creator Studio", tr: "İçerik Stüdyosu" }, icon: "PenTool", href: "/creator-studio", hidden: true },
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
      // ── hidden ──
      { id: "notification-preferences", title: { en: "Notification Preferences", tr: "Bildirim Tercihleri" }, icon: "BellRing", href: "/notification-preferences", hidden: true },
      { id: "connect-assistant", title: { en: "Daily Assistant Bot", tr: "Günlük Asistan Botu" }, icon: "MessageCircle", href: "/connect-assistant", hidden: true },
      { id: "bug-report", title: { en: "Report Bug", tr: "Hata Bildir" }, icon: "Bug", href: "/bug-report", hidden: true },
      { id: "certificates", title: { en: "Certificates", tr: "Sertifikalar" }, icon: "Award", href: "/certificates", hidden: true },
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
