// © 2026 DoctoPal — All Rights Reserved
'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createBrowserClient } from '@/lib/supabase'
import type { FamilyContextType, FamilyGroup, FamilyMember } from '@/types/family'

const FamilyContext = createContext<FamilyContextType | null>(null)

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [familyGroup, setFamilyGroup] = useState<FamilyGroup | null>(null)
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [activeProfileId, setActiveProfileIdState] = useState<string>('')
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient()

  const fetchMembers = useCallback(async (groupId: string) => {
    const { data } = await supabase
      .from('family_members')
      .select(`
        *,
        profile:user_profiles(
          id, display_name, avatar_style, avatar_seed
        )
      `)
      .eq('group_id', groupId)
      .eq('invite_status', 'accepted')

    if (data) setFamilyMembers(data as FamilyMember[])
  }, [supabase])

  const fetchFamilyData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      // Önce sahibi olduğu grubu bul
      const { data: ownedGroup } = await supabase
        .from('family_groups')
        .select('*')
        .eq('owner_id', user.id)
        .single()

      if (ownedGroup) {
        setFamilyGroup(ownedGroup)
        await fetchMembers(ownedGroup.id)
        return
      }

      // Üye olduğu grubu bul
      const { data: membership } = await supabase
        .from('family_members')
        .select('group_id')
        .eq('user_id', user.id)
        .eq('invite_status', 'accepted')
        .single()

      if (membership) {
        const { data: group } = await supabase
          .from('family_groups')
          .select('*')
          .eq('id', membership.group_id)
          .single()

        if (group) {
          setFamilyGroup(group)
          await fetchMembers(group.id)
        }
      }
    } finally {
      setLoading(false)
    }
  }, [user, supabase, fetchMembers])

  const fetchActiveSession = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('active_profile_sessions')
      .select('viewing_user_id')
      .eq('user_id', user.id)
      .single()

    setActiveProfileIdState(data?.viewing_user_id ?? user.id)
  }, [user, supabase])

  useEffect(() => {
    if (user) {
      fetchFamilyData()
      fetchActiveSession()
    } else {
      setFamilyGroup(null)
      setFamilyMembers([])
      setActiveProfileIdState('')
      setLoading(false)
    }
  }, [user, fetchFamilyData, fetchActiveSession])

  const isOwner = familyGroup?.owner_id === user?.id

  const isAdmin = familyMembers.some(
    m => m.user_id === user?.id &&
    (m.role === 'admin' || m.role === 'owner')
  ) || isOwner

  function canManage(targetUserId: string): boolean {
    if (!user) return false
    if (targetUserId === user.id) return true
    if (!isAdmin && !isOwner) return false
    const member = familyMembers.find(m => m.user_id === targetUserId)
    return member?.allows_management ?? false
  }

  async function setActiveProfile(userId: string) {
    if (!user) return
    setActiveProfileIdState(userId)
    await supabase
      .from('active_profile_sessions')
      .upsert({
        user_id: user.id,
        viewing_user_id: userId,
        updated_at: new Date().toISOString()
      })
  }

  async function createGroup(name: string) {
    if (!user) return
    const { data } = await supabase
      .from('family_groups')
      .insert({ owner_id: user.id, name })
      .select()
      .single()

    if (data) {
      setFamilyGroup(data)
      // Kurucuyu da member olarak ekle
      await supabase.from('family_members').insert({
        group_id: data.id,
        user_id: user.id,
        role: 'owner',
        invite_email: user.email!,
        invite_status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      await fetchMembers(data.id)
    }
  }

  async function inviteMember(email: string, nickname: string) {
    if (!familyGroup) return
    await supabase.from('family_members').insert({
      group_id: familyGroup.id,
      invite_email: email,
      nickname,
      role: 'member',
      invite_status: 'pending'
    })
    await fetchFamilyData()
  }

  async function updateNickname(memberId: string, nickname: string) {
    await supabase
      .from('family_members')
      .update({ nickname })
      .eq('id', memberId)
    await fetchFamilyData()
  }

  async function promoteToAdmin(memberId: string) {
    await supabase
      .from('family_members')
      .update({ role: 'admin' })
      .eq('id', memberId)
    await fetchFamilyData()
  }

  async function removeMember(memberId: string) {
    await supabase
      .from('family_members')
      .delete()
      .eq('id', memberId)
    await fetchFamilyData()
  }

  async function updateAllowsManagement(allows: boolean) {
    if (!user || !familyGroup) return
    await supabase
      .from('family_members')
      .update({ allows_management: allows })
      .eq('user_id', user.id)
      .eq('group_id', familyGroup.id)
    await fetchFamilyData()
  }

  return (
    <FamilyContext.Provider value={{
      familyGroup,
      familyMembers,
      activeProfileId: activeProfileId,
      isOwner,
      isAdmin,
      canManage,
      setActiveProfile,
      createGroup,
      inviteMember,
      updateNickname,
      promoteToAdmin,
      removeMember,
      updateAllowsManagement,
      loading,
      refetch: fetchFamilyData
    }}>
      {children}
    </FamilyContext.Provider>
  )
}

export function useFamily() {
  const ctx = useContext(FamilyContext)
  if (!ctx) throw new Error('useFamily must be used within FamilyProvider')
  return ctx
}
