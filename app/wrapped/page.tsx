"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import { ShareCardBase } from "@/components/share/ShareCardBase"
import {
  Calendar,
  FlaskConical,
  Shield,
  Droplets,
  Trophy,
  TrendingUp,
  Heart,
  Sparkles,
  Share2,
  Loader2,
} from "lucide-react"

interface WrappedData {
  totalQueries: number
  totalCheckIns: number
  bloodTests: number
  interactionChecks: number
  topQueryTypes: { type: string; count: number }[]
  joinDate: string
  daysActive: number
  longestStreak: number
  totalSupplements: number
}

export default function WrappedPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { lang } = useLang()
  const [data, setData] = useState<WrappedData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchWrapped = useCallback(async () => {
    if (!user) return
    const supabase = createBrowserClient()
    setLoading(true)

    const year = new Date().getFullYear()
    const yearStart = `${year}-01-01`
    const yearEnd = `${year}-12-31`

    const [queries, checkIns, bloodTests] = await Promise.all([
      supabase
        .from("query_history")
        .select("query_type, created_at")
        .eq("user_id", user.id)
        .gte("created_at", yearStart)
        .lte("created_at", yearEnd),
      supabase
        .from("daily_check_ins")
        .select("id")
        .eq("user_id", user.id)
        .gte("check_date", yearStart)
        .lte("check_date", yearEnd),
      supabase
        .from("blood_tests")
        .select("id")
        .eq("user_id", user.id)
        .gte("created_at", yearStart)
        .lte("created_at", yearEnd),
    ])

    const queryData = queries.data || []
    const typeCounts: Record<string, number> = {}
    let interactionCount = 0
    for (const q of queryData) {
      const type = q.query_type || "general"
      typeCounts[type] = (typeCounts[type] || 0) + 1
      if (type === "interaction") interactionCount++
    }

    const topQueryTypes = Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)

    const createdAt = new Date(user.created_at || Date.now())
    const daysActive = Math.max(1, Math.ceil((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)))

    setData({
      totalQueries: queryData.length,
      totalCheckIns: (checkIns.data || []).length,
      bloodTests: (bloodTests.data || []).length,
      interactionChecks: interactionCount,
      topQueryTypes,
      joinDate: createdAt.toISOString(),
      daysActive: Math.min(daysActive, 365),
      longestStreak: Math.min((checkIns.data || []).length, 30), // simplified
      totalSupplements: 0,
    })
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/auth/login")
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (user) fetchWrapped()
  }, [user, fetchWrapped])

  if (isLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="text-center mb-8">
          <Sparkles className="mx-auto h-12 w-12 text-amber-500 mb-3" />
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            {tx("wrapped.title", lang)}
          </h1>
          <p className="mt-2 text-muted-foreground">{tx("wrapped.subtitle", lang)}</p>
        </div>

        {data && (
          <ShareCardBase
            lang={lang}
            fileName="phytotherapy-wrapped.png"
            shareTitle={tx("wrapped.shareTitle", lang)}
          >
          <div className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard
                icon={<FlaskConical className="h-5 w-5 text-blue-500" />}
                value={data.totalQueries}
                label={tx("wrapped.queries", lang)}
                gradient="from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30"
              />
              <StatCard
                icon={<Shield className="h-5 w-5 text-green-500" />}
                value={data.interactionChecks}
                label={tx("wrapped.interactionChecks", lang)}
                gradient="from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30"
              />
              <StatCard
                icon={<Calendar className="h-5 w-5 text-purple-500" />}
                value={data.totalCheckIns}
                label={tx("wrapped.checkIns", lang)}
                gradient="from-purple-50 to-fuchsia-50 dark:from-purple-950/30 dark:to-fuchsia-950/30"
              />
              <StatCard
                icon={<TrendingUp className="h-5 w-5 text-amber-500" />}
                value={data.bloodTests}
                label={tx("wrapped.bloodTests", lang)}
                gradient="from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30"
              />
            </div>

            {/* Highlight Cards */}
            <div className="rounded-2xl border bg-gradient-to-br from-primary/5 to-primary/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="h-6 w-6 text-amber-500" />
                <h3 className="text-lg font-semibold">
                  {tx("wrapped.yearSummary", lang)}
                </h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-background/80 p-4">
                  <p className="text-2xl font-bold text-primary">{data.daysActive}</p>
                  <p className="text-sm text-muted-foreground">
                    {tx("wrapped.daysActive", lang)}
                  </p>
                </div>
                <div className="rounded-xl bg-background/80 p-4">
                  <p className="text-2xl font-bold text-primary">{data.longestStreak}</p>
                  <p className="text-sm text-muted-foreground">
                    {tx("wrapped.longestStreak", lang)}
                  </p>
                </div>
              </div>
            </div>

            {/* Top Query Types */}
            {data.topQueryTypes.length > 0 && (
              <div className="rounded-2xl border p-6">
                <h3 className="mb-3 font-semibold">
                  {tx("wrapped.mostUsed", lang)}
                </h3>
                <div className="space-y-2">
                  {data.topQueryTypes.map((qt, i) => (
                    <div key={qt.type} className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground">#{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium capitalize">{qt.type.replace("_", " ")}</span>
                          <span className="text-muted-foreground">{qt.count}x</span>
                        </div>
                        <div className="mt-1 h-2 rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-primary transition-all"
                            style={{ width: `${Math.min(100, (qt.count / (data.topQueryTypes[0]?.count || 1)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
          </ShareCardBase>
        )}
    </div>
  )
}

function StatCard({ icon, value, label, gradient }: {
  icon: React.ReactNode
  value: number
  label: string
  gradient: string
}) {
  return (
    <div className={`rounded-xl border bg-gradient-to-b ${gradient} p-4 text-center`}>
      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-background/80">
        {icon}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
