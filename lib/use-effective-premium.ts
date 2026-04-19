// © 2026 DoctoPal — All Rights Reserved
// Client hook wrapper around getUserEffectivePremium. Components check
// `isPremium` to decide whether to gate a feature; `loading` is true during
// the first fetch so UI can avoid flashing a "locked" state before the
// answer is known (flash of wrong content on a premium user is worse than
// a 200ms skeleton).
//
// source === 'family' means the premium came from a family_groups.plan_type
// and the individual profile is still Free — surface this in copy so the
// user knows they can't personally "downgrade" premium by editing their
// own user_profiles.plan.
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { createBrowserClient } from "@/lib/supabase"
import { getUserEffectivePremium, type PremiumSource } from "@/lib/premium"

export interface UseEffectivePremiumResult {
  isPremium: boolean
  source: PremiumSource
  expiresAt: string | null
  familyGroupId: string | null
  loading: boolean
  refetch: () => void
}

export function useEffectivePremium(): UseEffectivePremiumResult {
  const { user, isAuthenticated } = useAuth()
  const [state, setState] = useState<Omit<UseEffectivePremiumResult, "refetch">>({
    isPremium: false,
    source: "none",
    expiresAt: null,
    familyGroupId: null,
    loading: true,
  })
  // Bumping this triggers a refetch via the effect below.
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setState({ isPremium: false, source: "none", expiresAt: null, familyGroupId: null, loading: false })
      return
    }

    let cancelled = false
    const supabase = createBrowserClient()
    setState((s) => ({ ...s, loading: true }))

    getUserEffectivePremium(user.id, supabase)
      .then((result) => {
        if (cancelled) return
        setState({
          isPremium: result.isPremium,
          source: result.source,
          expiresAt: result.expiresAt,
          familyGroupId: result.familyGroupId ?? null,
          loading: false,
        })
      })
      .catch(() => {
        if (cancelled) return
        // On error, stay conservative — treat as Free. Gates shouldn't leak
        // premium content when we can't prove premium.
        setState({ isPremium: false, source: "none", expiresAt: null, familyGroupId: null, loading: false })
      })

    return () => { cancelled = true }
  }, [isAuthenticated, user?.id, nonce])

  return {
    ...state,
    refetch: () => setNonce((n) => n + 1),
  }
}
