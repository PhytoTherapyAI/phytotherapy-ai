// © 2026 DoctoPal — All Rights Reserved
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Clean up any corrupted Supabase localStorage entries that cause
// "Unexpected end of input" JSON.parse errors on client init
function cleanCorruptLocalStorage() {
  if (typeof window === "undefined") return;
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("sb-") || key.includes("supabase"))) {
        try {
          const val = localStorage.getItem(key);
          if (val) JSON.parse(val); // Test if valid JSON
        } catch {
          console.warn("[Supabase] Removing corrupted localStorage key:", key);
          localStorage.removeItem(key);
        }
      }
    }
  } catch {
    // Ignore errors during cleanup
  }
}

// Singleton browser client — uses anon key, respects RLS
// IMPORTANT: Must be a singleton so auth listeners and operations share the same instance
let browserClient: SupabaseClient | null = null;

export function createBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  // Clean corrupted entries before creating client
  cleanCorruptLocalStorage();

  browserClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      detectSessionInUrl: true,
      flowType: "pkce",
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return browserClient;
}

// Server client — uses service role key, bypasses RLS (use only in API routes)
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase server environment variables");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
