"use client";

import { useState } from "react";
import {
  Apple,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import Link from "next/link";

interface FoodInteraction {
  food: string;
  medication: string;
  severity: "safe" | "caution" | "dangerous";
  effect: string;
  mechanism: string;
  recommendation: string;
  timing: string;
  sources?: Array<{ title: string; url: string }>;
}

interface FoodResult {
  interactions: FoodInteraction[];
  generalAdvice: string;
  disclaimer: string;
}

const COMMON_FOODS: Record<"en" | "tr", string[]> = {
  en: ["Grapefruit", "Coffee", "Alcohol", "Milk", "Green tea",
       "Cheese", "Banana", "Spinach", "Dark chocolate", "Yogurt"],
  tr: ["Greyfurt", "Kahve", "Alkol", "Süt", "Yeşil çay",
       "Peynir", "Muz", "Ispanak", "Bitter çikolata", "Yoğurt"],
};

const SEVERITY_CONFIG = {
  safe: {
    icon: CheckCircle2,
    color: "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/20",
    badge: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400",
    label: { en: "Safe", tr: "Güvenli" },
  },
  caution: {
    icon: AlertTriangle,
    color: "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/20",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-400",
    label: { en: "Caution", tr: "Dikkat" },
  },
  dangerous: {
    icon: ShieldAlert,
    color: "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/20",
    badge: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-400",
    label: { en: "Dangerous", tr: "Tehlikeli" },
  },
};

export default function FoodInteractionPage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [foods, setFoods] = useState<string[]>([]);
  const [foodInput, setFoodInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FoodResult | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const commonFoods = COMMON_FOODS[lang as "en" | "tr"] ?? COMMON_FOODS.en;

  const addFood = (name: string) => {
    const trimmed = name.trim();
    if (trimmed && !foods.includes(trimmed)) {
      setFoods((prev) => [...prev, trimmed]);
    }
    setFoodInput("");
  };

  const removeFood = (idx: number) => {
    setFoods((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAnalyze = async () => {
    if (foods.length === 0) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (isAuthenticated && session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/food-interaction", {
        method: "POST",
        headers,
        body: JSON.stringify({ foods, lang }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Analysis failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-orange-50 p-3 dark:bg-orange-950">
          <Apple className="h-6 w-6 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("foodInt.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("foodInt.subtitle", lang)}
          </p>
        </div>
      </div>

      {/* Guest notice */}
      {!isAuthenticated && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-300">
          <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />
          {tx("foodInt.loginNote", lang)}{" "}
          <Link href="/auth/login" className="font-semibold underline">
            {tx("bt.createAccount", lang)}
          </Link>
        </div>
      )}

      {!result && (
        <>
          {/* Common Foods */}
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              {tx("foodInt.commonFoods", lang)}
            </p>
            <div className="flex flex-wrap gap-2">
              {commonFoods.map((food) => (
                <button
                  key={food}
                  onClick={() => addFood(food)}
                  disabled={foods.includes(food)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    foods.includes(food)
                      ? "border-orange-400 bg-orange-50 text-orange-600 dark:border-orange-600 dark:bg-orange-950"
                      : "hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                  }`}
                >
                  {food}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Food Input */}
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={foodInput}
              onChange={(e) => setFoodInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addFood(foodInput)}
              placeholder={tx("foodInt.addPlaceholder", lang)}
              className="flex-1 rounded-lg border bg-background px-4 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => addFood(foodInput)}
              disabled={!foodInput.trim()}
              className="gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              {tx("foodInt.add", lang)}
            </Button>
          </div>

          {/* Selected Foods */}
          {foods.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {foods.map((food, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 rounded-full border border-orange-300 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 dark:border-orange-700 dark:bg-orange-950 dark:text-orange-400"
                >
                  {food}
                  <button onClick={() => removeFood(i)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Analyze */}
          <Button
            onClick={handleAnalyze}
            disabled={isLoading || foods.length === 0}
            className="w-full gap-2 bg-orange-600 hover:bg-orange-700 text-white"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {tx("foodInt.analyzing", lang)}
              </>
            ) : (
              <>
                <Apple className="h-4 w-4" />
                {tx("foodInt.checkBtn", lang)}
              </>
            )}
          </Button>
        </>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {tx("foodInt.results", lang)}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setResult(null);
                setFoods([]);
              }}
            >
              {tx("symptom.newCheck", lang)}
            </Button>
          </div>

          {/* Interactions */}
          {result.interactions
            .sort((a, b) => {
              const order = { dangerous: 0, caution: 1, safe: 2 };
              return order[a.severity] - order[b.severity];
            })
            .map((interaction, i) => {
              const config = SEVERITY_CONFIG[interaction.severity];
              const Icon = config.icon;
              const isExpanded = expandedIdx === i;

              return (
                <div
                  key={i}
                  className={`rounded-lg border p-4 ${config.color}`}
                >
                  <button
                    onClick={() => setExpandedIdx(isExpanded ? null : i)}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold">
                          {interaction.food} + {interaction.medication}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${config.badge}`}>
                          {config.label[lang as "en" | "tr"]}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {interaction.effect}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="mt-3 space-y-2 border-t pt-3 text-xs">
                      {interaction.mechanism && (
                        <div>
                          <span className="font-semibold">{tx("foodInt.mechanism", lang)}:</span>{" "}
                          {interaction.mechanism}
                        </div>
                      )}
                      {interaction.recommendation && (
                        <div>
                          <span className="font-semibold">{tx("foodInt.recommendation", lang)}:</span>{" "}
                          {interaction.recommendation}
                        </div>
                      )}
                      {interaction.timing && (
                        <div>
                          <span className="font-semibold">{tx("foodInt.timing", lang)}:</span>{" "}
                          {interaction.timing}
                        </div>
                      )}
                      {interaction.sources && interaction.sources.length > 0 && (
                        <div className="space-y-0.5">
                          {interaction.sources.map((src, j) => (
                            <a
                              key={j}
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-primary hover:underline"
                            >
                              {src.title}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

          {/* General Advice */}
          {result.generalAdvice && (
            <div className="rounded-lg border p-4">
              <p className="text-sm">{result.generalAdvice}</p>
            </div>
          )}
        </div>
      )}

      <p className="mt-6 text-center text-xs text-muted-foreground">
        ⚠️ {tx("disclaimer.tool", lang)}
      </p>
    </div>
  );
}
