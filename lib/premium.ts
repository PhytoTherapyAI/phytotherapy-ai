// © 2026 DoctoPal — All Rights Reserved
// ============================================
// Premium / Freemium System — Sprint 14
// ============================================

import type { SupabaseClient } from "@supabase/supabase-js";

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

  // Free plan: standard limits. Premium unlocks extra features.
  return {
    plan: "free",
    isTrialActive: false,
    trialEndsAt: null,
    trialDaysLeft: 0,
    isPremium: false,
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

// ─────────────────────────────────────────────
// Effective Premium (individual OR via family group)
// ─────────────────────────────────────────────
//
// getUserEffectivePremium decides whether a user should see premium
// features regardless of HOW they qualify:
//   - individual: their own user_profiles.plan is paid AND not expired
//   - family:     they are an accepted member of a family_group with
//                 plan_type='family_premium' whose plan_expires_at is still
//                 in the future
//   - none:       no valid premium source
//
// This is the single authoritative check server-side. Clients can mirror it
// via useEffectivePremium() (to be added in the UI commit) but the API
// gates use THIS function — never trust a client flag.

export type PremiumSource = "individual" | "family" | "none";

export interface EffectivePremium {
  isPremium: boolean;
  source: PremiumSource;
  expiresAt: string | null;
  // When source === 'family', this is the group that granted it. Useful for
  // the upgrade UI ("Premium comes from Grubun adı — no personal upgrade
  // needed").
  familyGroupId?: string | null;
}

export async function getUserEffectivePremium(
  userId: string,
  supabase: SupabaseClient
): Promise<EffectivePremium> {
  if (!userId) return { isPremium: false, source: "none", expiresAt: null };

  // 1. Individual premium — paid plan with a future expiry (null expiry is
  //    treated as "not configured, assume expired" to avoid free lifetime
  //    leakage on legacy rows).
  try {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("plan, premium_expires_at")
      .eq("id", userId)
      .maybeSingle();

    const plan = (profile as { plan?: string | null } | null)?.plan || "free";
    const individualExpiry = (profile as { premium_expires_at?: string | null } | null)?.premium_expires_at;
    const isPaidPlan = plan === "premium" || plan === "family" || plan === "doctor";
    const individualActive =
      isPaidPlan && !!individualExpiry && new Date(individualExpiry) > new Date();

    if (individualActive) {
      return {
        isPremium: true,
        source: "individual",
        expiresAt: individualExpiry || null,
      };
    }
  } catch {
    // Fall through to family check — never throw from a gate function.
  }

  // 2. Family premium — any accepted family group this user belongs to whose
  //    plan is still active wins.
  try {
    const { data: memberships } = await supabase
      .from("family_members")
      .select("group_id")
      .eq("user_id", userId)
      .eq("invite_status", "accepted");

    const groupIds = Array.from(
      new Set(
        (memberships || [])
          .map((m: { group_id: string | null }) => m.group_id)
          .filter((id): id is string => typeof id === "string" && id.length > 0)
      )
    );

    if (groupIds.length > 0) {
      const nowIso = new Date().toISOString();
      const { data: groups } = await supabase
        .from("family_groups")
        .select("id, plan_type, plan_expires_at")
        .in("id", groupIds)
        .eq("plan_type", "family_premium")
        .gt("plan_expires_at", nowIso)
        .order("plan_expires_at", { ascending: false })
        .limit(1);

      const g = groups?.[0] as { id: string; plan_expires_at: string } | undefined;
      if (g) {
        return {
          isPremium: true,
          source: "family",
          expiresAt: g.plan_expires_at,
          familyGroupId: g.id,
        };
      }
    }
  } catch {
    // Same: graceful fallback.
  }

  return { isPremium: false, source: "none", expiresAt: null };
}
