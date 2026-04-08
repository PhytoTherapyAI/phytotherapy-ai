// © 2026 DoctoPal — All Rights Reserved
/**
 * Doctopal Custom Icon Set
 *
 * Design principles (behavioral psychology):
 * - Rounded organic shapes → trust & safety (vs angular = danger)
 * - Dual-tone coloring → premium, modern feel
 * - Botanical motifs integrated into medical symbols → brand uniqueness
 * - Warm accent colors → emotional engagement
 * - Consistent 24x24 viewBox → drop-in replacement
 */

import { type SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

const defaults = (props: IconProps) => ({
  width: props.size || 24,
  height: props.size || 24,
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  ...props,
  size: undefined,
})

// ── Leaf + Shield = Safe Herbal ──
export function IconSafeHerbal(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <path d="M12 2C7 2 3 6 3 11c0 3.5 2 6.5 5 8l4 3 4-3c3-1.5 5-4.5 5-8 0-5-4-9-9-9z" fill="currentColor" opacity="0.12" />
      <path d="M12 3c-4.4 0-8 3.6-8 8 0 3 1.7 5.7 4.3 7L12 21l3.7-3c2.6-1.3 4.3-4 4.3-7 0-4.4-3.6-8-8-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 7c-2 0-4 2.5-4 5s2 3 4 3 4-.5 4-3-2-5-4-5z" fill="currentColor" opacity="0.25" />
      <path d="M12 8v7M10 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// ── Research Flask with Leaf ──
export function IconResearchLeaf(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <path d="M9 3h6v5l3 8c.5 1.5-.5 3-2 3H8c-1.5 0-2.5-1.5-2-3l3-8V3z" fill="currentColor" opacity="0.1" />
      <path d="M9 3h6v5l3 8c.5 1.5-.5 3-2 3H8c-1.5 0-2.5-1.5-2-3l3-8V3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 3h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 12c1.5-2 3.5-2.5 5-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <circle cx="12" cy="15" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="10" cy="17" r="1" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

// ── Blood Drop Analysis ──
export function IconBloodAnalysis(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <path d="M12 2L7 10c-1.5 2.5-.5 6 2.5 7.5S16 18.5 17 16l-5-14z" fill="currentColor" opacity="0.12" />
      <path d="M12 2L7 10c-1.5 2.5-.5 6 2.5 7.5S16 18.5 17 16l-5-14z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 13h4M12 11v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="13" r="3" fill="currentColor" opacity="0.08" />
    </svg>
  )
}

// ── Pill with Botanical Pattern ──
export function IconHerbalPill(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <rect x="5" y="8" width="14" height="8" rx="4" fill="currentColor" opacity="0.12" />
      <rect x="5" y="8" width="14" height="8" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 11c0-1 .5-1.5 1-1.5s1 .5 1 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <path d="M15 12c1-1.5 2-1 2 0s-1 1.5-2 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}

// ── Brain with Neural Sprouts ──
export function IconMindGrow(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <path d="M12 2C8 2 5 5 5 9c0 2.5 1 4.5 3 6v4h8v-4c2-1.5 3-3.5 3-6 0-4-3-7-7-7z" fill="currentColor" opacity="0.1" />
      <path d="M12 2C8 2 5 5 5 9c0 2.5 1 4.5 3 6v4h8v-4c2-1.5 3-3.5 3-6 0-4-3-7-7-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 21h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 6v4M10 8l4 2M14 8l-4 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}

// ── Plate with Leaf (Nutrition) ──
export function IconNutritionLeaf(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <circle cx="12" cy="13" r="8" fill="currentColor" opacity="0.08" />
      <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7c-1 2-1 4 0 6s2 3 4 3c-1-2-1-4 0-6s-2-4-4-3z" fill="currentColor" opacity="0.2" />
      <path d="M12 7c1 2 1 4 0 6s-2 3-4 3c1-2 1-4 0-6s2-4 4-3z" fill="currentColor" opacity="0.15" />
      <path d="M12 3v2M19 6l-1.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  )
}

// ── Moon with Waves (Sleep) ──
export function IconSleepWave(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <path d="M20 14c-3 2-7 1.5-9-1s-3-6-1-9c-4 1-7 5-7 9 0 5 4 9 9 9 4 0 7-3 8-8z" fill="currentColor" opacity="0.12" />
      <path d="M20 14c-3 2-7 1.5-9-1s-3-6-1-9c-4 1-7 5-7 9 0 5 4 9 9 9 4 0 7-3 8-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 5l.5 1.5L18 7l-1.5.5L16 9l-.5-1.5L14 7l1.5-.5z" fill="currentColor" opacity="0.4" />
      <path d="M20 10l.3.9.9.3-.9.3-.3.9-.3-.9-.9-.3.9-.3z" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

// ── Heart with Pulse Line ──
export function IconHeartPulse(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <path d="M12 21C12 21 4 15 4 9.5C4 6.5 6.5 4 9.5 4c1.7 0 3.3 1 4 2.3h-3c.7-1.3 2.3-2.3 4-2.3C17.5 4 20 6.5 20 9.5c0 5.5-8 11.5-8 11.5z" fill="currentColor" opacity="0.12" />
      <path d="M12 21C12 21 4 15 4 9.5C4 6.5 6.5 4 9.5 4c1.7 0 3.3 1 4 2.3h-3c.7-1.3 2.3-2.3 4-2.3C17.5 4 20 6.5 20 9.5c0 5.5-8 11.5-8 11.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 12h3l2-3 2 6 2-4 2 1h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
    </svg>
  )
}

// ── Dumbbell with Growth Arrow ──
export function IconFitnessGrowth(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <path d="M4 10h2v4H4zM18 10h2v4h-2z" fill="currentColor" opacity="0.25" />
      <path d="M6 8h2v8H6zM16 8h2v8h-2z" fill="currentColor" opacity="0.15" />
      <rect x="8" y="10" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="6" y="8" width="2" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="16" y="8" width="2" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 10h2M18 10h2M4 14h2M18 14h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 7V3m0 0l-2 2m2-2l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
    </svg>
  )
}

// ── Shield with Check + Leaf ──
export function IconPreventionShield(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <path d="M12 2L4 6v5c0 5.5 3.4 10.3 8 12 4.6-1.7 8-6.5 8-12V6l-8-4z" fill="currentColor" opacity="0.1" />
      <path d="M12 2L4 6v5c0 5.5 3.4 10.3 8 12 4.6-1.7 8-6.5 8-12V6l-8-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Stethoscope with Botanical ──
export function IconMedicalBotanical(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <circle cx="12" cy="17" r="4" fill="currentColor" opacity="0.1" />
      <path d="M6 9V6a3 3 0 016 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 9c0 4 3 7 3 8s3-4 3-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="17" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="17" r="0.5" fill="currentColor" />
      <path d="M18 7c1 0 2 .5 2 1.5S19 10 18 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
    </svg>
  )
}

// ── Eye with Sparkle (Vision/Transparency) ──
export function IconVisionSparkle(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" fill="currentColor" opacity="0.08" />
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <path d="M12 3l.3 1 1 .3-1 .3L12 5l-.3-1-1-.3 1-.3z" fill="currentColor" opacity="0.5" />
    </svg>
  )
}

// ── Crosshair Target (Mission) ──
export function IconMissionTarget(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.06" />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
    </svg>
  )
}

// ── People with Connection Lines ──
export function IconCommunityNet(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <circle cx="12" cy="7" r="3" fill="currentColor" opacity="0.15" />
      <circle cx="5" cy="17" r="2.5" fill="currentColor" opacity="0.1" />
      <circle cx="19" cy="17" r="2.5" fill="currentColor" opacity="0.1" />
      <circle cx="12" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="5" cy="17" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="19" cy="17" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9.5 9.5L6.5 15M14.5 9.5l3 5.5M7.5 17h9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.35" />
    </svg>
  )
}

// ── Chart with Upward Botanical Growth ──
export function IconGrowthChart(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" opacity="0.06" />
      <path d="M6 18l4-5 3 2 5-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="18" cy="7" r="2" fill="currentColor" opacity="0.2" />
      <path d="M18 7V4M16 6l2 1M20 6l-2 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <path d="M3 21h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  )
}

// ── Lock with Leaf (Privacy) ──
export function IconPrivacyLeaf(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor" opacity="0.1" />
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="16" r="1.5" fill="currentColor" opacity="0.4" />
      <path d="M12 17.5V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// ── Conflict Detection (Lightning + Warning) ──
export function IconConflictDetect(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <path d="M12 2L3 14h8l-1 8 10-12h-8l1-8z" fill="currentColor" opacity="0.1" />
      <path d="M12 2L3 14h8l-1 8 10-12h-8l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Decision Support (Balance Scale) ──
export function IconDecisionBalance(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <path d="M12 3v18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 21h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 9l4-2 4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 7l4-2 4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 9c0 2 1.5 3 4 3s4-1 4-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="currentColor" fillOpacity="0.08" />
      <path d="M12 7c0 2 1.5 3 4 3s4-1 4-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="currentColor" fillOpacity="0.08" />
    </svg>
  )
}

// ── Longevity (Infinity + Sprout) ──
export function IconLongevity(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <path d="M12 12c-2-2-5-2-6 0s0 5 2 6c1.5.7 3 0 4-1 1 1 2.5 1.7 4 1 2-1 3-4 2-6s-4-2-6 0z" fill="currentColor" opacity="0.1" />
      <path d="M12 12c-2-2-5-2-6 0s0 5 2 6c1.5.7 3 0 4-1 1 1 2.5 1.7 4 1 2-1 3-4 2-6s-4-2-6 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 6V3M10 5l2-2 2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      <circle cx="12" cy="5" r="0.5" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

// ── Gender/People (Two overlapping circles) ──
export function IconGenderHealth(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <circle cx="9" cy="12" r="5" fill="currentColor" opacity="0.08" />
      <circle cx="15" cy="12" r="5" fill="currentColor" opacity="0.08" />
      <circle cx="9" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 9v6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
    </svg>
  )
}

// ── Settings Gear with Leaf ──
export function IconSettingsLeaf(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <circle cx="12" cy="12" r="1" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

// ── Doctor with Stethoscope ──
export function IconDoctorCare(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <circle cx="12" cy="7" r="4" fill="currentColor" opacity="0.1" />
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 21v-2a7 7 0 0114 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 21v-2a7 7 0 0114 0v2" fill="currentColor" opacity="0.06" />
      <path d="M14 7h2a1 1 0 011 1v1a1 1 0 01-1 1h-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}

// ── Baby/Life Stages ──
export function IconLifeStages(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <circle cx="8" cy="8" r="3" fill="currentColor" opacity="0.15" />
      <circle cx="16" cy="10" r="4" fill="currentColor" opacity="0.08" />
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 21v-1a3 3 0 016 0v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 21v-1a4 4 0 018 0v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11 8h1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
    </svg>
  )
}
