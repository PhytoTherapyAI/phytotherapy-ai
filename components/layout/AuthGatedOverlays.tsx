// © 2026 DoctoPal — All Rights Reserved
"use client";

import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth-context";

// Lazy load — these only mount for authenticated users
const TrialBannerWrapper = dynamic(() => import("@/components/premium/TrialBannerWrapper").then(m => m.TrialBannerWrapper));
const MedicationUpdateDialog = dynamic(() => import("@/components/layout/medication-update-dialog").then(m => m.MedicationUpdateDialog));
const MicroCheckInWrapper = dynamic(() => import("@/components/dashboard/MicroCheckInWrapper").then(m => m.MicroCheckInWrapper));
const CriticalAlertModal = dynamic(() => import("@/components/emergency/CriticalAlertModal").then(m => m.CriticalAlertModal));

export function AuthGatedOverlays() {
  const { isAuthenticated, isLoading } = useAuth();

  // Guest users and loading state: render nothing
  if (!isAuthenticated || isLoading) return null;

  return (
    <>
      <TrialBannerWrapper />
      <MedicationUpdateDialog />
      <MicroCheckInWrapper />
      <CriticalAlertModal />
    </>
  );
}
