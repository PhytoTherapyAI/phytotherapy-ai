// © 2026 Doctopal — All Rights Reserved
// ============================================
// Smart Nudge Engine — Event-Driven Triggers
// Detects: Drop-off, Streak, Risk Alert
// ============================================

import { SupabaseClient } from "@supabase/supabase-js";
import { CRITICAL_INTERACTIONS } from "@/lib/safety-guardrail";

export type NudgeTrigger = "drop_off" | "streak" | "risk_alert";

export interface NudgeResult {
  userId: string;
  userName: string;
  trigger: NudgeTrigger;
  severity: "info" | "warning" | "urgent";
  lang: "en" | "tr";
  context: Record<string, string | number>;
}

// ── Drop-off: No activity for 2+ consecutive days ──
async function checkDropOff(supabase: SupabaseClient, targetUserId?: string): Promise<NudgeResult[]> {
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const cutoff = twoDaysAgo.toISOString().split("T")[0];

  // Get active bot subscribers
  let query = supabase
    .from("bot_subscriptions")
    .select("user_id, display_name, language")
    .eq("status", "active");

  if (targetUserId) query = query.eq("user_id", targetUserId);

  const { data: subs } = await query;
  if (!subs?.length) return [];

  const results: NudgeResult[] = [];

  for (const sub of subs) {
    // Check last activity
    const { data: lastCheckin } = await supabase
      .from("daily_check_ins")
      .select("check_date")
      .eq("user_id", sub.user_id)
      .order("check_date", { ascending: false })
      .limit(1)
      .single();

    const lastDate = lastCheckin?.check_date || "2000-01-01";
    if (lastDate <= cutoff) {
      // Check dedup: no drop_off nudge in last 48h
      const { count } = await supabase
        .from("nudge_log")
        .select("id", { count: "exact", head: true })
        .eq("user_id", sub.user_id)
        .eq("trigger_type", "drop_off")
        .gte("sent_at", twoDaysAgo.toISOString());

      if ((count || 0) === 0) {
        const daysSince = Math.floor((Date.now() - new Date(lastDate).getTime()) / 86400000);
        results.push({
          userId: sub.user_id,
          userName: sub.display_name || "",
          trigger: "drop_off",
          severity: daysSince >= 5 ? "warning" : "info",
          lang: (sub.language || "tr") as "en" | "tr",
          context: { missedDays: daysSince, lastActiveDate: lastDate, userName: sub.display_name || "" },
        });
      }
    }
  }
  return results;
}

// ── Streak: 7 consecutive days of check-ins ──
async function checkStreak(supabase: SupabaseClient, targetUserId?: string): Promise<NudgeResult[]> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  let query = supabase
    .from("bot_subscriptions")
    .select("user_id, display_name, language")
    .eq("status", "active");

  if (targetUserId) query = query.eq("user_id", targetUserId);
  const { data: subs } = await query;
  if (!subs?.length) return [];

  const results: NudgeResult[] = [];

  for (const sub of subs) {
    const { data: checkins } = await supabase
      .from("daily_check_ins")
      .select("check_date")
      .eq("user_id", sub.user_id)
      .gte("check_date", sevenDaysAgo.toISOString().split("T")[0])
      .order("check_date", { ascending: true });

    if (!checkins || checkins.length < 7) continue;

    // Verify 7 unique consecutive dates
    const uniqueDates = new Set(checkins.map((c: { check_date: string }) => c.check_date));
    if (uniqueDates.size < 7) continue;

    // Dedup: no streak nudge in last 7 days
    const { count } = await supabase
      .from("nudge_log")
      .select("id", { count: "exact", head: true })
      .eq("user_id", sub.user_id)
      .eq("trigger_type", "streak")
      .gte("sent_at", sevenDaysAgo.toISOString());

    if ((count || 0) === 0) {
      results.push({
        userId: sub.user_id,
        userName: sub.display_name || "",
        trigger: "streak",
        severity: "info",
        lang: (sub.language || "tr") as "en" | "tr",
        context: { streakDays: 7, userName: sub.display_name || "" },
      });
    }
  }
  return results;
}

// ── Risk Alert: Medication-supplement interaction detected ──
async function checkRiskAlerts(supabase: SupabaseClient, targetUserId?: string): Promise<NudgeResult[]> {
  let query = supabase
    .from("bot_subscriptions")
    .select("user_id, display_name, language")
    .eq("status", "active");

  if (targetUserId) query = query.eq("user_id", targetUserId);
  const { data: subs } = await query;
  if (!subs?.length) return [];

  const results: NudgeResult[] = [];
  const oneDayAgo = new Date(Date.now() - 86400000).toISOString();

  for (const sub of subs) {
    // Get user medications
    const { data: meds } = await supabase
      .from("user_medications")
      .select("generic_name, brand_name")
      .eq("user_id", sub.user_id)
      .eq("is_active", true);

    if (!meds?.length) continue;

    // Get user supplements
    const { data: supps } = await supabase
      .from("supplements")
      .select("name")
      .eq("user_id", sub.user_id);

    if (!supps?.length) continue;

    // Cross-reference with CRITICAL_INTERACTIONS from safety guardrail
    const medNames = meds.map((m: { generic_name: string | null; brand_name: string | null }) =>
      (m.generic_name || m.brand_name || "").toLowerCase()
    );

    let foundRisk = false;
    for (const supp of supps) {
      if (foundRisk) break;
      const suppName = (supp.name || "").toLowerCase();

      // Check each drug category in CRITICAL_INTERACTIONS
      for (const [drugCategory, data] of Object.entries(CRITICAL_INTERACTIONS)) {
        if (foundRisk) break;
        const matchesMed = medNames.some((m: string) => m.includes(drugCategory.toLowerCase()));
        if (!matchesMed) continue;

        const catData = data as { dangerous?: Array<{ herb: string; mechanism: string; risk: string }>; safe?: string[] };
        if (!catData.dangerous) continue;

        for (const interaction of catData.dangerous) {
          if (suppName.includes(interaction.herb.toLowerCase().split(" ")[0])) {
            if (interaction.risk === "LETHAL" || interaction.risk === "HIGH") {
              // Dedup
              const { count } = await supabase
                .from("nudge_log")
                .select("id", { count: "exact", head: true })
                .eq("user_id", sub.user_id)
                .eq("trigger_type", "risk_alert")
                .gte("sent_at", oneDayAgo);

              if ((count || 0) === 0) {
                results.push({
                  userId: sub.user_id,
                  userName: sub.display_name || "",
                  trigger: "risk_alert",
                  severity: "urgent",
                  lang: (sub.language || "tr") as "en" | "tr",
                  context: {
                    medication: meds[0].generic_name || meds[0].brand_name || "",
                    supplement: supp.name,
                    riskLevel: interaction.risk,
                    mechanism: interaction.mechanism,
                    userName: sub.display_name || "",
                  },
                });
                foundRisk = true;
              }
              break;
            }
          }
        }
      }
    }
  }
  return results;
}

// ── Main: Run all trigger checks ──
export async function checkNudgeTriggers(
  supabase: SupabaseClient,
  targetUserId?: string
): Promise<NudgeResult[]> {
  const [dropOffs, streaks, riskAlerts] = await Promise.all([
    checkDropOff(supabase, targetUserId),
    checkStreak(supabase, targetUserId),
    checkRiskAlerts(supabase, targetUserId),
  ]);

  // Risk alerts first (most urgent), then drop-offs, then streaks
  return [...riskAlerts, ...dropOffs, ...streaks];
}
