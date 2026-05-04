// © 2026 DoctoPal — All Rights Reserved
// Sprint 30 Commit 1 — Supabase client for mobile.
//
// Web parity:
//   - Web (lib/supabase.ts) uses createBrowserClient from @supabase/ssr with
//     localStorage as the session store.
//   - Mobile uses createClient from @supabase/supabase-js with AsyncStorage
//     as the session store (RN doesn't have window.localStorage).
//
// Both flow through the SAME Supabase project — same auth tokens, same RLS,
// same tables. Sign in once on either platform, sessions are independent
// (each device tracks its own session).
//
// EXPO_PUBLIC_ prefix is REQUIRED for vars to be bundled into the client.
// At runtime missing vars throw — surfaces config errors early instead of
// silent auth failures.
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase env vars. Copy .env.example to .env and fill in EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY.",
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // RN doesn't have URL-based session detection (no redirects).
    detectSessionInUrl: false,
  },
});
