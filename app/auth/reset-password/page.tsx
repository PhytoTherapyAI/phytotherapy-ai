// © 2026 DoctoPal — All Rights Reserved
// Sprint 30 Commit 2 — Reset password landing page.
//
// Flow:
//   1. User clicks "Forgot password?" link on /auth/login → modal sends
//      reset email via supabase.auth.resetPasswordForEmail
//   2. User clicks email link → Supabase redirects to /auth/reset-password
//      with access_token in URL hash. Supabase JS client auto-detects the
//      hash on mount and creates a recovery-mode session.
//   3. This page renders new password form. supabase.auth.updateUser
//      changes the password under that recovery session.
//   4. On success: signOut + redirect to /auth/login?reset=success so the
//      login page shows the "password updated" banner via successMessage.
//
// Validation mirrors signup (auth/login/page.tsx handleSignup):
//   - 8+ chars (auth.errPasswordShort)
//   - 1+ uppercase (auth.errPasswordUppercase)
//   - 1+ number (auth.errPasswordNumber)
//   - matches confirm (auth.errPasswordMismatch)
//
// "Recovery session" detection: if Supabase didn't establish a session from
// the URL hash, updateUser will fail. We surface that as auth.resetTokenInvalid
// so the user knows to request a new link.
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { lang } = useLang();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Track whether Supabase established a recovery session from the URL hash.
  // null = checking, true = ready, false = invalid/expired link.
  const [recoveryReady, setRecoveryReady] = useState<boolean | null>(null);

  // Mount check: Supabase JS client auto-parses URL hash on init. If the link
  // is valid, a session exists; otherwise the user lands here without auth.
  // We don't gate the form behind this — updateUser surfaces the error too —
  // but a clear "link invalid" banner is friendlier than a cryptic error.
  useEffect(() => {
    const sb = createBrowserClient();
    sb.auth.getSession().then(({ data }) => {
      setRecoveryReady(!!data.session);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation chain mirrors signup form.
    if (newPassword.length < 8) {
      setError(tx("auth.errPasswordShort", lang));
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setError(tx("auth.errPasswordUppercase", lang));
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setError(tx("auth.errPasswordNumber", lang));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(tx("auth.errPasswordMismatch", lang));
      return;
    }

    setSubmitting(true);
    try {
      const sb = createBrowserClient();
      const { error: updateErr } = await sb.auth.updateUser({
        password: newPassword,
      });
      if (updateErr) {
        // Most common cause: recovery session expired or never existed.
        setError(tx("auth.resetTokenInvalid", lang));
        setSubmitting(false);
        return;
      }
      // Sign out the recovery session so the login page renders cleanly +
      // the user explicitly authenticates with new credentials.
      await sb.auth.signOut();
      router.push("/auth/login?reset=success");
    } catch (err) {
      console.error("Password update error:", err);
      setError(tx("auth.errUnexpected", lang));
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-icon.svg" alt="DoctoPal" className="h-8 w-8" />
            <span style={{ fontFamily: "system-ui, -apple-system, sans-serif", fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>
              <span style={{ color: "var(--foreground)" }}>Docto</span>
              <span style={{ color: "var(--brand, #3c7a52)" }}>Pal</span>
            </span>
          </div>
          <CardTitle className="text-2xl">{tx("auth.resetPageTitle", lang)}</CardTitle>
          <CardDescription>{tx("auth.resetPageDesc", lang)}</CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Recovery session check: false = link expired/invalid; render
              an explanatory banner + back-to-login link instead of the form. */}
          {recoveryReady === false ? (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{tx("auth.resetTokenInvalid", lang)}</AlertDescription>
              </Alert>
              <Link
                href="/auth/login"
                className="block text-center text-sm text-primary hover:underline"
              >
                {tx("auth.backToSignIn", lang)}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-new-password">{tx("auth.newPassword", lang)}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="reset-new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder={tx("auth.passwordPlaceholder", lang)}
                    className="pl-10 pr-10"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reset-confirm-password">{tx("auth.confirmNewPassword", lang)}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="reset-confirm-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={submitting || !newPassword || !confirmPassword || recoveryReady === null}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="ml-2">{tx("auth.updatingPassword", lang)}</span>
                  </>
                ) : (
                  tx("auth.updatePassword", lang)
                )}
              </Button>

              <Link
                href="/auth/login"
                className="block text-center text-xs text-muted-foreground hover:text-foreground"
              >
                {tx("auth.backToSignIn", lang)}
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
