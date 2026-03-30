// © 2026 Phytotherapy.ai — All Rights Reserved
// ============================================
// Doctor Referral API
// ============================================
// GET: Fetch doctor's referral code + stats
// POST action="generate": Generate unique referral code
// POST action="redeem": Patient redeems a referral code
// ============================================

import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { checkRateLimit, getClientIP } from "@/lib/rate-limit"

export async function GET(req: Request) {
  // Rate limit
  const ip = getClientIP(req)
  const { allowed } = checkRateLimit(`referral-get:${ip}`, 10, 60000)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  // Auth
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

  try {
    // Fetch referral code
    const { data: codeData } = await supabase
      .from("doctor_referral_codes")
      .select("*")
      .eq("doctor_id", user.id)
      .eq("is_active", true)
      .single()

    if (!codeData) {
      return NextResponse.json({ code: null, stats: null })
    }

    // Fetch referral records
    const { data: records } = await supabase
      .from("referral_records")
      .select("id, status, credits_earned, created_at")
      .eq("doctor_id", user.id)

    const allRecords = records || []
    const totalReferred = allRecords.length
    const activePatients = allRecords.filter((r) => r.status === "active" || r.status === "premium").length
    const totalCredits = allRecords.reduce((sum, r) => sum + (r.credits_earned || 0), 0)

    // Monthly breakdown (last 6 months)
    const now = new Date()
    const monthlyBreakdown: { month: string; count: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      const count = allRecords.filter((r) => {
        const rd = new Date(r.created_at)
        return rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth()
      }).length
      monthlyBreakdown.push({ month: monthKey, count })
    }

    const thisMonth = monthlyBreakdown[monthlyBreakdown.length - 1]?.count || 0

    return NextResponse.json({
      code: codeData.code,
      link: codeData.link,
      stats: {
        totalReferred,
        activePatients,
        totalCredits,
        thisMonth,
        monthlyBreakdown,
      },
    })
  } catch (err) {
    console.error("Referral GET error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  // Rate limit
  const ip = getClientIP(req)
  const { allowed } = checkRateLimit(`referral-post:${ip}`, 10, 60000)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  let body: { action?: string; code?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const supabase = createServerClient()
  const { action, code } = body

  // === GENERATE ===
  if (action === "generate") {
    const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const token = authHeader.replace("Bearer ", "")
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      // Check if already has a code
      const { data: existing } = await supabase
        .from("doctor_referral_codes")
        .select("code")
        .eq("doctor_id", user.id)
        .eq("is_active", true)
        .single()

      if (existing) {
        return NextResponse.json({ code: existing.code })
      }

      // Get doctor's name for code
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("full_name")
        .eq("id", user.id)
        .single()

      const firstName = (profile?.full_name || "DOCTOR").split(" ")[0].toUpperCase().replace(/[^A-Z]/g, "").slice(0, 8) || "DOC"
      const randomDigits = String(Math.floor(Math.random() * 90) + 10)
      const referralCode = `DR-${firstName}-${randomDigits}`

      const link = `https://phytotherapy.ai/auth/login?ref=${referralCode}`

      const { error: insertError } = await supabase
        .from("doctor_referral_codes")
        .insert({
          doctor_id: user.id,
          code: referralCode,
          link,
        })

      if (insertError) {
        // Collision — try once more with different digits
        const retry = `DR-${firstName}-${Math.floor(Math.random() * 90) + 10}`
        const retryLink = `https://phytotherapy.ai/auth/login?ref=${retry}`
        const { error: retryError } = await supabase
          .from("doctor_referral_codes")
          .insert({ doctor_id: user.id, code: retry, link: retryLink })

        if (retryError) {
          return NextResponse.json({ error: "Failed to generate code" }, { status: 500 })
        }
        return NextResponse.json({ code: retry, link: retryLink })
      }

      return NextResponse.json({ code: referralCode, link })
    } catch (err) {
      console.error("Generate referral code error:", err)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }

  // === REDEEM ===
  if (action === "redeem") {
    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Code is required" }, { status: 400 })
    }

    try {
      // Validate code
      const { data: codeData } = await supabase
        .from("doctor_referral_codes")
        .select("id, doctor_id, is_active")
        .eq("code", code.trim().toUpperCase())
        .single()

      if (!codeData || !codeData.is_active) {
        return NextResponse.json({ error: "Invalid referral code" }, { status: 400 })
      }

      // Auth optional for redeem — patient may not be logged in yet
      const authHeader = req.headers.get("authorization")
      let patientId: string | null = null
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "")
        const { data: { user } } = await supabase.auth.getUser(token)
        patientId = user?.id || null
      }

      if (patientId) {
        // Check not self-referral
        if (patientId === codeData.doctor_id) {
          return NextResponse.json({ error: "Cannot redeem your own code" }, { status: 400 })
        }

        // Check not already redeemed
        const { data: existingRecord } = await supabase
          .from("referral_records")
          .select("id")
          .eq("patient_id", patientId)
          .eq("referral_code_id", codeData.id)
          .single()

        if (existingRecord) {
          return NextResponse.json({ error: "Code already redeemed" }, { status: 400 })
        }

        // Calculate credits
        const { data: doctorRecords } = await supabase
          .from("referral_records")
          .select("id")
          .eq("doctor_id", codeData.doctor_id)

        const totalReferrals = (doctorRecords?.length || 0) + 1
        let credits = 7 // base: 7 days premium
        if (totalReferrals >= 10) credits = 30
        else if (totalReferrals >= 5) credits = 14

        // Create record
        await supabase.from("referral_records").insert({
          referral_code_id: codeData.id,
          doctor_id: codeData.doctor_id,
          patient_id: patientId,
          status: "registered",
          credits_earned: credits,
        })
      }

      return NextResponse.json({ valid: true, doctorId: codeData.doctor_id })
    } catch (err) {
      console.error("Redeem referral code error:", err)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}
