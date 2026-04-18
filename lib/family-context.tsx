// © 2026 DoctoPal — All Rights Reserved
'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createBrowserClient } from '@/lib/supabase'
import type { FamilyContextType, FamilyGroup, FamilyMember, FamilyRelationship, SharingPrefs } from '@/types/family'

const FamilyContext = createContext<FamilyContextType | null>(null)

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [familyGroup, setFamilyGroup] = useState<FamilyGroup | null>(null)
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [pendingInvites, setPendingInvites] = useState<FamilyMember[]>([])
  const [activeProfileId, setActiveProfileIdState] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // Singleton — createBrowserClient already returns singleton, but memoize for stable ref
  const supabase = useMemo(() => createBrowserClient(), [])

  const fetchMembers = useCallback(async (groupId: string) => {
    // Fetch accepted members + pending invites in parallel.
    const [acceptedRes, pendingRes] = await Promise.all([
      supabase
        .from('family_members')
        .select(`
          *,
          profile:user_profiles(
            id, display_name, full_name, avatar_style, avatar_seed, chronic_conditions
          )
        `)
        .eq('group_id', groupId)
        .eq('invite_status', 'accepted'),
      supabase
        .from('family_members')
        .select('*')
        .eq('group_id', groupId)
        .eq('invite_status', 'pending'),
    ])

    if (acceptedRes.error) {
      console.error('[Family] fetchMembers (accepted) error:', acceptedRes.error.message)
    } else if (acceptedRes.data) {
      setFamilyMembers(acceptedRes.data as FamilyMember[])
    }

    if (pendingRes.error) {
      console.error('[Family] fetchMembers (pending) error:', pendingRes.error.message)
    } else if (pendingRes.data) {
      setPendingInvites(pendingRes.data as FamilyMember[])
    }
  }, [supabase])

  const fetchFamilyData = useCallback(async () => {
    if (!user) return
    try {
      // Önce sahibi olduğu grubu bul
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

      // Üye olduğu grubu bul
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
    } catch (err: unknown) {
      if (err instanceof Error && (err.name === 'AbortError' || err.message?.includes('AbortError') || err.message?.includes('Lock'))) {
        return // silently ignore abort/lock errors
      }
      console.error('[Family] fetchFamilyData error:', err)
    }
  }, [user, supabase, fetchMembers])

  const fetchActiveSession = useCallback(async () => {
    if (!user) return
    try {
      const { data } = await supabase
        .from('active_profile_sessions')
        .select('viewing_user_id')
        .eq('user_id', user.id)
        .maybeSingle()

      setActiveProfileIdState(data?.viewing_user_id ?? user.id)
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      console.error('[Family] fetchActiveSession error:', err)
    }
  }, [user, supabase])

  useEffect(() => {
    if (user) {
      // Run both in parallel, only setLoading(false) when both done
      setLoading(true)
      Promise.all([fetchFamilyData(), fetchActiveSession()])
        .finally(() => setLoading(false))
    } else {
      setFamilyGroup(null)
      setFamilyMembers([])
      setPendingInvites([])
      setActiveProfileIdState('')
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

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
    // Validate: must be own profile or accepted family member
    if (userId !== user.id && !familyMembers.some(m => m.user_id === userId)) {
      console.error('[Family] Cannot view non-member profile:', userId)
      return
    }
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
    if (!user) {
      console.error('[Family] createGroup: user yok')
      return false
    }

    console.log('[Family] createGroup başladı:', { name, userId: user.id })

    const { data, error } = await supabase
      .from('family_groups')
      .insert({ owner_id: user.id, name: name.trim() })
      .select()
      .single()

    console.log('[Family] family_groups insert result:', { data, error })

    if (error) {
      console.error('[Family] createGroup error:', error.message, error.details, error.hint)
      return false
    }

    if (!data) {
      console.error('[Family] createGroup: data is null after insert')
      return false
    }

    // Kurucuyu member olarak ekle
    const { error: memberErr } = await supabase.from('family_members').insert({
      group_id: data.id,
      user_id: user.id,
      role: 'owner',
      invite_email: user.email || '',
      invite_status: 'accepted',
      accepted_at: new Date().toISOString()
    })

    console.log('[Family] family_members insert result:', { memberErr })

    if (memberErr) {
      console.error('[Family] createGroup member error:', memberErr.message, memberErr.details)
      // Rollback: grubu geri sil
      await supabase.from('family_groups').delete().eq('id', data.id)
      return false
    }

    setFamilyGroup(data)
    await fetchMembers(data.id)
    return true
  }

  async function updateGroupName(name: string): Promise<boolean> {
    if (!familyGroup || !user) return false
    const trimmed = name.trim()
    if (!trimmed || trimmed === familyGroup.name) return false
    const { error } = await supabase
      .from('family_groups')
      .update({ name: trimmed, updated_at: new Date().toISOString() })
      .eq('id', familyGroup.id)
      .eq('owner_id', user.id)
    if (error) {
      console.error('[Family] updateGroupName error:', error.message)
      return false
    }
    setFamilyGroup({ ...familyGroup, name: trimmed })
    return true
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

  async function updateRelationship(
    memberId: string,
    relationship: FamilyRelationship
  ): Promise<boolean> {
    // Synth rows (fallback-rendered founder when there's no real family_members
    // entry) can't be persisted — bail out with a warning.
    if (memberId.startsWith('synth-')) {
      console.warn('[Family] updateRelationship: synth member has no DB row, skipping:', memberId)
      return false
    }

    // Optimistic UI update: flip local state immediately so the select reflects
    // the choice without waiting for the server round-trip.
    const prevMembers = familyMembers
    setFamilyMembers(current =>
      current.map(m => (m.id === memberId ? { ...m, relationship } : m))
    )

    // Owner/admin may retag any member; regular members may only retag
    // themselves (RLS fm_self_update policy enforces user_id = auth.uid()).
    // Use .select() so we can detect the 0-row case (RLS silently blocked it).
    const { data, error } = await supabase
      .from('family_members')
      .update({ relationship })
      .eq('id', memberId)
      .select('id')

    if (error) {
      console.error('[Family] updateRelationship error:', error.message)
      setFamilyMembers(prevMembers) // rollback
      return false
    }

    if (!data || data.length === 0) {
      // RLS blocked the write. Most common cause: admin/owner lacks an UPDATE
      // policy for non-self rows in family_members. A DB migration is needed
      // to add an fm_admin_update policy; in the meantime, surface the issue.
      console.warn(
        '[Family] updateRelationship: 0 rows affected — RLS likely blocked the write. ' +
          'memberId=' + memberId
      )
      setFamilyMembers(prevMembers) // rollback
      return false
    }

    // Final refresh to get any server-side transformations.
    if (familyGroup) await fetchMembers(familyGroup.id)
    return true
  }

  async function updateSharingPrefs(prefs: Partial<SharingPrefs>): Promise<boolean> {
    if (!user || !familyGroup) return false
    const { error } = await supabase
      .from('family_members')
      .update(prefs)
      .eq('user_id', user.id)
      .eq('group_id', familyGroup.id)
    if (error) {
      console.error('[Family] updateSharingPrefs error:', error.message)
      return false
    }
    await fetchFamilyData()
    return true
  }

  async function cancelInvite(memberId: string): Promise<boolean> {
    // Cancel = delete the pending family_members row.
    // RLS fm_owner / fm_admin policies enforce that only the household
    // owner / admin can do this.
    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('id', memberId)
      .eq('invite_status', 'pending')
    if (error) {
      console.error('[Family] cancelInvite error:', error.message)
      return false
    }
    if (familyGroup) await fetchMembers(familyGroup.id)
    return true
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
      updateGroupName,
      inviteMember,
      updateNickname,
      promoteToAdmin,
      removeMember,
      updateAllowsManagement,
      updateSharingPrefs,
      updateRelationship,
      pendingInvites,
      cancelInvite,
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
