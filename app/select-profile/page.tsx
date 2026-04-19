// © 2026 DoctoPal — All Rights Reserved
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { useFamily } from '@/lib/family-context'
import { useEffectivePremium } from '@/lib/use-effective-premium'
import { useLang } from '@/components/layout/language-toggle'
import { tx } from '@/lib/translations'
import { getAvatarDataUri, type AvatarStyle } from '@/lib/avatar'
import { Settings, Check, Eye, Users, Loader2, Sparkles, Lock } from 'lucide-react'
import { PremiumUpgradeModal } from '@/components/premium/PremiumUpgradeModal'

export default function SelectProfilePage() {
  const { user, profile, isLoading: authLoading, premiumStatus } = useAuth()
  const {
    familyGroup,
    familyMembers,
    setActiveProfile,
    canManage,
    createGroup,
    loading,
  } = useFamily()
  const { lang } = useLang()
  const router = useRouter()
  const effective = useEffectivePremium()

  // Hydration-safe: read localStorage only after mount
  const [ownAvatar, setOwnAvatar] = useState<{ style: AvatarStyle; seed: string }>({
    style: 'adventurer',
    seed: user?.id || 'default',
  })
  const [creating, setCreating] = useState(false)
  const [showPremiumGate, setShowPremiumGate] = useState(false)
  // Shown when a Free user taps another member's locked card.
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  useEffect(() => {
    if (!user) return
    const style = (localStorage.getItem(`avatar_style_${user.id}`) || 'adventurer') as AvatarStyle
    const seed = localStorage.getItem(`avatar_seed_${user.id}`) || user.id
    setOwnAvatar({ style, seed })
  }, [user])

  async function selectProfile(userId: string, isOwnCard: boolean) {
    // Free users can only enter their own profile — other members' cards
    // are locked until the caller upgrades (individual or family plan).
    if (!isOwnCard && !effective.loading && !effective.isPremium) {
      setShowUpgradeModal(true)
      return
    }
    await setActiveProfile(userId)
    // sessionStorage (not localStorage) — flag lives only for the current tab;
    // a new tab or browser session forces the picker again (intended flow).
    if (user?.id && typeof window !== 'undefined') {
      sessionStorage.setItem(`family_profile_selected_${user.id}`, 'true')
    }
    router.push('/')
  }

  async function handleCreateGroup() {
    if (!premiumStatus.isPremium) {
      setShowPremiumGate(true)
      return
    }
    const name = prompt(tx('family.namePromptTitle', lang))
    if (!name?.trim()) return
    setCreating(true)
    try {
      const ok = await createGroup(name.trim())
      if (!ok) alert(lang === 'tr' ? 'Grup oluşturulamadı.' : 'Failed to create group.')
      // createGroup updates familyGroup state → re-renders to profile selection
    } finally {
      setCreating(false)
    }
  }

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary rounded-full border-t-transparent" />
      </div>
    )
  }

  if (!user) return null

  // ── No family group → CTA card ──
  if (!familyGroup) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 to-background dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Users className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold mb-3 text-foreground">
            {tx('family.noGroupTitle', lang)}
          </h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            {tx('family.noGroupDesc', lang)}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleCreateGroup}
              disabled={creating}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {tx('family.createGroup', lang)}
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full border border-border text-foreground font-medium py-3 px-6 rounded-xl hover:bg-muted transition-colors"
            >
              {tx('family.skipForNow', lang)}
            </button>
          </div>

          {/* Premium gate modal */}
          {showPremiumGate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowPremiumGate(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full text-center"
              >
                <div className="mx-auto mb-4 w-14 h-14 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Sparkles className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">
                  {lang === 'tr' ? 'Premium Özellik' : 'Premium Feature'}
                </h3>
                <p className="text-sm text-muted-foreground mb-5">
                  {tx('family.premiumRequired', lang)}
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => router.push('/pricing')}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
                  >
                    {lang === 'tr' ? "Premium'a Yükselt" : 'Upgrade to Premium'}
                  </button>
                  <button
                    onClick={() => setShowPremiumGate(false)}
                    className="text-muted-foreground hover:text-foreground text-sm py-2"
                  >
                    {lang === 'tr' ? 'Kapat' : 'Close'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    )
  }

  // ── Has family group → Netflix profile selection ──
  // Kendi profilini her zaman ilk göster
  const profiles = [
    {
      userId: user.id,
      name: profile?.full_name?.split(' ')[0] || (lang === 'tr' ? 'Ben' : 'You'),
      avatarStyle: ownAvatar.style,
      avatarSeed: ownAvatar.seed,
      isOwn: true,
      canManageThis: true,
    },
    ...familyMembers
      .filter((m) => !!m.user_id && m.user_id !== user.id)
      .map((m) => {
        const emailPrefix = m.invite_email?.split('@')[0]
        const displayName =
          m.profile?.full_name ??
          m.nickname ??
          m.profile?.display_name ??
          emailPrefix ??
          tx('family.memberFallback', lang)
        return {
          userId: m.user_id!,
          name: displayName,
          avatarStyle: (m.profile?.avatar_style as AvatarStyle) ?? 'adventurer',
          avatarSeed: m.profile?.avatar_seed ?? m.user_id!,
          isOwn: false,
          canManageThis: canManage(m.user_id!),
        }
      }),
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 to-background dark:from-gray-950 dark:to-gray-900 flex flex-col items-center justify-center p-8">

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-icon.svg"
          alt="DoctoPal"
          width={48}
          height={48}
          className="mx-auto mb-3"
        />
        <h1 className="text-emerald-600 dark:text-emerald-400 text-2xl font-bold tracking-tight">
          DoctoPal
        </h1>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-foreground text-xl sm:text-2xl font-semibold mb-10 text-center"
      >
        {tx('family.selectWhoTitle', lang)}
      </motion.h2>

      {/* Profil Grid */}
      <div className="flex flex-wrap gap-6 sm:gap-8 justify-center max-w-3xl">
        {profiles.map((p, i) => {
          // Free users can only open their own card. Others' cards render as
          // locked (dim + lock badge) and open the upgrade modal on tap.
          const locked = !p.isOwn && !effective.loading && !effective.isPremium
          return (
            <motion.button
              key={p.userId}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * i, type: 'spring' }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => selectProfile(p.userId, p.isOwn)}
              className="flex flex-col items-center gap-3 group cursor-pointer"
            >
              {/* Avatar */}
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getAvatarDataUri(p.avatarSeed, p.avatarStyle)}
                  alt={p.name}
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl ring-4 ring-transparent transition-all duration-200 bg-muted ${
                    locked
                      ? 'opacity-50 grayscale group-hover:ring-amber-400 group-hover:opacity-60'
                      : 'group-hover:ring-emerald-500'
                  }`}
                />
                {/* Locked overlay for Free users */}
                {locked && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/20 backdrop-blur-[1px]">
                    <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-full w-9 h-9 flex items-center justify-center text-white shadow-lg">
                      <Lock className="h-4 w-4" />
                    </div>
                  </div>
                )}
                {/* Yönetici rozeti — Premium users see role badges */}
                {!locked && p.canManageThis && !p.isOwn && (
                  <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 rounded-full w-5 h-5 flex items-center justify-center text-white shadow-md">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </div>
                )}
                {!locked && !p.canManageThis && !p.isOwn && (
                  <div className="absolute -top-1.5 -right-1.5 bg-muted-foreground/50 rounded-full w-5 h-5 flex items-center justify-center text-white shadow-md">
                    <Eye className="h-3 w-3" />
                  </div>
                )}
              </div>

              {/* İsim */}
              <span className={`font-medium text-sm sm:text-base transition-colors ${
                locked ? 'text-muted-foreground/60' : 'text-muted-foreground group-hover:text-foreground'
              }`}>
                {p.name}
              </span>

              {/* Yönetim durumu */}
              <span className="text-[11px] text-muted-foreground/70">
                {p.isOwn
                  ? tx('family.ownProfile', lang)
                  : locked
                    ? (lang === 'tr' ? 'Premium gerekli' : 'Premium required')
                    : p.canManageThis
                      ? tx('family.canEdit', lang)
                      : tx('family.viewOnly', lang)}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* Premium upgrade modal triggered when a Free user taps a locked card. */}
      <PremiumUpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName={lang === 'tr' ? 'Aile üyesi profilini görüntüleme' : 'Viewing family member profiles'}
      />

      {/* Aile yönetimi linki */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => router.push('/family')}
        className="mt-12 text-muted-foreground hover:text-foreground transition flex items-center gap-2 text-sm"
      >
        <Settings className="w-4 h-4" />
        {tx('family.settingsLink', lang)}
      </motion.button>
    </div>
  )
}
