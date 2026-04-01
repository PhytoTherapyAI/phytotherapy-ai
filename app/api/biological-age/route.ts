// © 2026 Doctopal — All Rights Reserved
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { checkRateLimit, getClientIP } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    const rateCheck = checkRateLimit(`bioage:${clientIP}`, 5, 60_000)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateCheck.resetInSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      )
    }

    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const supabase = createServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { chronologicalAge } = body

    if (!chronologicalAge || chronologicalAge < 1 || chronologicalAge > 120) {
      return NextResponse.json({ error: "Valid chronologicalAge required" }, { status: 400 })
    }

    // Gather user data for calculation
    const [profileResult, medsResult, checkInsResult, vitalsResult] = await Promise.all([
      supabase.from("user_profiles").select("*").eq("id", user.id).single(),
      supabase.from("user_medications").select("id").eq("user_id", user.id).eq("is_active", true),
      supabase.from("daily_check_ins")
        .select("energy_level, sleep_quality, mood, bloating")
        .eq("user_id", user.id)
        .order("check_date", { ascending: false })
        .limit(7),
      supabase.from("vital_records")
        .select("vital_type, value, systolic, diastolic")
        .eq("user_id", user.id)
        .order("recorded_at", { ascending: false })
        .limit(10),
    ])

    const profile = profileResult.data
    const factors: { label: string; impact: string }[] = []
    let ageModifier = 0

    // Exercise frequency
    if (profile?.exercise_frequency) {
      const freq = profile.exercise_frequency
      if (freq === "daily" || freq === "4-5/week") {
        ageModifier -= 3
        factors.push({ label: "Regular exercise", impact: "positive" })
      } else if (freq === "2-3/week") {
        ageModifier -= 1
        factors.push({ label: "Moderate exercise", impact: "positive" })
      } else if (freq === "none" || freq === "rarely") {
        ageModifier += 2
        factors.push({ label: "Low physical activity", impact: "negative" })
      }
    }

    // Sleep quality (from recent check-ins)
    const checkIns = checkInsResult.data || []
    if (checkIns.length > 0) {
      const avgSleep = checkIns
        .filter(c => c.sleep_quality !== null)
        .reduce((sum, c) => sum + (c.sleep_quality || 0), 0) / Math.max(checkIns.filter(c => c.sleep_quality !== null).length, 1)
      if (avgSleep >= 4) {
        ageModifier -= 2
        factors.push({ label: "Good sleep quality", impact: "positive" })
      } else if (avgSleep <= 2) {
        ageModifier += 2
        factors.push({ label: "Poor sleep quality", impact: "negative" })
      }
    }

    // Smoking
    if (profile?.smoking_use === "current") {
      ageModifier += 5
      factors.push({ label: "Active smoking", impact: "negative" })
    } else if (profile?.smoking_use === "former") {
      ageModifier += 1
      factors.push({ label: "Former smoker", impact: "negative" })
    }

    // Alcohol
    if (profile?.alcohol_use === "heavy") {
      ageModifier += 3
      factors.push({ label: "Heavy alcohol use", impact: "negative" })
    } else if (profile?.alcohol_use === "none") {
      ageModifier -= 1
      factors.push({ label: "No alcohol", impact: "positive" })
    }

    // Chronic conditions
    if (profile?.chronic_conditions && profile.chronic_conditions.length > 0) {
      ageModifier += Math.min(profile.chronic_conditions.length * 1.5, 5)
      factors.push({ label: `${profile.chronic_conditions.length} chronic condition(s)`, impact: "negative" })
    }

    // Supplements usage
    if (profile?.supplements && profile.supplements.length > 0) {
      ageModifier -= 1
      factors.push({ label: "Active supplement use", impact: "positive" })
    }

    // Medication adherence (recent check-ins with high energy = good health management)
    if (checkIns.length >= 3) {
      const avgEnergy = checkIns
        .filter(c => c.energy_level !== null)
        .reduce((sum, c) => sum + (c.energy_level || 0), 0) / Math.max(checkIns.filter(c => c.energy_level !== null).length, 1)
      if (avgEnergy >= 4) {
        ageModifier -= 1
        factors.push({ label: "High energy levels", impact: "positive" })
      }
    }

    // BMI check
    if (profile?.height_cm > 0 && profile?.weight_kg > 0) {
      const bmi = profile.weight_kg / Math.pow(profile.height_cm / 100, 2)
      if (bmi >= 18.5 && bmi <= 24.9) {
        ageModifier -= 2
        factors.push({ label: "Healthy BMI", impact: "positive" })
      } else if (bmi >= 30) {
        ageModifier += 3
        factors.push({ label: "High BMI", impact: "negative" })
      } else if (bmi < 18.5) {
        ageModifier += 1
        factors.push({ label: "Underweight BMI", impact: "negative" })
      }
    }

    const biologicalAge = Math.max(1, Math.round(chronologicalAge + ageModifier))

    return NextResponse.json({
      biologicalAge,
      chronologicalAge,
      difference: biologicalAge - chronologicalAge,
      factors,
    })
  } catch (err) {
    console.error("Biological age POST error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
