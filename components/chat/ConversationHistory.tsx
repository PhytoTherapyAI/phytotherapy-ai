// © 2026 DoctoPal — All Rights Reserved
//
// F-CHAT-SIDEBAR-001 redesign — ChatGPT/Gemini/Claude-leaning sidebar:
//   - Temporal groups: Bugün / Dün / Son 7 Gün / Son 30 Gün
//   - Active conversation marker (bg-emerald-100, font-semibold)
//   - Hover state (bg-emerald-50)
//   - Trash2 button on the right, only visible on hover (group-hover)
//   - Destructive confirm via Dialog (no AlertDialog primitive in this
//     project — we recreate the pattern with the standard Dialog +
//     manual action layout)
//   - Optimistic delete with rollback on error + sonner toast
//   - When the active conversation is deleted, the parent is told via
//     onDelete(id, wasActive=true) so it can clear the chat surface
"use client"

import { useState, useEffect, useCallback } from "react"
import {
  History,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"
import { useLang } from "@/components/layout/language-toggle"
import { tx } from "@/lib/translations"
import { createBrowserClient } from "@/lib/supabase"

interface ConversationEntry {
  id: string
  query_text: string
  query_type: string
  response_text: string | null
  created_at: string
}

interface ConversationHistoryProps {
  /** Called when a row is selected. Receives the conversation id so the
   *  parent can mark it active in subsequent mounts. */
  onSelectConversation: (id: string, query: string, response: string | null) => void
  onNewConversation?: () => void
  /** Render as a persistent sidebar instead of toggle+drawer */
  sidebar?: boolean
  /** Currently-loaded conversation id — drives the active row marker. */
  currentQueryId?: string | null
  /** Fired after a successful DELETE so the parent can decide whether
   *  to clear the chat (when the deleted row was the active one). */
  onDelete?: (id: string, wasActive: boolean) => void
}

export function ConversationHistory({
  onSelectConversation,
  onNewConversation,
  sidebar,
  currentQueryId,
  onDelete,
}: ConversationHistoryProps) {
  const { isAuthenticated, session } = useAuth()
  const { lang } = useLang()
  const [isOpen, setIsOpen] = useState(false)
  const [conversations, setConversations] = useState<ConversationEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Delete-flow state. `pendingDeleteId` doubles as the dialog open
  // flag — when null the dialog is closed.
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated || !session?.user?.id) return

    setIsLoading(true)
    try {
      const supabase = createBrowserClient()
      const { data, error } = await supabase
        .from("query_history")
        .select("id, query_text, query_type, response_text, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(30)

      if (error) {
        console.error("Error fetching history:", error)
        return
      }

      setConversations(data || [])
    } catch (err) {
      console.error("Failed to fetch conversation history:", err)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, session?.user?.id])

  // Fetch on mount for sidebar mode, or when panel opens for drawer mode
  useEffect(() => {
    if (sidebar || isOpen) {
      fetchHistory()
    }
  }, [sidebar, isOpen, fetchHistory])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return tx("time.justNow", lang)
    if (diffMins < 60) return `${diffMins} ${tx("time.minsAgo", lang)}`
    if (diffHours < 24) return `${diffHours} ${tx("time.hoursAgo", lang)}`
    if (diffDays < 7) return `${diffDays} ${tx("time.daysAgo", lang)}`
    return date.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const truncate = (text: string, maxLen: number) => {
    if (text.length <= maxLen) return text
    return text.substring(0, maxLen).trim() + "..."
  }

  // F-CHAT-SIDEBAR-001 grouping:
  //   Bugün / Dün / Son 7 Gün (2-7 days back) / Son 30 Gün (8-30 days back).
  //   Anything older than 30 days falls off naturally — the fetch is
  //   capped at 30 rows, so we don't render an "older" bucket.
  const groupByDate = (entries: ConversationEntry[]) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const groups: { label: string; items: ConversationEntry[] }[] = []
    const todayItems: ConversationEntry[] = []
    const yesterdayItems: ConversationEntry[] = []
    const last7Items: ConversationEntry[] = []
    const last30Items: ConversationEntry[] = []

    for (const entry of entries) {
      const date = new Date(entry.created_at)
      if (date.toDateString() === today.toDateString()) {
        todayItems.push(entry)
      } else if (date.toDateString() === yesterday.toDateString()) {
        yesterdayItems.push(entry)
      } else if (date >= sevenDaysAgo) {
        last7Items.push(entry)
      } else if (date >= thirtyDaysAgo) {
        last30Items.push(entry)
      }
      // older than 30d → drop (capped fetch covers it)
    }

    if (todayItems.length) groups.push({ label: tx("ch.today", lang), items: todayItems })
    if (yesterdayItems.length) groups.push({ label: tx("ch.yesterday", lang), items: yesterdayItems })
    if (last7Items.length) groups.push({ label: tx("ch.last7Days", lang), items: last7Items })
    if (last30Items.length) groups.push({ label: tx("ch.last30Days", lang), items: last30Items })

    return groups
  }

  // ── Delete flow ────────────────────────────────────────────────
  // Optimistic remove + rollback on error. We snapshot the list before
  // mutating so a 4xx/5xx response can restore exact ordering.
  const requestDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation() // don't trigger the row's select handler
    setPendingDeleteId(id)
  }

  const confirmDelete = useCallback(async () => {
    if (!pendingDeleteId || !session?.access_token) return
    const idToDelete = pendingDeleteId
    const wasActive = currentQueryId === idToDelete
    const snapshot = conversations
    setIsDeleting(true)

    // Optimistic remove
    setConversations((prev) => prev.filter((c) => c.id !== idToDelete))

    try {
      const res = await fetch(`/api/query-history/${idToDelete}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      if (!res.ok) {
        // Restore previous state and warn the user.
        setConversations(snapshot)
        toast.error(tx("ch.deleteError", lang))
        return
      }

      toast.success(tx("ch.deleted", lang))
      // If the active row vanished, the parent needs to clear the
      // chat + the URL ?q= parameter. We don't navigate from inside
      // the sidebar — keeps state ownership in the page.
      onDelete?.(idToDelete, wasActive)
    } catch (err) {
      console.error("Failed to delete conversation:", err)
      setConversations(snapshot)
      toast.error(tx("ch.deleteError", lang))
    } finally {
      setIsDeleting(false)
      setPendingDeleteId(null)
    }
  }, [pendingDeleteId, session?.access_token, conversations, currentQueryId, lang, onDelete])

  if (!isAuthenticated) return null

  // ── Row renderer (shared between sidebar + drawer modes) ───────
  const renderRow = (
    conv: ConversationEntry,
    onClickAfter?: () => void,
  ) => {
    const isActive = currentQueryId === conv.id
    return (
      <div
        key={conv.id}
        className={`group relative mx-1 flex items-start gap-2 rounded-md transition-colors ${
          isActive
            ? "bg-emerald-100 dark:bg-emerald-950/40"
            : "hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
        }`}
      >
        <button
          type="button"
          onClick={() => {
            onSelectConversation(conv.id, conv.query_text, conv.response_text)
            onClickAfter?.()
          }}
          className="flex min-w-0 flex-1 items-start gap-2 px-3 py-2 text-left"
        >
          <MessageSquare
            className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
              isActive ? "text-emerald-700 dark:text-emerald-300" : "text-muted-foreground"
            }`}
          />
          <div className="min-w-0 flex-1">
            <p
              className={`text-xs leading-snug line-clamp-2 ${
                isActive
                  ? "font-semibold text-emerald-900 dark:text-emerald-100"
                  : "font-medium text-foreground/90"
              }`}
            >
              {truncate(conv.query_text, 60)}
            </p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              {formatDate(conv.created_at)}
            </p>
          </div>
        </button>
        <button
          type="button"
          onClick={(e) => requestDelete(conv.id, e)}
          className="absolute right-1 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/70 opacity-0 transition-opacity hover:bg-red-100 hover:text-red-600 focus:opacity-100 group-hover:opacity-100 dark:hover:bg-red-950/40 dark:hover:text-red-400"
          aria-label={tx("ch.deleteAria", lang)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  // Confirm dialog rendered once at the component root regardless of
  // sidebar vs drawer mode.
  const confirmDialog = (
    <Dialog
      open={pendingDeleteId !== null}
      onOpenChange={(v) => {
        if (!v && !isDeleting) setPendingDeleteId(null)
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-red-600" />
            {tx("ch.deleteConfirmTitle", lang)}
          </DialogTitle>
          <DialogDescription>
            {tx("ch.deleteConfirmDesc", lang)}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPendingDeleteId(null)}
            disabled={isDeleting}
          >
            {tx("ch.deleteCancel", lang)}
          </Button>
          <Button
            size="sm"
            onClick={confirmDelete}
            disabled={isDeleting}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {isDeleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            <span className="ml-1.5">{tx("ch.deleteConfirmAction", lang)}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  // ─── SIDEBAR MODE ───
  if (sidebar) {
    const groups = groupByDate(conversations)
    return (
      <div className="flex h-full flex-col border-r bg-muted/30">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-3 py-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">{tx("ch.title", lang)}</h3>
          </div>
          {onNewConversation && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onNewConversation}
              className="h-7 w-7"
              title={tx("ch.newChat", lang)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <MessageSquare className="mb-3 h-8 w-8 text-muted-foreground/70" />
              <p className="text-sm font-medium text-muted-foreground">
                {tx("ch.empty", lang)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                {tx("ch.emptyDesc", lang)}
              </p>
            </div>
          ) : (
            <div className="py-1 space-y-0.5">
              {groups.map((group) => (
                <div key={group.label}>
                  <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {group.label}
                  </p>
                  {group.items.map((conv) => renderRow(conv))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {conversations.length > 0 && (
          <div className="border-t px-3 py-2">
            <p className="text-center text-[10px] text-muted-foreground">
              {conversations.length} {tx("ch.conversations", lang)}
            </p>
          </div>
        )}

        {confirmDialog}
      </div>
    )
  }

  // ─── DRAWER MODE (mobile / toggle button) ───
  const drawerGroups = groupByDate(conversations)
  return (
    <>
      {/* Toggle button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
        title={tx("chat.historyTitle", lang)}
      >
        <History className="h-4 w-4" />
        <span className="hidden sm:inline">{tx("ch.history", lang)}</span>
        {isOpen ? (
          <ChevronLeft className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
      </Button>

      {/* Slide-out panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="relative ml-auto flex h-full w-80 flex-col border-l bg-background shadow-xl sm:w-96">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">{tx("ch.title", lang)}</h3>
              </div>
              <div className="flex items-center gap-1">
                {onNewConversation && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      onNewConversation()
                      setIsOpen(false)
                    }}
                    className="h-8 w-8"
                    title={tx("ch.newChat", lang)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <MessageSquare className="mb-3 h-8 w-8 text-muted-foreground/70" />
                  <p className="text-sm font-medium text-muted-foreground">
                    {tx("ch.empty", lang)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    {tx("ch.emptyDesc", lang)}
                  </p>
                </div>
              ) : (
                <div className="py-1 space-y-0.5">
                  {drawerGroups.map((group) => (
                    <div key={group.label}>
                      <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                        {group.label}
                      </p>
                      {group.items.map((conv) =>
                        renderRow(conv, () => setIsOpen(false)),
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {conversations.length > 0 && (
              <div className="border-t px-4 py-2">
                <p className="text-center text-xs text-muted-foreground">
                  {tx("ch.showingLast", lang)} {conversations.length}{" "}
                  {tx("ch.conversations", lang)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {confirmDialog}
    </>
  )
}
