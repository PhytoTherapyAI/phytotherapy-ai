"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  CalendarDays,
  Activity,
  Heart,
  Loader2,
  LogIn,
  Plus,
  Download,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import { TodayView } from "@/components/calendar/TodayView"
import { MonthView } from "@/components/calendar/MonthView"
import { AddVitalDialog } from "@/components/calendar/AddVitalDialog"

interface VitalRecord {
  id: string
  user_id: string
  vital_type: string
  value: number
  systolic?: number
  diastolic?: number
  notes: string | null
  recorded_at: string
}

// ── ICS Export ──
function generateICS(events: Array<{ title: string; event_date: string; event_time: string | null; description: string | null; event_type: string }>): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Phytotherapy.ai//Calendar//EN",
    "CALSCALE:GREGORIAN",
  ]

  for (const evt of events) {
    const dateClean = evt.event_date.replace(/-/g, "")
    const dtStart = evt.event_time
      ? `${dateClean}T${evt.event_time.replace(":", "")}00`
      : dateClean
    const dtEnd = evt.event_time
      ? `${dateClean}T${String(parseInt(evt.event_time.split(":")[0]) + 1).padStart(2, "0")}${evt.event_time.split(":")[1]}00`
      : dateClean

    lines.push("BEGIN:VEVENT")
    lines.push(`DTSTART:${dtStart}`)
    lines.push(`DTEND:${dtEnd}`)
    lines.push(`SUMMARY:${evt.title}`)
    if (evt.description) lines.push(`DESCRIPTION:${evt.description.replace(/\n/g, "\\n")}`)
    lines.push(`CATEGORIES:${evt.event_type}`)
    lines.push(`UID:${evt.event_date}-${Math.random().toString(36).slice(2)}@phytotherapy.ai`)
    lines.push("END:VEVENT")
  }

  lines.push("END:VCALENDAR")
  return lines.join("\r\n")
}

function downloadICS(events: Array<{ title: string; event_date: string; event_time: string | null; description: string | null; event_type: string }>) {
  const ics = generateICS(events)
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "phytotherapy-calendar.ics"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function VitalIcon({ type }: { type: string }) {
  switch (type) {
    case "blood_pressure":
      return <Heart className="h-4 w-4 text-rose-500" />
    case "blood_sugar":
      return <Activity className="h-4 w-4 text-amber-500" />
    case "weight":
      return <Activity className="h-4 w-4 text-blue-500" />
    case "heart_rate":
      return <Heart className="h-4 w-4 text-red-500" />
    default:
      return <Activity className="h-4 w-4 text-muted-foreground" />
  }
}

function formatVitalValue(vital: VitalRecord, lang: string): string {
  switch (vital.vital_type) {
    case "blood_pressure":
      return `${vital.systolic ?? vital.value}/${vital.diastolic ?? "?"} mmHg`
    case "blood_sugar":
      return `${vital.value} mg/dL`
    case "weight":
      return `${vital.value} kg`
    case "heart_rate":
      return `${vital.value} bpm`
    default:
      return String(vital.value)
  }
}

function vitalTypeLabel(type: string, lang: string): string {
  return tx(`cal.vitalType.${type}`, lang as "en" | "tr")
}

export default function CalendarPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, profile } = useAuth()
  const { lang } = useLang()
  const [activeTab, setActiveTab] = useState("today")
  const [vitals, setVitals] = useState<VitalRecord[]>([])
  const [vitalsLoading, setVitalsLoading] = useState(false)
  const [addVitalOpen, setAddVitalOpen] = useState(false)
  const [allEvents, setAllEvents] = useState<Array<{ title: string; event_date: string; event_time: string | null; description: string | null; event_type: string }>>([])

  // Fetch all events for ICS export
  const fetchAllEvents = useCallback(async () => {
    if (!profile?.id) return
    try {
      const supabase = createBrowserClient()
      const { data } = await supabase
        .from("calendar_events")
        .select("title, event_date, event_time, description, event_type")
        .eq("user_id", profile.id)
        .order("event_date", { ascending: true })
        .limit(500)
      if (data) setAllEvents(data)
    } catch { /* ignore */ }
  }, [profile?.id])

  useEffect(() => {
    if (profile?.id) fetchAllEvents()
  }, [profile?.id, fetchAllEvents])

  const fetchVitals = useCallback(async () => {
    if (!profile?.id) return
    setVitalsLoading(true)
    try {
      const supabase = createBrowserClient()
      const { data } = await supabase
        .from("vital_records")
        .select("*")
        .eq("user_id", profile.id)
        .order("recorded_at", { ascending: false })
        .limit(20)

      if (data) setVitals(data as VitalRecord[])
    } catch (err) {
      console.error("Failed to fetch vitals:", err)
    } finally {
      setVitalsLoading(false)
    }
  }, [profile?.id])

  useEffect(() => {
    if (activeTab === "vitals" && profile?.id) {
      fetchVitals()
    }
  }, [activeTab, profile?.id, fetchVitals])

  // Auth loading state
  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated || !profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <CalendarDays className="h-12 w-12 text-muted-foreground/50" />
            <h2 className="font-heading text-2xl font-bold italic text-foreground">
              {tx("cal.title", lang)}
            </h2>
            <p className="max-w-md text-sm text-muted-foreground">
              {tx("cal.signInPrompt", lang)}
            </p>
            <Button onClick={() => router.push("/auth/login")} className="mt-2">
              <LogIn className="mr-2 h-4 w-4" />
              {tx("cal.signIn", lang)}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold italic tracking-tight text-foreground sm:text-4xl">
          {tx("cal.title", lang)}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {tx("cal.subtitle", lang)}
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="today" value={activeTab} onValueChange={(v) => setActiveTab(v as string)}>
        <TabsList className="w-full">
          <TabsTrigger value="today" className="flex-1">
            <CalendarDays className="h-4 w-4 mr-1.5" />
            {tx("cal.today", lang)}
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex-1">
            <CalendarDays className="h-4 w-4 mr-1.5" />
            {tx("cal.calendar", lang)}
          </TabsTrigger>
          <TabsTrigger value="vitals" className="flex-1">
            <Activity className="h-4 w-4 mr-1.5" />
            {tx("cal.vitals", lang)}
          </TabsTrigger>
        </TabsList>

        {/* Today Tab */}
        <TabsContent value="today" className="mt-6">
          <TodayView userId={profile.id} lang={lang} userName={profile.full_name} userWeight={profile.weight_kg} userHeight={profile.height_cm} userSupplements={profile.supplements} />
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="mt-6">
          <MonthView userId={profile.id} lang={lang} />
          {allEvents.length > 0 && (
            <div className="mt-4">
              <Button variant="outline" className="w-full rounded-xl h-11" onClick={() => downloadICS(allEvents)}>
                <Download className="h-4 w-4 mr-2" />
                {tx("cal.exportIcs", lang)}
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Vitals Tab */}
        <TabsContent value="vitals" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold italic text-foreground">
                {tx("cal.recentVitals", lang)}
              </h3>
              <Button
                size="sm"
                onClick={() => setAddVitalOpen(true)}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                {tx("cal.addVital", lang)}
              </Button>
            </div>

            {vitalsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : vitals.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                  <Activity className="h-10 w-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground max-w-xs">
                    {tx("cal.noVitals", lang)}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAddVitalOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    {tx("cal.addVital", lang)}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {vitals.map((vital) => {
                  const recordedDate = new Date(vital.recorded_at)
                  const dateStr = recordedDate.toLocaleDateString(
                    lang === "tr" ? "tr-TR" : "en-US",
                    { day: "numeric", month: "short", year: "numeric" }
                  )
                  const timeStr = recordedDate.toLocaleTimeString(
                    lang === "tr" ? "tr-TR" : "en-US",
                    { hour: "2-digit", minute: "2-digit" }
                  )

                  return (
                    <Card key={vital.id}>
                      <CardContent className="flex items-center gap-4 py-3 px-4">
                        <VitalIcon type={vital.vital_type} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                              {vitalTypeLabel(vital.vital_type, lang)}
                            </span>
                            <Badge variant="secondary" className="text-xs font-mono">
                              {formatVitalValue(vital, lang)}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {dateStr} {timeStr}
                            {vital.notes && ` - ${vital.notes}`}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          <AddVitalDialog
            userId={profile.id}
            lang={lang}
            open={addVitalOpen}
            onOpenChange={setAddVitalOpen}
            onSaved={() => {
              fetchVitals()
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
