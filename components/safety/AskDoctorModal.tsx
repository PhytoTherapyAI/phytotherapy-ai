// © 2026 DoctoPal — All Rights Reserved
//
// F-SAFETY-002.3: Mailto fallback modal for the "Doktoruma Sor" button.
//
// Background: Session 45 surfaced a silent-fail case — Opera GX on
// Windows has no default mail handler registered, so
// `window.location.href = mailto:...` did nothing and the user was left
// staring at an unchanged banner. Detection strategies (setTimeout +
// visibilitychange, UA sniffing) are unreliable on PWAs and mobile
// Safari, so we take the deterministic path: every "Doktoruma Sor"
// click opens this modal with three paths:
//
//   1. Copy the message — always works, uses navigator.clipboard; falls
//      back to a selectable textarea for older browsers / insecure
//      contexts.
//   2. Open in mail app — builds the same mailto URL the banner used
//      before. If the OS has no handler, the modal stays open and the
//      user drops into path 1 or 3.
//   3. Enter a doctor email — optional input; when filled, prepends the
//      address to the mailto URL so the mail app lands on a pre-addressed
//      compose view.
//
// The always-visible hint below the action row makes (1) discoverable
// before the user attempts (2) — important because clicking (2) with no
// handler is silent, and a second-guess user would otherwise wonder if
// the button is broken.
"use client"

import { useCallback, useMemo, useState } from "react"
import { Stethoscope, ClipboardCopy, Check, Mail, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { tx } from "@/lib/translations"
import {
  buildDoctorEmailBody,
  buildDoctorEmailSubject,
} from "@/lib/safety/sbar-interaction-template"
import type { EdgeItem } from "@/lib/safety/check-med-interactions"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  /**
   * Combined dangerous + caution edges from the latest interaction
   * check. Caller passes both arrays merged — the banner already
   * receives them separately from the alert row, so combining here
   * is a 1-line concat at the call site.
   */
  edges: EdgeItem[]
  summary?: string
  patientName?: string | null
  lang: "tr" | "en"
}

const COPIED_DURATION_MS = 2_000

export function AskDoctorModal({
  open,
  onOpenChange,
  edges,
  summary,
  patientName,
  lang,
}: Props) {
  const [doctorEmail, setDoctorEmail] = useState("")
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle")

  // Build body + subject once per edges / summary / patientName / lang
  // change. The template helpers aren't cheap (category grouping +
  // i18n branching) but the modal re-renders on each keystroke in the
  // email input; memoisation avoids thrashing there.
  const body = useMemo(
    () =>
      buildDoctorEmailBody({
        edges,
        summary,
        patientName: patientName ?? null,
        lang,
      }),
    [edges, summary, patientName, lang],
  )

  const subject = useMemo(
    () => buildDoctorEmailSubject(edges, lang),
    [edges, lang],
  )

  const handleCopy = useCallback(async () => {
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        throw new Error("clipboard unavailable")
      }
      await navigator.clipboard.writeText(body)
      setCopyState("copied")
      toast.success(tx("safety.askDoctor.copied", lang))
      window.setTimeout(() => setCopyState("idle"), COPIED_DURATION_MS)
    } catch {
      // Non-secure context, permission denied, or old browser —
      // the textarea is selectable so the user can Ctrl+C manually.
      toast.error(tx("safety.askDoctor.copyError", lang))
    }
  }, [body, lang])

  const handleOpenMail = useCallback(() => {
    if (typeof window === "undefined") return
    const trimmedEmail = doctorEmail.trim()
    const encodedSubject = encodeURIComponent(subject)
    const encodedBody = encodeURIComponent(body)
    const url = trimmedEmail
      ? `mailto:${encodeURIComponent(trimmedEmail)}?subject=${encodedSubject}&body=${encodedBody}`
      : `mailto:?subject=${encodedSubject}&body=${encodedBody}`
    // Intentionally NO success detection — Opera GX + platforms without
    // a mail handler fail silently here, and the modal stays open so
    // the user can fall back to Copy.
    window.location.href = url
  }, [body, doctorEmail, subject])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            {tx("safety.askDoctor.title", lang)}
          </DialogTitle>
          <DialogDescription>
            {tx("safety.askDoctor.intro", lang)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Doctor email (optional) */}
          <div className="space-y-1.5">
            <Label htmlFor="ask-doctor-email" className="text-xs">
              {tx("safety.askDoctor.emailLabel", lang)}
            </Label>
            <div className="relative">
              <Mail className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="ask-doctor-email"
                type="email"
                placeholder={tx("safety.askDoctor.emailPlaceholder", lang)}
                className="pl-8 h-9 text-sm"
                value={doctorEmail}
                onChange={(e) => setDoctorEmail(e.target.value)}
                autoComplete="email"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Message body preview (read-only but selectable) */}
          <div className="space-y-1.5">
            <Label htmlFor="ask-doctor-body" className="text-xs">
              {tx("safety.askDoctor.bodyLabel", lang)}
            </Label>
            <textarea
              id="ask-doctor-body"
              readOnly
              value={body}
              className="w-full h-56 rounded-md border border-input bg-muted/30 px-3 py-2 text-[12px] font-mono leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              onFocus={(e) => e.currentTarget.select()}
            />
          </div>

          {/* Action row — copy + open mail */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleCopy}
              aria-live="polite"
            >
              {copyState === "copied" ? (
                <>
                  <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700 dark:text-emerald-400">
                    {tx("safety.askDoctor.copied", lang)}
                  </span>
                </>
              ) : (
                <>
                  <ClipboardCopy className="mr-1.5 h-3.5 w-3.5" />
                  {tx("safety.askDoctor.copyButton", lang)}
                </>
              )}
            </Button>
            <Button
              type="button"
              size="sm"
              className="flex-1"
              onClick={handleOpenMail}
            >
              <Mail className="mr-1.5 h-3.5 w-3.5" />
              {tx("safety.askDoctor.openMailButton", lang)}
            </Button>
          </div>

          {/* Always-visible hint — discoverability of the copy path
              BEFORE the user tries and fails the mail handler. */}
          <div className="rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 px-3 py-2 text-[11px] leading-relaxed text-amber-900 dark:text-amber-200 flex items-start gap-2">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <span>{tx("safety.askDoctor.hint", lang)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
