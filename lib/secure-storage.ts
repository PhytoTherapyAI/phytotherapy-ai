// ============================================
// Secure Document Storage — KVKK/HIPAA Compliant
// ============================================
//
// Architecture:
// 1. Client → API route (server-side validation)
// 2. API route → Supabase Storage (AES-256 encrypted at rest)
// 3. Files stored with hashed paths (no PII in path)
// 4. DB stores only encrypted reference (not raw path)
// 5. Viewing via time-limited signed URLs (15min expiry)
//
// Supabase Storage bucket: "verification-documents" (private, no public access)
// Encryption: Supabase uses AES-256 at rest by default on all storage
// ============================================

import crypto from "crypto"

// ── Constants ──
export const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const
export const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"] as const
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const SIGNED_URL_EXPIRY = 15 * 60 // 15 minutes in seconds
export const STORAGE_BUCKET = "verification-documents"

// ── File Validation ──
export interface ValidationResult {
  valid: boolean
  error?: string
}

export function validateFile(
  fileName: string,
  fileSize: number,
  mimeType: string
): ValidationResult {
  // 1. Size check
  if (fileSize > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large. Maximum ${MAX_FILE_SIZE / (1024 * 1024)}MB allowed.` }
  }
  if (fileSize === 0) {
    return { valid: false, error: "Empty file." }
  }

  // 2. MIME type check
  if (!ALLOWED_MIME_TYPES.includes(mimeType as any)) {
    return { valid: false, error: `Invalid file type: ${mimeType}. Only PDF, JPG, PNG allowed.` }
  }

  // 3. Extension check (defense in depth — don't trust MIME alone)
  const ext = "." + fileName.split(".").pop()?.toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(ext as any)) {
    return { valid: false, error: `Invalid file extension: ${ext}. Only .pdf, .jpg, .png allowed.` }
  }

  // 4. Magic bytes check for content verification
  // (done separately with buffer data — see validateFileContent)

  return { valid: true }
}

// ── Magic Bytes Validation (Content Sniffing Defense) ──
const MAGIC_BYTES: Record<string, number[][]> = {
  "application/pdf": [[0x25, 0x50, 0x44, 0x46]], // %PDF
  "image/jpeg": [[0xFF, 0xD8, 0xFF]],
  "image/png": [[0x89, 0x50, 0x4E, 0x47]], // .PNG
}

export function validateFileContent(buffer: Buffer, declaredMimeType: string): boolean {
  const patterns = MAGIC_BYTES[declaredMimeType]
  if (!patterns) return false
  return patterns.some(pattern =>
    pattern.every((byte, i) => buffer[i] === byte)
  )
}

// ── Secure Path Generation ──
// Files are stored with hashed paths to prevent PII exposure in storage
// Format: {userId_hash}/{timestamp}_{random}.{ext}
export function generateSecurePath(userId: string, fileName: string): string {
  const userHash = crypto.createHash("sha256").update(userId).digest("hex").substring(0, 12)
  const timestamp = Date.now()
  const random = crypto.randomBytes(8).toString("hex")
  const ext = fileName.split(".").pop()?.toLowerCase() || "bin"
  return `${userHash}/${timestamp}_${random}.${ext}`
}

// ── Encrypt Reference for Database Storage ──
// We don't store raw storage paths in the DB
// Instead, we store an encrypted version that only the server can decrypt
const ENCRYPTION_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 32) || "default-key-change-in-production!"
const ENCRYPTION_IV_LENGTH = 16

export function encryptReference(plainText: string): string {
  const iv = crypto.randomBytes(ENCRYPTION_IV_LENGTH)
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY, "utf-8"), iv)
  let encrypted = cipher.update(plainText, "utf-8", "hex")
  encrypted += cipher.final("hex")
  return iv.toString("hex") + ":" + encrypted
}

export function decryptReference(encryptedText: string): string {
  const [ivHex, encrypted] = encryptedText.split(":")
  if (!ivHex || !encrypted) throw new Error("Invalid encrypted reference")
  const iv = Buffer.from(ivHex, "hex")
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY, "utf-8"), iv)
  let decrypted = decipher.update(encrypted, "hex", "utf-8")
  decrypted += decipher.final("utf-8")
  return decrypted
}

// ── Audit Log Helper ──
export interface AuditLogEntry {
  action: "upload" | "view" | "delete" | "verify" | "reject"
  userId: string
  documentId: string
  adminId?: string
  ipAddress?: string
  timestamp: string
  details?: string
}

export function createAuditEntry(
  action: AuditLogEntry["action"],
  userId: string,
  documentId: string,
  extra?: Partial<AuditLogEntry>
): AuditLogEntry {
  return {
    action,
    userId,
    documentId,
    timestamp: new Date().toISOString(),
    ...extra,
  }
}
