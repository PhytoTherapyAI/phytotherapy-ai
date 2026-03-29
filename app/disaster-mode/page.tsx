"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { createBrowserClient } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle, Heart, Droplets, Phone, MapPin, Shield,
  Pill, QrCode, ArrowLeft, Brain, Activity, Bone,
  ChevronDown, ChevronUp, Download, Siren
} from "lucide-react"
import Link from "next/link"

const tx: Record<string, { en: string; tr: string }> = {
  title: { en: "DISASTER HEALTH MODE", tr: "AFET SAGLIK MODU" },
  subtitle: { en: "Emergency health guide - designed for crisis situations", tr: "Acil sağlık rehberi - kriz durumlari için tasarlandi" },
  emergencyCard: { en: "Emergency ID Card", tr: "Acil Durum Kimlik Karti" },
  myMeds: { en: "My Medications", tr: "İlaçlarim" },
  noMeds: { en: "No medications on file", tr: "Kayıtli ilac yok" },
  loginForMeds: { en: "Log in to see your medications", tr: "İlaçlarınızı görmek için giriş yapın" },
  bloodType: { en: "Blood Type", tr: "Kan Grubu" },
  allergies: { en: "Allergies", tr: "Alerjiler" },
  none: { en: "None recorded", tr: "Kayıt yok" },
  emergencyNumbers: { en: "Emergency Numbers", tr: "Acil Numaralar" },
  waterSafety: { en: "Water Safety", tr: "Su Güvenligi" },
  firstAid: { en: "First Aid Basics", tr: "Ilk Yardim Temelleri" },
  crushSyndrome: { en: "Crush Syndrome Awareness", tr: "Ezilme Sendromu Farkindaligi" },
  ptsd: { en: "PTSD Early Intervention", tr: "TSSB Erken Mudahale" },
  hospital: { en: "Nearest Hospital", tr: "En Yakin Hastane" },
  earthquake: { en: "Earthquake Guide", tr: "Deprem Rehberi" },
  flood: { en: "Flood Guide", tr: "Sel Rehberi" },
  offlineReady: { en: "This page works offline", tr: "Bu sayfa cevrimdisi calisir" },
  call: { en: "CALL", tr: "ARA" },
  downloadCard: { en: "Save Emergency Card", tr: "Acil Karti Kaydet" },
  expandAll: { en: "Expand All", tr: "Tumunu Ac" },
}

interface Section {
  id: string
  titleKey: string
  icon: any
  color: string
  content: { en: string[]; tr: string[] }
}

const SECTIONS: Section[] = [
  {
    id: "water",
    titleKey: "waterSafety",
    icon: Droplets,
    color: "text-blue-500",
    content: {
      en: [
        "Do NOT drink tap water after an earthquake or flood until authorities confirm safety.",
        "Boil water for at least 1 minute (3 minutes at high altitude) before drinking.",
        "If no heat source: use 8 drops of unscented bleach per gallon, wait 30 minutes.",
        "Avoid floodwater contact - it may contain sewage, chemicals, and sharp debris.",
        "Minimum water need: 2 liters per person per day for survival.",
        "Store water in clean, sealed containers. Label with date.",
      ],
      tr: [
        "Deprem veya sel sonrasi yetkililer onay verene kadar cesme suyu ICMEYIN.",
        "Icmeden once suyu en az 1 dakika kaynatin (yüksek rakimda 3 dakika).",
        "Isi kaynagi yoksa: galon basina 8 damla kokusuz camasir suyu ekleyin, 30 dk bekleyin.",
        "Sel suyuyla temastan kacinin - kanalizasyon, kimyasal ve kesici parcalar icerebilir.",
        "Minimum su ihtiyaci: hayatta kalma için kisi basina gunluk 2 litre.",
        "Suyu temiz, kapali kaplarda saklayin. Tarih yazın.",
      ],
    },
  },
  {
    id: "firstaid",
    titleKey: "firstAid",
    icon: Heart,
    color: "text-red-500",
    content: {
      en: [
        "BLEEDING: Apply direct pressure with clean cloth. Elevate wound above heart if possible.",
        "FRACTURE: Do NOT move the person. Immobilize the limb with a splint (board, stick, rolled newspaper).",
        "BURNS: Cool with running water for 10-20 minutes. Do NOT use ice, butter, or toothpaste.",
        "SHOCK: Lay person flat, elevate legs 30cm, keep warm with blankets. Call for help.",
        "HEAD INJURY: Keep person still, monitor consciousness. If vomiting, turn to side (recovery position).",
        "BREATHING STOPPED: Tilt head back, lift chin, give 2 rescue breaths, then 30 chest compressions. Repeat.",
      ],
      tr: [
        "KANAMA: Temiz bezle doğrudan basinc uygulayin. Mumkunse yarayi kalp seviyesinin uzerine kaldirin.",
        "KIRIK: Kisiyi HAREKET ETTIRMEYIN. Uzvu atel ile sabitleyin (tahta, cubuk, gazete rulosu).",
        "YANIK: 10-20 dakika akan suyla sogutun. Buz, tereyagi veya dis macunu KULLANMAYIN.",
        "SOK: Kisiyi duz yatirin, bacaklari 30cm kaldirin, battaniyeyle sicak tutun. Yardim cairin.",
        "KAFA TRAVMASI: Kisiyi sabit tutun, bilinci izleyin. Kusma varsa yana cevirin (iyilesme pozisyonu).",
        "NEFES DURDU: Basi arkaya egin, ceneyi kaldirin, 2 kurtarma nefesi verin, 30 göğüs basisi. Tekrarlayin.",
      ],
    },
  },
  {
    id: "crush",
    titleKey: "crushSyndrome",
    icon: Activity,
    color: "text-orange-500",
    content: {
      en: [
        "CRITICAL: If someone has been trapped under rubble for 1+ hours, DO NOT just pull them out.",
        "Crush syndrome can cause fatal heart rhythm problems when pressure is suddenly released.",
        "Call professional rescue teams immediately - they have IV fluids and know the protocol.",
        "If you must free someone: give water/oral fluids BEFORE releasing the pressure if possible.",
        "After rescue: the person needs immediate hospital care with IV fluids and monitoring.",
        "Watch for: dark/brown urine, weakness, swollen limbs, irregular heartbeat after rescue.",
      ],
      tr: [
        "KRITIK: 1+ saat enkazin altinda kalan birini SADECE CEKIP CIKARMAYIN.",
        "Basinc aniden kaldirildiginda ezilme sendromu olumcul kalp ritmi sorunlarına yol acabilir.",
        "Hemen profesyonel kurtarma ekiplerini cairin - IV sivilari ve protokolu bilirler.",
        "Birini kurtarmaniz gerekiyorsa: mümkünse basinci kaldirmadan ÖNCE su/oral sivi verin.",
        "Kurtarma sonrasi: kisi IV sivi ve izleme ile acil hastane bakimina ihtiyac duyar.",
        "Dikkat edilecekler: koyu/kahverengi idrar, halsizlik, sismis uzuvlar, duzensiz kalp atisi.",
      ],
    },
  },
  {
    id: "ptsd",
    titleKey: "ptsd",
    icon: Brain,
    color: "text-purple-500",
    content: {
      en: [
        "It is NORMAL to feel fear, anxiety, and confusion after a disaster. You are not weak.",
        "Talk to someone you trust about what you experienced. Do not isolate yourself.",
        "Maintain routines as much as possible: regular meals, sleep schedule, physical activity.",
        "Limit exposure to disaster news and social media. Check updates only 2x per day.",
        "Grounding technique: Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.",
        "If symptoms persist more than 2 weeks (nightmares, flashbacks, numbness), seek professional help.",
        "Children may express trauma through play, drawing, or behavior changes. Stay patient and present.",
      ],
      tr: [
        "Afet sonrasi korku, kaygı ve kafasi karisiklik hissetmek NORMALDIR. Zayif degilsiniz.",
        "Yasadiklarinizi guvendiginiz birine anlatin. Kendinizi izole etmeyin.",
        "Rutinleri mümkün olduğunca sürdürmeye çalışın: düzenli öğünler, uyku, fiziksel aktivite.",
        "Afet haberleri ve sosyal medyaya maruziyeti sinirlayin. Güncellemeleri gunde sadece 2 kez kontrol edin.",
        "Topraklama teknigi: 5 gordugu, 4 dokundugu, 3 duydugu, 2 kokladigi, 1 tattigi sey saydir.",
        "Belirtiler 2 haftadan fazla surerse (kabuslar, flashback, uyusma) profesyonel yardim alin.",
        "Cocuklar travmayi oyun, cizim veya davranis değişiklikleriyle ifade edebilir. Sabir ve mevcudiyet.",
      ],
    },
  },
  {
    id: "earthquake",
    titleKey: "earthquake",
    icon: Activity,
    color: "text-amber-600",
    content: {
      en: [
        "DROP, COVER, HOLD ON. Get under sturdy furniture and protect your head and neck.",
        "Stay indoors until shaking stops. Most injuries happen from trying to move during shaking.",
        "After shaking: check for gas leaks (smell), turn off gas if safe. Do NOT use elevators.",
        "Stay away from damaged buildings, power lines, and coastal areas (tsunami risk).",
        "Keep shoes on at all times - broken glass and debris are everywhere.",
        "If trapped: tap on pipes or walls to signal rescuers. Use phone light sparingly.",
      ],
      tr: [
        "COK, KAPAN, TUTUN. Saglam mobilyanin altina girin, bas ve boyununuzu koruyun.",
        "Sarsinti duruncaya kadar icerde kalin. Çoğu yaralanma sarsinti sirasinda hareket etmekten olur.",
        "Sarsinti sonrasi: gaz kacagini kontrol edin (koku), güvenliyse gazi kapatin. Asansor KULLANMAYIN.",
        "Hasarli binalardan, elektrik hatlarindan ve kiyidan uzak durun (tsunami riski).",
        "Her zaman ayakkabi giyin - kirilan cam ve moloz her yerde.",
        "Sikisissaniz: kurtaricilara sinyal gondermek için borulara veya duvarlara vurun.",
      ],
    },
  },
  {
    id: "flood",
    titleKey: "flood",
    icon: Droplets,
    color: "text-cyan-500",
    content: {
      en: [
        "Move to higher ground IMMEDIATELY. Do not wait for official warnings.",
        "6 inches of moving water can knock you down. 2 feet can float a car. NEVER walk or drive through floodwater.",
        "Disconnect electricity if safe. Do not touch electrical equipment if wet.",
        "After flood: disinfect everything that touched floodwater. Throw away contaminated food.",
        "Watch for snakes and insects displaced by flooding - they seek higher ground too.",
        "Mold grows within 24-48 hours. Open windows and begin drying as soon as safe.",
      ],
      tr: [
        "DERHAL yüksek yerlere cikin. Resmi uyarıları beklemeyin.",
        "15cm akan su sizi devirebilir. 60cm su bir arabayi surukler. ASLA sel suyunda yurumein veya surmeyin.",
        "Güvenliyse elektrigi kesin. Islaksa elektrikli ekipmanlara dokunmayin.",
        "Sel sonrasi: sel suyuna dokunan her seyi dezenfekte edin. Kontamine olmus yiyecekleri atin.",
        "Sel suyu tarafindan yerinden edilen yilan ve boceklere dikkat edin.",
        "Kuf 24-48 saat icinde olusur. Güvenli olur olmaz pencereleri acin ve kurutmaya başlayin.",
      ],
    },
  },
]

const EMERGENCY_NUMBERS = [
  { name: { en: "Emergency (Turkey)", tr: "Acil Yardim (Türkiye)" }, number: "112", color: "bg-red-500" },
  { name: { en: "AFAD (Disaster)", tr: "AFAD (Afet)" }, number: "122", color: "bg-orange-500" },
  { name: { en: "Fire Department", tr: "Itfaiye" }, number: "110", color: "bg-amber-500" },
  { name: { en: "Police", tr: "Polis" }, number: "155", color: "bg-blue-500" },
  { name: { en: "Gendarmerie", tr: "Jandarma" }, number: "156", color: "bg-green-600" },
  { name: { en: "Poison Control", tr: "Zehir Danışma" }, number: "114", color: "bg-purple-500" },
]

export default function DisasterModePage() {
  const { user } = useAuth()
  const { lang } = useLang()
  const t = (key: string) => tx[key]?.[lang as "en" | "tr"] || tx[key]?.en || key

  const [userMeds, setUserMeds] = useState<string[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [allergies, setAllergies] = useState<string[]>([])
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadProfile()
  }, [user])

  const loadProfile = async () => {
    if (!user) return
    try {
      const supabase = createBrowserClient()
      const [medsRes, profileRes, allergyRes] = await Promise.all([
        supabase.from("user_medications").select("brand_name, generic_name").eq("user_id", user.id),
        supabase.from("user_profiles").select("blood_type").eq("user_id", user.id).single(),
        supabase.from("user_allergies").select("allergy_name").eq("user_id", user.id),
      ])
      setUserMeds((medsRes.data || []).map((d: any) => (d.generic_name || d.brand_name)))
      setProfile(profileRes.data)
      setAllergies((allergyRes.data || []).map((d: any) => d.allergy_name))
    } catch { /* offline fallback */ }
  }

  const toggleSection = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {}
    SECTIONS.forEach((s) => { allExpanded[s.id] = true })
    setExpanded(allExpanded)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Header - high contrast */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-red-600 dark:text-red-400 flex items-center gap-2">
              <Siren className="w-7 h-7 animate-pulse" />{t("title")}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t("subtitle")}</p>
          </div>
        </div>

        {/* Offline badge */}
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
          <Shield className="w-3 h-3 mr-1" />{t("offlineReady")}
        </Badge>

        {/* Emergency Numbers - always visible, large touch targets */}
        <Card className="p-4 space-y-3 border-red-200 dark:border-red-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Phone className="w-5 h-5 text-red-500" />{t("emergencyNumbers")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {EMERGENCY_NUMBERS.map((num) => (
              <a
                key={num.number}
                href={`tel:${num.number}`}
                className={`${num.color} text-white rounded-xl p-3 flex flex-col items-center justify-center text-center active:scale-95 transition-transform`}
              >
                <span className="text-2xl font-black">{num.number}</span>
                <span className="text-xs font-medium opacity-90">
                  {num.name[lang as "en" | "tr"] || num.name.en}
                </span>
              </a>
            ))}
          </div>
        </Card>

        {/* Emergency ID Card */}
        <Card className="p-4 space-y-3 border-2 border-dashed border-amber-400 dark:border-amber-600 bg-amber-50/50 dark:bg-amber-950/20">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-500" />{t("emergencyCard")}
          </h2>
          {user ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-400">{t("bloodType")}:</span>
                <span className="font-bold text-gray-900 dark:text-white text-lg">{profile?.blood_type || "?"}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">{t("allergies")}:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {allergies.length > 0 ? allergies.map((a, i) => (
                    <Badge key={i} variant="destructive" className="text-xs">{a}</Badge>
                  )) : <span className="text-gray-400">{t("none")}</span>}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">{t("myMeds")}:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {userMeds.length > 0 ? userMeds.map((m, i) => (
                    <Badge key={i} className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">{m}</Badge>
                  )) : <span className="text-gray-400">{t("noMeds")}</span>}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">{t("loginForMeds")}</p>
          )}
        </Card>

        {/* Expand all button */}
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={expandAll}>
            <ChevronDown className="w-4 h-4 mr-1" />{t("expandAll")}
          </Button>
        </div>

        {/* Sections - accordion style, large text for panic situations */}
        {SECTIONS.map((section) => {
          const Icon = section.icon
          const isOpen = expanded[section.id]
          const items = section.content[lang as "en" | "tr"] || section.content.en

          return (
            <Card key={section.id} className="overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-6 h-6 ${section.color} shrink-0`} />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t(section.titleKey)}
                  </h2>
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 space-y-3">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <span className="text-lg font-bold text-gray-300 dark:text-gray-600 shrink-0 w-6 text-right">
                        {idx + 1}
                      </span>
                      <p className="text-base leading-relaxed text-gray-800 dark:text-gray-200">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )
        })}

        {/* Hospital placeholder */}
        <Card className="p-4 space-y-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-500" />{t("hospital")}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {lang === "tr"
              ? "Konum izni verildikten sonra en yakin hastane bilgisi burada gorunecektir."
              : "Nearest hospital info will appear here once location permission is granted."
            }
          </p>
          <Button variant="outline" size="sm" onClick={() => {
            if (typeof window !== "undefined" && navigator.geolocation) {
              window.open("https://www.google.com/maps/search/hospital+near+me", "_blank")
            }
          }}>
            <MapPin className="w-4 h-4 mr-2" />
            {lang === "tr" ? "Google Maps'te Hastane Bul" : "Find Hospital on Google Maps"}
          </Button>
        </Card>
      </div>
    </div>
  )
}
