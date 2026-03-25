"use client"

import { useRef, useState } from "react"
import { Share2, Download, Copy, Check, Loader2 } from "lucide-react"
import { shareCard, downloadCard, copyCardToClipboard, canNativeShare } from "@/lib/share-card"
import { tx, type Lang } from "@/lib/translations"

interface ShareCardBaseProps {
  lang: Lang
  children: React.ReactNode
  fileName?: string
  shareTitle?: string
  shareText?: string
  className?: string
  /** Show action buttons below the card */
  showActions?: boolean
}

export function ShareCardBase({
  lang,
  children,
  fileName = "phytotherapy-card.png",
  shareTitle = "Phytotherapy.ai",
  shareText,
  className = "",
  showActions = true,
}: ShareCardBaseProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState<"share" | "download" | "copy" | null>(null)
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (!cardRef.current || busy) return
    setBusy("share")
    await shareCard(
      cardRef.current,
      { title: shareTitle, text: shareText },
      { fileName }
    )
    setBusy(null)
  }

  const handleDownload = async () => {
    if (!cardRef.current || busy) return
    setBusy("download")
    await downloadCard(cardRef.current, { fileName })
    setBusy(null)
  }

  const handleCopy = async () => {
    if (!cardRef.current || busy) return
    setBusy("copy")
    const ok = await copyCardToClipboard(cardRef.current)
    setBusy(null)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className={className}>
      {/* Capturable card area */}
      <div ref={cardRef}>
        {children}
      </div>

      {/* Action buttons */}
      {showActions && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {/* Share (mobile-first) */}
          <button
            onClick={handleShare}
            disabled={!!busy}
            className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:bg-primary/5 hover:border-primary/40 active:scale-95 disabled:opacity-50"
          >
            {busy === "share" ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Share2 className="h-3 w-3" />
            )}
            {tx("share.share", lang)}
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            disabled={!!busy}
            className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:bg-primary/5 hover:border-primary/40 active:scale-95 disabled:opacity-50"
          >
            {busy === "download" ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Download className="h-3 w-3" />
            )}
            {tx("share.download", lang)}
          </button>

          {/* Copy to clipboard */}
          <button
            onClick={handleCopy}
            disabled={!!busy}
            className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:bg-primary/5 hover:border-primary/40 active:scale-95 disabled:opacity-50"
          >
            {busy === "copy" ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {copied ? tx("share.copied", lang) : tx("share.copy", lang)}
          </button>
        </div>
      )}
    </div>
  )
}
