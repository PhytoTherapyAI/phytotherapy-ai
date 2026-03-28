"use client";

import { useState, useEffect } from "react";
import {
  Brain,
  CheckCircle2,
  XCircle,
  Trophy,
  Flame,
  ArrowRight,
  RotateCcw,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/components/layout/language-toggle";

interface Question {
  id: number;
  en: string;
  tr: string;
  options: { en: string; tr: string }[];
  correctIndex: number;
  explanationEn: string;
  explanationTr: string;
  category: string;
}

const QUESTIONS: Question[] = [
  { id: 1, en: "Which vitamin is primarily produced by sun exposure?", tr: "Hangi vitamin esas olarak gunes isinlarindan uretilir?", options: [{ en: "Vitamin A", tr: "A Vitamini" }, { en: "Vitamin D", tr: "D Vitamini" }, { en: "Vitamin C", tr: "C Vitamini" }, { en: "Vitamin K", tr: "K Vitamini" }], correctIndex: 1, explanationEn: "Vitamin D is synthesized in the skin upon UVB exposure. 15-20 minutes of midday sun can produce 10,000-20,000 IU.", explanationTr: "D vitamini, UVB isinlarina maruz kaldiginda ciltte sentezlenir. 15-20 dakikalik ogle gunesi 10.000-20.000 IU uretebilir.", category: "vitamins" },
  { id: 2, en: "What is the main risk of combining St. John's Wort with antidepressants?", tr: "Sari Kantaron ile antidepresanlarin birlikte kullanilmasinin temel riski nedir?", options: [{ en: "Liver damage", tr: "Karaciger hasari" }, { en: "Serotonin syndrome", tr: "Serotonin sendromu" }, { en: "Kidney failure", tr: "Bobrek yetmezligi" }, { en: "Anemia", tr: "Anemi" }], correctIndex: 1, explanationEn: "St. John's Wort increases serotonin levels. Combined with SSRIs, it can cause potentially fatal serotonin syndrome.", explanationTr: "Sari Kantaron serotonin seviyelerini arttirir. SSRI'larla birlikte potansiyel olarak olumcul serotonin sendromuna neden olabilir.", category: "drugs" },
  { id: 3, en: "How many liters of water should an average adult drink daily?", tr: "Ortalama bir yetiskin gunde kac litre su icmelidir?", options: [{ en: "1 liter", tr: "1 litre" }, { en: "2-2.5 liters", tr: "2-2.5 litre" }, { en: "4 liters", tr: "4 litre" }, { en: "0.5 liters", tr: "0.5 litre" }], correctIndex: 1, explanationEn: "The general recommendation is 2-2.5 liters daily, varying by weight, activity level, and climate.", explanationTr: "Genel oneri gunluk 2-2.5 litredir; kiloya, aktivite duzeyine ve iklime gore degisir.", category: "nutrition" },
  { id: 4, en: "Which mineral deficiency is the most common worldwide?", tr: "Dunya genelinde en yaygin mineral eksikligi hangisidir?", options: [{ en: "Zinc", tr: "Cinko" }, { en: "Calcium", tr: "Kalsiyum" }, { en: "Iron", tr: "Demir" }, { en: "Magnesium", tr: "Magnezyum" }], correctIndex: 2, explanationEn: "Iron deficiency affects over 1.6 billion people globally, making it the most prevalent nutritional deficiency.", explanationTr: "Demir eksikligi dunya genelinde 1.6 milyardan fazla kisiyi etkiler ve en yaygin beslenme eksikligidir.", category: "nutrition" },
  { id: 5, en: "What is the recommended weekly exercise duration for adults?", tr: "Yetiskinler icin onerilen haftalik egzersiz suresi nedir?", options: [{ en: "30 minutes", tr: "30 dakika" }, { en: "75 minutes", tr: "75 dakika" }, { en: "150 minutes", tr: "150 dakika" }, { en: "300 minutes", tr: "300 dakika" }], correctIndex: 2, explanationEn: "WHO recommends at least 150 minutes of moderate-intensity aerobic activity per week for adults.", explanationTr: "DSO, yetiskinler icin haftada en az 150 dakika orta yogunlukta aerobik aktivite onermektedir.", category: "exercise" },
  { id: 6, en: "Which food is highest in Omega-3 fatty acids?", tr: "Hangi besin Omega-3 yag asitleri bakimindan en zengindir?", options: [{ en: "Chicken breast", tr: "Tavuk gogsu" }, { en: "Salmon", tr: "Somon" }, { en: "Rice", tr: "Pirinc" }, { en: "Banana", tr: "Muz" }], correctIndex: 1, explanationEn: "Salmon is one of the richest sources of EPA and DHA omega-3 fatty acids, with about 2g per 100g serving.", explanationTr: "Somon, EPA ve DHA omega-3 yag asitlerinin en zengin kaynaklarindan biridir; 100g porsiyonda yaklasik 2g icerir.", category: "nutrition" },
  { id: 7, en: "What does HbA1c measure?", tr: "HbA1c neyi ölçer?", options: [{ en: "Current blood sugar", tr: "Anlik kan sekeri" }, { en: "Average blood sugar over 3 months", tr: "3 aylik ortalama kan sekeri" }, { en: "Insulin resistance", tr: "Insulin direnci" }, { en: "Cholesterol levels", tr: "Kolesterol seviyeleri" }], correctIndex: 1, explanationEn: "HbA1c reflects average blood glucose over the past 2-3 months by measuring glycated hemoglobin.", explanationTr: "HbA1c, glikozile hemoglobini olcerek son 2-3 aydaki ortalama kan sekerinizi yansitir.", category: "vitamins" },
  { id: 8, en: "Which vitamin is essential for blood clotting?", tr: "Kan pihtilasmasinasinda hangi vitamin esastir?", options: [{ en: "Vitamin E", tr: "E Vitamini" }, { en: "Vitamin B12", tr: "B12 Vitamini" }, { en: "Vitamin K", tr: "K Vitamini" }, { en: "Vitamin C", tr: "C Vitamini" }], correctIndex: 2, explanationEn: "Vitamin K activates proteins required for blood coagulation. Deficiency can lead to excessive bleeding.", explanationTr: "K vitamini, kan pihtilasmasinda gereken proteinleri aktive eder. Eksikligi asiri kanamaya yol acabilir.", category: "vitamins" },
  { id: 9, en: "Grapefruit juice interacts dangerously with which class of drugs?", tr: "Greyfurt suyu hangi ilac sinifiyla tehlikeli etkileser?", options: [{ en: "Antibiotics", tr: "Antibiyotikler" }, { en: "Statins", tr: "Statinler" }, { en: "Antihistamines", tr: "Antihistaminikler" }, { en: "Vitamins", tr: "Vitaminler" }], correctIndex: 1, explanationEn: "Grapefruit inhibits CYP3A4 enzyme, dramatically increasing blood levels of statins and raising risk of muscle damage.", explanationTr: "Greyfurt CYP3A4 enzimini inhibe ederek statin kan duzeylerini dramatik olarak arttirir ve kas hasari riskini yukselter.", category: "drugs" },
  { id: 10, en: "What is the best time to take iron supplements?", tr: "Demir takviyesi almanin en iyi zamani nedir?", options: [{ en: "With milk", tr: "Sutle birlikte" }, { en: "On empty stomach with vitamin C", tr: "Bos karna C vitamini ile" }, { en: "Before bedtime", tr: "Yatmadan once" }, { en: "With coffee", tr: "Kahve ile" }], correctIndex: 1, explanationEn: "Iron is best absorbed on an empty stomach. Vitamin C enhances absorption. Dairy and caffeine inhibit it.", explanationTr: "Demir bos karna en iyi emilir. C vitamini emilimi arttirir. Sut urunleri ve kafein emilimi engeller.", category: "vitamins" },
  { id: 11, en: "How many hours of sleep do most adults need?", tr: "Cogu yetiskinin kac saat uykuya ihtiyaci vardir?", options: [{ en: "4-5 hours", tr: "4-5 saat" }, { en: "6 hours", tr: "6 saat" }, { en: "7-9 hours", tr: "7-9 saat" }, { en: "10+ hours", tr: "10+ saat" }], correctIndex: 2, explanationEn: "The National Sleep Foundation recommends 7-9 hours for adults aged 18-64.", explanationTr: "Ulusal Uyku Vakfi, 18-64 yas arasi yetiskinler icin 7-9 saat onermektedir.", category: "exercise" },
  { id: 12, en: "Which herb is commonly used for anxiety relief?", tr: "Anksiyete rahatlamasinda yaygin olarak hangi bitki kullanilir?", options: [{ en: "Echinacea", tr: "Ekinezya" }, { en: "Valerian root", tr: "Kediotu koku" }, { en: "Ginger", tr: "Zencefil" }, { en: "Turmeric", tr: "Zerdecal" }], correctIndex: 1, explanationEn: "Valerian root has been shown in studies to increase GABA levels, promoting relaxation and better sleep.", explanationTr: "Calismalarda kediotu kokunun GABA duzeylerini artirarak rahatlama ve daha iyi uyku sagladigi gosterilmistir.", category: "drugs" },
  { id: 13, en: "What is the daily recommended intake of fiber?", tr: "Lif icin gunluk onerilen alinim miktari nedir?", options: [{ en: "5-10g", tr: "5-10g" }, { en: "15-20g", tr: "15-20g" }, { en: "25-35g", tr: "25-35g" }, { en: "50-60g", tr: "50-60g" }], correctIndex: 2, explanationEn: "Adults should consume 25-35g of fiber daily for optimal digestive health and disease prevention.", explanationTr: "Yetiskinler, optimal sindirim sagligi ve hastalik onlenmesi icin gunluk 25-35g lif tuketmelidir.", category: "nutrition" },
  { id: 14, en: "Which exercise type is best for bone density?", tr: "Kemik yogunlugu icin en iyi egzersiz turu hangisidir?", options: [{ en: "Swimming", tr: "Yuzme" }, { en: "Cycling", tr: "Bisiklet" }, { en: "Weight-bearing exercise", tr: "Agirlik tasiyan egzersiz" }, { en: "Stretching", tr: "Esneme" }], correctIndex: 2, explanationEn: "Weight-bearing exercises like walking, jogging, and resistance training stimulate bone formation and slow bone loss.", explanationTr: "Yuruyus, kosu ve direnc antrenmani gibi agirlik tasiyan egzersizler kemik olusumunu uyarir ve kemik kaybini yavaslatir.", category: "exercise" },
  { id: 15, en: "Warfarin interacts with which vitamin?", tr: "Varfarin hangi vitamin ile etkilesir?", options: [{ en: "Vitamin D", tr: "D Vitamini" }, { en: "Vitamin K", tr: "K Vitamini" }, { en: "Vitamin B6", tr: "B6 Vitamini" }, { en: "Vitamin E", tr: "E Vitamini" }], correctIndex: 1, explanationEn: "Vitamin K can reduce Warfarin's effectiveness. Patients must maintain consistent vitamin K intake.", explanationTr: "K vitamini Varfarin'in etkinligini azaltabilir. Hastalar tutarli K vitamini alimi saglamalidir.", category: "drugs" },
  { id: 16, en: "What is the anti-inflammatory compound in turmeric?", tr: "Zerdecaldeki anti-inflamatuar bilesen nedir?", options: [{ en: "Capsaicin", tr: "Kapsaisin" }, { en: "Curcumin", tr: "Kurkumin" }, { en: "Quercetin", tr: "Kersetin" }, { en: "Resveratrol", tr: "Resveratrol" }], correctIndex: 1, explanationEn: "Curcumin is the primary active compound in turmeric, shown to reduce inflammation comparable to some medications.", explanationTr: "Kurkumin, zerdecaldeki temel aktif bilesen olup iltihaplanmayi bazi ilaclara benzer sekilde azalttigi gosterilmistir.", category: "nutrition" },
  { id: 17, en: "What blood test marker indicates kidney function?", tr: "Bobrek fonksiyonunu gosteren kan testi markeri nedir?", options: [{ en: "ALT", tr: "ALT" }, { en: "Creatinine", tr: "Kreatinin" }, { en: "TSH", tr: "TSH" }, { en: "CRP", tr: "CRP" }], correctIndex: 1, explanationEn: "Creatinine is a waste product filtered by the kidneys. Elevated levels may indicate impaired kidney function.", explanationTr: "Kreatinin bobreklerin filtreledigi bir atik urunudur. Yuksek duzeyler bobrek fonksiyon bozuklugunu gosterebilir.", category: "vitamins" },
  { id: 18, en: "Which mineral is most important for thyroid function?", tr: "Tiroid fonksiyonu icin en onemli mineral hangisidir?", options: [{ en: "Zinc", tr: "Cinko" }, { en: "Selenium", tr: "Selenyum" }, { en: "Iodine", tr: "Iyot" }, { en: "Copper", tr: "Bakir" }], correctIndex: 2, explanationEn: "Iodine is essential for thyroid hormone production. Deficiency causes goiter and hypothyroidism.", explanationTr: "Iyot, tiroid hormonu uretimi icin esastir. Eksikligi guatr ve hipotiroidizme neden olur.", category: "vitamins" },
  { id: 19, en: "What is the DASH diet primarily designed to manage?", tr: "DASH diyeti oncelikle neyi yonetmek icin tasarlanmistir?", options: [{ en: "Diabetes", tr: "Diyabet" }, { en: "High blood pressure", tr: "Yuksek tansiyon" }, { en: "Weight loss", tr: "Kilo kaybi" }, { en: "Allergies", tr: "Alerjiler" }], correctIndex: 1, explanationEn: "DASH (Dietary Approaches to Stop Hypertension) focuses on fruits, vegetables, and low-sodium foods to reduce blood pressure.", explanationTr: "DASH, tansiyonu dusurmek icin meyve, sebze ve dusuk sodyumlu gidalara odaklanan bir diyet planlamasidir.", category: "nutrition" },
  { id: 20, en: "How long before bed should you avoid caffeine?", tr: "Yatmadan kac saat once kafein tuketiminden kacinilmalidir?", options: [{ en: "1 hour", tr: "1 saat" }, { en: "3 hours", tr: "3 saat" }, { en: "6 hours", tr: "6 saat" }, { en: "12 hours", tr: "12 saat" }], correctIndex: 2, explanationEn: "Caffeine has a half-life of 5-6 hours. Avoiding it 6 hours before bed helps ensure quality sleep.", explanationTr: "Kafeinin yarilama omru 5-6 saattir. Yatmadan 6 saat once kacinmak kaliteli uyku saglar.", category: "exercise" },
  { id: 21, en: "Which B vitamin is critical during pregnancy?", tr: "Hamilelikte hangi B vitamini kritik oneme sahiptir?", options: [{ en: "B1 (Thiamine)", tr: "B1 (Tiamin)" }, { en: "B9 (Folic Acid)", tr: "B9 (Folik Asit)" }, { en: "B12 (Cobalamin)", tr: "B12 (Kobalamin)" }, { en: "B6 (Pyridoxine)", tr: "B6 (Piridoksin)" }], correctIndex: 1, explanationEn: "Folic acid prevents neural tube defects. 400-800mcg daily is recommended starting before conception.", explanationTr: "Folik asit noral tup defektlerini onler. Gebe kalmadan once baslayarak gunluk 400-800mcg onerilir.", category: "vitamins" },
  { id: 22, en: "What is the glycemic index?", tr: "Glisemik indeks nedir?", options: [{ en: "Calorie content of food", tr: "Gidanin kalori icerigi" }, { en: "How fast food raises blood sugar", tr: "Gidanin kan sekerini ne hizla yukselttigi" }, { en: "Fat content measurement", tr: "Yag icerigi olcumu" }, { en: "Protein quality score", tr: "Protein kalite skoru" }], correctIndex: 1, explanationEn: "The glycemic index ranks foods 0-100 based on how quickly they raise blood glucose levels.", explanationTr: "Glisemik indeks, gidalaari kan glikoz duzeylerini ne kadar hizli yukselttiklerine gore 0-100 arasinda siralar.", category: "nutrition" },
  { id: 23, en: "Which supplement should NOT be taken with blood thinners?", tr: "Kan sulandiricilarin yaninda hangi takviye alinMAMAlidir?", options: [{ en: "Probiotics", tr: "Probiyotikler" }, { en: "Vitamin D", tr: "D Vitamini" }, { en: "Fish oil (high dose)", tr: "Balik yagi (yuksek doz)" }, { en: "Vitamin B12", tr: "B12 Vitamini" }], correctIndex: 2, explanationEn: "High-dose fish oil has blood-thinning effects and can increase bleeding risk when combined with anticoagulants.", explanationTr: "Yuksek doz balik yagi kan sulandirici etkiye sahiptir ve antikoagulanlarla birlikte kanama riskini arttirabilir.", category: "drugs" },
  { id: 24, en: "What is the primary benefit of probiotics?", tr: "Probiyotiklerin temel faydasi nedir?", options: [{ en: "Muscle building", tr: "Kas yapimi" }, { en: "Gut microbiome health", tr: "Bagirsak mikrobiyomu sagligi" }, { en: "Bone strength", tr: "Kemik gucu" }, { en: "Vision improvement", tr: "Gorme iyilesmesi" }], correctIndex: 1, explanationEn: "Probiotics support gut microbiome diversity, improving digestion, immunity, and even mental health via the gut-brain axis.", explanationTr: "Probiyotikler, bagirsak mikrobiyom cesitliligini destekleyerek sindirimi, bagisikligi ve bagirsak-beyin ekseni yoluyla mental sagligi iyilestirir.", category: "nutrition" },
  { id: 25, en: "What heart rate zone is best for fat burning?", tr: "Yag yakimi icin en iyi kalp atis hizi bolgesi hangisidir?", options: [{ en: "50-60% max HR", tr: "%50-60 maks KAH" }, { en: "60-70% max HR", tr: "%60-70 maks KAH" }, { en: "80-90% max HR", tr: "%80-90 maks KAH" }, { en: "90-100% max HR", tr: "%90-100 maks KAH" }], correctIndex: 1, explanationEn: "The fat-burning zone is 60-70% of maximum heart rate, where the body primarily uses fat as fuel.", explanationTr: "Yag yakma bolgesi, vucut yaglari enerji olarak oncelikli kullandigi maksimum kalp hizinin %60-70'idir.", category: "exercise" },
  { id: 26, en: "Which vitamin deficiency causes scurvy?", tr: "Hangi vitamin eksikligi iskorbute neden olur?", options: [{ en: "Vitamin A", tr: "A Vitamini" }, { en: "Vitamin B1", tr: "B1 Vitamini" }, { en: "Vitamin C", tr: "C Vitamini" }, { en: "Vitamin D", tr: "D Vitamini" }], correctIndex: 2, explanationEn: "Vitamin C deficiency leads to scurvy, characterized by bleeding gums, bruising, and poor wound healing.", explanationTr: "C vitamini eksikligi, dis eti kanamasi, morarma ve zayif yara iyilesmesi ile karakterize iskorbute yol acar.", category: "vitamins" },
  { id: 27, en: "What is the safe daily limit of added sugar (WHO)?", tr: "Eklenmis sekerin guvenli gunluk limiti nedir (DSO)?", options: [{ en: "10g", tr: "10g" }, { en: "25g (6 teaspoons)", tr: "25g (6 tatlı kaşığı)" }, { en: "50g", tr: "50g" }, { en: "100g", tr: "100g" }], correctIndex: 1, explanationEn: "WHO recommends limiting added sugar to 25g (6 teaspoons) per day for optimal health.", explanationTr: "DSO, optimal sağlık için eklenmiş şekerin günlük 25g (6 tatlı kaşığı) ile sınırlandırılmasını önerir.", category: "nutrition" },
  { id: 28, en: "Metformin can deplete which vitamin?", tr: "Metformin hangi vitaminin tükenebilmesine neden olabilir?", options: [{ en: "Vitamin A", tr: "A Vitamini" }, { en: "Vitamin B12", tr: "B12 Vitamini" }, { en: "Vitamin D", tr: "D Vitamini" }, { en: "Vitamin E", tr: "E Vitamini" }], correctIndex: 1, explanationEn: "Long-term Metformin use can impair vitamin B12 absorption. Regular monitoring and supplementation may be needed.", explanationTr: "Uzun süreli Metformin kullanımı B12 vitamini emilimini bozabilir. Düzenli takip ve takviye gerekebilir.", category: "drugs" },
  { id: 29, en: "Which stretching type should be done before exercise?", tr: "Egzersizden önce hangi esneme türü yapılmalıdır?", options: [{ en: "Static stretching", tr: "Statik esneme" }, { en: "Dynamic stretching", tr: "Dinamik esneme" }, { en: "PNF stretching", tr: "PNF esneme" }, { en: "Ballistic stretching", tr: "Balistik esneme" }], correctIndex: 1, explanationEn: "Dynamic stretching warms muscles and improves range of motion. Static stretching before exercise can reduce performance.", explanationTr: "Dinamik esneme kasları ısıtır ve hareket açıklığını iyileştirir. Egzersiz öncesi statik esneme performansı azaltabilir.", category: "exercise" },
  { id: 30, en: "What does a CRP blood test measure?", tr: "CRP kan testi neyi ölçer?", options: [{ en: "Blood sugar", tr: "Kan sekeri" }, { en: "Cholesterol", tr: "Kolesterol" }, { en: "Inflammation", tr: "İltihaplanma" }, { en: "Iron levels", tr: "Demir seviyeleri" }], correctIndex: 2, explanationEn: "C-Reactive Protein (CRP) is an inflammation marker. Elevated levels may indicate infection, chronic disease, or cardiovascular risk.", explanationTr: "C-Reaktif Protein (CRP) bir iltihaplanma göstergesidir. Yüksek düzeyler enfeksiyon, kronik hastalık veya kardiyovasküler riski gösterebilir.", category: "vitamins" },
];

const CATEGORY_LABELS: Record<string, { en: string; tr: string }> = {
  vitamins: { en: "Vitamins & Lab Tests", tr: "Vitaminler & Testler" },
  drugs: { en: "Drug Interactions", tr: "İlaç Etkileşimleri" },
  nutrition: { en: "Nutrition", tr: "Beslenme" },
  exercise: { en: "Exercise & Lifestyle", tr: "Egzersiz & Yaşam" },
};

export default function HealthQuizPage() {
  const { lang } = useLang();
  const t = lang === "tr";

  const [todayIndex, setTodayIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastDate, setLastDate] = useState("");
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const dayNum = Math.floor((Date.now() / 86400000)) % QUESTIONS.length;
    setTodayIndex(dayNum);
    const saved = localStorage.getItem("healthQuiz");
    if (saved) {
      const data = JSON.parse(saved);
      setScore(data.score || 0);
      setTotalAnswered(data.totalAnswered || 0);
      setStreak(data.streak || 0);
      setLastDate(data.lastDate || "");
      if (data.lastDate === today) setCompleted(true);
    }
  }, []);

  const question = QUESTIONS[todayIndex];

  const handleSelect = (idx: number) => {
    if (showAnswer) return;
    setSelected(idx);
  };

  const handleSubmit = () => {
    if (selected === null) return;
    setShowAnswer(true);
    const today = new Date().toISOString().slice(0, 10);
    const isCorrect = selected === question.correctIndex;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const newStreak = lastDate === yesterday ? streak + 1 : 1;
    const newScore = score + (isCorrect ? 1 : 0);
    const newTotal = totalAnswered + 1;
    setScore(newScore);
    setTotalAnswered(newTotal);
    setStreak(newStreak);
    setLastDate(today);
    setCompleted(true);
    localStorage.setItem("healthQuiz", JSON.stringify({
      score: newScore, totalAnswered: newTotal, streak: newStreak, lastDate: today,
    }));
  };

  const accuracy = totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Brain className="w-5 h-5" />
            <span className="font-semibold">{t ? "Günlük Sağlık Bilmecesi" : "Daily Health Quiz"}</span>
          </div>
          <p className="text-muted-foreground text-sm">
            {t ? "Her gun bir soru, her gun yeni bir bilgi!" : "One question a day, learn something new!"}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center">
            <Trophy className="w-5 h-5 mx-auto text-yellow-500 mb-1" />
            <div className="text-lg font-bold">{score}/{totalAnswered}</div>
            <div className="text-xs text-muted-foreground">{t ? "Doğru" : "Correct"}</div>
          </Card>
          <Card className="p-3 text-center">
            <Star className="w-5 h-5 mx-auto text-blue-500 mb-1" />
            <div className="text-lg font-bold">{accuracy}%</div>
            <div className="text-xs text-muted-foreground">{t ? "Başarı" : "Accuracy"}</div>
          </Card>
          <Card className="p-3 text-center">
            <Flame className="w-5 h-5 mx-auto text-orange-500 mb-1" />
            <div className="text-lg font-bold">{streak}</div>
            <div className="text-xs text-muted-foreground">{t ? "Seri" : "Streak"}</div>
          </Card>
        </div>

        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <Badge variant="outline">{t ? CATEGORY_LABELS[question.category].tr : CATEGORY_LABELS[question.category].en}</Badge>
            <span className="text-xs text-muted-foreground">#{question.id}/30</span>
          </div>

          <h2 className="text-lg font-semibold leading-relaxed">
            {t ? question.tr : question.en}
          </h2>

          <div className="space-y-3">
            {question.options.map((opt, idx) => {
              let cls = "border-border hover:border-purple-400 cursor-pointer";
              if (showAnswer) {
                if (idx === question.correctIndex) cls = "border-green-500 bg-green-500/10";
                else if (idx === selected) cls = "border-red-500 bg-red-500/10";
                else cls = "border-border opacity-50";
              } else if (selected === idx) {
                cls = "border-purple-500 bg-purple-500/10";
              }
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={showAnswer}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${cls}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{t ? opt.tr : opt.en}</span>
                    {showAnswer && idx === question.correctIndex && <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto shrink-0" />}
                    {showAnswer && idx === selected && idx !== question.correctIndex && <XCircle className="w-5 h-5 text-red-500 ml-auto shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>

          {!showAnswer && !completed && (
            <Button onClick={handleSubmit} disabled={selected === null} className="w-full gap-2">
              <ArrowRight className="w-4 h-4" />
              {t ? "Cevabimi Gonder" : "Submit Answer"}
            </Button>
          )}

          {showAnswer && (
            <Card className="p-4 bg-blue-500/5 border-blue-500/20">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4 text-blue-500" />
                {t ? "Açıklama" : "Explanation"}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t ? question.explanationTr : question.explanationEn}
              </p>
            </Card>
          )}

          {completed && !showAnswer && (
            <Card className="p-4 bg-green-500/5 border-green-500/20 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="font-semibold">{t ? "Bugunun quizini tamamladin!" : "You completed today's quiz!"}</p>
              <p className="text-sm text-muted-foreground">{t ? "Yarin yeni bir soru olacak." : "Come back tomorrow for a new question."}</p>
            </Card>
          )}
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-3">{t ? "Kategori Dagilimi" : "Category Breakdown"}</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
              const count = QUESTIONS.filter(q => q.category === key).length;
              return (
                <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm">
                  <span>{t ? label.tr : label.en}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
