'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase'
import { getAvatarDataUri, getInitials, AVATAR_STYLES, type AvatarStyle } from '@/lib/avatar'

interface Props {
  userId: string
  userName: string
  lang: 'en' | 'tr'
  onAvatarChange?: () => void
}

export function AvatarPicker({ userId, userName, lang, onAvatarChange }: Props) {
  const tr = lang === 'tr'
  const reducedMotion = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [style, setStyle] = useState<AvatarStyle>('adventurer')
  const [seed, setSeed] = useState(userId)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Load saved avatar preferences
  useEffect(() => {
    try {
      const savedStyle = localStorage.getItem(`avatar_style_${userId}`)
      const savedSeed = localStorage.getItem(`avatar_seed_${userId}`)
      if (savedStyle && AVATAR_STYLES.some(s => s.id === savedStyle)) setStyle(savedStyle as AvatarStyle)
      if (savedSeed) setSeed(savedSeed)
    } catch { /* noop */ }
  }, [userId])

  const currentAvatar = getAvatarDataUri(seed, style)
  const initials = getInitials(userName || 'U')

  const handleSave = async () => {
    setSaving(true)
    try {
      // Save to localStorage (works immediately)
      localStorage.setItem(`avatar_style_${userId}`, style)
      localStorage.setItem(`avatar_seed_${userId}`, seed)

      // Also try Supabase (best effort)
      const supabase = createBrowserClient()
      await supabase.from('user_profiles').update({
        avatar_style: style,
        avatar_seed: seed,
      }).eq('id', userId).then(() => {})

      setSaved(true)
      setTimeout(() => { setSaved(false); setOpen(false); onAvatarChange?.(); }, 1200)
    } catch {
      // localStorage already saved, close anyway
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }

  const randomize = () => setSeed(Math.random().toString(36).slice(2, 10))

  return (
    <>
      {/* Clickable Avatar */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative group focus:outline-none"
        aria-label={tr ? 'Avatarını değiştir' : 'Change avatar'}
      >
        {currentAvatar ? (
          <img
            src={currentAvatar}
            alt="Avatar"
            className="w-20 h-20 rounded-full ring-2 ring-primary/30 group-hover:ring-primary transition-all"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl ring-2 ring-primary/30">
            {initials}
          </div>
        )}
        <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white text-xs font-medium">{tr ? 'Değiştir' : 'Change'}</span>
        </div>
      </button>

      {/* Picker Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={reducedMotion ? { opacity: 0 } : { scale: 0.9, opacity: 0 }}
              animate={reducedMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-background rounded-2xl p-6 shadow-2xl w-full max-w-sm relative"
              onClick={e => e.stopPropagation()}
            >
              {/* Close */}
              <button onClick={() => setOpen(false)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>

              <h3 className="font-bold text-lg mb-4 text-center">
                {tr ? 'Avatarını Seç' : 'Choose Avatar'} {'\u{1F3A8}'}
              </h3>

              {/* Large Preview */}
              <div className="flex justify-center mb-5">
                {currentAvatar ? (
                  <img src={currentAvatar} alt="Preview" className="w-24 h-24 rounded-full ring-4 ring-primary/30" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl ring-4 ring-primary/30">
                    {initials}
                  </div>
                )}
              </div>

              {/* Style Options */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {AVATAR_STYLES.map(s => {
                  const preview = getAvatarDataUri(seed, s.id)
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStyle(s.id)}
                      className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                        style === s.id
                          ? 'border-primary bg-primary/10'
                          : 'border-muted hover:border-primary/30'
                      }`}
                    >
                      {preview ? (
                        <img src={preview} alt={s.id} className="w-12 h-12 rounded-full" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg">{s.emoji}</div>
                      )}
                      <span className="text-xs font-medium">{s.emoji} {tr ? s.labelTr : s.labelEn}</span>
                    </button>
                  )
                })}
              </div>

              {/* Randomize */}
              <button
                type="button"
                onClick={randomize}
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-all mb-4 text-sm font-medium"
              >
                {'\u{1F3B2}'} {tr ? 'Rastgele Yenile' : 'Randomize'}
              </button>

              {/* Save */}
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-primary hover:bg-primary/90 text-base py-3"
              >
                {saved
                  ? `${tr ? 'Kaydedildi' : 'Saved'} \u{2705}`
                  : saving
                    ? `${tr ? 'Kaydediliyor...' : 'Saving...'}`
                    : `${tr ? 'Kaydet' : 'Save'} \u{2713}`}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
