"use client";

import { useState } from "react";
import {
  GraduationCap,
  Brain,
  Coffee,
  Apple,
  Moon,
  Users,
  AlertTriangle,
  Shield,
  LogIn,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface StressTip {
  icon: React.ReactNode;
  title: { en: string; tr: string };
  items: { en: string; tr: string }[];
}

const STRESS_TIPS: StressTip[] = [
  {
    icon: <Brain className="w-5 h-5 text-indigo-500" />,
    title: { en: "Exam Stress Management", tr: "Sinav Stresi Yönetimi" },
    items: [
      { en: "Pomodoro technique: 25 min study, 5 min break — prevents burnout", tr: "Pomodoro teknigi: 25 dk çalışma, 5 dk mola — tukenmisligi onler" },
      { en: "Avoid cramming — spaced repetition is 3x more effective for long-term memory", tr: "Son dakika çalışmaktan kacinin — aralikli tekrar uzun sureli hafiza için 3 kat daha etkili" },
      { en: "Physical activity before study sessions increases focus by up to 20%", tr: "Calisma öncesi fiziksel aktivite odaklanmayi %20'ye kadar arttırır" },
      { en: "Deep breathing (4-7-8): inhale 4s, hold 7s, exhale 8s — activates parasympathetic", tr: "Derin nefes (4-7-8): 4s nefes al, 7s tut, 8s ver — parasempatik sistemi aktive eder" },
      { en: "Write down worries before an exam — 'worry dump' reduces test anxiety", tr: "Sinav öncesi kaygılari yazin — 'endise bosaltma' sinav kaygısini azaltir" },
      { en: "Progressive muscle relaxation: tense each muscle group 5s, release — repeat", tr: "Ilerleyici kas gevsetme: her kas grubunu 5s kasin, bırakın — tekrarlayin" },
    ],
  },
  {
    icon: <Coffee className="w-5 h-5 text-amber-500" />,
    title: { en: "Energy Drink & Caffeine Warnings", tr: "Enerji Icecegi ve Kafein Uyarılari" },
    items: [
      { en: "Safe caffeine limit: 400mg/day (about 4 cups coffee) — less for <18 yo", tr: "Güvenli kafein limiti: 400mg/gun (yaklasik 4 fincan kahve) — 18 yas alti daha az" },
      { en: "Energy drinks can contain 200-300mg caffeine + taurine + guarana — additive effects", tr: "Enerji icecekleri 200-300mg kafein + taurin + guarana icerebilir — birlestirici etki" },
      { en: "Caffeine after 2 PM disrupts sleep architecture — even if you fall asleep", tr: "Saat 14:00'ten sonra kafein uyku mimarisini bozar — uyusaniz bile" },
      { en: "Mixing energy drinks with alcohol masks intoxication — extremely dangerous", tr: "Enerji iceceklerini alkol ile karistirmak sarhosu gizler — son derece tehlikeli" },
      { en: "Caffeine withdrawal: headache, irritability, fatigue — taper gradually over 1 week", tr: "Kafein yoksunlugu: bas ağrısi, sinirlilik, yorgunluk — 1 haftada yavas azaltin" },
      { en: "Better alternatives: green tea (L-theanine + moderate caffeine), cold water splash, short walk", tr: "Daha iyi alternatifler: yesil cay (L-teanin + orta kafein), soguk su, kisa yuruyus" },
    ],
  },
  {
    icon: <Apple className="w-5 h-5 text-green-500" />,
    title: { en: "Budget-Friendly Nutrition", tr: "Butce Dostu Beslenme" },
    items: [
      { en: "Eggs: cheapest complete protein — 6g protein, B12, choline for brain health", tr: "Yumurta: en ucuz tam protein — 6g protein, B12, beyin sağlığı için kolin" },
      { en: "Oats: 1kg lasts 2 weeks — fiber, sustained energy, reduces cholesterol", tr: "Yulaf: 1kg 2 hafta dayanir — lif, kalici enerji, kolesterolu dusurur" },
      { en: "Frozen vegetables are as nutritious as fresh — cheaper and no waste", tr: "Dondurulmus sebzeler taze kadar besleyici — daha ucuz ve israf yok" },
      { en: "Legumes (lentils, chickpeas): protein + iron + fiber — pennies per serving", tr: "Baklagiller (mercimek, nohut): protein + demir + lif — porsiyon basi kuruslar" },
      { en: "Bananas: potassium, B6, quick energy — cheapest fruit in most countries", tr: "Muz: potasyum, B6, hizli enerji — cogu ulkede en ucuz meyve" },
      { en: "Meal prep Sundays: cook in bulk, portion, freeze — saves money + time + health", tr: "Pazar hazirlik: toplu pisirin, porsiyonlayin, dondurun — para + zaman + sağlık kazanin" },
    ],
  },
  {
    icon: <Moon className="w-5 h-5 text-indigo-400" />,
    title: { en: "Sleep Schedule Fixer", tr: "Uyku Duzeni Duzeltici" },
    items: [
      { en: "Students need 7-9 hours — even 1 hour less reduces cognitive performance by 25%", tr: "Ogrenciler 7-9 saat uykuya ihtiyac duyar — 1 saat bile az uyku bilissel performansi %25 azaltir" },
      { en: "Fixed wake time is more important than bedtime — set alarm 7 days/week initially", tr: "Sabit kalkis saati yatis saatinden önemlidir — başlangıçta haftanin 7 gunu alarm kurun" },
      { en: "Blue light filter 2 hours before bed — or use amber glasses", tr: "Yatmadan 2 saat once mavi isik filtresi — veya amber gozluk kullanin" },
      { en: "Nap rule: max 20 min, before 3 PM — longer naps create sleep inertia", tr: "Sekerleme kurali: max 20 dk, saat 15:00 öncesi — uzun sekerlemeler uyku atalesine yol acar" },
      { en: "Bedroom temp 18-20°C is optimal — cooler room = deeper sleep", tr: "Yatak odasi sicakligi 18-20°C optimal — serin oda = derin uyku" },
      { en: "All-nighters destroy memory consolidation — 2 hours sleep is better than none", tr: "Geceleri hic uyumamak hafiza pekistirmeyi bozar — 2 saat uyku hic uyumamaktan iyidir" },
    ],
  },
  {
    icon: <Users className="w-5 h-5 text-blue-500" />,
    title: { en: "Social Isolation Checklist", tr: "Sosyal Izolasyon Kontrol Listesi" },
    items: [
      { en: "Talk to at least 1 person face-to-face daily — even brief interactions help", tr: "Günlük en az 1 kisiyle yuz yuze konusun — kisa etkilesimler bile yardımcı" },
      { en: "Join 1 club or activity group — shared interests reduce social anxiety", tr: "1 kulup veya etkinlik grubuna katilin — ortak ilgi alanlari sosyal kaygıyi azaltir" },
      { en: "Study groups: social connection + accountability + better learning", tr: "Calisma gruplari: sosyal baglanti + hesap verebilirlik + daha iyi ogrenme" },
      { en: "Feeling isolated for 2+ weeks? Reach out to campus counseling — it's free", tr: "2+ haftadir kendinizi izole mi hissediyorsunuz? Kampus danışmanlarina ulasin — ucretsiz" },
      { en: "Regular meals with others reduce stress hormones — eat together when possible", tr: "Baskalariyla düzenli yemek stres hormonlarini azaltir — mümkünse birlikte yiyin" },
      { en: "Volunteer work: helps others + builds social network + improves mood", tr: "Gonullu çalışma: baskalarina yardim + sosyal ag + ruh hali iyilestirme" },
    ],
  },
];

interface SubstanceInfo {
  name: { en: string; tr: string };
  risk: "high" | "moderate" | "low";
  details: { en: string; tr: string };
}

const SUBSTANCE_RISKS: SubstanceInfo[] = [
  {
    name: { en: "Prescription stimulants (Ritalin, Adderall) without prescription", tr: "Reçetesiz uyarıci ilaclar (Ritalin, Adderall)" },
    risk: "high",
    details: { en: "Illegal without prescription. Risk of cardiovascular events, addiction, psychosis. Does NOT improve learning — only wakefulness.", tr: "Reçetesiz yasadışı. Kardiyovasküler olay, bağımlilik, psikoz riski. Öğrenmeyi iyilestirmez — sadece uyanıklık." },
  },
  {
    name: { en: "Excessive caffeine pills / pre-workout", tr: "Asiri kafein haplari / pre-workout" },
    risk: "high",
    details: { en: ">600mg/day: anxiety, heart palpitations, insomnia, dependency. Caffeine pills make overdose easy.", tr: ">600mg/gun: kaygı, çarpıntı, uykusuzluk, bağımlilik. Kafein haplari doz asimini kolaylaştırır." },
  },
  {
    name: { en: "Alcohol for stress relief", tr: "Stres giderici olarak alkol" },
    risk: "moderate",
    details: { en: "Disrupts REM sleep, impairs memory consolidation, depressive rebound, empty calories.", tr: "REM uykusunu bozar, hafiza pekistirmeyi engeller, depresif geri tepme, bos kaloriler." },
  },
  {
    name: { en: "Melatonin overuse", tr: "Asiri melatonin kullanimi" },
    risk: "low",
    details: { en: "Safe short-term (0.5-3mg). Long-term use may suppress natural production. Not addictive but can create dependency habit.", tr: "Kisa sureli güvenli (0.5-3mg). Uzun sureli kullanim doğal uretimi baskilayabilir. Bağımlilik yapmaz ama aliskanlik oluşturabilir." },
  },
  {
    name: { en: "Nootropics / 'smart drugs'", tr: "Nootropikler / 'akilli ilaclar'" },
    risk: "moderate",
    details: { en: "Most lack evidence. Racetams, modafinil: unregulated, unknown long-term effects. Omega-3, creatine: evidence-based and safe.", tr: "Çoğunun kanıtı yok. Rasetamlar, modafinil: duzenlemesiz, bilinmeyen uzun vadeli etkiler. Omega-3, kreatin: kanita dayali ve güvenli." },
  },
];

export default function StudentHealthPage() {
  const { isAuthenticated } = useAuth();
  const { lang } = useLang();
  const [expandedSection, setExpandedSection] = useState<number | null>(0);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">{tx("student.title", lang)}</h1>
          <p className="text-muted-foreground">{tx("common.loginToUse", lang)}</p>
          <Button onClick={() => window.location.href = "/auth/login"}>
            <LogIn className="w-4 h-4 mr-2" /> {tx("nav.login", lang)}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-4 py-1.5 rounded-full text-sm font-medium">
            <GraduationCap className="w-4 h-4" />
            {tx("student.title", lang)}
          </div>
          <h1 className="text-3xl font-bold">{tx("student.title", lang)}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">{tx("student.subtitle", lang)}</p>
        </div>

        {/* Stress & Wellness Sections */}
        {STRESS_TIPS.map((section, idx) => (
          <div key={idx} className="bg-card border rounded-2xl overflow-hidden">
            <button
              onClick={() => setExpandedSection(expandedSection === idx ? null : idx)}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <div className="flex items-center gap-3">
                {section.icon}
                <h2 className="text-xl font-semibold">{section.title[lang]}</h2>
              </div>
              {expandedSection === idx ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {expandedSection === idx && (
              <div className="px-6 pb-6 space-y-3">
                {section.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-200 dark:bg-indigo-800 text-xs font-bold text-indigo-800 dark:text-indigo-200 flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm">{item[lang]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Substance Risk Info */}
        <div className="bg-card border rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            {tx("student.substanceRisk", lang)}
          </h2>
          <div className="grid gap-4">
            {SUBSTANCE_RISKS.map((substance, i) => (
              <div
                key={i}
                className={`border rounded-xl p-4 space-y-2 ${
                  substance.risk === "high"
                    ? "border-red-200 dark:border-red-800"
                    : substance.risk === "moderate"
                    ? "border-amber-200 dark:border-amber-800"
                    : "border-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{substance.name[lang]}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      substance.risk === "high"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : substance.risk === "moderate"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    }`}
                  >
                    {substance.risk === "high"
                      ? tx("common.highRisk", lang)
                      : substance.risk === "moderate"
                      ? tx("common.moderateRisk", lang)
                      : tx("common.lowRisk", lang)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{substance.details[lang]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Crisis Line */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-6 text-center space-y-2">
          <Shield className="w-8 h-8 text-indigo-500 mx-auto" />
          <h3 className="font-semibold">
            {tx("student.needHelp", lang)}
          </h3>
          <p className="text-sm text-muted-foreground">
            {tx("student.campusCounseling", lang)}
          </p>
        </div>

        {/* Disclaimer */}
        <div className="text-center text-xs text-muted-foreground px-4">
          {tx("disclaimer.tool", lang)}
        </div>
      </div>
    </div>
  );
}
