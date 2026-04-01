// © 2026 Doctopal — All Rights Reserved
"use client";

import { useState } from "react";
import { Beaker, Loader2, ArrowRight, Trophy, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

interface SupplementInfo {
  name: string;
  evidenceGrade: string;
  primaryBenefits: string[];
  dosage: string;
  absorption: string;
  sideEffects: string[];
  cost: string;
  bestFor: string;
}

interface CompareResult {
  supplement1: SupplementInfo;
  supplement2: SupplementInfo;
  comparison: {
    winner: string;
    winnerReason: string;
    keyDifferences: string[];
    canCombine: boolean;
    combineNotes: string;
  };
  personalRecommendation: string;
  sources: Array<{ title: string; url: string }>;
}

const POPULAR_PAIRS = [
  { s1: "Omega-3", s2: "Krill Oil" },
  { s1: "Vitamin D3", s2: "Vitamin D2" },
  { s1: "Magnesium Glycinate", s2: "Magnesium Citrate" },
  { s1: "Ashwagandha", s2: "Rhodiola Rosea" },
  { s1: "Whey Protein", s2: "Casein Protein" },
  { s1: "Curcumin", s2: "Boswellia" },
];

const GRADE_COLORS: Record<string, string> = {
  A: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400",
  B: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-400",
  C: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-400",
};

export default function SupplementComparePage() {
  const { isAuthenticated, session } = useAuth();
  const { lang } = useLang();
  const [supplement1, setSupplement1] = useState("");
  const [supplement2, setSupplement2] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompareResult | null>(null);

  const handleCompare = async () => {
    if (!supplement1.trim() || !supplement2.trim()) return;
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

      const res = await fetch("/api/supplement-compare", {
        method: "POST",
        headers,
        body: JSON.stringify({
          supplement1: supplement1.trim(),
          supplement2: supplement2.trim(),
          lang,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Comparison failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const SupCard = ({ sup, idx }: { sup: SupplementInfo; idx: 1 | 2 }) => {
    const isWinner = result?.comparison.winner?.toLowerCase() === sup.name.toLowerCase();
    return (
      <div className={`rounded-xl border p-4 ${isWinner ? "border-primary ring-2 ring-primary/20" : ""}`}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold">{sup.name}</h3>
          <div className="flex items-center gap-2">
            {isWinner && <Trophy className="h-4 w-4 text-primary" />}
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${GRADE_COLORS[sup.evidenceGrade] || GRADE_COLORS.C}`}>
              {tx("supCompare.grade", lang)} {sup.evidenceGrade}
            </span>
          </div>
        </div>

        <div className="space-y-2.5 text-xs">
          <div>
            <span className="font-semibold text-muted-foreground">{tx("supCompare.benefits", lang)}</span>
            <ul className="mt-1 space-y-0.5">
              {sup.primaryBenefits.map((b, i) => (
                <li key={i} className="flex items-start gap-1"><span className="text-green-500 mt-0.5">+</span>{b}</li>
              ))}
            </ul>
          </div>

          <div>
            <span className="font-semibold text-muted-foreground">{tx("supCompare.dosage", lang)}</span>
            <p className="mt-0.5">{sup.dosage}</p>
          </div>

          <div>
            <span className="font-semibold text-muted-foreground">{tx("supCompare.absorption", lang)}</span>
            <p className="mt-0.5">{sup.absorption}</p>
          </div>

          <div>
            <span className="font-semibold text-muted-foreground">{tx("supCompare.sideEffects", lang)}</span>
            <ul className="mt-1 space-y-0.5">
              {sup.sideEffects.map((s, i) => (
                <li key={i} className="flex items-start gap-1"><span className="text-amber-500 mt-0.5">-</span>{s}</li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted/30 px-2 py-1.5">
            <span className="text-muted-foreground">{tx("supCompare.cost", lang)}</span>
            <span className="font-medium">{sup.cost}</span>
          </div>

          <div className="rounded-lg bg-primary/5 px-2 py-1.5">
            <span className="font-semibold text-primary">{tx("supCompare.bestFor", lang)}:</span>{" "}
            {sup.bestFor}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-indigo-50 p-3 dark:bg-indigo-950">
          <Scale className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold italic tracking-tight sm:text-4xl">
            {tx("supCompare.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("supCompare.subtitle", lang)}
          </p>
        </div>
      </div>

      {!result && (
        <>
          {/* Input */}
          <div className="mb-6 grid gap-3 sm:grid-cols-[1fr,auto,1fr]">
            <input
              type="text"
              value={supplement1}
              onChange={(e) => setSupplement1(e.target.value)}
              placeholder={tx("supCompare.placeholder1", lang)}
              className="rounded-lg border bg-background px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
            <div className="flex items-center justify-center">
              <span className="rounded-full bg-muted p-2 text-xs font-bold text-muted-foreground">VS</span>
            </div>
            <input
              type="text"
              value={supplement2}
              onChange={(e) => setSupplement2(e.target.value)}
              placeholder={tx("supCompare.placeholder2", lang)}
              className="rounded-lg border bg-background px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>

          {/* Popular Pairs */}
          <div className="mb-6">
            <p className="mb-2 text-sm text-muted-foreground">
              {tx("supCompare.popularPairs", lang)}
            </p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_PAIRS.map((pair) => (
                <button
                  key={`${pair.s1}-${pair.s2}`}
                  onClick={() => {
                    setSupplement1(pair.s1);
                    setSupplement2(pair.s2);
                  }}
                  className="flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                >
                  {pair.s1} <ArrowRight className="h-3 w-3" /> {pair.s2}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleCompare}
            disabled={isLoading || !supplement1.trim() || !supplement2.trim()}
            className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {tx("supCompare.comparing", lang)}
              </>
            ) : (
              <>
                <Scale className="h-4 w-4" />
                {tx("supCompare.compareBtn", lang)}
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
            <h2 className="text-lg font-semibold">{tx("supCompare.results", lang)}</h2>
            <Button variant="outline" size="sm" onClick={() => { setResult(null); setSupplement1(""); setSupplement2(""); }}>
              {tx("symptom.newCheck", lang)}
            </Button>
          </div>

          {/* Side by side */}
          <div className="grid gap-4 md:grid-cols-2">
            <SupCard sup={result.supplement1} idx={1} />
            <SupCard sup={result.supplement2} idx={2} />
          </div>

          {/* Comparison */}
          <div className="rounded-xl border bg-primary/5 p-4 space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-bold">
              <Trophy className="h-4 w-4 text-primary" />
              {tx("supCompare.verdict", lang)}
            </h3>
            {result.comparison.winner && result.comparison.winner !== "tie" && (
              <p className="text-sm">
                <span className="font-bold text-primary">{result.comparison.winner}</span>{" "}
                — {result.comparison.winnerReason}
              </p>
            )}
            {result.comparison.winner === "tie" && (
              <p className="text-sm">{result.comparison.winnerReason}</p>
            )}

            {result.comparison.keyDifferences.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-muted-foreground">{tx("supCompare.keyDiff", lang)}</span>
                <ul className="mt-1 space-y-1">
                  {result.comparison.keyDifferences.map((d, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.comparison.canCombine && result.comparison.combineNotes && (
              <div className="rounded-lg border border-green-200 bg-green-50/50 p-2 text-xs text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-400">
                <span className="font-semibold">{tx("supCompare.canCombine", lang)}:</span>{" "}
                {result.comparison.combineNotes}
              </div>
            )}
          </div>

          {/* Personal Recommendation */}
          {result.personalRecommendation && (
            <div className="rounded-lg border p-4">
              <h3 className="mb-1 text-sm font-semibold">{tx("supCompare.personalRec", lang)}</h3>
              <p className="text-xs">{result.personalRecommendation}</p>
            </div>
          )}

          {/* Sources */}
          {result.sources && result.sources.length > 0 && (
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                {tx("symptom.sources", lang)} ({result.sources.length})
              </summary>
              <div className="mt-2 space-y-1">
                {result.sources.map((src, i) => (
                  <a key={i} href={src.url} target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline">
                    {src.title}
                  </a>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      <p className="mt-6 text-center text-xs text-muted-foreground">
        ⚠️ {tx("disclaimer.tool", lang)}
      </p>
    </div>
  );
}
