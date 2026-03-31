// © 2026 Phytotherapy.ai — All Rights Reserved
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createBrowserClient } from "@/lib/supabase";
import { clearDailyMedCheck } from "@/lib/daily-med-check";
import type { User, Session } from "@supabase/supabase-js";
import type { UserProfile } from "@/lib/database.types";
import { getPremiumStatus, type PremiumStatus } from "@/lib/premium";

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  needsMedicationUpdate: boolean;    // 15-day medication refresh (Supabase)
  premiumStatus: PremiumStatus;
}

interface AuthContextType extends AuthState {
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null; user: User | null; session: Session | null }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signInWithFacebook: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const supabase = createBrowserClient();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const defaultPremium: PremiumStatus = { plan: "free", isTrialActive: false, trialEndsAt: null, trialDaysLeft: 0, isPremium: false };
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false,
    needsOnboarding: false,
    needsMedicationUpdate: false,
    premiumStatus: defaultPremium,
  });

  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {

      const profilePromise = supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => {
          console.warn("[Auth] Profile fetch timed out after 8s");
          resolve(null);
        }, 8000);
      });

      const result = await Promise.race([profilePromise, timeoutPromise]);

      if (!result || !("data" in result)) {
        return null;
      }

      const { data, error } = result;

      if (error) {
        console.error("[Auth] Profile fetch error:", error.message);
        return null;
      }
      return data as UserProfile;
    } catch (err) {
      console.error("[Auth] Profile fetch exception:", err);
      return null;
    }
  }, []);

  // 15-day check: medication list needs refresh
  const checkMedicationUpdate = useCallback((profile: UserProfile | null): boolean => {
    if (!profile || !profile.onboarding_complete) return false;
    if (!profile.last_medication_update) return true;

    const lastUpdate = new Date(profile.last_medication_update);
    const now = new Date();
    const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate >= 15;
  }, []);

  const updateState = useCallback(async (user: User | null, session: Session | null) => {

    if (!user) {
      setState({
        user: null,
        session: null,
        profile: null,
        isLoading: false,
        isAuthenticated: false,
        needsOnboarding: false,
        needsMedicationUpdate: false,
        premiumStatus: defaultPremium,
      });
      return;
    }

    setState((prev) => ({
      ...prev,
      user,
      session,
      isAuthenticated: true,
      isLoading: true,
    }));

    const profile = await fetchProfile(user.id);
    setState({
      user,
      session,
      profile,
      isLoading: false,
      isAuthenticated: true,
      needsOnboarding: !profile?.onboarding_complete,
      needsMedicationUpdate: checkMedicationUpdate(profile),
      premiumStatus: getPremiumStatus(profile),
    });
  }, [fetchProfile, checkMedicationUpdate]);

  useEffect(() => {
    let initialDone = false;

    async function initAuth() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          setState((prev) => ({ ...prev, isLoading: false }));
          return;
        }
        const { data: { session } } = await supabase.auth.getSession();
        await updateState(user, session);
      } catch (err) {
        console.error("[Auth] initAuth exception:", err);
        setState((prev) => ({ ...prev, isLoading: false }));
      } finally {
        initialDone = true;
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "INITIAL_SESSION") return;
        if (event === "SIGNED_OUT" || !session?.user) {
          await updateState(null, null);
          return;
        }
        if (!initialDone) {
          return;
        }
        // Handle token refresh — update session in state
        if (event === "TOKEN_REFRESHED") {
          setState((prev) => ({ ...prev, session }));
          return;
        }
        await supabase.auth.getUser();
        await updateState(session.user, session);
      }
    );

    // Re-check session when tab becomes visible again (back from background)
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error || !session) {
            // Try to refresh the token
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError || !refreshData.session) {
              await updateState(null, null);
              return;
            }
            await updateState(refreshData.session.user, refreshData.session);
          } else {
            // Session exists, update state including user
            setState((prev) => ({ ...prev, session, user: session.user }));
          }
        } catch (err) {
          console.error("[Auth] Visibility change session check error:", err);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    const safetyTimeout = setTimeout(() => {
      setState((prev) => {
        if (prev.isLoading) {
          console.warn("[Auth] Safety timeout — forcing isLoading to false");
          return { ...prev, isLoading: false };
        }
        return prev;
      });
    }, 10000);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTimeout(safetyTimeout);
    };
  }, [updateState]);

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null, user: data?.user ?? null, session: data?.session ?? null };
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    return { error: error?.message ?? null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error?.message ?? null };
  };

  const signInWithFacebook = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {

    // Clear state immediately for instant UI feedback
    setState({
      user: null,
      session: null,
      profile: null,
      isLoading: false,
      isAuthenticated: false,
      needsOnboarding: false,
      needsMedicationUpdate: false,
      premiumStatus: defaultPremium,
    });
    clearDailyMedCheck();

    // Sign out from Supabase (global — invalidates server session too)
    try {
      await supabase.auth.signOut({ scope: "global" });
    } catch (err) {
      console.error("[Auth] Sign out API error — clearing localStorage manually:", err);
      // If signOut API fails, manually clear all Supabase tokens from localStorage
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && (key.startsWith("sb-") || key.includes("supabase"))) {
            localStorage.removeItem(key);
          }
        }
      } catch (storageErr) {
        console.error("[Auth] localStorage clear error:", storageErr);
      }
    }

    window.location.href = "/";
  };

  const refreshProfile = async () => {
    if (state.user) {
      const profile = await fetchProfile(state.user.id);
      setState((prev) => ({
        ...prev,
        profile,
        needsOnboarding: !profile?.onboarding_complete,
        needsMedicationUpdate: checkMedicationUpdate(profile),
        premiumStatus: getPremiumStatus(profile),
      }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithFacebook,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
