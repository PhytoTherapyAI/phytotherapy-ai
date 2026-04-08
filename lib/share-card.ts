// © 2026 DoctoPal — All Rights Reserved
// ============================================
// Share Card Engine — Sprint 11
// ============================================
// Canvas-based card image generation + Web Share API
// Used by all shareable cards (BioAge, Interaction, Protocol, etc.)

export interface ShareCardOptions {
  fileName?: string
  quality?: number // 0-1 for JPEG
}

/**
 * Capture a DOM element as a PNG blob using html2canvas-pro
 */
export async function captureCardAsBlob(
  element: HTMLElement,
  options?: ShareCardOptions
): Promise<Blob | null> {
  try {
    const html2canvas = (await import("html2canvas-pro")).default
    const canvas = await html2canvas(element, {
      scale: 2, // Retina quality
      backgroundColor: null,
      useCORS: true,
      logging: false,
    })
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        "image/png",
        options?.quality ?? 1
      )
    })
  } catch {
    return null
  }
}

/**
 * Download card as PNG image
 */
export async function downloadCard(
  element: HTMLElement,
  options?: ShareCardOptions
): Promise<boolean> {
  const blob = await captureCardAsBlob(element, options)
  if (!blob) return false

  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = options?.fileName ?? "phytotherapy-card.png"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  return true
}

/**
 * Share card via Web Share API (mobile) or fallback to download
 */
export async function shareCard(
  element: HTMLElement,
  shareData?: { title?: string; text?: string },
  options?: ShareCardOptions
): Promise<boolean> {
  const blob = await captureCardAsBlob(element, options)
  if (!blob) return false

  const fileName = options?.fileName ?? "phytotherapy-card.png"
  const file = new File([blob], fileName, { type: "image/png" })

  // Try Web Share API first (mobile-friendly)
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        title: shareData?.title ?? "DoctoPal",
        text: shareData?.text,
        files: [file],
      })
      return true
    } catch (err) {
      // User cancelled or share failed — fall through to download
      if ((err as Error).name === "AbortError") return false
    }
  }

  // Fallback: download the image
  return downloadCard(element, options)
}

/**
 * Copy card image to clipboard
 */
export async function copyCardToClipboard(
  element: HTMLElement
): Promise<boolean> {
  const blob = await captureCardAsBlob(element)
  if (!blob) return false

  try {
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob }),
    ])
    return true
  } catch {
    return false
  }
}

/**
 * Check if Web Share API with files is available
 */
export function canNativeShare(): boolean {
  if (typeof navigator === "undefined") return false
  return !!navigator.share && !!navigator.canShare
}
