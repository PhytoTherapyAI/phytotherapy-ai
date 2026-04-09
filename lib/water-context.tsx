// © 2026 DoctoPal — All Rights Reserved
'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
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
  // Track which date column works in this DB
  const [dateCol, setDateCol] = useState<'intake_date' | 'date'>('intake_date')

  const supabase = useMemo(() => createBrowserClient(), [])
  const today = getToday()
  const userId = activeUserId || user?.id

  const fetchToday = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    try {
      // Try intake_date first, fallback to date
      let { data, error } = await supabase
        .from('water_intake')
        .select('id, glasses, target_glasses')
        .eq('user_id', userId)
        .eq(dateCol, today)
        .maybeSingle()

      // 406 = column doesn't exist, try alternate
      if (error && (error.code === 'PGRST204' || error.message?.includes('406') || error.code === '42703')) {
        const altCol = dateCol === 'intake_date' ? 'date' : 'intake_date'
        console.log('[Water] Trying alternate date column:', altCol)
        const retry = await supabase
          .from('water_intake')
          .select('id, glasses, target_glasses')
          .eq('user_id', userId)
          .eq(altCol, today)
          .maybeSingle()
        if (!retry.error) {
          setDateCol(altCol)
          data = retry.data
          error = null
        }
      }

      if (data) {
        setGlasses(data.glasses ?? 0)
        if ('target_glasses' in data && data.target_glasses) setTargetState(data.target_glasses)
        setRecordId(data.id)
      } else {
        setGlasses(0)
        setRecordId(null)
      }
    } catch (err: unknown) {
      // Silently ignore AbortError
      if (err instanceof Error && err.name === 'AbortError') return
      console.error('[Water] fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [userId, today, supabase, dateCol])

  useEffect(() => {
    fetchToday()
  }, [fetchToday])

  useEffect(() => {
    const handler = () => fetchToday()
    window.addEventListener('water-intake-changed', handler)
    return () => window.removeEventListener('water-intake-changed', handler)
  }, [fetchToday])

  const saveToDb = useCallback(async (newGlasses: number) => {
    if (!userId) return
    try {
      if (recordId) {
        await supabase.from('water_intake').update({ glasses: newGlasses }).eq('id', recordId)
      } else {
        const insertData: Record<string, unknown> = {
          user_id: userId,
          [dateCol]: today,
          glasses: newGlasses,
        }
        const { data } = await supabase.from('water_intake').insert(insertData).select('id').maybeSingle()
        if (data) setRecordId(data.id)
      }
      window.dispatchEvent(new Event('water-intake-changed'))
    } catch (err) {
      console.error('[Water] save error:', err)
    }
  }, [userId, today, recordId, dateCol, supabase])

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
    setTargetState(Math.max(1, Math.min(20, t)))
  }, [])

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
