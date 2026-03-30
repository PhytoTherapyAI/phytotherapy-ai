// © 2026 Phytotherapy.ai — All Rights Reserved
// ============================================
// Input Sanitization — XSS & injection prevention
// ============================================

/**
 * Strip HTML tags and dangerous characters from user input.
 * Keeps medical characters like /, -, +, ., () which are common in drug names.
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return ""

  return input
    // Remove HTML tags
    .replace(/<[^>]*>/g, "")
    // Remove script-like patterns
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/data:\s*text\/html/gi, "")
    // Remove null bytes
    .replace(/\0/g, "")
    // Trim whitespace
    .trim()
}

/**
 * Sanitize an array of strings (e.g., medication list)
 */
export function sanitizeArray(arr: unknown): string[] {
  if (!Array.isArray(arr)) return []
  return arr
    .filter((item): item is string => typeof item === "string")
    .map(sanitizeInput)
    .filter((s) => s.length > 0)
}

/**
 * Validate that input doesn't contain suspicious patterns
 * Returns true if input looks safe
 */
export function isCleanInput(input: string): boolean {
  if (typeof input !== "string") return false

  const suspicious = [
    /<script/i,
    /javascript:/i,
    /on(error|load|click|mouseover)\s*=/i,
    /eval\s*\(/i,
    /document\.(cookie|write|location)/i,
    /window\.(location|open)/i,
    /\bfetch\s*\(/i,
    /\bXMLHttpRequest/i,
  ]

  return !suspicious.some((pattern) => pattern.test(input))
}
