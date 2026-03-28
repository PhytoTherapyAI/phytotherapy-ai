"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { createBrowserClient } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Pill, TestTube, Calendar, Activity, Plus, Loader2, ArrowDown } from "lucide-react"

interface TimelineEvent {
  id: string
  date: string
  type: "medication_start" | "medication_stop" | "lab_test" | "diagnosis" | "surgery" | "supplement_start" | "note"
  title: string
  details?: string
  source: "auto" | "manual"
}

const TYPE_CONFIG: Record<string, { icon: any; color: string; label: { en: string; tr: string } }> = {
  medication_start: { icon: Pill, color: "text-green-500 bg-green-500/10", label: { en: "Started Medication", tr: "İlaç Başlandı" } },
  medication_stop: { icon: Pill, color: "text-red-500 bg-red-500/10", label: { en: "Stopped Medication", tr: "İlaç Bırakıldı" } },
  lab_test: { icon: TestTube, color: "text-blue-500 bg-blue-500/10", label: { en: "Lab Test", tr: "Tahlil" } },
  diagnosis: { icon: Activity, color: "text-purple-500 bg-purple-500/10", label: { en: "Diagnosis", tr: "Tanı" } },
  surgery: { icon: Calendar, color: "text-orange-500 bg-orange-500/10", label: { en: "Surgery/Procedure", tr: "Ameliyat/İşlem" } },
  supplement_start: { icon: Plus, color: "text-emerald-500 bg-emerald-500/10", label: { en: "Started Supplement", tr: "Takviye Başlandı" } },
  note: { icon: Clock, color: "text-gray-500 bg-gray-500/10", label: { en: "Health Note", tr: "Sağlık Notu" } },
}

export default function HealthTimelinePage() {
  const { user } = useAuth()
  const { lang } = useLang()
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newEvent, setNewEvent] = useState<Partial<TimelineEvent>>({ type: "note", date: new Date().toISOString().split("T")[0] })

  useEffect(() => {
    loadTimeline()
  }, [user])

  const loadTimeline = async () => {
    if (!user) { setLoading(false); return }
    const autoEvents: TimelineEvent[] = []
    try {
      const supabase = createBrowserClient()
      // Load medications
      const { data: meds } = await supabase.from("user_medications").select("medication_name, created_at").eq("user_id", user.id)
      meds?.forEach((m: any) => {
        autoEvents.push({ id: `med-${m.medication_name}`, date: m.created_at?.split("T")[0] || "", type: "medication_start", title: m.medication_name, source: "auto" })
      })
      // Load blood tests
      const { data: tests } = await supabase.from("blood_tests").select("test_date, id").eq("user_id", user.id)
      tests?.forEach((t: any) => {
        autoEvents.push({ id: `test-${t.id}`, date: t.test_date || "", type: "lab_test", title: lang === "tr" ? "Kan Tahlili" : "Blood Test", source: "auto" })
      })
    } catch (e) { console.error(e) }

    // Load manual events
    const saved = localStorage.getItem(`timeline_${user?.id || "guest"}`)
    const manual: TimelineEvent[] = saved ? JSON.parse(saved) : []

    const all = [...autoEvents, ...manual].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    setEvents(all)
    setLoading(false)
  }

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date) return
    const event: TimelineEvent = {
      id: Date.now().toString(),
      date: newEvent.date!,
      type: newEvent.type as any || "note",
      title: newEvent.title!,
      details: newEvent.details,
      source: "manual",
    }
    const saved = localStorage.getItem(`timeline_${user?.id || "guest"}`)
    const manual: TimelineEvent[] = saved ? JSON.parse(saved) : []
    manual.push(event)
    localStorage.setItem(`timeline_${user?.id || "guest"}`, JSON.stringify(manual))
    setEvents(prev => [event, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    setNewEvent({ type: "note", date: new Date().toISOString().split("T")[0] })
    setShowAdd(false)
  }

  const groupByYear = () => {
    const groups: Record<string, TimelineEvent[]> = {}
    events.forEach(e => {
      const year = new Date(e.date).getFullYear().toString()
      if (!groups[year]) groups[year] = []
      groups[year].push(e)
    })
    return Object.entries(groups).sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
  }

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>

  const grouped = groupByYear()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Clock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{lang === "tr" ? "Sağlık Zaman Çizelgesi" : "Health Timeline"}</h1>
          <p className="text-muted-foreground mt-1">{lang === "tr" ? "Tüm sağlık geçmişin tek kronolojik çizelgede" : "Your complete health history in one chronological view"}</p>
          <p className="text-xs text-muted-foreground mt-1">{events.length} {lang === "tr" ? "olay" : "events"}</p>
        </div>

        <Button onClick={() => setShowAdd(!showAdd)} className="w-full mb-6">
          <Plus className="w-4 h-4 mr-2" />{lang === "tr" ? "Olay Ekle" : "Add Event"}
        </Button>

        {showAdd && (
          <Card className="p-5 mb-6">
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                  <button key={key} onClick={() => setNewEvent({ ...newEvent, type: key as any })}
                    className={`px-3 py-1.5 rounded text-xs border transition-colors ${newEvent.type === key ? "bg-primary text-primary-foreground" : "border-border"}`}>
                    {config.label[lang]}
                  </button>
                ))}
              </div>
              <input type="date" className="w-full px-3 py-2 rounded border border-border bg-background" value={newEvent.date || ""} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} />
              <input className="w-full px-3 py-2 rounded border border-border bg-background" placeholder={lang === "tr" ? "Başlık" : "Title"} value={newEvent.title || ""} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} />
              <input className="w-full px-3 py-2 rounded border border-border bg-background" placeholder={lang === "tr" ? "Detay (opsiyonel)" : "Details (optional)"} value={newEvent.details || ""} onChange={e => setNewEvent({ ...newEvent, details: e.target.value })} />
              <Button onClick={addEvent} disabled={!newEvent.title}>{lang === "tr" ? "Kaydet" : "Save"}</Button>
            </div>
          </Card>
        )}

        {events.length === 0 ? (
          <Card className="p-8 text-center">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">{lang === "tr" ? "Henüz zaman çizelgesi boş. Profil verilerinden otomatik doldurulacak." : "Timeline is empty. Will auto-populate from profile data."}</p>
          </Card>
        ) : (
          <div className="space-y-8">
            {grouped.map(([year, yearEvents]) => (
              <div key={year}>
                <h2 className="text-lg font-bold text-foreground mb-4 sticky top-0 bg-background py-2 z-10">{year}</h2>
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
                  {yearEvents.map(event => {
                    const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.note
                    const Icon = config.icon
                    return (
                      <div key={event.id} className="relative pl-14 pb-4">
                        <div className={`absolute left-2 w-7 h-7 rounded-full ${config.color} flex items-center justify-center border-2 border-background z-10`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-xs font-mono text-muted-foreground mb-1">
                          {new Date(event.date).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", { month: "short", day: "numeric" })}
                        </div>
                        <Card className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-sm">{event.title}</h4>
                              {event.details && <p className="text-xs text-muted-foreground mt-0.5">{event.details}</p>}
                            </div>
                            <Badge className={`text-xs ${config.color}`}>{config.label[lang]}</Badge>
                          </div>
                        </Card>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
