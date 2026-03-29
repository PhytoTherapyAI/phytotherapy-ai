"use client"

import { useState } from "react"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sun, Droplets, Pill, Shield, AlertTriangle, ThermometerSun, Users, MapPin, ChevronDown, ChevronUp } from "lucide-react"

interface HealthTopic {
  icon: any
  title: { en: string; tr: string }
  color: string
  items: { en: string; tr: string }[]
  alert?: { en: string; tr: string }
}

const TOPICS: HealthTopic[] = [
  {
    icon: ThermometerSun, title: { en: "Heat & Sun Protection", tr: "Sıcak & Güneş Koruması" }, color: "text-orange-500 bg-orange-500/10",
    items: [
      { en: "Drink at least 3-4 liters of water daily — don't wait until thirsty", tr: "Günde en az 3-4 litre su iç — susayana kadar bekleme" },
      { en: "Use SPF 50+ sunscreen, reapply every 2 hours", tr: "SPF 50+ güneş kremi kullan, 2 saatte bir yenile" },
      { en: "Wear light-colored, loose clothing and hat", tr: "Açık renkli, bol kıyafet ve şapka giy" },
      { en: "Rest during peak heat hours (12:00-15:00)", tr: "En sıcak saatlerde (12:00-15:00) dinlen" },
      { en: "Carry electrolyte packets — heat + dehydration can be fatal", tr: "Elektrolit paketleri taşı — sıcak + dehidratasyon ölümcül olabilir" },
    ],
    alert: { en: "Heat stroke signs: confusion, no sweating, hot skin → call emergency immediately", tr: "Sıcak çarpması belirtileri: bilinç bulanıklığı, terleme durması, kızgın cilt → hemen acili ara" },
  },
  {
    icon: Shield, title: { en: "Infection Prevention", tr: "Enfeksiyon Önleme" }, color: "text-green-500 bg-green-500/10",
    items: [
      { en: "Meningococcal (ACWY) vaccine is MANDATORY — get 10 days before travel", tr: "Meningokok (ACWY) aşısı ZORUNLU — seyahatten 10 gün önce yaptır" },
      { en: "Flu vaccine recommended (crowded areas)", tr: "Grip aşısı önerilir (kalabalık alanlar)" },
      { en: "COVID-19 booster if eligible", tr: "COVID-19 rapel dozu uygunsa" },
      { en: "Wash hands frequently with soap — minimum 20 seconds", tr: "Elleri sık sık sabunla yıka — minimum 20 saniye" },
      { en: "Carry hand sanitizer (60%+ alcohol)", tr: "El dezenfektanı taşı (%60+ alkol)" },
      { en: "Avoid touching face, especially eyes/nose/mouth", tr: "Yüze dokunmaktan kaçın, özellikle göz/burun/ağız" },
      { en: "Use face mask in very crowded rituals (Tawaf, Jamarat)", tr: "Çok kalabalık ibadetlerde maske kullan (Tavaf, Cemerat)" },
    ],
  },
  {
    icon: Pill, title: { en: "Medication Management", tr: "İlaç Yönetimi" }, color: "text-blue-500 bg-blue-500/10",
    items: [
      { en: "Bring 2x your needed medication supply — delays happen", tr: "İhtiyacının 2 katı ilaç götür — gecikmeler olur" },
      { en: "Keep medications in carry-on, NOT checked luggage", tr: "İlaçları el bagajında taşı, valiz içinde DEĞİL" },
      { en: "Carry doctor's letter (English + Arabic) listing all medications", tr: "Tüm ilaçları listeleyen doktor mektubu taşı (İngilizce + Arapça)" },
      { en: "Adjust medication times for time zone change (insulin, thyroid, blood pressure)", tr: "Saat dilimi değişimine göre ilaç saatlerini ayarla (insülin, tiroid, tansiyon)" },
      { en: "Diabetics: carry extra glucose strips, hypo treatment, snacks", tr: "Diyabetliler: ekstra şeker ölçüm çubuğu, hipo tedavisi, atıştırmalık taşı" },
    ],
    alert: { en: "Diabetics fasting during Hajj: consult your doctor BEFORE travel — blood sugar monitoring critical", tr: "Hac'da oruç tutan diyabetliler: seyahat ÖNCESİ doktorunuza danışın — kan şekeri takibi kritik" },
  },
  {
    icon: Droplets, title: { en: "Food & Water Safety", tr: "Yiyecek & Su Güvenliği" }, color: "text-cyan-500 bg-cyan-500/10",
    items: [
      { en: "Drink only bottled or treated water", tr: "Sadece şişe veya arıtılmış su iç" },
      { en: "Avoid raw/undercooked food, street food if possible", tr: "Çiğ/az pişmiş yiyecek, mümkünse sokak yemeğinden kaçın" },
      { en: "Eat freshly prepared hot meals", tr: "Taze hazırlanmış sıcak yemek ye" },
      { en: "Carry anti-diarrheal medication (loperamide) and ORS", tr: "İshal ilacı (loperamid) ve ORS taşı" },
      { en: "Wash fruits with bottled water before eating", tr: "Meyveleri yemeden önce şişe suyla yıka" },
    ],
  },
  {
    icon: Users, title: { en: "Crowd Safety", tr: "Kalabalık Güvenliği" }, color: "text-purple-500 bg-purple-500/10",
    items: [
      { en: "Carry your emergency ID card with medications and allergies", tr: "İlaçların ve alerjilerin yazılı acil kimlik kartını taşı" },
      { en: "Use wheelchair/mobility aid if you have chronic conditions", tr: "Kronik hastalığın varsa tekerlekli sandalye/yürüme yardımcısı kullan" },
      { en: "Choose less crowded times for Tawaf if possible", tr: "Mümkünse tavaf için daha az kalabalık zamanları seç" },
      { en: "If feeling unwell in crowd: move to edges, sit down, signal for help", tr: "Kalabalıkta kendinizi kötü hissederseniz: kenarlara çekilin, oturun, yardım isteyin" },
      { en: "Know the location of medical tents and hospitals", tr: "Sağlık çadırlarının ve hastanelerin yerini bilin" },
    ],
  },
  {
    icon: MapPin, title: { en: "Chronic Conditions Checklist", tr: "Kronik Hastalık Kontrol Listesi" }, color: "text-red-500 bg-red-500/10",
    items: [
      { en: "Diabetes: blood glucose monitor, insulin cool bag, hypo kit", tr: "Diyabet: kan şekeri ölçüm cihazı, insülin soğutucu çanta, hipo kiti" },
      { en: "Heart disease: GTN spray, recent ECG copy, avoid extreme exertion", tr: "Kalp hastalığı: GTN sprey, güncel EKG kopyası, aşırı efordan kaçın" },
      { en: "Asthma/COPD: extra inhalers, face mask for dust", tr: "Astım/KOAH: ekstra inhaler, toz için maske" },
      { en: "Kidney disease: strict fluid monitoring, avoid nephrotoxic OTC drugs", tr: "Böbrek hastalığı: sıkı sıvı takibi, nefrotoksik reçetesiz ilaçlardan kaçın" },
      { en: "Elderly: fall risk awareness, walking aids, extra rest", tr: "Yaşlılar: düşme riski farkındalığı, yürüme yardımcıları, ekstra dinlenme" },
    ],
  },
]

export default function HajjHealthPage() {
  const { lang } = useLang()
  const [expanded, setExpanded] = useState<number | null>(0)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <span className="text-3xl">🕋</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{tx("hajjHealth.title", lang)}</h1>
          <p className="text-muted-foreground mt-1">{tx("hajjHealth.subtitle", lang)}</p>
        </div>

        <Card className="p-4 mb-6 border-primary/30 bg-primary/5">
          <p className="text-sm font-medium text-center">
            {"⚕️ "}{tx("hajjHealth.chronicWarning", lang)}
          </p>
        </Card>

        <div className="space-y-3">
          {TOPICS.map((topic, i) => {
            const Icon = topic.icon
            const isExpanded = expanded === i
            return (
              <Card key={i} className="overflow-hidden">
                <button className="w-full p-4 flex items-center justify-between text-left" onClick={() => setExpanded(isExpanded ? null : i)}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${topic.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-semibold">{topic.title[lang]}</span>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border pt-3">
                    <ul className="space-y-2">
                      {topic.items.map((item, j) => (
                        <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          {item[lang]}
                        </li>
                      ))}
                    </ul>
                    {topic.alert && (
                      <div className="mt-3 p-3 rounded-lg border-red-500/30 bg-red-500/5 flex gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                        <p className="text-sm text-red-600 dark:text-red-400">{topic.alert[lang]}</p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        <Card className="p-4 mt-6">
          <h3 className="font-semibold mb-3">{tx("hajjHealth.packingList", lang)}</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              { en: "All medications (2x supply)", tr: "Tüm ilaçlar (2 kat)" },
              { en: "Doctor's letter", tr: "Doktor mektubu" },
              { en: "Electrolyte packets", tr: "Elektrolit paketleri" },
              { en: "Sunscreen SPF 50+", tr: "Güneş kremi SPF 50+" },
              { en: "Face masks", tr: "Yüz maskeleri" },
              { en: "Hand sanitizer", tr: "El dezenfektanı" },
              { en: "First aid kit", tr: "İlk yardım çantası" },
              { en: "Anti-diarrheal + ORS", tr: "İshal ilacı + ORS" },
              { en: "Emergency ID card", tr: "Acil kimlik kartı" },
              { en: "Cool bag (insulin)", tr: "Soğutucu çanta (insülin)" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-muted-foreground">
                <span className="w-4 h-4 rounded border border-border flex items-center justify-center text-[10px]">☐</span>
                {item[lang]}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
