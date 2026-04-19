// © 2026 DoctoPal — All Rights Reserved
// Landing content registry — icon + translation key references.
// Single source of truth for Hero/Problem/Solution/HowItWorks/Trust/FinalCTA/Pricing.
// All display strings live in lib/translations/landing.ts (Ad\u0131m A) — this file
// only wires icons and structural metadata. Sections consume these arrays.

import {
  Pill,
  ClipboardList,
  PhoneCall,
  ShieldCheck,
  FileText,
  HeartPulse,
  UserPlus,
  Users,
  Sparkles,
  MapPin,
  GraduationCap,
  Microscope,
  Stethoscope,
  Lock,
  Zap,
  MousePointer,
  Receipt,
  Shield,
  User,
  Star,
  ChevronDown,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

// ── Shared types ─────────────────────────────────────
export interface HeroBadge {
  id: string
  icon: LucideIcon
  textKey: string
}

export interface ProblemCard {
  id: string
  icon: LucideIcon
  titleKey: string
  bodyKey: string
}

export interface SolutionFeature {
  id: string
  icon: LucideIcon
  miniKey: string
  titleKey: string
  bodyKey: string
  chipKeys: [string, string, string, string]
}

export interface HowItWorksStep {
  id: string
  icon: LucideIcon
  stepNumber: number
  titleKey: string
  durationKey: string
  bodyKey: string
}

export interface TrustPillar {
  id: string
  icon: LucideIcon
  titleKey: string
  bodyKey: string
}

export interface FinalCtaBadge {
  id: string
  icon: LucideIcon
  textKey: string
}

export interface PricingPlan {
  id: "free" | "individual" | "family"
  icon: LucideIcon
  featured: boolean
  nameKey: string
  priceKey: string
  periodKey: string
  featureKeys: [string, string, string]
  ctaKey: string
  href: string
  badgeKey?: string
  decoyKey?: string
}

// ── Hero badges ──────────────────────────────────────
// Translations no longer carry emoji prefixes (Session 34 clean-up); the
// Lucide icon is the sole visual marker alongside the text.
export const HERO_BADGES: readonly HeroBadge[] = [
  { id: "badge1", icon: Stethoscope, textKey: "landing.hero.badge1" },
  { id: "badge2", icon: Lock, textKey: "landing.hero.badge2" },
  { id: "badge3", icon: GraduationCap, textKey: "landing.hero.badge3" },
]

export const HERO_SECONDARY_CTA_ICON: LucideIcon = ChevronDown

// ── Problem cards ────────────────────────────────────
// UX: icon sits ABOVE the quote title (slate-400, small), per \u0130pek note.
export const PROBLEM_CARDS: readonly ProblemCard[] = [
  {
    id: "card1",
    icon: Pill,
    titleKey: "landing.problem.card1Title",
    bodyKey: "landing.problem.card1Body",
  },
  {
    id: "card2",
    icon: ClipboardList, // "what will I forget at the doctor" — notes metaphor
    titleKey: "landing.problem.card2Title",
    bodyKey: "landing.problem.card2Body",
  },
  {
    id: "card3",
    icon: PhoneCall, // remote-care metaphor (away from home, needs to reach)
    titleKey: "landing.problem.card3Title",
    bodyKey: "landing.problem.card3Body",
  },
]

// ── Solution features ────────────────────────────────
export const SOLUTION_FEATURES: readonly SolutionFeature[] = [
  {
    id: "feature1",
    icon: ShieldCheck,
    miniKey: "landing.solution.feature1Mini",
    titleKey: "landing.solution.feature1Title",
    bodyKey: "landing.solution.feature1Body",
    chipKeys: [
      "landing.solution.feature1Chip1",
      "landing.solution.feature1Chip2",
      "landing.solution.feature1Chip3",
      "landing.solution.feature1Chip4",
    ],
  },
  {
    id: "feature2",
    icon: FileText,
    miniKey: "landing.solution.feature2Mini",
    titleKey: "landing.solution.feature2Title",
    bodyKey: "landing.solution.feature2Body",
    chipKeys: [
      "landing.solution.feature2Chip1",
      "landing.solution.feature2Chip2",
      "landing.solution.feature2Chip3",
      "landing.solution.feature2Chip4",
    ],
  },
  {
    id: "feature3",
    icon: HeartPulse, // family + emergency — heartbeat conveys urgency better than Users
    miniKey: "landing.solution.feature3Mini",
    titleKey: "landing.solution.feature3Title",
    bodyKey: "landing.solution.feature3Body",
    chipKeys: [
      "landing.solution.feature3Chip1",
      "landing.solution.feature3Chip2",
      "landing.solution.feature3Chip3",
      "landing.solution.feature3Chip4",
    ],
  },
]

// ── How it works steps ───────────────────────────────
export const HOW_IT_WORKS_STEPS: readonly HowItWorksStep[] = [
  {
    id: "step1",
    icon: UserPlus,
    stepNumber: 1,
    titleKey: "landing.howItWorks.step1Title",
    durationKey: "landing.howItWorks.step1Duration",
    bodyKey: "landing.howItWorks.step1Body",
  },
  {
    id: "step2",
    icon: Users,
    stepNumber: 2,
    titleKey: "landing.howItWorks.step2Title",
    durationKey: "landing.howItWorks.step2Duration",
    bodyKey: "landing.howItWorks.step2Body",
  },
  {
    id: "step3",
    icon: Sparkles,
    stepNumber: 3,
    titleKey: "landing.howItWorks.step3Title",
    durationKey: "landing.howItWorks.step3Duration",
    bodyKey: "landing.howItWorks.step3Body",
  },
]

// ── Trust pillars ────────────────────────────────────
// col2 uses GraduationCap (NOT Stethoscope) to reinforce "student founders"
// framing — 1219 sK legal safety: we are not claiming "hekim" credentials.
export const TRUST_PILLARS: readonly TrustPillar[] = [
  {
    id: "col1",
    icon: MapPin,
    titleKey: "landing.trust.col1Title",
    bodyKey: "landing.trust.col1Body",
  },
  {
    id: "col2",
    icon: GraduationCap,
    titleKey: "landing.trust.col2Title",
    bodyKey: "landing.trust.col2Body",
  },
  {
    id: "col3",
    icon: Microscope,
    titleKey: "landing.trust.col3Title",
    bodyKey: "landing.trust.col3Body",
  },
  {
    id: "col4",
    icon: Lock,
    titleKey: "landing.trust.col4Title",
    bodyKey: "landing.trust.col4Body",
  },
]

// ── Final CTA badges ─────────────────────────────────
export const FINAL_CTA_BADGES: readonly FinalCtaBadge[] = [
  { id: "badge1", icon: Zap, textKey: "landing.finalCta.badge1" },
  { id: "badge2", icon: MousePointer, textKey: "landing.finalCta.badge2" },
  { id: "badge3", icon: Receipt, textKey: "landing.finalCta.badge3" },
  { id: "badge4", icon: Shield, textKey: "landing.finalCta.badge4" },
]

// ── Pricing plans (3 cards, family featured for decoy effect) ──
// `featured: true` triggers emerald background + badge + strikethrough decoy
// + inverted CTA styling in PricingSnapshotSection (Ad\u0131m D).
// `href` targets align with /pricing + /checkout routes (Session 33).
export const PRICING_PLANS: readonly PricingPlan[] = [
  {
    id: "free",
    icon: User,
    featured: false,
    nameKey: "landing.pricing.freeName",
    priceKey: "landing.pricing.freePrice",
    periodKey: "landing.pricing.freePeriod",
    featureKeys: [
      "landing.pricing.freeFeature1",
      "landing.pricing.freeFeature2",
      "landing.pricing.freeFeature3",
    ],
    ctaKey: "landing.pricing.freeCta",
    href: "/auth/register",
  },
  {
    id: "individual",
    icon: Star,
    featured: false,
    nameKey: "landing.pricing.individualName",
    priceKey: "landing.pricing.individualPrice",
    periodKey: "landing.pricing.individualPeriod",
    featureKeys: [
      "landing.pricing.individualFeature1",
      "landing.pricing.individualFeature2",
      "landing.pricing.individualFeature3",
    ],
    ctaKey: "landing.pricing.individualCta",
    href: "/checkout?plan=individual-yearly",
  },
  {
    id: "family",
    icon: Users,
    featured: true,
    nameKey: "landing.pricing.familyName",
    priceKey: "landing.pricing.familyPrice",
    periodKey: "landing.pricing.familyPeriod",
    featureKeys: [
      "landing.pricing.familyFeature1",
      "landing.pricing.familyFeature2",
      "landing.pricing.familyFeature3",
    ],
    ctaKey: "landing.pricing.familyCta",
    href: "/checkout?plan=family-yearly",
    badgeKey: "landing.pricing.familyBadge",
    decoyKey: "landing.pricing.familyDecoy",
  },
]
