"use client";

import { useState } from "react";
import {
  Shield,
  Search,
  Loader2,
  Sparkles,
  ArrowRight,
  Pill,
  Leaf,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DrugInput } from "@/components/interaction/DrugInput";
import { InteractionResult } from "@/components/interaction/InteractionResult";
import { useAuth } from "@/lib/auth-context";
import type { InteractionResult as InteractionResultType } from "@/lib/interaction-engine";

const EXAMPLE_QUERIES = [
  {
    medications: ["Metformin"],
    concern: "I have trouble sleeping at night",
    label: "Metformin + Sleep Issues",
  },
  {
    medications: ["Warfarin"],
    concern: "I want to try herbal supplements for joint pain",
    label: "Warfarin + Joint Pain",
  },
  {
    medications: ["Lisinopril", "Metformin"],
    concern: "I feel anxious and stressed lately",
    label: "Multiple Meds + Anxiety",
  },
  {
    medications: ["Sertraline"],
    concern: "I want something natural to boost my energy",
    label: "Sertraline + Low Energy",
  },
];

export default function InteractionCheckerPage() {
  const { isAuthenticated, session } = useAuth();
  const [medications, setMedications] = useState<string[]>([]);
  const [concern, setConcern] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<InteractionResultType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (medications.length === 0 || !concern.trim()) return;

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

      const res = await fetch("/api/interaction", {
        method: "POST",
        headers,
        body: JSON.stringify({ medications, concern: concern.trim() }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to analyze interactions");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadExample = (example: (typeof EXAMPLE_QUERIES)[0]) => {
    setMedications(example.medications);
    setConcern(example.concern);
    setResult(null);
    setError(null);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
      {/* Page Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950">
            <Shield className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">
              Drug-Herb Interaction Checker
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Enter your medications and describe your concern — we&apos;ll find safe
              herbal alternatives backed by science.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
              1
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Pill className="h-4 w-4 text-muted-foreground" />
              Add your medications
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
              2
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Heart className="h-4 w-4 text-muted-foreground" />
              Describe your concern
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
              3
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Leaf className="h-4 w-4 text-muted-foreground" />
              Get safe alternatives
            </div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="mb-8 space-y-6 rounded-xl border bg-card p-6 shadow-sm">
        {/* Drug Input */}
        <DrugInput
          medications={medications}
          onMedicationsChange={setMedications}
          disabled={isLoading}
        />

        {/* Concern Input */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Heart className="h-4 w-4 text-emerald-600" />
            What&apos;s your health concern?
          </label>
          <textarea
            value={concern}
            onChange={(e) => setConcern(e.target.value)}
            disabled={isLoading}
            placeholder="Describe your symptom or health goal (e.g., 'I have trouble sleeping', 'I want to reduce my cholesterol naturally', 'I feel anxious and stressed')"
            rows={3}
            maxLength={1000}
            className="w-full resize-none rounded-lg border bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <div className="flex justify-end">
            <span className="text-xs text-muted-foreground">
              {concern.length}/1000
            </span>
          </div>
        </div>

        {/* Analyze Button */}
        <Button
          onClick={handleAnalyze}
          disabled={isLoading || medications.length === 0 || !concern.trim()}
          className="w-full gap-2 bg-emerald-600 py-6 text-base font-medium hover:bg-emerald-700"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Analyzing interactions...
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              Check Interactions
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        {/* Profile note */}
        {!isAuthenticated && (
          <p className="text-center text-xs text-muted-foreground">
            💡 <a href="/auth/login" className="text-emerald-600 underline hover:text-emerald-700">Sign in</a>{" "}
            to get personalized safety checks based on your health profile (pregnancy, allergies, kidney/liver conditions).
          </p>
        )}
      </div>

      {/* Example Queries */}
      {!result && !isLoading && (
        <div className="mb-8">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            Try an example
          </h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {EXAMPLE_QUERIES.map((example, i) => (
              <button
                key={i}
                onClick={() => loadExample(example)}
                className="group flex items-center gap-3 rounded-lg border bg-card p-3 text-left text-sm transition-all hover:border-emerald-300 hover:shadow-sm dark:hover:border-emerald-700"
              >
                <div className="rounded-md bg-emerald-50 p-1.5 dark:bg-emerald-950">
                  <Pill className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <span className="font-medium group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                    {example.label}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {example.concern}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card p-12">
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-emerald-600" />
          <h3 className="mb-2 text-lg font-semibold">Analyzing Interactions...</h3>
          <div className="space-y-1 text-center text-sm text-muted-foreground">
            <p>🔍 Looking up your medications in FDA database</p>
            <p>📚 Searching PubMed for relevant research</p>
            <p>🧬 Running AI safety analysis</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950/30">
          <h3 className="mb-2 font-semibold text-red-800 dark:text-red-300">
            Analysis Failed
          </h3>
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          <Button
            onClick={handleAnalyze}
            variant="outline"
            size="sm"
            className="mt-3"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Results */}
      {result && !isLoading && <InteractionResult result={result} />}
    </div>
  );
}
