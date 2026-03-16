"use client";

import { useState } from "react";
import { FlaskConical, Phone } from "lucide-react";
import { BloodTestForm } from "@/components/blood-test/BloodTestForm";
import { ResultDashboard } from "@/components/blood-test/ResultDashboard";
import { useAuth } from "@/lib/auth-context";
import type { BloodTestResult, BloodTestCategory } from "@/lib/blood-reference";

interface AnalysisResponse {
  success: boolean;
  results: Record<BloodTestCategory, BloodTestResult[]>;
  analysis: {
    summary: string;
    abnormalFindings: Array<{
      marker: string;
      value: string;
      status: string;
      explanation: string;
      concern: string;
    }>;
    supplementRecommendations: Array<{
      supplement: string;
      reason: string;
      dosage: string;
      duration: string;
      evidenceGrade: string;
      sources: Array<{ title: string; url: string; year: string }>;
    }>;
    lifestyleAdvice: Array<{
      category: string;
      advice: string;
      reason: string;
    }>;
    doctorDiscussion: string[];
    disclaimer: string;
  };
  totalMarkers: number;
  abnormalCount: number;
  optimalCount: number;
}

export default function BloodTestPage() {
  const { isAuthenticated, session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalysisResponse | null>(null);

  const handleSubmit = async (
    values: Record<string, number>,
    gender: "male" | "female" | null
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (isAuthenticated && session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/blood-analysis", {
        method: "POST",
        headers,
        body: JSON.stringify({ values, gender }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Analysis failed");
      }

      const result: AnalysisResponse = await res.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      {/* Static Emergency Banner */}
      <div className="mb-6 flex items-center gap-2.5 rounded-xl border bg-red-50/80 px-4 py-2.5 dark:bg-red-950/30">
        <Phone className="h-3.5 w-3.5 shrink-0 text-red-600" />
        <p className="text-xs text-red-700 dark:text-red-400">
          If you are experiencing a life-threatening emergency, call{" "}
          <a href="tel:112" className="font-semibold underline">112</a> /{" "}
          <a href="tel:911" className="font-semibold underline">911</a> immediately.
        </p>
      </div>

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-950">
          <FlaskConical className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Blood Test Analysis</h1>
          <p className="text-sm text-muted-foreground">
            Enter your blood test values for evidence-based supplement & lifestyle recommendations
          </p>
        </div>
      </div>

      {/* Auth notice for guests */}
      {!isAuthenticated && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <p>
            <strong>Guest mode:</strong> You can analyze your blood test, but for personalized
            recommendations based on your medications and health profile,{" "}
            <a href="/auth/login" className="font-semibold underline">
              create a free account
            </a>
            .
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <p className="font-semibold">Analysis Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Show Results or Form */}
      {data ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your Results</h2>
            <button
              onClick={() => setData(null)}
              className="text-sm text-emerald-600 hover:underline"
            >
              ← Run New Analysis
            </button>
          </div>

          <ResultDashboard
            results={data.results}
            analysis={data.analysis}
            totalMarkers={data.totalMarkers}
            abnormalCount={data.abnormalCount}
            optimalCount={data.optimalCount}
          />
        </div>
      ) : (
        <BloodTestForm onSubmit={handleSubmit} isLoading={isLoading} />
      )}

      {/* Disclaimer */}
      <p className="mt-6 text-center text-xs text-muted-foreground">
        ⚠️ This tool provides general health information based on published research.
        It is not a substitute for professional medical advice. Always consult your healthcare provider.
      </p>
    </main>
  );
}
