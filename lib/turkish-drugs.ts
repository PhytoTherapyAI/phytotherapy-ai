// © 2026 DoctoPal — All Rights Reserved
import drugsData from '@/public/drugs-tr.json'

export interface DrugEntry {
  brandName: string
  genericName: string
  fullName: string
  company: string
  atc: string
  source: 'local' | 'fda'
}

const TURKISH_DRUGS: DrugEntry[] = (drugsData as any[]).map(d => ({
  ...d,
  source: 'local' as const
}))

export function searchTurkishDrugs(query: string): DrugEntry[] {
  const q = query.toLowerCase().trim()
  if (q.length < 2) return []
  return TURKISH_DRUGS
    .filter(d =>
      d.brandName.toLowerCase().startsWith(q) ||
      d.genericName.toLowerCase().startsWith(q)
    )
    .slice(0, 8)
}
