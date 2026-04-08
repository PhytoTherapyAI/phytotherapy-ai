// © 2026 DoctoPal — All Rights Reserved
// ============================================
// Secure Document Viewing API — Admin Only
// Generates time-limited signed URLs (15min expiry)
// ============================================

import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { checkRateLimit } from "@/lib/rate-limit"
import {
  decryptReference,
  createAuditEntry,
  SIGNED_URL_EXPIRY,
  STORAGE_BUCKET,
} from "@/lib/secure-storage"

export async function POST(req: Request) {
  // 1. Rate limit — 20 views per minute (admin use)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown"
  const { allowed } = checkRateLimit(`doc-view:${ip}`, 20, 60000)
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
  }

  // 2. Auth — Bearer token required
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

  // 3. Check admin privileges
  // For now: check if user is doctor_verified or in admin list
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("is_doctor_verified, user_id")
    .eq("user_id", user.id)
    .single()

  const isAdmin = profile?.is_doctor_verified === true
  // In production, use a proper admin roles table

  try {
    const { encryptedPath, documentUserId } = await req.json()

    if (!encryptedPath) {
      return NextResponse.json({ error: "Encrypted path required" }, { status: 400 })
    }

    // 4. Non-admins can only view their own documents
    if (!isAdmin && documentUserId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // 5. Decrypt the storage path
    let storagePath: string
    try {
      storagePath = decryptReference(encryptedPath)
    } catch {
      return NextResponse.json({ error: "Invalid document reference" }, { status: 400 })
    }

    // 6. Generate signed URL (15 minutes expiry)
    // Supabase handles decryption transparently — AES-256 at rest
    // is decrypted on-the-fly when accessed via signed URL
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(storagePath, SIGNED_URL_EXPIRY)

    if (signedUrlError) {
      console.error("Signed URL error:", signedUrlError)
      return NextResponse.json({ error: "Failed to generate viewing link" }, { status: 500 })
    }

    // 7. Audit log — track who viewed what
    const audit = createAuditEntry("view", documentUserId || user.id, storagePath, {
      adminId: isAdmin ? user.id : undefined,
      ipAddress: ip,
      details: `Signed URL generated (${SIGNED_URL_EXPIRY}s expiry)`,
    })

    return NextResponse.json({
      signedUrl: signedUrlData.signedUrl,
      expiresIn: SIGNED_URL_EXPIRY,
      expiresAt: new Date(Date.now() + SIGNED_URL_EXPIRY * 1000).toISOString(),
    })

  } catch (error) {
    console.error("View error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
