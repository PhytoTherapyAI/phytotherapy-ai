"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, Loader2, AlertCircle } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState(false);
  const { lang } = useLang();

  useEffect(() => {
    const supabase = createBrowserClient();

    async function handleCallback() {
      try {
        // Step 1: Check for PKCE code in URL (OAuth redirect)
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        if (code) {
          // Exchange the PKCE code for a session
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error("[Auth Callback] Code exchange failed:", exchangeError);
            setError(true);
            return;
          }
        }

        // Step 2: Wait for session to be available
        let attempts = 0;
        const maxAttempts = 20;

        const checkSession = async () => {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            console.error("[Auth Callback] Session error:", sessionError);
            setError(true);
            return;
          }

          if (session) {
            // Ensure user profile exists (create if first OAuth login)
            const { data: profile } = await supabase
              .from("user_profiles")
              .select("onboarding_complete")
              .eq("id", session.user.id)
              .single();

            if (!profile) {
              // First time OAuth user — create profile stub
              await supabase.from("user_profiles").upsert({
                id: session.user.id,
                full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || null,
                onboarding_complete: false,
              });
              window.location.href = "/onboarding";
              return;
            }

            window.location.href = profile.onboarding_complete ? "/" : "/onboarding";
            return;
          }

          attempts++;
          if (attempts >= maxAttempts) {
            setError(true);
            return;
          }
          setTimeout(checkSession, 500);
        };

        // Small delay to let Supabase client process the tokens
        setTimeout(checkSession, 300);
      } catch (err) {
        console.error("[Auth Callback] Unexpected error:", err);
        setError(true);
      }
    }

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center gap-4 px-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-lg font-semibold">{tx("auth.callbackFailed", lang)}</h2>
        <p className="text-sm text-muted-foreground">{tx("auth.callbackError", lang)}</p>
        <button
          onClick={() => router.push("/auth/login")}
          className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          {tx("auth.backToSignIn", lang)}
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center gap-4">
      <Leaf className="h-10 w-10 animate-pulse text-primary" />
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">{tx("auth.completingSignIn", lang)}</span>
      </div>
    </div>
  );
}
