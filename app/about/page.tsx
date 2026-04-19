// © 2026 DoctoPal — All Rights Reserved
// /about marketing page. Wraps the shared landing nav/footer around
// <AboutSection /> so visitors stay inside the marketing shell.
"use client"

import { LandingNav } from "@/components/landing/LandingNav"
import { LandingFooter } from "@/components/landing/LandingFooter"
import { AboutSection } from "@/components/landing/sections/AboutSection"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <LandingNav />
      <main>
        <AboutSection />
      </main>
      <LandingFooter />
    </div>
  )
}
