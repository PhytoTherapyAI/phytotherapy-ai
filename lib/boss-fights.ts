// © 2026 DoctoPal — All Rights Reserved
// ============================================
// Boss Fight Protocols — Sprint 11
// ============================================
// Pre-defined situational health protocols
// "Boss fights" that users can activate to get
// a structured supplement + lifestyle plan

import type { Lang } from "@/lib/translations"

export interface BossFight {
  id: string
  icon: string
  color: string           // Tailwind gradient start color
  colorEnd: string        // Tailwind gradient end color
  duration: number        // days
  difficulty: "easy" | "medium" | "hard"
  category: "seasonal" | "performance" | "recovery" | "lifestyle"
  name: Record<Lang, string>
  tagline: Record<Lang, string>
  description: Record<Lang, string>
  tasks: Array<{
    name: Record<Lang, string>
    type: "supplement" | "lifestyle" | "nutrition" | "exercise"
    detail: Record<Lang, string>
    frequency: string     // "daily", "morning", "evening", "2x/day"
  }>
  rewards: Record<Lang, string>
}

export const BOSS_FIGHTS: BossFight[] = [
  {
    id: "spring-allergy",
    icon: "🌸",
    color: "#ec4899",
    colorEnd: "#f9a8d4",
    duration: 21,
    difficulty: "medium",
    category: "seasonal",
    name: { en: "Spring Allergy Boss", tr: "Bahar Alerjisi Boss'u" },
    tagline: { en: "Defeat seasonal allergies naturally", tr: "Mevsimsel alerjiyi doğal yollarla yen" },
    description: {
      en: "A 21-day protocol combining quercetin, local honey, and lifestyle changes to build your body's defense against spring allergens.",
      tr: "Quercetin, yerel bal ve yaşam tarzı değişikliklerini birleştiren 21 günlük protokol — vücudunuzu bahar alerjenlerine karşı güçlendirin.",
    },
    tasks: [
      { name: { en: "Quercetin", tr: "Kuersetin" }, type: "supplement", detail: { en: "500mg twice daily with meals", tr: "Günde 2x500mg yemekle birlikte" }, frequency: "2x/day" },
      { name: { en: "Local Honey", tr: "Yerel Bal" }, type: "nutrition", detail: { en: "1 tablespoon of local raw honey every morning", tr: "Her sabah 1 yemek kaşığı yerel çiğ bal" }, frequency: "morning" },
      { name: { en: "Vitamin C", tr: "C Vitamini" }, type: "supplement", detail: { en: "1000mg daily", tr: "Günde 1000mg" }, frequency: "daily" },
      { name: { en: "Nasal rinse", tr: "Burun yıkama" }, type: "lifestyle", detail: { en: "Saline nasal rinse morning & evening", tr: "Sabah ve akşam serum fizyolojik ile burun yıkama" }, frequency: "2x/day" },
      { name: { en: "Window hours", tr: "Pencere saatleri" }, type: "lifestyle", detail: { en: "Keep windows closed 5-10am & 5-10pm (peak pollen)", tr: "05-10 ve 17-22 arası pencereler kapalı (yoğun polen)" }, frequency: "daily" },
    ],
    rewards: { en: "Allergy Slayer Badge 🛡️", tr: "Alerji Avcısı Rozeti 🛡️" },
  },
  {
    id: "exam-week",
    icon: "📚",
    color: "#3b82f6",
    colorEnd: "#93c5fd",
    duration: 7,
    difficulty: "hard",
    category: "performance",
    name: { en: "Exam Week Boss", tr: "Sınav Haftası Boss'u" },
    tagline: { en: "Peak mental performance for exams", tr: "Sınavlar için zihinsel performans zirvesi" },
    description: {
      en: "A 7-day intense focus protocol with nootropics, sleep optimization, and brain-boosting nutrition to maximize your cognitive performance.",
      tr: "Nootropikler, uyku optimizasyonu ve beyin besleyen beslenme ile bilişsel performansı maksimuma çıkaran 7 günlük yoğun odak protokolü.",
    },
    tasks: [
      { name: { en: "Omega-3 DHA", tr: "Omega-3 DHA" }, type: "supplement", detail: { en: "1000mg DHA daily with breakfast", tr: "Günde 1000mg DHA kahvaltıyla" }, frequency: "morning" },
      { name: { en: "Bacopa Monnieri", tr: "Bacopa Monnieri" }, type: "supplement", detail: { en: "300mg standardized extract with breakfast", tr: "300mg standart ekstrakt kahvaltıyla" }, frequency: "morning" },
      { name: { en: "L-Theanine + Coffee", tr: "L-Teanin + Kahve" }, type: "supplement", detail: { en: "200mg L-Theanine with your morning coffee", tr: "Sabah kahvesiyle 200mg L-Teanin" }, frequency: "morning" },
      { name: { en: "Sleep by 11pm", tr: "23:00'da uyu" }, type: "lifestyle", detail: { en: "No screens after 10pm, sleep by 11pm sharp", tr: "22:00'dan sonra ekran yok, 23:00'da kesin uyu" }, frequency: "daily" },
      { name: { en: "Brain food lunch", tr: "Beyin besleyen öğle" }, type: "nutrition", detail: { en: "Blueberries, walnuts, dark chocolate, salmon", tr: "Yaban mersini, ceviz, bitter çikolata, somon" }, frequency: "daily" },
      { name: { en: "20min walk", tr: "20dk yürüyüş" }, type: "exercise", detail: { en: "20-minute brisk walk after study sessions", tr: "Ders arası 20 dakika tempolu yürüyüş" }, frequency: "daily" },
    ],
    rewards: { en: "Brain Power Badge 🧠", tr: "Beyin Gücü Rozeti 🧠" },
  },
  {
    id: "winter-immunity",
    icon: "❄️",
    color: "#6366f1",
    colorEnd: "#a5b4fc",
    duration: 30,
    difficulty: "medium",
    category: "seasonal",
    name: { en: "Winter Immunity Boss", tr: "Kış Bağışıklık Boss'u" },
    tagline: { en: "Fortify your immune system for winter", tr: "Kış için bağışıklık sisteminizi güçlendirin" },
    description: {
      en: "A 30-day immunity-building protocol with vitamin D, zinc, elderberry, and cold exposure to prepare your body for cold season.",
      tr: "D vitamini, çinko, mürver ve soğuk maruziyetiyle vücudunuzu soğuk mevsime hazırlayan 30 günlük bağışıklık güçlendirme protokolü.",
    },
    tasks: [
      { name: { en: "Vitamin D3", tr: "D3 Vitamini" }, type: "supplement", detail: { en: "4000 IU daily with fatty meal", tr: "Günde 4000 IU yağlı öğünle" }, frequency: "daily" },
      { name: { en: "Zinc", tr: "Çinko" }, type: "supplement", detail: { en: "15mg daily (zinc picolinate)", tr: "Günde 15mg (çinko pikolinat)" }, frequency: "daily" },
      { name: { en: "Elderberry", tr: "Mürver" }, type: "supplement", detail: { en: "500mg elderberry extract daily", tr: "Günde 500mg mürver ekstrakt" }, frequency: "daily" },
      { name: { en: "Cold shower finish", tr: "Soğuk duş finali" }, type: "lifestyle", detail: { en: "End shower with 30s cold water (work up to 2min)", tr: "Duşu 30sn soğuk suyla bitir (2dk'ya çık)" }, frequency: "daily" },
      { name: { en: "Probiotic foods", tr: "Probiyotik gıdalar" }, type: "nutrition", detail: { en: "Yogurt, kefir, or sauerkraut daily", tr: "Günlük yoğurt, kefir veya turşu" }, frequency: "daily" },
    ],
    rewards: { en: "Winter Warrior Badge ⚔️", tr: "Kış Savaşçısı Rozeti ⚔️" },
  },
  {
    id: "sleep-reset",
    icon: "🌙",
    color: "#8b5cf6",
    colorEnd: "#c4b5fd",
    duration: 14,
    difficulty: "easy",
    category: "lifestyle",
    name: { en: "Sleep Reset Boss", tr: "Uyku Sıfırlama Boss'u" },
    tagline: { en: "Reset your circadian rhythm", tr: "Sirkadiyen ritminizi sıfırlayın" },
    description: {
      en: "A 14-day sleep optimization protocol to fix your sleep schedule, improve sleep quality, and wake up refreshed.",
      tr: "Uyku düzeninizi düzeltmek, uyku kalitesini artırmak ve dinlenmiş uyanmak için 14 günlük uyku optimizasyon protokolü.",
    },
    tasks: [
      { name: { en: "Magnesium Glycinate", tr: "Magnezyum Glisinat" }, type: "supplement", detail: { en: "400mg 1 hour before bed", tr: "Yatmadan 1 saat önce 400mg" }, frequency: "evening" },
      { name: { en: "Valerian Root", tr: "Kediotu" }, type: "supplement", detail: { en: "300-600mg 30min before bed", tr: "Yatmadan 30dk önce 300-600mg" }, frequency: "evening" },
      { name: { en: "No caffeine after 2pm", tr: "14:00'dan sonra kafein yok" }, type: "lifestyle", detail: { en: "Zero caffeine after 2pm — includes tea & chocolate", tr: "14:00'dan sonra sıfır kafein — çay ve çikolata dahil" }, frequency: "daily" },
      { name: { en: "Sunlight exposure", tr: "Güneş ışığı" }, type: "lifestyle", detail: { en: "10min direct sunlight within 30min of waking", tr: "Uyandıktan 30dk içinde 10dk direkt güneş ışığı" }, frequency: "morning" },
      { name: { en: "Blue light filter", tr: "Mavi ışık filtresi" }, type: "lifestyle", detail: { en: "Enable night mode on all screens after 8pm", tr: "Tüm ekranlarda 20:00'dan sonra gece modu aç" }, frequency: "evening" },
    ],
    rewards: { en: "Sleep Master Badge 😴", tr: "Uyku Ustası Rozeti 😴" },
  },
  {
    id: "energy-boost",
    icon: "⚡",
    color: "#f59e0b",
    colorEnd: "#fde68a",
    duration: 14,
    difficulty: "easy",
    category: "performance",
    name: { en: "Energy Boost Boss", tr: "Enerji Patlaması Boss'u" },
    tagline: { en: "Reclaim your energy naturally", tr: "Enerjinizi doğal yollarla geri kazanın" },
    description: {
      en: "A 14-day energy optimization protocol combining adaptogens, B-vitamins, and lifestyle tweaks to eliminate fatigue.",
      tr: "Adaptojenleri, B vitaminlerini ve yaşam tarzı ayarlamalarını birleştirerek yorgunluğu ortadan kaldıran 14 günlük enerji optimizasyon protokolü.",
    },
    tasks: [
      { name: { en: "Ashwagandha", tr: "Ashwagandha" }, type: "supplement", detail: { en: "300mg KSM-66 twice daily", tr: "Günde 2x300mg KSM-66" }, frequency: "2x/day" },
      { name: { en: "B-Complex", tr: "B-Kompleks" }, type: "supplement", detail: { en: "1 B-complex capsule with breakfast", tr: "Kahvaltıyla 1 B-kompleks kapsül" }, frequency: "morning" },
      { name: { en: "CoQ10", tr: "CoQ10" }, type: "supplement", detail: { en: "100mg with breakfast", tr: "Kahvaltıyla 100mg" }, frequency: "morning" },
      { name: { en: "Hydration goal", tr: "Su hedefi" }, type: "lifestyle", detail: { en: "Drink 2.5L water daily, front-load before 3pm", tr: "Günde 2.5L su, çoğunluğu 15:00'dan önce" }, frequency: "daily" },
      { name: { en: "Morning exercise", tr: "Sabah egzersizi" }, type: "exercise", detail: { en: "15min light exercise within 1hr of waking", tr: "Uyandıktan 1 saat içinde 15dk hafif egzersiz" }, frequency: "morning" },
    ],
    rewards: { en: "Energy Champion Badge ⚡", tr: "Enerji Şampiyonu Rozeti ⚡" },
  },
  {
    id: "gut-health",
    icon: "🦠",
    color: "#10b981",
    colorEnd: "#6ee7b7",
    duration: 21,
    difficulty: "medium",
    category: "recovery",
    name: { en: "Gut Health Boss", tr: "Bağırsak Sağlığı Boss'u" },
    tagline: { en: "Restore your gut microbiome", tr: "Bağırsak mikrobiyomunuzu yenileyin" },
    description: {
      en: "A 21-day gut restoration protocol with probiotics, prebiotics, and anti-inflammatory nutrition to optimize your digestive health.",
      tr: "Probiyotikler, prebiyotikler ve anti-inflamatuar beslenme ile sindirim sağlığınızı optimize eden 21 günlük bağırsak yenileme protokolü.",
    },
    tasks: [
      { name: { en: "Probiotic (multi-strain)", tr: "Probiyotik (çoklu suş)" }, type: "supplement", detail: { en: "30 billion CFU on empty stomach", tr: "Aç karna 30 milyar CFU" }, frequency: "morning" },
      { name: { en: "Prebiotic fiber", tr: "Prebiyotik lif" }, type: "supplement", detail: { en: "Psyllium husk 5g with water before dinner", tr: "Akşam yemeğinden önce 5g psyllium suyla" }, frequency: "evening" },
      { name: { en: "L-Glutamine", tr: "L-Glutamin" }, type: "supplement", detail: { en: "5g powder on empty stomach", tr: "Aç karna 5g toz" }, frequency: "morning" },
      { name: { en: "Fermented foods", tr: "Fermente gıdalar" }, type: "nutrition", detail: { en: "1 serving of kimchi, sauerkraut, or kefir daily", tr: "Günde 1 porsiyon kimchi, lahana turşusu veya kefir" }, frequency: "daily" },
      { name: { en: "Eliminate processed sugar", tr: "İşlenmiş şekeri kes" }, type: "nutrition", detail: { en: "No added sugar for 21 days", tr: "21 gün boyunca eklenen şeker yok" }, frequency: "daily" },
    ],
    rewards: { en: "Gut Guardian Badge 🛡️", tr: "Bağırsak Koruyucusu Rozeti 🛡️" },
  },
]

export function getBossFight(id: string): BossFight | undefined {
  return BOSS_FIGHTS.find(b => b.id === id)
}

export function getBossFightsByCategory(category: BossFight["category"]): BossFight[] {
  return BOSS_FIGHTS.filter(b => b.category === category)
}
