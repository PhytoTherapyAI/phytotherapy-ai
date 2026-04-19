// © 2026 DoctoPal — All Rights Reserved

export interface FamilyGroup {
  id: string
  owner_id: string
  name: string
  created_at: string
  updated_at: string
  // Plan columns added by migration 20260419_family_premium.sql.
  // Existing groups default to plan_type='free' + max_members=6; a migration
  // to lower the cap to 2 for free groups is intentionally deferred so we
  // don't blow up anyone's current household overnight.
  plan_type?: 'free' | 'family_premium' | null
  plan_started_at?: string | null
  plan_expires_at?: string | null
  max_members?: number | null
}

export type FamilyRelationship =
  | 'self'
  | 'spouse'
  | 'parent'
  | 'child'
  | 'sibling'
  | 'grandparent'
  | 'grandchild'
  | 'other'

export interface FamilyMember {
  id: string
  group_id: string
  user_id: string | null
  role: 'owner' | 'admin' | 'member'
  nickname: string | null
  allows_management: boolean
  invite_token: string
  invite_email: string
  invite_status: 'pending' | 'accepted' | 'declined'
  invited_at: string
  accepted_at: string | null
  expires_at?: string | null
  /** FAZ 5 kinship — null for legacy rows; owner seeded as 'self' by migration */
  relationship?: FamilyRelationship | null
  // Per-member sharing preferences (Stage 3)
  shares_health_score?: boolean
  shares_medications?: boolean
  shares_allergies?: boolean
  shares_emergency?: boolean
  // Join'den gelen profil verisi
  profile?: {
    id: string
    display_name: string | null
    full_name?: string | null
    avatar_style: string
    avatar_seed: string
    chronic_conditions?: string[] | null
    consent_ai_processing?: boolean
  }
}

export interface SharingPrefs {
  shares_health_score: boolean
  shares_medications: boolean
  shares_allergies: boolean
  shares_emergency: boolean
}

export type FamilyNotificationType =
  | 'reminder_meds'
  | 'reminder_checkin'
  | 'reminder_water'
  | 'emergency'
  | 'custom'

export interface FamilyNotification {
  id: string
  group_id: string
  from_user_id: string
  to_user_id: string
  type: FamilyNotificationType
  message: string
  read: boolean
  created_at: string
}

export interface ActiveProfileSession {
  user_id: string
  viewing_user_id: string
  updated_at: string
}

export interface FamilyContextType {
  familyGroup: FamilyGroup | null
  familyMembers: FamilyMember[]
  activeProfileId: string
  isOwner: boolean
  isAdmin: boolean
  canManage: (targetUserId: string) => boolean
  setActiveProfile: (userId: string) => Promise<void>
  createGroup: (name: string) => Promise<boolean>
  updateGroupName: (name: string) => Promise<boolean>
  inviteMember: (email: string, nickname: string) => Promise<boolean>
  updateNickname: (memberId: string, nickname: string) => Promise<void>
  promoteToAdmin: (memberId: string) => Promise<{ ok: boolean; error?: string; code?: string }>
  removeMember: (memberId: string) => Promise<void>
  updateAllowsManagement: (allows: boolean) => Promise<void>
  updateSharingPrefs: (prefs: Partial<SharingPrefs>) => Promise<boolean>
  updateRelationship: (memberId: string, relationship: FamilyRelationship) => Promise<boolean>
  pendingInvites: FamilyMember[]
  cancelInvite: (memberId: string) => Promise<boolean>
  loading: boolean
  refetch: () => Promise<void>
}
