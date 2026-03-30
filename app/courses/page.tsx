// © 2026 Phytotherapy.ai — All Rights Reserved
"use client"

import { useState } from "react"
import { useLang } from "@/components/layout/language-toggle"
import { tx, txObj } from "@/lib/translations"
import {
  GraduationCap,
  ExternalLink,
  Clock,
  Star,
  Users,
  BookOpen,
  Leaf,
  Flower2,
  Droplets,
  Heart,
  Brain,
  Dumbbell,
} from "lucide-react"
import Link from "next/link"

// Course data — affiliate links will be added post-hackathon
const COURSES = [
  {
    id: "phytotherapy-fundamentals",
    icon: Leaf,
    category: "phytotherapy",
    platform: "Udemy",
    rating: 4.7,
    students: 12500,
    duration: "18 saat",
    durationEn: "18 hours",
    level: "beginner",
    affiliateUrl: "#", // Affiliate link eklenecek
    gradient: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30",
    border: "border-green-200 dark:border-green-800",
    iconBg: "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300",
  },
  {
    id: "aromatherapy-essentials",
    icon: Flower2,
    category: "aromatherapy",
    platform: "Udemy",
    rating: 4.5,
    students: 8200,
    duration: "12 saat",
    durationEn: "12 hours",
    level: "beginner",
    affiliateUrl: "#",
    gradient: "from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30",
    border: "border-purple-200 dark:border-purple-800",
    iconBg: "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300",
  },
  {
    id: "acupuncture-intro",
    icon: Droplets,
    category: "acupuncture",
    platform: "Sorbil",
    rating: 4.8,
    students: 3400,
    duration: "24 saat",
    durationEn: "24 hours",
    level: "intermediate",
    affiliateUrl: "#",
    gradient: "from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30",
    border: "border-blue-200 dark:border-blue-800",
    iconBg: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
  },
  {
    id: "herbal-medicine-clinical",
    icon: BookOpen,
    category: "herbal_medicine",
    platform: "Udemy",
    rating: 4.6,
    students: 6800,
    duration: "30 saat",
    durationEn: "30 hours",
    level: "advanced",
    affiliateUrl: "#",
    gradient: "from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30",
    border: "border-amber-200 dark:border-amber-800",
    iconBg: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300",
  },
  {
    id: "nutrition-wellness",
    icon: Heart,
    category: "nutrition",
    platform: "Udemy",
    rating: 4.4,
    students: 21000,
    duration: "15 saat",
    durationEn: "15 hours",
    level: "beginner",
    affiliateUrl: "#",
    gradient: "from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30",
    border: "border-red-200 dark:border-red-800",
    iconBg: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300",
  },
  {
    id: "integrative-medicine",
    icon: Brain,
    category: "integrative",
    platform: "Sorbil",
    rating: 4.9,
    students: 1800,
    duration: "36 saat",
    durationEn: "36 hours",
    level: "advanced",
    affiliateUrl: "#",
    gradient: "from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30",
    border: "border-indigo-200 dark:border-indigo-800",
    iconBg: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300",
  },
  {
    id: "sports-supplements",
    icon: Dumbbell,
    category: "sports",
    platform: "Udemy",
    rating: 4.3,
    students: 15600,
    duration: "10 saat",
    durationEn: "10 hours",
    level: "beginner",
    affiliateUrl: "#",
    gradient: "from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30",
    border: "border-orange-200 dark:border-orange-800",
    iconBg: "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300",
  },
  {
    id: "functional-medicine",
    icon: Leaf,
    category: "functional",
    platform: "Sorbil",
    rating: 4.7,
    students: 4200,
    duration: "28 saat",
    durationEn: "28 hours",
    level: "intermediate",
    affiliateUrl: "#",
    gradient: "from-teal-50 to-green-50 dark:from-teal-950/30 dark:to-green-950/30",
    border: "border-teal-200 dark:border-teal-800",
    iconBg: "bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300",
  },
]

const CATEGORIES = [
  { id: "all", labelTr: "Tümü", labelEn: "All" },
  { id: "phytotherapy", labelTr: "Fitoterapi", labelEn: "Phytotherapy" },
  { id: "aromatherapy", labelTr: "Aromaterapi", labelEn: "Aromatherapy" },
  { id: "acupuncture", labelTr: "Akupunktur", labelEn: "Acupuncture" },
  { id: "herbal_medicine", labelTr: "Bitkisel Tıp", labelEn: "Herbal Medicine" },
  { id: "nutrition", labelTr: "Beslenme", labelEn: "Nutrition" },
  { id: "integrative", labelTr: "Bütünleştirici Tıp", labelEn: "Integrative Medicine" },
  { id: "sports", labelTr: "Spor & Takviye", labelEn: "Sports & Supplements" },
  { id: "functional", labelTr: "Fonksiyonel Tıp", labelEn: "Functional Medicine" },
]

export default function CoursesPage() {
  const { lang } = useLang()
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredCourses = selectedCategory === "all"
    ? COURSES
    : COURSES.filter(c => c.category === selectedCategory)

  const levelLabel = (level: string) => {
    if (lang === "tr") {
      return level === "beginner" ? "Başlangıç" : level === "intermediate" ? "Orta" : "İleri"
    }
    return level === "beginner" ? "Beginner" : level === "intermediate" ? "Intermediate" : "Advanced"
  }

  const levelColor = (level: string) => {
    return level === "beginner"
      ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
      : level === "intermediate"
      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
      : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <GraduationCap className="h-7 w-7 text-primary" />
        </div>
        <h1 className="font-heading text-3xl font-bold">
          {tx("courses.title", lang)}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {tx("courses.subtitle", lang)}
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              selectedCategory === cat.id
                ? "bg-primary text-white shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {txObj(cat, lang)}
          </button>
        ))}
      </div>

      {/* Course Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredCourses.map((course) => {
          const Icon = course.icon
          const titleKey = `courses.${course.id}.title` as any
          const descKey = `courses.${course.id}.desc` as any
          // Fallback titles if translation keys don't exist yet
          const titles: Record<string, { tr: string; en: string }> = {
            "phytotherapy-fundamentals": { tr: "Fitoterapi Temelleri", en: "Phytotherapy Fundamentals" },
            "aromatherapy-essentials": { tr: "Aromaterapi Temelleri", en: "Aromatherapy Essentials" },
            "acupuncture-intro": { tr: "Akupunktur Eğitimi", en: "Acupuncture Training" },
            "herbal-medicine-clinical": { tr: "Klinik Bitkisel Tıp", en: "Clinical Herbal Medicine" },
            "nutrition-wellness": { tr: "Beslenme & Wellness", en: "Nutrition & Wellness" },
            "integrative-medicine": { tr: "Bütünleştirici Tıp", en: "Integrative Medicine" },
            "sports-supplements": { tr: "Spor Takviyeleri", en: "Sports Supplements" },
            "functional-medicine": { tr: "Fonksiyonel Tıp", en: "Functional Medicine" },
          }
          const descs: Record<string, { tr: string; en: string }> = {
            "phytotherapy-fundamentals": { tr: "Bitkisel tedavilerin bilimsel temelleri, doz protokolleri ve güvenlik ilkeleri.", en: "Scientific foundations of herbal treatments, dosing protocols and safety principles." },
            "aromatherapy-essentials": { tr: "Uçucu yağların terapötik kullanımı, karışım teknikleri ve kontrendikasyonlar.", en: "Therapeutic use of essential oils, blending techniques and contraindications." },
            "acupuncture-intro": { tr: "Geleneksel Çin Tıbbı meridyen sistemi, temel iğneleme noktaları ve modern uygulamalar.", en: "Traditional Chinese Medicine meridian system, basic needling points and modern applications." },
            "herbal-medicine-clinical": { tr: "İleri düzey bitki-ilaç etkileşimleri, klinik vaka analizleri ve kanıt değerlendirmesi.", en: "Advanced herb-drug interactions, clinical case analysis and evidence evaluation." },
            "nutrition-wellness": { tr: "Makro ve mikro besinler, anti-inflamatuar beslenme, besin-ilaç etkileşimleri.", en: "Macro and micronutrients, anti-inflammatory nutrition, food-drug interactions." },
            "integrative-medicine": { tr: "Modern tıp ile geleneksel yöntemlerin kanıta dayalı entegrasyonu.", en: "Evidence-based integration of modern medicine with traditional methods." },
            "sports-supplements": { tr: "Kreatin, protein, BCAA, adaptogenler — kanıt düzeyleri ve güvenlik.", en: "Creatine, protein, BCAAs, adaptogens — evidence levels and safety." },
            "functional-medicine": { tr: "Kök neden analizi, biyokimyasal bireysellik, sistemler biyolojisi yaklaşımı.", en: "Root cause analysis, biochemical individuality, systems biology approach." },
          }

          return (
            <div
              key={course.id}
              className={`group relative overflow-hidden rounded-xl border bg-gradient-to-br ${course.gradient} ${course.border} p-5 transition-all hover:shadow-lg hover:-translate-y-1`}
            >
              {/* Platform Badge */}
              <div className="mb-3 flex items-center justify-between">
                <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${course.iconBg}`}>
                  <Icon className="mr-1.5 h-3.5 w-3.5" />
                  {txObj(CATEGORIES.find(c => c.id === course.category) ?? {}, lang)}
                </span>
                <span className="rounded-md bg-background/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {course.platform}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="mb-1.5 text-base font-bold leading-snug">
                {titles[course.id]?.[lang]}
              </h3>
              <p className="mb-4 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {descs[course.id]?.[lang]}
              </p>

              {/* Meta */}
              <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {course.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {course.students.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {txObj({ en: course.durationEn, tr: course.duration }, lang)}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${levelColor(course.level)}`}>
                  {levelLabel(course.level)}
                </span>
              </div>

              {/* CTA */}
              {course.affiliateUrl !== "#" ? (
                <a
                  href={course.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary/10 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
                >
                  {tx("courses.goToCourse", lang)}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-muted/50 py-2 text-sm font-medium text-muted-foreground">
                  {lang === "tr" ? "Yakinda" : "Coming Soon"}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Disclaimer */}
      <div className="mt-10 rounded-xl border bg-muted/30 p-5 text-center text-sm text-muted-foreground">
        <p>
          {tx("courses.disclaimer", lang)}
        </p>
      </div>
    </div>
  )
}
