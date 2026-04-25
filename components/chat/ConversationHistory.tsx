// © 2026 DoctoPal — All Rights Reserved
//
// F-CHAT-SIDEBAR-001 redesign — ChatGPT/Gemini/Claude-leaning sidebar:
//   - Temporal groups: Bugün / Dün / Son 7 Gün / Son 30 Gün
//   - Active conversation marker (bg-emerald-100, font-semibold)
//   - Hover state (bg-emerald-50)
//   - Destructive confirm via Dialog (no AlertDialog primitive in this
//     project — we recreate the pattern with the standard Dialog +
//     manual action layout)
//   - Optimistic delete with rollback on error + sonner toast
//   - When the active conversation is deleted, the parent is told via
//     onDelete(id, wasActive=true) so it can clear the chat surface
//
// F-CHAT-SIDEBAR-002 — pin + rename overlay on the same surface:
//   - The single Trash2 hover button is replaced with MoreHorizontal
//     (3-dot) → DropdownMenu with Pin/Unpin · Rename · Delete.
//   - Pinned conversations live in a dedicated group at the top of the
//     list, ordered LIFO by pinned_at (most recently pinned first).
//   - Pin limit is enforced server-side (5/user) — the UI surfaces 409
//     responses with a distinct toast (ch.pinLimitReached) so the
//     rollback isn't silent.
//   - Rename is inline (the title cell becomes an <input/> when the
//     row is in edit mode). Enter saves, Escape cancels, blur saves —
//     mirroring ChatGPT/Claude UX. Empty title clears custom_title back
//     to null so the query_text fallback shows again.
//   - Pinned rows swap the MessageSquare icon for a Pin glyph so users
//     can scan the group at a glance.
"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  History,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Plus,
  Trash2,
  MoreHorizontal,
  Pin,
  PinOff,
  Pencil,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  is_pinned: boolean
  custom_title: string | null
  pinned_at: string | null
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

  // Rename-flow state (F-CHAT-SIDEBAR-002). `editingId` is also the
  // open flag for the inline input — when null, the row renders the
  // normal title text.
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [savingRename, setSavingRename] = useState(false)
  const editInputRef = useRef<HTMLInputElement>(null)

  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated || !session?.user?.id) return

    setIsLoading(true)
    try {
      const supabase = createBrowserClient()
      const { data, error } = await supabase
        .from("query_history")
        .select(
          "id, query_text, query_type, response_text, created_at, is_pinned, custom_title, pinned_at",
        )
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

  // F-CHAT-SIDEBAR-003 — refresh when ChatInterface signals a new
  // conversation (or an existing row's title was updated by the
  // auto-title endpoint). The custom event fires after the chat
  // stream completes and the auto-title POST resolves; we just
  // re-pull the list so the new row + its title appear without F5.
  //
  // The handler closure is created inside the effect, so each
  // mount/unmount pair adds and removes the same reference — strict
  // mode's double-mount cleans up correctly. fetchHistory is itself
  // a useCallback, so this effect re-binds only when auth changes
  // (the dep that drives fetchHistory's identity).
  useEffect(() => {
    const handler = () => {
      fetchHistory()
    }
    window.addEventListener("conversation-updated", handler)
    return () => {
      window.removeEventListener("conversation-updated", handler)
    }
  }, [fetchHistory])

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

  // F-CHAT-SIDEBAR-002 — title fallback: custom_title wins, otherwise
  // we truncate query_text. Trim before checking so an accidental
  // whitespace-only rename doesn't render as an empty row.
  const displayTitle = (conv: ConversationEntry) => {
    const custom = conv.custom_title?.trim()
    if (custom) return custom
    return truncate(conv.query_text, 60)
  }

  // F-CHAT-SIDEBAR-001 grouping: Bugün / Dün / Son 7 Gün / Son 30 Gün.
  // F-CHAT-SIDEBAR-002 prepends a "Sabitlenenler" group when any rows
  // are pinned. Within that group we sort by pinned_at DESC (LIFO —
  // most recently pinned at top), falling back to created_at if the
  // server didn't populate pinned_at for some reason.
  const groupByDate = (entries: ConversationEntry[]) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const pinned = entries
      .filter((e) => e.is_pinned)
      .sort((a, b) => {
        const aT = a.pinned_at ?? a.created_at
        const bT = b.pinned_at ?? b.created_at
        return new Date(bT).getTime() - new Date(aT).getTime()
      })
    const unpinned = entries.filter((e) => !e.is_pinned)

    const groups: { label: string; items: ConversationEntry[] }[] = []
    if (pinned.length) {
      groups.push({ label: tx("ch.pinned", lang), items: pinned })
    }

    const todayItems: ConversationEntry[] = []
    const yesterdayItems: ConversationEntry[] = []
    const last7Items: ConversationEntry[] = []
    const last30Items: ConversationEntry[] = []

    for (const entry of unpinned) {
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

  // ── Pin flow ───────────────────────────────────────────────────
  // Optimistic toggle + rollback on error. We snapshot the list first
  // so a 4xx/5xx response can restore exact ordering. The 409 response
  // is the pin-limit-reached signal — surface a distinct toast so the
  // user knows why nothing happened.
  const handlePin = useCallback(
    async (id: string, currentlyPinned: boolean) => {
      if (!session?.access_token) return
      const willPin = !currentlyPinned
      const snapshot = conversations
      const optimisticPinnedAt = willPin ? new Date().toISOString() : null

      setConversations((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, is_pinned: willPin, pinned_at: optimisticPinnedAt } : c,
        ),
      )

      try {
        const res = await fetch(`/api/query-history/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ is_pinned: willPin }),
        })

        if (!res.ok) {
          setConversations(snapshot)
          if (res.status === 409) {
            toast.error(tx("ch.pinLimitReached", lang))
          } else {
            toast.error(tx("ch.pinError", lang))
          }
          return
        }

        toast.success(
          tx(currentlyPinned ? "ch.unpinSuccess" : "ch.pinSuccess", lang),
        )
      } catch (err) {
        console.error("Failed to toggle pin:", err)
        setConversations(snapshot)
        toast.error(tx("ch.pinError", lang))
      }
    },
    [conversations, session?.access_token, lang],
  )

  // ── Rename flow ────────────────────────────────────────────────
  // The seed value for the input is the current display title. We
  // truncate query_text to 100 (the API cap) so the user can edit
  // freely without the server bouncing the request.
  const startRename = (conv: ConversationEntry) => {
    setEditingId(conv.id)
    setEditingTitle(conv.custom_title ?? conv.query_text.slice(0, 100))
    // Wait one tick so the input mounts before we focus + select.
    setTimeout(() => editInputRef.current?.select(), 0)
  }

  const cancelRename = () => {
    setEditingId(null)
    setEditingTitle("")
  }

  const saveRename = useCallback(async () => {
    if (!editingId || !session?.access_token) return
    const id = editingId
    const newTitle = editingTitle.trim().slice(0, 100)
    const snapshot = conversations

    // Optimistic — empty input clears the rename so the row reverts to
    // its query_text fallback on the next render.
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, custom_title: newTitle || null } : c)),
    )
    setEditingId(null)
    setEditingTitle("")
    setSavingRename(true)

    try {
      const res = await fetch(`/api/query-history/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ custom_title: newTitle || null }),
      })

      if (!res.ok) {
        setConversations(snapshot)
        toast.error(tx("ch.renameError", lang))
        return
      }

      toast.success(tx("ch.renamed", lang))
    } catch (err) {
      console.error("Failed to rename conversation:", err)
      setConversations(snapshot)
      toast.error(tx("ch.renameError", lang))
    } finally {
      setSavingRename(false)
    }
  }, [editingId, editingTitle, conversations, session?.access_token, lang])

  // ── Delete flow ────────────────────────────────────────────────
  // Optimistic remove + rollback on error. We snapshot the list before
  // mutating so a 4xx/5xx response can restore exact ordering.
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
    const isEditing = editingId === conv.id

    // The leading icon swaps to a Pin glyph for pinned rows so users
    // can scan the pinned group at a glance even when the row isn't
    // grouped (e.g. mid-render before fetchHistory re-orders).
    const LeadingIcon = conv.is_pinned ? Pin : MessageSquare
    const leadingIconClass = `mt-0.5 h-3.5 w-3.5 shrink-0 ${
      isActive
        ? "text-emerald-700 dark:text-emerald-300"
        : conv.is_pinned
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-muted-foreground"
    }`

    return (
      <div
        key={conv.id}
        className={`group relative mx-1 flex items-start gap-2 rounded-md transition-colors ${
          isActive
            ? "bg-emerald-100 dark:bg-emerald-950/40"
            : "hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
        }`}
      >
        {isEditing ? (
          // Editing mode — no clickable wrapper; the input owns focus.
          <div className="flex min-w-0 flex-1 items-start gap-2 px-3 py-2">
            <LeadingIcon className={leadingIconClass} />
            <div className="min-w-0 flex-1">
              <input
                ref={editInputRef}
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    saveRename()
                  } else if (e.key === "Escape") {
                    e.preventDefault()
                    cancelRename()
                  }
                }}
                onBlur={saveRename}
                onClick={(e) => e.stopPropagation()}
                maxLength={100}
                placeholder={tx("ch.renamePlaceholder", lang)}
                disabled={savingRename}
                className="w-full rounded border border-emerald-300 bg-background px-1.5 py-0.5 text-xs leading-snug focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-60 dark:border-emerald-700"
              />
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {formatDate(conv.created_at)}
              </p>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              onSelectConversation(conv.id, conv.query_text, conv.response_text)
              onClickAfter?.()
            }}
            className="flex min-w-0 flex-1 items-start gap-2 px-3 py-2 text-left"
          >
            <LeadingIcon className={leadingIconClass} />
            <div className="min-w-0 flex-1">
              <p
                className={`text-xs leading-snug line-clamp-2 ${
                  isActive
                    ? "font-semibold text-emerald-900 dark:text-emerald-100"
                    : "font-medium text-foreground/90"
                }`}
              >
                {displayTitle(conv)}
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {formatDate(conv.created_at)}
              </p>
            </div>
          </button>
        )}

        {!isEditing && (
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={tx("ch.menuAria", lang)}
              className="absolute right-1 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/70 opacity-0 transition-opacity hover:bg-emerald-100 hover:text-emerald-700 focus:opacity-100 group-hover:opacity-100 data-[popup-open]:opacity-100 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={4} className="w-48">
              <DropdownMenuItem
                onClick={() => handlePin(conv.id, conv.is_pinned)}
              >
                {conv.is_pinned ? (
                  <PinOff className="mr-1.5" />
                ) : (
                  <Pin className="mr-1.5" />
                )}
                <span>{tx(conv.is_pinned ? "ch.unpin" : "ch.pin", lang)}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => startRename(conv)}>
                <Pencil className="mr-1.5" />
                <span>{tx("ch.rename", lang)}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setPendingDeleteId(conv.id)}
              >
                <Trash2 className="mr-1.5" />
                <span>{tx("ch.deleteConfirmAction", lang)}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
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
