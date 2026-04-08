// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { tx } from "@/lib/translations"
import {
  Package, Video, Star, Check, Crown, X, Sparkles, Heart,
  ArrowRight, Shield, Clock, Users, Loader2, Mail, Gift,
  ChevronRight, Zap,
} from "lucide-react"

// ── Fake Door Products ──
interface FakeDoorProduct {
  id: string
  name: { en: string; tr: string }
  tagline: { en: string; tr: string }
  price: { amount: number; currency: string; period: { en: string; tr: string } }
  originalPrice?: number
  icon: any
  gradient: string
  features: { en: string; tr: string }[]
  badge?: { en: string; tr: string }
  cta: { en: string; tr: string }
}

const PRODUCTS: FakeDoorProduct[] = [
  {
    id: "supplement_box",
    name: { en: "Personal Phyto Box", tr: "Kişisel Fito Kutu" },
    tagline: { en: "AI-curated monthly supplement box tailored to your health profile", tr: "Sağlık profilinize göre AI ile hazırlanan aylık takviye kutusu" },
    price: { amount: 499, currency: "₺", period: { en: "/month", tr: "/ay" } },
    originalPrice: 699,
    icon: Package,
    gradient: "from-emerald-500 to-teal-600",
    badge: { en: "Most Requested", tr: "En Çok Talep Edilen" },
    features: [
      { en: "AI selects supplements based on YOUR blood tests & medications", tr: "AI, KAN TAHLİLLERİNİZE ve ilaçlarınıza göre takviye seçer" },
      { en: "Interaction-checked: zero conflict guarantee", tr: "Etkileşim kontrollü: sıfır çakışma garantisi" },
      { en: "Pharmacy-grade, standardized extracts only", tr: "Yalnızca eczane kalitesi, standartize ekstreler" },
      { en: "Monthly dosage packs with daily sachets", tr: "Günlük poşetlerle aylık dozaj paketleri" },
      { en: "Free shipping + cancel anytime", tr: "Ücretsiz kargo + istediğin zaman iptal" },
    ],
    cta: { en: "Subscribe Now", tr: "Hemen Abone Ol" },
  },
  {
    id: "expert_consultation",
    name: { en: "Expert 1:1 Session", tr: "Uzman 1:1 Görüşme" },
    tagline: { en: "Video consultation with a verified integrative medicine specialist", tr: "Onaylı bütünleştirici tıp uzmanıyla görüntülü danışmanlık" },
    price: { amount: 349, currency: "₺", period: { en: "/session", tr: "/seans" } },
    originalPrice: 499,
    icon: Video,
    gradient: "from-violet-500 to-purple-600",
    features: [
      { en: "30-min video call with a verified specialist", tr: "Onaylı uzmanla 30 dakika görüntülü görüşme" },
      { en: "Your full health profile shared beforehand", tr: "Tam sağlık profiliniz önceden paylaşılır" },
      { en: "Personalized protocol + PDF report after session", tr: "Kişiselleştirilmiş protokol + seans sonrası PDF rapor" },
      { en: "Follow-up message support for 7 days", tr: "7 gün takip mesaj desteği" },
      { en: "Book in 48 hours — no long wait", tr: "48 saat içinde randevu — uzun bekleme yok" },
    ],
    cta: { en: "Book a Session", tr: "Seans Ayırt" },
  },
]

// ── Main Component ──
interface FakeDoorTestProps {
  productId?: string   // show specific product, or both
  lang?: string
  variant?: "card" | "banner" | "full"
}

export function FakeDoorTest({ productId, lang = "en", variant = "card" }: FakeDoorTestProps) {
  const [showModal, setShowModal] = useState(false)
  const [activeProduct, setActiveProduct] = useState<FakeDoorProduct | null>(null)
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const products = productId ? PRODUCTS.filter(p => p.id === productId) : PRODUCTS

  const handleClick = (product: FakeDoorProduct) => {
    // Track click event
    try {
      const key = `fakedoor_${product.id}`
      const data = JSON.parse(localStorage.getItem(key) || '{"clicks":0,"emails":[]}')
      data.clicks = (data.clicks || 0) + 1
      data.lastClick = new Date().toISOString()
      localStorage.setItem(key, JSON.stringify(data))
    } catch {}

    setActiveProduct(product)
    setShowModal(true)
    setSubmitted(false)
    setEmail("")
  }

  const handleSubmit = async () => {
    if (!email || !email.includes("@")) return
    setSubmitting(true)

    // Track email submission
    try {
      const key = `fakedoor_${activeProduct?.id}`
      const data = JSON.parse(localStorage.getItem(key) || '{"clicks":0,"emails":[]}')
      if (!data.emails) data.emails = []
      if (!data.emails.includes(email)) data.emails.push(email)
      data.lastSubmission = new Date().toISOString()
      localStorage.setItem(key, JSON.stringify(data))
    } catch {}

    // Simulate network delay
    await new Promise(r => setTimeout(r, 1200))
    setSubmitting(false)
    setSubmitted(true)
  }

  const t = (key: string) => {
    const map: Record<string, Record<string, string>> = {
      modal_title: { en: "You're on the VIP List!", tr: "VIP Listesinesiniz!" },
      modal_body: { en: "Thank you for your interest in this feature! To ensure the highest quality, we're currently serving a limited number of users. As capacity is full, we're adding you to our exclusive VIP waitlist. We'll notify you as soon as a spot opens up.", tr: "Bu özelliğe gösterdiğiniz ilgi için teşekkürler! En yüksek kaliteyi sağlamak adına şu an sınırlı sayıda kullanıcıya hizmet veriyoruz. Kapasitemiz dolduğu için sizi özel VIP bekleme listemize alıyoruz. Yer açıldığında size haber vereceğiz." },
      email_placeholder: { en: "Enter your email for priority access", tr: "Öncelikli erişim için e-postanızı girin" },
      join: { en: "Join VIP Waitlist", tr: "VIP Listeye Katıl" },
      joining: { en: "Adding you...", tr: "Ekleniyor..." },
      success_title: { en: "You're in!", tr: "Listedesiniz!" },
      success_body: { en: "We'll email you the moment this becomes available. As a VIP member, you'll also get an exclusive early-bird discount.", tr: "Bu özellik kullanıma açıldığında size e-posta göndereceğiz. VIP üye olarak ayrıca özel erken kuş indirimi alacaksınız." },
      close: { en: "Got it, thanks!", tr: "Anladım, teşekkürler!" },
      limited: { en: "Limited Availability", tr: "Sınırlı Kapasite" },
      save: { en: "Save", tr: "Tasarruf" },
      popular: { en: "Popular", tr: "Popüler" },
      vip_count: { en: "1,247 people on waitlist", tr: "1.247 kişi bekleme listesinde" },
    }
    return map[key]?.[lang] || key
  }

  return (
    <>
      {/* ═══ Product Cards ═══ */}
      <div className={`grid gap-4 ${products.length > 1 ? "md:grid-cols-2" : ""}`}>
        {products.map(product => {
          const Icon = product.icon
          const discount = product.originalPrice ? Math.round((1 - product.price.amount / product.originalPrice) * 100) : 0
          return (
            <Card key={product.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              {/* Gradient header */}
              <div className={`bg-gradient-to-r ${product.gradient} p-5 text-white relative overflow-hidden`}>
                {/* Decorative circles */}
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
                <div className="absolute -right-2 -bottom-4 w-16 h-16 rounded-full bg-white/5" />

                <div className="relative">
                  {product.badge && (
                    <Badge className="bg-white/20 text-white border-white/30 text-[10px] mb-3 gap-1">
                      <Star className="w-3 h-3 fill-current" />{product.badge[lang as "en" | "tr"]}
                    </Badge>
                  )}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold">{product.name[lang as "en" | "tr"]}</h3>
                  </div>
                  <p className="text-sm text-white/80">{product.tagline[lang as "en" | "tr"]}</p>
                </div>
              </div>

              <div className="p-5">
                {/* Price */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold">{product.price.currency}{product.price.amount}</span>
                  <span className="text-sm text-muted-foreground">{product.price.period[lang as "en" | "tr"]}</span>
                  {product.originalPrice && (
                    <>
                      <span className="text-sm text-muted-foreground line-through">{product.price.currency}{product.originalPrice}</span>
                      <Badge className="bg-red-500/10 text-red-600 border-red-500/30 text-[10px]">-{discount}%</Badge>
                    </>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-6">
                  {product.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{feat[lang as "en" | "tr"]}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button — THE FAKE DOOR */}
                <Button className={`w-full h-12 text-base font-semibold gap-2 bg-gradient-to-r ${product.gradient} hover:opacity-90 text-white shadow-lg`}
                  onClick={() => handleClick(product)}>
                  <Zap className="w-5 h-5" />
                  {product.cta[lang as "en" | "tr"]}
                  <ArrowRight className="w-4 h-4" />
                </Button>

                {/* Social proof */}
                <div className="flex items-center justify-center gap-1 mt-3 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  {t("vip_count")}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* ═══ VIP Waitlist Modal ═══ */}
      {showModal && activeProduct && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="max-w-md w-full p-0 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            {/* Close button */}
            <button onClick={() => setShowModal(false)}
              className="absolute right-3 top-3 z-10 p-2 rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors">
              <X className="w-4 h-4" />
            </button>

            {submitted ? (
              /* ── Success State ── */
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
                  <Heart className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-xl font-bold mb-2">{t("success_title")}</h2>
                <p className="text-sm text-muted-foreground mb-6">{t("success_body")}</p>
                <div className="flex items-center justify-center gap-2 mb-6 text-xs text-muted-foreground">
                  <Gift className="w-4 h-4 text-primary" />
                  <span>{tx("fakeDoor.earlyBird", lang as "en" | "tr")}</span>
                </div>
                <Button className="w-full" onClick={() => setShowModal(false)}>
                  {t("close")}
                </Button>
              </div>
            ) : (
              /* ── Waitlist Form ── */
              <>
                {/* Modal gradient header */}
                <div className={`bg-gradient-to-r ${activeProduct.gradient} p-6 text-white text-center relative`}>
                  <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
                  <Crown className="w-10 h-10 mx-auto mb-3 opacity-90" />
                  <h2 className="text-xl font-bold">{t("modal_title")}</h2>
                  <Badge className="bg-white/20 text-white border-white/30 text-[10px] mt-2 gap-1">
                    <Shield className="w-3 h-3" />{t("limited")}
                  </Badge>
                </div>

                <div className="p-6">
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    {t("modal_body")}
                  </p>

                  {/* Email form */}
                  <div className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder={t("email_placeholder")}
                        className="pl-10 h-12 text-base"
                        onKeyDown={e => e.key === "Enter" && handleSubmit()}
                      />
                    </div>
                    <Button className={`w-full h-12 text-base font-semibold gap-2 bg-gradient-to-r ${activeProduct.gradient} hover:opacity-90 text-white`}
                      onClick={handleSubmit} disabled={submitting || !email.includes("@")}>
                      {submitting ? (
                        <><Loader2 className="w-5 h-5 animate-spin" />{t("joining")}</>
                      ) : (
                        <><Sparkles className="w-5 h-5" />{t("join")}</>
                      )}
                    </Button>
                  </div>

                  {/* Trust signals */}
                  <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Shield className="w-3 h-3" />{tx("fakeDoor.noSpam", lang as "en" | "tr")}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{tx("fakeDoor.comingSoon", lang as "en" | "tr")}</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3" />{tx("fakeDoor.vipPriority", lang as "en" | "tr")}</span>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </>
  )
}
