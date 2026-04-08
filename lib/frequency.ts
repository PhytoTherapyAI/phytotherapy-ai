// Central frequency translation map — TR/EN
const FREQUENCY_MAP: Record<string, string> = {
  // English variants → Turkish
  'daily': 'Günlük',
  'once daily': 'Günlük',
  'once_daily': 'Günlük',
  '1x daily': 'Günlük',
  '1x_daily': 'Günlük',
  'once a day': 'Günlük',
  'once_a_day': 'Günlük',
  'qd': 'Günlük',
  'od': 'Günlük',
  'twice daily': 'Günde 2 kez',
  'twice_daily': 'Günde 2 kez',
  '2x daily': 'Günde 2 kez',
  '2x_daily': 'Günde 2 kez',
  'bid': 'Günde 2 kez',
  'three times daily': 'Günde 3 kez',
  'three_times_daily': 'Günde 3 kez',
  '3x daily': 'Günde 3 kez',
  '3x_daily': 'Günde 3 kez',
  'tid': 'Günde 3 kez',
  'four times daily': 'Günde 4 kez',
  'four_times_daily': 'Günde 4 kez',
  '4x daily': 'Günde 4 kez',
  'qid': 'Günde 4 kez',
  'every 8 hours': 'Her 8 saatte',
  'every 12 hours': 'Her 12 saatte',
  'weekly': 'Haftalık',
  'monthly': 'Aylık',
  'as needed': 'Gerektiğinde',
  'as_needed': 'Gerektiğinde',
  'prn': 'Gerektiğinde',
  // Turkish passthrough
  'günlük': 'Günlük',
  'günde 2 kez': 'Günde 2 kez',
  'günde 3 kez': 'Günde 3 kez',
  'günde 4 kez': 'Günde 4 kez',
  'haftalık': 'Haftalık',
  'aylık': 'Aylık',
  'gerektiğinde': 'Gerektiğinde',
}

export function toTurkishFrequency(value: string | null | undefined): string {
  if (!value) return ''
  const lower = value.toLowerCase().trim()
  return FREQUENCY_MAP[lower] ?? FREQUENCY_MAP[value] ?? value
}
