// © 2026 DoctoPal — All Rights Reserved
// ============================================
// Consent Management API
// POST /api/consent          → Grant new consent (with digital signature)
// DELETE /api/consent?id=X   → Withdraw consent
// GET /api/consent            → List active consents
// ============================================

import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { checkRateLimit } from "@/lib/rate-limit"
import { generateConsentSignature, type ConsentPurpose } from "@/lib/consent-management"

// ── Grant Consent ──
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown"
  const { allowed } = checkRateLimit(`consent:${ip}`, 10, 60000)
  if (!allowed) return NextResponse.json({ error: "Rate limit" }, { status: 429 })

  const authHeader = req.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const token = authHeader.replace("Bearer ", "")
  const supabase = createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const { purpose, dataCategories, recipientId, recipientName, recipientType, retentionPeriod, layeredDisclosureVersion } = body

    if (!purpose || !dataCategories?.length || !recipientId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const grantedAt = new Date().toISOString()

    // Calculate expiry
    let expiresAt: string | undefined
    if (retentionPeriod === "session") expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    else if (retentionPeriod === "30_days") expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    else if (retentionPeriod === "6_months") expiresAt = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
    else if (retentionPeriod === "12_months") expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    else if (retentionPeriod === "24_months") expiresAt = new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString()
    // "until_withdrawn" → no expiry

    // Generate digital signature
    const digitalSignature = generateConsentSignature({
      userId: user.id,
      purpose: purpose as ConsentPurpose,
      dataCategories,
      recipientId,
      retentionPeriod: retentionPeriod || "until_withdrawn",
      grantedAt,
    })

    const consentRecord = {
      user_id: user.id,
      purpose,
      data_categories: dataCategories,
      recipient_id: recipientId,
      recipient_name: recipientName || "Unknown",
      recipient_type: recipientType || "doctor",
      legal_basis: "explicit_consent",
      kvkk_article: "6/1",
      retention_period: retentionPeriod || "until_withdrawn",
      status: "active",
      granted_at: grantedAt,
      expires_at: expiresAt || null,
      digital_signature: digitalSignature,
      ip_address: ip,
      user_agent: req.headers.get("user-agent") || "unknown",
      layered_disclosure_version: layeredDisclosureVersion || "1.0",
      full_text_acknowledged: true,
    }

    // Save to database
    const { data, error: dbError } = await supabase.from("consent_records").insert(consentRecord).select().single()

    if (dbError) {
      console.warn("[CONSENT] DB insert error:", dbError.message)
      return NextResponse.json({
        success: false,
        error: "consent_save_failed",
        consentId: `local-${Date.now()}`,
        digitalSignature,
        grantedAt,
        expiresAt,
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      consentId: data.id,
      digitalSignature,
      grantedAt,
      expiresAt,
    })

  } catch (err) {
    console.error("[CONSENT] Error:", err)
    return NextResponse.json({ error: "Failed to record consent" }, { status: 500 })
  }
}

// ── Withdraw Consent ──
export async function DELETE(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const token = authHeader.replace("Bearer ", "")
  const supabase = createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(req.url)
  const consentId = url.searchParams.get("id")
  if (!consentId) return NextResponse.json({ error: "Consent ID required" }, { status: 400 })

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown"

  await supabase
    .from("consent_records")
    .update({ status: "withdrawn", withdrawn_at: new Date().toISOString() })
    .eq("id", consentId)
    .eq("user_id", user.id)


  return NextResponse.json({ success: true, withdrawn: true })
}

// ── List Active Consents ──
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const token = authHeader.replace("Bearer ", "")
  const supabase = createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data } = await supabase
    .from("consent_records")
    .select("*")
    .eq("user_id", user.id)
    .order("granted_at", { ascending: false })

  return NextResponse.json({ consents: data || [] })
}
