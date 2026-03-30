"use client";

import { useState } from "react";
import { Shield, ChevronDown, ChevronUp, CreditCard, Stethoscope, Pill, TestTube, Heart } from "lucide-react";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface AccordionSection {
  id: string;
  icon: React.ReactNode;
  titleEn: string;
  titleTr: string;
  contentEn: string[];
  contentTr: string[];
}

const SECTIONS: AccordionSection[] = [
  {
    id: "sgk",
    icon: <Shield className="w-5 h-5" />,
    titleEn: "SGK (Social Security) Coverage",
    titleTr: "SGK Kapsamı",
    contentEn: [
      "SGK covers most prescription medications, with varying copay rates (0-20%).",
      "Hospital visits at public hospitals are covered with minimal copay.",
      "Specialist referrals require a general practitioner (family doctor) referral first.",
      "Emergency visits are always covered regardless of hospital type.",
      "Dental care: extractions and basic procedures covered, cosmetic not covered.",
      "Eye exams covered, glasses frames partially covered (with prescription).",
      "Physical therapy: up to 30 sessions per year with referral.",
      "Mental health: psychiatry covered, psychology sessions limited.",
    ],
    contentTr: [
      "SGK cogu receteli ilaçları farklı katilim paylariyla kapsar (%0-20).",
      "Devlet hastanelerinde poliklinik ziyaretleri minimal katilim payiyla kapsanir.",
      "Uzman yönlendirmesi için once aile hekiminden sevk gerekir.",
      "Acil servis ziyaretleri hastane türüne bakilmaksizin her zaman kapsanir.",
      "Dis bakim: cekim ve temel işlemler kapsanir, estetik kapsanmaz.",
      "Goz muayenesi kapsanir, gozluk cercevesi kismi olarak kapsanir (receteli).",
      "Fizik tedavi: sevkle yilda 30 seansa kadar.",
      "Ruh sağlığı: psikiyatri kapsanir, psikoloji seanslari sinirlidir.",
    ],
  },
  {
    id: "copay",
    icon: <CreditCard className="w-5 h-5" />,
    titleEn: "Copay (Katilim Payi) Rates",
    titleTr: "Katilim Paylari",
    contentEn: [
      "Family doctor (1st step): No copay for examination.",
      "State hospital (2nd step): 0-5 TL copay.",
      "University hospital (3rd step): Higher copay, referral needed.",
      "Private hospital (with SGK agreement): 200+ TL additional fee typical.",
      "Medications: 10-20% copay depending on drug category.",
      "Red prescriptions (controlled): different copay schedule.",
      "Chronic illness medications: reduced copay rates.",
      "Retirees: reduced or zero copay for many services.",
    ],
    contentTr: [
      "Aile hekimi (1. basamak): Muayene için katilim payi yok.",
      "Devlet hastanesi (2. basamak): 0-5 TL katilim payi.",
      "Universite hastanesi (3. basamak): Daha yüksek katilim payi, sevk gerekir.",
      "Özel hastane (SGK anlasmali): Tipik olarak 200+ TL ek ucret.",
      "İlaçlar: İlaç kategorisine gore %10-20 katilim payi.",
      "Kirmizi receteler (kontrollü): farklı katilim payi tarifesi.",
      "Kronik hastalık ilaçları: indirimli katilim payi.",
      "Emekliler: bircok hizmette indirimli veya sifir katilim payi.",
    ],
  },
  {
    id: "checkup",
    icon: <TestTube className="w-5 h-5" />,
    titleEn: "Free Check-up Coverage",
    titleTr: "Ucretsiz Check-up Kapsami",
    contentEn: [
      "Annual free check-up available at family health centers (ASM).",
      "Includes: blood count, blood sugar, cholesterol, urine test.",
      "Cancer screenings: mammography (40+), smear test (30+), colon cancer (50+).",
      "Bone density scan covered for women 65+ or with risk factors.",
      "Vaccination schedule covered for all ages.",
      "Child health check-ups: regular schedule from birth to 18.",
      "Pregnancy follow-ups: all visits and standard tests covered.",
    ],
    contentTr: [
      "Aile sağlık merkezlerinde (ASM) yillik ucretsiz check-up.",
      "Icerir: kan sayimi, kan sekeri, kolesterol, idrar testi.",
      "Kanser taramalari: mamografi (40+), smear testi (30+), kolon kanseri (50+).",
      "Kemik yogunlugu taramasi 65+ veya risk faktorlu kadinlarda kapsanir.",
      "Asi takvimi tum yaslara ucretsiz.",
      "Cocuk sağlığı kontrolleri: dogumdan 18 yasina duzeli takvim.",
      "Gebelik takipleri: tum ziyaretler ve standart testler kapsanir.",
    ],
  },
  {
    id: "private",
    icon: <Heart className="w-5 h-5" />,
    titleEn: "Private Insurance (Ozel Sigorta)",
    titleTr: "Özel Sağlık Sigortasi",
    contentEn: [
      "Complements SGK — covers private hospital visits with less or no copay.",
      "Average cost: 3,000-15,000 TL/year depending on age and coverage.",
      "Top providers: Acibadem Sigorta, Allianz, Axa, Mapfre, Anadolu Sigorta.",
      "Pre-existing conditions: usually excluded for 1-2 years.",
      "Dental and optical: often separate rider/add-on needed.",
      "International coverage: some plans include EU/worldwide.",
      "Tax deduction: premiums can be partially deducted (up to limits).",
      "Compare plans at sigortam.net or sigortaladim.com.",
    ],
    contentTr: [
      "SGK'yi tamamlar — ozel hastane ziyaretlerini az veya sifir katilim payiyla kapsar.",
      "Ortalama maliyet: yas ve kapsama gore yillik 3.000-15.000 TL.",
      "Oncu sirketler: Acibadem Sigorta, Allianz, Axa, Mapfre, Anadolu Sigorta.",
      "Mevcut hastalıklar: genellikle 1-2 yil haric tutulur.",
      "Dis ve goz: cogunlukla ayri ek paket gerektirir.",
      "Uluslararasi kapsam: bazi planlar AB/dünya genelini icerir.",
      "Vergi indirimi: primler kismi olarak dusulebilir (limitler dahilinde).",
      "Planlari sigortam.net veya sigortaladim.com'da karşılastirin.",
    ],
  },
  {
    id: "medications",
    icon: <Pill className="w-5 h-5" />,
    titleEn: "Medication Coverage Tips",
    titleTr: "İlaç Kapsami Ipuclari",
    contentEn: [
      "Generic medications have lower copay than brand-name drugs.",
      "Ask your doctor to prescribe generics when available.",
      "Some vitamins and supplements are NOT covered by SGK.",
      "Chronic medication: get 3-month prescriptions to save on pharmacy visits.",
      "Pharmacy apps (ilaç Takip Sistemi) help track your prescriptions.",
      "Some medications need pre-approval (ön onay) — your doctor handles this.",
    ],
    contentTr: [
      "Jenerik ilaclar marka ilaclardan daha düşük katilim payina sahiptir.",
      "Mevcut olduğunda doktorunuzdan jenerik yazmasi isteyin.",
      "Bazi vitamin ve takviyeler SGK tarafindan KAPSANMAZ.",
      "Kronik ilac: eczane ziyaretlerinden tasarruf için 3 aylik recete alin.",
      "Eczane uygulamalari (Ilac Takip Sistemi) recetelerinizi takip etmenize yardımcı olur.",
      "Bazi ilaclar on onay gerektirir — doktorunuz bunu halledecektir.",
    ],
  },
];

export default function InsuranceGuidePage() {
  const { lang } = useLang();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ sgk: true });

  const toggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tx("insurance.title", lang)}</h1>
          <p className="text-gray-600 dark:text-gray-400">{tx("insurance.subtitle", lang)}</p>
        </div>

        {/* Accordion Sections */}
        <div className="space-y-3">
          {SECTIONS.map((s) => (
            <div key={s.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-blue-100 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => toggle(s.id)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="text-blue-600 dark:text-blue-400">{s.icon}</div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    {s[lang === "tr" ? "titleTr" : "titleEn"]}
                  </h2>
                </div>
                {expanded[s.id]
                  ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
              </button>
              {expanded[s.id] && (
                <div className="px-5 pb-5">
                  <ul className="space-y-2.5">
                    {(s[lang === "tr" ? "contentTr" : "contentEn"]).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300 text-sm">
                        <span className="text-blue-500 mt-0.5 flex-shrink-0">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {tx("insurance.disclaimerNote", lang)}
          </p>
        </div>
      </div>
    </div>
  );
}
