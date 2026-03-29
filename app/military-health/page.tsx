"use client";

import { useState } from "react";
import {
  Shield,
  Syringe,
  Pill,
  Dumbbell,
  Heart,
  CheckCircle2,
  Circle,
  LogIn,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface ChecklistItem {
  id: string;
  label: { en: string; tr: string };
  done: boolean;
}

const PREP_CHECKLIST: Omit<ChecklistItem, "done">[] = [
  { id: "med_report", label: { en: "Get comprehensive medical report from family doctor", tr: "Aile hekiminden kapsamli sağlık raporu alin" } },
  { id: "dental", label: { en: "Complete all dental work (fillings, wisdom teeth)", tr: "Tum dis işlemlerini tamamlayın (dolgular, yirmi yaslik disler)" } },
  { id: "eye_exam", label: { en: "Eye examination and updated prescription if needed", tr: "Goz muayenesi ve gerekiyorsa reçete güncellemesi" } },
  { id: "blood_test", label: { en: "Full blood panel (CBC, metabolic, thyroid, Vitamin D)", tr: "Tam kan paneli (hemogram, metabolik, tiroid, D vitamini)" } },
  { id: "vaccines", label: { en: "Vaccination records up to date (see list below)", tr: "Asi kayıtlari guncel (asagidaki listeye bakin)" } },
  { id: "chronic_meds", label: { en: "3-month supply of chronic medications + doctor letter", tr: "Kronik ilaçların 3 aylik tedariği + doktor raporu" } },
  { id: "allergy_doc", label: { en: "Document all allergies (medications, food, environmental)", tr: "Tum alerjileri belgeleyin (ilac, gida, cevresel)" } },
  { id: "mental_screen", label: { en: "Mental health screening — address anxiety/depression before service", tr: "Ruh sağlığı taramasi — hizmet öncesi kaygı/depresyonu ele alin" } },
  { id: "fitness_test", label: { en: "Baseline fitness assessment (VO2 max, strength benchmarks)", tr: "Temel fiziksel değerlendirme (VO2 max, kuvvet ölçümleri)" } },
  { id: "skin_check", label: { en: "Dermatology check — pre-existing skin conditions documented", tr: "Dermatoloji kontrolü — mevcut cilt rahatsizliklari belgeleyin" } },
];

interface VaccineInfo {
  name: { en: string; tr: string };
  required: boolean;
  note: { en: string; tr: string };
}

const VACCINATIONS: VaccineInfo[] = [
  { name: { en: "Tetanus-Diphtheria-Pertussis (Tdap)", tr: "Tetanoz-Difteri-Bogmaca (Tdap)" }, required: true, note: { en: "Booster every 10 years, required for all", tr: "Her 10 yilda rapel, herkes için zorunlu" } },
  { name: { en: "Hepatitis A", tr: "Hepatit A" }, required: true, note: { en: "2-dose series if not previously vaccinated", tr: "Daha once asilanmadiysa 2 doz seri" } },
  { name: { en: "Hepatitis B", tr: "Hepatit B" }, required: true, note: { en: "3-dose series, check antibody titer", tr: "3 doz seri, antikor titresi kontrol edin" } },
  { name: { en: "Meningococcal (ACWY)", tr: "Meningokok (ACWY)" }, required: true, note: { en: "Required for communal living environments", tr: "Topluluk yasam ortamlari için zorunlu" } },
  { name: { en: "Influenza (seasonal)", tr: "Influenza (mevsimsel)" }, required: true, note: { en: "Annual vaccination, especially important in barracks", tr: "Yıllık asilama, ozellikle kisla ortaminda önemli" } },
  { name: { en: "COVID-19 (updated booster)", tr: "COVID-19 (guncel rapel)" }, required: false, note: { en: "Recommended, especially for group settings", tr: "Özellikle grup ortamlari için onerilen" } },
  { name: { en: "Varicella (Chickenpox)", tr: "Varisella (Sucicegi)" }, required: false, note: { en: "If no history of disease or vaccination", tr: "Hastalık veya asilama geçmişi yoksa" } },
  { name: { en: "MMR (Measles-Mumps-Rubella)", tr: "KKK (Kizamik-Kabakulak-Kızamıkçık)" }, required: false, note: { en: "2 doses if born after 1980 without immunity proof", tr: "1980 sonrasi doğumlu ve bağışıklik kanıtı yoksa 2 doz" } },
];

interface Section {
  icon: React.ReactNode;
  title: { en: string; tr: string };
  items: { en: string; tr: string }[];
}

const SECTIONS: Section[] = [
  {
    icon: <Pill className="w-5 h-5 text-blue-500" />,
    title: { en: "Chronic Medication Supply Planning", tr: "Kronik İlaç Tedarik Planlamasi" },
    items: [
      { en: "Get a military medical board letter documenting all chronic conditions and medications", tr: "Tum kronik hastalıklari ve ilaçları belgeleyen askeri sağlık kurulu raporu alin" },
      { en: "Request 90-day supply from your doctor before service", tr: "Hizmetten once doktorunuzdan 90 gunluk tedarik isteyin" },
      { en: "Carry medications in original packaging with pharmacy labels", tr: "İlaçlari eczane etiketli orijinal ambalajinda tasiyin" },
      { en: "Insulin/temperature-sensitive meds: request cold chain transport arrangements", tr: "Insulin/sicakliga duyarlı ilaclar: soguk zincir tasima duzenlemesi isteyin" },
      { en: "Mental health medications: do NOT stop abruptly — discuss tapering with your doctor", tr: "Ruh sağlığı ilaçları: aniden kesmeyin — doktorunuzla azaltmayi görüşün" },
      { en: "Keep a medication card in your wallet: drug name, dose, frequency, prescribing doctor", tr: "Cuzdaninizda ilac karti bulundurun: ilac adi, doz, siklik, reçete yazan doktor" },
    ],
  },
  {
    icon: <Dumbbell className="w-5 h-5 text-green-500" />,
    title: { en: "Physical Preparation Guide", tr: "Fiziksel Hazirlik Rehberi" },
    items: [
      { en: "Start 8-12 weeks before service — progressive overload, avoid injury", tr: "Hizmetten 8-12 hafta once başlayin — kademeli artis, sakatlanktan kacinin" },
      { en: "Focus on: running endurance (5K-10K), push-ups, sit-ups, pull-ups", tr: "Odaklanin: kosu dayanikliligi (5K-10K), sinav, mekik, baris" },
      { en: "Rucking: start with 10kg, increase 2kg/week — builds functional endurance", tr: "Ağırlıkli yuruyus: 10kg ile başlayin, haftalik 2kg artirin — fonksiyonel dayaniklilik gelistirir" },
      { en: "Foot care: break in boots 4+ weeks before, moisture-wicking socks, blister prevention", tr: "Ayak bakimi: botlari 4+ hafta once alistierin, nemi uzaklastiran coraplar, su toplamasini onleyin" },
      { en: "Nutrition: increase protein to 1.6g/kg, complex carbs, hydration 3L/day minimum", tr: "Beslenme: proteini 1.6g/kg'a cikarin, kompleks karbonhidratlar, min 3L/gun hidrasyon" },
      { en: "Sleep: establish 22:00-06:00 cycle now — military schedule starts early", tr: "Uyku: simdi 22:00-06:00 döngüsü kurun — askeri program erken başlar" },
    ],
  },
  {
    icon: <Heart className="w-5 h-5 text-rose-500" />,
    title: { en: "Post-Service Adaptation Tips", tr: "Hizmet Sonrasi Uyum Önerileri" },
    items: [
      { en: "Gradual transition: give yourself 2-4 weeks to readjust to civilian routine", tr: "Kademeli gecis: sivil rutine yeniden uyum için kendinize 2-4 hafta taniyin" },
      { en: "Physical detraining: reduce volume 30% per week, don't stop completely", tr: "Fiziksel antrenman azaltma: hacmi haftada %30 azaltin, tamamen birakmayin" },
      { en: "Sleep adjustment may take 1-2 weeks — use light exposure and melatonin timing", tr: "Uyku uyumu 1-2 hafta alabilir — isik maruziyeti ve melatonin zamanlamasiyla destekleyin" },
      { en: "Watch for: persistent irritability, nightmares, hypervigilance — talk to a professional", tr: "Dikkat: surekli sinirlilik, kabus, asiri tedbirlilik — bir uzmana danışın" },
      { en: "Social reintegration: reconnect gradually, share experiences at your own pace", tr: "Sosyal yeniden entegrasyon: kademeli baglanin, deneyimleri kendi hizinizda paylasin" },
      { en: "Free PTSD screening available — early intervention is critical", tr: "Ucretsiz PTSD taramasi mevcut — erken mudahale kritik oneme sahiptir" },
    ],
  },
];

export default function MilitaryHealthPage() {
  const { isAuthenticated } = useAuth();
  const { lang } = useLang();
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    PREP_CHECKLIST.map((item) => ({ ...item, done: false }))
  );
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const toggleItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const completedCount = checklist.filter((i) => i.done).length;
  const progress = Math.round((completedCount / checklist.length) * 100);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">{tx("military.title", lang)}</h1>
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
          <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-1.5 rounded-full text-sm font-medium">
            <Shield className="w-4 h-4" />
            {tx("military.title", lang)}
          </div>
          <h1 className="text-3xl font-bold">{tx("military.title", lang)}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">{tx("military.subtitle", lang)}</p>
        </div>

        {/* Health Prep Checklist */}
        <div className="bg-card border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              {lang === "tr" ? "Sağlık Hazirlik Kontrol Listesi" : "Health Preparation Checklist"}
            </h2>
            <span className="text-sm font-medium text-muted-foreground">{progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-green-500 rounded-full h-2 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="grid gap-2">
            {checklist.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                  item.done
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                    : "bg-muted/50 hover:bg-muted"
                }`}
              >
                {item.done ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
                <span className={item.done ? "line-through opacity-70 text-sm" : "text-sm"}>
                  {item.label[lang]}
                </span>
              </button>
            ))}
          </div>
          {progress === 100 && (
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-700 dark:text-green-400 font-medium">
              {lang === "tr" ? "Tum sağlık hazirliklari tamamlandi!" : "All health preparations complete!"}
            </div>
          )}
        </div>

        {/* Vaccinations */}
        <div className="bg-card border rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Syringe className="w-5 h-5 text-blue-500" />
            {lang === "tr" ? "Gerekli ve Onerilen Asilar" : "Required & Recommended Vaccinations"}
          </h2>
          <div className="grid gap-3">
            {VACCINATIONS.map((vax, i) => (
              <div
                key={i}
                className={`border rounded-xl p-4 ${
                  vax.required
                    ? "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10"
                    : "border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-sm">{vax.name[lang]}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      vax.required
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {vax.required
                      ? lang === "tr" ? "Zorunlu" : "Required"
                      : lang === "tr" ? "Onerilen" : "Recommended"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{vax.note[lang]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Expandable Sections */}
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
                  <div key={i} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-200 dark:bg-green-800 text-xs font-bold text-green-800 dark:text-green-200 flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm">{item[lang]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Disclaimer */}
        <div className="text-center text-xs text-muted-foreground px-4">
          {tx("disclaimer.tool", lang)}
        </div>
      </div>
    </div>
  );
}
