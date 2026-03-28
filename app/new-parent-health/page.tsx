"use client";

import { useState } from "react";
import {
  Baby,
  Moon,
  Heart,
  AlertTriangle,
  Users,
  LogIn,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface Section {
  icon: React.ReactNode;
  title: { en: string; tr: string };
  color: string;
  items: { en: string; tr: string }[];
}

const SECTIONS: Section[] = [
  {
    icon: <Moon className="w-5 h-5 text-blue-500" />,
    title: { en: "Sleep Deprivation Management", tr: "Uyku Yoksunlugu Yönetimi" },
    color: "blue",
    items: [
      { en: "Sleep when baby sleeps — even 20-minute naps restore cognitive function", tr: "Bebek uyurken uyuyun — 20 dakikalik sekerlemeler bile bilissel işlevi onarir" },
      { en: "Split night shifts with partner: each person gets 1 uninterrupted 4-hour block", tr: "Gece nobetlerini es ile paylasin: her kisi 1 kesintisiz 4 saatlik blok uyusun" },
      { en: "Caffeine cutoff: no coffee after 2 PM if you want to sleep when baby sleeps at night", tr: "Kafein siniri: bebek gece uyurken uyumak istiyorsaniz saat 14:00'ten sonra kahve icmeyin" },
      { en: "Light exposure in morning (10 min bright light) helps reset disrupted circadian rhythm", tr: "Sabah isik maruziyeti (10 dk parlak isik) bozulmus sirkadyen ritmi sifirlar" },
      { en: "Accept 'good enough' sleep — perfection is the enemy of rest right now", tr: "Yeterli uykunun yeterli oldugunu kabul edin — mükemmeliyetcilik simdi dinlenmenin dusmanidir" },
      { en: "Room-darkening curtains help both parent and baby sleep during irregular hours", tr: "Karanlik perdeler hem ebeveynin hem de bebegin duzensiz saatlerde uyumasina yardımcı olur" },
    ],
  },
  {
    icon: <Heart className="w-5 h-5 text-rose-500" />,
    title: { en: "Back & Wrist Pain from Carrying Baby", tr: "Bebek Tasimaktan Kaynaklanan Sirt ve Bilek Ağrısi" },
    color: "rose",
    items: [
      { en: "Alternate arms frequently — repetitive strain on one side causes asymmetric pain", tr: "Kollarinizi sik sik degistirin — tek tarafta tekrarlayan zorlanma asimetrik ağrıya yol acar" },
      { en: "De Quervain's tenosynovitis ('mother's thumb'): support wrist during lifting, use entire hand", tr: "De Quervain tenosinoviti ('anne basparmaği'): kaldirirken bilegi destekleyin, tum eli kullanin" },
      { en: "Ergonomic feeding: support arms with pillows, keep spine neutral, feet flat on floor", tr: "Ergonomik besleme: kollarinizi yastikla destekleyin, omurga nötr, ayaklar yerde duz" },
      { en: "3x daily stretches: cat-cow, doorway chest opener, wrist flexor/extensor stretches", tr: "Günlük 3x esneme: kedi-inek, kapi göğüs acici, bilek fleksor/ekstensor esnemeleri" },
      { en: "Baby carrier with hip support distributes weight — reduces back strain by 40%", tr: "Kalca destekli bebek tasiyicisi agirligi dagitir — sirt zorlanmasini %40 azaltir" },
      { en: "If wrist pain persists 2+ weeks: see physiotherapist — splinting helps significantly", tr: "Bilek ağrısi 2+ hafta devam ederse: fizyoterapiste gidin — atel önemli ölçüde yardımcı olur" },
    ],
  },
  {
    icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    title: { en: "Burnout Screening (Self-Check)", tr: "Tukenmislik Taramasi (Oz Kontrol)" },
    color: "amber",
    items: [
      { en: "Feeling detached from baby or resentful of parenting tasks — this is common, not a failure", tr: "Bebekten kopuk hissetmek veya ebeveynlik gorevlerine icerlemek — bu yaygındır, başarısizlik degil" },
      { en: "Physical exhaustion that doesn't improve with rest — could signal postpartum depression", tr: "Dinlenmekle duzelmeynen fiziksel bitkinlik — dogum sonrasi depresyon belirtisi olabilir" },
      { en: "Crying for no reason, persistent sadness > 2 weeks — talk to your OB/GYN", tr: "Sebepsiz aglama, 2 haftadan uzun sureli uzuntu — kadin dogum uzmaninizla konusun" },
      { en: "Edinburgh Postnatal Depression Scale (EPDS): score > 12 = seek professional support", tr: "Edinburgh Dogum Sonrasi Depresyon Ölçeği (EPDS): skor > 12 = profesyonel destek alin" },
      { en: "Rage episodes, intrusive thoughts about harm — these require IMMEDIATE professional help", tr: "Ofke nöbetleri, zarar verme dusunceleri — bunlar ACIL profesyonel yardim gerektirir" },
      { en: "Paternal postnatal depression exists too — fathers should also self-screen", tr: "Babalarda dogum sonrasi depresyon da vardir — babalar da kendilerini tarsin" },
    ],
  },
  {
    icon: <Users className="w-5 h-5 text-indigo-500" />,
    title: { en: "Partner Stress Tips", tr: "Es Stresi Önerileri" },
    color: "indigo",
    items: [
      { en: "Schedule 'check-in' conversations: 10 min/day about how each person is FEELING, not logistics", tr: "'Durum kontrolü' konusmalari planlayın: gunluk 10 dk her kisinin NASIL HISSETTIGINI konusun, lojistik degil" },
      { en: "Divide tasks explicitly — unspoken expectations breed resentment", tr: "Gorevleri acikca bolun — soylenmemis beklentiler kin yaratir" },
      { en: "Physical intimacy timeline varies: 6 weeks minimum post-birth, but emotional readiness is personal", tr: "Fiziksel yakinlik sureci degisir: dogumdan sonra minimum 6 hafta, ama duygusal hazirlik kişiseldir" },
      { en: "Individual time is not selfish: each parent needs 2-3 hours/week of personal time", tr: "Bireysel zaman bencillik degildir: her ebeveynin haftada 2-3 saat kişisel zamana ihtiyaci vardir" },
      { en: "Ask for help from family/friends — specific requests ('bring dinner Tuesday') work better than vague ones", tr: "Aile/arkadaslardan yardim isteyin — belirli istekler ('sali aksamyemegi getirin') belirsiz olanlardan daha iyi calisir" },
      { en: "If arguing increases significantly, couples counseling early prevents larger problems", tr: "Tartismalar önemli ölçüde artarsa, erken cift terapisi daha buyuk sorunları onler" },
    ],
  },
];

const BURNOUT_QUESTIONS: { en: string; tr: string }[] = [
  { en: "I feel physically exhausted even after sleeping", tr: "Uyuduktan sonra bile fiziksel olarak bitkin hissediyorum" },
  { en: "I feel emotionally distant from my baby", tr: "Bebeğimden duygusal olarak uzak hissediyorum" },
  { en: "I have persistent sadness or crying spells", tr: "Surekli uzuntu veya aglama nöbetlerim var" },
  { en: "I feel resentful about parenting responsibilities", tr: "Ebeveynlik sorumluluklarindan dolayi icerliyorum" },
  { en: "I have difficulty concentrating on simple tasks", tr: "Basit gorevlere odaklanmakta zorluk cekiyorum" },
  { en: "I feel isolated from friends and social life", tr: "Arkadaslarimdan ve sosyal hayattan kopuk hissediyorum" },
  { en: "I have lost interest in things I used to enjoy", tr: "Eskiden zevk aldigim seylerle ilgimi kaybettim" },
  { en: "I feel angry or irritable without clear reason", tr: "Belirgin bir neden olmadan sinirli veya asabi hissediyorum" },
];

export default function NewParentHealthPage() {
  const { isAuthenticated } = useAuth();
  const { lang } = useLang();
  const [expandedSection, setExpandedSection] = useState<number | null>(0);
  const [burnoutAnswers, setBurnoutAnswers] = useState<boolean[]>(Array(BURNOUT_QUESTIONS.length).fill(false));
  const [showBurnoutResult, setShowBurnoutResult] = useState(false);

  const burnoutScore = burnoutAnswers.filter(Boolean).length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">{tx("newparent.title", lang)}</h1>
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
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-4 py-1.5 rounded-full text-sm font-medium">
            <Baby className="w-4 h-4" />
            {tx("newparent.title", lang)}
          </div>
          <h1 className="text-3xl font-bold">{tx("newparent.title", lang)}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">{tx("newparent.subtitle", lang)}</p>
        </div>

        {/* Focus Note */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 text-center">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {lang === "tr"
              ? "Bu sayfa EBEVEYN sağlığına odaklanir. Bebek sağlığı için Cocuk Sagligi modulune gidin."
              : "This page focuses on PARENT health. For baby health, visit the Child Health module."}
          </p>
          <Button
            variant="link"
            onClick={() => window.location.href = "/child-health"}
            className="text-blue-600 dark:text-blue-400 mt-1"
          >
            {lang === "tr" ? "Cocuk Sagligi" : "Child Health"} <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Sections */}
        {SECTIONS.map((section, idx) => (
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
                  <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-200 dark:bg-blue-800 text-xs font-bold text-blue-800 dark:text-blue-200 flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm">{item[lang]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Burnout Self-Assessment */}
        <div className="bg-card border rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            {lang === "tr" ? "Tukenmislik Oz Değerlendirmesi" : "Burnout Self-Assessment"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {lang === "tr"
              ? "Son 2 haftayi dusunun. Asagidakilerden hangileri gecerli?"
              : "Think about the last 2 weeks. Which of the following apply?"}
          </p>
          <div className="grid gap-2">
            {BURNOUT_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => {
                  const newAnswers = [...burnoutAnswers];
                  newAnswers[i] = !newAnswers[i];
                  setBurnoutAnswers(newAnswers);
                  setShowBurnoutResult(false);
                }}
                className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                  burnoutAnswers[i]
                    ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                    : "bg-muted/50 hover:bg-muted"
                }`}
              >
                {burnoutAnswers[i] ? (
                  <CheckCircle2 className="w-5 h-5 text-amber-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
                <span className="text-sm">{q[lang]}</span>
              </button>
            ))}
          </div>
          <Button
            onClick={() => setShowBurnoutResult(true)}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            {lang === "tr" ? "Değerlendirmeyi Gor" : "See Assessment"}
          </Button>
          {showBurnoutResult && (
            <div
              className={`rounded-xl p-4 ${
                burnoutScore >= 5
                  ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 border"
                  : burnoutScore >= 3
                  ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 border"
                  : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 border"
              }`}
            >
              <p className="font-semibold">
                {lang === "tr" ? `Skor: ${burnoutScore}/8` : `Score: ${burnoutScore}/8`}
              </p>
              <p className="text-sm mt-1">
                {burnoutScore >= 5
                  ? lang === "tr"
                    ? "Yüksek tukenmislik belirtileri. Bir sağlık uzmanina danismaniz onerilir."
                    : "High burnout indicators. We recommend speaking to a healthcare provider."
                  : burnoutScore >= 3
                  ? lang === "tr"
                    ? "Orta duzeyde stres belirtileri. Kendinize zaman ayirmaya oncelik verin."
                    : "Moderate stress indicators. Prioritize self-care and personal time."
                  : lang === "tr"
                  ? "Düşük tukenmislik belirtileri. Kendinize bakmaya devam edin!"
                  : "Low burnout indicators. Keep taking care of yourself!"}
              </p>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="text-center text-xs text-muted-foreground px-4">
          {tx("disclaimer.tool", lang)}
        </div>
      </div>
    </div>
  );
}
