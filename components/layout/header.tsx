// © 2026 Phytotherapy.ai — All Rights Reserved
"use client";

import Link from "next/link";
import { Leaf, LogIn, User, LogOut, Settings, AlertTriangle, Check, RefreshCw, FlaskConical, Menu, X, ChevronDown, Wrench } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageToggle, useLang } from "@/components/layout/language-toggle";
import { Button } from "@/components/ui/button";
import { tx } from "@/lib/translations";
import { createBrowserClient } from "@/lib/supabase";
import { MegaMenu } from "@/components/layout/mega-menu/MegaMenu";
import { MobileMegaMenu } from "@/components/layout/mega-menu/MobileMegaMenu";
import { CommandPalette, CommandPaletteTrigger } from "@/components/layout/CommandPalette";

// Main nav links (always visible)
const mainLinks = [
  { href: "/health-assistant", labelKey: "nav.assistant" },
  { href: "/calendar", labelKey: "nav.calendar" },
  { href: "/interaction-checker", labelKey: "nav.interaction" },
];

// Tools dropdown items — all 85 tools organized by category
const toolLinks = [
  // Core Analysis
  { href: "/health-analytics", labelKey: "nav.healthAnalytics" },
  { href: "/medical-analysis", labelKey: "nav.medicalAnalysis" },
  { href: "/body-analysis", labelKey: "nav.bodyAnalysis" },
  { href: "/symptom-checker", labelKey: "nav.symptomChecker" },
  { href: "/food-interaction", labelKey: "nav.foodInteraction" },
  { href: "/supplement-compare", labelKey: "nav.supCompare" },
  { href: "/interaction-map", labelKey: "nav.intMap" },
  { href: "/health-goals", labelKey: "nav.healthGoals" },
  { href: "/prospectus-reader", labelKey: "nav.prospectus" },
  // Tracking
  { href: "/sleep-analysis", labelKey: "nav.sleepAnalysis" },
  { href: "/mental-wellness", labelKey: "nav.mentalWellness" },
  { href: "/nutrition", labelKey: "nav.nutrition" },
  { href: "/pain-diary", labelKey: "nav.painDiary" },
  { href: "/voice-diary", labelKey: "nav.voiceDiary" },
  // Health Conditions
  { href: "/chronic-care", labelKey: "nav.chronicCare" },
  { href: "/allergy-map", labelKey: "nav.allergyMap" },
  { href: "/gut-health", labelKey: "nav.gutHealth" },
  { href: "/skin-health", labelKey: "nav.skinHealth" },
  { href: "/pharmacogenetics", labelKey: "nav.pharmacogenetics" },
  // Women & Men
  { href: "/womens-health", labelKey: "nav.womensHealth" },
  { href: "/pregnancy-tracker", labelKey: "nav.pregnancyTracker" },
  { href: "/postpartum-support", labelKey: "nav.postpartum" },
  { href: "/menopause-panel", labelKey: "nav.menopause" },
  { href: "/mens-health", labelKey: "nav.mensHealth" },
  { href: "/sexual-health", labelKey: "nav.sexualHealth" },
  // Mental Health
  { href: "/anxiety-toolkit", labelKey: "nav.anxietyToolkit" },
  { href: "/depression-screening", labelKey: "nav.depressionScreening" },
  { href: "/adhd-management", labelKey: "nav.adhdManagement" },
  { href: "/ptsd-support", labelKey: "nav.ptsdSupport" },
  { href: "/addiction-recovery", labelKey: "nav.addictionRecovery" },
  { href: "/grief-support", labelKey: "nav.griefSupport" },
  // Organ Systems
  { href: "/eye-health", labelKey: "nav.eyeHealth" },
  { href: "/ear-health", labelKey: "nav.earHealth" },
  { href: "/dental-health", labelKey: "nav.dentalHealth" },
  { href: "/hair-nail-health", labelKey: "nav.hairNail" },
  { href: "/kidney-dashboard", labelKey: "nav.kidneyDashboard" },
  { href: "/liver-monitor", labelKey: "nav.liverMonitor" },
  { href: "/thyroid-dashboard", labelKey: "nav.thyroidDashboard" },
  { href: "/cardiovascular-risk", labelKey: "nav.cardiovascularRisk" },
  { href: "/lung-monitor", labelKey: "nav.lungMonitor" },
  { href: "/diabetic-foot", labelKey: "nav.diabeticFoot" },
  // Daily Habits
  { href: "/caffeine-tracker", labelKey: "nav.caffeineTracker" },
  { href: "/alcohol-tracker", labelKey: "nav.alcoholTracker" },
  { href: "/smoking-cessation", labelKey: "nav.smokingCessation" },
  { href: "/intermittent-fasting", labelKey: "nav.intermittentFasting" },
  { href: "/breathing-exercises", labelKey: "nav.breathingExercises" },
  { href: "/hydration", labelKey: "nav.hydration" },
  // Fitness & Movement
  { href: "/sports-performance", labelKey: "nav.sportsPerf" },
  { href: "/stretching", labelKey: "nav.stretching" },
  { href: "/walking-tracker", labelKey: "nav.walkingTracker" },
  { href: "/yoga-meditation", labelKey: "nav.yogaMeditation" },
  { href: "/posture-ergonomics", labelKey: "nav.postureErgonomics" },
  // Medical Tools
  { href: "/appointment-prep", labelKey: "nav.appointmentPrep" },
  { href: "/vaccination", labelKey: "nav.vaccination" },
  { href: "/rehabilitation", labelKey: "nav.rehabilitation" },
  { href: "/emergency-id", labelKey: "nav.emergencyId" },
  { href: "/health-guides", labelKey: "nav.healthGuides" },
  // Screening & Prevention
  { href: "/cancer-screening", labelKey: "nav.cancerScreening" },
  { href: "/checkup-planner", labelKey: "nav.checkupPlanner" },
  { href: "/family-health-tree", labelKey: "nav.familyTree" },
  { href: "/genetic-risk", labelKey: "nav.geneticRisk" },
  // Life Stages
  { href: "/child-health", labelKey: "nav.childHealth" },
  { href: "/elder-care", labelKey: "nav.elderCare" },
  { href: "/student-health", labelKey: "nav.studentHealth" },
  { href: "/new-parent-health", labelKey: "nav.newParentHealth" },
  { href: "/retirement-health", labelKey: "nav.retirementHealth" },
  // Environment & Travel
  { href: "/travel-health", labelKey: "nav.travelHealth" },
  { href: "/seasonal-health", labelKey: "nav.seasonalHealth" },
  { href: "/sun-exposure", labelKey: "nav.sunExposure" },
  { href: "/air-quality", labelKey: "nav.airQuality" },
  { href: "/jet-lag", labelKey: "nav.jetLag" },
  { href: "/shift-worker", labelKey: "nav.shiftWorker" },
  // Education & Info
  { href: "/medical-dictionary", labelKey: "nav.medicalDictionary" },
  { href: "/drug-info", labelKey: "nav.drugInfo" },
  { href: "/doctor-communication", labelKey: "nav.doctorComm" },
  { href: "/health-news-verifier", labelKey: "nav.newsVerifier" },
  // Nutrition Detail
  { href: "/label-reader", labelKey: "nav.labelReader" },
  { href: "/anti-inflammatory", labelKey: "nav.antiInflammatory" },
  { href: "/cross-allergy", labelKey: "nav.crossAllergy" },
  { href: "/water-quality", labelKey: "nav.waterQuality" },
  // Sleep Detail
  { href: "/dream-diary", labelKey: "nav.dreamDiary" },
  { href: "/snoring-apnea", labelKey: "nav.snoringApnea" },
  { href: "/circadian-rhythm", labelKey: "nav.circadianRhythm" },
  // Specialized
  { href: "/clinical-trials", labelKey: "nav.clinicalTrials" },
  { href: "/second-opinion", labelKey: "nav.secondOpinion" },
  { href: "/rare-diseases", labelKey: "nav.rareDiseases" },
  { href: "/donation", labelKey: "nav.donation" },
  { href: "/accessibility", labelKey: "nav.accessibility" },
  // Tracking & Social
  { href: "/health-spending", labelKey: "nav.healthSpending" },
  { href: "/health-challenges", labelKey: "nav.challenges" },
  { href: "/noise-exposure", labelKey: "nav.noiseExposure" },
  { href: "/screen-time", labelKey: "nav.screenTime" },
  { href: "/insurance-guide", labelKey: "nav.insuranceGuide" },
  { href: "/pharmacy-finder", labelKey: "nav.pharmacyFinder" },
  // Education & Business
  { href: "/courses", labelKey: "nav.courses" },
  { href: "/enterprise", labelKey: "nav.enterprise" },
  // New Features (Phase C-F)
  { href: "/notifications", labelKey: "nav.notifications" },
  { href: "/time-capsule", labelKey: "nav.timeCapsule" },
  { href: "/health-diary", labelKey: "nav.healthDiary" },
  { href: "/biomarker-trends", labelKey: "nav.biomarkerTrends" },
  { href: "/medication-hub", labelKey: "nav.medicationHub" },
  { href: "/polypharmacy", labelKey: "nav.polypharmacy" },
  { href: "/medication-log", labelKey: "nav.medLog" },
  { href: "/health-radar", labelKey: "nav.healthRadar" },
  { href: "/health-timeline", labelKey: "nav.healthTimeline" },
  { href: "/micro-habits", labelKey: "nav.microHabits" },
  { href: "/migraine-dashboard", labelKey: "nav.migraineDashboard" },
  { href: "/fasting-monitor", labelKey: "nav.fastingMonitor" },
  { href: "/circadian-eating", labelKey: "nav.circadianEating" },
  { href: "/peer-mentoring", labelKey: "nav.peerMentoring" },
  { href: "/drug-equivalent", labelKey: "nav.drugEquivalent" },
  { href: "/drug-recall", labelKey: "nav.drugRecall" },
  { href: "/disaster-mode", labelKey: "nav.disasterMode" },
  { href: "/health-quiz", labelKey: "nav.healthQuiz" },
  { href: "/healthy-recipes", labelKey: "nav.healthyRecipes" },
  { href: "/data-export", labelKey: "nav.dataExport" },
  { href: "/privacy-controls", labelKey: "nav.privacyControls" },
  // Value & Marketplace
  { href: "/value-marketplace", labelKey: "nav.valueMarketplace" },
];

// All links combined for mobile
const allMobileLinks = [
  ...mainLinks,
  { href: "/family", labelKey: "family.title" },
  ...toolLinks,
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, isLoading, user, profile, signOut, needsMedicationUpdate, refreshProfile } = useAuth();
  const { lang } = useLang()
  const [showMedReminder, setShowMedReminder] = useState(false);
  const [dismissingReminder, setDismissingReminder] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4 md:px-8">
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

        {/* Desktop nav */}
        <nav className="ml-8 hidden items-center gap-4 xl:gap-5 lg:flex">
          {mainLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              {tx(link.labelKey, lang)}
            </Link>
          ))}
          <Link
            href="/family"
            className="whitespace-nowrap text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
          >
            {tx("family.title", lang)}
          </Link>

          {/* Tools link — full tools accessible from dashboard */}

          {isAuthenticated && (
            <Link
              href="/dashboard"
              className="whitespace-nowrap text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              {tx("nav.dashboard", lang)}
            </Link>
          )}
        </nav>

        {/* Desktop right controls */}
        <div className="ml-auto hidden items-center gap-2 lg:flex">
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
                aria-expanded={userMenuOpen}
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
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={async () => {
                        setUserMenuOpen(false);
                        try { await signOut(); } catch (e) { console.error("Sign out failed:", e); }
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
        <nav className="max-h-[80vh] overflow-y-auto border-t py-2 lg:hidden">
          {/* Main links */}
          <div className="px-4 py-2 space-y-1">
            {mainLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setMobileOpen(false)}>
                {tx(link.labelKey, lang)}
              </Link>
            ))}
            <Link href="/family"
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(false)}>
              {tx("family.title", lang)}
            </Link>
          </div>
          {/* Auth section — prominent, at the top of mobile menu */}
          <div className="px-4 py-3 border-b border-border">
            {isLoading ? (
              <div className="h-10 animate-pulse rounded-lg bg-muted" />
            ) : isAuthenticated ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                    {profile?.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{profile?.full_name || user?.email}</p>
                    <Link href="/dashboard" onClick={() => setMobileOpen(false)}
                      className="text-xs text-primary">{tx("nav.dashboard", lang)}</Link>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href="/profile" onClick={() => setMobileOpen(false)}
                    className="p-2 rounded-lg hover:bg-muted"><Settings className="h-4 w-4 text-muted-foreground" /></Link>
                  <button onClick={async () => { setMobileOpen(false); try { await signOut(); } catch (e) { console.error(e); } }}
                    className="p-2 rounded-lg hover:bg-muted"><LogOut className="h-4 w-4 text-red-500" /></button>
                </div>
              </div>
            ) : (
              <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                <Button className="w-full gap-2 bg-primary hover:bg-primary/90">
                  <LogIn className="h-4 w-4" />
                  {tx('nav.signInUp', lang)}
                </Button>
              </Link>
            )}
          </div>

          {/* Mega Menu Categories */}
          <div className="border-t mt-1 pt-2">
            <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              {tx("nav.tools", lang)}
            </p>
            <MobileMegaMenu onNavigate={() => setMobileOpen(false)} />
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
    <CommandPalette />
    </>
  );
}
