// © 2026 DoctoPal — All Rights Reserved
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { useLang } from '@/components/layout/language-toggle'

type InviteStatus = 'loading' | 'found' | 'accepting' | 'accepted' | 'error'

function AcceptInviteContent() {
  const params = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const { lang } = useLang()
  const tr = lang === 'tr'
  const token = params.get('token')
  const [status, setStatus] = useState<InviteStatus>('loading')
  const [inviterName, setInviterName] = useState('')
  const [groupName, setGroupName] = useState('')

  const supabase = createBrowserClient()

  useEffect(() => {
    if (token) fetchInvite()
    else setStatus('error')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function fetchInvite() {
    const { data, error } = await supabase
      .from('family_members')
      .select(`
        id, invite_email, nickname,
        group:family_groups(
          name,
          owner_id
        )
      `)
      .eq('invite_token', token!)
      .eq('invite_status', 'pending')
      .maybeSingle()

    if (error) {
      console.error('[Accept] fetchInvite error:', error.message)
      setStatus('error')
      return
    }

    if (data) {
      // Supabase join — safe parse
      const groupArr = data.group
      const groupData = Array.isArray(groupArr) ? groupArr[0] : groupArr
      setGroupName((groupData as { name?: string })?.name ?? (tr ? 'Aile Grubu' : 'Family Group'))

      // Owner ismini al
      const ownerId = (groupData as { owner_id?: string })?.owner_id
      if (ownerId) {
        const { data: ownerProfile } = await supabase
          .from('user_profiles')
          .select('display_name, full_name')
          .eq('id', ownerId)
          .maybeSingle()
        setInviterName(ownerProfile?.display_name || ownerProfile?.full_name || (tr ? 'Birisi' : 'Someone'))
      } else {
        setInviterName(tr ? 'Birisi' : 'Someone')
      }
      setStatus('found')
    } else {
      setStatus('error')
    }
  }

  async function acceptInvite() {
    if (!user || !token) return
    setStatus('accepting')

    // Validate invite belongs to this user's email
    const { data: inviteData } = await supabase
      .from('family_members')
      .select('invite_email')
      .eq('invite_token', token)
      .maybeSingle()

    if (inviteData && user.email && inviteData.invite_email.toLowerCase() !== user.email.toLowerCase()) {
      console.error('[Accept] Email mismatch:', inviteData.invite_email, 'vs', user.email)
      setStatus('error')
      return
    }

    const { error } = await supabase
      .from('family_members')
      .update({
        user_id: user.id,
        invite_status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('invite_token', token)

    if (error) {
      console.error('[Accept] acceptInvite error:', error.message)
      setStatus('error')
    } else {
      setStatus('accepted')
      setTimeout(() => router.push('/'), 2000)
    }
  }

  async function declineInvite() {
    if (!token) return
    await supabase
      .from('family_members')
      .update({ invite_status: 'declined' })
      .eq('invite_token', token)
    router.push('/')
  }

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-primary rounded-full border-t-transparent" />
    </div>
  )

  if (status === 'error') return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-6xl mb-4" aria-hidden="true">&#10060;</div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          {tr ? 'Davet Bulunamadı' : 'Invite Not Found'}
        </h2>
        <p className="text-muted-foreground">
          {tr ? 'Bu davet geçersiz veya süresi dolmuş.' : 'This invite is invalid or has expired.'}
        </p>
        <button
          onClick={() => router.push('/')}
          className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition"
        >
          {tr ? 'Ana Sayfaya Dön' : 'Back to Home'}
        </button>
      </div>
    </div>
  )

  // Login gerekli
  if (!user && status === 'found') return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="bg-card rounded-2xl shadow-lg p-8 max-w-md w-full text-center border">
        <div className="text-5xl mb-4" aria-hidden="true">&#128101;</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {tr ? 'Aile Daveti' : 'Family Invite'}
        </h2>
        <p className="text-muted-foreground mb-6">
          <strong>{inviterName}</strong>, {tr ? 'sizi' : 'invited you to'}{' '}
          <strong>{groupName}</strong> {tr ? 'grubuna davet etti.' : 'group.'}
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          {tr ? 'Daveti kabul etmek için giriş yapın veya kayıt olun.' : 'Sign in or register to accept this invite.'}
        </p>
        <button
          onClick={() => router.push(`/auth/login?redirect=/family/accept?token=${token}`)}
          className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition"
        >
          {tr ? 'Giriş Yap / Kayıt Ol' : 'Sign In / Register'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="bg-card rounded-2xl shadow-lg p-8 max-w-md w-full text-center border">

        {/* Güvenlik uyarısı */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 text-left">
          <div className="flex items-start gap-3">
            <span className="text-2xl" aria-hidden="true">&#9888;&#65039;</span>
            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-200">
                {tr ? 'Güvenlik Bildirimi' : 'Security Notice'}
              </p>
              <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                {tr
                  ? 'Bu davet size ait değilse kabul etmeyin ve bu sayfayı kapatın.'
                  : 'If this invite is not meant for you, do not accept it and close this page.'}
              </p>
            </div>
          </div>
        </div>

        <div className="text-5xl mb-4" aria-hidden="true">&#128106;</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {tr ? 'Aile Daveti' : 'Family Invite'}
        </h2>
        <p className="text-muted-foreground mb-6">
          <strong>{inviterName}</strong>, {tr ? 'sizi' : 'invited you to'}{' '}
          <strong>{groupName}</strong> {tr ? 'grubuna davet etti.' : 'group.'}
        </p>

        {status === 'accepted' ? (
          <div className="text-primary font-semibold text-lg">
            {tr ? 'Kabul edildi! Yönlendiriliyorsunuz...' : 'Accepted! Redirecting...'}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <button
              onClick={acceptInvite}
              disabled={status === 'accepting'}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition disabled:opacity-50"
            >
              {status === 'accepting'
                ? (tr ? 'Kabul ediliyor...' : 'Accepting...')
                : (tr ? 'Daveti Kabul Et' : 'Accept Invite')}
            </button>
            <button
              onClick={declineInvite}
              className="w-full py-3 border-2 border-border text-muted-foreground rounded-xl font-semibold hover:border-destructive hover:text-destructive transition"
            >
              {tr ? 'Reddet' : 'Decline'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary rounded-full border-t-transparent" />
      </div>
    }>
      <AcceptInviteContent />
    </Suspense>
  )
}
