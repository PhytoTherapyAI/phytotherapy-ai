'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@/lib/supabase'

interface Props {
  lang: 'en' | 'tr'
  className?: string
  variant?: 'default' | 'fab'
}

export function PDFDownloadButton({ lang, className, variant = 'default' }: Props) {
  const tr = lang === 'tr'
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        alert(tr ? 'Oturum bulunamadı' : 'Session not found')
        return
      }

      const res = await fetch('/api/sbar-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ lang }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown' }))
        console.error('PDF error:', err)

        // Fallback: client-side PDF generation
        try {
          const { pdf } = await import('@react-pdf/renderer')
          const { SBARReport } = await import('@/components/pdf/SBARReport')

          // Fetch profile data client-side
          const [profileRes, medsRes, allergiesRes] = await Promise.all([
            supabase.from('user_profiles').select('*').eq('id', session.user.id).single(),
            supabase.from('user_medications').select('brand_name, generic_name, dosage, frequency').eq('user_id', session.user.id).eq('is_active', true),
            supabase.from('user_allergies').select('allergen, severity').eq('user_id', session.user.id),
          ])

          const profile = profileRes.data
          if (!profile) throw new Error('No profile')

          const vaccines = Array.isArray(profile.vaccines) ? profile.vaccines : []
          const chronicConditions: string[] = profile.chronic_conditions || []
          const bmi = profile.height_cm && profile.weight_kg
            ? Number(profile.weight_kg) / ((Number(profile.height_cm) / 100) ** 2)
            : null

          const sbarData = {
            lang,
            fullName: profile.full_name || '',
            age: profile.age,
            gender: profile.gender,
            bloodGroup: profile.blood_group,
            bmi,
            isPregnant: profile.is_pregnant || false,
            isBreastfeeding: profile.is_breastfeeding || false,
            kidneyDisease: profile.kidney_disease || false,
            liverDisease: profile.liver_disease || false,
            chronicConditions,
            familyHistory: chronicConditions.filter((c: string) => c.startsWith('family:')).map((c: string) => c.replace('family:', '')),
            smokingUse: (profile.smoking_use || 'none').split('|')[0],
            alcoholUse: (profile.alcohol_use || 'none').split('|')[0],
            allergies: (allergiesRes.data || []).map((a: { allergen: string; severity: string }) => ({ allergen: a.allergen, severity: a.severity })),
            medications: (medsRes.data || []).map((m: { generic_name: string | null; brand_name: string | null; dosage: string | null; frequency: string | null }) => ({
              name: m.generic_name || m.brand_name || '—',
              dosage: m.dosage || '—',
              frequency: m.frequency || '—',
            })),
            supplements: profile.supplements || [],
            vaccines: vaccines.filter((v: { status: string }) => v.status === 'done').map((v: { name: string; status: string; last_date?: string }) => ({
              name: v.name,
              status: v.status,
              lastDate: v.last_date,
            })),
            generatedAt: new Date().toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }),
          }

          const blob = await pdf(SBARReport({ data: sbarData })).toBlob()
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `DoctoPal-SBAR-${new Date().toISOString().split('T')[0]}.pdf`
          a.click()
          URL.revokeObjectURL(url)
          return
        } catch (clientErr) {
          console.error('Client-side PDF also failed:', clientErr)
          alert(tr ? 'PDF oluşturulamadı' : 'PDF generation failed')
          return
        }
      }

      // Server response OK — download
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `DoctoPal-SBAR-${new Date().toISOString().split('T')[0]}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF download error:', err)
      alert(tr ? 'PDF oluşturulamadı' : 'PDF generation failed')
    } finally {
      setLoading(false)
    }
  }

  if (variant === 'fab') {
    return (
      <button
        onClick={handleDownload}
        disabled={loading}
        className={className}
      >
        {loading
          ? <Loader2 className="h-5 w-5 animate-spin" />
          : <span className="text-lg">{"\u{1F4C4}"}</span>}
      </button>
    )
  }

  return (
    <Button onClick={handleDownload} disabled={loading} size="sm" className={className}>
      {loading
        ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />{tr ? 'Oluşturuluyor...' : 'Generating...'}</>
        : <><span className="mr-1.5">{"\u{1F4E5}"}</span>{tr ? 'PDF İndir' : 'Download PDF'}</>}
    </Button>
  )
}
