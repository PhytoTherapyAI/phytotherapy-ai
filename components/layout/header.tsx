"use client";

import Link from "next/link";
import { Leaf, LogIn, User, Users, LogOut, Settings, AlertTriangle, Check, RefreshCw, Droplets, Calculator, FlaskConical, Menu, X } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageToggle, useLang } from "@/components/layout/language-toggle";
import { Button } from "@/components/ui/button";
import { tx } from "@/lib/translations";
import { createBrowserClient } from "@/lib/supabase";

// All nav links — shown directly in desktop, in mobile drawer
const allLinks = [
  { href: "/family", labelKey: "family.title" },
  { href: "/health-assistant", labelKey: "nav.assistant" },
  { href: "/calendar", labelKey: "nav.calendar" },
  { href: "/interaction-checker", labelKey: "nav.interaction" },
  { href: "/blood-test", labelKey: "nav.bloodtest" },
  { href: "/calorie", labelKey: "nav.calorie" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, isLoading, user, profile, signOut, needsMedicationUpdate, refreshProfile } = useAuth();
  const { lang } = useLang()
  const [showMedReminder, setShowMedReminder] = useState(false);
  const [dismissingReminder, setDismissingReminder] = useState(false);

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
    } catch {
      // silently fail
    } finally {
      setDismissingReminder(false);
    }
  }, [user?.id, refreshProfile]);

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "U";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <Leaf
            className="h-[18px] w-[18px] transition-all duration-300 group-hover:scale-110"
            style={{ color: 'var(--logo-accent, #c4a86c)' }}
          />
          <span style={{
            fontFamily: '"DM Serif Display", "Palatino Linotype", Georgia, serif',
            fontSize: '1.18rem',
            fontWeight: 400,
            letterSpacing: '0.01em',
            lineHeight: 1,
          }}>
            <span style={{ color: 'var(--foreground)' }}>Phyto</span><span style={{ color: 'var(--logo-accent, #c4a86c)' }}>therapy</span><span style={{ color: 'var(--primary)' }}>.ai</span>
          </span>
        </Link>

        {/* Desktop nav — all links visible, pushed right */}
        <nav className="ml-auto hidden items-center gap-3 lg:flex">
          {allLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-[13px] font-semibold text-foreground/80 transition-colors hover:text-foreground"
            >
              {tx(link.labelKey, lang)}
            </Link>
          ))}
          {isAuthenticated && (
            <Link
              href="/dashboard"
              className="whitespace-nowrap text-[13px] font-semibold text-foreground/80 transition-colors hover:text-foreground"
            >
              {tx("nav.dashboard", lang)}
            </Link>
          )}
        </nav>

        {/* Desktop right controls */}
        <div className="ml-3 hidden items-center gap-2 lg:flex">
          <LanguageToggle />
          <ThemeToggle />

          {isLoading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary transition-colors hover:bg-primary/20 cursor-pointer"
              >
                {initials}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full z-[100] mt-2 w-56 rounded-lg border bg-background shadow-lg">
                  <div className="border-b p-3">
                    {profile?.full_name && (
                      <p className="text-sm font-medium">{profile.full_name}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <div className="p-1">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      {tx('nav.profileSettings', lang)}
                    </Link>
                    <Link
                      href="/history"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <RefreshCw className="h-4 w-4" />
                      {tx('nav.history', lang)}
                    </Link>
                    <Link
                      href="/badges"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <FlaskConical className="h-4 w-4" />
                      {tx('badges.title', lang)}
                    </Link>
                  </div>
                  <div className="border-t p-1">
                    <button
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={async () => {
                        setUserMenuOpen(false);
                        await signOut();
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      {tx('nav.signOut', lang)}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/login">
              <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                <LogIn className="h-4 w-4" />
                {tx('nav.getStarted', lang)}
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile right */}
        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <LanguageToggle />
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-t px-4 py-4 lg:hidden">
          {allLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {tx(link.labelKey, lang)}
            </Link>
          ))}

          {isAuthenticated && (
            <Link
              href="/dashboard"
              className="mt-2 block border-t pt-2 text-sm font-semibold text-primary hover:text-primary/80"
              onClick={() => setMobileOpen(false)}
            >
              {tx("nav.dashboard", lang)}
            </Link>
          )}

          <div className="mt-2 border-t pt-2">
            {isLoading ? (
              <div className="h-6 w-24 animate-pulse rounded bg-muted" />
            ) : isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 py-2">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm">{profile?.full_name || user?.email}</span>
                </div>
                <Link
                  href="/profile"
                  className="block py-2 text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {tx('nav.profileSettings', lang)}
                </Link>
                <button
                  className="block w-full py-2 text-left text-sm text-red-600 hover:text-red-700"
                  onClick={async () => {
                    setMobileOpen(false);
                    await signOut();
                  }}
                >
                  {tx('nav.signOut', lang)}
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="block py-2 text-sm font-medium text-primary hover:text-primary/80"
                onClick={() => setMobileOpen(false)}
              >
                {tx('nav.signInUp', lang)}
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>

    {/* Medication update reminder banner */}
    {showMedReminder && (
      <div className="border-b bg-amber-50 dark:bg-amber-950/30">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="flex-1 text-sm text-amber-800 dark:text-amber-300">
            {tx('medReminder.text', lang)}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/40"
              onClick={dismissReminder}
              disabled={dismissingReminder}
            >
              <Check className="h-3 w-3" />
              {tx('medReminder.yesCurrent', lang)}
            </Button>
            <Link href="/profile?tab=medications">
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1 border-amber-300 text-xs text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/40"
              >
                <RefreshCw className="h-3 w-3" />
                {tx('medReminder.update', lang)}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
