// © 2026 Doctopal — All Rights Reserved
import { NextRequest, NextResponse } from 'next/server'
import { searchTurkishDrugs } from '@/lib/turkish-drugs'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'
import { sanitizeInput } from '@/lib/sanitize'

interface DrugResult {
  brandName: string
  genericName: string
  fullName: string
  company: string
  atc: string
  source: string
}

interface RxConceptProperty {
  name?: string
  synonym?: string
}

interface RxConceptGroup {
  conceptProperties?: RxConceptProperty[]
}

interface FdaResult {
  openfda?: {
    brand_name?: string[]
    generic_name?: string[]
    manufacturer_name?: string[]
  }
}

interface DailyMedResult {
  title?: string
  author?: { name?: string }[]
}

export async function GET(req: NextRequest) {
  // Rate limiting — 30 requests per minute for autocomplete (higher limit)
  const clientIP = getClientIP(req)
  const rateCheck = checkRateLimit(`drug-search:${clientIP}`, 30, 60_000)
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(rateCheck.resetInSeconds) } }
    )
  }

  const q = sanitizeInput(req.nextUrl.searchParams.get('q') || '')
  if (q.length < 2) return NextResponse.json([])

  const results: DrugResult[] = []
  const seen = new Set<string>()

  const addResult = (r: DrugResult) => {
    if (!r.brandName) return
    const key = r.brandName.toLowerCase()
    if (!seen.has(key) && r.brandName.length > 1) {
      seen.add(key)
      results.push(r)
    }
  }

  // 1. TİTCK local list
  const local = searchTurkishDrugs(q)
  local.forEach(addResult)
  if (results.length >= 8) return NextResponse.json(results.slice(0, 8))

  // 2. RxNorm (NIH — global)
  try {
    const rx = await fetch(
      `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(q)}`,
      { signal: AbortSignal.timeout(3000) }
    )
    if (rx.ok) {
      const rxData = await rx.json()
      ;((rxData.drugGroup?.conceptGroup || []) as RxConceptGroup[])
        .flatMap((g) => g.conceptProperties || [])
        .filter((p) => p.name)
        .forEach((p) => addResult({
          brandName: p.name || '',
          genericName: p.synonym || p.name || '',
          fullName: p.name || '',
          company: '',
          atc: '',
          source: 'rxnorm',
        }))
    }
  } catch { /* RxNorm timeout — continue */ }
  if (results.length >= 8) return NextResponse.json(results.slice(0, 8))

  // 3. OpenFDA
  try {
    const fda = await fetch(
      `https://api.fda.gov/drug/label.json?search=openfda.brand_name:${encodeURIComponent(q)}*&limit=8`,
      { signal: AbortSignal.timeout(3000) }
    )
    if (fda.ok) {
      const fdaData = await fda.json()
      ;((fdaData.results || []) as FdaResult[]).forEach((r) => {
        const brandName = r.openfda?.brand_name?.[0]
        if (brandName) addResult({
          brandName,
          genericName: r.openfda?.generic_name?.[0] || brandName,
          fullName: brandName,
          company: r.openfda?.manufacturer_name?.[0] || '',
          atc: '',
          source: 'fda',
        })
      })
    }
  } catch { /* OpenFDA timeout — continue */ }
  if (results.length >= 8) return NextResponse.json(results.slice(0, 8))

  // 4. DailyMed (NLM)
  try {
    const dm = await fetch(
      `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?drug_name=${encodeURIComponent(q)}&pagesize=8`,
      { signal: AbortSignal.timeout(3000) }
    )
    if (dm.ok) {
      const dmData = await dm.json()
      ;((dmData.data || []) as DailyMedResult[]).forEach((r) => {
        if (r.title) addResult({
          brandName: r.title.split(' ')[0],
          genericName: r.title,
          fullName: r.title,
          company: r.author?.[0]?.name || '',
          atc: '',
          source: 'dailymed',
        })
      })
    }
  } catch { /* DailyMed timeout — continue */ }

  return NextResponse.json(results.slice(0, 8))
}
