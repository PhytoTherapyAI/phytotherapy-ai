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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { alert(tr ? 'Oturum bulunamadı' : 'Session not found'); return }

      // Fetch profile data client-side
      const [profileRes, medsRes, allergiesRes] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('id', user.id).single(),
        supabase.from('user_medications').select('brand_name, generic_name, dosage, frequency').eq('user_id', user.id).eq('is_active', true),
        supabase.from('user_allergies').select('allergen, severity').eq('user_id', user.id),
      ])

      const profile = profileRes.data
      if (!profile) { alert(tr ? 'Profil bulunamadı' : 'Profile not found'); return }

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
          name: m.generic_name || m.brand_name || '\u2014',
          dosage: m.dosage || '\u2014',
          frequency: m.frequency || '\u2014',
        })),
        supplements: profile.supplements || [],
        vaccines: vaccines.filter((v: { status: string }) => v.status === 'done').map((v: { name: string; status: string; last_date?: string }) => ({
          name: v.name,
          status: v.status,
          lastDate: v.last_date,
        })),
        generatedAt: new Date().toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      }

      // Client-side PDF generation — no server needed
      const { pdf } = await import('@react-pdf/renderer')
      const { SBARReport } = await import('@/components/pdf/SBARReport')

      const blob = await pdf(SBARReport({ data: sbarData })).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `DoctoPal-SBAR-${new Date().toISOString().split('T')[0]}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF generation error:', err)
      alert(tr ? 'PDF oluşturulamadı' : 'PDF generation failed')
    } finally {
      setLoading(false)
    }
  }

  if (variant === 'fab') {
    return (
      <button onClick={handleDownload} disabled={loading} className={className}>
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
