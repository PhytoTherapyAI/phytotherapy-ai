'use client'

import { useState, useRef, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X, Search, Check, Lightbulb } from 'lucide-react'
import { tx } from '@/lib/translations'

// ── Disease autocomplete DB (same as onboarding) ──
const DISEASE_DB: { id: string; tr: string; en: string }[] = [
  { id: "Diabetes", tr: "Diyabet", en: "Diabetes" },
  { id: "Type 1 Diabetes", tr: "Tip 1 Diyabet", en: "Type 1 Diabetes" },
  { id: "Type 2 Diabetes", tr: "Tip 2 Diyabet", en: "Type 2 Diabetes" },
  { id: "Hypertension", tr: "Hipertansiyon", en: "Hypertension" },
  { id: "Asthma", tr: "Astım", en: "Asthma" },
  { id: "COPD", tr: "KOAH", en: "COPD" },
  { id: "Hypothyroidism", tr: "Hipotiroidi", en: "Hypothyroidism" },
  { id: "Hyperthyroidism", tr: "Hipertiroidi", en: "Hyperthyroidism" },
  { id: "Heart Failure", tr: "Kalp Yetmezliği", en: "Heart Failure" },
  { id: "Coronary Artery Disease", tr: "Koroner Arter Hastalığı", en: "Coronary Artery Disease" },
  { id: "Arrhythmia", tr: "Aritmi", en: "Arrhythmia" },
  { id: "Epilepsy", tr: "Epilepsi", en: "Epilepsy" },
  { id: "Migraine", tr: "Migren", en: "Migraine" },
  { id: "Depression/Anxiety", tr: "Depresyon / Anksiyete", en: "Depression / Anxiety" },
  { id: "Rheumatoid Arthritis", tr: "Romatoid Artrit", en: "Rheumatoid Arthritis" },
  { id: "Psoriasis", tr: "Sedef Hastalığı", en: "Psoriasis" },
  { id: "Lupus", tr: "Lupus", en: "Lupus" },
  { id: "Crohn's Disease", tr: "Crohn Hastalığı", en: "Crohn's Disease" },
  { id: "Ulcerative Colitis", tr: "Ülseratif Kolit", en: "Ulcerative Colitis" },
  { id: "Anemia", tr: "Anemi", en: "Anemia" },
  { id: "Kidney Stones", tr: "Böbrek Taşı", en: "Kidney Stones" },
  { id: "Osteoporosis", tr: "Osteoporoz", en: "Osteoporosis" },
  { id: "Fibromyalgia", tr: "Fibromiyalji", en: "Fibromyalgia" },
  { id: "Multiple Sclerosis", tr: "Multiple Skleroz", en: "Multiple Sclerosis" },
  { id: "PCOS", tr: "Polikistik Over Sendromu", en: "Polycystic Ovary Syndrome" },
  { id: "Thyroid Disorder", tr: "Tiroid Bozukluğu", en: "Thyroid Disorder" },
  { id: "Kidney Failure", tr: "Böbrek Yetmezliği", en: "Kidney Failure" },
  { id: "Liver Failure", tr: "Karaciğer Yetmezliği", en: "Liver Failure" },
  { id: "Acne (Dermatological)", tr: "Akne (Dermatolojik)", en: "Acne (Dermatological)" },
]

// ── Condition category groups ──
const CONDITION_GROUPS: { labelTr: string; labelEn: string; items: { id: string; key: string }[] }[] = [
  { labelTr: "KARDİYOVASKÜLER", labelEn: "CARDIOVASCULAR", items: [
    { id: "Hypertension", key: "onb.hypertension" },
    { id: "Arrhythmia", key: "onb.arrhythmia" },
    { id: "Heart Failure", key: "onb.heartFailure" },
  ]},
  { labelTr: "ENDOKRİN", labelEn: "ENDOCRINE", items: [
    { id: "Diabetes", key: "onb.diabetesType" },
    { id: "Thyroid Disorder", key: "onb.thyroid" },
  ]},
  { labelTr: "NÖROLOJİK", labelEn: "NEUROLOGICAL", items: [
    { id: "Depression/Anxiety", key: "onb.depressionAnxiety" },
    { id: "Epilepsy", key: "onb.epilepsy" },
  ]},
  { labelTr: "SOLUNUM", labelEn: "RESPIRATORY", items: [
    { id: "Asthma", key: "onb.asthma" },
    { id: "COPD", key: "onb.copd" },
  ]},
  { labelTr: "CERRAHİ GEÇMİŞ", labelEn: "SURGICAL", items: [
    { id: "Bariatric Surgery", key: "onb.bariatricSurgery" },
  ]},
]

// ── Medication → Disease suggestion map ──
const MEDICATION_DISEASE_MAP: Record<string, { disease: string; categoryTr: string }> = {
  metformin: { disease: "Diabetes", categoryTr: "ENDOKRİN" },
  glifor: { disease: "Diabetes", categoryTr: "ENDOKRİN" },
  glucophage: { disease: "Diabetes", categoryTr: "ENDOKRİN" },
  lisinopril: { disease: "Hypertension", categoryTr: "KARDİYOVASKÜLER" },
  losartan: { disease: "Hypertension", categoryTr: "KARDİYOVASKÜLER" },
  amlodipine: { disease: "Hypertension", categoryTr: "KARDİYOVASKÜLER" },
  ramipril: { disease: "Hypertension", categoryTr: "KARDİYOVASKÜLER" },
  coumadin: { disease: "Heart Failure", categoryTr: "KARDİYOVASKÜLER" },
  warfarin: { disease: "Heart Failure", categoryTr: "KARDİYOVASKÜLER" },
  levothyroxine: { disease: "Thyroid Disorder", categoryTr: "ENDOKRİN" },
  euthyrox: { disease: "Thyroid Disorder", categoryTr: "ENDOKRİN" },
  ventolin: { disease: "Asthma", categoryTr: "SOLUNUM" },
  salbutamol: { disease: "Asthma", categoryTr: "SOLUNUM" },
  seretide: { disease: "Asthma", categoryTr: "SOLUNUM" },
  zoretanin: { disease: "Acne (Dermatological)", categoryTr: "DERMATOLOJİ" },
  isotretinoin: { disease: "Acne (Dermatological)", categoryTr: "DERMATOLOJİ" },
  sertraline: { disease: "Depression/Anxiety", categoryTr: "NÖROLOJİK" },
  escitalopram: { disease: "Depression/Anxiety", categoryTr: "NÖROLOJİK" },
  pregabalin: { disease: "Epilepsy", categoryTr: "NÖROLOJİK" },
  gabapentin: { disease: "Epilepsy", categoryTr: "NÖROLOJİK" },
  montelukast: { disease: "Asthma", categoryTr: "SOLUNUM" },
}

function trLower(s: string): string {
  return s.replace(/İ/g, 'i').replace(/I/g, 'ı').replace(/Ş/g, 'ş').replace(/Ğ/g, 'ğ').replace(/Ü/g, 'ü').replace(/Ö/g, 'ö').replace(/Ç/g, 'ç').toLowerCase()
}

interface Props {
  conditions: string[]
  medications: { brand_name: string | null; generic_name: string | null }[]
  onToggle: (id: string) => void
  onAdd: (id: string) => void
  lang: 'en' | 'tr'
}

export function ChronicConditionsEditor({ conditions, medications, onToggle, onAdd, lang }: Props) {
  const tr = lang === 'tr'
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [cleanSlate, setCleanSlate] = useState(conditions.filter(c => !c.startsWith('family:')).length === 0)
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Update clean slate when conditions change
  useEffect(() => {
    setCleanSlate(conditions.filter(c => !c.startsWith('family:')).length === 0)
  }, [conditions])

  const filtered = search.length >= 2
    ? DISEASE_DB.filter(d => {
        const q = trLower(search)
        return (trLower(d.tr).includes(q) || trLower(d.en).includes(q)) && !conditions.includes(d.id)
      }).slice(0, 6)
    : []

  // Medication → disease suggestions
  const medSuggestions = medications
    .flatMap(m => {
      const names = [m.brand_name, m.generic_name].filter(Boolean).map(n => trLower(n!))
      return names.flatMap(name => {
        const match = Object.entries(MEDICATION_DISEASE_MAP).find(([key]) => name.includes(key))
        return match ? [match[1]] : []
      })
    })
    .filter((s, i, arr) => arr.findIndex(x => x.disease === s.disease) === i) // dedupe
    .filter(s => !conditions.includes(s.disease) && !dismissedSuggestions.includes(s.disease))

  const handleCleanSlateToggle = () => {
    if (!cleanSlate) {
      // Clear all non-family conditions
      conditions.filter(c => !c.startsWith('family:')).forEach(c => onToggle(c))
    }
    setCleanSlate(!cleanSlate)
  }

  const selectFromSearch = (id: string) => {
    if (!conditions.includes(id)) onAdd(id)
    setSearch('')
    setShowDropdown(false)
    setCleanSlate(false)
  }

  const addCustom = () => {
    if (search.trim() && !conditions.includes(search.trim())) {
      onAdd(search.trim())
      setSearch('')
      setShowDropdown(false)
      setCleanSlate(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Clean slate toggle */}
      <button
        type="button"
        onClick={handleCleanSlateToggle}
        className={`w-full rounded-xl border-2 p-3.5 text-sm font-semibold text-center transition-all ${
          cleanSlate
            ? "border-green-500 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
            : "border-muted hover:border-green-300 text-muted-foreground"
        }`}
      >
        {cleanSlate ? `\u2705 ${tr ? "Kronik hastalığım yok — Teyit edildi" : "No chronic conditions — Confirmed"}` : `${tr ? "Kronik hastalığım yok" : "No chronic conditions"}`}
      </button>

      {/* Medication → disease suggestions */}
      {medSuggestions.map(s => {
        const diseaseLabel = DISEASE_DB.find(d => d.id === s.disease)?.[tr ? 'tr' : 'en'] || s.disease
        const medName = medications.find(m => {
          const names = [m.brand_name, m.generic_name].filter(Boolean).map(n => trLower(n!))
          return names.some(n => Object.entries(MEDICATION_DISEASE_MAP).some(([key, val]) => n.includes(key) && val.disease === s.disease))
        })
        const displayMed = medName?.brand_name || medName?.generic_name || ''
        return (
          <div key={s.disease} className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/10 p-3 flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-green-800 dark:text-green-300">
                {tr
                  ? `${displayMed} kullandığını görüyorum. ${diseaseLabel} profiline ekleyeyim mi?`
                  : `I see you take ${displayMed}. Should I add ${diseaseLabel} to your profile?`}
              </p>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="default" className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700"
                  onClick={() => { selectFromSearch(s.disease); setDismissedSuggestions(p => [...p, s.disease]); }}>
                  <Check className="h-3 w-3" /> {tr ? "Evet Ekle" : "Yes, Add"}
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs"
                  onClick={() => setDismissedSuggestions(p => [...p, s.disease])}>
                  {tr ? "Hayır" : "No"}
                </Button>
              </div>
            </div>
          </div>
        )
      })}

      {/* Category chip groups */}
      {!cleanSlate && CONDITION_GROUPS.map(group => (
        <div key={group.labelEn} className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {tr ? group.labelTr : group.labelEn}
          </p>
          <div className="flex flex-wrap gap-2">
            {group.items.map(c => (
              <Badge key={c.id} variant={conditions.includes(c.id) ? "default" : "outline"}
                className="cursor-pointer transition-colors" onClick={() => { onToggle(c.id); setCleanSlate(false); }}>
                {tx(c.key, lang)}
              </Badge>
            ))}
          </div>
        </div>
      ))}

      {/* Autocomplete search */}
      {!cleanSlate && (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder={tr ? "Hastalık ara..." : "Search conditions..."}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowDropdown(e.target.value.length >= 2); }}
              onFocus={() => { if (search.length >= 2) setShowDropdown(true); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (filtered.length > 0) selectFromSearch(filtered[0].id); else addCustom(); } }}
              className="pl-9"
            />
          </div>
          {showDropdown && (filtered.length > 0 || search.length >= 2) && (
            <div ref={dropdownRef} className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border bg-background shadow-lg">
              {filtered.map(d => (
                <button key={d.id} type="button" onClick={() => selectFromSearch(d.id)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors">
                  <span className="font-medium">{tr ? d.tr : d.en}</span>
                  {tr && <span className="text-xs text-muted-foreground">({d.en})</span>}
                </button>
              ))}
              {search.trim() && !filtered.some(d => trLower(d.tr) === trLower(search) || trLower(d.en) === trLower(search)) && (
                <button type="button" onClick={addCustom}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-primary hover:bg-primary/5 border-t">
                  + {tr ? `Ekle: "${search}"` : `Add: "${search}"`}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Selected conditions as removable chips */}
      {conditions.filter(c => !c.startsWith('family:')).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {conditions.filter(c => !c.startsWith('family:')).map(c => {
            const db = DISEASE_DB.find(d => d.id === c)
            return (
              <Badge key={c} variant="default" className="gap-1 text-xs">
                {db ? (tr ? db.tr : db.en) : c}
                <X className="h-3 w-3 cursor-pointer" onClick={(e) => { e.stopPropagation(); onToggle(c); }} />
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}
