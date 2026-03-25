"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"
import {
  Search,
  Star,
  StarOff,
  Trash2,
  Filter,
  Clock,
  FlaskConical,
  Shield,
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

interface HistoryItem {
  id: string
  query_text: string
  response_text: string | null
  query_type: string | null
  is_favorite: boolean
  created_at: string
}

const typeIcons: Record<string, typeof Shield> = {
  interaction: Shield,
  general: FlaskConical,
  blood_test: FileText,
}

export default function HistoryPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { lang } = useLang()
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "favorites">("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const supabase = createBrowserClient()
    const { data } = await supabase
      .from("query_history")
      .select("id, query_text, response_text, query_type, is_favorite, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200)
    setItems((data as HistoryItem[]) || [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/auth/login")
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (user) fetchHistory()
  }, [user, fetchHistory])

  const toggleFavorite = async (id: string, current: boolean) => {
    const supabase = createBrowserClient()
    await supabase
      .from("query_history")
      .update({ is_favorite: !current })
      .eq("id", id)
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_favorite: !current } : item))
    )
  }

  const deleteItem = async (id: string) => {
    const supabase = createBrowserClient()
    await supabase.from("query_history").delete().eq("id", id)
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const filtered = items.filter((item) => {
    if (filter === "favorites" && !item.is_favorite) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        item.query_text.toLowerCase().includes(q) ||
        (item.response_text && item.response_text.toLowerCase().includes(q))
      )
    }
    return true
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          {tx("history.title", lang)}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{tx("history.subtitle", lang)}</p>
      </div>

      {/* Search & Filter */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={tx("history.search", lang)}
            className="w-full rounded-lg border bg-background py-2 pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {tx("history.all", lang)}
          </button>
          <button
            onClick={() => setFilter("favorites")}
            className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              filter === "favorites" ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Star className="h-3.5 w-3.5" />
            {tx("history.favorites", lang)}
          </button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center">
          <Clock className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{tx("history.noResults", lang)}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const Icon = typeIcons[item.query_type || "general"] || FlaskConical
            const isExpanded = expandedId === item.id
            return (
              <div key={item.id} className="rounded-xl border bg-card transition-all hover:shadow-sm">
                <div
                  className="flex cursor-pointer items-start gap-3 p-4"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {tx(`history.${item.query_type || "general"}`, lang)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium line-clamp-2">{item.query_text}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id, item.is_favorite) }}
                      className="rounded-md p-1 transition-colors hover:bg-muted"
                      title={item.is_favorite ? tx("history.unfavorite", lang) : tx("history.favorite", lang)}
                    >
                      {item.is_favorite ? (
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ) : (
                        <StarOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteItem(item.id) }}
                      className="rounded-md p-1 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                      title={tx("history.delete", lang)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
                {isExpanded && item.response_text && (
                  <div className="border-t px-4 py-3">
                    <div className="max-h-60 overflow-y-auto text-sm text-muted-foreground whitespace-pre-wrap">
                      {item.response_text.slice(0, 2000)}
                      {item.response_text.length > 2000 && "..."}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
