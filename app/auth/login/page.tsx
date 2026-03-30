// © 2026 Phytotherapy.ai — All Rights Reserved
"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Leaf, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle2, Play, Gift, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createBrowserClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLang } from "@/components/layout/language-toggle";
import { tx } from "@/lib/translations";
import { TurnstileWidget } from "@/components/auth/TurnstileWidget";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithFacebook } = useAuth();
  const { lang } = useLang();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "auth_callback_error" ? tx("auth.errAuthFailed", lang) : null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // Referral code state
  const [showReferral, setShowReferral] = useState(false);
  const [referralCode, setReferralCode] = useState(searchParams.get("ref") || "");
  const [referralApplied, setReferralApplied] = useState(false);
  const [referralError, setReferralError] = useState<string | null>(null);
  const [applyingCode, setApplyingCode] = useState(false);

  const redirect = searchParams.get("redirect") ?? "/";

  // Auto-expand if ref param exists
  useEffect(() => {
    if (searchParams.get("ref")) {
      setShowReferral(true);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);
    try {
      const sb = createBrowserClient();
      const { error, user } = await signInWithEmail(loginEmail, loginPassword);
      if (error) { setError(error); setIsLoading(false); return; }
      if (!user) {
        await new Promise((r) => setTimeout(r, 500));
        const { data } = await sb.auth.getUser();
        if (!data?.user) { setError(tx("auth.errSessionFailed", lang)); setIsLoading(false); return; }
        const { data: profile } = await sb.from("user_profiles").select("onboarding_complete").eq("id", data.user.id).single();
        window.location.href = (!profile || !profile.onboarding_complete) ? "/onboarding" : redirect;
        return;
      }
      const { data: profile } = await sb.from("user_profiles").select("onboarding_complete").eq("id", user.id).single();
      window.location.href = (!profile || !profile.onboarding_complete) ? "/onboarding" : redirect;
    } catch (err) {
      console.error("Login error:", err);
      setError(tx("auth.errUnexpected", lang));
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    if (signupPassword !== signupConfirm) { setError(tx("auth.errPasswordMismatch", lang)); return; }
    if (signupPassword.length < 6) { setError(tx("auth.errPasswordShort", lang)); return; }
    setIsLoading(true);
    try {
      const { error } = await signUpWithEmail(signupEmail, signupPassword, signupName);
      if (error) {
        setError(error.toLowerCase().includes("already") ? tx("auth.errEmailExists", lang) : error);
        setIsLoading(false);
        return;
      }
      await new Promise((r) => setTimeout(r, 500));
      const sb = createBrowserClient();
      const { data: { session } } = await sb.auth.getSession();
      if (session) { window.location.href = "/onboarding"; return; }
      setSuccessMessage(tx("auth.successCreated", lang));
      setIsLoading(false);
      setSignupName(""); setSignupEmail(""); setSignupPassword(""); setSignupConfirm("");
    } catch (err) {
      console.error("Signup error:", err);
      setError(tx("auth.errUnexpected", lang));
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/demo", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Demo login failed"); setIsLoading(false); return; }
      // Sign in with demo credentials
      const { error } = await signInWithEmail(data.email, data.password);
      if (error) { setError(error); setIsLoading(false); return; }
      window.location.href = "/";
    } catch {
      setError("Demo login failed. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null); setSuccessMessage(null); setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) { setError(error); setIsLoading(false); }
    } catch (err) {
      console.error("Google login error:", err);
      setError(tx("auth.errGoogle", lang));
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setError(null); setSuccessMessage(null); setIsLoading(true);
    try {
      const { error } = await signInWithFacebook();
      if (error) { setError(error); setIsLoading(false); }
    } catch (err) {
      console.error("Facebook login error:", err);
      setError(tx("auth.errFacebook", lang));
      setIsLoading(false);
    }
  };

  const handleApplyReferral = async () => {
    if (!referralCode.trim()) return;
    setApplyingCode(true);
    setReferralError(null);
    try {
      const res = await fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "redeem", code: referralCode.trim().toUpperCase() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setReferralError(data.error || tx("redeem.invalid", lang));
        setApplyingCode(false);
        return;
      }
      // Store in localStorage for post-signup processing
      localStorage.setItem("referral_code", referralCode.trim().toUpperCase());
      setReferralApplied(true);
    } catch {
      setReferralError(tx("redeem.invalid", lang));
    } finally {
      setApplyingCode(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex items-center gap-2">
            <Leaf className="h-[18px] w-[18px]" style={{ color: 'var(--logo-accent, #c4a86c)' }} />
            <span style={{ fontFamily: '"DM Serif Display", "Palatino Linotype", Georgia, serif', fontSize: '1.18rem', fontWeight: 400, letterSpacing: '0.01em', lineHeight: 1 }}>
              <span style={{ color: 'var(--foreground)' }}>Phyto</span><span style={{ color: 'var(--logo-accent, #c4a86c)' }}>therapy</span><span style={{ color: 'var(--primary)' }}>.ai</span>
            </span>
          </div>
          <CardTitle className="text-2xl">{tx("auth.welcome", lang)}</CardTitle>
          <CardDescription>{tx("auth.subtitle", lang)}</CardDescription>
        </CardHeader>

        <CardContent>
          {error && <Alert variant="destructive" className="mb-4"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
          {successMessage && <Alert className="mb-4 border-primary/20 bg-primary/10 text-primary"><CheckCircle2 className="h-4 w-4" /><AlertDescription>{successMessage}</AlertDescription></Alert>}

          <div className="mb-4 flex flex-col gap-2">
            <Button variant="outline" className="w-full gap-2" onClick={handleGoogleLogin} disabled={isLoading}>
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {tx("auth.googleContinue", lang)}
            </Button>
            <Button variant="outline" className="w-full gap-2" onClick={handleFacebookLogin} disabled={isLoading}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              {tx("auth.facebookContinue", lang)}
            </Button>
          </div>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">{tx("auth.or", lang)}</span>
            </div>
          </div>

          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{tx("auth.signIn", lang)}</TabsTrigger>
              <TabsTrigger value="signup">{tx("auth.signUp", lang)}</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">{tx("auth.email", lang)}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="login-email" type="email" placeholder={tx("auth.emailPlaceholder", lang)} className="pl-10"
                      value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">{tx("auth.password", lang)}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="login-password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10"
                      value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <TurnstileWidget onVerify={setCaptchaToken} onExpire={() => setCaptchaToken(null)} />
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? tx("auth.signingIn", lang) : tx("auth.signIn", lang)}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">{tx("auth.fullName", lang)}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="signup-name" type="text" placeholder={tx("auth.namePlaceholder", lang)} className="pl-10"
                      value={signupName} onChange={(e) => setSignupName(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">{tx("auth.email", lang)}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="signup-email" type="email" placeholder={tx("auth.emailPlaceholder", lang)} className="pl-10"
                      value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">{tx("auth.password", lang)}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="signup-password" type={showPassword ? "text" : "password"} placeholder={tx("auth.passwordPlaceholder", lang)} className="pl-10 pr-10"
                      value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required minLength={6} />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">{tx("auth.confirmPassword", lang)}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="signup-confirm" type="password" placeholder="••••••••" className="pl-10"
                      value={signupConfirm} onChange={(e) => setSignupConfirm(e.target.value)} required />
                  </div>
                </div>
                <TurnstileWidget onVerify={setCaptchaToken} onExpire={() => setCaptchaToken(null)} />
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? tx("auth.creatingAccount", lang) : tx("auth.createAccount", lang)}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  {tx("auth.termsText", lang)}{" "}
                  <Link href="/terms" className="underline hover:text-foreground">{tx("auth.termsLink", lang)}</Link>
                  {" "}{tx("auth.and", lang)}{" "}
                  <Link href="/privacy" className="underline hover:text-foreground">{tx("auth.privacyLink", lang)}</Link>
                  {tx("auth.termsAccept", lang)}
                </p>
              </form>
            </TabsContent>
          </Tabs>

          {/* Demo Button */}
          <div className="mt-4 border-t pt-4">
            <Button
              variant="outline"
              className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/5"
              onClick={handleDemoLogin}
              disabled={isLoading}
            >
              <Play className="h-4 w-4" />
              {tx("auth.tryDemo", lang)}
            </Button>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              {tx("auth.demoDesc", lang)}
            </p>
          </div>

          {/* Referral Code Section */}
          <div className="mt-4 border-t pt-4">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowReferral(!showReferral)}
            >
              <Gift className="h-4 w-4" />
              {tx("redeem.title", lang)}
              {showReferral ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>

            {showReferral && (
              <div className="mt-3 space-y-2">
                {referralApplied ? (
                  <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    {tx("redeem.applied", lang)}
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <Input
                        placeholder={tx("redeem.placeholder", lang)}
                        value={referralCode}
                        onChange={(e) => {
                          setReferralCode(e.target.value);
                          setReferralError(null);
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyReferral()}
                        className="font-mono text-sm uppercase"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleApplyReferral}
                        disabled={!referralCode.trim() || applyingCode}
                        className="shrink-0 gap-1 border-primary/30 text-primary"
                      >
                        {applyingCode ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Gift className="h-4 w-4" />
                        )}
                        {tx("redeem.apply", lang)}
                      </Button>
                    </div>
                    {referralError && (
                      <p className="text-xs text-destructive">{referralError}</p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
