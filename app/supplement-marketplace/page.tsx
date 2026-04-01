// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Heart,
  ShieldCheck,
  Star,
  ExternalLink,
  Leaf,
  Pill,
  Beaker,
  Sparkles,
  AlertTriangle,
  Filter,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { getAffiliateLinks } from "@/lib/affiliate";

// ── Types ──────────────────────────────────
interface Brand {
  name: string;
  form: string;
  note?: string;
}

interface MarketplaceSupplement {
  id: string;
  name: string;
  category: "vitamins" | "minerals" | "herbal" | "amino-acids" | "probiotics";
  evidenceGrade: "A" | "B" | "C";
  uses: { en: string; tr: string };
  brands: Brand[];
  priceRange: "$" | "$$" | "$$$";
  pharmacyQuality: boolean;
}

// ── Data ───────────────────────────────────
const MARKETPLACE_DATA: MarketplaceSupplement[] = [
  {
    id: "omega-3",
    name: "Omega-3 (EPA/DHA)",
    category: "vitamins",
    evidenceGrade: "A",
    uses: { en: "Heart health, triglycerides, inflammation", tr: "Kalp sağlığı, trigliserit, enflamasyon" },
    brands: [
      { name: "Nordic Naturals", form: "Softgel", note: "Third-party tested" },
      { name: "Solgar", form: "Softgel" },
      { name: "NOW Foods", form: "Softgel" },
    ],
    priceRange: "$$",
    pharmacyQuality: true,
  },
  {
    id: "vitamin-d3",
    name: "Vitamin D3",
    category: "vitamins",
    evidenceGrade: "A",
    uses: { en: "Bone health, immune support, mood", tr: "Kemik sağlığı, bağışıklik, ruh hali" },
    brands: [
      { name: "Solgar", form: "Tablet" },
      { name: "NOW Foods", form: "Softgel" },
      { name: "Thorne", form: "Drops" },
    ],
    priceRange: "$",
    pharmacyQuality: true,
  },
  {
    id: "magnesium",
    name: "Magnesium Bisglycinate",
    category: "minerals",
    evidenceGrade: "A",
    uses: { en: "Sleep, muscle cramps, stress relief", tr: "Uyku, kas kramplari, stres" },
    brands: [
      { name: "Doctor's Best", form: "Tablet" },
      { name: "NOW Foods", form: "Capsule" },
      { name: "Solgar", form: "Tablet" },
    ],
    priceRange: "$",
    pharmacyQuality: true,
  },
  {
    id: "ashwagandha",
    name: "Ashwagandha KSM-66",
    category: "herbal",
    evidenceGrade: "A",
    uses: { en: "Stress, anxiety, cortisol, energy", tr: "Stres, anksiyete, kortizol, enerji" },
    brands: [
      { name: "KSM-66 (Ixoreal)", form: "Capsule", note: "Patented extract" },
      { name: "NOW Foods", form: "Capsule" },
      { name: "Jarrow Formulas", form: "Capsule" },
    ],
    priceRange: "$$",
    pharmacyQuality: true,
  },
  {
    id: "probiotics",
    name: "Probiotics (Multi-strain)",
    category: "probiotics",
    evidenceGrade: "A",
    uses: { en: "Gut health, digestion, immune support", tr: "Bağırsak sağlığı, sindirim, bağışıklik" },
    brands: [
      { name: "Culturelle", form: "Capsule" },
      { name: "Align", form: "Capsule" },
      { name: "Garden of Life", form: "Capsule" },
    ],
    priceRange: "$$",
    pharmacyQuality: true,
  },
  {
    id: "vitamin-b12",
    name: "Vitamin B12 (Methylcobalamin)",
    category: "vitamins",
    evidenceGrade: "A",
    uses: { en: "Energy, nerve function, red blood cells", tr: "Enerji, sinir fonksiyonu, kirmizi kan hucreleri" },
    brands: [
      { name: "Jarrow Formulas", form: "Sublingual" },
      { name: "NOW Foods", form: "Capsule" },
    ],
    priceRange: "$",
    pharmacyQuality: true,
  },
  {
    id: "iron-bisglycinate",
    name: "Iron Bisglycinate",
    category: "minerals",
    evidenceGrade: "A",
    uses: { en: "Anemia, fatigue, ferritin support", tr: "Anemi, yorgunluk, ferritin desteği" },
    brands: [
      { name: "Solgar Gentle Iron", form: "Capsule", note: "Non-constipating" },
      { name: "Thorne", form: "Capsule" },
    ],
    priceRange: "$",
    pharmacyQuality: true,
  },
  {
    id: "zinc",
    name: "Zinc Picolinate",
    category: "minerals",
    evidenceGrade: "A",
    uses: { en: "Immune support, skin, wound healing", tr: "Bağışıklik, cilt, yara iyileşmesi" },
    brands: [
      { name: "Thorne", form: "Capsule" },
      { name: "NOW Foods", form: "Capsule" },
    ],
    priceRange: "$",
    pharmacyQuality: true,
  },
  {
    id: "curcumin",
    name: "Curcumin (Turmeric Extract)",
    category: "herbal",
    evidenceGrade: "B",
    uses: { en: "Inflammation, joint pain, antioxidant", tr: "Enflamasyon, eklem ağrısi, antioksidan" },
    brands: [
      { name: "Meriva (Thorne)", form: "Capsule", note: "Phytosome form" },
      { name: "Jarrow Formulas", form: "Capsule" },
      { name: "NOW Foods", form: "Capsule" },
    ],
    priceRange: "$$",
    pharmacyQuality: true,
  },
  {
    id: "coq10",
    name: "CoQ10 (Ubiquinol)",
    category: "vitamins",
    evidenceGrade: "B",
    uses: { en: "Heart health, energy, statin support", tr: "Kalp sağlığı, enerji, statin desteği" },
    brands: [
      { name: "Qunol", form: "Softgel" },
      { name: "Jarrow Formulas", form: "Softgel" },
    ],
    priceRange: "$$$",
    pharmacyQuality: true,
  },
  {
    id: "melatonin",
    name: "Melatonin",
    category: "amino-acids",
    evidenceGrade: "A",
    uses: { en: "Sleep onset, jet lag, circadian rhythm", tr: "Uyku başlangıçi, jet lag, sirkadiyen ritim" },
    brands: [
      { name: "NOW Foods", form: "Sublingual" },
      { name: "Natrol", form: "Tablet" },
    ],
    priceRange: "$",
    pharmacyQuality: true,
  },
  {
    id: "valerian",
    name: "Valerian Root",
    category: "herbal",
    evidenceGrade: "B",
    uses: { en: "Sleep quality, mild anxiety, relaxation", tr: "Uyku kalitesi, hafif anksiyete, rahatlama" },
    brands: [
      { name: "Nature's Way", form: "Capsule" },
      { name: "Solgar", form: "Capsule" },
    ],
    priceRange: "$",
    pharmacyQuality: true,
  },
  {
    id: "berberine",
    name: "Berberine HCl",
    category: "herbal",
    evidenceGrade: "A",
    uses: { en: "Blood sugar, cholesterol, metabolic health", tr: "Kan sekeri, kolesterol, metabolik sağlık" },
    brands: [
      { name: "Thorne", form: "Capsule" },
      { name: "NOW Foods", form: "Capsule" },
    ],
    priceRange: "$$",
    pharmacyQuality: true,
  },
  {
    id: "quercetin",
    name: "Quercetin",
    category: "herbal",
    evidenceGrade: "B",
    uses: { en: "Allergies, antioxidant, immune support", tr: "Alerjiler, antioksidan, bağışıklik desteği" },
    brands: [
      { name: "Thorne", form: "Capsule" },
      { name: "NOW Foods", form: "Capsule" },
      { name: "Jarrow Formulas", form: "Capsule" },
    ],
    priceRange: "$$",
    pharmacyQuality: true,
  },
  {
    id: "vitamin-c",
    name: "Vitamin C (Buffered)",
    category: "vitamins",
    evidenceGrade: "A",
    uses: { en: "Immune support, collagen, antioxidant", tr: "Bağışıklik, kolajen, antioksidan" },
    brands: [
      { name: "NOW Foods", form: "Capsule" },
      { name: "Solgar Ester-C", form: "Tablet", note: "Gentle on stomach" },
      { name: "Thorne", form: "Capsule" },
    ],
    priceRange: "$",
    pharmacyQuality: true,
  },
];

const CATEGORIES = [
  { key: "all", icon: Sparkles, en: "All", tr: "Tumu" },
  { key: "vitamins", icon: Pill, en: "Vitamins", tr: "Vitaminler" },
  { key: "minerals", icon: Beaker, en: "Minerals", tr: "Mineraller" },
  { key: "herbal", icon: Leaf, en: "Herbal", tr: "Bitkisel" },
  { key: "amino-acids", icon: Star, en: "Amino Acids", tr: "Amino Asitler" },
  { key: "probiotics", icon: ShieldCheck, en: "Probiotics", tr: "Probiyotikler" },
];

const GRADE_COLORS: Record<string, string> = {
  A: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400",
  B: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
  C: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
};

const PRICE_LABELS: Record<string, string> = {
  $: "Budget-friendly",
  $$: "Mid-range",
  $$$: "Premium",
};

export default function SupplementMarketplacePage() {
  const { lang } = useLang();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        return JSON.parse(localStorage.getItem("supplement-favorites") || "[]");
      } catch { return []; }
    }
    return [];
  });

  const filtered = useMemo(() => {
    return MARKETPLACE_DATA.filter((s) => {
      const matchesCategory = activeCategory === "all" || s.category === activeCategory;
      const matchesSearch =
        !search.trim() ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.uses.en.toLowerCase().includes(search.toLowerCase()) ||
        s.uses.tr.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      localStorage.setItem("supplement-favorites", JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Leaf className="w-4 h-4" />
            {tx("marketplace.badge", lang)}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            {tx("marketplace.title", lang)}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {tx("marketplace.desc", lang)}
          </p>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            {tx("marketplace.warning", lang)}
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tx("marketplace.searchPlaceholder", lang)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
            />
          </div>
          {favorites.length > 0 && (
            <Link href="/favorite-supplements">
              <Button variant="outline" className="gap-2 rounded-xl">
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                {tx("marketplace.favorites", lang)} ({favorites.length})
              </Button>
            </Link>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat[lang]}
              </button>
            );
          })}
        </div>

        {/* Results Count */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {lang === "tr"
            ? `${filtered.length} takviye bulundu`
            : `${filtered.length} supplement${filtered.length !== 1 ? "s" : ""} found`}
        </p>

        {/* Supplement Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((supplement) => {
            const isFav = favorites.includes(supplement.id);
            const affiliateLinks = getAffiliateLinks(supplement.id) || getAffiliateLinks(supplement.name);

            return (
              <div
                key={supplement.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg hover:border-green-300 dark:hover:border-green-700 transition-all group"
              >
                {/* Top Row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-base group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {supplement.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {supplement.uses[lang]}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleFavorite(supplement.id)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title={tx("marketplace.addToFavorites", lang)}
                  >
                    <Heart
                      className={`w-5 h-5 transition-colors ${
                        isFav ? "text-red-500 fill-red-500" : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  </button>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${GRADE_COLORS[supplement.evidenceGrade]}`}>
                    {tx("common.evidence", lang)} {supplement.evidenceGrade}
                  </span>
                  {supplement.pharmacyQuality && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      {tx("marketplace.pharmacyQuality", lang)}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {supplement.priceRange}
                  </span>
                </div>

                {/* Brands */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                    {tx("marketplace.recommendedBrands", lang)}
                  </p>
                  <div className="space-y-1">
                    {supplement.brands.map((brand, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{brand.name}</span>
                        <span className="text-xs text-gray-400">({brand.form})</span>
                        {brand.note && (
                          <span className="text-xs text-green-600 dark:text-green-400 ml-auto">{brand.note}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href={`/interaction-checker?supplement=${encodeURIComponent(supplement.name)}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1.5 rounded-lg text-xs">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {tx("marketplace.checkInteractions", lang)}
                    </Button>
                  </Link>
                  {affiliateLinks.length > 0 && (
                    <a href={affiliateLinks[0].url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" className="gap-1 rounded-lg text-xs text-green-600 dark:text-green-400">
                        <ExternalLink className="w-3.5 h-3.5" />
                        {tx("marketplace.buy", lang)}
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {tx("marketplace.noResults", lang)}
            </p>
          </div>
        )}

        {/* Affiliate Disclaimer */}
        <div className="mt-8 text-center text-xs text-gray-400 dark:text-gray-500 max-w-xl mx-auto">
          {tx("marketplace.affiliateDisclaimer", lang)}
        </div>

        {/* Footer Disclaimer */}
        <div className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
          {tx("disclaimer.tool", lang)}
        </div>
      </div>
    </div>
  );
}
