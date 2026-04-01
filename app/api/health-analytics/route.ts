// © 2026 Doctopal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { checkRateLimit, getClientIP } from "@/lib/rate-limit"
import { askGeminiJSON } from "@/lib/ai-client"
import { tx } from "@/lib/translations"
import {
  generateHealthTimeline,
  generatePeerBenchmarks,
  detectAnomalies,
  generatePredictions,
  getSupplementPeriods,
  simulateOmega3Addition,
} from "@/lib/analytics-engine"

export const maxDuration = 60

// ── GET: Fetch analytics sections ─────────────
export async function GET(req: NextRequest) {
  try {
    const ip = getClientIP(req)
    const rl = checkRateLimit(`health-analytics-get:${ip}`, 10, 60_000)
    if (!rl.allowed) {
      return NextResponse.json({ error: "Rate limited", retryIn: rl.resetInSeconds }, { status: 429 })
    }

    const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const section = req.nextUrl.searchParams.get("section") || "timeline"

    // Fetch user profile and medications in parallel
    const [{ data: profile }, { data: medications }] = await Promise.all([
      supabase.from("user_profiles").select("*").eq("id", user.id).single(),
      supabase.from("user_medications").select("*").eq("user_id", user.id),
    ])

    const timeline = generateHealthTimeline(user.id, 6)

    switch (section) {
      case "timeline":
        return NextResponse.json({
          timeline: timeline.filter((_, i) => i % 2 === 0), // every other day for lighter payload
          supplementPeriods: getSupplementPeriods(),
          omega3Simulation: simulateOmega3Addition(timeline).filter((_, i) => i % 2 === 0),
        })

      case "benchmarks":
        return NextResponse.json({
          benchmarks: generatePeerBenchmarks(timeline),
          profileSummary: {
            age: profile?.birth_date ? Math.floor((Date.now() - new Date(profile.birth_date).getTime()) / 31557600000) : null,
            gender: profile?.gender,
            conditions: profile?.chronic_conditions || [],
            medicationCount: medications?.length || 0,
          },
        })

      case "anomalies":
        return NextResponse.json({
          anomalies: detectAnomalies(timeline),
        })

      case "predictions":
        return NextResponse.json({
          predictions: generatePredictions(timeline),
        })

      default:
        return NextResponse.json({ error: "Invalid section" }, { status: 400 })
    }
  } catch (error) {
    console.error("[HealthAnalytics] GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ── POST: AI-powered insights ─────────────────
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req)
    const rl = checkRateLimit(`health-analytics-post:${ip}`, 5, 60_000)
    if (!rl.allowed) {
      return NextResponse.json({ error: "Rate limited", retryIn: rl.resetInSeconds }, { status: 429 })
    }

    const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const lang = (body.lang === "tr" ? "tr" : "en") as "en" | "tr"
    const timeline = generateHealthTimeline(user.id, 6)
    const anomalies = detectAnomalies(timeline)
    const predictions = generatePredictions(timeline)
    const recent30 = timeline.slice(-30)

    const systemPrompt = `You are a health analytics AI assistant for Doctopal. Analyze the user's health timeline data and provide evidence-based insights. Respond in ${tx("api.respondLang", lang)}. Return valid JSON only.`

    const prompt = `Analyze this health data and return JSON with this structure:
{
  "insights": [
    { "title": "string", "body": "string", "type": "positive|caution|neutral" }
  ],
  "correlations": [
    { "supplement": "string", "metric": "string", "effect": "string", "strength": "strong|moderate|weak" }
  ],
  "recommendations": [
    { "action": "string", "priority": "high|medium|low", "reason": "string" }
  ]
}

Recent 30-day averages:
- CRP: ${avg(recent30.map(d => d.crp ?? 0))} mg/L (trend: ${predictions.find(p => p.metric === "CRP")?.trend || "stable"})
- HbA1c: ${avg(recent30.map(d => d.hba1c ?? 0))}% (trend: ${predictions.find(p => p.metric === "HbA1c")?.trend || "stable"})
- Deep Sleep: ${avg(recent30.map(d => d.deepSleep ?? 0))}h (trend: ${predictions.find(p => p.metric === "Deep Sleep")?.trend || "stable"})
- Energy: ${avg(recent30.map(d => d.energyScore ?? 0))}/10

Active supplements: Curcumin (60+ days), Valerian Root (45+ days), Berberine (30+ days)
Anomalies detected: ${anomalies.length} (${anomalies.filter(a => a.severity === "alert").length} alerts)

Provide 3-4 insights, 2-3 correlations, and 2-3 recommendations. Be specific and evidence-aware.`

    const raw = await askGeminiJSON(prompt, systemPrompt)
    const parsed = JSON.parse(raw)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error("[HealthAnalytics] POST error:", error)
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 })
  }
}

function avg(arr: number[]): string {
  if (arr.length === 0) return "0"
  return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)
}
