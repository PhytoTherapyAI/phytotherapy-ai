"use client";

import { useState } from "react";
import { useLang } from "@/components/layout/language-toggle";
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
    titleTR: "Bulanti ve Kusma Yonetimi",
    badgeEN: "Most Common",
    badgeTR: "En Yaygin",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    items: [
      { en: "Eat small, frequent meals (5-6/day) rather than 3 large meals", tr: "3 buyuk ogun yerine kucuk sik ogunler (gunde 5-6) yiyin", type: "tip" },
      { en: "Ginger tea or ginger candies can help mild nausea (evidence grade B)", tr: "Zencefil cayi veya zencefil sekeri hafif bulantiya yardimci olabilir (kanit derecesi B)", type: "tip" },
      { en: "Avoid strong smells — eat cold or room temperature foods if smells trigger nausea", tr: "Guclu kokulardan kacinin — kokular bulanti tetikliyorsa soguk veya oda sicakliginda yiyin" },
      { en: "Stay upright for 30 minutes after eating — do not lie down immediately", tr: "Yedikten sonra 30 dakika dik durun — hemen uzanmayin" },
      { en: "Crackers or dry toast before getting out of bed can prevent morning nausea", tr: "Yataktan kalkmadan kraker veya kuru tost sabah bulantisini onleyebilir" },
      { en: "Take anti-nausea medications BEFORE chemotherapy as prescribed, not after", tr: "Anti-emetik ilaclari reçete edildigi gibi kemoterapiden ONCE alin, sonra degil", type: "warning" },
      { en: "Peppermint aromatherapy may reduce acute nausea episodes", tr: "Nane aromaterapi akut bulanti ataklarini azaltabilir", type: "tip" },
      { en: "Acupressure wristbands (P6 point) show modest benefit in some studies", tr: "Akupresur bileklikleri (P6 noktasi) bazi calismalarda modest fayda gosterir" },
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
      { en: "Honey (medical grade) applied to sores shows benefit in some studies", tr: "Yaralara uygulanan bal (tibbi kalite) bazi calismalarda fayda gosterir", type: "tip" },
      { en: "Keep lips moisturized with lanolin-based lip balm", tr: "Dudaklari lanolin bazli dudak balsamıyla nemli tutun" },
      { en: "Avoid commercial mouthwashes with alcohol — they burn and dry mucosa", tr: "Alkol iceren ticari gargaralardan kacinin — yakar ve mukozayi kurutur", type: "warning" },
      { en: "L-glutamine supplements may reduce mucositis — ask your oncologist first", tr: "L-glutamin takviyeleri mukoziti azaltabilir — once onkolojistinize sorun" },
      { en: "Thrush (white patches) is common — report it for antifungal treatment", tr: "Pamukçuk (beyaz lekeler) yaygindir — antifungal tedavi icin bildirin" },
      { en: "Dental check-up BEFORE starting chemo to prevent complications", tr: "Komplikasyonlari onlemek icin kemoterapi baslamadan ONCE dis kontrolu" },
    ],
  },
  {
    id: "fatigue",
    icon: <Heart className="w-5 h-5" />,
    titleEN: "Fatigue & Energy Management",
    titleTR: "Yorgunluk ve Enerji Yonetimi",
    badgeEN: "80-100% affected",
    badgeTR: "%80-100 etkilenir",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    items: [
      { en: "Cancer-related fatigue is different from normal tiredness — it doesn't resolve with rest alone", tr: "Kanser iliskili yorgunluk normal yorgunluktan farklidir — sadece dinlenmekle gecmez" },
      { en: "Light exercise (15-30 min walk) paradoxically REDUCES fatigue — evidence grade A", tr: "Hafif egzersiz (15-30 dk yuruyus) paradoks olarak yorgunlugu AZALTIR — kanit derecesi A", type: "tip" },
      { en: "Plan important activities during your peak energy time (usually morning)", tr: "Onemli aktiviteleri doruk enerji zamaniniza planlayin (genellikle sabah)" },
      { en: "Energy conservation: sit while cooking, use shower chair, delegate tasks", tr: "Enerji tasarrufu: pisirirken oturun, dus sandalyesi kullanin, gorevleri devredin" },
      { en: "Short naps (20-30 min) before 2 PM — longer naps worsen night sleep", tr: "Ogleden sonra 2'den once kisa sekerlemeler (20-30 dk) — uzun sekerlemeler gece uykusunu bozar" },
      { en: "Anemia is a common cause — check hemoglobin regularly", tr: "Anemi yaygin bir nedendir — hemoglobini duzenli kontrol edin" },
      { en: "Adequate protein intake helps maintain muscle mass and energy", tr: "Yeterli protein alimi kas kutlesini ve enerjiyi korumaya yardimci olur" },
      { en: "Mindfulness and yoga show moderate benefit for cancer fatigue", tr: "Farkindalik ve yoga kanser yorgunlugunda orta derecede fayda gosterir", type: "tip" },
      { en: "Keep a fatigue diary — rate 1-10 daily to identify patterns and triggers", tr: "Yorgunluk gunlugu tutun — oruntuler ve tetikleyicileri belirlemek icin gunluk 1-10 derecelendirin" },
      { en: "Depression can mimic or worsen fatigue — screen regularly", tr: "Depresyon yorgunlugu taklit edebilir veya kotulesirebilir — duzenli taranin" },
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
      { en: "If appetite is low: add olive oil, nut butter, avocado to meals for calorie density", tr: "Istah dusukse: kalori yogunlugu icin yemeklere zeytinyagi, findik ezmesi, avokado ekleyin" },
      { en: "Stay hydrated: 8-10 cups/day, more if vomiting or diarrhea", tr: "Hidrasyon saglayin: gunde 8-10 bardak, kusma veya ishal varsa daha fazla" },
      { en: "Avoid raw or undercooked foods when white blood cell count is low (neutropenia diet)", tr: "Beyaz kan hucresi sayisi dusukken cig veya az pismis yiyeceklerden kacinin (notropeni diyeti)", type: "warning" },
      { en: "Vitamin D status should be monitored — deficiency is very common in cancer patients", tr: "D vitamini durumu izlenmeli — kanser hastalarinda eksiklik cok yaygindir" },
      { en: "Small, calorie-dense snacks between meals: nuts, cheese, smoothies, yogurt", tr: "Ogunler arasi kucuk, kalori yogun atistirmaliklar: kuruyemis, peynir, smoothie, yogurt" },
      { en: "Consider oral nutritional supplements (ONS) if losing >5% body weight in 3 months", tr: "3 ayda >%5 kilo kaybediyorsaniz oral nutrisyonel supplementler (ONS) dusunun" },
      { en: "Limit alcohol completely during treatment — it impairs healing and liver function", tr: "Tedavi sirasinda alkolden tamamen kacinin — iyilesmeyi ve karaciger islevi bozar", type: "warning" },
      { en: "A dietitian referral is recommended for all cancer patients during treatment", tr: "Tedavi sirasinda tum kanser hastalarina diyetisyen sevki onerilir" },
    ],
  },
  {
    id: "supplements",
    icon: <Shield className="w-5 h-5" />,
    titleEN: "Supplement Safety During Cancer Treatment",
    titleTR: "Kanser Tedavisinde Takviye Guvenligi",
    badgeEN: "DANGER ZONE",
    badgeTR: "TEHLIKE BOLGESI",
    badgeColor: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    items: [
      { en: "MOST supplements are NOT safe during chemotherapy — always ask your oncologist", tr: "COGU takviye kemoterapi sirasinda GUVENLI DEGILDIR — her zaman onkolojistinize sorun", type: "danger" },
      { en: "High-dose antioxidants (vitamin C, E, beta-carotene) may REDUCE chemo effectiveness", tr: "Yuksek doz antioksidanlar (C vitamini, E, beta-karoten) kemoterapi etkinligini AZALTABILIR", type: "danger" },
      { en: "St. John's Wort interacts with MANY chemo drugs — strictly FORBIDDEN", tr: "Sari Kantaron BIRCOK kemoterapi ilacı ile etkilesir — kesinlikle YASAKTIR", type: "danger" },
      { en: "Green tea extract in high doses can interfere with bortezomib (Velcade)", tr: "Yuksek dozda yesil cay ekstresi bortezomib (Velcade) ile etkilesebilir", type: "warning" },
      { en: "Turmeric/curcumin supplements may affect blood clotting and some drug metabolism", tr: "Zerdecal/kurkumin takviyeleri kan pitilasmasini ve bazi ilac metabolizmasini etkileyebilir", type: "warning" },
      { en: "Fish oil at standard doses (1-2g/day) is generally considered safe — verify with team", tr: "Standart dozlarda balik yagi (1-2g/gun) genellikle guvenli kabul edilir — ekibinizle dogrulayin", type: "tip" },
      { en: "Vitamin D supplementation is often recommended but dose should be prescribed", tr: "D vitamini takviyesi genellikle onerilir ancak dozu reçete edilmelidir" },
      { en: "Probiotics may help with treatment-related diarrhea but avoid if neutropenic", tr: "Probiyotikler tedaviye bagli ishale yardimci olabilir ancak notropenik ise kaçinin", type: "warning" },
      { en: "Ginger for nausea is generally safe at culinary doses — concentrated supplements need approval", tr: "Bulanti icin zencefil mutfak dozlarinda genellikle guvenlidir — konsantre takviyeler onay gerektirir" },
      { en: "Keep a list of ALL supplements you take and bring it to every oncology appointment", tr: "Aldiginiz TUM takviyelerin listesini tutun ve her onkoloji randevusuna getirin" },
    ],
  },
  {
    id: "emotional",
    icon: <Smile className="w-5 h-5" />,
    titleEN: "Emotional Support & Resources",
    titleTR: "Duygusal Destek ve Kaynaklar",
    badgeEN: "You Matter",
    badgeTR: "Sen Onemlisin",
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    items: [
      { en: "It's okay to feel scared, angry, or sad — all emotions are valid during cancer treatment", tr: "Korkmak, kizmak veya uzulmek normaldir — kanser tedavisinde tum duygular gecerlidir" },
      { en: "Professional counseling significantly improves quality of life — don't hesitate to ask", tr: "Profesyonel danismanlik yasam kalitesini onemli olcude iyilestirir — sormaktan cekinmeyin" },
      { en: "Support groups (in-person or online) help reduce isolation and anxiety", tr: "Destek gruplari (yuz yuze veya cevrimici) izolasyon ve kaygıyı azaltmaya yardimci olur" },
      { en: "Talk to your family openly — they need guidance on how to support you", tr: "Ailenizle acikca konusun — sizi nasil destekleyecekleri konusunda rehberlige ihtiyacları var" },
      { en: "Palliative care is NOT end-of-life care — it improves quality of life at any stage", tr: "Palyatif bakim yasam sonu bakimi DEGILDIR — her asamada yasam kalitesini iyilestirir" },
      { en: "Creative activities (art, music, writing) provide therapeutic benefit during treatment", tr: "Yaratici aktiviteler (sanat, muzik, yazma) tedavi sirasinda terapotik fayda saglar" },
      { en: "Sexual health concerns are common and treatable — bring them up with your doctor", tr: "Cinsel saglik endisleri yaygindir ve tedavi edilebilir — doktorunuzla gorusun" },
      { en: "Financial toxicity is real — ask about social work services for assistance", tr: "Finansal toksisite gercektir — yardim icin sosyal hizmet servislerini sorun" },
      { en: "Children can be told in age-appropriate ways — oncology social workers can help", tr: "Cocuklara yasa uygun sekilde anlatilebilir — onkoloji sosyal calisanlari yardimci olabilir" },
      { en: "Cancer survivorship care plan should be discussed before treatment ends", tr: "Kanser hayatta kalma bakim plani tedavi bitmeden gorusulmeli" },
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
            {lang === "tr" ? "Kanser Tedavi Destegi" : "Cancer Treatment Support"}
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {lang === "tr"
              ? "Kanser Tedavisi Yan Etki Yonetimi"
              : "Cancer Treatment Side Effect Management"}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {lang === "tr"
              ? "Kemoterapi ve radyoterapi yan etkilerini yonetmek, beslenme, takviye guvenligi ve duygusal destek icin rehber."
              : "Guide for managing chemotherapy and radiotherapy side effects, nutrition, supplement safety, and emotional support."}
          </p>
        </div>

        {/* Warning */}
        <Card className="border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-200">
              {lang === "tr"
                ? "ONEMLI: Kanser tedavisi sirasinda herhangi bir takviye, bitkisel urun veya diyet degisikligi yapmadan ONCE mutlaka onkoloji ekibinize danisin. Bircok takviye kemoterapiyle etkilesir."
                : "IMPORTANT: ALWAYS consult your oncology team before starting ANY supplement, herbal product, or diet change during cancer treatment. Many supplements interact with chemotherapy."}
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
                    className={`flex gap-3 p-3 rounded-lg transition-colors ${getItemStyle(item.type)}`}
                  >
                    {getItemIcon(item.type)}
                    <span className="text-sm text-foreground">
                      {lang === "tr" ? item.tr : item.en}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4">
          {lang === "tr"
            ? "Bu bilgiler genel rehberlik amaclıdır. Tedavi kararlari her zaman onkoloji ekibinizle birlikte alinmalidir."
            : "This information is for general guidance. Treatment decisions should always be made together with your oncology team."}
        </div>
      </div>
    </div>
  );
}
