// © 2026 DoctoPal — All Rights Reserved
// ============================================
// Client-side Analytics — Sprint 19
// ============================================

export type AnalyticsEvent =
  | "page_view"
  | "query_submitted"
  | "interaction_check"
  | "blood_test_analyzed"
  | "supplement_added"
  | "check_in_completed"
  | "pdf_generated"
  | "share_card_created"
  | "side_effect_reported"
  | "family_member_added"
  | "premium_cta_clicked"
  | "trial_started"
  | "onboarding_completed"

export async function trackEvent(
  eventType: AnalyticsEvent,
  eventData?: Record<string, unknown>,
  userId?: string
) {
  try {
    // Fire and forget — don't block UI
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userId || null,
        eventType,
        eventData: eventData || {},
      }),
    }).catch(() => {
      // Silently fail — analytics should never block user experience
    })
  } catch {
    // Silently fail
  }
}
