// © 2026 DoctoPal — All Rights Reserved
//
// F-PROFILE-001 Commit 2.1: shared read layer for the ShellV2 tabs.
// Today the hook is consumed by BodyLifestyle + MedicalHistory +
// (Commit 2.2) Medications. Keeping the fetch in one place:
//   - de-dupes network work when the user toggles between tabs
//   - lets Commit 2.2 pull medications without re-wiring Supabase
//   - gives us a single refetch() surface that Medications can call
//     after an insert so the other tabs (which also display the same
//     meds in the ChronicConditionsEditor's "med → condition" mapping)
//     see the new row immediately
//
// Write path NOT owned here — each tab calls Supabase directly for its
// own updates (matches LegacyProfilePage pattern; keeps this hook
// small + read-only; no single "god-save" fn to break).
//
// Cross-view consistency note: ShellV2 renders by default, Legacy
// renders only with `?legacy=true`. The two never mount together, so
// a duplicate fetch / double insert isn't possible. When the user
// flips between them, each mount triggers its own fresh fetch → the
// Supabase row is canonical, state syncs.
"use client"

import { useCallback, useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase"
import type { UserMedication } from "@/lib/database.types"

export interface UserAllergyRow {
  id: string
  allergen: string
  severity: string | null
}

export interface ProfileDataState {
  medications: UserMedication[]
  allergies: UserAllergyRow[]
  labTestCount: number
  streakDays: number
  familyMemberCount: number
  loading: boolean
}

export interface UseProfileDataResult extends ProfileDataState {
  refetch: () => Promise<void>
  setMedications: React.Dispatch<React.SetStateAction<UserMedication[]>>
  setAllergies: React.Dispatch<React.SetStateAction<UserAllergyRow[]>>
}

const EMPTY: ProfileDataState = {
  medications: [],
  allergies: [],
  labTestCount: 0,
  streakDays: 0,
  familyMemberCount: 0,
  loading: false,
}

// Legacy profile page streak algorithm ([app/profile/page.tsx] 556-567):
// count consecutive days from today backward in the check-in series.
function computeStreak(rows: { check_date: string }[]): number {
  if (!rows || rows.length === 0) return 0
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 0; i < rows.length; i++) {
    const d = new Date(rows[i].check_date)
    d.setHours(0, 0, 0, 0)
    const expected = new Date(today)
    expected.setDate(expected.getDate() - i)
    if (d.getTime() === expected.getTime()) streak++
    else break
  }
  return streak
}

export function useProfileData(userId: string | null | undefined): UseProfileDataResult {
  const [medications, setMedications] = useState<UserMedication[]>([])
  const [allergies, setAllergies] = useState<UserAllergyRow[]>([])
  const [labTestCount, setLabTestCount] = useState(0)
  const [streakDays, setStreakDays] = useState(0)
  const [familyMemberCount, setFamilyMemberCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const refetch = useCallback(async () => {
    if (!userId) {
      setMedications([])
      setAllergies([])
      setLabTestCount(0)
      setStreakDays(0)
      setFamilyMemberCount(0)
      return
    }
    setLoading(true)
    try {
      const supabase = createBrowserClient()
      // F-PROFILE-001 Commit 5: 2 new queries added for HealthReportTab:
      //   - daily_check_ins (streak calculation)
      //   - family_members (family count stat card). Column is `owner_id`
      //     (confirmed in app/badges/page.tsx:43), NOT `owner_user_id`.
      // Both run inside the existing Promise.all — no extra round trip.
      const [medsRes, allergiesRes, labsRes, checkInsRes, familyRes] = await Promise.all([
        supabase
          .from("user_medications")
          .select("*")
          .eq("user_id", userId)
          .eq("is_active", true),
        supabase
          .from("user_allergies")
          .select("id, allergen, severity")
          .eq("user_id", userId),
        supabase
          .from("blood_tests")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),
        supabase
          .from("daily_check_ins")
          .select("check_date")
          .eq("user_id", userId)
          .order("check_date", { ascending: false })
          .limit(30),
        supabase
          .from("family_members")
          .select("id", { count: "exact", head: true })
          .eq("owner_id", userId),
      ])
      if (medsRes.data) setMedications(medsRes.data as UserMedication[])
      if (allergiesRes.data) setAllergies(allergiesRes.data as UserAllergyRow[])
      setLabTestCount(typeof labsRes.count === "number" ? labsRes.count : 0)
      setStreakDays(
        checkInsRes.data ? computeStreak(checkInsRes.data as { check_date: string }[]) : 0,
      )
      setFamilyMemberCount(typeof familyRes.count === "number" ? familyRes.count : 0)
    } catch {
      // soft fail — UI reads whatever state is already populated;
      // next mount / refetch() retries
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return {
    medications,
    allergies,
    labTestCount,
    streakDays,
    familyMemberCount,
    loading: loading && medications.length === 0,
    refetch,
    setMedications,
    setAllergies,
  }
}

// Keep a stable "empty" export so tests and placeholder states can
// skip the hook without the type widening.
export const EMPTY_PROFILE_DATA: ProfileDataState = EMPTY
