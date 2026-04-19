// © 2026 DoctoPal — All Rights Reserved
// Composition root for the marketing landing page.
// Renders nav + 7 sections + footer in the conversion-optimised order:
// Hero → Problem → Solution → HowItWorks → PricingSnapshot → Trust → FinalCTA.
// Each section owns its own padding/background; no extra wrapper spacing needed.
"use client"

import { LandingNav } from "./LandingNav"
import { LandingFooter } from "./LandingFooter"
import { HeroSection } from "./sections/HeroSection"
import { ProblemSection } from "./sections/ProblemSection"
import { SolutionSection } from "./sections/SolutionSection"
import { HowItWorksSection } from "./sections/HowItWorksSection"
import { PricingSnapshotSection } from "./sections/PricingSnapshotSection"
import { TrustSection } from "./sections/TrustSection"
import { FinalCTASection } from "./sections/FinalCTASection"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <LandingNav />
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <HowItWorksSection />
        <PricingSnapshotSection />
        <TrustSection />
        <FinalCTASection />
      </main>
      <LandingFooter />
    </div>
  )
}
