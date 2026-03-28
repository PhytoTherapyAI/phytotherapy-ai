// ============================================
// Tools Information Architecture — v1.0
// Single source of truth for all tool categories
// Used by: MegaMenu, Tools Hub, Dashboard, Redirects
// ============================================

export interface ToolModule {
  id: string
  title: { en: string; tr: string }
  icon: string
  href: string // current URL (kept for backward compat)
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
      { id: "symptom-checker", title: { en: "Symptom Checker", tr: "Semptom Kontrol" }, icon: "HeartPulse", href: "/symptom-checker" },
      { id: "scanner", title: { en: "Document Scanner", tr: "Belge Tarayıcı" }, icon: "ScanLine", href: "/scanner" },
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
    description: { en: "Drug info, interactions, timing, equivalents & tracking", tr: "İlaç bilgisi, etkileşim, zamanlama, muadil ve takip" },
    defaultModule: "drug-info",
    layout: "grid",
    modules: [
      { id: "drug-info", title: { en: "Drug Information", tr: "İlaç Bilgisi" }, icon: "Info", href: "/drug-info" },
      { id: "interaction-map", title: { en: "Interaction Map", tr: "Etkileşim Haritası" }, icon: "Network", href: "/interaction-map" },
      { id: "food-interaction", title: { en: "Food Interactions", tr: "Besin-İlaç Etkileşimi" }, icon: "Apple", href: "/food-interaction" },
      { id: "drug-timing", title: { en: "Timing Matrix", tr: "Zamanlama Matrisi" }, icon: "Clock", href: "/drug-timing" },
      { id: "drug-equivalent", title: { en: "Generic Finder", tr: "Muadil Bulucu" }, icon: "ArrowRightLeft", href: "/drug-equivalent" },
      { id: "drug-recall", title: { en: "Drug Recalls", tr: "Geri Çağırma" }, icon: "AlertOctagon", href: "/drug-recall" },
      { id: "polypharmacy", title: { en: "Polypharmacy Risk", tr: "Polifarmasi Riski" }, icon: "ShieldAlert", href: "/polypharmacy" },
      { id: "medication-schedule", title: { en: "Auto Schedule", tr: "Otomatik Plan" }, icon: "CalendarClock", href: "/medication-schedule" },
      { id: "medication-log", title: { en: "Change Log", tr: "Değişiklik Günlüğü" }, icon: "History", href: "/medication-log" },
      { id: "medication-buddy", title: { en: "Med Buddy", tr: "İlaç Arkadaşı" }, icon: "Users", href: "/medication-buddy" },
      { id: "prospectus-reader", title: { en: "Prospectus Reader", tr: "Prospektüs Okuyucu" }, icon: "BookOpen", href: "/prospectus-reader" },
      { id: "label-reader", title: { en: "Label Reader", tr: "Etiket Okuyucu" }, icon: "ScanBarcode", href: "/label-reader" },
      { id: "pharmacogenetics", title: { en: "Pharmacogenetics", tr: "Farmakogenetik" }, icon: "Dna", href: "/pharmacogenetics" },
      { id: "smart-reminders", title: { en: "Smart Reminders", tr: "Akıllı Hatırlatıcı" }, icon: "Bell", href: "/smart-reminders" },
      { id: "side-effects", title: { en: "Side Effects", tr: "Yan Etkiler" }, icon: "AlertTriangle", href: "/side-effects" },
      { id: "pharmacy-finder", title: { en: "Pharmacy Finder", tr: "Eczane Bulucu" }, icon: "MapPin", href: "/pharmacy-finder" },
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
    description: { en: "Compare supplements, marketplace, allergy & detox info", tr: "Takviye karşılaştır, market, alerji ve detoks bilgisi" },
    defaultModule: "compare",
    layout: "tabs",
    modules: [
      { id: "compare", title: { en: "Compare", tr: "Karşılaştır" }, icon: "GitCompare", href: "/supplement-compare" },
      { id: "marketplace", title: { en: "Marketplace", tr: "Market" }, icon: "Store", href: "/supplement-marketplace" },
      { id: "favorites", title: { en: "Favorites", tr: "Favoriler" }, icon: "Heart", href: "/favorite-supplements" },
      { id: "anti-inflammatory", title: { en: "Anti-Inflammatory", tr: "Anti-İnflamatuar" }, icon: "Flame", href: "/anti-inflammatory" },
      { id: "detox-facts", title: { en: "Detox Facts", tr: "Detoks Gerçekleri" }, icon: "Beaker", href: "/detox-facts" },
      { id: "cross-allergy", title: { en: "Cross Allergy", tr: "Çapraz Alerji" }, icon: "AlertCircle", href: "/cross-allergy" },
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
    description: { en: "Mood tracking, anxiety, depression, ADHD & more", tr: "Ruh hali takibi, anksiyete, depresyon, DEHB ve daha fazlası" },
    defaultModule: "mood-tracker",
    layout: "tabs",
    modules: [
      { id: "mood-tracker", title: { en: "Mood Tracker", tr: "Ruh Hali Takibi" }, icon: "SmilePlus", href: "/mental-wellness" },
      { id: "anxiety-toolkit", title: { en: "Anxiety Toolkit", tr: "Anksiyete Araç Seti" }, icon: "ShieldCheck", href: "/anxiety-toolkit" },
      { id: "depression-screening", title: { en: "Depression Screening", tr: "Depresyon Tarama" }, icon: "HeartCrack", href: "/depression-screening" },
      { id: "adhd", title: { en: "ADHD Management", tr: "DEHB Yönetimi" }, icon: "Zap", href: "/adhd-management" },
      { id: "ptsd", title: { en: "PTSD Support", tr: "TSSB Destek" }, icon: "Shield", href: "/ptsd-support" },
      { id: "addiction", title: { en: "Addiction Recovery", tr: "Bağımlılık İyileşme" }, icon: "HeartHandshake", href: "/addiction-recovery" },
      { id: "grief", title: { en: "Grief Support", tr: "Yas Desteği" }, icon: "CloudRain", href: "/grief-support" },
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
    description: { en: "Meal logging, recipes, fasting, hydration & seasonal foods", tr: "Öğün kaydı, tarifler, oruç, hidrasyon ve mevsimsel besinler" },
    defaultModule: "nutrition-log",
    layout: "grid",
    modules: [
      { id: "nutrition-log", title: { en: "Nutrition Log", tr: "Beslenme Günlüğü" }, icon: "Utensils", href: "/nutrition" },
      { id: "recipes", title: { en: "Healthy Recipes", tr: "Sağlıklı Tarifler" }, icon: "ChefHat", href: "/healthy-recipes" },
      { id: "meal-prep", title: { en: "Food Prep Guide", tr: "Besin Hazırlama" }, icon: "CookingPot", href: "/food-prep" },
      { id: "seasonal-foods", title: { en: "Seasonal Foods", tr: "Mevsimsel Besinler" }, icon: "Flower", href: "/seasonal-food" },
      { id: "circadian-eating", title: { en: "Circadian Eating", tr: "Sirkadyen Beslenme" }, icon: "Clock", href: "/circadian-eating" },
      { id: "fasting", title: { en: "Intermittent Fasting", tr: "Aralıklı Oruç" }, icon: "Timer", href: "/intermittent-fasting" },
      { id: "fasting-monitor", title: { en: "Fasting Monitor", tr: "Oruç Monitörü" }, icon: "Moon", href: "/fasting-monitor" },
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
    description: { en: "Sleep tracking, dreams, apnea, circadian rhythm & jet lag", tr: "Uyku takibi, rüyalar, apne, sirkadyen ritim ve jet lag" },
    defaultModule: "sleep-log",
    layout: "tabs",
    modules: [
      { id: "sleep-log", title: { en: "Sleep Log", tr: "Uyku Kaydı" }, icon: "BedDouble", href: "/sleep-analysis" },
      { id: "dream-diary", title: { en: "Dream Diary", tr: "Rüya Günlüğü" }, icon: "Cloud", href: "/dream-diary" },
      { id: "snoring-apnea", title: { en: "Snoring & Apnea", tr: "Horlama & Apne" }, icon: "Wind", href: "/snoring-apnea" },
      { id: "circadian", title: { en: "Circadian Rhythm", tr: "Sirkadyen Ritim" }, icon: "Sun", href: "/circadian-rhythm" },
      { id: "jet-lag", title: { en: "Jet Lag", tr: "Jet Lag" }, icon: "Plane", href: "/jet-lag" },
      { id: "shift-worker", title: { en: "Shift Work", tr: "Vardiyalı Çalışma" }, icon: "Clock4", href: "/shift-worker" },
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
    description: { en: "Sports, stretching, walking, yoga & posture", tr: "Spor, esneme, yürüyüş, yoga ve duruş" },
    defaultModule: "sports",
    layout: "tabs",
    modules: [
      { id: "sports", title: { en: "Sports Performance", tr: "Spor Performansı" }, icon: "Trophy", href: "/sports-performance" },
      { id: "stretching", title: { en: "Stretching", tr: "Esneme" }, icon: "StretchHorizontal", href: "/stretching" },
      { id: "walking", title: { en: "Walking Tracker", tr: "Yürüyüş Takibi" }, icon: "Footprints", href: "/walking-tracker" },
      { id: "yoga", title: { en: "Yoga & Meditation", tr: "Yoga & Meditasyon" }, icon: "Flower2", href: "/yoga-meditation" },
      { id: "posture", title: { en: "Posture & Ergonomics", tr: "Duruş & Ergonomi" }, icon: "PersonStanding", href: "/posture-ergonomics" },
      { id: "breathing", title: { en: "Breathing Exercises", tr: "Nefes Egzersizleri" }, icon: "Wind", href: "/breathing-exercises" },
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
    description: { en: "Heart, kidney, liver, thyroid, lungs, eyes, skin & more", tr: "Kalp, böbrek, karaciğer, tiroid, akciğer, göz, cilt ve daha fazlası" },
    defaultModule: "cardiovascular",
    layout: "grid",
    modules: [
      { id: "cardiovascular", title: { en: "Heart & Cardiovascular", tr: "Kalp & Kardiyovasküler" }, icon: "Heart", href: "/cardiovascular-risk" },
      { id: "kidney", title: { en: "Kidney", tr: "Böbrek" }, icon: "Droplets", href: "/kidney-dashboard" },
      { id: "liver", title: { en: "Liver", tr: "Karaciğer" }, icon: "Activity", href: "/liver-monitor" },
      { id: "thyroid", title: { en: "Thyroid", tr: "Tiroid" }, icon: "Gauge", href: "/thyroid-dashboard" },
      { id: "lungs", title: { en: "Lungs", tr: "Akciğer" }, icon: "Wind", href: "/lung-monitor" },
      { id: "gut", title: { en: "Gut Health", tr: "Bağırsak Sağlığı" }, icon: "Apple", href: "/gut-health" },
      { id: "eyes", title: { en: "Eye Health", tr: "Göz Sağlığı" }, icon: "Eye", href: "/eye-health" },
      { id: "ears", title: { en: "Ear & Hearing", tr: "Kulak & İşitme" }, icon: "Ear", href: "/ear-health" },
      { id: "dental", title: { en: "Dental Health", tr: "Diş Sağlığı" }, icon: "Smile", href: "/dental-health" },
      { id: "skin", title: { en: "Skin Health", tr: "Cilt Sağlığı" }, icon: "Sparkles", href: "/skin-health" },
      { id: "hair-nail", title: { en: "Hair & Nails", tr: "Saç & Tırnak" }, icon: "Scissors", href: "/hair-nail-health" },
      { id: "migraine", title: { en: "Migraine", tr: "Migren" }, icon: "Zap", href: "/migraine-dashboard" },
      { id: "diabetic-foot", title: { en: "Diabetic Foot", tr: "Diyabetik Ayak" }, icon: "Footprints", href: "/diabetic-foot" },
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
    description: { en: "Pregnancy, menopause, sexual health & gender-specific tools", tr: "Gebelik, menopoz, cinsel sağlık ve cinsiyete özel araçlar" },
    defaultModule: "womens-health",
    layout: "tabs",
    modules: [
      { id: "womens-health", title: { en: "Women's Health", tr: "Kadın Sağlığı" }, icon: "Heart", href: "/womens-health" },
      { id: "pregnancy", title: { en: "Pregnancy Tracker", tr: "Gebelik Takibi" }, icon: "Baby", href: "/pregnancy-tracker" },
      { id: "postpartum", title: { en: "Postpartum", tr: "Doğum Sonrası" }, icon: "HeartHandshake", href: "/postpartum-support" },
      { id: "menopause", title: { en: "Menopause", tr: "Menopoz" }, icon: "Thermometer", href: "/menopause-panel" },
      { id: "mens-health", title: { en: "Men's Health", tr: "Erkek Sağlığı" }, icon: "Shield", href: "/mens-health" },
      { id: "sexual-health", title: { en: "Sexual Health", tr: "Cinsel Sağlık" }, icon: "Heart", href: "/sexual-health" },
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
    description: { en: "Diaries, habits, biomarkers, environmental trackers", tr: "Günlükler, alışkanlıklar, biyobelirteçler, çevresel takip" },
    defaultModule: "health-diary",
    layout: "grid",
    modules: [
      { id: "health-diary", title: { en: "Health Diary", tr: "Sağlık Günlüğü" }, icon: "BookOpen", href: "/health-diary" },
      { id: "pain-diary", title: { en: "Pain Diary", tr: "Ağrı Günlüğü" }, icon: "Frown", href: "/pain-diary" },
      { id: "voice-diary", title: { en: "Voice Diary", tr: "Sesli Günlük" }, icon: "Mic", href: "/voice-diary" },
      { id: "caffeine", title: { en: "Caffeine Tracker", tr: "Kafein Takibi" }, icon: "Coffee", href: "/caffeine-tracker" },
      { id: "alcohol", title: { en: "Alcohol Tracker", tr: "Alkol Takibi" }, icon: "Wine", href: "/alcohol-tracker" },
      { id: "smoking", title: { en: "Quit Smoking", tr: "Sigarayı Bırak" }, icon: "CigaretteOff", href: "/smoking-cessation" },
      { id: "screen-time", title: { en: "Screen Time", tr: "Ekran Süresi" }, icon: "Monitor", href: "/screen-time" },
      { id: "noise", title: { en: "Noise Exposure", tr: "Gürültü Maruziyeti" }, icon: "Volume2", href: "/noise-exposure" },
      { id: "sun-exposure", title: { en: "Sun Exposure", tr: "Güneş Maruziyeti" }, icon: "Sun", href: "/sun-exposure" },
      { id: "air-quality", title: { en: "Air Quality", tr: "Hava Kalitesi" }, icon: "Cloud", href: "/air-quality" },
      { id: "water-quality", title: { en: "Water Quality", tr: "Su Kalitesi" }, icon: "Droplets", href: "/water-quality" },
      { id: "timeline", title: { en: "Health Timeline", tr: "Sağlık Zaman Çizelgesi" }, icon: "Clock", href: "/health-timeline" },
      { id: "biomarkers", title: { en: "Biomarker Trends", tr: "Biyobelirteç Trendleri" }, icon: "TrendingUp", href: "/biomarker-trends" },
      { id: "radar", title: { en: "Health Radar", tr: "Sağlık Radarı" }, icon: "Radar", href: "/health-radar" },
      { id: "micro-habits", title: { en: "Micro Habits", tr: "Mikro Alışkanlıklar" }, icon: "Sparkles", href: "/micro-habits" },
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
    description: { en: "Cancer screening, check-ups, genetics & allergies", tr: "Kanser taraması, check-up, genetik ve alerjiler" },
    defaultModule: "checkup-planner",
    layout: "tabs",
    modules: [
      { id: "checkup-planner", title: { en: "Check-up Planner", tr: "Check-up Planlayıcı" }, icon: "CalendarCheck", href: "/checkup-planner" },
      { id: "cancer-screening", title: { en: "Cancer Screening", tr: "Kanser Taraması" }, icon: "Search", href: "/cancer-screening" },
      { id: "family-tree", title: { en: "Family Health Tree", tr: "Aile Sağlık Ağacı" }, icon: "GitBranch", href: "/family-health-tree" },
      { id: "genetic-risk", title: { en: "Genetic Risk", tr: "Genetik Risk" }, icon: "Dna", href: "/genetic-risk" },
      { id: "allergy-map", title: { en: "Allergy Map", tr: "Alerji Haritası" }, icon: "MapPin", href: "/allergy-map" },
      { id: "vaccination", title: { en: "Vaccinations", tr: "Aşılar" }, icon: "Syringe", href: "/vaccination" },
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
    description: { en: "Appointments, records, emergency tools & rehab", tr: "Randevu, kayıtlar, acil araçlar ve rehabilitasyon" },
    defaultModule: "appointment-prep",
    layout: "grid",
    modules: [
      { id: "appointment-prep", title: { en: "Appointment Prep", tr: "Randevu Hazırlık" }, icon: "ClipboardList", href: "/appointment-prep" },
      { id: "medical-records", title: { en: "Medical Records", tr: "Tıbbi Kayıtlar" }, icon: "FolderOpen", href: "/medical-records" },
      { id: "emergency-id", title: { en: "Emergency ID", tr: "Acil Kimlik" }, icon: "CreditCard", href: "/emergency-id" },
      { id: "emergency-mode", title: { en: "Emergency Mode", tr: "Acil Durum Modu" }, icon: "Siren", href: "/emergency-mode" },
      { id: "first-aid", title: { en: "First Aid", tr: "İlk Yardım" }, icon: "Cross", href: "/first-aid" },
      { id: "qr-profile", title: { en: "QR Health Card", tr: "QR Sağlık Kartı" }, icon: "QrCode", href: "/qr-profile" },
      { id: "disaster-mode", title: { en: "Disaster Mode", tr: "Afet Modu" }, icon: "AlertOctagon", href: "/disaster-mode" },
      { id: "second-opinion", title: { en: "Second Opinion", tr: "İkinci Görüş" }, icon: "Users", href: "/second-opinion" },
      { id: "clinical-trials", title: { en: "Clinical Trials", tr: "Klinik Araştırmalar" }, icon: "FlaskConical", href: "/clinical-trials" },
      { id: "rehabilitation", title: { en: "Rehabilitation", tr: "Rehabilitasyon" }, icon: "HeartHandshake", href: "/rehabilitation" },
      { id: "doctor-comm", title: { en: "Doctor Communication", tr: "Doktor İletişimi" }, icon: "MessageSquare", href: "/doctor-communication" },
      { id: "enabiz", title: { en: "e-Nabız", tr: "e-Nabız" }, icon: "Link", href: "/enabiz" },
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
    description: { en: "Age-specific care, chronic conditions, travel & cultural health", tr: "Yaşa özel bakım, kronik durumlar, seyahat ve kültürel sağlık" },
    defaultModule: "chronic-care",
    layout: "grid",
    modules: [
      { id: "chronic-care", title: { en: "Chronic Care", tr: "Kronik Bakım" }, icon: "Activity", href: "/chronic-care" },
      { id: "child-health", title: { en: "Child Health", tr: "Çocuk Sağlığı" }, icon: "Baby", href: "/child-health" },
      { id: "student", title: { en: "Student Health", tr: "Öğrenci Sağlığı" }, icon: "GraduationCap", href: "/student-health" },
      { id: "new-parent", title: { en: "New Parent", tr: "Yeni Ebeveyn" }, icon: "Baby", href: "/new-parent-health" },
      { id: "elder-care", title: { en: "Elder Care", tr: "Yaşlı Bakımı" }, icon: "Heart", href: "/elder-care" },
      { id: "retirement", title: { en: "Retirement", tr: "Emeklilik" }, icon: "Sunset", href: "/retirement-health" },
      { id: "military", title: { en: "Military Health", tr: "Askerlik Sağlığı" }, icon: "Shield", href: "/military-health" },
      { id: "immigrant", title: { en: "Immigrant Health", tr: "Göçmen Sağlığı" }, icon: "Globe", href: "/immigrant-health" },
      { id: "post-icu", title: { en: "Post-ICU Recovery", tr: "Yoğun Bakım Sonrası" }, icon: "HeartPulse", href: "/post-icu" },
      { id: "organ-transplant", title: { en: "Organ Transplant", tr: "Organ Nakli" }, icon: "Heart", href: "/organ-transplant" },
      { id: "cancer-support", title: { en: "Cancer Support", tr: "Kanser Destek" }, icon: "Ribbon", href: "/cancer-support" },
      { id: "dialysis", title: { en: "Dialysis", tr: "Diyaliz" }, icon: "Droplets", href: "/dialysis-tracker" },
      { id: "autism", title: { en: "Autism Support", tr: "Otizm Desteği" }, icon: "Puzzle", href: "/autism-support" },
      { id: "rare-diseases", title: { en: "Rare Diseases", tr: "Nadir Hastalıklar" }, icon: "Search", href: "/rare-diseases" },
      { id: "travel", title: { en: "Travel Health", tr: "Seyahat Sağlığı" }, icon: "Plane", href: "/travel-health" },
      { id: "seasonal", title: { en: "Seasonal Health", tr: "Mevsimsel Sağlık" }, icon: "Snowflake", href: "/seasonal-health" },
      { id: "hajj", title: { en: "Hajj & Umrah", tr: "Hac & Umre" }, icon: "Star", href: "/hajj-health" },
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
    description: { en: "Forums, mentoring, challenges, quizzes & podcasts", tr: "Forumlar, mentorluk, yarışmalar, bilmeceler ve podcastler" },
    defaultModule: "forum",
    layout: "grid",
    modules: [
      { id: "forum", title: { en: "Health Forum", tr: "Sağlık Forumu" }, icon: "MessageSquare", href: "/health-forum" },
      { id: "support-groups", title: { en: "Support Groups", tr: "Destek Grupları" }, icon: "Users", href: "/support-groups" },
      { id: "peer-mentoring", title: { en: "Peer Mentoring", tr: "Akran Mentorluğu" }, icon: "UserPlus", href: "/peer-mentoring" },
      { id: "social-rx", title: { en: "Social Prescription", tr: "Sosyal Reçete" }, icon: "Heart", href: "/social-prescription" },
      { id: "quiz", title: { en: "Health Quiz", tr: "Sağlık Bilmecesi" }, icon: "HelpCircle", href: "/health-quiz" },
      { id: "podcasts", title: { en: "Podcasts", tr: "Podcastler" }, icon: "Headphones", href: "/health-podcasts" },
      { id: "courses", title: { en: "Courses", tr: "Kurslar" }, icon: "GraduationCap", href: "/courses" },
      { id: "dictionary", title: { en: "Medical Dictionary", tr: "Tıbbi Sözlük" }, icon: "BookOpen", href: "/medical-dictionary" },
      { id: "news-verifier", title: { en: "News Verifier", tr: "Haber Doğrulama" }, icon: "CheckCircle", href: "/health-news-verifier" },
      { id: "challenges", title: { en: "Health Challenges", tr: "Sağlık Yarışmaları" }, icon: "Trophy", href: "/health-challenges" },
    ],
  },
]

// ── Helper Functions ────────────────────

/** Find which category a legacy path belongs to */
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

/** Get all modules flattened */
export function getAllModules(): (ToolModule & { categoryId: string; categorySlug: string })[] {
  return TOOL_CATEGORIES.flatMap(cat =>
    cat.modules.map(mod => ({ ...mod, categoryId: cat.id, categorySlug: cat.slug }))
  )
}

/** Search modules by query (matches title in both languages) */
export function searchModules(query: string): (ToolModule & { categoryId: string; categoryTitle: { en: string; tr: string } })[] {
  const q = query.toLowerCase()
  return TOOL_CATEGORIES.flatMap(cat =>
    cat.modules
      .filter(m => m.title.en.toLowerCase().includes(q) || m.title.tr.toLowerCase().includes(q))
      .map(m => ({ ...m, categoryId: cat.id, categoryTitle: cat.title }))
  )
}

/** Total module count */
export const TOTAL_MODULE_COUNT = TOOL_CATEGORIES.reduce((sum, cat) => sum + cat.modules.length, 0)
