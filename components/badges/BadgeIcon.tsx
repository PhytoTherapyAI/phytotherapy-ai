'use client'

import { motion, useReducedMotion } from 'framer-motion'
import WelcomeBadge from './svgs/WelcomeBadge'
import IdentityBadge from './svgs/IdentityBadge'
import FamilyBadge from './svgs/FamilyBadge'
import FirstStepBadge from './svgs/FirstStepBadge'
import HerbalistBadge from './svgs/HerbalistBadge'
import HealthTrackerBadge from './svgs/HealthTrackerBadge'
import ImmunityBadge from './svgs/ImmunityBadge'
import NoDoseBadge from './svgs/NoDoseBadge'
import AIBadge from './svgs/AIBadge'
import StreakBadge from './svgs/StreakBadge'
import HydrationBadge from './svgs/HydrationBadge'

const BADGE_SVG_MAP: Record<string, React.ComponentType<{ locked?: boolean; size?: number }>> = {
  welcome_doctopal: WelcomeBadge,
  identity_revealed: IdentityBadge,
  family_guardian: FamilyBadge,
  family_care: FamilyBadge,
  first_med: FirstStepBadge,
  conscious_user: HerbalistBadge,
  health_tracker: HealthTrackerBadge,
  immune_shield: ImmunityBadge,
  no_dose_missed: NoDoseBadge,
  met_ai: AIBadge,
  phyto_streak: StreakBadge,
  week_one: StreakBadge,
  hydration_master: HydrationBadge,
  hydro_hero: HydrationBadge,
}

interface BadgeIconProps {
  badgeId: string
  locked?: boolean
  size?: number
  showAnimation?: boolean
  className?: string
}

export default function BadgeIcon({
  badgeId,
  locked = false,
  size = 64,
  showAnimation = false,
  className = '',
}: BadgeIconProps) {
  const reducedMotion = useReducedMotion()
  const SvgComponent = BADGE_SVG_MAP[badgeId]

  if (!SvgComponent) return null

  const motionProps = showAnimation && !reducedMotion
    ? {
        initial: { scale: 0, rotate: -15 },
        animate: { scale: 1, rotate: 0 },
        transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
      }
    : {}

  return (
    <motion.div
      className={`inline-flex ${!reducedMotion && !locked ? 'badge-hover-effect' : ''} ${className}`}
      {...motionProps}
    >
      <SvgComponent locked={locked} size={size} />
    </motion.div>
  )
}
