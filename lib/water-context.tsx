// © 2026 DoctoPal — All Rights Reserved
'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useActiveProfile } from '@/lib/use-active-profile'
import { createBrowserClient } from '@/lib/supabase'

const DEFAULT_TARGET = 8

interface WaterContextType {
  glasses: number
  target: number
  loading: boolean
  addGlass: () => Promise<void>
  removeGlass: () => Promise<void>
  setTarget: (t: number) => Promise<void>
  refetch: () => Promise<void>
}

const WaterContext = createContext<WaterContextType>({
  glasses: 0,
  target: DEFAULT_TARGET,
  loading: true,
  addGlass: async () => {},
  removeGlass: async () => {},
  setTarget: async () => {},
  refetch: async () => {},
})

function getToday(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function WaterIntakeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { activeUserId } = useActiveProfile()
  const [glasses, setGlasses] = useState(0)
  const [target, setTargetState] = useState(DEFAULT_TARGET)
  const [loading, setLoading] = useState(true)
  const [recordId, setRecordId] = useState<string | null>(null)

  const supabase = createBrowserClient()
  const today = getToday()
  const userId = activeUserId || user?.id

  const fetchToday = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    try {
      const { data } = await supabase
        .from('water_intake')
        .select('id, glasses, target_glasses')
        .eq('user_id', userId)
        .eq('intake_date', today)
        .maybeSingle()

      if (data) {
        setGlasses(data.glasses ?? 0)
        if (data.target_glasses) setTargetState(data.target_glasses)
        setRecordId(data.id)
      } else {
        setGlasses(0)
        setRecordId(null)
      }
    } catch (err) {
      console.error('[Water] fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [userId, today, supabase])

  useEffect(() => {
    fetchToday()
  }, [fetchToday])

  // Listen for external water changes
  useEffect(() => {
    const handler = () => fetchToday()
    window.addEventListener('water-intake-changed', handler)
    return () => window.removeEventListener('water-intake-changed', handler)
  }, [fetchToday])

  const saveToDb = useCallback(async (newGlasses: number, newTarget?: number) => {
    if (!userId) return
    try {
      if (recordId) {
        const updateData: Record<string, unknown> = { glasses: newGlasses }
        if (newTarget !== undefined) updateData.target_glasses = newTarget
        await supabase.from('water_intake').update(updateData).eq('id', recordId)
      } else {
        const { data } = await supabase.from('water_intake').insert({
          user_id: userId,
          intake_date: today,
          glasses: newGlasses,
          target_glasses: newTarget ?? target,
        }).select('id').single()
        if (data) setRecordId(data.id)
      }
      window.dispatchEvent(new Event('water-intake-changed'))
    } catch (err) {
      console.error('[Water] save error:', err)
    }
  }, [userId, today, recordId, target, supabase])

  const addGlass = useCallback(async () => {
    const next = Math.min(glasses + 1, 20)
    setGlasses(next)
    await saveToDb(next)
  }, [glasses, saveToDb])

  const removeGlass = useCallback(async () => {
    const next = Math.max(glasses - 1, 0)
    setGlasses(next)
    await saveToDb(next)
  }, [glasses, saveToDb])

  const setTarget = useCallback(async (t: number) => {
    const clamped = Math.max(1, Math.min(20, t))
    setTargetState(clamped)
    await saveToDb(glasses, clamped)
  }, [glasses, saveToDb])

  return (
    <WaterContext.Provider value={{
      glasses, target, loading,
      addGlass, removeGlass, setTarget,
      refetch: fetchToday,
    }}>
      {children}
    </WaterContext.Provider>
  )
}

export function useWater() {
  return useContext(WaterContext)
}
