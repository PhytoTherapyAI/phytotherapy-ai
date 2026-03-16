'use client'
import { useState, useEffect } from 'react'

export function LanguageToggle() {
  const [lang, setLang] = useState<'en' | 'tr'>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('lang') as 'en' | 'tr'
    if (saved) setLang(saved)
  }, [])

  if (!mounted) return null

  const toggle = () => {
    const next = lang === 'en' ? 'tr' : 'en'
    setLang(next)
    localStorage.setItem('lang', next)
  }

  return (
    <button onClick={toggle} className="text-sm font-medium">
      {lang === 'en' ? '🇺🇸 EN' : '🇹🇷 TR'}
    </button>
  )
}
