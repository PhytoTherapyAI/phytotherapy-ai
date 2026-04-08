// © 2026 Doctopal — All Rights Reserved
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { History, Plus, Pill, ArrowUp, ArrowDown, RefreshCw, X as XIcon, Calendar, Loader2, ChevronDown } from "lucide-react"

interface MedChange {
  id: string
  date: string
  type: "started" | "stopped" | "dose_changed" | "switched"
  medication: string
  previousDose?: string
  newDose?: string
  reason: string
  sideEffects: string[]
  notes: string
}

export default function MedicationLogPage() {
  const { user } = useAuth()
  const { lang } = useLang()
  const [changes, setChanges] = useState<MedChange[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<Partial<MedChange>>({ type: "started", date: new Date().toISOString().split("T")[0], sideEffects: [] })

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`med_log_${user?.id || "guest"}`)
      if (saved) setChanges(JSON.parse(saved))
    } catch { /* corrupted localStorage */ }
    setLoading(false)
  }, [user])

  const save = (newChanges: MedChange[]) => {
    setChanges(newChanges)
    localStorage.setItem(`med_log_${user?.id || "guest"}`, JSON.stringify(newChanges))
  }

  const addChange = () => {
    if (!form.medication) return
    const entry: MedChange = {
      id: Date.now().toString(),
      date: form.date || new Date().toISOString().split("T")[0],
      type: form.type || "started",
      medication: form.medication || "",
      previousDose: form.previousDose,
      newDose: form.newDose,
      reason: form.reason || "",
      sideEffects: form.sideEffects || [],
      notes: form.notes || "",
    }
    save([entry, ...changes])
    setForm({ type: "started", date: new Date().toISOString().split("T")[0], sideEffects: [] })
    setShowForm(false)
  }

  const deleteChange = (id: string) => save(changes.filter(c => c.id !== id))

  const TYPE_CONFIG = {
    started: { label: { en: "Started", tr: "Başlandı" }, color: "bg-green-500/10 text-green-600", icon: Plus },
    stopped: { label: { en: "Stopped", tr: "Bırakıldı" }, color: "bg-red-500/10 text-red-600", icon: XIcon },
    dose_changed: { label: { en: "Dose Changed", tr: "Doz Değişti" }, color: "bg-amber-500/10 text-amber-600", icon: RefreshCw },
    switched: { label: { en: "Switched", tr: "Değiştirildi" }, color: "bg-blue-500/10 text-blue-600", icon: ArrowUp },
  }

  const COMMON_SIDE_EFFECTS = [
    { en: "Nausea", tr: "Bulantı" }, { en: "Headache", tr: "Baş ağrısı" },
    { en: "Dizziness", tr: "Baş dönmesi" }, { en: "Fatigue", tr: "Yorgunluk" },
    { en: "Insomnia", tr: "Uykusuzluk" }, { en: "Stomach pain", tr: "Mide ağrısı" },
    { en: "Diarrhea", tr: "İshal" }, { en: "Dry mouth", tr: "Ağız kuruluğu" },
    { en: "Weight gain", tr: "Kilo artışı" }, { en: "Mood changes", tr: "Ruh hali değişimi" },
  ]

  const t = (key: string) => {
    const map: Record<string, Record<string, string>> = {
      title: { en: "Medication Change Log", tr: "İlaç Değişiklik Günlüğü" },
      subtitle: { en: "Track every medication change with reasons and side effects", tr: "Her ilaç değişikliğini neden ve yan etkileriyle takip et" },
      add: { en: "Log a Change", tr: "Değişiklik Kaydet" },
      med_name: { en: "Medication name", tr: "İlaç adı" },
      prev_dose: { en: "Previous dose", tr: "Önceki doz" },
      new_dose: { en: "New dose", tr: "Yeni doz" },
      reason: { en: "Reason for change", tr: "Değişiklik nedeni" },
      side_effects: { en: "Side Effects", tr: "Yan Etkiler" },
      notes: { en: "Additional notes", tr: "Ek notlar" },
      save: { en: "Save", tr: "Kaydet" },
      cancel: { en: "Cancel", tr: "İptal" },
      no_changes: { en: "No medication changes recorded yet.", tr: "Henüz ilaç değişikliği kaydedilmedi." },
      timeline: { en: "Change Timeline", tr: "Değişiklik Zaman Çizelgesi" },
    }
    return map[key]?.[lang] || key
  }

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <History className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>

        <Button onClick={() => setShowForm(!showForm)} className="w-full mb-6">
          <Plus className="w-4 h-4 mr-2" />{t("add")}
        </Button>

        {showForm && (
          <Card className="p-5 mb-6">
            <div className="space-y-4">
              <div className="flex gap-2">
                {(Object.keys(TYPE_CONFIG) as Array<keyof typeof TYPE_CONFIG>).map(type => (
                  <Button key={type} size="sm" variant={form.type === type ? "default" : "outline"}
                    onClick={() => setForm({ ...form, type })}>
                    {TYPE_CONFIG[type].label[lang]}
                  </Button>
                ))}
              </div>
              <Input placeholder={t("med_name")} value={form.medication || ""} onChange={e => setForm({ ...form, medication: e.target.value })} />
              <Input type="date" value={form.date || ""} onChange={e => setForm({ ...form, date: e.target.value })} />
              {(form.type === "dose_changed" || form.type === "switched") && (
                <div className="flex gap-2">
                  <Input placeholder={t("prev_dose")} value={form.previousDose || ""} onChange={e => setForm({ ...form, previousDose: e.target.value })} />
                  <Input placeholder={t("new_dose")} value={form.newDose || ""} onChange={e => setForm({ ...form, newDose: e.target.value })} />
                </div>
              )}
              <Input placeholder={t("reason")} value={form.reason || ""} onChange={e => setForm({ ...form, reason: e.target.value })} />
              <div>
                <p className="text-sm text-muted-foreground mb-2">{t("side_effects")}</p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SIDE_EFFECTS.map(se => (
                    <button key={se.en} onClick={() => {
                      const effects = form.sideEffects || []
                      setForm({ ...form, sideEffects: effects.includes(se.en) ? effects.filter(e => e !== se.en) : [...effects, se.en] })
                    }}
                      className={`px-2 py-1 rounded text-xs border transition-colors ${form.sideEffects?.includes(se.en) ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"}`}>
                      {se[lang as "en" | "tr"]}
                    </button>
                  ))}
                </div>
              </div>
              <Textarea placeholder={t("notes")} value={form.notes || ""} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} />
              <div className="flex gap-2">
                <Button onClick={addChange} disabled={!form.medication}>{t("save")}</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>{t("cancel")}</Button>
              </div>
            </div>
          </Card>
        )}

        {changes.length === 0 ? (
          <Card className="p-8 text-center">
            <History className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">{t("no_changes")}</p>
          </Card>
        ) : (
          <div className="relative">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">{t("timeline")}</h3>
            <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-border" />
            <div className="space-y-4">
              {changes.map(change => {
                const config = TYPE_CONFIG[change.type]
                const Icon = config.icon
                return (
                  <div key={change.id} className="relative pl-14">
                    <div className={`absolute left-2 w-7 h-7 rounded-full ${config.color} flex items-center justify-center z-10 border-2 border-background`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <Card className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{change.medication}</span>
                            <Badge className={config.color}>{config.label[lang]}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(change.date).toLocaleDateString(tx("common.locale", lang))}
                          </p>
                          {(change.previousDose || change.newDose) && (
                            <p className="text-sm mt-1">{change.previousDose} → {change.newDose}</p>
                          )}
                          {change.reason && <p className="text-sm text-muted-foreground mt-1">{change.reason}</p>}
                          {change.sideEffects.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {change.sideEffects.map(se => <Badge key={se} variant="outline" className="text-xs">{se}</Badge>)}
                            </div>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => deleteChange(change.id)}>
                          <XIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
