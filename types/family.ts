// © 2026 DoctoPal — All Rights Reserved

export interface FamilyGroup {
  id: string
  owner_id: string
  name: string
  created_at: string
  updated_at: string
}

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
  // Join'den gelen profil verisi
  profile?: {
    id: string
    display_name: string
    avatar_style: string
    avatar_seed: string
  }
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
  inviteMember: (email: string, nickname: string) => Promise<boolean>
  updateNickname: (memberId: string, nickname: string) => Promise<void>
  promoteToAdmin: (memberId: string) => Promise<void>
  removeMember: (memberId: string) => Promise<void>
  updateAllowsManagement: (allows: boolean) => Promise<void>
  loading: boolean
  refetch: () => Promise<void>
}
