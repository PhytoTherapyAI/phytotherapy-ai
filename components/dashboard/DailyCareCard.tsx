// © 2026 DoctoPal — All Rights Reserved
"use client"

// Session 44 Faz 4: aggressive rewrite per the diagnostic.
//
// The previous DailyCareCard was an AI-generated motivational layer
// (Claude API call → 8 categorized "do this today" cards → ticking
// them only set localStorage). That looked identical to the dashboard
// task list above but ticks didn't reach daily_logs, so:
//
//   - the "GÜNLÜK HALKALAR" ring widget never updated when users ticked
//     a "supplement" card here,
//   - users believed they were tracking real supplement adherence when
//     they were only marking a motivational suggestion as read,
//   - cross-device / cross-tab sync was impossible (localStorage only),
//   - aile profil switch'te eski user'ın completion'ı diğer user'a
//     sızabiliyordu (cache key user-scoped olmasına rağmen
//     completed-cards key'i değildi — global today-string).
//
// The agressif refactor binds this card to the user's ACTUAL daily
// supplements (calendar_events.event_type='supplement', recurrence
// 'daily') and routes completion through DailyLogsContext. Now ticking
// here is the same operation as ticking the supplement task in the
// dashboard list or the calendar TimeBlock — single source of truth.
//
// AI-generated content is reduced to a single rotating tip (no Claude
// call — local rotation by day-of-year) so the user still gets a
// readable motivational nudge but never confuses it with completion.

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { useActiveProfile } from "@/lib/use-active-profile"
import { useLang } from "@/components/layout/language-toggle"
import { useDailyLogs } from "@/lib/daily-logs-context"
import { tx } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import { getSupplementDisplayName } from "@/lib/supplement-data"
import { Sparkles, Check, Lightbulb } from "lucide-react"

interface SupplementItem {
  id: string  // calendar_events.id
  name: string
  dose?: string
}

// Local rotating tips. Picked by day-of-year so the same tip shows the
// whole day; rolls over at midnight. No AI call, no API trip — the old
// /api/daily-care-plan endpoint is no longer consumed from the dashboard.
const DAILY_TIPS: Record<"tr" | "en", string[]> = {
  tr: [
    "Su, vücudunun en sevdiği şey. Bugün bir bardak fazla iç. 💧",
    "Probiyotikler aç karna en iyi emilir. Sabah kahvaltıdan önce dene. 🌿",
    "D vitamini yağda çözünür — yağlı bir öğünle al, emilim artar. ☀️",
    "Magnezyumu akşam al; uykunu derinleştirir. 🌙",
    "Demir takviyesi C vitaminiyle birlikte iki kat daha iyi emilir. 🍊",
    "Omega-3'ü yemekle al — boş mideye balık tadı bırakır. 🐟",
    "Çinkoyu süt veya kalsiyumla birlikte alma; emilim çakışır. 🥛",
    "Kalsiyumu ikiye böl — vücut tek seferde 500mg'dan fazlasını işleyemez. 🦴",
    "B vitaminleri sabahları alındığında enerji eğrisi daha düz olur. ☀️",
    "Probiyotikten en az 2 saat sonra kahve iç; canlı kültürler ısıdan etkilenir. ☕",
    "Multivitamini her gün aynı saatte al — alışkanlık unutmayı öldürür. ⏰",
    "Yeşil çay ile demir alma; tanenler emilimi azaltır. 🍵",
    "Kreatini sürekli al, döngüye sokma — etki birikimsel. 💪",
    "Aşırı C vitamini ishale yol açabilir; günlük 2000mg üst sınır. 🍋",
    "Selenyumda 'çok' iyi değildir; günde 200mcg yeter. ⚖️",
    "Bitkisel takviyelerin etkisi 2-4 hafta sonra belirginleşir; sabırlı ol. 🌱",
    "Bromelain (ananas enzimi) protein sindirimini destekler — yemekle al. 🍍",
    "Kollajeni C vitaminiyle al; vücut sentezi için ikisine birden ihtiyaç duyar. ✨",
    "Berberin yemekten 30 dk önce — kan şekeri tepesini düzler. 🌾",
    "Aşwagandha akşam — kortizolü düşürür, uyku kalitesini artırır. 🌜",
  ],
  en: [
    "Water is your body's favorite thing. Drink one extra glass today. 💧",
    "Probiotics absorb best on an empty stomach — try them before breakfast. 🌿",
    "Vitamin D is fat-soluble. Take it with a fatty meal for better uptake. ☀️",
    "Magnesium in the evening can deepen your sleep. 🌙",
    "Iron is absorbed twice as well with vitamin C. 🍊",
    "Omega-3 with food — empty stomach leaves a fishy aftertaste. 🐟",
    "Don't take zinc with milk or calcium — they compete for absorption. 🥛",
    "Split calcium into two doses; your body can't process more than 500mg at once. 🦴",
    "Morning B vitamins make for a flatter energy curve. ☀️",
    "Wait 2 hours after probiotics before coffee — heat kills live cultures. ☕",
    "Take your multivitamin at the same time daily — habit beats forgetting. ⏰",
    "Don't take iron with green tea; tannins reduce absorption. 🍵",
    "Take creatine continuously, no cycling — the effect is cumulative. 💪",
    "Excess vitamin C can cause loose stools; 2000mg is the upper limit. 🍋",
    "More selenium isn't better; 200mcg daily is plenty. ⚖️",
    "Herbal supplements take 2-4 weeks to show effects. Be patient. 🌱",
    "Bromelain (pineapple enzyme) supports protein digestion — take with meals. 🍍",
    "Take collagen with vitamin C; your body needs both for synthesis. ✨",
    "Berberine 30 min before meals — flattens blood sugar spikes. 🌾",
    "Ashwagandha in the evening — lowers cortisol, improves sleep quality. 🌜",
  ],
}

function pickDailyTip(lang: "tr" | "en"): string {
  const tips = DAILY_TIPS[lang]
  // Day-of-year index — stable for the entire day, rolls over at midnight.
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000)
  return tips[dayOfYear % tips.length]
}

export function DailyCareCard() {
  const { user } = useAuth()
  const { activeUserId } = useActiveProfile()
  const { lang } = useLang()
  const { isCompleted, setCompleted } = useDailyLogs()

  const effectiveId = activeUserId || user?.id || ""
  const [supplements, setSupplements] = useState<SupplementItem[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch the user's actual daily supplements from calendar_events.
  // This mirrors the data source used by the dashboard task list and
  // the calendar TimeBlock so all three views stay aligned.
  useEffect(() => {
    if (!effectiveId) {
      setSupplements([])
      setLoading(false)
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const supabase = createBrowserClient()
        const { data, error } = await supabase
          .from("calendar_events")
          .select("id, title, metadata")
          .eq("user_id", effectiveId)
          .eq("event_type", "supplement")
          .eq("recurrence", "daily")

        if (cancelled) return
        if (error) {
          // Read failure is non-fatal — show empty state, log to console.
          if (process.env.NODE_ENV === "development") {
            console.warn("[DailyCare] supplement fetch error:", error)
          }
          setSupplements([])
          return
        }

        const items: SupplementItem[] = (data ?? [])
          .filter((s: { title: string | null }) => !s.title?.startsWith("meta:"))
          .map((s: { id: string; title: string | null; metadata: unknown }) => {
            let dose: string | undefined
            try {
              const meta: { dose?: string } = typeof s.metadata === "string"
                ? JSON.parse(s.metadata || "{}")
                : ((s.metadata as { dose?: string }) || {})
              dose = meta.dose
            } catch {
              dose = undefined
            }
            return {
              id: s.id,
              name: getSupplementDisplayName(s.title || "Supplement", lang as "en" | "tr"),
              dose,
            }
          })
        setSupplements(items)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => { cancelled = true }
  }, [effectiveId, lang])

  // Re-fetch on cross-view sync — a calendar add/remove of a supplement
  // event should reflect here without a full page reload.
  useEffect(() => {
    const handler = () => {
      // Trigger the effect above by bumping a key would be cleaner; for
      // now, re-read directly to keep the surface small.
      if (!effectiveId) return
      const supabase = createBrowserClient()
      void supabase
        .from("calendar_events")
        .select("id, title, metadata")
        .eq("user_id", effectiveId)
        .eq("event_type", "supplement")
        .eq("recurrence", "daily")
        .then(({ data, error }) => {
          if (error || !data) return
          const items: SupplementItem[] = data
            .filter((s: { title: string | null }) => !s.title?.startsWith("meta:"))
            .map((s: { id: string; title: string | null; metadata: unknown }) => {
              let dose: string | undefined
              try {
                const meta: { dose?: string } = typeof s.metadata === "string"
                  ? JSON.parse(s.metadata || "{}")
                  : ((s.metadata as { dose?: string }) || {})
                dose = meta.dose
              } catch {
                dose = undefined
              }
              return {
                id: s.id,
                name: getSupplementDisplayName(s.title || "Supplement", lang as "en" | "tr"),
                dose,
              }
            })
          setSupplements(items)
        })
    }
    window.addEventListener("calendar-events-changed", handler)
    return () => window.removeEventListener("calendar-events-changed", handler)
  }, [effectiveId, lang])

  const handleToggle = useCallback(async (item: SupplementItem) => {
    const wasDone = isCompleted("supplement", item.id)
    try {
      await setCompleted("supplement", item.id, item.name, !wasDone)
    } catch {
      // Context already toasted + rolled back. Nothing more to do.
    }
  }, [isCompleted, setCompleted])

  const dailyTip = pickDailyTip(lang as "tr" | "en")

  if (loading) {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-xl bg-primary/10" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-muted/50" />
          ))}
        </div>
      </div>
    )
  }

  const completedCount = supplements.filter(s => isCompleted("supplement", s.id)).length
  const completionPercent = supplements.length > 0 ? Math.round((completedCount / supplements.length) * 100) : 0

  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold leading-snug">
              {tx("dailyCare.title", lang)}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
              {tx("dailyCare.subtitleReal", lang)}
            </p>
          </div>
        </div>

        {supplements.length > 0 && (
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
              {completedCount}/{supplements.length}
            </span>
          </div>
        )}
      </div>

      {/* Supplement list */}
      <div className="px-5 pb-4 space-y-2">
        {supplements.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            {tx("dailyCare.noSupplements", lang)}
          </p>
        ) : (
          supplements.map(item => {
            const done = isCompleted("supplement", item.id)
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleToggle(item)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  done
                    ? "bg-primary/5 border-primary/20"
                    : "bg-gradient-to-br from-green-50/80 to-emerald-50/60 dark:from-green-950/20 dark:to-emerald-950/10 border-green-200/60 dark:border-green-800/40 hover:shadow-md hover:-translate-y-0.5"
                }`}
              >
                <span className="text-base">🌿</span>
                <div className="flex-1 text-left min-w-0">
                  <p className={`text-sm font-medium ${done ? "line-through text-muted-foreground" : ""}`}>
                    {item.name}
                  </p>
                  {item.dose && (
                    <p className="text-[10px] text-muted-foreground">{item.dose}</p>
                  )}
                </div>
                <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                  done ? "border-primary bg-primary text-white scale-110" : "border-muted-foreground/30"
                }`}>
                  {done && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
              </button>
            )
          })
        )}
      </div>

      {/* Daily tip — read-only, visually distinct from the action list */}
      <div className="mx-5 mb-4 flex items-start gap-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 px-3 py-2 border border-amber-200/40 dark:border-amber-800/30">
        <Lightbulb className="h-3.5 w-3.5 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
          {dailyTip}
        </p>
      </div>

      {/* All completed celebration */}
      {supplements.length > 0 && completionPercent === 100 && (
        <div className="mx-5 mb-4 rounded-lg bg-primary/10 px-3 py-2.5 text-center">
          <p className="text-xs font-bold text-primary">
            {"🎉 " + tx("dailyCare.allCompleted", lang)}
          </p>
        </div>
      )}
    </div>
  )
}
