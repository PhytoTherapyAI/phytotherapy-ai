import { createClient, SupabaseClient } from "@supabase/supabase-js";

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

  browserClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      detectSessionInUrl: true,
      flowType: "pkce",
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
