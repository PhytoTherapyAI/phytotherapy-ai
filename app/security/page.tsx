"use client"

import { useLang } from "@/components/layout/language-toggle"
import { Card } from "@/components/ui/card"
import { Shield, Lock, Eye, Server, FileCheck, AlertTriangle, Key, Database } from "lucide-react"

export default function SecurityPage() {
  const { lang } = useLang()
  const isTr = lang === "tr"

  const sections = [
    {
      icon: Lock,
      title: isTr ? "Veri Sifreleme" : "Data Encryption",
      desc: isTr
        ? "Tum saglik verileriniz aktarim sirasinda TLS 1.3 ve beklemede AES-256 ile sifrelenir."
        : "All health data is encrypted in transit with TLS 1.3 and at rest with AES-256 encryption.",
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      icon: Shield,
      title: isTr ? "KVKK & GDPR Uyumu" : "KVKK & GDPR Compliance",
      desc: isTr
        ? "Turkiye KVKK ve AB GDPR duzenlemelerine tam uyum. Verilerinizi indirme ve silme hakkiniz vardir."
        : "Full compliance with Turkish KVKK and EU GDPR regulations. You have the right to download and delete your data.",
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-950/20",
    },
    {
      icon: Key,
      title: isTr ? "Kimlik Dogrulama" : "Authentication",
      desc: isTr
        ? "Supabase Auth ile guvenli oturum yonetimi. Google ve Facebook OAuth, e-posta dogrulamasi desteklenir."
        : "Secure session management with Supabase Auth. Google and Facebook OAuth, email verification supported.",
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/20",
    },
    {
      icon: Server,
      title: isTr ? "Altyapi Guvenligi" : "Infrastructure Security",
      desc: isTr
        ? "Vercel uzerinde barindirma, Supabase PostgreSQL veritabani. DDoS koruması, otomatik yedekleme."
        : "Hosted on Vercel, Supabase PostgreSQL database. DDoS protection, automatic backups.",
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-950/20",
    },
    {
      icon: Eye,
      title: isTr ? "Erisim Kontrolu" : "Access Control",
      desc: isTr
        ? "Her API endpoint kimlik dogrulama gerektirir. Hiz sinirlamasi (10 istek/dakika) uygulanir."
        : "Every API endpoint requires authentication. Rate limiting (10 requests/minute) enforced.",
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-950/20",
    },
    {
      icon: Database,
      title: isTr ? "Veri Minimizasyonu" : "Data Minimization",
      desc: isTr
        ? "Yalnizca gerekli veriler toplanir. Saglik verileri sifreli kolonlarda saklanir. Maksimum 2 yil saklama."
        : "Only necessary data is collected. Health data stored in encrypted columns. Maximum 2-year retention.",
      color: "text-teal-500",
      bg: "bg-teal-50 dark:bg-teal-950/20",
    },
    {
      icon: FileCheck,
      title: isTr ? "Giris Dogrulamasi" : "Input Validation",
      desc: isTr
        ? "Tum kullanici girislerine sanitizasyon uygulanir. XSS, SQL injection ve diger OWASP tehditlerine karsi koruma."
        : "All user inputs are sanitized. Protection against XSS, SQL injection, and other OWASP threats.",
      color: "text-indigo-500",
      bg: "bg-indigo-50 dark:bg-indigo-950/20",
    },
    {
      icon: AlertTriangle,
      title: isTr ? "Hata Izleme" : "Error Monitoring",
      desc: isTr
        ? "Sentry ile gercek zamanli hata izleme ve performans takibi. Guvenlik olaylari aninda bildirilir."
        : "Real-time error monitoring and performance tracking with Sentry. Security events reported instantly.",
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-950/20",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-heading font-semibold">
            {isTr ? "Guvenlik" : "Security"}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            {isTr
              ? "Saglik verilerinizin guvenligi en buyuk onceligi\u0300mizdir. Istte bizi guclu kilan guvenlik katmanlari."
              : "The security of your health data is our top priority. Here are the security layers that keep you safe."}
          </p>
        </div>

        <div className="grid gap-4">
          {sections.map((s, i) => {
            const Icon = s.icon
            return (
              <Card key={i} className="p-5 flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{s.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                </div>
              </Card>
            )
          })}
        </div>

        <Card className="mt-8 p-6 text-center bg-primary/5 border-primary/20">
          <p className="text-sm font-medium">
            {isTr
              ? "Bir guvenlik acigi buldunuz mu? Lutfen bize bildirin."
              : "Found a security vulnerability? Please report it to us."}
          </p>
          <p className="text-xs text-muted-foreground mt-1">security@phytotherapy.ai</p>
        </Card>
      </div>
    </div>
  )
}
