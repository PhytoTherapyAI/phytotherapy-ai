import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const maxDuration = 30;

interface HealthResult {
  service: string;
  status: "ok" | "error" | "warning";
  message: string;
  responseTime?: number;
}

export async function GET() {
  const results: HealthResult[] = [];

  // 1. Supabase connection
  try {
    const start = Date.now();
    const supabase = createServerClient();
    const { error } = await supabase
      .from("user_profiles")
      .select("id")
      .limit(1);
    const elapsed = Date.now() - start;
    results.push({
      service: "Supabase Database",
      status: !error ? "ok" : "error",
      message: error?.message || "Connected",
      responseTime: elapsed,
    });
  } catch (e) {
    results.push({
      service: "Supabase Database",
      status: "error",
      message: String(e),
    });
  }

  // 2. Gemini API
  try {
    const start = Date.now();
    const { askGemini } = await import("@/lib/gemini");
    const res = await askGemini("Say 'ok'", "Respond with just 'ok'");
    const elapsed = Date.now() - start;
    results.push({
      service: "Gemini AI",
      status: res ? "ok" : "error",
      message: res ? "Responding" : "No response",
      responseTime: elapsed,
    });
  } catch (e) {
    results.push({
      service: "Gemini AI",
      status: "error",
      message: String(e),
    });
  }

  // 3. PubMed API
  try {
    const start = Date.now();
    const res = await fetch(
      "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=health&rettype=count&retmode=json",
      { signal: AbortSignal.timeout(8000) }
    );
    const elapsed = Date.now() - start;
    results.push({
      service: "PubMed API",
      status: res.ok ? "ok" : "error",
      message: res.ok ? "Reachable" : `Status ${res.status}`,
      responseTime: elapsed,
    });
  } catch (e) {
    results.push({
      service: "PubMed API",
      status: "error",
      message: String(e),
    });
  }

  // 4. Check critical API routes
  const criticalApis = [
    "/api/health-score",
    "/api/blood-analysis",
    "/api/interaction",
    "/api/chat",
    "/api/check-in",
    "/api/calendar",
    "/api/family",
    "/api/supplement-check",
    "/api/symptom-checker",
    "/api/food-interaction",
  ];

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const apiChecks = await Promise.allSettled(
    criticalApis.map(async (api) => {
      const start = Date.now();
      try {
        const res = await fetch(`${baseUrl}${api}`, {
          method: "GET",
          signal: AbortSignal.timeout(5000),
        });
        const elapsed = Date.now() - start;
        const isAlive = res.status !== 404;
        return {
          service: `API: ${api}`,
          status: isAlive ? "ok" : "error",
          message: isAlive ? `Status ${res.status}` : "Not Found",
          responseTime: elapsed,
        } as HealthResult;
      } catch {
        return {
          service: `API: ${api}`,
          status: "warning",
          message: "Timeout or unreachable",
          responseTime: Date.now() - start,
        } as HealthResult;
      }
    })
  );

  for (const result of apiChecks) {
    if (result.status === "fulfilled") {
      results.push(result.value);
    }
  }

  // 5. Environment variables check
  const envChecks = [
    { name: "GEMINI_API_KEY", exists: !!process.env.GEMINI_API_KEY },
    {
      name: "NEXT_PUBLIC_SUPABASE_URL",
      exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    },
    {
      name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    {
      name: "SUPABASE_SERVICE_ROLE_KEY",
      exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    {
      name: "NEXT_PUBLIC_SENTRY_DSN",
      exists: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
    },
    { name: "SENTRY_DSN", exists: !!process.env.SENTRY_DSN },
    { name: "PUBMED_API_KEY", exists: !!process.env.PUBMED_API_KEY },
  ];

  for (const env of envChecks) {
    results.push({
      service: `ENV: ${env.name}`,
      status: env.exists ? "ok" : "warning",
      message: env.exists ? "Set" : "Not set",
    });
  }

  const hasErrors = results.some((r) => r.status === "error");
  const hasWarnings = results.some((r) => r.status === "warning");

  return NextResponse.json({
    healthy: !hasErrors,
    hasWarnings,
    timestamp: new Date().toISOString(),
    results,
  });
}
