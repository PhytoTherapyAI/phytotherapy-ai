// © 2026 DoctoPal — All Rights Reserved
'use client'

// Session 44 Faz 3 rewrite: hardened against the three failure modes
// the diagnostic surfaced.
//
//   1. Stale-closure double-tap. The old addGlass / removeGlass read
//      `glasses` from useCallback closure, so two rapid taps both saw
//      the same starting value and the second tap's increment was lost
//      under the UNIQUE(user_id, intake_date) constraint. The new
//      version reads from a ref mirror (glassesRef.current) and queues
//      writes — see processQueue below.
//
//   2. Race between concurrent INSERTs. The old code did
//      "SELECT id; if missing INSERT, else UPDATE" which raced when two
//      writers fired simultaneously (both saw missing → both INSERT →
//      one violated UNIQUE → silent catch). Replaced with a single
//      atomic upsert keyed on the verified UNIQUE constraint
//      (Faz 0 SQL S2a confirmed it exists in production).
//
//   3. Silent error swallow. Save/fetch errors went through console.error
//      only — the user never saw a toast, the team never saw a Sentry
//      capture, and the optimistic UI lied indefinitely. All write paths
//      now route through reportMutationError (toast + Sentry) and on
//      failure the UI reconciles via fetchToday so the displayed
//      glass count matches DB truth.

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useActiveProfile } from '@/lib/use-active-profile'
import { useLang } from '@/components/layout/language-toggle'
import { createBrowserClient } from '@/lib/supabase'
import { reportMutationError } from '@/lib/mutation-errors'

const DEFAULT_TARGET = 8
const MAX_GLASSES = 20

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
  const { activeUserId, canEdit } = useActiveProfile()
  const { lang } = useLang()

  const [glasses, setGlasses] = useState(0)
  const [target, setTargetState] = useState(DEFAULT_TARGET)
  const [loading, setLoading] = useState(true)

  // Some legacy DB instances use `date` instead of `intake_date`. Detect
  // on first 406 / column-not-found error and remember for subsequent
  // writes so the upsert hits the right column.
  const [dateCol, setDateCol] = useState<'intake_date' | 'date'>('intake_date')

  const supabase = useMemo(() => createBrowserClient(), [])
  const today = getToday()
  const targetUserId = activeUserId || user?.id || null

  // Ref mirror — always points at the most recent state. Reads inside
  // async callbacks (addGlass / removeGlass / processQueue) MUST go
  // through this ref, never the closure-captured `glasses` value, or
  // rapid taps will race.
  const glassesRef = useRef(glasses)
  glassesRef.current = glasses

  const dateColRef = useRef(dateCol)
  dateColRef.current = dateCol

  const fetchToday = useCallback(async () => {
    if (!targetUserId) {
      setGlasses(0)
      setLoading(false)
      return
    }
    try {
      let { data, error } = await supabase
        .from('water_intake')
        .select('glasses, target_glasses')
        .eq('user_id', targetUserId)
        .eq(dateCol, today)
        .maybeSingle()

      // 406 / 42703 = column doesn't exist — try the other one once.
      if (error && (error.code === 'PGRST204' || error.message?.includes('406') || error.code === '42703')) {
        const altCol = dateCol === 'intake_date' ? 'date' : 'intake_date'
        const retry = await supabase
          .from('water_intake')
          .select('glasses, target_glasses')
          .eq('user_id', targetUserId)
          .eq(altCol, today)
          .maybeSingle()
        if (!retry.error) {
          setDateCol(altCol)
          data = retry.data
          error = null
        }
      }

      if (error) throw error

      if (data) {
        setGlasses((data as { glasses?: number }).glasses ?? 0)
        const t = (data as { target_glasses?: number }).target_glasses
        if (t) setTargetState(t)
      } else {
        setGlasses(0)
      }
    } catch (err: unknown) {
      // AbortError is benign (component unmounted mid-fetch); skip.
      if (err instanceof Error && err.name === 'AbortError') return
      reportMutationError(err, {
        op: 'water.fetch',
        userId: user?.id,
        activeProfileId: activeUserId ?? undefined,
        lang,
        extra: { date: today },
      })
    } finally {
      setLoading(false)
    }
  }, [targetUserId, today, supabase, dateCol, lang, user?.id, activeUserId])

  // ── Save queue ────────────────────────────────────────────────────
  // pending = the latest glass count the user wants persisted, or null
  // if everything is in sync. inFlight = true while a write is hitting
  // Supabase. New taps overwrite `pending` instead of stacking; one
  // serialized write per "burst" of taps means the LATEST value wins.
  const queueRef = useRef<{ pending: number | null; inFlight: boolean }>({ pending: null, inFlight: false })

  const writeOne = useCallback(async (value: number): Promise<void> => {
    if (!targetUserId) return
    // Atomic upsert against UNIQUE(user_id, intake_date) — verified to
    // exist in production (Faz 0 SQL S2a). No SELECT-then-INSERT race.
    const { error } = await supabase
      .from('water_intake')
      .upsert(
        { user_id: targetUserId, [dateColRef.current]: today, glasses: value },
        { onConflict: `user_id,${dateColRef.current}` },
      )
    if (error) throw error
    window.dispatchEvent(new Event('water-intake-changed'))
  }, [supabase, targetUserId, today])

  const processQueue = useCallback(async () => {
    if (queueRef.current.inFlight) return
    // Loop so that taps that arrive WHILE inFlight=true still get
    // processed once the current write returns.
    while (queueRef.current.pending !== null) {
      const value = queueRef.current.pending
      queueRef.current.pending = null
      queueRef.current.inFlight = true
      try {
        await writeOne(value)
      } catch (err) {
        // Drop any further queued taps — they're already invalid since
        // the DB and UI are out of sync. fetchToday reconciles to truth.
        queueRef.current.pending = null
        queueRef.current.inFlight = false
        reportMutationError(err, {
          op: 'water.save',
          userId: user?.id,
          activeProfileId: activeUserId ?? undefined,
          lang,
          extra: { glasses: value, date: today },
        })
        await fetchToday()
        return
      } finally {
        queueRef.current.inFlight = false
      }
    }
  }, [writeOne, fetchToday, lang, user?.id, activeUserId, today])

  useEffect(() => {
    fetchToday()
  }, [fetchToday])

  // Cross-view sync: any other writer (TodayView, calendar FAB) dispatches
  // `water-intake-changed`; we re-read so our optimistic state matches.
  // Ignore our OWN dispatches — fetchToday will read what we just wrote.
  useEffect(() => {
    const handler = () => fetchToday()
    window.addEventListener('water-intake-changed', handler)
    return () => window.removeEventListener('water-intake-changed', handler)
  }, [fetchToday])

  const guardWrite = useCallback((op: string): boolean => {
    if (!targetUserId) return false
    if (!canEdit) {
      reportMutationError(
        { code: '42501', status: 403, message: 'edit not permitted for active profile' },
        { op, userId: user?.id, activeProfileId: activeUserId ?? undefined, lang },
      )
      return false
    }
    return true
  }, [targetUserId, canEdit, lang, user?.id, activeUserId])

  const addGlass = useCallback(async () => {
    if (!guardWrite('water.addGlass')) return
    // Read from REF, not closure — the previous tap may have already
    // bumped state but the closure-captured `glasses` is stale.
    const next = Math.min(glassesRef.current + 1, MAX_GLASSES)
    if (next === glassesRef.current) return // already at max
    setGlasses(next)
    queueRef.current.pending = next
    await processQueue()
  }, [guardWrite, processQueue])

  const removeGlass = useCallback(async () => {
    if (!guardWrite('water.removeGlass')) return
    const next = Math.max(glassesRef.current - 1, 0)
    if (next === glassesRef.current) return // already at zero
    setGlasses(next)
    queueRef.current.pending = next
    await processQueue()
  }, [guardWrite, processQueue])

  // setTarget intentionally local-only for now; the dedicated target
  // editor (TodayView's updateWaterTarget) handles DB persistence.
  const setTarget = useCallback(async (t: number) => {
    setTargetState(Math.max(1, Math.min(MAX_GLASSES, t)))
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
