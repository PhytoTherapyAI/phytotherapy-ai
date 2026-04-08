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
    const { data, error } = await supabase
      .from('family_members')
      .select(`
        *,
        profile:user_profiles(
          id, display_name, avatar_style, avatar_seed
        )
      `)
      .eq('group_id', groupId)
      .eq('invite_status', 'accepted')

    if (error) {
      console.error('[Family] fetchMembers error:', error.message)
      return
    }
    if (data) setFamilyMembers(data as FamilyMember[])
  }, [supabase])

  const fetchFamilyData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      // \u00D6nce sahibi oldu\u011Fu grubu bul
      const { data: ownedGroup, error: ownedErr } = await supabase
        .from('family_groups')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle()

      if (ownedErr) {
        console.error('[Family] fetchOwnedGroup error:', ownedErr.message)
      }

      if (ownedGroup) {
        setFamilyGroup(ownedGroup)
        await fetchMembers(ownedGroup.id)
        return
      }

      // \u00DCye oldu\u011Fu grubu bul
      const { data: membership, error: memberErr } = await supabase
        .from('family_members')
        .select('group_id')
        .eq('user_id', user.id)
        .eq('invite_status', 'accepted')
        .maybeSingle()

      if (memberErr) {
        console.error('[Family] fetchMembership error:', memberErr.message)
      }

      if (membership) {
        const { data: group } = await supabase
          .from('family_groups')
          .select('*')
          .eq('id', membership.group_id)
          .maybeSingle()

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
      .maybeSingle()

    // maybeSingle returns null if no row — no error thrown
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
    const { error } = await supabase
      .from('active_profile_sessions')
      .upsert({
        user_id: user.id,
        viewing_user_id: userId,
        updated_at: new Date().toISOString()
      })
    if (error) console.error('[Family] setActiveProfile error:', error.message)
  }

  async function createGroup(name: string): Promise<boolean> {
    if (!user) return false
    const { data, error } = await supabase
      .from('family_groups')
      .insert({ owner_id: user.id, name })
      .select()
      .single()

    if (error) {
      console.error('[Family] createGroup error:', error.message)
      return false
    }

    if (data) {
      setFamilyGroup(data)
      // Kurucuyu da member olarak ekle
      const { error: memberErr } = await supabase.from('family_members').insert({
        group_id: data.id,
        user_id: user.id,
        role: 'owner',
        invite_email: user.email || '',
        invite_status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      if (memberErr) console.error('[Family] createGroup member error:', memberErr.message)
      await fetchMembers(data.id)
      return true
    }
    return false
  }

  async function inviteMember(email: string, nickname: string): Promise<boolean> {
    if (!familyGroup) return false
    const { error } = await supabase.from('family_members').insert({
      group_id: familyGroup.id,
      invite_email: email,
      nickname,
      role: 'member',
      invite_status: 'pending'
    })
    if (error) {
      console.error('[Family] inviteMember error:', error.message)
      return false
    }
    await fetchFamilyData()
    return true
  }

  async function updateNickname(memberId: string, nickname: string) {
    const { error } = await supabase
      .from('family_members')
      .update({ nickname })
      .eq('id', memberId)
    if (error) console.error('[Family] updateNickname error:', error.message)
    await fetchFamilyData()
  }

  async function promoteToAdmin(memberId: string) {
    const { error } = await supabase
      .from('family_members')
      .update({ role: 'admin' })
      .eq('id', memberId)
    if (error) console.error('[Family] promoteToAdmin error:', error.message)
    await fetchFamilyData()
  }

  async function removeMember(memberId: string) {
    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('id', memberId)
    if (error) console.error('[Family] removeMember error:', error.message)
    await fetchFamilyData()
  }

  async function updateAllowsManagement(allows: boolean) {
    if (!user || !familyGroup) return
    const { error } = await supabase
      .from('family_members')
      .update({ allows_management: allows })
      .eq('user_id', user.id)
      .eq('group_id', familyGroup.id)
    if (error) console.error('[Family] updateAllowsManagement error:', error.message)
    await fetchFamilyData()
  }

  return (
    <FamilyContext.Provider value={{
      familyGroup,
      familyMembers,
      activeProfileId,
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
