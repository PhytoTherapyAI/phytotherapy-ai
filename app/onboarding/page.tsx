"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, profile, needsOnboarding } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login?redirect=/onboarding");
    }
    if (!isLoading && isAuthenticated && !needsOnboarding) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, needsOnboarding, router]);

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
