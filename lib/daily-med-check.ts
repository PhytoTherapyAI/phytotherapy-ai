"use client";

import { useState, useEffect, useCallback } from "react";

const DAILY_KEY = "phyto_med_confirmed_date";
const ONBOARDING_REFRESH_KEY = "phyto_onboarding_refresh_date";
const FIRST_LOGIN_KEY = "phyto_first_login_done";

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

// ══════════════════════════════════════════
// Daily medication confirmation (every day)
// ══════════════════════════════════════════

export function isDailyMedConfirmed(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(DAILY_KEY) === getToday();
  } catch {
    return false;
  }
}

export function confirmDailyMed(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DAILY_KEY, getToday());
  } catch {}
}

// ══════════════════════════════════════════
// 30-day onboarding refresh
// ══════════════════════════════════════════

export function isOnboardingRefreshNeeded(): boolean {
  if (typeof window === "undefined") return false;
  try {
    // If user hasn't completed first login flow yet, don't show refresh
    if (!localStorage.getItem(FIRST_LOGIN_KEY)) return false;

    const last = localStorage.getItem(ONBOARDING_REFRESH_KEY);
    if (!last) return false; // No saved date = just completed onboarding, don't show
    const lastDate = new Date(last);
    const now = new Date();
    const daysSince = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince >= 30;
  } catch {
    return false;
  }
}

export function confirmOnboardingRefresh(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ONBOARDING_REFRESH_KEY, getToday());
    // Also mark first login as done
    localStorage.setItem(FIRST_LOGIN_KEY, "true");
  } catch {}
}

/** Call after first successful onboarding completion */
export function markFirstLoginDone(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FIRST_LOGIN_KEY, "true");
    localStorage.setItem(ONBOARDING_REFRESH_KEY, getToday());
    localStorage.setItem(DAILY_KEY, getToday());
  } catch {}
}

// ══════════════════════════════════════════
// Clear on sign-out
// ══════════════════════════════════════════

export function clearDailyMedCheck(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DAILY_KEY);
    // Keep ONBOARDING_REFRESH_KEY and FIRST_LOGIN_KEY across sessions
  } catch {}
}

// ══════════════════════════════════════════
// React hook
// ══════════════════════════════════════════

export function useDailyMedCheck() {
  const [needsDailyCheck, setNeedsDailyCheck] = useState(false);
  const [needsOnboardingRefresh, setNeedsOnboardingRefresh] = useState(false);

  useEffect(() => {
    // Small delay to avoid showing dialogs during login redirect
    const timer = setTimeout(() => {
      setNeedsDailyCheck(!isDailyMedConfirmed());
      setNeedsOnboardingRefresh(isOnboardingRefreshNeeded());
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const confirmDaily = useCallback(() => {
    confirmDailyMed();
    setNeedsDailyCheck(false);
  }, []);

  const confirmRefresh = useCallback(() => {
    confirmOnboardingRefresh();
    confirmDailyMed();
    setNeedsOnboardingRefresh(false);
    setNeedsDailyCheck(false);
  }, []);

  return { needsDailyCheck, confirmDaily, needsOnboardingRefresh, confirmRefresh };
}
