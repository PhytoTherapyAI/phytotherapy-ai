// © 2026 DoctoPal — All Rights Reserved
// ============================================
// DailyHealthLog — Unified daily health context
// Aggregates sleep sessions, dream notes, context tags,
// medications, and vitals into one document per day
// ============================================

import { SupabaseClient } from "@supabase/supabase-js";

// ── Schema ──
export interface SleepSessionData {
  startTime: string;
  endTime: string;
  type: "night" | "nap";
  quality: number;
  durationHours: number;
}

export interface DreamLogData {
  content: string;
  medicationTags: string[];
  timestamp: string;
}

export interface DailyHealthLog {
  userId: string;
  date: string;
  contextTags: string[];  // e.g., ['on_call', 'traveling', 'exam_stress']
  sleepSessions: SleepSessionData[];
  totalSleepHours: number;
  grogginess: number;     // 1-5 morning energy
  dreamLog: DreamLogData | null;
  medications: Array<{ name: string; generic: string | null }>;
  supplements: Array<{ name: string; takenToday: boolean }>;
  vitals: { weight: number | null; heartRate: number | null; bp: string | null };
  circadianPhase: string;
  checkIn: { energy: number; mood: number; bloating: number } | null;
}

// ── Fetch today's unified context ──
export async function fetchDailyHealthLog(
  supabase: SupabaseClient,
  userId: string,
  date?: string
): Promise<DailyHealthLog> {
  const targetDate = date || new Date().toISOString().split("T")[0];
  const now = new Date();
  const hour = now.getHours();

  // Parallel queries
  const [
    sleepRes, medsRes, suppsRes, vitalsRes, checkInRes, profileRes,
  ] = await Promise.all([
    supabase.from("sleep_records").select("*").eq("user_id", userId).eq("date", targetDate).limit(10),
    supabase.from("user_medications").select("brand_name, generic_name").eq("user_id", userId).eq("is_active", true),
    supabase.from("supplements").select("name, taken_today").eq("user_id", userId),
    supabase.from("vital_records").select("weight, heart_rate, systolic, diastolic").eq("user_id", userId).order("recorded_at", { ascending: false }).limit(1),
    supabase.from("daily_check_ins").select("energy_level, mood_level, bloating_level").eq("user_id", userId).eq("check_date", targetDate).single(),
    supabase.from("user_profiles").select("full_name").eq("id", userId).single(),
  ]);

  const sleepRecords = sleepRes.data || [];
  const meds = (medsRes.data || []).map((m: { brand_name: string | null; generic_name: string | null }) => ({
    name: m.brand_name || m.generic_name || "",
    generic: m.generic_name,
  }));
  const supps = (suppsRes.data || []).map((s: { name: string; taken_today: boolean }) => ({
    name: s.name,
    takenToday: s.taken_today || false,
  }));
  const vitals = vitalsRes.data?.[0];
  const checkIn = checkInRes.data;

  // Convert sleep records to sessions
  const sessions: SleepSessionData[] = sleepRecords.map((r: {
    bedtime: string | null; wake_time: string | null;
    sleep_duration: number | null; sleep_quality: number;
    factors: string[];
  }) => ({
    startTime: r.bedtime || "23:00",
    endTime: r.wake_time || "07:00",
    type: "night" as const,
    quality: r.sleep_quality || 3,
    durationHours: r.sleep_duration || 0,
  }));

  const totalSleep = sessions.reduce((acc, s) => acc + s.durationHours, 0);

  // Determine circadian phase
  let circadianPhase: string;
  if (hour >= 6 && hour < 9) circadianPhase = "morning_rise";
  else if (hour >= 9 && hour < 12) circadianPhase = "peak_focus";
  else if (hour >= 12 && hour < 14) circadianPhase = "midday_dip";
  else if (hour >= 14 && hour < 17) circadianPhase = "afternoon_peak";
  else if (hour >= 17 && hour < 20) circadianPhase = "wind_down";
  else if (hour >= 20 && hour < 23) circadianPhase = "melatonin_rising";
  else circadianPhase = "deep_sleep_window";

  return {
    userId,
    date: targetDate,
    contextTags: sleepRecords[0]?.factors || [],
    sleepSessions: sessions,
    totalSleepHours: Math.round(totalSleep * 10) / 10,
    grogginess: 3, // default, updated from frontend
    dreamLog: null, // populated from frontend
    medications: meds,
    supplements: supps,
    vitals: {
      weight: vitals?.weight || null,
      heartRate: vitals?.heart_rate || null,
      bp: vitals?.systolic && vitals?.diastolic ? `${vitals.systolic}/${vitals.diastolic}` : null,
    },
    circadianPhase,
    checkIn: checkIn ? {
      energy: checkIn.energy_level || 0,
      mood: checkIn.mood_level || 0,
      bloating: checkIn.bloating_level || 0,
    } : null,
  };
}

// ── Build optimized prompt context (token-efficient) ──
export function buildPromptContext(log: DailyHealthLog): string {
  const parts: string[] = [];

  parts.push(`Date: ${log.date}`);
  parts.push(`Circadian: ${log.circadianPhase}`);

  if (log.contextTags.length > 0) {
    parts.push(`Context: ${log.contextTags.join(", ")}`);
  }

  if (log.sleepSessions.length > 0) {
    const sessStr = log.sleepSessions
      .map((s) => `${s.type}(${s.startTime}-${s.endTime},${s.durationHours}h,q${s.quality})`)
      .join(" + ");
    parts.push(`Sleep: ${sessStr} = ${log.totalSleepHours}h total`);
  }

  if (log.grogginess !== 3) {
    parts.push(`Morning energy: ${log.grogginess}/5`);
  }

  if (log.dreamLog?.content) {
    parts.push(`Dream: "${log.dreamLog.content.slice(0, 150)}"`);
    if (log.dreamLog.medicationTags.length > 0) {
      parts.push(`Dream-related meds: ${log.dreamLog.medicationTags.join(", ")}`);
    }
  }

  if (log.medications.length > 0) {
    parts.push(`Meds: ${log.medications.map((m) => m.name).join(", ")}`);
  }

  if (log.supplements.length > 0) {
    const taken = log.supplements.filter((s) => s.takenToday).map((s) => s.name);
    const untaken = log.supplements.filter((s) => !s.takenToday).map((s) => s.name);
    if (taken.length > 0) parts.push(`Supps taken: ${taken.join(", ")}`);
    if (untaken.length > 0) parts.push(`Supps pending: ${untaken.join(", ")}`);
  }

  if (log.checkIn) {
    parts.push(`Check-in: energy=${log.checkIn.energy}/5, mood=${log.checkIn.mood}/5`);
  }

  return parts.join(" | ");
}
