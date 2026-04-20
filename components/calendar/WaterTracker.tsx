// © 2026 DoctoPal — All Rights Reserved
"use client"

import { useState, useEffect, useCallback } from "react"
import { Droplets } from "lucide-react"
import { tx, type Lang } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"

interface WaterTrackerProps {
  userId: string
  date: string // YYYY-MM-DD
  lang: Lang
}

const WATER_TARGET = 8

export function WaterTracker({ userId, date, lang }: WaterTrackerProps) {
  const [glasses, setGlasses] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchWater = useCallback(async () => {
    try {
      const supabase = createBrowserClient()
      const { data } = await supabase
        .from("water_intake")
        .select("glasses")
        .eq("user_id", userId)
        .eq("intake_date", date)
        .maybeSingle()

      if (data) {
        setGlasses(data.glasses)
      } else {
        setGlasses(0)
      }
    } catch {
      setGlasses(0)
    } finally {
      setLoading(false)
    }
  }, [userId, date])

  useEffect(() => {
    fetchWater()
  }, [fetchWater])

  const updateWater = useCallback(
    async (newCount: number) => {
      const clamped = Math.max(0, Math.min(newCount, WATER_TARGET))
      setGlasses(clamped)

      try {
        const supabase = createBrowserClient()
        const { data: existing } = await supabase
          .from("water_intake")
          .select("id")
          .eq("user_id", userId)
          .eq("intake_date", date)
          .maybeSingle()

        if (existing) {
          await supabase
            .from("water_intake")
            .update({ glasses: clamped })
            .eq("id", existing.id)
        } else {
          await supabase.from("water_intake").insert({
            user_id: userId,
            intake_date: date,
            glasses: clamped,
          })
        }
      } catch (err) {
        console.error("Failed to update water intake:", err)
      }
    },
    [userId, date]
  )

  const handleClick = (index: number) => {
    // If clicking the last filled glass, decrement; otherwise set to index+1
    if (index + 1 === glasses) {
      updateWater(glasses - 1)
    } else {
      updateWater(index + 1)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2">
        {Array.from({ length: WATER_TARGET }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-6 animate-pulse rounded bg-muted"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          {tx("cal.water", lang)}
        </span>
        <span className="text-xs text-muted-foreground">
          {glasses}/{WATER_TARGET} {tx("cal.glasses", lang)}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: WATER_TARGET }).map((_, i) => {
          const filled = i < glasses
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleClick(i)}
              className="group relative flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={`Glass ${i + 1}`}
            >
              <Droplets
                className={`h-5 w-5 transition-colors duration-200 ${
                  filled
                    ? "text-primary fill-primary/20"
                    : "text-muted-foreground/40 group-hover:text-muted-foreground"
                }`}
              />
            </button>
          )
        })}
      </div>
      {glasses >= WATER_TARGET && (
        <p className="text-xs text-primary font-medium">
          {tx("cal.allDone", lang)}
        </p>
      )}
    </div>
  )
}
