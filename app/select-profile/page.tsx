// © 2026 DoctoPal — All Rights Reserved
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { useFamily } from '@/lib/family-context'
import { getAvatarDataUri, type AvatarStyle } from '@/lib/avatar'
import { Settings } from 'lucide-react'

export default function SelectProfilePage() {
  const { user, profile, isLoading: authLoading } = useAuth()
  const {
    familyGroup,
    familyMembers,
    setActiveProfile,
    canManage,
    loading
  } = useFamily()
  const router = useRouter()

  // Aile grubu yoksa direkt dashboard'a git
  useEffect(() => {
    if (!authLoading && !loading && !familyGroup) {
      router.replace('/')
    }
  }, [authLoading, loading, familyGroup, router])

  async function selectProfile(userId: string) {
    await setActiveProfile(userId)
    router.push('/')
  }

  if (authLoading || loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="animate-spin w-10 h-10 border-4 border-primary rounded-full border-t-transparent" />
    </div>
  )

  if (!user || !familyGroup) return null

  // Own avatar from localStorage (same pattern as header)
  const ownAvatarStyle = (typeof window !== 'undefined'
    ? localStorage.getItem(`avatar_style_${user.id}`) || 'adventurer'
    : 'adventurer') as AvatarStyle
  const ownAvatarSeed = typeof window !== 'undefined'
    ? localStorage.getItem(`avatar_seed_${user.id}`) || user.id
    : user.id

  // Kendi profilini her zaman ilk goster
  const profiles = [
    {
      userId: user.id,
      name: profile?.full_name?.split(' ')[0] || 'Ben',
      avatarStyle: ownAvatarStyle,
      avatarSeed: ownAvatarSeed,
      isOwn: true,
      canManageThis: true
    },
    ...familyMembers
      .filter(m => m.user_id !== user.id && m.profile)
      .map(m => ({
        userId: m.user_id!,
        name: m.nickname ?? m.profile?.display_name ?? 'Uye',
        avatarStyle: (m.profile?.avatar_style as AvatarStyle) ?? 'adventurer',
        avatarSeed: m.profile?.avatar_seed ?? m.user_id!,
        isOwn: false,
        canManageThis: canManage(m.user_id!)
      }))
  ]

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8">

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-icon.svg"
          alt="DoctoPal"
          width={48}
          height={48}
          className="mx-auto mb-3"
        />
        <h1 className="text-emerald-400 text-2xl font-bold tracking-tight">
          DoctoPal
        </h1>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-white text-xl sm:text-2xl font-semibold mb-10 text-center"
      >
        Kimin profilini g\u00f6r\u00fcnt\u00fclemek istiyorsunuz?
      </motion.h2>

      {/* Profil Grid */}
      <div className="flex flex-wrap gap-6 sm:gap-8 justify-center max-w-3xl">
        {profiles.map((p, i) => (
          <motion.button
            key={p.userId}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * i, type: 'spring' }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => selectProfile(p.userId)}
            className="flex flex-col items-center gap-3 group cursor-pointer"
          >
            {/* Avatar */}
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getAvatarDataUri(p.avatarSeed, p.avatarStyle)}
                alt={p.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl ring-4 ring-transparent group-hover:ring-emerald-400 transition-all duration-200 bg-slate-800"
              />
              {/* Yonetici rozeti */}
              {p.canManageThis && !p.isOwn && (
                <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 rounded-full w-5 h-5 flex items-center justify-center text-white text-[10px] font-bold shadow-md">
                  &#10003;
                </div>
              )}
              {/* Sadece g\u00f6r\u00fcnt\u00fcleme */}
              {!p.canManageThis && !p.isOwn && (
                <div className="absolute -top-1.5 -right-1.5 bg-slate-500 rounded-full w-5 h-5 flex items-center justify-center text-white text-[10px] shadow-md">
                  &#128065;
                </div>
              )}
            </div>

            {/* Isim */}
            <span className="text-slate-300 group-hover:text-white transition-colors font-medium text-sm sm:text-base">
              {p.name}
            </span>

            {/* Y\u00f6netim durumu */}
            <span className="text-[11px] text-slate-500">
              {p.isOwn
                ? 'Kendi profilin'
                : p.canManageThis
                  ? 'D\u00fczenleyebilirsin'
                  : 'Sadece g\u00f6r\u00fcnt\u00fcle'}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Aile yonetimi linki */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => router.push('/family')}
        className="mt-12 text-slate-500 hover:text-slate-300 transition flex items-center gap-2 text-sm"
      >
        <Settings className="w-4 h-4" />
        Aile Ayarlar\u0131
      </motion.button>
    </div>
  )
}
