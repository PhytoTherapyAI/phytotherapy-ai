// © 2026 DoctoPal — All Rights Reserved
// Sprint 30 Commit 1 — Root layout for expo-router.
//
// Responsibilities:
//   1. Import global.css ONCE (NativeWind v4 requirement — must be at root).
//   2. Subscribe to Supabase auth state, redirect:
//      - No session  → /(auth)/login
//      - Has session → /(tabs) (home)
//   3. Render <Stack /> for nested route mounting.
//
// Web parity: lib/auth-context.tsx in web app does the same job with
// fetchProfile + visibility handler + cache TTL. Mobile starts simple —
// just session presence drives routing. Profile fetch can live in tabs
// later if needed (no caregiver mode in v1 mobile).
import "../global.css";
import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Initial session fetch
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Routing guard — redirect based on auth state.
  // segments[0] is the route group: "(auth)" or "(tabs)".
  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [session, segments, loading, router]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
