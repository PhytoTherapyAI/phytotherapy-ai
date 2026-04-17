// © 2026 DoctoPal — All Rights Reserved
import { useFamily } from '@/lib/family-context'
import { useAuth } from '@/lib/auth-context'

/**
 * Unified hook for "whose profile am I looking at right now?"
 *
 * - activeUserId:     effective user id (family switch or self)
 * - isOwnProfile:     true when viewing own data
 * - hasManageRole:    own profile OR canManage(target) (role-based, ignores plan)
 * - canEdit:          hasManageRole AND (own profile OR Premium) — what UI
 *                     should check to enable edit actions
 * - needsPremiumToEdit: user has the role to edit this profile but lacks
 *                     Premium — show an "Upgrade" CTA
 */
export function useActiveProfile() {
  const { user, premiumStatus } = useAuth()
  const { activeProfileId, canManage } = useFamily()

  // activeProfileId empty string = no family context, fall back to self
  const effectiveUserId = (activeProfileId && activeProfileId.length > 0)
    ? activeProfileId
    : (user?.id || '')

  const isOwnProfile = !user || effectiveUserId === user.id
  const hasManageRole = isOwnProfile || canManage(effectiveUserId)
  const isPremium = premiumStatus?.isPremium ?? false

  // Edit rule: own profile is always editable (even on Free). For other
  // family members, require BOTH management role AND active Premium.
  const canEdit = isOwnProfile || (hasManageRole && isPremium)
  const needsPremiumToEdit = !isOwnProfile && hasManageRole && !isPremium

  return {
    activeUserId: effectiveUserId,
    isOwnProfile,
    canEdit,
    hasManageRole,
    needsPremiumToEdit,
  }
}
