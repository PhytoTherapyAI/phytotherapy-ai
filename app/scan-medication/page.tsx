// © 2026 DoctoPal — All Rights Reserved
//
// F-SCAN-SAFETY-001 — medication-safety hotfix.
//
// Until this commit /scan-medication was a marketing/demo page that
// rendered a HARDCODED product result card after a 3.6 s fake-scan
// animation:
//
//   {showResults && (
//     <Card>
//       <h3>Magnesium Bisglycinate</h3>
//       <p>NOW Foods — 200mg, 120 capsules</p>
//       <Badge>Compatible with Profile</Badge>
//       <Badge>Grade A Evidence</Badge>
//       ...
//     </Card>
//   )}
//
// That output was indistinguishable from a real DoctoPal scan result
// even though no image, OCR, or evidence-engine call had taken
// place. A user tapping "Scan Now" got a confident-looking
// "Compatible with Profile" + "Grade A Evidence" claim out of thin
// air — no camera permission was even requested. For an evidence-
// based health product subject to KVKK, TCK Md.90, 1219 s.K. and
// the GETAT regulation, that's a categorical violation of our own
// safety promise (rule-based engine + sourcing BEFORE any output)
// and was a P0 production bug.
//
// Real medication scanning lives in components/scanner/
// MedicationScanner.tsx (camera + barcode + OCR + the safety engine
// hook from Session 45 F-SAFETY-002). It's wired into
// ProfileShellV2 -> Medications tab. The scan-medication page is
// kept as a marketing entry point, but every interactive surface
// now redirects to the real scanner instead of fabricating output.
//
// Out of scope for this hotfix (Sprint 5 backlog):
//   - Bug B (page is fully English while TR is selected) — i18n
//     pass for the header / chip labels. Header text and the chip
//     labels here stay English; the new safety disclaimer + empty
//     state are bilingual because they're safety-critical and have
//     to be readable in TR for Turkish users.
//   - Bug C (content shifted left, "Try This" row clipped on the
//     right) — container alignment polish.
"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ScanLine, Camera, Sparkles, AlertTriangle } from "lucide-react"
import { useLang } from "@/components/layout/language-toggle"

export default function ScanMedicationPage() {
  const { lang } = useLang()
  const isTr = lang === "tr"

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="mx-auto max-w-2xl px-4 md:px-8 py-6 space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="text-center py-4 space-y-2">
          <ScanLine className="h-10 w-10 text-emerald-400 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Smart Health Lens</h1>
          <p className="text-xs text-slate-400">Point. Scan. Know everything about what you take.</p>
        </motion.div>

        {/* Viewfinder — purely decorative now. The interactive button
            below redirects to the real scanner; this frame just sets
            up the visual metaphor. F-MOBILE-002a sizing kept verbatim
            (max-h responsive cap, tighter corner brackets on mobile). */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative">
          <div className="rounded-3xl bg-slate-800/80 backdrop-blur-md border border-slate-700/50 overflow-hidden aspect-[3/4] max-h-[60vh] sm:max-h-[400px] relative">
            {/* Corner brackets */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 w-8 h-8 border-l-2 border-t-2 border-emerald-400/60 rounded-tl-lg" />
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 border-r-2 border-t-2 border-emerald-400/60 rounded-tr-lg" />
            <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 w-8 h-8 border-l-2 border-b-2 border-emerald-400/60 rounded-bl-lg" />
            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-8 h-8 border-r-2 border-b-2 border-emerald-400/60 rounded-br-lg" />

            {/* Empty-state center content. Replaces the previous
                conditional that swapped between an intro and a
                fake-scan animation; both branches were misleading
                because neither led to a real scan on this page. */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                  <Camera className="h-16 w-16 text-emerald-400/60 mx-auto mb-4" />
                </motion.div>
                <p className="text-sm font-medium text-slate-300">
                  {isTr ? "Henüz tarama yapmadınız" : "No scan yet"}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  {isTr
                    ? "Gerçek tarama için aşağıdaki butonu kullanın"
                    : "Use the button below for the real scanner"}
                </p>
              </motion.div>
            </div>
          </div>

          {/* CTA — redirects to the real scanner inside the
              Medications tab of the profile. That surface owns the
              camera permission flow + barcode + OCR + the safety
              engine cross-check; this page does NOT mount a scanner
              of its own (deliberately, to keep the medical-safety
              path single-sourced). */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mt-5">
            <Link href="/profile?tab=ilaclar">
              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium text-sm shadow-lg shadow-emerald-500/25"
              >
                <Sparkles className="h-4 w-4" />
                {isTr ? "Profilde Tarayıcıyı Aç" : "Open Real Scanner in Profile"}
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* F-SCAN-SAFETY-001 — explicit safety disclaimer. Bilingual
            because it has to be intelligible to a Turkish user
            regardless of which UI language they've toggled. The card
            tells the user (a) this surface doesn't run a real scan,
            (b) where the real one lives, (c) why we don't fabricate
            here. Readability over cleverness. */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-amber-300">
              {isTr
                ? "Bu sayfa şu an demo modundadır"
                : "This page is currently in demo mode"}
            </p>
            <p className="text-[11px] leading-relaxed text-amber-200/80">
              {isTr
                ? "Bu sayfa gerçek bir tarama yapmaz. İlaç ve takviye taraması, profilinizdeki İlaçlar bölümünde — kanıta dayalı güvenlik motorumuza bağlı tarayıcıyla yapılır. Buradaki yüzey hiçbir zaman uydurma sonuç üretmez."
                : "This page does not run a real scan. Medication and supplement scanning happens in the Medications tab of your profile, wired to our evidence-based safety engine. This surface never produces fabricated results."}
            </p>
          </div>
        </div>

        {/* Try This — chips now link to real, working tools instead
            of being decorative buttons. Each href points at a
            surface that actually delivers what the chip promises:
            real medication scanner, real lab-result analysis, real
            supplement comparison. */}
        <div className="space-y-2">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Try This</p>
          <div
            className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 touch-pan-x"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {[
              { emoji: "💊", label: "Open Real Scanner", href: "/profile?tab=ilaclar" },
              { emoji: "📄", label: "Upload Blood Test PDF", href: "/medical-analysis" },
              { emoji: "🌿", label: "Check Supplement Ingredients", href: "/supplement-compare" },
            ].map(c => (
              <Link
                key={c.label}
                href={c.href}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:border-emerald-500/50 transition-colors"
              >
                <span>{c.emoji}</span> {c.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
