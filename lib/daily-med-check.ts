"use client";

import { useState, useEffect, useCallback } from "react";

const DAILY_KEY = "phyto_med_confirmed_date";
const ONBOARDING_REFRESH_KEY = "phyto_onboarding_refresh_date";

function getToday(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

// ══════════════════════════════════════════
// Daily medication confirmation (every day)
// ══════════════════════════════════════════

/** Check if daily medication confirmation was done today */
export function isDailyMedConfirmed(): boolean {
  if (typeof window === "undefined") return true; // SSR safe
  try {
    return localStorage.getItem(DAILY_KEY) === getToday();
  } catch {
    return false;
  }
}

/** Mark daily medication as confirmed for today */
export function confirmDailyMed(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DAILY_KEY, getToday());
  } catch {
    // localStorage unavailable
  }
}

// ══════════════════════════════════════════
// 30-day onboarding refresh
// ══════════════════════════════════════════

/** Check if 30-day onboarding refresh is needed */
export function isOnboardingRefreshNeeded(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const last = localStorage.getItem(ONBOARDING_REFRESH_KEY);
    if (!last) return true; // never refreshed
    const lastDate = new Date(last);
    const now = new Date();
    const daysSince = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince >= 30;
  } catch {
    return true;
  }
}

/** Mark onboarding refresh as completed */
export function confirmOnboardingRefresh(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ONBOARDING_REFRESH_KEY, getToday());
  } catch {
    // localStorage unavailable
  }
}

// ══════════════════════════════════════════
// Clear all (called on sign-out)
// ══════════════════════════════════════════

/** Clear all check localStorage keys (called on sign-out) */
export function clearDailyMedCheck(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DAILY_KEY);
    // NOTE: We do NOT clear ONBOARDING_REFRESH_KEY on sign-out
    // because the 30-day cycle should persist across sessions
  } catch {
    // localStorage unavailable
  }
}

// ══════════════════════════════════════════
// React hook
// ══════════════════════════════════════════

export function useDailyMedCheck() {
  const [needsDailyCheck, setNeedsDailyCheck] = useState(false);
  const [needsOnboardingRefresh, setNeedsOnboardingRefresh] = useState(false);

  useEffect(() => {
    setNeedsDailyCheck(!isDailyMedConfirmed());
    setNeedsOnboardingRefresh(isOnboardingRefreshNeeded());
  }, []);

  const confirmDaily = useCallback(() => {
    confirmDailyMed();
    setNeedsDailyCheck(false);
  }, []);

  const confirmRefresh = useCallback(() => {
    confirmOnboardingRefresh();
    confirmDailyMed(); // also confirms daily
    setNeedsOnboardingRefresh(false);
    setNeedsDailyCheck(false);
  }, []);

  return { needsDailyCheck, confirmDaily, needsOnboardingRefresh, confirmRefresh };
}
