// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, ChevronDown, ChevronUp, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { tx } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import { VACCINE_LIST, ESSENTIAL_VACCINE_IDS, type VaccineEntry, type VaccineGroup } from "@/lib/vaccine-data"

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => { setReduced(!!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) }, [])
  return reduced
}

interface Props {
  lang: "en" | "tr"
  userId: string
  initialVaccines?: VaccineEntry[]
}

const GROUP_ORDER: VaccineGroup[] = ["essential", "seasonal", "special"]
const YEARS = Array.from({ length: 27 }, (_, i) => 2026 - i) // 2026..2000

export function VaccineProfileSection({ lang, userId, initialVaccines }: Props) {
  const reducedMotion = useReducedMotion()
  const tr = lang === "tr"
  const [vaccines, setVaccines] = useState<VaccineEntry[]>(initialVaccines || [])
  const [saving, setSaving] = useState(false)
  const [expandedGroup, setExpandedGroup] = useState<VaccineGroup | null>("essential")
  const [openDatePicker, setOpenDatePicker] = useState<string | null>(null)

  useEffect(() => {
    if (initialVaccines) return
    const supabase = createBrowserClient()
    supabase.from("user_profiles").select("vaccines").eq("id", userId).single()
      .then(({ data, error }) => {
        if (error) { console.warn("Vaccine fetch failed:", error.message); return }
        if (data?.vaccines && Array.isArray(data.vaccines)) {
          setVaccines(data.vaccines as VaccineEntry[])
        }
      })
  }, [userId, initialVaccines])

  const saveVaccines = useCallback(async (updated: VaccineEntry[], previous: VaccineEntry[]) => {
    // Optimistic: UI already shows updated, rollback on failure
    setSaving(true)
    try {
      const supabase = createBrowserClient()
      const { error } = await supabase.from("user_profiles").update({ vaccines: updated }).eq("id", userId)
      if (error) {
        console.warn("Vaccine save failed:", error.message)
        setVaccines(previous)
      }
    } catch (err) {
      console.warn("Vaccine save error:", err)
      setVaccines(previous)
    } finally {
      setSaving(false)
    }
  }, [userId])

  const getEntry = (vaccineId: string): VaccineEntry | undefined =>
    vaccines.find(v => v.id === vaccineId)

  const toggleVaccine = (vaccineId: string) => {
    const existing = getEntry(vaccineId)
    const vaccineDef = VACCINE_LIST.find(v => v.id === vaccineId)
    if (!vaccineDef) return
    const name = tr ? vaccineDef.nameTr : vaccineDef.nameEn
    const newStatus = existing?.status === "done" ? "not_done" : "done"

    const previous = [...vaccines]
    let updated: VaccineEntry[]
    if (existing) {
      updated = vaccines.map(v => v.id === vaccineId
        ? { ...v, status: newStatus as VaccineEntry["status"], ...(newStatus === "not_done" ? { last_date: undefined } : {}) }
        : v)
    } else {
      updated = [...vaccines, { id: vaccineId, name, status: newStatus as VaccineEntry["status"] }]
    }
    setVaccines(updated)
    saveVaccines(updated, previous)
  }

  const setDate = (vaccineId: string, year: string) => {
    const existing = getEntry(vaccineId)
    const vaccineDef = VACCINE_LIST.find(v => v.id === vaccineId)
    if (!vaccineDef) return
    const name = tr ? vaccineDef.nameTr : vaccineDef.nameEn

    const previous = [...vaccines]
    let updated: VaccineEntry[]
    if (existing) {
      updated = vaccines.map(v => v.id === vaccineId ? { ...v, last_date: year, status: "done" as const } : v)
    } else {
      updated = [...vaccines, { id: vaccineId, name, status: "done" as const, last_date: year }]
    }
    setVaccines(updated)
    saveVaccines(updated, previous)
    setOpenDatePicker(null)
  }

  const doneCount = vaccines.filter(v => v.status === "done").length
  const totalCount = VACCINE_LIST.length
  const essentialDone = vaccines.filter(v => ESSENTIAL_VACCINE_IDS.includes(v.id) && v.status === "done").length
  const allEssentialDone = essentialDone === ESSENTIAL_VACCINE_IDS.length

  const getGroupLabel = (group: VaccineGroup) => {
    const keys: Record<VaccineGroup, string> = {
      essential: "vaccine.groupEssential",
      seasonal: "vaccine.groupSeasonal",
      special: "vaccine.groupSpecial",
    }
    return tx(keys[group], lang)
  }

  const essentialTotal = ESSENTIAL_VACCINE_IDS.length
  return (
    <Card id="vaccines" className={`rounded-xl shadow-sm hover:shadow-md transition-shadow ${doneCount > 0 ? 'border-l-4 border-l-blue-500' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {tx("vaccine.title", lang)}
              {doneCount > 0 && (
                <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded-full px-2.5 py-0.5">
                  {"\u2713"}
                </span>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              {tx("vaccine.subtitle", lang)}
            </CardDescription>
          </div>
          {saving && (
            <span className="text-xs text-muted-foreground animate-pulse">
              {tx("vaccine.saving", lang)}
            </span>
          )}
        </div>

        {/* Motivation card */}
        <VaccineMotivationCard tr={tr} />

        {/* Shield complete banner */}
        {allEssentialDone && (
          <div className="mt-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 p-3 text-white text-center">
            <p className="text-sm font-bold">🛡️ {tr ? "Bağışıklık Kalkanı Tam!" : "Immunity Shield Complete!"}</p>
            <p className="text-xs opacity-90 mt-0.5">{tr ? `${essentialTotal} temel aşı tamamlandı` : `All ${essentialTotal} essential vaccines recorded`}</p>
          </div>
        )}

        {/* Progress bar */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {tr ? `Temel Aşılar: ${essentialDone}/${essentialTotal}` : `Essential: ${essentialDone}/${essentialTotal}`}
            </span>
            {allEssentialDone && (
              <Badge className="bg-primary/10 text-primary text-[10px]">
                {tx("vaccine.shieldBadge", lang)}
              </Badge>
            )}
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
              initial={reducedMotion ? undefined : { width: 0 }}
              animate={{ width: `${(doneCount / totalCount) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {GROUP_ORDER.map(group => {
          const groupVaccines = VACCINE_LIST.filter(v => v.group === group)
          const isExpanded = expandedGroup === group
          const groupDone = groupVaccines.filter(v => getEntry(v.id)?.status === "done").length
          const groupComplete = groupDone === groupVaccines.length

          return (
            <div key={group} className={`rounded-lg border transition-colors ${groupComplete ? "border-green-200 dark:border-green-800" : ""}`}>
              <button
                type="button"
                onClick={() => setExpandedGroup(isExpanded ? null : group)}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-muted/30 transition-colors"
              >
                <span className="text-sm font-semibold flex items-center gap-2">
                  {getGroupLabel(group)}
                  {groupComplete && <span className="text-green-600 text-xs">✅</span>}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">{groupDone}/{groupVaccines.length}</span>
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={reducedMotion ? undefined : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t divide-y">
                      {groupVaccines.map(vDef => {
                        const entry = getEntry(vDef.id)
                        const isDone = entry?.status === "done"
                        const displayName = tr ? vDef.nameTr : vDef.nameEn
                        const dateLabel = entry?.last_date
                          ? entry.last_date
                          : isDone
                            ? (tr ? "Tarih ekle" : "Add date")
                            : "—"
                        const isDateOpen = openDatePicker === vDef.id

                        return (
                          <div key={vDef.id}
                            className={`flex items-center gap-3 px-4 py-3 min-h-[48px] relative cursor-pointer transition-colors duration-200 ${isDone ? "bg-green-50/50 dark:bg-green-950/10 hover:bg-green-50 dark:hover:bg-green-950/20" : "hover:bg-muted/30"}`}
                            onClick={() => toggleVaccine(vDef.id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleVaccine(vDef.id); } }}
                          >
                            {/* Checkbox */}
                            <div
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200 ${
                                isDone
                                  ? "bg-green-500 border-green-500 text-white"
                                  : "border-gray-300 dark:border-gray-600 hover:border-primary/50"
                              }`}
                            >
                              {isDone && <Check className="h-4 w-4" />}
                            </div>

                            {/* Vaccine name */}
                            <span className={`flex-1 text-sm font-medium ${isDone ? "text-foreground" : "text-muted-foreground"}`}>
                              {displayName}
                            </span>


                            {/* Date dropdown trigger */}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); if (isDone) setOpenDatePicker(isDateOpen ? null : vDef.id); }}
                              disabled={!isDone}
                              className={`text-xs px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${
                                isDone
                                  ? entry?.last_date
                                    ? "text-primary font-medium hover:bg-primary/10"
                                    : "text-muted-foreground hover:bg-muted/50"
                                  : "text-muted-foreground/40 cursor-default"
                              }`}
                            >
                              {dateLabel}
                              {isDone && <ChevronDown className={`h-3 w-3 transition-transform ${isDateOpen ? "rotate-180" : ""}`} />}
                            </button>

                            {/* Year picker dropdown */}
                            {isDateOpen && (
                              <div className="absolute right-4 top-full mt-1 z-50 w-40 max-h-48 overflow-y-auto rounded-lg border bg-background shadow-lg" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setDate(vDef.id, ""); }}
                                  className="w-full px-3 py-1.5 text-left text-xs text-muted-foreground hover:bg-muted/50 border-b"
                                >
                                  {tr ? "Hatırlamıyorum" : "Don't remember"}
                                </button>
                                {YEARS.map(y => (
                                  <button
                                    key={y}
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setDate(vDef.id, String(y)); }}
                                    className={`w-full px-3 py-1.5 text-left text-xs hover:bg-muted/50 ${
                                      entry?.last_date === String(y) ? "bg-primary/10 text-primary font-semibold" : ""
                                    }`}
                                  >
                                    {y}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

// Dismissable motivation card for vaccines
function VaccineMotivationCard({ tr }: { tr: boolean }) {
  const [dismissed, setDismissed] = useState(false)
  useEffect(() => {
    try { if (localStorage.getItem('motiv_dismiss_vaccines') === '1') setDismissed(true) } catch { /* noop */ }
  }, [])
  if (dismissed) return null
  const dismiss = () => {
    setDismissed(true)
    try { localStorage.setItem('motiv_dismiss_vaccines', '1') } catch { /* noop */ }
  }
  return (
    <div className="mt-3 rounded-lg border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20 p-3 text-sm text-blue-800 dark:text-blue-200 relative">
      <button onClick={dismiss} className="absolute top-2 right-2 opacity-40 hover:opacity-70 transition-opacity" aria-label="Dismiss">
        <span className="text-xs">✕</span>
      </button>
      <p className="font-semibold text-xs uppercase tracking-wide opacity-70 mb-1">{"\u{1F489}"} {tr ? "'Paslı çivi battı' dersen ne yaparım?" : "'A rusty nail got me' — then what?"}</p>
      <p className="leading-relaxed pr-4">
        {tr
          ? 'Tetanoz aşın ne zaman oldu? Bunu bilmeden seni acile yollamadan önce doğru soruyu soramam. Aşı kartın yoksa tahmin bile edemem. 5 dakika, hayat kurtarabilir. Gerçekten.'
          : 'When was your last tetanus shot? Without knowing, I can\'t ask the right question before sending you to the ER. No vaccine card = no way to guess. 5 minutes could save a life. Seriously.'}
      </p>
    </div>
  )
}
