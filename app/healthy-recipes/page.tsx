// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState } from "react";
import {
  UtensilsCrossed,
  Clock,
  Search,
  Filter,
  Leaf,
  Heart,
  Flame,
  ChevronDown,
  ChevronUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface Recipe {
  id: number;
  nameEn: string;
  nameTr: string;
  tags: string[];
  prepMin: number;
  servings: number;
  ingredientsEn: string[];
  ingredientsTr: string[];
  highlightsEn: string;
  highlightsTr: string;
  goodForEn: string[];
  goodForTr: string[];
}

const TAGS: Record<string, { en: string; tr: string; color: string }> = {
  "gluten-free": { en: "Gluten-Free", tr: "Glutensiz", color: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  "low-fodmap": { en: "Low-FODMAP", tr: "Düşük FODMAP", color: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  "anti-inflammatory": { en: "Anti-Inflammatory", tr: "Anti-Inflamatuar", color: "bg-red-500/10 text-red-700 dark:text-red-400" },
  "kidney-friendly": { en: "Kidney-Friendly", tr: "Bobrek Dostu", color: "bg-green-500/10 text-green-700 dark:text-green-400" },
  "diabetic-friendly": { en: "Diabetic-Friendly", tr: "Diyabet Dostu", color: "bg-purple-500/10 text-purple-700 dark:text-purple-400" },
};

const RECIPES: Recipe[] = [
  { id: 1, nameEn: "Turmeric Golden Milk", nameTr: "Zerdecal Sutlu Icecek", tags: ["anti-inflammatory", "gluten-free"], prepMin: 10, servings: 1, ingredientsEn: ["1 cup milk (or plant-based)", "1 tsp turmeric", "1/2 tsp cinnamon", "Pinch of black pepper", "1 tsp honey"], ingredientsTr: ["1 bardak sut (veya bitkisel)", "1 tk zerdecal", "1/2 tk tarçın", "Bir tutam karabiber", "1 tk bal"], highlightsEn: "Rich in curcumin with anti-inflammatory properties. Black pepper increases absorption by 2000%.", highlightsTr: "Kurkumin bakımından zengin, anti-inflamatuar özelliklere sahip. Karabiber emilimi %2000 arttırır.", goodForEn: ["Joint pain", "Inflammation", "Immune support"], goodForTr: ["Eklem ağrısi", "Iltihaplanma", "Bağışıklik desteği"] },
  { id: 2, nameEn: "Quinoa Mediterranean Bowl", nameTr: "Kinoa Akdeniz Kasesi", tags: ["gluten-free", "diabetic-friendly"], prepMin: 25, servings: 2, ingredientsEn: ["1 cup quinoa", "1 cucumber diced", "Cherry tomatoes", "Kalamata olives", "Feta cheese", "Olive oil & lemon dressing"], ingredientsTr: ["1 bardak kinoa", "1 salatalik dogranmis", "Ceri domates", "Kalamata zeytin", "Beyaz peynir", "Zeytinyagi & limon sosu"], highlightsEn: "Complete protein, low glycemic index, rich in fiber and minerals.", highlightsTr: "Tam protein, düşük glisemik indeks, lif ve mineraller bakımından zengin.", goodForEn: ["Blood sugar control", "Heart health", "Weight management"], goodForTr: ["Kan sekeri kontrolü", "Kalp sağlığı", "Kilo yönetimi"] },
  { id: 3, nameEn: "Ginger Carrot Soup", nameTr: "Zencefilli Havuc Corbasi", tags: ["low-fodmap", "gluten-free", "kidney-friendly"], prepMin: 30, servings: 4, ingredientsEn: ["4 large carrots", "1 inch fresh ginger", "1 potato", "Vegetable broth (low sodium)", "Coconut cream"], ingredientsTr: ["4 buyuk havuc", "2 cm taze zencefil", "1 patates", "Sebze suyu (düşük sodyum)", "Hindistan cevizi kremasi"], highlightsEn: "Beta-carotene rich, ginger aids digestion. Low sodium for kidney health.", highlightsTr: "Beta-karoten bakımından zengin, zencefil sindirimi destekler. Bobrek sağlığı için düşük sodyum.", goodForEn: ["Digestion", "Eye health", "Nausea relief"], goodForTr: ["Sindirim", "Goz sağlığı", "Bulantı rahatlamasi"] },
  { id: 4, nameEn: "Berry Chia Pudding", nameTr: "Meyveli Chia Puding", tags: ["gluten-free", "diabetic-friendly", "anti-inflammatory"], prepMin: 10, servings: 2, ingredientsEn: ["3 tbsp chia seeds", "1 cup almond milk", "Mixed berries", "1 tsp vanilla", "Cinnamon"], ingredientsTr: ["3 yk chia tohumu", "1 bardak badem sutu", "Karisik meyveler", "1 tk vanilya", "Tarcin"], highlightsEn: "Omega-3 from chia, antioxidants from berries, high fiber, low sugar.", highlightsTr: "Chia'dan Omega-3, meyvelerden antioksidan, yüksek lif, düşük seker.", goodForEn: ["Blood sugar", "Heart health", "Antioxidant boost"], goodForTr: ["Kan sekeri", "Kalp sağlığı", "Antioksidan takviye"] },
  { id: 5, nameEn: "Lentil & Spinach Stew", nameTr: "Mercimek & Ispanak Yemegi", tags: ["diabetic-friendly", "anti-inflammatory", "kidney-friendly"], prepMin: 35, servings: 4, ingredientsEn: ["1 cup red lentils", "2 cups spinach", "1 onion", "2 tomatoes", "Cumin, turmeric", "Lemon juice"], ingredientsTr: ["1 bardak kirmizi mercimek", "2 bardak ispanak", "1 sogan", "2 domates", "Kimyon, zerdecal", "Limon suyu"], highlightsEn: "Plant protein, iron from lentils + spinach, fiber-rich for blood sugar stability.", highlightsTr: "Bitkisel protein, mercimek + ispanaktan demir, kan sekeri dengesi için lifli.", goodForEn: ["Iron deficiency", "Diabetes", "Heart health"], goodForTr: ["Demir eksikligi", "Diyabet", "Kalp sağlığı"] },
  { id: 6, nameEn: "Salmon with Roasted Vegetables", nameTr: "Sebzeli Firin Somon", tags: ["anti-inflammatory", "gluten-free"], prepMin: 35, servings: 2, ingredientsEn: ["2 salmon fillets", "Broccoli florets", "Sweet potato cubes", "Olive oil", "Herbs (dill, thyme)"], ingredientsTr: ["2 somon fileto", "Brokoli cicekleri", "Tatli patates kupleri", "Zeytinyagi", "Baharatlar (dereotu, kekik)"], highlightsEn: "Omega-3 rich, vitamin D source, complex carbs from sweet potato.", highlightsTr: "Omega-3 bakımından zengin, D vitamini kaynagi, tatli patatesten kompleks karbonhidrat.", goodForEn: ["Heart health", "Brain function", "Inflammation"], goodForTr: ["Kalp sağlığı", "Beyin fonksiyonu", "Iltihaplanma"] },
  { id: 7, nameEn: "Oat & Banana Pancakes", nameTr: "Yulaf & Muz Pankek", tags: ["diabetic-friendly", "low-fodmap"], prepMin: 15, servings: 2, ingredientsEn: ["1 cup oats (gluten-free)", "1 ripe banana", "2 eggs", "Cinnamon", "Berries for topping"], ingredientsTr: ["1 bardak yulaf (glutensiz)", "1 olgun muz", "2 yumurta", "Tarcin", "Uzeri için meyveler"], highlightsEn: "Slow-release energy, potassium from banana, protein from eggs.", highlightsTr: "Yavas salanan enerji, muzdan potasyum, yumurtadan protein.", goodForEn: ["Energy", "Muscle recovery", "Blood sugar"], goodForTr: ["Enerji", "Kas toparlanmasi", "Kan sekeri"] },
  { id: 8, nameEn: "Herb-Infused Detox Water", nameTr: "Bitkisel Detoks Suyu", tags: ["kidney-friendly", "gluten-free", "low-fodmap"], prepMin: 5, servings: 4, ingredientsEn: ["1 liter water", "Cucumber slices", "Fresh mint leaves", "Lemon slices", "Fresh ginger slices"], ingredientsTr: ["1 litre su", "Salatalik dilimleri", "Taze nane yapraklari", "Limon dilimleri", "Taze zencefil dilimleri"], highlightsEn: "Hydrating, supports kidney function, aids digestion with mint and ginger.", highlightsTr: "Nemlendirici, bobrek fonksiyonunu destekler, nane ve zencefil ile sindirimi kolaylaştırır.", goodForEn: ["Hydration", "Kidney health", "Digestion"], goodForTr: ["Hidrasyon", "Bobrek sağlığı", "Sindirim"] },
  { id: 9, nameEn: "Chickpea & Avocado Salad", nameTr: "Nohut & Avokado Salatasi", tags: ["gluten-free", "anti-inflammatory", "diabetic-friendly"], prepMin: 15, servings: 2, ingredientsEn: ["1 can chickpeas", "1 avocado", "Red onion", "Cherry tomatoes", "Cilantro", "Lime juice"], ingredientsTr: ["1 kutu nohut", "1 avokado", "Kirmizi sogan", "Ceri domates", "Kisnis", "Misket limonu suyu"], highlightsEn: "Healthy fats, plant protein, fiber. Rich in folate and potassium.", highlightsTr: "Sağlıkli yaglar, bitkisel protein, lif. Folat ve potasyum bakımından zengin.", goodForEn: ["Heart health", "Weight management", "Cholesterol"], goodForTr: ["Kalp sağlığı", "Kilo yönetimi", "Kolesterol"] },
  { id: 10, nameEn: "Green Smoothie Bowl", nameTr: "Yesil Smoothie Kasesi", tags: ["gluten-free", "anti-inflammatory"], prepMin: 10, servings: 1, ingredientsEn: ["1 banana", "Handful spinach", "1/2 avocado", "Almond milk", "Granola topping", "Seeds (chia, flax)"], ingredientsTr: ["1 muz", "Bir avuc ispanak", "1/2 avokado", "Badem sutu", "Granola", "Tohumlar (chia, keten)"], highlightsEn: "Nutrient-dense, iron + magnesium from greens, omega-3 from seeds.", highlightsTr: "Besin yogun, yesilliklerden demir + magnezyum, tohumlardan omega-3.", goodForEn: ["Energy boost", "Iron intake", "Morning nutrition"], goodForTr: ["Enerji artisi", "Demir alimi", "Sabah beslenmesi"] },
  { id: 11, nameEn: "Walnut Crusted Fish", nameTr: "Cevizli Balik", tags: ["gluten-free", "anti-inflammatory", "kidney-friendly"], prepMin: 25, servings: 2, ingredientsEn: ["2 white fish fillets", "1/2 cup crushed walnuts", "Dijon mustard", "Lemon zest", "Fresh herbs"], ingredientsTr: ["2 beyaz balik fileto", "1/2 bardak kirilmis ceviz", "Dijon hardal", "Limon kabugi rendesi", "Taze baharatlar"], highlightsEn: "Brain-healthy omega-3 from both fish and walnuts. Low sodium preparation.", highlightsTr: "Hem balik hem cevizden beyin için sağlıkli omega-3. Düşük sodyumlu hazirlama.", goodForEn: ["Brain health", "Heart health", "Kidney care"], goodForTr: ["Beyin sağlığı", "Kalp sağlığı", "Bobrek bakimi"] },
  { id: 12, nameEn: "Roasted Cauliflower Hummus", nameTr: "Kavurulmus Karnibahar Humusu", tags: ["low-fodmap", "gluten-free", "diabetic-friendly"], prepMin: 30, servings: 4, ingredientsEn: ["1 cauliflower head", "2 tbsp tahini", "Garlic (roasted)", "Olive oil", "Paprika"], ingredientsTr: ["1 karnibahar", "2 yk tahin", "Sarimsak (kavurulmus)", "Zeytinyagi", "Kirmizi biber"], highlightsEn: "Low-carb alternative to traditional hummus. Rich in vitamin C and fiber.", highlightsTr: "Geleneksel humusa düşük karbonhidratli alternatif. C vitamini ve lif bakımından zengin.", goodForEn: ["Low-carb diets", "Gut health", "Blood sugar"], goodForTr: ["Düşük karbonhidratli diyet", "Bağırsak sağlığı", "Kan sekeri"] },
  { id: 13, nameEn: "Bone Broth", nameTr: "Kemik Suyu", tags: ["gluten-free", "low-fodmap", "anti-inflammatory"], prepMin: 45, servings: 6, ingredientsEn: ["Beef or chicken bones", "Apple cider vinegar", "Onion, celery, carrot", "Bay leaf, peppercorns", "Salt to taste"], ingredientsTr: ["Dana veya tavuk kemikleri", "Elma sirkesi", "Sogan, kereviz, havuc", "Defne yapragi, karabiber", "Tuz"], highlightsEn: "Collagen, glycine, and minerals support gut lining and joint health.", highlightsTr: "Kolajen, glisin ve mineraller bağırsak mukozasi ve eklem sağlığıni destekler.", goodForEn: ["Gut healing", "Joint support", "Immune system"], goodForTr: ["Bağırsak iyileşmesi", "Eklem desteği", "Bağışıklik sistemi"] },
  { id: 14, nameEn: "Baked Sweet Potato with Tahini", nameTr: "Tahinli Firin Tatli Patates", tags: ["diabetic-friendly", "kidney-friendly", "gluten-free"], prepMin: 40, servings: 2, ingredientsEn: ["2 sweet potatoes", "2 tbsp tahini", "Pomegranate seeds", "Mint leaves", "Drizzle of honey"], ingredientsTr: ["2 tatli patates", "2 yk tahin", "Nar taneleri", "Nane yapraklari", "Bal"], highlightsEn: "Beta-carotene, complex carbs, calcium from tahini. Low glycemic load.", highlightsTr: "Beta-karoten, kompleks karbonhidrat, tahindan kalsiyum. Düşük glisemik yuk.", goodForEn: ["Vision health", "Blood sugar control", "Bone health"], goodForTr: ["Gorme sağlığı", "Kan sekeri kontrolü", "Kemik sağlığı"] },
  { id: 15, nameEn: "Zucchini Noodle Stir-Fry", nameTr: "Kabak Noodle Sote", tags: ["gluten-free", "low-fodmap", "diabetic-friendly"], prepMin: 20, servings: 2, ingredientsEn: ["2 zucchini (spiralized)", "Bell peppers", "Mushrooms", "Sesame oil", "Tamari sauce", "Tofu or chicken"], ingredientsTr: ["2 kabak (spiralize)", "Biber", "Mantar", "Susam yagi", "Soya sosu", "Tofu veya tavuk"], highlightsEn: "Low-carb pasta alternative. Packed with vitamins A, C, and potassium.", highlightsTr: "Düşük karbonhidratli makarna alternatifi. A, C vitaminleri ve potasyum dolu.", goodForEn: ["Weight loss", "Low-carb diet", "Blood sugar"], goodForTr: ["Kilo verme", "Düşük karbonhidrat diyet", "Kan sekeri"] },
  { id: 16, nameEn: "Overnight Oats with Walnuts", nameTr: "Cevizli Gece Yulafi", tags: ["diabetic-friendly", "anti-inflammatory"], prepMin: 5, servings: 1, ingredientsEn: ["1/2 cup oats", "1/2 cup yogurt", "Walnuts", "Blueberries", "1 tsp flaxseed", "Honey"], ingredientsTr: ["1/2 bardak yulaf", "1/2 bardak yogurt", "Ceviz", "Yaban mersini", "1 tk keten tohumu", "Bal"], highlightsEn: "Prebiotics from oats, probiotics from yogurt, omega-3 from walnuts and flax.", highlightsTr: "Yulaftan prebiyotik, yogurttan probiyotik, ceviz ve ketenden omega-3.", goodForEn: ["Gut health", "Brain function", "Sustained energy"], goodForTr: ["Bağırsak sağlığı", "Beyin fonksiyonu", "Sürdürulebilir enerji"] },
  { id: 17, nameEn: "Mediterranean Egg Muffins", nameTr: "Akdeniz Yumurta Muffin", tags: ["gluten-free", "low-fodmap", "diabetic-friendly"], prepMin: 25, servings: 6, ingredientsEn: ["6 eggs", "Spinach", "Sun-dried tomatoes", "Feta cheese", "Oregano", "Olive oil"], ingredientsTr: ["6 yumurta", "Ispanak", "Kurutulmus domates", "Beyaz peynir", "Kekik", "Zeytinyagi"], highlightsEn: "Protein-rich, portable breakfast. Choline from eggs supports brain health.", highlightsTr: "Protein bakımından zengin, tasinabilir kahvalti. Yumurtadan kolin beyin sağlığıni destekler.", goodForEn: ["Muscle building", "Brain health", "Meal prep"], goodForTr: ["Kas yapımı", "Beyin sağlığı", "Ogun hazirlama"] },
  { id: 18, nameEn: "Anti-Inflammatory Smoothie", nameTr: "Anti-Inflamatuar Smoothie", tags: ["anti-inflammatory", "gluten-free"], prepMin: 5, servings: 1, ingredientsEn: ["1 cup pineapple", "1 inch turmeric root", "1 inch ginger", "Handful spinach", "Coconut water"], ingredientsTr: ["1 bardak ananas", "2 cm zerdecal koku", "2 cm zencefil", "Bir avuc ispanak", "Hindistan cevizi suyu"], highlightsEn: "Bromelain from pineapple, curcumin from turmeric, gingerol from ginger — triple anti-inflammatory.", highlightsTr: "Ananastan bromelain, zerdecalden kurkumin, zencefilden gingerol — uclu anti-inflamatuar.", goodForEn: ["Chronic inflammation", "Joint pain", "Post-workout"], goodForTr: ["Kronik iltihaplanma", "Eklem ağrısi", "Egzersiz sonrasi"] },
  { id: 19, nameEn: "Herbal Relaxation Tea Blend", nameTr: "Bitkisel Rahatlama Cayi", tags: ["kidney-friendly", "gluten-free", "low-fodmap"], prepMin: 10, servings: 2, ingredientsEn: ["Chamomile flowers", "Lavender buds", "Lemon balm leaves", "Passionflower", "Honey (optional)"], ingredientsTr: ["Papatya cicekleri", "Lavanta tomurcuklari", "Melisa yapraklari", "Cicek-i saat", "Bal (isteğe bağlı)"], highlightsEn: "Calming herbs that support sleep quality. Chamomile and passionflower backed by clinical studies.", highlightsTr: "Uyku kalitesini destekleyen yatistirici bitkiler. Papatya ve cicek-i saat klinik çalışmalarla desteklenmistir.", goodForEn: ["Sleep quality", "Anxiety", "Stress relief"], goodForTr: ["Uyku kalitesi", "Anksiyete", "Stres rahatlamasi"] },
  { id: 20, nameEn: "Turkey Lettuce Wraps", nameTr: "Hindili Marul Sarmalari", tags: ["gluten-free", "low-fodmap", "diabetic-friendly"], prepMin: 20, servings: 3, ingredientsEn: ["Ground turkey", "Butter lettuce", "Water chestnuts", "Ginger", "Coconut aminos", "Green onion tops"], ingredientsTr: ["Hindi kiyma", "Tereviya marul", "Su kestanesi", "Zencefil", "Hindistan cevizi aminosu", "Yesil sogan uclari"], highlightsEn: "Lean protein, low-carb, gut-friendly. Great post-workout meal.", highlightsTr: "Yagsiz protein, düşük karbonhidrat, bağırsak dostu. Harika egzersiz sonrasi ogunu.", goodForEn: ["Weight loss", "Muscle recovery", "Gut health"], goodForTr: ["Kilo verme", "Kas toparlanmasi", "Bağırsak sağlığı"] },
];

export default function HealthyRecipesPage() {
  const { lang } = useLang();
  const t = lang === "tr";
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("all");
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = RECIPES.filter(r => {
    if (activeTag !== "all" && !r.tags.includes(activeTag)) return false;
    if (search) {
      const s = search.toLowerCase();
      return (t ? r.nameTr : r.nameEn).toLowerCase().includes(s);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <UtensilsCrossed className="w-5 h-5" />
            <span className="font-semibold">{tx("recipes.title", lang)}</span>
          </div>
          <p className="text-muted-foreground text-sm">
            {tx("recipes.subtitle", lang)}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={tx("recipes.searchPlaceholder", lang)}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <Button variant={activeTag === "all" ? "default" : "outline"} size="sm" onClick={() => setActiveTag("all")} className="shrink-0">
            {tx("recipes.all", lang)} ({RECIPES.length})
          </Button>
          {Object.entries(TAGS).map(([key, val]) => (
            <Button key={key} variant={activeTag === key ? "default" : "outline"} size="sm" onClick={() => setActiveTag(key)} className="shrink-0">
              {t ? val.tr : val.en}
            </Button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map(r => (
            <Card key={r.id} className="overflow-hidden">
              <button className="w-full text-left p-4" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{t ? r.nameTr : r.nameEn}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{r.prepMin} min</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{r.servings}</span>
                    </div>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {r.tags.map(tag => (
                        <span key={tag} className={`text-xs px-2 py-0.5 rounded-full ${TAGS[tag].color}`}>
                          {t ? TAGS[tag].tr : TAGS[tag].en}
                        </span>
                      ))}
                    </div>
                  </div>
                  {expanded === r.id ? <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />}
                </div>
              </button>
              {expanded === r.id && (
                <div className="px-4 pb-4 space-y-3 border-t pt-3">
                  <div>
                    <h4 className="text-sm font-semibold mb-1">{tx("recipes.ingredients", lang)}</h4>
                    <ul className="text-sm text-muted-foreground space-y-0.5">
                      {(t ? r.ingredientsTr : r.ingredientsEn).map((ing, i) => (
                        <li key={i} className="flex items-center gap-2"><Leaf className="w-3 h-3 text-emerald-500 shrink-0" />{ing}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">{tx("recipes.nutritionalHighlights", lang)}</h4>
                    <p className="text-sm text-muted-foreground">{t ? r.highlightsTr : r.highlightsEn}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">{tx("recipes.goodFor", lang)}</h4>
                    <div className="flex gap-1.5 flex-wrap">
                      {(t ? r.goodForTr : r.goodForEn).map((g, i) => (
                        <Badge key={i} variant="secondary" className="text-xs"><Heart className="w-3 h-3 mr-1" />{g}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
          {filtered.length === 0 && (
            <Card className="p-8 text-center">
              <UtensilsCrossed className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">{tx("recipes.notFound", lang)}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
