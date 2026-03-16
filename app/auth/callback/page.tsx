"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, Loader2, AlertCircle } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase";

/**
 * OAuth callback handler — client-side.
 *
 * After Google OAuth, Supabase redirects here with ?code=... in the URL.
 * The Supabase browser client (with detectSessionInUrl + PKCE) automatically
 * picks up the code, exchanges it using the stored code_verifier from localStorage,
 * and sets the session. We just wait for that to complete, then redirect.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    const supabase = createBrowserClient();

    // The Supabase client auto-detects the code in the URL on init.
    // We poll getSession to check when the exchange completes.
    let attempts = 0;
    const maxAttempts = 20; // 10 seconds max

    const checkSession = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Auth callback error:", sessionError);
        setError(true);
        return;
      }

      if (session) {
        // Session is ready — redirect to home or onboarding
        router.replace("/");
        return;
      }

      attempts++;
      if (attempts >= maxAttempts) {
        // Timed out waiting for session
        setError(true);
        return;
      }

      // Check again in 500ms
      setTimeout(checkSession, 500);
    };

    // Start checking after a brief delay to let the client process the URL
    setTimeout(checkSession, 500);
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center gap-4 px-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-lg font-semibold">Authentication Failed</h2>
        <p className="text-sm text-muted-foreground">
          Something went wrong during sign in. Please try again.
        </p>
        <button
          onClick={() => router.push("/auth/login")}
          className="mt-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center gap-4">
      <Leaf className="h-10 w-10 animate-pulse text-emerald-600" />
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
        <span className="text-sm text-muted-foreground">Completing sign in...</span>
      </div>
    </div>
  );
}
