// © 2026 DoctoPal — All Rights Reserved
import { useFamily } from '@/lib/family-context'
import { useAuth } from '@/lib/auth-context'

export function useActiveProfile() {
  const { user } = useAuth()
  const { activeProfileId, canManage } = useFamily()

  const effectiveUserId = activeProfileId || user?.id || ''
  const isOwnProfile = !activeProfileId || effectiveUserId === user?.id
  const canEdit = isOwnProfile || canManage(effectiveUserId)

  return {
    activeUserId: effectiveUserId,
    isOwnProfile,
    canEdit,
  }
}
