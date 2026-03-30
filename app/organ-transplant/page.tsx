"use client";

import { useState } from "react";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Pill,
  Apple,
  CalendarCheck,
  Smile,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Clock,
  Ban,
  Heart,
} from "lucide-react";

interface Section {
  id: string;
  icon: React.ReactNode;
  titleEN: string;
  titleTR: string;
  badgeEN?: string;
  badgeTR?: string;
  badgeColor?: string;
  items: { en: string; tr: string; warning?: boolean }[];
}

const sections: Section[] = [
  {
    id: "medications",
    icon: <Pill className="w-5 h-5" />,
    titleEN: "Immunosuppressive Medication Compliance",
    titleTR: "Immunsupresif İlaç Uyumu",
    badgeEN: "Critical",
    badgeTR: "Kritik",
    badgeColor: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    items: [
      { en: "Take immunosuppressants at EXACTLY the same times every day (e.g., 8AM and 8PM)", tr: "Immunsupresif ilaçları her gun TAM OLARAK ayni saatlerde alin (orn. 08:00 ve 20:00)", warning: true },
      { en: "Tacrolimus: take on empty stomach, 1 hour before or 2 hours after food", tr: "Takrolimus: ac karnina, yemekten 1 saat once veya 2 saat sonra alin" },
      { en: "Mycophenolate: can cause GI upset — take with food if needed", tr: "Mikofenolat: mide rahatsizligi yapabilir — gerekirse yemekle alin" },
      { en: "Prednisone: take in morning with food to reduce stomach irritation", tr: "Prednizon: mide tahrisi azaltmak için sabah yemekle alin" },
      { en: "NEVER skip a dose — even one missed dose increases rejection risk", tr: "ASLA doz atlamayin — tek bir atlanan doz bile red riskini arttırır", warning: true },
      { en: "If you miss a dose: take it within 2 hours, otherwise skip and take next on time", tr: "Doz kacirirseniz: 2 saat icinde alin, yoksa atlayin ve bir sonrakini zamaninda alin" },
      { en: "Keep a medication diary — record time taken, side effects, and blood levels", tr: "İlaç günlüğü tutun — alinan saat, yan etkiler ve kan düzeyleri kaydedin" },
      { en: "Drug level monitoring: tacrolimus levels checked weekly initially, then monthly", tr: "İlaç düzeyi izleme: takrolimus düzeyleri başlangıçta haftalik, sonra aylik kontrol" },
      { en: "St. John's Wort is DANGEROUS — it reduces immunosuppressant levels dramatically", tr: "Sari Kantaron TEHLIKELIDIR — immunsupresif ilac düzeylerini dramatik olarak dusurur", warning: true },
      { en: "Grapefruit and pomelo INCREASE tacrolimus levels — avoid completely", tr: "Greyfurt ve pomelo takrolimus düzeylerini ARTTIRIR — tamamen kacinmayin", warning: true },
      { en: "Report fever, pain over transplant site, or reduced urine output immediately", tr: "Ates, nakil bolgesinde ağrı veya azalmis idrar cikisini hemen bildirin", warning: true },
    ],
  },
  {
    id: "infection",
    icon: <Shield className="w-5 h-5" />,
    titleEN: "Infection Prevention Guide",
    titleTR: "Enfeksiyon Onleme Rehberi",
    badgeEN: "High Priority",
    badgeTR: "Yüksek Oncelik",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    items: [
      { en: "Wash hands frequently with soap for 20+ seconds — your #1 defense", tr: "Ellerinizi 20+ saniye sabunla sik sik yikayin — en önemli savunmaniz" },
      { en: "Avoid crowded indoor spaces for first 3-6 months post-transplant", tr: "Nakil sonrasi ilk 3-6 ay kapali kalabalik alanlardan kacinin" },
      { en: "Wear a mask in hospitals, clinics, and during flu season", tr: "Hastanelerde, kliniklerde ve grip mevsiminde maske takin" },
      { en: "Avoid gardening or soil contact without gloves — risk of fungal infections", tr: "Eldivensiz bahce isi veya toprak temasi — mantar enfeksiyonu riski" },
      { en: "No live vaccines (MMR, varicella, oral polio) — discuss all vaccines with transplant team", tr: "Canli asi yaptirilmaz (KKK, suicegi, oral polio) — tum asilari nakil ekibiyle görüşün" },
      { en: "Dental care: prophylactic antibiotics before dental procedures", tr: "Dis bakimi: dis işlemlerinden once profilaktik antibiyotik" },
      { en: "Avoid swimming in lakes, rivers, or public pools for first 6 months", tr: "Ilk 6 ay gollerde, nehirlerde veya halka acik havuzlarda yuzmeyin" },
      { en: "Pet safety: avoid cleaning cat litter (toxoplasmosis risk), bird cages", tr: "Evcil hayvan güvenligi: kedi kumu temizlemeyin (toksoplazmoz riski), kus kafesleri" },
      { en: "Sun protection: immunosuppressants increase skin cancer risk — SPF 50+ daily", tr: "Gunes korumasi: immunsupresifler cilt kanseri riskini arttırır — gunluk SPF 50+" },
      { en: "CMV and EBV monitoring is routine — attend all follow-up blood tests", tr: "CMV ve EBV izleme rutindir — tum kontrol kan testlerine gidin" },
    ],
  },
  {
    id: "food",
    icon: <Apple className="w-5 h-5" />,
    titleEN: "Food Restrictions & Safety",
    titleTR: "Gida Kisitlamalari ve Güvenligi",
    badgeEN: "Strict Diet",
    badgeTR: "Siki Diyet",
    badgeColor: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    items: [
      { en: "NO raw or undercooked meat, poultry, fish, or eggs — infection risk", tr: "CIG veya az pismis et, kumes hayvani, balik veya yumurta YOK — enfeksiyon riski", warning: true },
      { en: "NO unpasteurized dairy products (soft cheeses, raw milk)", tr: "Pastorize edilmemis sut urunleri YOK (yumusak peynirler, cig sut)", warning: true },
      { en: "NO grapefruit, pomelo, or Seville oranges — they alter drug levels", tr: "Greyfurt, pomelo veya Türüncu portakal YOK — ilac düzeylerini degistirirler", warning: true },
      { en: "Wash all fruits and vegetables thoroughly before eating", tr: "Tum meyve ve sebzeleri yemeden once iyice yikayin" },
      { en: "Avoid buffets and salad bars — food temperature control is uncertain", tr: "Acik bufe ve salata barlarindan kacinin — gida sicakligi kontrolü belirsizdir" },
      { en: "Cook all foods to safe internal temperatures (chicken 74C, beef 71C)", tr: "Tum gıdalari güvenli ic sicakliga pisirin (tavuk 74C, et 71C)" },
      { en: "Avoid raw sprouts (alfalfa, bean sprouts) — high bacterial contamination risk", tr: "Cig filizlerden kacinin (yonca, fasulye filizi) — yüksek bakteri kontaminasyon riski" },
      { en: "Tap water is generally safe but consider filtered water in first months", tr: "Cesme suyu genellikle güvenlidir ancak ilk aylarda filtrelenmis su dusunun" },
      { en: "Limit sodium to <2g/day if on prednisone — it causes fluid retention", tr: "Prednizon kullaniyorsaniz sodyumu <2g/gun ile sinirlayin — sivi tutulumuna neden olur" },
      { en: "High-protein diet (1.3-1.5 g/kg/day) to counter prednisone muscle wasting", tr: "Prednizon kas erimesine karsi yüksek proteinli diyet (1.3-1.5 g/kg/gun)" },
      { en: "Calcium + Vitamin D supplementation to prevent steroid-induced osteoporosis", tr: "Steroide bagli osteoporoz onleme için Kalsiyum + D vitamini takviyesi" },
    ],
  },
  {
    id: "schedule",
    icon: <CalendarCheck className="w-5 h-5" />,
    titleEN: "Follow-Up & Control Schedule",
    titleTR: "Takip ve Kontrol Programı",
    badgeEN: "Ongoing",
    badgeTR: "Surekli",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    items: [
      { en: "Week 1-4: Blood tests 2-3 times per week, clinic visit weekly", tr: "Hafta 1-4: Haftada 2-3 kez kan testi, haftalik klinik ziyareti" },
      { en: "Month 2-3: Blood tests weekly, clinic visit every 2 weeks", tr: "Ay 2-3: Haftalık kan testi, 2 haftada bir klinik ziyareti" },
      { en: "Month 4-6: Blood tests every 2 weeks, monthly clinic visit", tr: "Ay 4-6: 2 haftada bir kan testi, aylik klinik ziyareti" },
      { en: "Month 7-12: Monthly blood tests and clinic visits", tr: "Ay 7-12: Aylik kan testleri ve klinik ziyaretleri" },
      { en: "Year 2+: Every 2-3 months for stable patients", tr: "Yil 2+: Stabil hastalar için her 2-3 ayda bir" },
      { en: "Annual screening: skin cancer check, cardiovascular assessment, bone density", tr: "Yıllık tarama: cilt kanseri kontrolü, kardiyovasküler değerlendirme, kemik yogunlugu" },
      { en: "Kidney transplant: serum creatinine and GFR monitored at every visit", tr: "Bobrek nakli: her ziyarette serum kreatinin ve GFR izleme" },
      { en: "Liver transplant: liver function tests (ALT, AST, bilirubin) at every visit", tr: "Karaciger nakli: her ziyarette karaciğer fonksiyon testleri (ALT, AST, bilirubin)" },
      { en: "Report any illness, fever, or new medication to your transplant team", tr: "Herhangi bir hastalık, ates veya yeni ilacı nakil ekibinize bildirin" },
      { en: "Keep transplant center contact number accessible at all times", tr: "Nakil merkezi iletisim numarasini her zaman ulasılabilir tutun" },
    ],
  },
  {
    id: "quality",
    icon: <Smile className="w-5 h-5" />,
    titleEN: "Quality of Life & Wellbeing",
    titleTR: "Yasam Kalitesi ve Iyilik Hali",
    badgeEN: "Holistic",
    badgeTR: "Butunsel",
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    items: [
      { en: "Exercise: start with walking, gradually increase to 30 min/day, 5 days/week", tr: "Egzersiz: yuruyusle başlayin, kademeli olarak haftada 5 gun 30 dk'ya cikin" },
      { en: "Return to work: most patients can return 3-6 months post-transplant", tr: "Ise donus: cogu hasta nakil sonrasi 3-6 ayda ise donebilir" },
      { en: "Driving: usually allowed after 4-6 weeks if medically stable", tr: "Arac kullanma: tibbi olarak stabil ise genellikle 4-6 hafta sonra izin verilir" },
      { en: "Sexual health: discuss contraception — some immunosuppressants are teratogenic", tr: "Cinsel sağlık: korunmayi görüşün — bazi immunsupresifler teratojeniktir" },
      { en: "Travel: discuss with transplant team, carry medication supply + medical letter", tr: "Seyahat: nakil ekibiyle görüşün, ilac tedariqi + tibbi mektup tasiyin" },
      { en: "Mental health: anxiety about rejection is normal — seek support groups", tr: "Ruh sağlığı: red hakkinda kaygı normaldir — destek gruplari arayın" },
      { en: "Body image changes from steroids (moon face, weight gain) are often temporary", tr: "Steroidlerden vucut imaji değişiklikleri (yuvarlak yuz, kilo) genellikle gecicidir" },
      { en: "Alcohol: strictly limited or avoided — discuss with your team", tr: "Alkol: siki olarak sinirli veya kacin — ekibinizle görüşün" },
      { en: "Gratitude practice and journaling improve psychological outcomes", tr: "Sukran pratigi ve gunluk tutma psikolojik sonuçlari iyileştirir" },
      { en: "Connect with transplant recipient communities for shared experiences", tr: "Paylasilan deneyimler için nakil alici topluluklariyla baglanti kurun" },
    ],
  },
];

export default function OrganTransplantPage() {
  const { lang } = useLang();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 px-4 py-2 rounded-full text-sm font-medium">
            <Heart className="w-4 h-4" />
            {tx("organ.badge", lang)}
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {tx("organ.title", lang)}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {tx("organ.subtitle", lang)}
          </p>
        </div>

        {/* Critical Warning */}
        <Card className="border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30 p-4">
          <div className="flex gap-3">
            <Ban className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="text-sm text-red-800 dark:text-red-200">
              <p className="font-semibold mb-1">
                {tx("organ.criticalTitle", lang)}
              </p>
              <p>
                {tx("organ.criticalDesc", lang)}
              </p>
            </div>
          </div>
        </Card>

        {/* Sections */}
        {sections.map((section) => (
          <Card key={section.id} className="overflow-hidden">
            <Button
              variant="ghost"
              className="w-full flex items-center justify-between p-4 h-auto hover:bg-muted/50"
              onClick={() => toggle(section.id)}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {section.icon}
                </div>
                <span className="font-semibold text-left">
                  {lang === "tr" ? section.titleTR : section.titleEN}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {section.badgeEN && (
                  <Badge className={section.badgeColor} variant="secondary">
                    {lang === "tr" ? section.badgeTR : section.badgeEN}
                  </Badge>
                )}
                {expanded[section.id] ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </Button>
            {expanded[section.id] && (
              <div className="px-4 pb-4 space-y-2">
                {section.items.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 p-3 rounded-lg transition-colors ${
                      item.warning
                        ? "bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30"
                        : "bg-muted/40 hover:bg-muted/60"
                    }`}
                  >
                    {item.warning ? (
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    ) : (
                      <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    )}
                    <span className="text-sm text-foreground">
                      {item[lang as "en" | "tr"]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4">
          {tx("organ.disclaimer", lang)}
        </div>
      </div>
    </div>
  );
}
