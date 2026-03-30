// © 2026 Phytotherapy.ai — All Rights Reserved
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { createBrowserClient } from "@/lib/supabase";
import { useLang } from "@/components/layout/language-toggle";
import { tx, txp } from "@/lib/translations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users, Gift, Copy, Check, Loader2, Share2, TrendingUp,
  Award, Crown, Star, ArrowRight, Sparkles, ShieldCheck,
} from "lucide-react";

interface ReferralStats {
  totalReferred: number;
  activePatients: number;
  totalCredits: number;
  thisMonth: number;
  monthlyBreakdown: { month: string; count: number }[];
}

export default function DoctorReferralPage() {
  const router = useRouter();
  const { lang } = useLang();
  const { isAuthenticated, isLoading, profile } = useAuth();

  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralLink, setReferralLink] = useState<string | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login?redirect=/doctor/referral");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!profile) return;
    fetchReferralData();
  }, [profile]);

  const fetchReferralData = async () => {
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/referral", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setReferralCode(data.code);
      setReferralLink(data.link);
      setStats(data.stats);
    } catch (err) {
      console.error("Failed to fetch referral data:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async () => {
    setGenerating(true);
    try {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/referral", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: "generate" }),
      });
      if (!res.ok) throw new Error("Failed to generate");
      const data = await res.json();
      setReferralCode(data.code);
      setReferralLink(data.link);
      await fetchReferralData();
    } catch (err) {
      console.error("Failed to generate code:", err);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, type: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "code") {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Check if doctor is verified (has doctor role or verification)
  const isVerified = profile.plan === "doctor" || profile.is_doctor_verified;

  if (!isVerified) {
    return (
      <div className="mx-auto max-w-2xl px-4 md:px-8 py-12">
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 dark:border-amber-800">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <ShieldCheck className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-semibold">{tx("referral.notVerified", lang)}</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              {tx("referral.verificationDesc", lang)}
            </p>
            <Link href="/doctor">
              <Button className="mt-2 gap-2 bg-amber-600 hover:bg-amber-700">
                <ShieldCheck className="h-4 w-4" />
                {tx("referral.goToVerification", lang)}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const maxBarValue = stats?.monthlyBreakdown
    ? Math.max(...stats.monthlyBreakdown.map((m) => m.count), 1)
    : 1;

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-8 py-8">
      {/* Hero */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30">
          <Gift className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="font-heading text-3xl font-semibold">{tx("referral.title", lang)}</h1>
        <p className="mt-2 text-muted-foreground">{tx("referral.subtitle", lang)}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : !referralCode ? (
        /* Generate Code CTA */
        <Card className="mb-8 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 dark:border-emerald-800">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <Sparkles className="h-10 w-10 text-emerald-500" />
            <h2 className="text-xl font-semibold">
              {tx("referral.generateTitle", lang)}
            </h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              {tx("referral.generateDesc", lang)}
            </p>
            <Button
              onClick={generateCode}
              disabled={generating}
              className="mt-2 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              size="lg"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Gift className="h-4 w-4" />
              )}
              {tx("referral.generateCode", lang)}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Referral Code Card */}
          <Card className="mb-6 border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/10 dark:to-teal-950/10 dark:border-emerald-800/50">
            <CardHeader className="text-center pb-2">
              <CardTitle className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-400">
                <Award className="h-5 w-5" />
                {tx("referral.yourCode", lang)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Big Code Display */}
              <div className="flex items-center justify-center gap-3">
                <div className="rounded-xl border-2 border-dashed border-emerald-300 bg-white px-6 py-3 dark:border-emerald-700 dark:bg-emerald-950/30">
                  <span className="font-mono text-2xl font-bold tracking-wider text-emerald-700 dark:text-emerald-300">
                    {referralCode}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                  onClick={() => copyToClipboard(referralCode, "code")}
                >
                  {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copiedCode ? tx("referral.copied", lang) : tx("referral.copyCode", lang)}
                </Button>
              </div>

              {/* Shareable Link */}
              {referralLink && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-white p-3 dark:border-emerald-800 dark:bg-emerald-950/20">
                  <Share2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span className="flex-1 truncate text-sm text-muted-foreground">{referralLink}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 gap-1 text-emerald-600"
                    onClick={() => copyToClipboard(referralLink, "link")}
                  >
                    {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copiedLink ? tx("referral.copied", lang) : tx("referral.copyLink", lang)}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Grid */}
          {stats && (
            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <Card className="border-emerald-100 dark:border-emerald-900/50">
                <CardContent className="flex flex-col items-center gap-1 pt-6 pb-4">
                  <Users className="h-6 w-6 text-emerald-500 mb-1" />
                  <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                    {stats.totalReferred}
                  </span>
                  <span className="text-xs text-muted-foreground text-center">
                    {tx("referral.totalReferred", lang)}
                  </span>
                </CardContent>
              </Card>

              <Card className="border-blue-100 dark:border-blue-900/50">
                <CardContent className="flex flex-col items-center gap-1 pt-6 pb-4">
                  <TrendingUp className="h-6 w-6 text-blue-500 mb-1" />
                  <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {stats.activePatients}
                  </span>
                  <span className="text-xs text-muted-foreground text-center">
                    {tx("referral.activePatients", lang)}
                  </span>
                </CardContent>
              </Card>

              <Card className="border-amber-100 dark:border-amber-900/50">
                <CardContent className="flex flex-col items-center gap-1 pt-6 pb-4">
                  <Crown className="h-6 w-6 text-amber-500 mb-1" />
                  <span className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                    {stats.totalCredits}
                  </span>
                  <span className="text-xs text-muted-foreground text-center">
                    {tx("referral.creditsEarned", lang)} ({tx("referral.days", lang)})
                  </span>
                </CardContent>
              </Card>

              <Card className="border-purple-100 dark:border-purple-900/50">
                <CardContent className="flex flex-col items-center gap-1 pt-6 pb-4">
                  <Star className="h-6 w-6 text-purple-500 mb-1" />
                  <span className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {stats.thisMonth}
                  </span>
                  <span className="text-xs text-muted-foreground text-center">
                    {tx("referral.thisMonth", lang)}
                  </span>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Monthly Breakdown Chart */}
          {stats && stats.monthlyBreakdown.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">{tx("referral.monthlyBreakdown", lang)}</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.totalReferred === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {tx("referral.noReferrals", lang)}
                  </p>
                ) : (
                  <div className="flex items-end gap-3 h-32">
                    {stats.monthlyBreakdown.map((m) => {
                      const pct = maxBarValue > 0 ? (m.count / maxBarValue) * 100 : 0;
                      const monthLabel = new Date(m.month + "-01").toLocaleDateString(
                        tx("common.locale", lang),
                        { month: "short" }
                      );
                      return (
                        <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                            {m.count}
                          </span>
                          <div
                            className="w-full rounded-t-md bg-gradient-to-t from-emerald-500 to-emerald-400 transition-all duration-500"
                            style={{ height: `${Math.max(pct, 4)}%`, minHeight: "4px" }}
                          />
                          <span className="text-[10px] text-muted-foreground">{monthLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* How It Works */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">{tx("referral.howItWorks", lang)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { step: "1", icon: Share2, text: tx("referral.step1", lang), color: "emerald" },
              { step: "2", icon: Users, text: tx("referral.step2", lang), color: "blue" },
              { step: "3", icon: Gift, text: tx("referral.step3", lang), color: "amber" },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center gap-3 rounded-lg border p-4 text-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-${s.color}-100 dark:bg-${s.color}-900/30`}>
                  <s.icon className={`h-5 w-5 text-${s.color}-600 dark:text-${s.color}-400`} />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {txp("referral.stepLabel", lang, { step: s.step })}
                  </span>
                  <p className="mt-1 text-sm">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reward Tiers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Crown className="h-5 w-5 text-amber-500" />
            {tx("referral.rewards", lang)}
          </CardTitle>
          <CardDescription>
            {tx("referral.rewardsDesc", lang)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { tier: tx("referral.tier1", lang), badge: "Bronze", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
              { tier: tx("referral.tier2", lang), badge: "Silver", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
              { tier: tx("referral.tier3", lang), badge: "Gold", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                <Badge className={t.color}>{t.badge}</Badge>
                <span className="text-sm">{t.tier}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
