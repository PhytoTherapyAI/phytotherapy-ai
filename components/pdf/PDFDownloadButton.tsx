'use client'

import { useState, useRef, useEffect } from 'react'
import { Loader2, Download, Mail, ChevronDown, X, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createBrowserClient } from '@/lib/supabase'

interface Props {
  lang: 'en' | 'tr'
  className?: string
  variant?: 'default' | 'fab'
}

/** Get auth token for API calls */
async function getAuthToken(): Promise<string> {
  const supabase = createBrowserClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('no-session')
  return session.access_token
}

/** Get patient name for email */
async function getPatientName(): Promise<string> {
  const supabase = createBrowserClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return ''
  const { data } = await supabase.from('user_profiles').select('full_name').eq('id', user.id).maybeSingle()
  return data?.full_name || ''
}

export function PDFDownloadButton({ lang, className, variant = 'default' }: Props) {
  const tr = lang === 'tr'
  const [loading, setLoading] = useState(false)
  const [action, setAction] = useState<'download' | 'email' | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailAddress, setEmailAddress] = useState('')
  const [emailSending, setEmailSending] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState(false)
  const [emailError, setEmailError] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    if (showMenu) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showMenu])

  // ── SERVER-SIDE PDF Download ──
  const handleDownload = async () => {
    setLoading(true)
    setAction('download')
    try {
      const token = await getAuthToken()

      const res = await fetch('/api/sbar-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ lang }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        throw new Error(errData.error || `Server error: ${res.status}`)
      }

      const blob = await res.blob()
      if (!blob || blob.size === 0) throw new Error('Empty PDF received')

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `DoctoPal-SBAR-${new Date().toISOString().split('T')[0]}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      console.error('[SBAR-PDF] Download error:', errMsg, err)
      alert(tr
        ? `PDF indirilemedi: ${errMsg}`
        : `PDF download failed: ${errMsg}`)
    } finally {
      setLoading(false)
      setAction(null)
    }
  }

  // ── SERVER-SIDE Email Send ──
  const handleEmailSend = async () => {
    if (!emailAddress.trim() || !emailAddress.includes('@')) {
      setEmailError(tr ? 'Gecerli bir email adresi girin' : 'Enter a valid email address')
      return
    }

    setEmailSending(true)
    setEmailError('')
    try {
      const token = await getAuthToken()

      // Step 1: Generate PDF on server, get base64
      const pdfRes = await fetch('/api/sbar-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ lang }),
      })

      if (!pdfRes.ok) {
        const errData = await pdfRes.json().catch(() => ({ error: `HTTP ${pdfRes.status}` }))
        throw new Error(errData.error || 'PDF generation failed')
      }

      const pdfBlob = await pdfRes.blob()
      const pdfBase64 = await blobToBase64(pdfBlob)
      const patientName = await getPatientName()

      // Step 2: Send email with PDF attachment
      const emailRes = await fetch('/api/sbar-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: emailAddress.trim(),
          patientName,
          lang,
          pdfBase64,
        }),
      })

      if (!emailRes.ok) {
        const errData = await emailRes.json().catch(() => ({}))
        throw new Error(errData.error || 'Email send failed')
      }

      setEmailSuccess(true)
      setTimeout(() => {
        setShowEmailModal(false)
        setEmailSuccess(false)
        setEmailAddress('')
      }, 2000)
    } catch (err) {
      console.error('[SBAR-EMAIL] Send error:', err)
      const errMsg = err instanceof Error ? err.message : String(err)
      setEmailError(
        errMsg === 'no-session'
          ? (tr ? 'Oturum bulunamadi' : 'Session not found')
          : (tr ? `Email gonderilemedi: ${errMsg}` : `Failed to send: ${errMsg}`)
      )
    } finally {
      setEmailSending(false)
    }
  }

  // ── FAB variant ──
  if (variant === 'fab') {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          disabled={loading}
          className={className}
        >
          {loading
            ? <Loader2 className="h-5 w-5 animate-spin" />
            : <span className="text-lg">{"\u{1F4C4}"}</span>}
        </button>

        {showMenu && (
          <div className="absolute bottom-full right-0 mb-2 w-48 rounded-xl border bg-white dark:bg-slate-900 shadow-xl z-50 overflow-hidden">
            <button
              onClick={() => { setShowMenu(false); handleDownload() }}
              className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-muted transition-colors"
            >
              <Download className="h-4 w-4" />
              {tr ? 'PDF Indir' : 'Download PDF'}
            </button>
            <div className="border-t" />
            <button
              onClick={() => { setShowMenu(false); setShowEmailModal(true) }}
              className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-muted transition-colors"
            >
              <Mail className="h-4 w-4" />
              {tr ? 'Doktora Email Gonder' : 'Email to Doctor'}
            </button>
          </div>
        )}

        {showEmailModal && <EmailModal
          tr={tr}
          emailAddress={emailAddress}
          setEmailAddress={setEmailAddress}
          emailSending={emailSending}
          emailSuccess={emailSuccess}
          emailError={emailError}
          onSend={handleEmailSend}
          onClose={() => { setShowEmailModal(false); setEmailAddress(''); setEmailError(''); setEmailSuccess(false) }}
        />}
      </div>
    )
  }

  // ── Default variant ──
  return (
    <div className="relative inline-flex" ref={menuRef}>
      <div className="flex">
        <Button onClick={handleDownload} disabled={loading} size="sm" className={`rounded-r-none ${className || ''}`}>
          {loading && action === 'download'
            ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />{tr ? 'Olusturuluyor...' : 'Generating...'}</>
            : <><Download className="mr-1.5 h-3.5 w-3.5" />{tr ? 'PDF Indir' : 'Download PDF'}</>}
        </Button>
        <Button
          onClick={() => setShowMenu(!showMenu)}
          disabled={loading}
          size="sm"
          className="rounded-l-none border-l border-l-primary-foreground/20 px-2"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </div>

      {showMenu && (
        <div className="absolute top-full left-0 mt-1 w-52 rounded-xl border bg-white dark:bg-slate-900 shadow-xl z-50 overflow-hidden">
          <button
            onClick={() => { setShowMenu(false); setShowEmailModal(true) }}
            className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-muted transition-colors"
          >
            <Mail className="h-4 w-4" />
            {tr ? 'Doktora Email Gonder' : 'Email to Doctor'}
          </button>
        </div>
      )}

      {showEmailModal && <EmailModal
        tr={tr}
        emailAddress={emailAddress}
        setEmailAddress={setEmailAddress}
        emailSending={emailSending}
        emailSuccess={emailSuccess}
        emailError={emailError}
        onSend={handleEmailSend}
        onClose={() => { setShowEmailModal(false); setEmailAddress(''); setEmailError(''); setEmailSuccess(false) }}
      />}
    </div>
  )
}

/** Convert blob to base64 string */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      if (!result) { reject(new Error('FileReader returned null')); return }
      resolve(result.split(',')[1])
    }
    reader.onerror = () => reject(new Error('FileReader error'))
    reader.readAsDataURL(blob)
  })
}

/** Email input modal */
function EmailModal({ tr, emailAddress, setEmailAddress, emailSending, emailSuccess, emailError, onSend, onClose }: {
  tr: boolean
  emailAddress: string
  setEmailAddress: (v: string) => void
  emailSending: boolean
  emailSuccess: boolean
  emailError: string
  onSend: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-md mx-4 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-sm">
              {tr ? 'SBAR Raporu Gonder' : 'Send SBAR Report'}
            </h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {emailSuccess ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Send className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-green-600">
                {tr ? 'Email basariyla gonderildi!' : 'Email sent successfully!'}
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {tr
                  ? 'SBAR saglik ozet raporunuz PDF olarak belirttiginiz email adresine gonderilecektir.'
                  : 'Your SBAR health summary report will be sent as a PDF to the email address you provide.'}
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">
                  {tr ? 'Doktor Email Adresi' : 'Doctor\'s Email Address'}
                </label>
                <Input
                  type="email"
                  placeholder={tr ? 'doktor@ornek.com' : 'doctor@example.com'}
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') onSend() }}
                  autoFocus
                />
              </div>

              {emailError && (
                <p className="text-xs text-destructive">{emailError}</p>
              )}

              <Button onClick={onSend} disabled={emailSending || !emailAddress.trim()} className="w-full" size="sm">
                {emailSending
                  ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />{tr ? 'Gonderiliyor...' : 'Sending...'}</>
                  : <><Send className="mr-1.5 h-3.5 w-3.5" />{tr ? 'Raporu Gonder' : 'Send Report'}</>}
              </Button>

              <p className="text-[10px] text-muted-foreground text-center">
                {tr ? 'Gunluk limit: 5 email' : 'Daily limit: 5 emails'}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
