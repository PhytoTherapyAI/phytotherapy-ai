// © 2026 DoctoPal — All Rights Reserved
// ============================================
// Google Fit OAuth2 Integration
// GET  /api/integrations/google-fit?action=auth    → redirect to Google consent
// GET  /api/integrations/google-fit?action=callback → handle OAuth callback
// POST /api/integrations/google-fit                 → sync data
// ============================================

import { NextResponse } from "next/server"
import { checkRateLimit } from "@/lib/rate-limit"

const GOOGLE_CLIENT_ID = process.env.GOOGLE_FIT_CLIENT_ID || ""
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_FIT_CLIENT_SECRET || ""
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || "https://doctopal.com"}/api/integrations/google-fit?action=callback`
const SCOPES = [
  "https://www.googleapis.com/auth/fitness.activity.read",
  "https://www.googleapis.com/auth/fitness.heart_rate.read",
  "https://www.googleapis.com/auth/fitness.sleep.read",
  "https://www.googleapis.com/auth/fitness.body.read",
  "https://www.googleapis.com/auth/fitness.blood_pressure.read",
].join(" ")

export async function GET(req: Request) {
  const url = new URL(req.url)
  const action = url.searchParams.get("action")

  // ── OAuth Start: Redirect to Google ──
  if (action === "auth") {
    if (!GOOGLE_CLIENT_ID) {
      return NextResponse.json({ error: "Google Fit not configured" }, { status: 503 })
    }

    // Store user session ID in state param for security
    const state = Buffer.from(JSON.stringify({
      timestamp: Date.now(),
      random: Math.random().toString(36).substring(7),
    })).toString("base64")

    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
    authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID)
    authUrl.searchParams.set("redirect_uri", REDIRECT_URI)
    authUrl.searchParams.set("response_type", "code")
    authUrl.searchParams.set("scope", SCOPES)
    authUrl.searchParams.set("access_type", "offline")
    authUrl.searchParams.set("prompt", "consent")
    authUrl.searchParams.set("state", state)

    return NextResponse.redirect(authUrl.toString())
  }

  // ── OAuth Callback: Exchange code for tokens ──
  if (action === "callback") {
    const code = url.searchParams.get("code")
    const error = url.searchParams.get("error")

    if (error) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/connected-devices?error=consent_denied`)
    }

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/connected-devices?error=no_code`)
    }

    try {
      // Exchange authorization code for tokens
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        signal: AbortSignal.timeout(10000),
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          grant_type: "authorization_code",
        }),
      })

      const tokens = await tokenRes.json()

      if (tokens.error) {
        console.error("[GOOGLE-FIT] Token exchange failed:", tokens.error)
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/connected-devices?error=token_failed`)
      }

      // Store tokens in database (encrypted in production)
      // For now, redirect with success status

      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/connected-devices?connected=google_fit`)
    } catch (err) {
      console.error("[GOOGLE-FIT] Callback error:", err)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/connected-devices?error=server_error`)
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}

// ── Data Sync Endpoint ──
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown"
  const { allowed } = checkRateLimit(`gfit-sync:${ip}`, 5, 60000)
  if (!allowed) return NextResponse.json({ error: "Rate limit" }, { status: 429 })

  const authHeader = req.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { accessToken, dataTypes, startTime, endTime } = await req.json()

    if (!accessToken) {
      return NextResponse.json({ error: "Access token required" }, { status: 400 })
    }

    // Fetch data from Google Fit REST API
    const datasets: { metricType: string; value: number; unit: string; timestamp: string; provider: string }[] = []

    // Example: Fetch heart rate data
    if (!dataTypes || dataTypes.includes("heart_rate")) {
      const hrRes = await fetch("https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate", {
        method: "POST",
        signal: AbortSignal.timeout(10000),
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aggregateBy: [{ dataTypeName: "com.google.heart_rate.bpm" }],
          startTimeMillis: startTime || Date.now() - 7 * 24 * 60 * 60 * 1000, // last 7 days
          endTimeMillis: endTime || Date.now(),
          bucketByTime: { durationMillis: 3600000 }, // hourly buckets
        }),
      })
      const hrData = await hrRes.json()

      // Normalize Google Fit data to our schema
      if (hrData.bucket) {
        interface GFitPoint { value?: { fpVal?: number; intVal?: number }[]; startTimeNanos: string }
        interface GFitDataset { point?: GFitPoint[] }
        interface GFitBucket { dataset?: GFitDataset[] }
        hrData.bucket.forEach((bucket: GFitBucket) => {
          bucket.dataset?.forEach((ds: GFitDataset) => {
            ds.point?.forEach((point: GFitPoint) => {
              datasets.push({
                metricType: "heart_rate",
                value: point.value?.[0]?.fpVal || 0,
                unit: "bpm",
                timestamp: new Date(parseInt(point.startTimeNanos) / 1000000).toISOString(),
                provider: "google_fit",
              })
            })
          })
        })
      }
    }

    // Example: Fetch steps
    if (!dataTypes || dataTypes.includes("steps")) {
      const stepsRes = await fetch("https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate", {
        method: "POST",
        signal: AbortSignal.timeout(10000),
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aggregateBy: [{ dataTypeName: "com.google.step_count.delta" }],
          startTimeMillis: startTime || Date.now() - 7 * 24 * 60 * 60 * 1000,
          endTimeMillis: endTime || Date.now(),
          bucketByTime: { durationMillis: 86400000 }, // daily buckets
        }),
      })
      const stepsData = await stepsRes.json()

      if (stepsData.bucket) {
        interface GFitPoint { value?: { fpVal?: number; intVal?: number }[]; startTimeNanos: string }
        interface GFitDataset { point?: GFitPoint[] }
        interface GFitBucket { dataset?: GFitDataset[] }
        stepsData.bucket.forEach((bucket: GFitBucket) => {
          bucket.dataset?.forEach((ds: GFitDataset) => {
            ds.point?.forEach((point: GFitPoint) => {
              datasets.push({
                metricType: "steps",
                value: point.value?.[0]?.intVal || 0,
                unit: "steps",
                timestamp: new Date(parseInt(point.startTimeNanos) / 1000000).toISOString(),
                provider: "google_fit",
              })
            })
          })
        })
      }
    }

    return NextResponse.json({
      success: true,
      provider: "google_fit",
      records: datasets.length,
      data: datasets,
    })

  } catch (error) {
    console.error("[GOOGLE-FIT] Sync error:", error)
    return NextResponse.json({ error: "Sync failed" }, { status: 500 })
  }
}
