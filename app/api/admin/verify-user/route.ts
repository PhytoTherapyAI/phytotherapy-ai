// ============================================
// Admin: Verify/Reject User API
// POST /api/admin/verify-user
// Triggers email notification on status change
// ============================================

import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { checkRateLimit } from "@/lib/rate-limit"
import { sendVerificationEmail } from "@/lib/emails/send"
import { renderApprovedEmail } from "@/lib/emails/verification-approved"
import { renderRejectedEmail } from "@/lib/emails/verification-rejected"
import { createAuditEntry } from "@/lib/secure-storage"

interface VerifyRequest {
  targetUserId: string       // user being verified
  action: "approve" | "reject"
  rejectionReason?: string   // required if action === "reject"
  adminNotes?: string        // internal notes
}

export async function POST(req: Request) {
  // 1. Rate limit
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown"
  const { allowed } = checkRateLimit(`admin-verify:${ip}`, 30, 60000)
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
  }

  // 2. Auth — admin must be authenticated
  const authHeader = req.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const token = authHeader.replace("Bearer ", "")
  const supabase = createServerClient()
  const { data: { user: adminUser }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 3. Verify admin privileges
  const { data: adminProfile } = await supabase
    .from("user_profiles")
    .select("is_doctor_verified")
    .eq("user_id", adminUser.id)
    .single()

  if (!adminProfile?.is_doctor_verified) {
    return NextResponse.json({ error: "Admin privileges required" }, { status: 403 })
  }

  try {
    const body: VerifyRequest = await req.json()
    const { targetUserId, action, rejectionReason, adminNotes } = body

    // 4. Validate input
    if (!targetUserId || !action) {
      return NextResponse.json({ error: "targetUserId and action required" }, { status: 400 })
    }
    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "action must be 'approve' or 'reject'" }, { status: 400 })
    }
    if (action === "reject" && !rejectionReason) {
      return NextResponse.json({ error: "rejectionReason required for rejection" }, { status: 400 })
    }

    // 5. Get target user info
    const { data: targetProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("full_name, user_id")
      .eq("user_id", targetUserId)
      .single()

    if (profileError || !targetProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get user email from auth
    const { data: { user: targetUser } } = await supabase.auth.admin.getUserById(targetUserId)
    const targetEmail = targetUser?.email

    // 6. Get user profession for email
    let profession = "Health Professional"
    try {
      const { data: docs } = await supabase
        .from("verification_documents")
        .select("document_type")
        .eq("user_id", targetUserId)
        .limit(1)
      if (docs?.[0]) profession = docs[0].document_type
    } catch {}

    // 7. Update verification status
    const newStatus = action === "approve" ? "approved" : "rejected"
    const now = new Date().toISOString()

    // Update user_profiles
    await supabase
      .from("user_profiles")
      .update({
        verification_status: newStatus,
        is_doctor_verified: action === "approve",
      })
      .eq("user_id", targetUserId)

    // Update verification_documents
    await supabase
      .from("verification_documents")
      .update({
        verification_status: newStatus,
        reviewed_by: adminUser.id,
        reviewed_at: now,
        rejection_reason: action === "reject" ? rejectionReason : null,
        reviewer_notes: adminNotes || null,
      })
      .eq("user_id", targetUserId)

    // 8. Send email notification
    let emailResult: { success: boolean; messageId?: string; error?: string } = { success: false, error: "No email" }
    if (targetEmail) {
      // Detect user language (default to TR for Turkish names)
      const lang = targetProfile.full_name?.match(/[ğüşıöçĞÜŞİÖÇ]/) ? "tr" : "en"

      if (action === "approve") {
        const html = renderApprovedEmail({
          recipientName: targetProfile.full_name || "Professional",
          profession,
          lang: lang as "en" | "tr",
        })
        emailResult = await sendVerificationEmail(
          targetEmail,
          lang === "tr" ? "Tebrikler, Profiliniz Onaylandı! ✅" : "Congratulations, Your Profile is Verified! ✅",
          html
        )
      } else {
        const html = renderRejectedEmail({
          recipientName: targetProfile.full_name || "Professional",
          rejectionReason: rejectionReason!,
          lang: lang as "en" | "tr",
        })
        emailResult = await sendVerificationEmail(
          targetEmail,
          lang === "tr" ? "Profil Onay Süreciniz Hakkında" : "Regarding Your Profile Verification",
          html
        )
      }
    }

    // 9. Audit log
    const audit = createAuditEntry(
      action === "approve" ? "verify" : "reject",
      targetUserId,
      "profile",
      {
        adminId: adminUser.id,
        ipAddress: ip,
        details: action === "reject" ? `Reason: ${rejectionReason}` : "Approved",
      }
    )

    // 10. Save audit to DB
    await supabase.from("verification_audit_log").insert({
      action: action === "approve" ? "verify" : "reject",
      user_id: targetUserId,
      document_id: "profile",
      admin_id: adminUser.id,
      ip_address: ip,
      details: action === "reject" ? `Reason: ${rejectionReason}` : "Approved",
    })

    return NextResponse.json({
      success: true,
      action,
      userId: targetUserId,
      emailSent: emailResult.success,
      emailId: emailResult.success ? (emailResult as any).messageId : undefined,
    })

  } catch (error) {
    console.error("Verify user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
