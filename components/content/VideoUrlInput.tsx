"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { parseVideoUrl, type ParsedVideo } from "@/lib/video-utils"
import { Video, Check, AlertCircle, Youtube, X, ExternalLink } from "lucide-react"
import { tx, type Lang } from "@/lib/translations"

interface VideoUrlInputProps {
  value: string
  onChange: (url: string, parsed: ParsedVideo | null) => void
  lang?: string
}

export function VideoUrlInput({ value, onChange, lang = "en" }: VideoUrlInputProps) {
  const [parsed, setParsed] = useState<ParsedVideo | null>(null)
  const [isFocused, setIsFocused] = useState(false)

  const handleChange = useCallback((url: string) => {
    const result = url ? parseVideoUrl(url) : null
    setParsed(result)
    onChange(url, result)
  }, [onChange])

  // Parse on mount if value exists
  useEffect(() => {
    if (value) handleChange(value)
  }, [])

  const l = lang as Lang
  const t = {
    label: tx("video.label", l),
    placeholder: tx("video.placeholder", l),
    supported: tx("video.supported", l),
    valid: tx("video.valid", l),
    invalid: tx("video.invalid", l),
    preview: tx("video.preview", l),
    open: tx("video.openOriginal", l),
  }

  const isValid = parsed?.isValid
  const hasInput = value.length > 5

  return (
    <div className="space-y-3">
      {/* Label */}
      <label className="text-sm font-medium flex items-center gap-2">
        <Video className="w-4 h-4 text-muted-foreground" />
        {t.label}
      </label>

      {/* Input with status indicator */}
      <div className="relative">
        <Input
          value={value}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={t.placeholder}
          className={`h-12 pr-24 text-base transition-all ${
            hasInput && isValid
              ? "border-green-500 focus-visible:ring-green-500/20"
              : hasInput && !isValid
              ? "border-red-400 focus-visible:ring-red-400/20"
              : ""
          }`}
        />

        {/* Status badge inside input */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {hasInput && isValid && (
            <Badge className="bg-green-500/10 text-green-600 border-green-500/30 text-[10px] gap-1">
              <Check className="w-3 h-3" />
              {parsed?.platform === "youtube" ? "YouTube" : "Vimeo"}
            </Badge>
          )}
          {hasInput && !isValid && (
            <Badge className="bg-red-500/10 text-red-500 border-red-500/30 text-[10px] gap-1">
              <AlertCircle className="w-3 h-3" />
            </Badge>
          )}
          {value && (
            <button onClick={() => handleChange("")} className="p-1 hover:bg-muted rounded">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Helper text */}
      {!hasInput && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Youtube className="w-3 h-3" /> {t.supported}
        </p>
      )}

      {/* Validation error */}
      {hasInput && !isValid && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {t.invalid}
        </p>
      )}

      {/* Live Preview */}
      {isValid && parsed && (
        <div className="rounded-xl overflow-hidden border border-border bg-black">
          {/* Preview header */}
          <div className="flex items-center justify-between px-3 py-2 bg-muted/50">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-green-500" />
              <span className="text-xs font-medium text-foreground">{t.preview}</span>
              <Badge variant="outline" className="text-[10px]">
                {parsed.platform === "youtube" ? "YouTube" : "Vimeo"} · {parsed.videoId}
              </Badge>
            </div>
            <a href={parsed.originalUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              {t.open} <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Embed iframe */}
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={parsed.embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              title="Video preview"
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Standalone Video Player Card (for article reader view) ──
interface VideoPlayerCardProps {
  platform: "youtube" | "vimeo"
  videoId: string
  title?: string
  className?: string
}

export function VideoPlayerCard({ platform, videoId, title, className = "" }: VideoPlayerCardProps) {
  const embedUrl = platform === "youtube"
    ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
    : `https://player.vimeo.com/video/${videoId}?byline=0&portrait=0`

  return (
    <div className={`rounded-xl overflow-hidden border border-border bg-black ${className}`}>
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          title={title || "Video"}
        />
      </div>
      {title && (
        <div className="px-4 py-3 bg-card">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground capitalize">{platform}</p>
        </div>
      )}
    </div>
  )
}
