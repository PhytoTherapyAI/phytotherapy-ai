// © 2026 Phytotherapy.ai — All Rights Reserved
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PROVIDERS, METRIC_CONFIG, CONSENT_TEXT, type IntegrationProvider, type ConnectionStatus, type ProviderConfig } from "@/lib/health-integrations"
import {
  Smartphone, Wifi, WifiOff, RefreshCw, Check, X, Shield, Lock,
  ArrowLeft, ChevronRight, AlertTriangle, Clock, Trash2, Loader2,
  Heart, Footprints, Moon, Droplets, Activity, Zap, Thermometer,
  Scale, Flame, BarChart3, Wind, Gauge, ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { tx } from "@/lib/translations"

const METRIC_ICONS: Record<string, any> = { Heart, Footprints, Moon, Droplets, Activity, Zap, Thermometer, Scale, Flame, BarChart3, Wind, Gauge }

interface DeviceConnection {
  provider: IntegrationProvider
  status: ConnectionStatus
  connectedAt: string
  lastSync: string
  records: number
}

export default function ConnectedDevicesPage() {
  const { user } = useAuth()
  const { lang } = useLang()
  const [connections, setConnections] = useState<Record<string, DeviceConnection>>({})
  const [consentModal, setConsentModal] = useState<ProviderConfig | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [syncing, setSyncing] = useState<string | null>(null)

  useEffect(() => {
    const data = localStorage.getItem(`health_connections_${user?.id || "guest"}`)
    if (data) setConnections(JSON.parse(data))
  }, [user])

  const saveConnections = (updated: Record<string, DeviceConnection>) => {
    setConnections(updated)
    localStorage.setItem(`health_connections_${user?.id || "guest"}`, JSON.stringify(updated))
  }

  const handleConnect = async (provider: ProviderConfig) => {
    setConnecting(true)
    // Simulate OAuth flow
    await new Promise(r => setTimeout(r, 1500))
    const updated = { ...connections }
    updated[provider.id] = {
      provider: provider.id,
      status: "connected",
      connectedAt: new Date().toISOString(),
      lastSync: new Date().toISOString(),
      records: Math.floor(Math.random() * 500) + 100,
    }
    saveConnections(updated)
    setConsentModal(null)
    setConnecting(false)
  }

  const handleDisconnect = (providerId: string) => {
    const updated = { ...connections }
    delete updated[providerId]
    saveConnections(updated)
  }

  const handleSync = async (providerId: string) => {
    setSyncing(providerId)
    await new Promise(r => setTimeout(r, 2000))
    const updated = { ...connections }
    if (updated[providerId]) {
      updated[providerId].lastSync = new Date().toISOString()
      updated[providerId].records += Math.floor(Math.random() * 50) + 10
    }
    saveConnections(updated)
    setSyncing(null)
  }

  const connectedCount = Object.keys(connections).length
  const totalRecords = Object.values(connections).reduce((sum, c) => sum + c.records, 0)

  const t = (key: string) => {
    const map: Record<string, Record<string, string>> = {
      title: { en: "Connected Devices & Apps", tr: "Bağlı Cihazlar & Uygulamalar" },
      subtitle: { en: "Sync health data from your wearables and health apps", tr: "Giyilebilir cihaz ve sağlık uygulamalarınızdan veri senkronize edin" },
      connected: { en: "Connected", tr: "Bağlı" },
      disconnected: { en: "Not Connected", tr: "Bağlı Değil" },
      connect: { en: "Connect", tr: "Bağla" },
      disconnect: { en: "Disconnect", tr: "Bağlantıyı Kes" },
      sync_now: { en: "Sync Now", tr: "Şimdi Senkronize Et" },
      syncing: { en: "Syncing...", tr: "Senkronize ediliyor..." },
      last_sync: { en: "Last sync", tr: "Son senkronizasyon" },
      records: { en: "records synced", tr: "kayıt senkronize edildi" },
      coming_soon: { en: "Coming Soon", tr: "Yakında" },
      devices: { en: "devices connected", tr: "cihaz bağlı" },
      data_points: { en: "data points", tr: "veri noktası" },
      supported_data: { en: "Supported data types", tr: "Desteklenen veri türleri" },
      privacy: { en: "Your health data is encrypted and never shared with third parties.", tr: "Sağlık verileriniz şifrelenir ve asla üçüncü taraflarla paylaşılmaz." },
    }
    return map[key]?.[lang] || key
  }

  const consent = CONSENT_TEXT[lang as "en" | "tr"]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
        <Link href="/profile" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />{tx("common.profile", lang)}
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Smartphone className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>

        {/* Stats */}
        {connectedCount > 0 && (
          <div className="flex justify-center gap-6 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{connectedCount}</p>
              <p className="text-xs text-muted-foreground">{t("devices")}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{totalRecords.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{t("data_points")}</p>
            </div>
          </div>
        )}

        {/* Provider List */}
        <div className="space-y-3">
          {PROVIDERS.map(provider => {
            const conn = connections[provider.id]
            const isConnected = !!conn
            const isSyncing = syncing === provider.id

            return (
              <Card key={provider.id} className={`overflow-hidden transition-all ${isConnected ? "border-green-500/30" : ""} ${!provider.available ? "opacity-60" : ""}`}>
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Logo */}
                    <div className={`w-12 h-12 rounded-xl ${provider.bgLight} ${provider.bgDark} flex items-center justify-center text-2xl shrink-0`}>
                      {provider.logo}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{provider.name}</h3>
                        {isConnected && (
                          <Badge className="bg-green-500/10 text-green-600 border-green-500/30 text-[10px] gap-0.5">
                            <Wifi className="w-2.5 h-2.5" />{t("connected")}
                          </Badge>
                        )}
                        {!provider.available && (
                          <Badge variant="outline" className="text-[10px]">{t("coming_soon")}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {provider.description[lang as "en" | "tr"]}
                      </p>
                      {isConnected && conn && (
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {t("last_sync")}: {new Date(conn.lastSync).toLocaleDateString(tx("common.locale", lang))}
                          </span>
                          <span>{conn.records} {t("records")}</span>
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    <div className="shrink-0">
                      {isConnected ? (
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline" className="h-8 gap-1" disabled={isSyncing}
                            onClick={() => handleSync(provider.id)}>
                            {isSyncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 text-red-500 hover:bg-red-500/10"
                            onClick={() => handleDisconnect(provider.id)}>
                            <WifiOff className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" disabled={!provider.available}
                          onClick={() => setConsentModal(provider)} className="h-8 gap-1">
                          {t("connect")} <ChevronRight className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Supported metrics (when connected) */}
                  {isConnected && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-[10px] text-muted-foreground mb-1.5">{t("supported_data")}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {provider.supportedMetrics.map(metric => {
                          const config = METRIC_CONFIG[metric]
                          return (
                            <span key={metric} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]"
                              style={{ backgroundColor: `${config.color}10`, color: config.color }}>
                              {config.label[lang as "en" | "tr"]}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>

        {/* Privacy note */}
        <Card className="p-4 mt-6 border-primary/20 bg-primary/5">
          <div className="flex gap-2">
            <Lock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">{t("privacy")}</p>
          </div>
        </Card>
      </div>

      {/* ═══ CONSENT MODAL ═══ */}
      {consentModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl ${consentModal.bgLight} ${consentModal.bgDark} flex items-center justify-center text-xl`}>
                {consentModal.logo}
              </div>
              <div>
                <h2 className="font-bold">{consentModal.name}</h2>
                <p className="text-xs text-muted-foreground">{consent.title}</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4">{consent.body}</p>

            {/* Data types */}
            <div className="mb-4">
              <p className="text-xs font-medium mb-2">{consent.dataTypes}</p>
              <div className="flex flex-wrap gap-1.5">
                {consentModal.supportedMetrics.map(metric => {
                  const config = METRIC_CONFIG[metric]
                  return (
                    <Badge key={metric} variant="outline" className="text-[10px] gap-1">
                      <Check className="w-2.5 h-2.5 text-green-500" />
                      {config.label[lang as "en" | "tr"]}
                    </Badge>
                  )
                })}
              </div>
            </div>

            {/* Security info */}
            <div className="space-y-2 mb-6 p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground">
              <div className="flex gap-2"><Lock className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />{consent.storage}</div>
              <div className="flex gap-2"><RefreshCw className="w-3 h-3 text-blue-500 shrink-0 mt-0.5" />{consent.revoke}</div>
              <div className="flex gap-2"><Shield className="w-3 h-3 text-primary shrink-0 mt-0.5" />{consent.kvkk}</div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConsentModal(null)} disabled={connecting}>
                {consent.cancel}
              </Button>
              <Button className="flex-1 gap-2" onClick={() => handleConnect(consentModal)} disabled={connecting}
                style={{ backgroundColor: consentModal.color }}>
                {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {connecting ? tx("common.connecting", lang) : consent.agree}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
