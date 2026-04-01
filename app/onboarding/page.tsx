// © 2026 Doctopal — All Rights Reserved
"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, profile, needsOnboarding } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Allow access with ?refresh=true for 30-day health profile refresh
  const isRefreshMode = searchParams.get("refresh") === "true";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login?redirect=/onboarding");
    }
    // Don't redirect away if in refresh mode (30-day health review)
    if (!isLoading && isAuthenticated && !needsOnboarding && !isRefreshMode) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, needsOnboarding, isRefreshMode, router]);

  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !profile) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <OnboardingWizard profile={profile} />
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
