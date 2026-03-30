// © 2026 Phytotherapy.ai — All Rights Reserved
// ============================================
// Premium / Freemium System — Sprint 14
// ============================================

export type PlanType = "free" | "premium" | "family" | "doctor";

export interface PremiumStatus {
  plan: PlanType;
  isTrialActive: boolean;
  trialEndsAt: string | null;
  trialDaysLeft: number;
  isPremium: boolean; // true if premium, family, or doctor OR trial active
}

// Trial duration in days
const TRIAL_DAYS = 7;

// ── Feature Gating ───────────────────────────
export type PremiumFeature =
  | "unlimited_queries"
  | "ai_pattern_detection"
  | "morning_evening_protocol"
  | "weekly_coaching_report"
  | "biological_age_score"
  | "metabolic_portfolio"
  | "washout_cycling"
  | "boss_fight"
  | "symptom_pattern"
  | "unlimited_blood_test"
  | "unlimited_pdf"
  | "doctor_pdf_email"
  | "barcode_scan"
  | "family_full_management"
  | "share_cards"
  | "weekly_summary_share"
  | "protocol_completion_card"
  | "seasonal_card"
  | "yearly_wrapped"
  | "anonymous_comparison"
  | "priority_support";

// Features available in FREE plan (never taken away)
const FREE_FEATURES: Set<string> = new Set([
  "health_queries_20_day",
  "personal_recommendations",
  "unlimited_chat",
  "calendar_meds_supplements",
  "water_tracking",
  "vital_tracking",
  "daily_tasks",
  "push_notifications",
  "phone_calendar_ics",
  "sport_appointment_events",
  "blood_test_3_month",
  "pdf_report_3_month",
  "daily_health_score",
  "vital_trend_graphs",
  "calorie_calculator",
  "query_history",
  "one_extra_family_profile",
  "gamification_badges",
]);

// ── Premium Status Calculator ────────────────
export function getPremiumStatus(profile: {
  plan?: PlanType | null;
  trial_started_at?: string | null;
  created_at?: string;
} | null): PremiumStatus {
  if (!profile) {
    return {
      plan: "free",
      isTrialActive: false,
      trialEndsAt: null,
      trialDaysLeft: 0,
      isPremium: false,
    };
  }

  const plan = profile.plan || "free";

  // Paid plans are always premium
  if (plan === "premium" || plan === "family" || plan === "doctor") {
    return {
      plan,
      isTrialActive: false,
      trialEndsAt: null,
      trialDaysLeft: 0,
      isPremium: true,
    };
  }

  // Hackathon mode: all features unlocked for demo
  return {
    plan: "free",
    isTrialActive: true,
    trialEndsAt: null,
    trialDaysLeft: 999,
    isPremium: true,
  };
}

// ── Feature Check ────────────────────────────
export function canAccessFeature(
  feature: PremiumFeature,
  status: PremiumStatus
): boolean {
  // If premium (paid or trial), all features available
  if (status.isPremium) return true;

  // Free users can't access premium features
  return false;
}

// ── Free Limits ──────────────────────────────
export const FREE_LIMITS = {
  queriesPerDay: 20,
  bloodTestsPerMonth: 3,
  pdfReportsPerMonth: 3,
  familyProfiles: 1, // 1 extra (total 2 including self)
};

export const PREMIUM_LIMITS = {
  queriesPerDay: Infinity,
  bloodTestsPerMonth: Infinity,
  pdfReportsPerMonth: Infinity,
  familyProfiles: 3, // total 3 extra
};

export const FAMILY_LIMITS = {
  queriesPerDay: Infinity,
  bloodTestsPerMonth: Infinity,
  pdfReportsPerMonth: Infinity,
  familyProfiles: 6, // 2 adults + 4 children/others
};

// ── Pricing ──────────────────────────────────
export const PRICING = {
  premium: {
    monthly: 99.99,
    yearly: 899.99,
    yearlySavings: 25, // percent
    currency: "TRY",
  },
  family: {
    monthly: 179.99,
    yearly: 1699.99,
    yearlySavings: 21,
    currency: "TRY",
  },
  doctor: {
    monthly: 499.99,
    yearly: 3999.99,
    yearlySavings: 33,
    currency: "TRY",
  },
};

// ── Trial Notification Days ──────────────────
export const TRIAL_NOTIFICATION_DAYS = [5, 7]; // Day 5 warning, Day 7 expired
