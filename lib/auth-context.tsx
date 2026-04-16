// © 2026 DoctoPal — All Rights Reserved
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
  profileFetchedAt: number;          // Date.now() of last successful profile fetch
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
    profileFetchedAt: 0,
    isLoading: true,
    isAuthenticated: false,
    needsOnboarding: false,
    needsMedicationUpdate: false,
    premiumStatus: defaultPremium,
  });

  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    const doFetch = async (timeoutMs: number) => {
      const profilePromise = supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), timeoutMs);
      });

      const result = await Promise.race([profilePromise, timeoutPromise]);

      if (!result || !("data" in result)) return null;
      const { data, error } = result;
      if (error) {
        console.error("[Auth] Profile fetch error:", error.message);
        return null;
      }
      return data as UserProfile;
    };

    try {
      // First try: 5s timeout
      const profile = await doFetch(5000);
      if (profile) return profile;

      // Retry: 8s timeout
      console.warn("[Auth] Profile fetch timed out, retrying...");
      const retry = await doFetch(8000);
      if (retry) return retry;

      console.error("[Auth] Profile fetch failed after retry");
      return null;
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

  const PROFILE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes — skip re-fetch if profile is fresh

  const updateState = useCallback(async (user: User | null, session: Session | null) => {

    if (!user) {
      setState({
        user: null,
        session: null,
        profile: null,
        profileFetchedAt: 0,
        isLoading: false,
        isAuthenticated: false,
        needsOnboarding: false,
        needsMedicationUpdate: false,
        premiumStatus: defaultPremium,
      });
      return;
    }

    // If we already have a fresh profile for the SAME user, skip fetch entirely
    // This prevents skeleton flash on tab switch / token refresh
    setState((prev) => {
      const profileIsFresh =
        prev.profile &&
        prev.profile.id === user.id &&
        prev.profileFetchedAt > 0 &&
        (Date.now() - prev.profileFetchedAt) < PROFILE_CACHE_TTL;

      if (profileIsFresh) {
        // Just update session — no loading, no fetch
        return {
          ...prev,
          user,
          session,
          isAuthenticated: true,
          // isLoading stays false, profile stays as-is
        };
      }

      // Need to fetch profile — show loading
      return {
        ...prev,
        user,
        session,
        isAuthenticated: true,
        isLoading: true,
      };
    });

    // Check again outside setState (can't await inside setState)
    // Read current state via ref pattern — use the same condition
    let needsFetch = true;
    setState((prev) => {
      const profileIsFresh =
        prev.profile &&
        prev.profile.id === user.id &&
        prev.profileFetchedAt > 0 &&
        (Date.now() - prev.profileFetchedAt) < PROFILE_CACHE_TTL;
      if (profileIsFresh) needsFetch = false;
      return prev; // no change, just reading
    });

    if (!needsFetch) return;

    const profile = await fetchProfile(user.id);
    setState({
      user,
      session,
      profile,
      profileFetchedAt: profile ? Date.now() : 0,
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
        // Single call: getSession() returns both session AND user — avoids double lock acquisition
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session?.user) {
          setState((prev) => ({ ...prev, isLoading: false }));
          return;
        }
        await updateState(session.user, session);
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
        // session.user is already validated by Supabase — no need for extra getUser() call
        await updateState(session.user, session);
      }
    );

    // Re-check session when tab becomes visible again (back from background)
    // Optimized: only calls getSession() (acquires lock) if token is close to expiry
    let visibilityCheckInFlight = false;
    let visibilityDebounce: ReturnType<typeof setTimeout> | null = null;
    const FIVE_MINUTES = 5 * 60 * 1000;
    let lastVisibilityRefresh = 0;
    const MIN_VISIBILITY_INTERVAL = 60_000; // don't check more than once per minute

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      if (visibilityCheckInFlight) return;

      // Rate limit: at most once per minute
      const now = Date.now();
      if (now - lastVisibilityRefresh < MIN_VISIBILITY_INTERVAL) return;

      if (visibilityDebounce) clearTimeout(visibilityDebounce);
      visibilityDebounce = setTimeout(async () => {
        // First check: can we skip entirely using cached session?
        // Read expires_at from state without acquiring any lock
        let shouldCallGetSession = false;
        setState((prev) => {
          const cachedSession = prev.session;
          if (!cachedSession?.expires_at) {
            // No cached session — need to check
            shouldCallGetSession = true;
          } else {
            const expiresIn = cachedSession.expires_at * 1000 - Date.now();
            if (expiresIn < FIVE_MINUTES) {
              // Token expires soon — need to refresh
              shouldCallGetSession = true;
            }
            // else: token is fresh, skip entirely (zero lock, zero network)
          }
          return prev; // no state change, just reading
        });

        if (!shouldCallGetSession) return;

        // Token is close to expiry or no cached session — call getSession (acquires lock)
        visibilityCheckInFlight = true;
        lastVisibilityRefresh = Date.now();
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error || !session) {
            console.warn("[Auth] Session check on visibility: no session");
          } else {
            setState((prev) => ({ ...prev, session, user: session.user }));
          }
        } catch (err) {
          console.warn("[Auth] Visibility change session check error:", err);
        } finally {
          visibilityCheckInFlight = false;
        }
      }, 1000);
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
      if (visibilityDebounce) clearTimeout(visibilityDebounce);
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
        scopes: "profile email https://www.googleapis.com/auth/user.birthday.read https://www.googleapis.com/auth/user.gender.read",
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
      profileFetchedAt: 0,
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
        profileFetchedAt: profile ? Date.now() : 0,
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
