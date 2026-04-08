// © 2026 DoctoPal — All Rights Reserved
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

type InviteStatus = 'loading' | 'found' | 'accepting' | 'accepted' | 'error'

function AcceptInviteContent() {
  const params = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
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
    const { data } = await supabase
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
      .single()

    if (data) {
      const groupData = data.group as unknown as { name: string; owner_id: string } | null
      setGroupName(groupData?.name ?? 'Aile Grubu')

      // Owner ismini al
      if (groupData?.owner_id) {
        const { data: ownerProfile } = await supabase
          .from('user_profiles')
          .select('display_name')
          .eq('id', groupData.owner_id)
          .single()
        setInviterName(ownerProfile?.display_name ?? 'Birisi')
      } else {
        setInviterName('Birisi')
      }
      setStatus('found')
    } else {
      setStatus('error')
    }
  }

  async function acceptInvite() {
    if (!user || !token) return
    setStatus('accepting')

    const { error } = await supabase
      .from('family_members')
      .update({
        user_id: user.id,
        invite_status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('invite_token', token)

    if (error) {
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
        <div className="text-6xl mb-4">&#10060;</div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          Davet Bulunamadi
        </h2>
        <p className="text-muted-foreground">
          Bu davet gecersiz veya suresi dolmus.
        </p>
        <button
          onClick={() => router.push('/')}
          className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition"
        >
          Ana Sayfaya Don
        </button>
      </div>
    </div>
  )

  // Login gerekli
  if (!user && status === 'found') return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="bg-card rounded-2xl shadow-lg p-8 max-w-md w-full text-center border">
        <div className="text-5xl mb-4">&#128101;</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Aile Daveti
        </h2>
        <p className="text-muted-foreground mb-6">
          <strong>{inviterName}</strong>, sizi{' '}
          <strong>{groupName}</strong> grubuna davet etti.
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Daveti kabul etmek icin giris yapin veya kayit olun.
        </p>
        <button
          onClick={() => router.push(`/login?redirect=/family/accept?token=${token}`)}
          className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition"
        >
          Giris Yap / Kayit Ol
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="bg-card rounded-2xl shadow-lg p-8 max-w-md w-full text-center border">

        {/* Guvenlik uyarisi */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 text-left">
          <div className="flex items-start gap-3">
            <span className="text-2xl">&#9888;&#65039;</span>
            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-200">
                Guvenlik Bildirimi
              </p>
              <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                Bu davet size ait degilse kabul etmeyin ve bu sayfayi kapatin.
              </p>
            </div>
          </div>
        </div>

        <div className="text-5xl mb-4">&#128106;</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Aile Daveti
        </h2>
        <p className="text-muted-foreground mb-6">
          <strong>{inviterName}</strong>, sizi{' '}
          <strong>{groupName}</strong> grubuna davet etti.
        </p>

        {status === 'accepted' ? (
          <div className="text-primary font-semibold text-lg">
            &#10003; Kabul edildi! Yonlendiriliyorsunuz...
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <button
              onClick={acceptInvite}
              disabled={status === 'accepting'}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition disabled:opacity-50"
            >
              {status === 'accepting'
                ? 'Kabul ediliyor...'
                : 'Daveti Kabul Et'}
            </button>
            <button
              onClick={declineInvite}
              className="w-full py-3 border-2 border-border text-muted-foreground rounded-xl font-semibold hover:border-destructive hover:text-destructive transition"
            >
              Reddet
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
