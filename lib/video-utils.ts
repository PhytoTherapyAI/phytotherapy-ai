// © 2026 Phytotherapy.ai — All Rights Reserved
// ============================================
// Video URL Parser & Validator
// Supports: YouTube (all formats) + Vimeo
// Stores only platformId + videoId (zero bandwidth)
// ============================================

export type VideoPlatform = "youtube" | "vimeo" | "unknown"

export interface ParsedVideo {
  platform: VideoPlatform
  videoId: string
  embedUrl: string
  thumbnailUrl: string
  originalUrl: string
  isValid: boolean
}

// ── YouTube Regex ──
// Matches:
//   https://www.youtube.com/watch?v=dQw4w9WgXcQ
//   https://youtube.com/watch?v=dQw4w9WgXcQ&t=120
//   https://youtu.be/dQw4w9WgXcQ
//   https://youtu.be/dQw4w9WgXcQ?t=120
//   https://www.youtube.com/embed/dQw4w9WgXcQ
//   https://www.youtube.com/v/dQw4w9WgXcQ
//   https://youtube.com/shorts/dQw4w9WgXcQ
//   https://m.youtube.com/watch?v=dQw4w9WgXcQ
const YOUTUBE_PATTERNS = [
  /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
]

// ── Vimeo Regex ──
// Matches:
//   https://vimeo.com/123456789
//   https://www.vimeo.com/123456789
//   https://player.vimeo.com/video/123456789
//   https://vimeo.com/channels/staffpicks/123456789
const VIMEO_PATTERNS = [
  /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/,
  /(?:https?:\/\/)?player\.vimeo\.com\/video\/(\d+)/,
  /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/channels\/\w+\/(\d+)/,
]

/**
 * Parse any YouTube or Vimeo URL and extract platform + videoId
 */
export function parseVideoUrl(url: string): ParsedVideo {
  const trimmed = url.trim()
  if (!trimmed) return { platform: "unknown", videoId: "", embedUrl: "", thumbnailUrl: "", originalUrl: url, isValid: false }

  // Try YouTube patterns
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = trimmed.match(pattern)
    if (match?.[1]) {
      const videoId = match[1]
      return {
        platform: "youtube",
        videoId,
        embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        originalUrl: trimmed,
        isValid: true,
      }
    }
  }

  // Try Vimeo patterns
  for (const pattern of VIMEO_PATTERNS) {
    const match = trimmed.match(pattern)
    if (match?.[1]) {
      const videoId = match[1]
      return {
        platform: "vimeo",
        videoId,
        embedUrl: `https://player.vimeo.com/video/${videoId}?byline=0&portrait=0`,
        thumbnailUrl: `https://vumbnail.com/${videoId}.jpg`,
        originalUrl: trimmed,
        isValid: true,
      }
    }
  }

  return { platform: "unknown", videoId: "", embedUrl: "", thumbnailUrl: "", originalUrl: trimmed, isValid: false }
}

/**
 * Validate if a URL is a supported video platform
 */
export function isValidVideoUrl(url: string): boolean {
  return parseVideoUrl(url).isValid
}

/**
 * Database-ready video data (minimal — no full URL stored)
 */
export interface VideoRecord {
  platform: VideoPlatform
  videoId: string
}

export function toVideoRecord(parsed: ParsedVideo): VideoRecord | null {
  if (!parsed.isValid) return null
  return { platform: parsed.platform, videoId: parsed.videoId }
}

/**
 * Reconstruct embed URL from stored record
 */
export function getEmbedUrl(record: VideoRecord): string {
  if (record.platform === "youtube") {
    return `https://www.youtube.com/embed/${record.videoId}?rel=0&modestbranding=1`
  }
  if (record.platform === "vimeo") {
    return `https://player.vimeo.com/video/${record.videoId}?byline=0&portrait=0`
  }
  return ""
}

/**
 * Get thumbnail URL from stored record
 */
export function getThumbnailUrl(record: VideoRecord): string {
  if (record.platform === "youtube") {
    return `https://img.youtube.com/vi/${record.videoId}/hqdefault.jpg`
  }
  if (record.platform === "vimeo") {
    return `https://vumbnail.com/${record.videoId}.jpg`
  }
  return ""
}
