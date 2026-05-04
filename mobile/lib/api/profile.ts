// © 2026 DoctoPal — All Rights Reserved
// Sprint 31 Commit 1 — Read-only profile fetch.
//
// Web parity: components/profile-v2/hooks/useProfileData.ts (web fetches the
// same 3 sources via Promise.all). Mobile read-only version — no edit
// callbacks, no draft persist, no allergy/med insert helpers (Sprint 32+).
//
// Data sources:
//   - user_profiles  → personal + medical flags (chronic_conditions includes
//     "surgery:" / "family:" / "menopause" prefix entries — caller filters)
//   - user_medications → active meds only (is_active = true)
//   - user_allergies   → all rows
//
// RLS: every table has own_select policy keyed on auth.uid(); no extra
// auth scoping needed beyond the .eq("user_id", userId) we pass.
import { supabase } from "@/lib/supabase";

export interface UserProfile {
  id: string;
  full_name: string | null;
  age: number | null;
  gender: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  blood_group: string | null;
  chronic_conditions: string[] | null;
  is_pregnant: boolean | null;
  is_breastfeeding: boolean | null;
  kidney_disease: boolean | null;
  liver_disease: boolean | null;
}

export interface UserMedication {
  id: string;
  brand_name: string | null;
  generic_name: string | null;
  dosage: string | null;
  frequency: string | null;
  is_active: boolean;
}

export interface UserAllergy {
  id: string;
  allergen: string;
  severity: string | null;
}

export interface ProfileData {
  profile: UserProfile | null;
  medications: UserMedication[];
  allergies: UserAllergy[];
}

export async function fetchUserProfile(userId: string): Promise<ProfileData> {
  const [profileRes, medsRes, allergiesRes] = await Promise.all([
    supabase
      .from("user_profiles")
      .select(
        "id, full_name, age, gender, height_cm, weight_kg, blood_group, chronic_conditions, is_pregnant, is_breastfeeding, kidney_disease, liver_disease",
      )
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("user_medications")
      .select("id, brand_name, generic_name, dosage, frequency, is_active")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("user_allergies")
      .select("id, allergen, severity")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  // Profile fetch failure is fatal — surfaces RLS or network issue early.
  // Meds/allergies failures are non-fatal: fall through with empty array
  // so the user still sees personal info (web parity, useProfileData line 197).
  if (profileRes.error) {
    throw new Error(`Profile fetch failed: ${profileRes.error.message}`);
  }

  return {
    profile: (profileRes.data as UserProfile | null) ?? null,
    medications: (medsRes.data ?? []) as UserMedication[],
    allergies: (allergiesRes.data ?? []) as UserAllergy[],
  };
}

// ───── Helpers (used by profile screen) ─────

/** Filter out prefixed entries (surgery: / family: / menopause). */
export function filterChronicConditions(arr: string[] | null | undefined): string[] {
  if (!Array.isArray(arr)) return [];
  return arr.filter(
    (c) =>
      typeof c === "string" &&
      !c.startsWith("surgery:") &&
      !c.startsWith("family:") &&
      c.toLowerCase() !== "menopause",
  );
}

/** BMI = kg / (m^2). Returns null if either input missing. */
export function calculateBMI(heightCm: number | null, weightKg: number | null): number | null {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) return null;
  const meters = heightCm / 100;
  return weightKg / (meters * meters);
}

/** TR BMI category. WHO bands: <18.5 / 18.5-25 / 25-30 / 30+. */
export function bmiCategoryTR(bmi: number): string {
  if (bmi < 18.5) return "Düşük kilolu";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Fazla kilolu";
  return "Obez";
}

/** TR gender label. Falls through to raw value for unknown strings. */
export function genderLabelTR(gender: string | null | undefined): string | null {
  if (!gender) return null;
  if (gender === "male") return "Erkek";
  if (gender === "female") return "Kadın";
  return gender; // unknown value — display as-is rather than hiding
}
