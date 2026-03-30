// © 2026 Phytotherapy.ai — All Rights Reserved
"use client";

import { useState } from "react";
import { useLang } from "@/components/layout/language-toggle";
import { tx, txObj } from "@/lib/translations";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pill,
  Apple,
  Heart,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Frown,
  Shield,
  Zap,
  Smile,
  Ban,
} from "lucide-react";

interface Section {
  id: string;
  icon: React.ReactNode;
  titleEN: string;
  titleTR: string;
  badgeEN?: string;
  badgeTR?: string;
  badgeColor?: string;
  items: { en: string; tr: string; type?: "warning" | "danger" | "tip" }[];
}

const sections: Section[] = [
  {
    id: "nausea",
    icon: <Frown className="w-5 h-5" />,
    titleEN: "Nausea & Vomiting Management",
    titleTR: "Bulantı ve Kusma Yönetimi",
    badgeEN: "Most Common",
    badgeTR: "En Yaygin",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    items: [
      { en: "Eat small, frequent meals (5-6/day) rather than 3 large meals", tr: "3 buyuk ogun yerine kucuk sik öğünler (gunde 5-6) yiyin", type: "tip" },
      { en: "Ginger tea or ginger candies can help mild nausea (evidence grade B)", tr: "Zencefil cayi veya zencefil sekeri hafif bulantıya yardımcı olabilir (kanit derecesi B)", type: "tip" },
      { en: "Avoid strong smells — eat cold or room temperature foods if smells trigger nausea", tr: "Guclu kokulardan kacinin — kokular bulantı tetikliyorsa soguk veya oda sicakliginda yiyin" },
      { en: "Stay upright for 30 minutes after eating — do not lie down immediately", tr: "Yedikten sonra 30 dakika dik durun — hemen uzanmayin" },
      { en: "Crackers or dry toast before getting out of bed can prevent morning nausea", tr: "Yataktan kalkmadan kraker veya kuru tost sabah bulantısini onleyebilir" },
      { en: "Take anti-nausea medications BEFORE chemotherapy as prescribed, not after", tr: "Anti-emetik ilaçları reçete edildigi gibi kemoterapiden ÖNCE alin, sonra degil", type: "warning" },
      { en: "Peppermint aromatherapy may reduce acute nausea episodes", tr: "Nane aromaterapi akut bulantı ataklarini azaltabilir", type: "tip" },
      { en: "Acupressure wristbands (P6 point) show modest benefit in some studies", tr: "Akupresur bileklikleri (P6 noktasi) bazi çalışmalarda modest fayda gosterir" },
      { en: "Hydration is critical — sip water, broth, or electrolyte drinks throughout the day", tr: "Hidrasyon kritiktir — gun boyunca su, et suyu veya elektrolit icecekleri yudumlayın" },
      { en: "Report persistent vomiting (>24 hours) to your oncology team immediately", tr: "Devam eden kusmayi (>24 saat) hemen onkoloji ekibinize bildirin", type: "danger" },
    ],
  },
  {
    id: "mouth",
    icon: <Zap className="w-5 h-5" />,
    titleEN: "Mouth Sores & Oral Care",
    titleTR: "Agiz Yaralari ve Agiz Bakimi",
    badgeEN: "40% of patients",
    badgeTR: "Hastalarin %40'i",
    badgeColor: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    items: [
      { en: "Rinse mouth 4-6 times daily with salt + baking soda solution (1/2 tsp each in 1 cup water)", tr: "Gunde 4-6 kez tuz + karbonat solüsyonu ile agiz gargarasi yapin (1 bardak suda yarim caykasigi)" },
      { en: "Use soft-bristle toothbrush and gentle, alcohol-free toothpaste", tr: "Yumusak killi dis fircasi ve hafif, alkolsuz dis macunu kullanin" },
      { en: "Avoid spicy, acidic, crunchy, or very hot foods — they worsen sores", tr: "Baharatli, asidik, citir veya cok sicak yiyeceklerden kacinin — yaralari kotulestirir" },
      { en: "Ice chips during chemo infusion can reduce mouth sore severity (cryotherapy)", tr: "Kemoterapi infuzyonu sirasinda buz parcalari agiz yarasi siddetini azaltabilir (kriyoterapi)" },
      { en: "Honey (medical grade) applied to sores shows benefit in some studies", tr: "Yaralara uygulanan bal (tibbi kalite) bazi çalışmalarda fayda gosterir", type: "tip" },
      { en: "Keep lips moisturized with lanolin-based lip balm", tr: "Dudaklari lanolin bazli dudak balsamıyla nemli tutun" },
      { en: "Avoid commercial mouthwashes with alcohol — they burn and dry mucosa", tr: "Alkol iceren ticari gargaralardan kacinin — yakar ve mukozayi kurutur", type: "warning" },
      { en: "L-glutamine supplements may reduce mucositis — ask your oncologist first", tr: "L-glutamin takviyeleri mukoziti azaltabilir — once onkolojistinize sorun" },
      { en: "Thrush (white patches) is common — report it for antifungal treatment", tr: "Pamukçuk (beyaz lekeler) yaygındır — antifungal tedavi için bildirin" },
      { en: "Dental check-up BEFORE starting chemo to prevent complications", tr: "Komplikasyonlari önlemek için kemoterapi başlamadan ÖNCE dis kontrolü" },
    ],
  },
  {
    id: "fatigue",
    icon: <Heart className="w-5 h-5" />,
    titleEN: "Fatigue & Energy Management",
    titleTR: "Yorgunluk ve Enerji Yönetimi",
    badgeEN: "80-100% affected",
    badgeTR: "%80-100 etkilenir",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    items: [
      { en: "Cancer-related fatigue is different from normal tiredness — it doesn't resolve with rest alone", tr: "Kanser iliskili yorgunluk normal yorgunluktan farklıdir — sadece dinlenmekle gecmez" },
      { en: "Light exercise (15-30 min walk) paradoxically REDUCES fatigue — evidence grade A", tr: "Hafif egzersiz (15-30 dk yuruyus) paradoks olarak yorgunlugu AZALTIR — kanit derecesi A", type: "tip" },
      { en: "Plan important activities during your peak energy time (usually morning)", tr: "Önemli aktiviteleri doruk enerji zamanınıza planlayın (genellikle sabah)" },
      { en: "Energy conservation: sit while cooking, use shower chair, delegate tasks", tr: "Enerji tasarrufu: pisirirken oturun, dus sandalyesi kullanin, gorevleri devredin" },
      { en: "Short naps (20-30 min) before 2 PM — longer naps worsen night sleep", tr: "Ogleden sonra 2'den once kisa sekerlemeler (20-30 dk) — uzun sekerlemeler gece uykusunu bozar" },
      { en: "Anemia is a common cause — check hemoglobin regularly", tr: "Anemi yaygin bir nedendir — hemoglobini düzenli kontrol edin" },
      { en: "Adequate protein intake helps maintain muscle mass and energy", tr: "Yeterli protein alimi kas kutlesini ve enerjiyi korumaya yardımcı olur" },
      { en: "Mindfulness and yoga show moderate benefit for cancer fatigue", tr: "Farkindalik ve yoga kanser yorgunlugunda orta derecede fayda gosterir", type: "tip" },
      { en: "Keep a fatigue diary — rate 1-10 daily to identify patterns and triggers", tr: "Yorgunluk günlüğü tutun — oruntuler ve tetikleyicileri belirlemek için gunluk 1-10 derecelendirin" },
      { en: "Depression can mimic or worsen fatigue — screen regularly", tr: "Depresyon yorgunlugu taklit edebilir veya kotulesirebilir — düzenli taranin" },
    ],
  },
  {
    id: "nutrition",
    icon: <Apple className="w-5 h-5" />,
    titleEN: "Nutrition During Treatment",
    titleTR: "Tedavi Sirasinda Beslenme",
    badgeEN: "Essential",
    badgeTR: "Gerekli",
    badgeColor: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    items: [
      { en: "Protein is priority: aim for 1.0-1.5 g/kg/day (eggs, fish, chicken, legumes)", tr: "Protein onceliklidir: gunde 1.0-1.5 g/kg hedefleyin (yumurta, balik, tavuk, baklagiller)" },
      { en: "Calorie needs increase by 20-30% during active treatment", tr: "Aktif tedavi sirasinda kalori ihtiyaci %20-30 artar" },
      { en: "If appetite is low: add olive oil, nut butter, avocado to meals for calorie density", tr: "Istah düşükse: kalori yogunlugu için yemeklere zeytinyagi, findik ezmesi, avokado ekleyin" },
      { en: "Stay hydrated: 8-10 cups/day, more if vomiting or diarrhea", tr: "Hidrasyon saglayin: gunde 8-10 bardak, kusma veya ishal varsa daha fazla" },
      { en: "Avoid raw or undercooked foods when white blood cell count is low (neutropenia diet)", tr: "Beyaz kan hucresi sayisi düşükken cig veya az pismis yiyeceklerden kacinin (notropeni diyeti)", type: "warning" },
      { en: "Vitamin D status should be monitored — deficiency is very common in cancer patients", tr: "D vitamini durumu izlenmeli — kanser hastalarinda eksiklik cok yaygındır" },
      { en: "Small, calorie-dense snacks between meals: nuts, cheese, smoothies, yogurt", tr: "Ogunler arasi kucuk, kalori yogun atistirmaliklar: kuruyemis, peynir, smoothie, yogurt" },
      { en: "Consider oral nutritional supplements (ONS) if losing >5% body weight in 3 months", tr: "3 ayda >%5 kilo kaybediyorsaniz oral nutrisyonel supplementler (ONS) dusunun" },
      { en: "Limit alcohol completely during treatment — it impairs healing and liver function", tr: "Tedavi sirasinda alkolden tamamen kacinin — iyileşmeyi ve karaciğer işlevi bozar", type: "warning" },
      { en: "A dietitian referral is recommended for all cancer patients during treatment", tr: "Tedavi sirasinda tum kanser hastalarina diyetisyen sevki onerilir" },
    ],
  },
  {
    id: "supplements",
    icon: <Shield className="w-5 h-5" />,
    titleEN: "Supplement Safety During Cancer Treatment",
    titleTR: "Kanser Tedavisinde Takviye Güvenligi",
    badgeEN: "DANGER ZONE",
    badgeTR: "TEHLIKE BOLGESI",
    badgeColor: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    items: [
      { en: "MOST supplements are NOT safe during chemotherapy — always ask your oncologist", tr: "COGU takviye kemoterapi sirasinda GUVENLI DEGILDIR — her zaman onkolojistinize sorun", type: "danger" },
      { en: "High-dose antioxidants (vitamin C, E, beta-carotene) may REDUCE chemo effectiveness", tr: "Yüksek doz antioksidanlar (C vitamini, E, beta-karoten) kemoterapi etkinligini AZALTABILIR", type: "danger" },
      { en: "St. John's Wort interacts with MANY chemo drugs — strictly FORBIDDEN", tr: "Sari Kantaron BIRCOK kemoterapi ilacı ile etkilesir — kesinlikle YASAKTIR", type: "danger" },
      { en: "Green tea extract in high doses can interfere with bortezomib (Velcade)", tr: "Yüksek dozda yesil cay ekstresi bortezomib (Velcade) ile etkilesebilir", type: "warning" },
      { en: "Turmeric/curcumin supplements may affect blood clotting and some drug metabolism", tr: "Zerdecal/kurkumin takviyeleri kan pitilasmasini ve bazi ilac metabolizmasini etkileyebilir", type: "warning" },
      { en: "Fish oil at standard doses (1-2g/day) is generally considered safe — verify with team", tr: "Standart dozlarda balik yagi (1-2g/gun) genellikle güvenli kabul edilir — ekibinizle doğrulayin", type: "tip" },
      { en: "Vitamin D supplementation is often recommended but dose should be prescribed", tr: "D vitamini takviyesi genellikle onerilir ancak dozu reçete edilmelidir" },
      { en: "Probiotics may help with treatment-related diarrhea but avoid if neutropenic", tr: "Probiyotikler tedaviye bagli ishale yardımcı olabilir ancak notropenik ise kaçinin", type: "warning" },
      { en: "Ginger for nausea is generally safe at culinary doses — concentrated supplements need approval", tr: "Bulantı için zencefil mutfak dozlarinda genellikle güvenlidir — konsantre takviyeler onay gerektirir" },
      { en: "Keep a list of ALL supplements you take and bring it to every oncology appointment", tr: "Aldiginiz TUM takviyelerin listesini tutun ve her onkoloji randevusuna getirin" },
    ],
  },
  {
    id: "emotional",
    icon: <Smile className="w-5 h-5" />,
    titleEN: "Emotional Support & Resources",
    titleTR: "Duygusal Destek ve Kaynaklar",
    badgeEN: "You Matter",
    badgeTR: "Sen Önemlisin",
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    items: [
      { en: "It's okay to feel scared, angry, or sad — all emotions are valid during cancer treatment", tr: "Korkmak, kizmak veya uzulmek normaldir — kanser tedavisinde tum duygular gecerlidir" },
      { en: "Professional counseling significantly improves quality of life — don't hesitate to ask", tr: "Profesyonel danışmanlık yasam kalitesini önemli ölçüde iyileştirir — sormaktan çekinmeyin" },
      { en: "Support groups (in-person or online) help reduce isolation and anxiety", tr: "Destek gruplari (yuz yuze veya cevrimici) izolasyon ve kaygıyı azaltmaya yardımcı olur" },
      { en: "Talk to your family openly — they need guidance on how to support you", tr: "Ailenizle acikca konusun — sizi nasil destekleyecekleri konusunda rehberlige ihtiyacları var" },
      { en: "Palliative care is NOT end-of-life care — it improves quality of life at any stage", tr: "Palyatif bakim yasam sonu bakimi DEGILDIR — her asamada yasam kalitesini iyileştirir" },
      { en: "Creative activities (art, music, writing) provide therapeutic benefit during treatment", tr: "Yaratici aktiviteler (sanat, muzik, yazma) tedavi sirasinda terapotik fayda saglar" },
      { en: "Sexual health concerns are common and treatable — bring them up with your doctor", tr: "Cinsel sağlık endisleri yaygındır ve tedavi edilebilir — doktorunuzla görüşün" },
      { en: "Financial toxicity is real — ask about social work services for assistance", tr: "Finansal toksisite gerçektir — yardim için sosyal hizmet servislerini sorun" },
      { en: "Children can be told in age-appropriate ways — oncology social workers can help", tr: "Cocuklara yasa uygun sekilde anlatilebilir — onkoloji sosyal calisanlari yardımcı olabilir" },
      { en: "Cancer survivorship care plan should be discussed before treatment ends", tr: "Kanser hayatta kalma bakim plani tedavi bitmeden görüşülmeli" },
    ],
  },
];

export default function CancerSupportPage() {
  const { lang } = useLang();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const getItemStyle = (type?: string) => {
    switch (type) {
      case "danger":
        return "bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30";
      case "warning":
        return "bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/30";
      case "tip":
        return "bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/30";
      default:
        return "bg-muted/40 hover:bg-muted/60";
    }
  };

  const getItemIcon = (type?: string) => {
    switch (type) {
      case "danger":
        return <Ban className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />;
      case "tip":
        return <Heart className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />;
      default:
        return <Pill className="w-4 h-4 text-primary shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200 px-4 py-2 rounded-full text-sm font-medium">
            <Shield className="w-4 h-4" />
            {tx("cancerSupport.badge", lang)}
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {tx("cancerSupport.title", lang)}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {tx("cancerSupport.subtitle", lang)}
          </p>
        </div>

        {/* Warning */}
        <Card className="border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-200">
              {tx("cancerSupport.warning", lang)}
            </p>
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
                  {txObj({ en: section.titleEN, tr: section.titleTR }, lang)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {section.badgeEN && (
                  <Badge className={section.badgeColor} variant="secondary">
                    {txObj({ en: section.badgeEN, tr: section.badgeTR }, lang)}
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
                    className={`flex gap-3 p-3 rounded-lg transition-colors ${getItemStyle(item.type)}`}
                  >
                    {getItemIcon(item.type)}
                    <span className="text-sm text-foreground">
                      {item[lang]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4">
          {tx("cancerSupport.footer", lang)}
        </div>
      </div>
    </div>
  );
}
