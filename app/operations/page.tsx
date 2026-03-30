// © 2026 Phytotherapy.ai — All Rights Reserved
"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import {
  Scissors,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Loader2,
  Clock,
  Pill,
  X,
} from "lucide-react"

interface Operation {
  id: string
  name: string
  date: string
  notes: string
  preOpSupplements: string[]
  postOpSupplements: string[]
  stopBefore: { supplement: string; daysBefore: number }[]
}

// Common supplements that need to be stopped before surgery
const STOP_BEFORE_SURGERY = [
  { supplement: "Omega-3 / Fish Oil", daysBefore: 14, reason: "Increases bleeding risk" },
  { supplement: "Vitamin E (high dose)", daysBefore: 14, reason: "Blood thinning effect" },
  { supplement: "Ginkgo Biloba", daysBefore: 14, reason: "Increases bleeding risk" },
  { supplement: "Garlic Extract", daysBefore: 10, reason: "Blood thinning effect" },
  { supplement: "St. John's Wort", daysBefore: 14, reason: "Drug interactions with anesthesia" },
  { supplement: "Ginseng", daysBefore: 7, reason: "Blood sugar and bleeding risk" },
  { supplement: "Turmeric / Curcumin", daysBefore: 14, reason: "Mild blood thinning" },
  { supplement: "Green Tea Extract", daysBefore: 7, reason: "Caffeine & interaction risk" },
]

export default function OperationsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { lang } = useLang()
  const [operations, setOperations] = useState<Operation[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [newOp, setNewOp] = useState({ name: "", date: "", notes: "" })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/auth/login")
  }, [isLoading, isAuthenticated, router])

  // Load operations from localStorage (simple approach)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("phyto_operations")
      if (saved) setOperations(JSON.parse(saved))
    }
  }, [])

  const saveOperations = (ops: Operation[]) => {
    setOperations(ops)
    localStorage.setItem("phyto_operations", JSON.stringify(ops))
  }

  const addOperation = () => {
    if (!newOp.name || !newOp.date) return
    const op: Operation = {
      id: crypto.randomUUID(),
      name: newOp.name,
      date: newOp.date,
      notes: newOp.notes,
      preOpSupplements: [],
      postOpSupplements: [],
      stopBefore: STOP_BEFORE_SURGERY.map((s) => ({
        supplement: s.supplement,
        daysBefore: s.daysBefore,
      })),
    }
    saveOperations([...operations, op])
    setNewOp({ name: "", date: "", notes: "" })
    setShowAdd(false)
  }

  const removeOperation = (id: string) => {
    saveOperations(operations.filter((op) => op.id !== id))
  }

  const daysUntil = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            {tx("operations.title", lang)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{tx("operations.subtitle", lang)}</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {tx("operations.add", lang)}
        </button>
      </div>

      {/* Add Operation Form */}
      {showAdd && (
        <div className="mb-6 rounded-xl border bg-card p-5">
          <h3 className="mb-3 font-semibold">{tx("operations.new", lang)}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={newOp.name}
              onChange={(e) => setNewOp({ ...newOp, name: e.target.value })}
              placeholder={tx("operations.namePlaceholder", lang)}
              className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <input
              type="date"
              value={newOp.date}
              onChange={(e) => setNewOp({ ...newOp, date: e.target.value })}
              className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <textarea
            value={newOp.notes}
            onChange={(e) => setNewOp({ ...newOp, notes: e.target.value })}
            placeholder={tx("operations.notesPlaceholder", lang)}
            className="mt-3 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            rows={2}
          />
          <div className="mt-3 flex gap-2">
            <button
              onClick={addOperation}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {tx("operations.save", lang)}
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="rounded-lg bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80"
            >
              {tx("operations.cancel", lang)}
            </button>
          </div>
        </div>
      )}

      {/* Operations List */}
      {operations.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center">
          <Scissors className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            {tx("operations.noOps", lang)}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {operations.map((op) => {
            const days = daysUntil(op.date)
            const isUpcoming = days > 0
            return (
              <div key={op.id} className="rounded-xl border bg-card overflow-hidden">
                <div className="flex items-center gap-3 border-b p-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    days <= 7 ? "bg-red-100 dark:bg-red-900/30" : "bg-blue-100 dark:bg-blue-900/30"
                  }`}>
                    <Scissors className={`h-5 w-5 ${days <= 7 ? "text-red-500" : "text-blue-500"}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{op.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(op.date).toLocaleDateString(tx("common.locale", lang), { month: "long", day: "numeric", year: "numeric" })}
                      <span className={`font-medium ${days <= 7 ? "text-red-500" : "text-blue-500"}`}>
                        ({isUpcoming ? `${days} ${tx("operations.daysLeft", lang)}` : tx("operations.past", lang)})
                      </span>
                    </div>
                  </div>
                  <button onClick={() => removeOperation(op.id)} className="rounded-md p-1 hover:bg-muted">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Pre-op supplement warnings */}
                {isUpcoming && (
                  <div className="p-4">
                    <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-red-600 dark:text-red-400">
                      <AlertTriangle className="h-4 w-4" />
                      {tx("operations.stopBefore", lang)}
                    </h4>
                    <div className="space-y-2">
                      {STOP_BEFORE_SURGERY.map((s) => {
                        const stopDate = new Date(op.date)
                        stopDate.setDate(stopDate.getDate() - s.daysBefore)
                        const shouldStopNow = new Date() >= stopDate
                        return (
                          <div key={s.supplement} className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">
                            <Pill className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{s.supplement}</p>
                              <p className="text-xs text-muted-foreground">{s.reason}</p>
                            </div>
                            <div className="text-right">
                              {shouldStopNow ? (
                                <span className="flex items-center gap-1 text-xs font-medium text-red-500">
                                  <AlertTriangle className="h-3 w-3" />
                                  {tx("operations.stopNow", lang)}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {s.daysBefore} {tx("operations.dBefore", lang)}
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Insurance Wellbeing section */}
      <div className="mt-10 rounded-2xl border bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          {tx("operations.insurance", lang)}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {tx("operations.insuranceDesc", lang)}
        </p>
        <div className="mt-3 rounded-lg bg-background/80 p-3 text-xs text-muted-foreground">
          {tx("operations.insuranceOptIn", lang)}
        </div>
      </div>
    </div>
  )
}
