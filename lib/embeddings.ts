// © 2026 DoctoPal — All Rights Reserved
// ============================================
// Embedding Generation & Vector Search Client
// Uses Google Gemini text-embedding-004 (768 dimensions)
// ============================================
//
// Architecture:
// 1. Content (articles, supplements, doctors) → Gemini Embedding API → 768-dim vector
// 2. Vectors stored in Supabase pgvector (content_embeddings table)
// 3. User query → embed → cosine similarity search → ranked results
//
// Why Gemini embeddings?
// - Already using Gemini as primary AI → no extra API key
// - text-embedding-004: 768 dimensions, multilingual (TR+EN)
// - Free tier: 1500 requests/min
// ============================================

import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

/**
 * Generate embedding vector for a text using Gemini
 * Returns 768-dimensional float array
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" })
    const result = await model.embedContent(text)
    return result.embedding.values
  } catch (error) {
    console.error("[EMBEDDING] Generation failed:", error)
    throw new Error("Failed to generate embedding")
  }
}

/**
 * Generate embeddings for multiple texts (batched)
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" })
  const results = await Promise.all(
    texts.map(text => model.embedContent(text))
  )
  return results.map(r => r.embedding.values)
}

// ── Searchable Content Types ──

export interface SearchableContent {
  contentType: "article" | "supplement" | "herb" | "doctor" | "tool" | "condition"
  contentId: string
  title: string
  titleTr?: string
  description?: string
  descriptionTr?: string
  href: string
  category?: string
  metadata?: Record<string, any>
  // Text to embed (concatenation of all searchable fields)
  embeddingText: string
}

/**
 * Prepare text for embedding — concatenate all relevant fields
 * for richer semantic representation
 */
export function prepareEmbeddingText(content: SearchableContent): string {
  const parts = [
    content.title,
    content.titleTr,
    content.description,
    content.descriptionTr,
    content.category,
  ].filter(Boolean)

  // Add metadata values if they're strings
  if (content.metadata) {
    Object.values(content.metadata).forEach(v => {
      if (typeof v === "string") parts.push(v)
      if (Array.isArray(v)) parts.push(v.join(", "))
    })
  }

  return parts.join(" | ")
}

// ── Semantic Search Result ──

export interface SemanticSearchResult {
  contentType: string
  contentId: string
  title: string
  titleTr: string | null
  description: string | null
  descriptionTr: string | null
  href: string
  category: string | null
  metadata: Record<string, any>
  similarity: number
  isAiMatch: boolean // true for semantic matches (vs keyword)
}
