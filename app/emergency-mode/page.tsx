// © 2026 Phytotherapy.ai — All Rights Reserved
"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import {
  Phone,
  Heart,
  Pill,
  AlertTriangle,
  Wind,
  Share2,
  Copy,
  Check,
  QrCode,
  User,
  Droplets,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface CachedProfile {
  full_name: string | null
  blood_group: string | null
  birth_date: string | null
  gender: string | null
  chronic_conditions: string[]
  phone: string | null
}

interface CachedMedication {
  brand_name: string | null
  generic_name: string | null
  dosage: string | null
}

interface CachedAllergy {
  allergen: string
  severity: string
}

const CACHE_KEY = "phyto_emergency_cache"

export default function EmergencyModePage() {
  const router = useRouter()
  const { user, profile, isAuthenticated } = useAuth()
  const { lang } = useLang()

  const [cachedProfile, setCachedProfile] = useState<CachedProfile | null>(null)
  const [medications, setMedications] = useState<CachedMedication[]>([])
  const [allergies, setAllergies] = useState<CachedAllergy[]>([])
  const [emergencyContact, setEmergencyContact] = useState({ name: "", phone: "" })
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)

  // Load from localStorage cache first (works without auth)
  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const data = JSON.parse(cached)
        setCachedProfile(data.profile || null)
        setMedications(data.medications || [])
        setAllergies(data.allergies || [])
        setEmergencyContact(data.emergencyContact || { name: "", phone: "" })
      }
    } catch { /* ignore parse errors */ }
  }, [])

  // If authenticated, fetch fresh data and update cache
  const fetchAndCache = useCallback(async () => {
    if (!user) return
    const supabase = createBrowserClient()

    const [{ data: meds }, { data: allrg }] = await Promise.all([
      supabase.from("user_medications").select("brand_name, generic_name, dosage").eq("user_id", user.id).eq("is_active", true),
      supabase.from("user_allergies").select("allergen, severity").eq("user_id", user.id),
    ])

    const prof: CachedProfile = {
      full_name: profile?.full_name ?? null,
      blood_group: profile?.blood_group ?? null,
      birth_date: profile?.birth_date ?? null,
      gender: profile?.gender ?? null,
      chronic_conditions: profile?.chronic_conditions ?? [],
      phone: profile?.phone ?? null,
    }

    setCachedProfile(prof)
    setMedications(meds || [])
    setAllergies(allrg || [])

    // Persist to localStorage for offline access
    try {
      const existing = localStorage.getItem(CACHE_KEY)
      const existingData = existing ? JSON.parse(existing) : {}
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        profile: prof,
        medications: meds || [],
        allergies: allrg || [],
        emergencyContact: existingData.emergencyContact || { name: "", phone: "" },
        updatedAt: new Date().toISOString(),
      }))
    } catch { /* storage full */ }
  }, [user, profile])

  useEffect(() => {
    if (isAuthenticated && profile) fetchAndCache()
  }, [isAuthenticated, profile, fetchAndCache])

  // Save emergency contact to cache
  const saveContact = (name: string, phone: string) => {
    const contact = { name, phone }
    setEmergencyContact(contact)
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      const data = cached ? JSON.parse(cached) : {}
      data.emergencyContact = contact
      localStorage.setItem(CACHE_KEY, JSON.stringify(data))
    } catch { /* ignore */ }
  }

  const buildInfoText = () => {
    const lines: string[] = []
    lines.push("=== EMERGENCY MEDICAL INFO ===")
    if (cachedProfile?.full_name) lines.push(`Name: ${cachedProfile.full_name}`)
    if (cachedProfile?.blood_group) lines.push(`Blood Type: ${cachedProfile.blood_group}`)
    if (cachedProfile?.birth_date) lines.push(`DOB: ${cachedProfile.birth_date}`)
    if (allergies.length > 0) {
      lines.push(`ALLERGIES: ${allergies.map(a => `${a.allergen} (${a.severity})`).join(", ")}`)
    }
    if (medications.length > 0) {
      lines.push(`MEDICATIONS: ${medications.map(m => m.brand_name || m.generic_name || "?").join(", ")}`)
    }
    if (cachedProfile?.chronic_conditions?.length) {
      lines.push(`CONDITIONS: ${cachedProfile.chronic_conditions.join(", ")}`)
    }
    if (emergencyContact.name) {
      lines.push(`EMERGENCY CONTACT: ${emergencyContact.name} ${emergencyContact.phone}`)
    }
    return lines.join("\n")
  }

  const handleShare = async () => {
    const text = buildInfoText()
    if (navigator.share) {
      try {
        await navigator.share({ title: "Emergency Medical Info", text })
        return
      } catch { /* user cancelled or not supported */ }
    }
    // Fallback to clipboard
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const qrData = encodeURIComponent(buildInfoText())
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qrData}`

  return (
    <div className="min-h-screen bg-red-600 dark:bg-red-950 text-white">
      {/* CALL 112 BUTTON */}
      <div className="sticky top-0 z-50 bg-red-700 dark:bg-red-900 shadow-lg">
        <a
          href="tel:112"
          className="flex items-center justify-center gap-3 py-5 text-white font-bold text-2xl tracking-wide active:bg-red-800 transition-colors"
        >
          <Phone className="h-8 w-8 animate-pulse" />
          {tx("emergencyMode.call112", lang)}
        </a>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Critical Info Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 text-gray-900 dark:text-white shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-bold">{tx("emergencyMode.criticalInfo", lang)}</h2>
          </div>

          {/* Name */}
          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100 dark:border-gray-800">
            <User className="h-5 w-5 text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{tx("emergencyMode.name", lang)}</p>
              <p className="text-xl font-bold">{cachedProfile?.full_name || tx("emergencyMode.notSet", lang)}</p>
            </div>
          </div>

          {/* Blood Type */}
          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100 dark:border-gray-800">
            <Droplets className="h-5 w-5 text-red-500 shrink-0" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{tx("emergencyMode.bloodType", lang)}</p>
              <p className="text-3xl font-black text-red-600 dark:text-red-400">
                {cachedProfile?.blood_group || "?"}
              </p>
            </div>
          </div>

          {/* Allergies */}
          <div className="mb-3 pb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
              <p className="text-xs font-semibold uppercase text-amber-600 dark:text-amber-400">
                {tx("emergencyMode.allergies", lang)}
              </p>
            </div>
            {allergies.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {allergies.map((a, i) => (
                  <span key={i} className="text-sm px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-medium">
                    {a.allergen} {a.severity === "severe" || a.severity === "anaphylaxis" ? " (!)" : ""}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">{tx("emergencyMode.noneRecorded", lang)}</p>
            )}
          </div>

          {/* Medications */}
          <div className="mb-3 pb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <Pill className="h-5 w-5 text-blue-500 shrink-0" />
              <p className="text-xs font-semibold uppercase text-blue-600 dark:text-blue-400">
                {tx("emergencyMode.medications", lang)}
              </p>
            </div>
            {medications.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {medications.map((m, i) => (
                  <span key={i} className="text-sm px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-medium">
                    {m.brand_name || m.generic_name} {m.dosage ? `(${m.dosage})` : ""}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">{tx("emergencyMode.noneRecorded", lang)}</p>
            )}
          </div>

          {/* Chronic Conditions */}
          {(cachedProfile?.chronic_conditions?.length ?? 0) > 0 && (
            <div className="mb-3 pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-5 w-5 text-purple-500 shrink-0" />
                <p className="text-xs font-semibold uppercase text-purple-600 dark:text-purple-400">
                  {tx("emergencyMode.conditions", lang)}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {cachedProfile!.chronic_conditions.map((c, i) => (
                  <span key={i} className="text-sm px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-medium">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Emergency Contact */}
          <div className="mb-1">
            <p className="text-xs font-semibold uppercase text-red-600 dark:text-red-400 mb-2">
              {tx("emergencyMode.emergencyContact", lang)}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={emergencyContact.name}
                onChange={(e) => saveContact(e.target.value, emergencyContact.phone)}
                placeholder={tx("emergencyMode.contactName", lang)}
                className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="tel"
                value={emergencyContact.phone}
                onChange={(e) => saveContact(emergencyContact.name, e.target.value)}
                placeholder={tx("emergencyMode.contactPhone", lang)}
                className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => router.push("/breathing-exercises")}
            className="h-16 bg-white/20 hover:bg-white/30 text-white border-2 border-white/40 rounded-2xl text-base font-semibold gap-2"
          >
            <Wind className="h-5 w-5" />
            {tx("emergencyMode.panicMode", lang)}
          </Button>
          <Button
            onClick={handleShare}
            className="h-16 bg-white/20 hover:bg-white/30 text-white border-2 border-white/40 rounded-2xl text-base font-semibold gap-2"
          >
            {copied ? <Check className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
            {copied ? tx("emergencyMode.copied", lang) : tx("emergencyMode.share", lang)}
          </Button>
        </div>

        {/* QR Code */}
        <div className="text-center">
          <Button
            onClick={() => setShowQR(!showQR)}
            variant="ghost"
            className="text-white/80 hover:text-white hover:bg-white/10 gap-2"
          >
            <QrCode className="h-5 w-5" />
            {tx("emergencyMode.showQR", lang)}
          </Button>
          {showQR && (
            <div className="mt-3 inline-block bg-white rounded-2xl p-4 shadow-xl">
              <img src={qrUrl} alt="Emergency QR" className="w-48 h-48 mx-auto" />
              <p className="text-xs text-gray-500 mt-2">{tx("emergencyMode.qrHint", lang)}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-white/60 text-xs pb-4">
          {tx("emergencyMode.footer", lang)}
        </p>
      </div>
    </div>
  )
}
