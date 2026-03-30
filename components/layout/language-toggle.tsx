// © 2026 Phytotherapy.ai — All Rights Reserved
'use client'
import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { SUPPORTED_LANGUAGES, DEFAULT_LANG, type Lang } from '@/lib/translations'

type LangContextType = { lang: Lang; setLang: (l: Lang) => void }

export const LanguageContext = createContext<LangContextType>({
  lang: DEFAULT_LANG,
  setLang: () => {},
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG)
  const [mounted, setMounted] = useState(false)

  const validCodes = SUPPORTED_LANGUAGES.map((l) => l.code) as readonly string[]

  useEffect(() => {
    setMounted(true)
    const manuallySet = localStorage.getItem('lang_manually_set') === 'true'
    const saved = localStorage.getItem('lang')

    if (manuallySet && saved && validCodes.includes(saved)) {
      // User has explicitly chosen a language — respect their choice
      setLangState(saved as Lang)
    } else {
      // No manual selection — always detect from browser language
      try {
        const browserLang = navigator.language?.toLowerCase() || ''
        const detected = browserLang.startsWith('tr') ? 'tr' : 'en'
        setLangState(detected as Lang)
        localStorage.setItem('lang', detected)
      } catch { /* fallback to default */ }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('lang', l)
    localStorage.setItem('lang_manually_set', 'true')
  }

  if (!mounted) return <>{children}</>

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}

function LangFlag({ flag, label }: { flag: string | null; label: string }) {
  if (!flag) return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
      <circle cx="12" cy="12" r="10"/>
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  )
  return <img src={`https://flagcdn.com/w20/${flag}.png`} width={16} height={12} alt={label} />
}

// Dil listesi artık lib/translations.ts'den geliyor — tek noktadan yönetim
const LANGUAGES = SUPPORTED_LANGUAGES

export function LanguageToggle() {
  const { lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0]

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        suppressHydrationWarning
        className="flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
        aria-label="Select language"
      >
        <LangFlag flag={current.flag} label={current.label} />
        <span suppressHydrationWarning className="font-semibold">
          {current.short}
        </span>
        <svg
          className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[140px] rounded-lg border bg-popover p-1 shadow-lg">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                setLang(l.code as Lang)
                setOpen(false)
              }}
              className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs transition-colors hover:bg-muted ${
                lang === (l.code as string) ? 'text-primary font-semibold' : 'text-foreground'
              }`}
            >
              <LangFlag flag={l.flag} label={l.label} />
              {l.label}
              {lang === (l.code as string) && (
                <svg className="ml-auto h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
