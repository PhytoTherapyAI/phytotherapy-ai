// © 2026 Doctopal — All Rights Reserved
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Leaf, LogIn, LogOut, Settings, AlertTriangle, Check, RefreshCw,
  Menu, X, Sparkles, LayoutDashboard, Shield, Calendar,
  Flame, Search, Users, FlaskConical, ChevronDown,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageToggle, useLang } from "@/components/layout/language-toggle";
import { Button } from "@/components/ui/button";
import { tx } from "@/lib/translations";
import { createBrowserClient } from "@/lib/supabase";
import { MobileMegaMenu } from "@/components/layout/mega-menu/MobileMegaMenu";
import { CommandPalette, CommandPaletteTrigger } from "@/components/layout/CommandPalette";

// Core nav — only 3 most-used actions (Hick's Law)
const CORE_NAV = [
  { href: "/", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/health-assistant", labelKey: "nav.assistant", icon: Sparkles },
  { href: "/interaction-checker", labelKey: "nav.interaction", icon: Shield },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, isLoading, user, profile, signOut, needsMedicationUpdate, refreshProfile } = useAuth();
  const { lang } = useLang();
  const [showMedReminder, setShowMedReminder] = useState(false);
  const [dismissingReminder, setDismissingReminder] = useState(false);

  // Scroll detection for shrink effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (needsMedicationUpdate && isAuthenticated && !isLoading) {
      setShowMedReminder(true);
    } else {
      setShowMedReminder(false);
    }
  }, [needsMedicationUpdate, isAuthenticated, isLoading]);

  const dismissReminder = useCallback(async () => {
    setDismissingReminder(true);
    try {
      const supabase = createBrowserClient();
      await supabase
        .from("user_profiles")
        .update({ last_medication_update: new Date().toISOString() })
        .eq("id", user?.id ?? "");
      setShowMedReminder(false);
      await refreshProfile();
    } catch { /* silent */ } finally { setDismissingReminder(false); }
  }, [user?.id, refreshProfile]);

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "U";

  // Mock streak (in production, this comes from health-context or daily_check_ins)
  const streakDays = 0; // Will be populated when user data loads

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* ── Floating Glassmorphism Navbar ── */}
      <header className="sticky top-0 z-50 w-full border-b border-border shadow-sm" style={{ backgroundColor: "var(--card)" }}>
        <div className="mx-auto max-w-6xl px-3 md:px-4">
          <div className="py-2.5" style={{ backgroundColor: "var(--card)" }}>
            <div className="flex items-center">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 group shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-icon.svg"
                  alt="DoctoPal"
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-lg transition-transform duration-300 group-hover:scale-105"
                />
                <span className="hidden sm:inline" style={{
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontSize: "1.1rem",
                  fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1,
                }}>
                  <span style={{ color: "var(--foreground)" }}>Docto</span>
                  <span style={{ color: "var(--brand, #3c7a52)" }}>Pal</span>
                </span>
              </Link>

              {/* ── Desktop: Core Nav (3 items, centered) ── */}
              <nav className="mx-auto hidden items-center gap-1 lg:flex">
                {CORE_NAV.map(({ href, labelKey, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                      isActive(href)
                        ? "bg-lavender/10 text-lavender dark:bg-lavender/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden xl:inline">{tx(labelKey, lang)}</span>
                  </Link>
                ))}
                {/* Calendar — always visible */}
                <Link
                  href="/calendar"
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                    isActive("/calendar")
                      ? "bg-lavender/10 text-lavender dark:bg-lavender/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="hidden xl:inline">{tx("nav.calendar", lang)}</span>
                </Link>
              </nav>

              {/* ── Desktop: Right Controls ── */}
              <div className="ml-auto hidden items-center gap-1.5 lg:flex">
                {/* Spotlight Search */}
                <CommandPaletteTrigger />

                <LanguageToggle />
                <ThemeToggle />

                {isLoading ? (
                  <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                ) : isAuthenticated ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      type="button"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      aria-label="User menu"
                      className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-1 transition-colors hover:bg-primary/20"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                        {initials}
                      </div>
                      {streakDays > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-orange-500">
                          <Flame className="h-3 w-3" />
                          {streakDays}
                        </span>
                      )}
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 top-full z-[100] mt-2 w-56 rounded-xl border bg-white dark:bg-slate-900 shadow-xl border-slate-200 dark:border-slate-700">
                        <div className="border-b p-3">
                          {profile?.full_name && <p className="text-sm font-medium">{profile.full_name}</p>}
                          <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                        <div className="p-1">
                          <Link href="/profile" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted" onClick={() => setUserMenuOpen(false)}>
                            <Settings className="h-4 w-4" /> {tx("nav.profileSettings", lang)}
                          </Link>
                          <Link href="/family" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted" onClick={() => setUserMenuOpen(false)}>
                            <Users className="h-4 w-4" /> {tx("family.title", lang)}
                          </Link>
                          <Link href="/history" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted" onClick={() => setUserMenuOpen(false)}>
                            <RefreshCw className="h-4 w-4" /> {tx("nav.history", lang)}
                          </Link>
                          <Link href="/badges" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted" onClick={() => setUserMenuOpen(false)}>
                            <FlaskConical className="h-4 w-4" /> {tx("badges.title", lang)}
                          </Link>
                          <Link href="/settings" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted" onClick={() => setUserMenuOpen(false)}>
                            <Settings className="h-4 w-4" /> {tx("settings.title", lang)}
                          </Link>
                        </div>
                        <div className="border-t p-1">
                          <button
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                            onClick={async () => { setUserMenuOpen(false); try { await signOut(); } catch (e) { console.error(e); } }}
                          >
                            <LogOut className="h-4 w-4" /> {tx("nav.signOut", lang)}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href="/auth/login">
                    <Button size="sm" className="gap-1.5 rounded-full bg-primary hover:bg-primary/90 text-xs px-4">
                      <LogIn className="h-3.5 w-3.5" />
                      {tx("nav.getStarted", lang)}
                    </Button>
                  </Link>
                )}
              </div>

              {/* ── Mobile: Right Controls ── */}
              <div className="ml-auto flex items-center gap-1.5 lg:hidden">
                <CommandPaletteTrigger />
                <LanguageToggle />
                <ThemeToggle />
                <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu"
                  className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted transition-colors">
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Mobile Nav ── */}
        {mobileOpen && (
          <div className="mx-3 mt-2 rounded-2xl border bg-card shadow-xl lg:hidden overflow-hidden">
            {/* Auth */}
            <div className="px-4 py-3 border-b">
              {isLoading ? (
                <div className="h-10 animate-pulse rounded-lg bg-muted" />
              ) : isAuthenticated ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{profile?.full_name || user?.email}</p>
                      <Link href="/" onClick={() => setMobileOpen(false)} className="text-xs text-primary">
                        {tx("nav.dashboard", lang)}
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link href="/profile" onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-muted">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                    </Link>
                    <button onClick={async () => { setMobileOpen(false); try { await signOut(); } catch (e) { console.error(e); } }}
                      className="p-2 rounded-lg hover:bg-muted">
                      <LogOut className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ) : (
                <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full gap-2 rounded-xl bg-primary hover:bg-primary/90">
                    <LogIn className="h-4 w-4" /> {tx("nav.signInUp", lang)}
                  </Button>
                </Link>
              )}
            </div>

            {/* Core nav */}
            <div className="px-3 py-2 space-y-0.5">
              {CORE_NAV.map(({ href, labelKey, icon: Icon }) => (
                <Link key={href} href={href}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive(href) ? "bg-lavender/10 text-lavender" : "text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => setMobileOpen(false)}>
                  <Icon className="h-4 w-4" /> {tx(labelKey, lang)}
                </Link>
              ))}
              <Link href="/calendar"
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive("/calendar") ? "bg-lavender/10 text-lavender" : "text-muted-foreground hover:bg-muted"
                }`}
                onClick={() => setMobileOpen(false)}>
                <Calendar className="h-4 w-4" /> {tx("nav.calendar", lang)}
              </Link>
            </div>

            {/* Mega Menu Categories */}
            <div className="border-t pt-2 pb-2">
              <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                {tx("nav.tools", lang)}
              </p>
              <MobileMegaMenu onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}
      </header>

      {/* Medication reminder — below navbar */}
      {showMedReminder && (
        <div className="mx-auto max-w-6xl px-3 md:px-4 mt-1">
          <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-2 dark:border-amber-800/40 dark:bg-amber-950/20">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="flex-1 text-xs text-amber-800 dark:text-amber-300">{tx("medReminder.text", lang)}</p>
              <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="sm"
                  className="h-7 gap-1 text-[10px] text-amber-700 hover:bg-amber-100 dark:text-amber-300"
                  onClick={dismissReminder} disabled={dismissingReminder}>
                  <Check className="h-3 w-3" /> {tx("medReminder.yesCurrent", lang)}
                </Button>
                <Link href="/profile?tab=medications">
                  <Button variant="outline" size="sm"
                    className="h-7 gap-1 border-amber-300 text-[10px] text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300">
                    <RefreshCw className="h-3 w-3" /> {tx("medReminder.update", lang)}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <CommandPalette />
    </>
  );
}
