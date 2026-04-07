// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Shield, Syringe, Calendar, ChevronDown, ChevronUp } from "lucide-react"
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

export function VaccineProfileSection({ lang, userId, initialVaccines }: Props) {
  const reducedMotion = useReducedMotion()
  const [vaccines, setVaccines] = useState<VaccineEntry[]>(initialVaccines || [])
  const [saving, setSaving] = useState(false)
  const [expandedGroup, setExpandedGroup] = useState<VaccineGroup | null>("essential")

  // Load vaccines from Supabase on mount
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

  // Save to Supabase — update state only after success
  const saveVaccines = useCallback(async (updated: VaccineEntry[]) => {
    setSaving(true)
    try {
      const supabase = createBrowserClient()
      const { error } = await supabase.from("user_profiles").update({ vaccines: updated }).eq("id", userId)
      if (error) { console.warn("Vaccine save failed:", error.message); return }
      setVaccines(updated)
    } catch (err) {
      console.warn("Vaccine save error:", err)
    } finally {
      setSaving(false)
    }
  }, [userId])

  const getEntry = (vaccineId: string): VaccineEntry | undefined =>
    vaccines.find(v => v.id === vaccineId)

  const updateVaccine = (vaccineId: string, updates: Partial<VaccineEntry>) => {
    const existing = vaccines.find(v => v.id === vaccineId)
    const vaccineDef = VACCINE_LIST.find(v => v.id === vaccineId)
    if (!vaccineDef) return

    const name = lang === "tr" ? vaccineDef.nameTr : vaccineDef.nameEn
    let updated: VaccineEntry[]

    if (existing) {
      updated = vaccines.map(v => v.id === vaccineId ? { ...v, ...updates } : v)
    } else {
      updated = [...vaccines, { id: vaccineId, name, status: "unknown", ...updates }]
    }
    saveVaccines(updated)
  }

  // Progress
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

  const statusChipClass = (status: string, isSelected: boolean) => {
    if (!isSelected) return "bg-muted text-muted-foreground hover:bg-muted/80"
    switch (status) {
      case "done": return "bg-green-600 text-white"
      case "not_done": return "bg-red-500 text-white"
      case "unknown": return "bg-slate-500 text-white"
      default: return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card id="vaccines">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {tx("vaccine.title", lang)}
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

        {/* Progress bar */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {lang === "tr"
                ? `${doneCount}/${totalCount} aşı kayıtlı`
                : `${doneCount}/${totalCount} vaccines recorded`}
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

      <CardContent className="space-y-4">
        {GROUP_ORDER.map(group => {
          const groupVaccines = VACCINE_LIST.filter(v => v.group === group)
          const isExpanded = expandedGroup === group

          return (
            <div key={group} className="rounded-lg border">
              <button
                type="button"
                onClick={() => setExpandedGroup(isExpanded ? null : group)}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
              >
                <span className="text-sm font-semibold">{getGroupLabel(group)}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {groupVaccines.filter(v => getEntry(v.id)?.status === "done").length}/{groupVaccines.length}
                  </span>
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
                    <div className="border-t px-4 py-2 space-y-3">
                      {groupVaccines.map(vDef => {
                        const entry = getEntry(vDef.id)
                        const currentStatus = entry?.status || "unknown"
                        const showDate = currentStatus === "done"
                        const displayName = lang === "tr" ? vDef.nameTr : vDef.nameEn

                        return (
                          <div key={vDef.id} className="space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              {/* Vaccine name */}
                              <div className="flex items-center gap-2 sm:w-48 shrink-0">
                                <Syringe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span className="text-sm font-medium">{displayName}</span>
                              </div>

                              {/* Status chips */}
                              <div className="flex gap-1.5">
                                {(["done", "unknown", "not_done"] as const).map(status => (
                                  <button
                                    key={status}
                                    type="button"
                                    onClick={() => updateVaccine(vDef.id, {
                                      status,
                                      ...(status !== "done" ? { last_date: undefined } : {}),
                                    })}
                                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${statusChipClass(status, currentStatus === status)}`}
                                  >
                                    {status === "done" && (lang === "tr" ? "✓ Oldum" : "✓ Done")}
                                    {status === "unknown" && (lang === "tr" ? "? Bilmiyorum" : "? Unsure")}
                                    {status === "not_done" && (lang === "tr" ? "✗ Olmadım" : "✗ Not done")}
                                  </button>
                                ))}
                              </div>

                              {/* Date input (when done) */}
                              <AnimatePresence>
                                {showDate && (
                                  <motion.div
                                    initial={reducedMotion ? undefined : { width: 0, opacity: 0 }}
                                    animate={{ width: "auto", opacity: 1 }}
                                    exit={reducedMotion ? undefined : { width: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                      <Input
                                        type="month"
                                        value={entry?.last_date || ""}
                                        onChange={(e) => updateVaccine(vDef.id, { last_date: e.target.value })}
                                        className="h-7 text-xs w-36"
                                        placeholder="YYYY-MM"
                                      />
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            {/* Interval note */}
                            {vDef.intervalYears && currentStatus === "done" && (
                              <p className="text-[10px] text-muted-foreground/70 ml-5">
                                {lang === "tr"
                                  ? `${vDef.intervalYears === 1 ? "Her yıl" : `${vDef.intervalYears} yılda bir`} tekrarlanmalı`
                                  : `Repeat every ${vDef.intervalYears === 1 ? "year" : `${vDef.intervalYears} years`}`}
                              </p>
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
