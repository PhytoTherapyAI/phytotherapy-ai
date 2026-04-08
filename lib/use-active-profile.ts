// © 2026 DoctoPal — All Rights Reserved
import { useFamily } from '@/lib/family-context'
import { useAuth } from '@/lib/auth-context'

export function useActiveProfile() {
  const { user } = useAuth()
  const { activeProfileId, canManage } = useFamily()

  // activeProfileId empty string = no family, fallback to own user
  const effectiveUserId = (activeProfileId && activeProfileId.length > 0)
    ? activeProfileId
    : (user?.id || '')
  const isOwnProfile = !user || effectiveUserId === user.id
  const canEdit = isOwnProfile || canManage(effectiveUserId)

  return {
    activeUserId: effectiveUserId,
    isOwnProfile,
    canEdit,
  }
}
