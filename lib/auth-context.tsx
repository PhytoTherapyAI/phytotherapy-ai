"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createBrowserClient } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";
import type { UserProfile } from "@/lib/database.types";

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  needsMedicationUpdate: boolean;
}

interface AuthContextType extends AuthState {
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null; user: User | null; session: Session | null }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const supabase = createBrowserClient();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false,
    needsOnboarding: false,
    needsMedicationUpdate: false,
  });

  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log("[Auth] Fetching profile for:", userId);

      const profilePromise = supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      // Race with timeout to prevent hanging forever
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => {
          console.warn("[Auth] Profile fetch timed out after 8s");
          resolve(null);
        }, 8000);
      });

      const result = await Promise.race([profilePromise, timeoutPromise]);

      if (!result || !("data" in result)) {
        return null; // Timed out
      }

      const { data, error } = result;

      if (error) {
        console.error("[Auth] Profile fetch error:", error.message);
        return null;
      }
      console.log("[Auth] Profile fetched:", data?.full_name, "onboarding:", data?.onboarding_complete);
      return data as UserProfile;
    } catch (err) {
      console.error("[Auth] Profile fetch exception:", err);
      return null;
    }
  }, []);

  const checkMedicationUpdate = useCallback((profile: UserProfile | null): boolean => {
    if (!profile || !profile.onboarding_complete) return false;
    if (!profile.last_medication_update) return true;

    const lastUpdate = new Date(profile.last_medication_update);
    const now = new Date();
    const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate >= 30;
  }, []);

  const updateState = useCallback(async (user: User | null, session: Session | null) => {
    console.log("[Auth] updateState called:", { hasUser: !!user, hasSession: !!session });

    if (!user) {
      console.log("[Auth] No user — setting unauthenticated state");
      setState({
        user: null,
        session: null,
        profile: null,
        isLoading: false,
        isAuthenticated: false,
        needsOnboarding: false,
        needsMedicationUpdate: false,
      });
      return;
    }

    // Set authenticated immediately (even before profile loads) to prevent UI flash
    setState((prev) => ({
      ...prev,
      user,
      session,
      isAuthenticated: true,
      isLoading: true, // still loading profile
    }));

    const profile = await fetchProfile(user.id);
    console.log("[Auth] Final state: authenticated=true, profile=", profile?.full_name ?? "null");
    setState({
      user,
      session,
      profile,
      isLoading: false,
      isAuthenticated: true,
      needsOnboarding: !profile?.onboarding_complete,
      needsMedicationUpdate: checkMedicationUpdate(profile),
    });
  }, [fetchProfile, checkMedicationUpdate]);

  // Listen for auth changes
  useEffect(() => {
    console.log("[Auth] AuthProvider mounted — checking session...");
    let initialDone = false;

    // Use getUser() to validate token server-side and set internal auth headers.
    // getSession() only reads localStorage and doesn't guarantee auth headers
    // are set for subsequent RLS-protected queries.
    async function initAuth() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          console.log("[Auth] getUser: no valid user", userError?.message);
          setState((prev) => ({ ...prev, isLoading: false }));
          return;
        }
        const { data: { session } } = await supabase.auth.getSession();
        console.log("[Auth] initAuth: authenticated as", user.email);
        await updateState(user, session);
      } catch (err) {
        console.error("[Auth] initAuth exception:", err);
        setState((prev) => ({ ...prev, isLoading: false }));
      } finally {
        initialDone = true;
      }
    }

    initAuth();

    // Subscribe to auth changes — skip INITIAL_SESSION since initAuth handles it.
    // For subsequent events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED), validate
    // token first to ensure RLS works.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[Auth] onAuthStateChange:", event);
        // Skip INITIAL_SESSION — initAuth handles it with getUser() for RLS
        if (event === "INITIAL_SESSION") return;
        // For SIGNED_OUT, clear state immediately
        if (event === "SIGNED_OUT" || !session?.user) {
          await updateState(null, null);
          return;
        }
        // For sign-in or token refresh, wait for initAuth if still running
        if (!initialDone) {
          console.log("[Auth] Skipping event — initAuth still running");
          return;
        }
        // Validate token before profile fetch to ensure RLS works
        await supabase.auth.getUser();
        await updateState(session.user, session);
      }
    );

    // Safety timeout — if loading takes more than 10s, force it to false
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

  const signOut = async () => {
    console.log("[Auth] Signing out...");
    try {
      // Use "local" scope — only clears this browser's session
      // "global" can fail if the token is already expired, and we still want to clear local state
      await supabase.auth.signOut({ scope: "local" });
    } catch (err) {
      console.error("[Auth] Sign out API error (continuing with local clear):", err);
    }
    // Always clear React state regardless of signOut success
    setState({
      user: null,
      session: null,
      profile: null,
      isLoading: false,
      isAuthenticated: false,
      needsOnboarding: false,
      needsMedicationUpdate: false,
    });
    // Reset the singleton so next page load creates a fresh client
    // (Supabase signOut already clears localStorage, no manual clear needed)
    console.log("[Auth] Signed out — redirecting to /");
    // Full page reload to landing — ensures clean state everywhere
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
