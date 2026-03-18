"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { tx, type Lang } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import { AddEventDialog, eventTypeColor } from "./AddEventDialog"

interface MonthViewProps {
  userId: string
  lang: Lang
}

interface CalendarEvent {
  id: string
  event_type: string
  title: string
  description: string | null
  event_date: string
  event_time: string | null
  recurrence: string
}

const DAY_KEYS = [
  "cal.mon",
  "cal.tue",
  "cal.wed",
  "cal.thu",
  "cal.fri",
  "cal.sat",
  "cal.sun",
] as const

const MONTH_NAMES_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

const MONTH_NAMES_TR = [
  "Ocak", "Subat", "Mart", "Nisan", "Mayis", "Haziran",
  "Temmuz", "Agustos", "Eylul", "Ekim", "Kasim", "Aralik",
]

function getMonthName(month: number, lang: Lang): string {
  return lang === "tr" ? MONTH_NAMES_TR[month] : MONTH_NAMES_EN[month]
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  // getDay() returns 0=Sun, we want 0=Mon
  let startDayOfWeek = firstDay.getDay() - 1
  if (startDayOfWeek < 0) startDayOfWeek = 6

  return { daysInMonth, startDayOfWeek }
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export function MonthView({ userId, lang }: MonthViewProps) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [addEventOpen, setAddEventOpen] = useState(false)

  const todayStr = formatDate(now.getFullYear(), now.getMonth(), now.getDate())

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createBrowserClient()
      const start = formatDate(year, month, 1)
      const { daysInMonth } = getMonthDays(year, month)
      const end = formatDate(year, month, daysInMonth)

      const { data } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", userId)
        .gte("event_date", start)
        .lte("event_date", end)
        .order("event_date", { ascending: true })

      if (data) setEvents(data as CalendarEvent[])
    } catch (err) {
      console.error("Failed to fetch events:", err)
    } finally {
      setLoading(false)
    }
  }, [userId, year, month])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
    setSelectedDate(null)
  }

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
    setSelectedDate(null)
  }

  const { daysInMonth, startDayOfWeek } = getMonthDays(year, month)

  // Group events by date
  const eventsByDate: Record<string, CalendarEvent[]> = {}
  for (const evt of events) {
    if (!eventsByDate[evt.event_date]) eventsByDate[evt.event_date] = []
    eventsByDate[evt.event_date].push(evt)
  }

  // Build calendar grid cells
  const cells: (number | null)[] = []
  for (let i = 0; i < startDayOfWeek; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  // Pad to complete the last row
  while (cells.length % 7 !== 0) cells.push(null)

  const selectedEvents = selectedDate ? eventsByDate[selectedDate] || [] : []

  return (
    <div className="space-y-4">
      {/* Month header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={prevMonth}
          aria-label={tx("cal.prevMonth", lang)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-heading text-lg font-semibold text-foreground">
          {getMonthName(month, lang)} {year}
        </h3>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={nextMonth}
          aria-label={tx("cal.nextMonth", lang)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_KEYS.map((key) => (
          <div
            key={key}
            className="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {tx(key, lang)}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="aspect-square" />
            }

            const dateStr = formatDate(year, month, day)
            const isToday = dateStr === todayStr
            const isSelected = dateStr === selectedDate
            const dayEvents = eventsByDate[dateStr] || []
            // Get unique event types for dots
            const uniqueTypes = [...new Set(dayEvents.map((e) => e.event_type))]

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={`relative flex flex-col items-center justify-center aspect-square rounded-lg text-sm transition-all duration-150 hover:bg-muted/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isSelected
                    ? "bg-primary/10 ring-1 ring-primary"
                    : isToday
                    ? "ring-1 ring-primary/50 bg-primary/5"
                    : ""
                }`}
              >
                <span
                  className={`text-sm ${
                    isToday ? "font-bold text-primary" : "text-foreground"
                  }`}
                >
                  {day}
                </span>
                {uniqueTypes.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {uniqueTypes.slice(0, 3).map((type) => (
                      <span
                        key={type}
                        className={`h-1.5 w-1.5 rounded-full ${eventTypeColor(type)}`}
                      />
                    ))}
                    {uniqueTypes.length > 3 && (
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Selected day events */}
      {selectedDate && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-foreground">
                {tx("cal.eventsOn", lang)}{" "}
                {new Date(selectedDate + "T00:00:00").toLocaleDateString(
                  lang === "tr" ? "tr-TR" : "en-US",
                  { day: "numeric", month: "long" }
                )}
              </h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setAddEventOpen(true)}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                {tx("cal.addEvent", lang)}
              </Button>
            </div>

            {selectedEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {tx("cal.noEvents", lang)}
              </p>
            ) : (
              <ul className="space-y-2">
                {selectedEvents.map((evt) => (
                  <li
                    key={evt.id}
                    className="flex items-start gap-3 rounded-lg border px-3 py-2.5"
                  >
                    <span
                      className={`mt-1 inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full ${eventTypeColor(
                        evt.event_type
                      )}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {evt.title}
                      </p>
                      {evt.event_time && (
                        <p className="text-xs text-muted-foreground">
                          {evt.event_time}
                        </p>
                      )}
                      {evt.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {evt.description}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Event Dialog */}
      <AddEventDialog
        userId={userId}
        lang={lang}
        open={addEventOpen}
        onOpenChange={setAddEventOpen}
        onSaved={fetchEvents}
        selectedDate={selectedDate || undefined}
      />
    </div>
  )
}
