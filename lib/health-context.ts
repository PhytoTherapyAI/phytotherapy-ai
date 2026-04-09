// © 2026 DoctoPal — All Rights Reserved
// ============================================
// Health Context Aggregator
// Collects data from all modules into a unified payload
// for cross-module AI analysis
// ============================================

import { SupabaseClient } from "@supabase/supabase-js";

// ── Unified Context Type ──
export interface HealthContext {
  user: {
    id: string;
    name: string;
    age: number | null;
    gender: string | null;
    conditions: string[];
  };
  medications: Array<{ name: string; generic: string | null; dosage: string | null }>;
  allergies: string[];
  sleep: {
    lastNight: { duration: number; quality: number; factors: string[] } | null;
    weekAvg: number;
    sleepDebt: number;  // hours behind target (7.5h * 7)
    consistency: string; // from analysis
  };
  fitness: {
    sportType: string | null;
    goal: string | null;
    frequency: number;
    lastQuery: string | null;  // most recent sports query
  };
  nutrition: {
    calorieTarget: number | null;
    recentCheckIns: Array<{ date: string; energy: number; mood: number }>;
  };
  supplements: Array<{ name: string; takenToday: boolean }>;
  vitals: {
    lastWeight: number | null;
    lastBP: string | null;
    lastHeartRate: number | null;
  };
  streaks: {
    checkInStreak: number;
    supplementStreak: number;
  };
  timestamp: string;
}

// ── Aggregate all module data ──
export async function aggregateHealthContext(
  supabase: SupabaseClient,
  userId: string
): Promise<HealthContext> {
  const today = new Date().toISOString().split("T")[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];

  // Parallel fetch all data sources
  const [
    profileRes,
    medsRes,
    allergiesRes,
    sleepRes,
    sleepAnalysisRes,
    checkInsRes,
    suppsRes,
    vitalsRes,
    sportsQueryRes,
  ] = await Promise.all([
    supabase.from("user_profiles").select("full_name, age, gender, chronic_conditions").eq("id", userId).single(),
    supabase.from("user_medications").select("brand_name, generic_name, dosage").eq("user_id", userId).eq("is_active", true),
    supabase.from("user_allergies").select("allergen").eq("user_id", userId),
    supabase.from("sleep_records").select("*").eq("user_id", userId).gte("date", sevenDaysAgo).order("date", { ascending: false }).limit(7),
    supabase.from("sleep_records").select("sleep_duration").eq("user_id", userId).gte("date", sevenDaysAgo),
    supabase.from("daily_check_ins").select("check_date, energy_level, mood").eq("user_id", userId).gte("check_date", sevenDaysAgo).order("check_date", { ascending: false }),
    supabase.from("supplements").select("name, taken_today").eq("user_id", userId),
    supabase.from("vital_records").select("weight, systolic, diastolic, heart_rate, recorded_at").eq("user_id", userId).order("recorded_at", { ascending: false }).limit(1),
    supabase.from("query_history").select("query_text").eq("user_id", userId).eq("query_type", "sports").order("created_at", { ascending: false }).limit(1),
  ]);

  const profile = profileRes.data;
  const meds = medsRes.data || [];
  const allergies = (allergiesRes.data || []).map((a: { allergen: string }) => a.allergen);
  const sleepRecords = sleepRes.data || [];
  const allSleepWeek = sleepAnalysisRes.data || [];
  const checkIns = checkInsRes.data || [];
  const supps = suppsRes.data || [];
  const vitals = vitalsRes.data?.[0];
  const lastSportsQuery = sportsQueryRes.data?.[0]?.query_text || null;

  // Sleep calculations
  const lastNightSleep = sleepRecords[0];
  const weekDurations = allSleepWeek.map((r: { sleep_duration: number | null }) => r.sleep_duration || 0);
  const weekAvg = weekDurations.length > 0 ? weekDurations.reduce((a: number, b: number) => a + b, 0) / weekDurations.length : 0;
  const totalSlept = weekDurations.reduce((a: number, b: number) => a + b, 0);
  const sleepDebt = Math.max(0, 7.5 * 7 - totalSlept);

  // Streak calculation
  let checkInStreak = 0;
  const sortedCheckIns = [...checkIns].sort((a, b) => b.check_date.localeCompare(a.check_date));
  for (const ci of sortedCheckIns) {
    const expected = new Date(Date.now() - checkInStreak * 86400000).toISOString().split("T")[0];
    if (ci.check_date === expected) checkInStreak++;
    else break;
  }

  // Parse sports query
  let sportType: string | null = null;
  let sportGoal: string | null = null;
  if (lastSportsQuery) {
    const match = lastSportsQuery.match(/Sports Performance: (.+)/);
    if (match) {
      const parts = match[1].split(" - ");
      sportType = parts[0] || null;
      sportGoal = parts[1] || null;
    }
  }

  return {
    user: {
      id: userId,
      name: profile?.full_name || "",
      age: profile?.age || null,
      gender: profile?.gender || null,
      conditions: profile?.chronic_conditions || [],
    },
    medications: meds.map((m: { brand_name: string | null; generic_name: string | null; dosage: string | null }) => ({
      name: m.brand_name || m.generic_name || "",
      generic: m.generic_name,
      dosage: m.dosage,
    })),
    allergies,
    sleep: {
      lastNight: lastNightSleep ? {
        duration: lastNightSleep.sleep_duration || 0,
        quality: lastNightSleep.sleep_quality || 0,
        factors: lastNightSleep.factors || [],
      } : null,
      weekAvg: Math.round(weekAvg * 10) / 10,
      sleepDebt: Math.round(sleepDebt * 10) / 10,
      consistency: weekDurations.length >= 5 ? "tracked" : "insufficient",
    },
    fitness: {
      sportType,
      goal: sportGoal,
      frequency: 3,
      lastQuery: lastSportsQuery,
    },
    nutrition: {
      calorieTarget: null,
      recentCheckIns: checkIns.map((c: { check_date: string; energy_level: number; mood: number }) => ({
        date: c.check_date,
        energy: c.energy_level || 0,
        mood: c.mood || 0,
      })),
    },
    supplements: supps.map((s: { name: string; taken_today: boolean }) => ({
      name: s.name,
      takenToday: s.taken_today || false,
    })),
    vitals: {
      lastWeight: vitals?.weight || null,
      lastBP: vitals?.systolic && vitals?.diastolic ? `${vitals.systolic}/${vitals.diastolic}` : null,
      lastHeartRate: vitals?.heart_rate || null,
    },
    streaks: {
      checkInStreak,
      supplementStreak: 0, // calculated client-side from localStorage
    },
    timestamp: new Date().toISOString(),
  };
}
