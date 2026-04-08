// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { CHANNEL_CONFIG } from "@/lib/bot-channels"
import {
  MessageCircle, Send, Smartphone, Check, ChevronRight, Clock,
  Bell, Shield, Pause, Play, Trash2, QrCode, ArrowLeft, Loader2,
  Zap, Heart, Star, ExternalLink,
} from "lucide-react"
import Link from "next/link"

type SetupPhase = "select" | "whatsapp-setup" | "telegram-setup" | "verify" | "connected"

export default function ConnectAssistantPage() {
  const { user } = useAuth()
  const { lang } = useLang()
  const [phase, setPhase] = useState<SetupPhase>("select")
  const [selectedChannel, setSelectedChannel] = useState<"whatsapp" | "telegram" | null>(null)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [verifyCode, setVerifyCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [sendTime, setSendTime] = useState("09:00")
  const [isConnected, setIsConnected] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  // Load saved connection from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`bot_connection_${user?.id || "guest"}`)
      if (saved) {
        const data = JSON.parse(saved)
        setIsConnected(true)
        setSelectedChannel(data.channel)
        setPhoneNumber(data.channelId || "")
        setSendTime(data.sendTime || "09:00")
        setIsPaused(data.status === "paused")
        setPhase("connected")
      }
    } catch { /* corrupted localStorage */ }
  }, [user])

  const t = (key: string) => {
    const map: Record<string, Record<string, string>> = {
      title: { en: "Connect Daily Assistant", tr: "Günlük Asistanı Bağla" },
      subtitle: { en: "Receive your personalized health plan every morning", tr: "Her sabah kişiselleştirilmiş sağlık planınızı alın" },
      select_channel: { en: "Choose your preferred channel", tr: "Tercih ettiğiniz kanalı seçin" },
      whatsapp: { en: "WhatsApp", tr: "WhatsApp" },
      telegram: { en: "Telegram", tr: "Telegram" },
      phone_label: { en: "WhatsApp Phone Number", tr: "WhatsApp Telefon Numarası" },
      phone_ph: { en: "+90 5XX XXX XX XX", tr: "+90 5XX XXX XX XX" },
      send_code: { en: "Send Verification Code", tr: "Doğrulama Kodu Gönder" },
      enter_code: { en: "Enter the 6-digit code sent to your WhatsApp", tr: "WhatsApp'ınıza gönderilen 6 haneli kodu girin" },
      verify: { en: "Verify & Connect", tr: "Doğrula ve Bağla" },
      verifying: { en: "Verifying...", tr: "Doğrulanıyor..." },
      connected_title: { en: "Assistant Connected!", tr: "Asistan Bağlandı!" },
      connected_msg: { en: "You'll receive your daily health plan every morning.", tr: "Her sabah günlük sağlık planınızı alacaksınız." },
      send_time: { en: "Daily send time", tr: "Günlük gönderim saati" },
      pause: { en: "Pause Messages", tr: "Mesajları Duraklat" },
      resume: { en: "Resume Messages", tr: "Mesajları Sürdür" },
      disconnect: { en: "Disconnect", tr: "Bağlantıyı Kes" },
      paused_badge: { en: "Paused", tr: "Duraklatıldı" },
      active_badge: { en: "Active", tr: "Aktif" },
      features: { en: "What you'll get", tr: "Neler alacaksınız" },
      feature_1: { en: "Personalized daily health tasks based on your profile", tr: "Profilinize dayalı kişiselleştirilmiş günlük sağlık görevleri" },
      feature_2: { en: "Medication & supplement reminders at the right time", tr: "Doğru zamanda ilaç ve takviye hatırlatıcıları" },
      feature_3: { en: "Reply to mark tasks as complete — tracked in your dashboard", tr: "Görevleri tamamlamak için yanıtlayın — panelinizde takip edilir" },
      feature_4: { en: "Pause or disconnect anytime — your data stays safe", tr: "İstediğiniz zaman duraklatın veya bağlantıyı kesin — verileriniz güvende" },
      security: { en: "End-to-end encrypted. We never share your number.", tr: "Uçtan uca şifreli. Numaranızı asla paylaşmayız." },
      tg_step1: { en: "Open Telegram", tr: "Telegram'ı Açın" },
      tg_open: { en: "Open @DoctopalBot", tr: "@DoctopalBot'u Açın" },
      tg_or_scan: { en: "Or scan this QR code", tr: "Veya bu QR kodu okutun" },
      tg_waiting: { en: "Waiting for you to start the bot...", tr: "Botu başlatmanızı bekliyoruz..." },
      back: { en: "Back", tr: "Geri" },
    }
    return map[key]?.[lang] || key
  }

  const handleWhatsAppVerify = async () => {
    setIsVerifying(true)
    // Simulate verification
    await new Promise(r => setTimeout(r, 2000))
    setIsConnected(true)
    setPhase("connected")
    localStorage.setItem(`bot_connection_${user?.id || "guest"}`, JSON.stringify({
      channel: "whatsapp", channelId: phoneNumber, sendTime, status: "active", connectedAt: new Date().toISOString(),
    }))
    setIsVerifying(false)
  }

  const handleTelegramConnect = async () => {
    setIsVerifying(true)
    await new Promise(r => setTimeout(r, 2000))
    setIsConnected(true)
    setPhase("connected")
    localStorage.setItem(`bot_connection_${user?.id || "guest"}`, JSON.stringify({
      channel: "telegram", channelId: "tg-" + Date.now(), sendTime, status: "active", connectedAt: new Date().toISOString(),
    }))
    setIsVerifying(false)
  }

  const handleDisconnect = () => {
    localStorage.removeItem(`bot_connection_${user?.id || "guest"}`)
    setIsConnected(false)
    setSelectedChannel(null)
    setPhase("select")
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
    try {
      const saved = JSON.parse(localStorage.getItem(`bot_connection_${user?.id || "guest"}`) || "{}")
      saved.status = isPaused ? "active" : "paused"
      localStorage.setItem(`bot_connection_${user?.id || "guest"}`, JSON.stringify(saved))
    } catch { /* corrupted localStorage */ }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 md:px-8 py-8">
        <Link href="/notification-preferences" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />{t("back")}
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-blue-500/20 mb-4">
            <Bell className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>

        {/* ═══ CONNECTED STATE ═══ */}
        {phase === "connected" && (
          <div className="space-y-4">
            <Card className="p-6 border-green-500/30 bg-green-500/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: selectedChannel === "whatsapp" ? "#25D36620" : "#0088CC20" }}>
                  {selectedChannel === "whatsapp" ? <MessageCircle className="w-6 h-6 text-green-500" /> : <Send className="w-6 h-6 text-blue-500" />}
                </div>
                <div>
                  <h3 className="font-semibold">{t("connected_title")}</h3>
                  <p className="text-sm text-muted-foreground">{t("connected_msg")}</p>
                </div>
                <Badge className={isPaused ? "bg-amber-500/10 text-amber-600" : "bg-green-500/10 text-green-600"}>
                  {isPaused ? t("paused_badge") : t("active_badge")}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{t("send_time")}</span>
                  </div>
                  <Input type="time" value={sendTime} onChange={e => setSendTime(e.target.value)} className="w-28 h-8 text-sm" />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 gap-2" onClick={togglePause}>
                    {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    {isPaused ? t("resume") : t("pause")}
                  </Button>
                  <Button variant="outline" className="gap-2 text-red-500 hover:text-red-600" onClick={handleDisconnect}>
                    <Trash2 className="w-4 h-4" />{t("disconnect")}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ═══ CHANNEL SELECT ═══ */}
        {phase === "select" && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-center text-muted-foreground">{t("select_channel")}</p>

            {/* WhatsApp Card */}
            <button onClick={() => { setSelectedChannel("whatsapp"); setPhase("whatsapp-setup") }}
              className="w-full text-left">
              <Card className="p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-l-4"
                style={{ borderLeftColor: "#25D366" }}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                    <MessageCircle className="w-7 h-7 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">WhatsApp</h3>
                    <p className="text-sm text-muted-foreground">
                      {CHANNEL_CONFIG.whatsapp.description[lang as "en" | "tr"]}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Card>
            </button>

            {/* Telegram Card */}
            <button onClick={() => { setSelectedChannel("telegram"); setPhase("telegram-setup") }}
              className="w-full text-left">
              <Card className="p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-l-4"
                style={{ borderLeftColor: "#0088CC" }}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                    <Send className="w-7 h-7 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Telegram</h3>
                    <p className="text-sm text-muted-foreground">
                      {CHANNEL_CONFIG.telegram.description[lang as "en" | "tr"]}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Card>
            </button>

            {/* Features */}
            <Card className="p-5 mt-6">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />{t("features")}
              </h3>
              <ul className="space-y-2.5">
                {["feature_1", "feature_2", "feature_3", "feature_4"].map(key => (
                  <li key={key} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />{t(key)}
                  </li>
                ))}
              </ul>
            </Card>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-3 h-3" />{t("security")}
            </div>
          </div>
        )}

        {/* ═══ WHATSAPP SETUP ═══ */}
        {phase === "whatsapp-setup" && (
          <div className="space-y-5">
            <button onClick={() => setPhase("select")} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />{t("back")}
            </button>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-green-500" />
                </div>
                <h2 className="font-semibold text-lg">WhatsApp</h2>
              </div>

              {/* Steps */}
              <div className="space-y-3 mb-6">
                {CHANNEL_CONFIG.whatsapp.setupSteps[lang as "en" | "tr"].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-green-500/10 text-green-600 text-xs flex items-center justify-center font-medium shrink-0">{i + 1}</span>
                    <span className="text-sm text-muted-foreground">{step}</span>
                  </div>
                ))}
              </div>

              {/* Phone input */}
              <div className="space-y-3">
                <label className="text-sm font-medium">{t("phone_label")}</label>
                <div className="flex gap-2">
                  <Smartphone className="w-5 h-5 text-muted-foreground mt-2.5" />
                  <Input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}
                    placeholder={t("phone_ph")} type="tel" className="flex-1 h-12 text-lg font-mono" />
                </div>
              </div>

              {/* Send time */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="w-4 h-4" />{t("send_time")}
                </span>
                <Input type="time" value={sendTime} onChange={e => setSendTime(e.target.value)} className="w-28 h-8 text-sm" />
              </div>

              <Button className="w-full mt-6 h-12 text-base bg-green-600 hover:bg-green-700"
                disabled={phoneNumber.length < 10 || isVerifying} onClick={handleWhatsAppVerify}>
                {isVerifying ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />{t("verifying")}</> : <><Check className="w-5 h-5 mr-2" />{t("verify")}</>}
              </Button>
            </Card>
          </div>
        )}

        {/* ═══ TELEGRAM SETUP ═══ */}
        {phase === "telegram-setup" && (
          <div className="space-y-5">
            <button onClick={() => setPhase("select")} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />{t("back")}
            </button>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                  <Send className="w-5 h-5 text-blue-500" />
                </div>
                <h2 className="font-semibold text-lg">Telegram</h2>
              </div>

              {/* Steps */}
              <div className="space-y-3 mb-6">
                {CHANNEL_CONFIG.telegram.setupSteps[lang as "en" | "tr"].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 text-xs flex items-center justify-center font-medium shrink-0">{i + 1}</span>
                    <span className="text-sm text-muted-foreground">{step}</span>
                  </div>
                ))}
              </div>

              {/* Bot link */}
              <div className="text-center space-y-4">
                <a href="https://t.me/DoctopalBot" target="_blank" rel="noopener noreferrer">
                  <Button className="gap-2 bg-blue-500 hover:bg-blue-600 text-white">
                    <Send className="w-4 h-4" />{t("tg_open")} <ExternalLink className="w-3 h-3" />
                  </Button>
                </a>

                <p className="text-xs text-muted-foreground">{t("tg_or_scan")}</p>
                <div className="inline-block p-3 bg-white rounded-xl">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://t.me/DoctopalBot`}
                    alt="Telegram QR" className="w-36 h-36" />
                </div>
              </div>

              {/* Send time */}
              <div className="mt-6 flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="w-4 h-4" />{t("send_time")}
                </span>
                <Input type="time" value={sendTime} onChange={e => setSendTime(e.target.value)} className="w-28 h-8 text-sm" />
              </div>

              <Button className="w-full mt-4 h-12 bg-blue-500 hover:bg-blue-600"
                disabled={isVerifying} onClick={handleTelegramConnect}>
                {isVerifying ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />{t("tg_waiting")}</> : <><Check className="w-5 h-5 mr-2" />{t("verify")}</>}
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
