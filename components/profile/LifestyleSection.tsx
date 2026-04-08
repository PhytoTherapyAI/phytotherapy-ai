'use client'

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MotivationCard } from './ProfileGamification'

interface LifestyleData {
  height_cm: number | null
  weight_kg: number | null
  blood_group: string
  diet_type: string
  exercise_frequency: string
  sleep_quality: string
}

interface Props {
  data: LifestyleData
  onChange: (updates: Partial<LifestyleData>) => void
  lang: 'en' | 'tr'
}

const EXERCISE_OPTIONS = [
  { value: 'sedentary', emoji: '\u{1F534}', tr: 'Hiç yapmıyorum', en: 'Sedentary' },
  { value: 'light', emoji: '\u{1F7E1}', tr: 'Haftada 1-2 kez', en: '1-2x/week' },
  { value: 'moderate', emoji: '\u{1F7E2}', tr: 'Haftada 3-4 kez', en: '3-4x/week' },
  { value: 'active', emoji: '\u{1F7E2}', tr: 'Haftada 5+ kez', en: '5+/week' },
  { value: 'athlete', emoji: '\u{26A1}', tr: 'Her gün (Sporcu)', en: 'Daily (Athlete)' },
]

const SLEEP_OPTIONS = [
  { value: 'good', emoji: '\u{1F634}', tr: 'Enerjik uyanırım', en: 'Wake up energized' },
  { value: 'fair', emoji: '\u{1F610}', tr: 'Ara sıra yorgun uyanırım', en: 'Sometimes tired' },
  { value: 'poor', emoji: '\u{1F613}', tr: 'Gecem sık bölünüyor', en: 'Frequently disrupted' },
  { value: 'insomnia', emoji: '\u{1F635}', tr: 'Uyumakta ciddi zorluk', en: 'Severe insomnia' },
]

const DIET_OPTIONS = [
  { value: 'regular', emoji: '\u{1F957}', tr: 'Normal', en: 'Regular' },
  { value: 'vegetarian', emoji: '\u{1F331}', tr: 'Vejetaryen', en: 'Vegetarian' },
  { value: 'vegan', emoji: '\u{1F96C}', tr: 'Vegan', en: 'Vegan' },
  { value: 'keto', emoji: '\u{1F969}', tr: 'Ketojenik', en: 'Keto' },
  { value: 'gluten_free', emoji: '\u{1FAD0}', tr: 'Glutensiz', en: 'Gluten-free' },
  { value: 'halal', emoji: '\u{1F54C}', tr: 'Helal', en: 'Halal' },
  { value: 'other', emoji: '\u{1F37D}\u{FE0F}', tr: 'Diğer', en: 'Other' },
]

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const BLOOD_INSIGHTS: Record<string, { tr: string; en: string; emoji: string }> = {
  'A+': { tr: 'Mide tarama önerisi aktif', en: 'Stomach screening recommended', emoji: '\u{1F50D}' },
  'A-': { tr: 'Mide tarama önerisi aktif', en: 'Stomach screening recommended', emoji: '\u{1F50D}' },
  'O+': { tr: 'Ülser takibi önerilir', en: 'Ulcer monitoring recommended', emoji: '\u{1F48A}' },
  'O-': { tr: 'Ülser takibi önerilir', en: 'Ulcer monitoring recommended', emoji: '\u{1F48A}' },
  'B+': { tr: 'Pankreas sağlığı takibi', en: 'Pancreas health monitoring', emoji: '\u{1F3AF}' },
  'B-': { tr: 'Pankreas sağlığı takibi', en: 'Pancreas health monitoring', emoji: '\u{1F3AF}' },
  'AB+': { tr: 'Kardiyovasküler takip', en: 'Cardiovascular monitoring', emoji: '\u{2764}\u{FE0F}' },
  'AB-': { tr: 'Kardiyovasküler takip', en: 'Cardiovascular monitoring', emoji: '\u{2764}\u{FE0F}' },
}

function getBMI(h: number | null, w: number | null): { value: number; label: string; emoji: string; color: string; tipTr: string; tipEn: string } | null {
  if (!h || !w || h < 50 || w < 10) return null
  const bmi = w / ((h / 100) ** 2)
  if (bmi < 18.5) return { value: Math.round(bmi * 10) / 10, label: 'Zayıf', emoji: '\u{1F4C9}', color: 'text-blue-600', tipTr: 'Takviye önerilerin farklı olacak.', tipEn: 'Your supplement recommendations will be different.' }
  if (bmi < 25) return { value: Math.round(bmi * 10) / 10, label: 'Normal', emoji: '\u{2705}', color: 'text-green-600', tipTr: 'İdeal aralıkta! Öneriler buna göre.', tipEn: 'Ideal range! Recommendations adjusted accordingly.' }
  if (bmi < 30) return { value: Math.round(bmi * 10) / 10, label: 'Fazla Kilolu', emoji: '\u{26A0}\u{FE0F}', color: 'text-amber-600', tipTr: 'Bazı takviyeler daha önemli olabilir.', tipEn: 'Some supplements may be more important.' }
  return { value: Math.round(bmi * 10) / 10, label: 'Obez', emoji: '\u{1F534}', color: 'text-red-600', tipTr: 'Metabolik risk faktörleri hesaba katılacak.', tipEn: 'Metabolic risk factors will be considered.' }
}

export function LifestyleSection({ data, onChange, lang }: Props) {
  const tr = lang === 'tr'
  const bmi = getBMI(data.height_cm, data.weight_kg)
  const bloodInsight = data.blood_group ? BLOOD_INSIGHTS[data.blood_group] : null

  return (
    <div className="space-y-5">
      <MotivationCard
        id="motiv_lifestyle"
        icon={"\u{1F3C3}"}
        title={tr ? 'Kanepe mi, maraton mu?' : 'Couch or marathon?'}
        message={tr ? 'Sporcu birine kreatin \u00f6neriyorum, kanepe sevdal\u0131s\u0131na magnezyum. \u0130kisine de \'egzersiz yap\' demem. Senin tarz\u0131na g\u00f6re konu\u015fal\u0131m. Hangisi daha yak\u0131n? \u{1F604}' : 'I recommend creatine for athletes, magnesium for couch lovers. I don\'t tell both to \'just exercise\'. Let\'s talk based on your style. Which one are you? \u{1F604}'}
        color="orange"
      />

      {/* BMI Card */}
      <div className="rounded-xl border p-4 space-y-3">
        <p className="text-sm font-semibold flex items-center gap-2">{"\u{1F4CF}"} {tr ? 'Boy & Kilo' : 'Height & Weight'}</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">{tr ? 'Boy (cm)' : 'Height (cm)'}</Label>
            <Input type="number" placeholder="170" value={data.height_cm ?? ''} onChange={e => onChange({ height_cm: e.target.value ? parseInt(e.target.value) : null })} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{tr ? 'Kilo (kg)' : 'Weight (kg)'}</Label>
            <Input type="number" placeholder="70" value={data.weight_kg ?? ''} onChange={e => onChange({ weight_kg: e.target.value ? parseFloat(e.target.value) : null })} />
          </div>
        </div>
        {bmi ? (
          <div className="space-y-1">
            <div className={`text-sm font-semibold ${bmi.color}`}>
              BMI: {bmi.value} — {bmi.emoji} {bmi.label}
            </div>
            <p className="text-xs text-muted-foreground">{tr ? bmi.tipTr : bmi.tipEn}</p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{tr ? 'Boy ve kilonu gir, BMI hesaplansın!' : 'Enter height & weight to calculate BMI!'} {"\u{1F4AA}"}</p>
        )}
      </div>

      {/* Blood Group Card */}
      <div className="rounded-xl border p-4 space-y-3">
        <p className="text-sm font-semibold flex items-center gap-2">{"\u{1FA78}"} {tr ? 'Kan Grubun' : 'Blood Type'}</p>
        <div className="flex flex-wrap gap-2">
          {BLOOD_GROUPS.map(g => (
            <Badge key={g} variant={data.blood_group === g ? 'default' : 'outline'} className="cursor-pointer transition-colors px-3 py-1.5 text-sm" onClick={() => onChange({ blood_group: g })}>
              {g}
            </Badge>
          ))}
        </div>
        {bloodInsight && (
          <div className="text-xs text-primary font-medium flex items-center gap-1.5 bg-primary/5 rounded-lg px-3 py-2"
            title={tr ? "Bu istatistiksel bir e\u011filim, te\u015fhis de\u011fildir." : "This is a statistical trend, not a diagnosis."}>
            {bloodInsight.emoji} {tr ? bloodInsight.tr : bloodInsight.en}
            <span className="text-muted-foreground opacity-50 ml-1 text-[10px]">{tr ? "(istatistiksel)" : "(statistical)"}</span>
          </div>
        )}
      </div>

      {/* Exercise - Traffic Light Chips */}
      <div className="rounded-xl border p-4 space-y-3">
        <p className="text-sm font-semibold flex items-center gap-2">{"\u{1F3CB}\u{FE0F}"} {tr ? 'Egzersiz Sıklığın' : 'Exercise Frequency'}</p>
        <div className="flex flex-wrap gap-2">
          {EXERCISE_OPTIONS.map(opt => (
            <Badge key={opt.value} variant={data.exercise_frequency === opt.value ? 'default' : 'outline'} className="cursor-pointer transition-colors" onClick={() => onChange({ exercise_frequency: opt.value })}>
              {opt.emoji} {tr ? opt.tr : opt.en}
            </Badge>
          ))}
        </div>
      </div>

      {/* Sleep Quality Chips */}
      <div className="rounded-xl border p-4 space-y-3">
        <p className="text-sm font-semibold flex items-center gap-2">{"\u{1F4A4}"} {tr ? 'Uyku Kaliten' : 'Sleep Quality'}</p>
        <div className="flex flex-wrap gap-2">
          {SLEEP_OPTIONS.map(opt => (
            <Badge key={opt.value} variant={data.sleep_quality === opt.value ? 'default' : 'outline'} className="cursor-pointer transition-colors" onClick={() => onChange({ sleep_quality: opt.value })}>
              {opt.emoji} {tr ? opt.tr : opt.en}
            </Badge>
          ))}
        </div>
      </div>

      {/* Diet Type Grid */}
      <div className="rounded-xl border p-4 space-y-3">
        <p className="text-sm font-semibold flex items-center gap-2">{"\u{1F37D}\u{FE0F}"} {tr ? 'Beslenme Türün' : 'Diet Type'}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {DIET_OPTIONS.map(opt => (
            <button key={opt.value} type="button" onClick={() => onChange({ diet_type: opt.value })}
              className={`rounded-lg border p-2.5 text-sm text-center transition-all ${data.diet_type === opt.value ? 'border-primary bg-primary/10 font-semibold' : 'hover:border-primary/30'}`}>
              <span className="text-lg block mb-0.5">{opt.emoji}</span>
              {tr ? opt.tr : opt.en}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
