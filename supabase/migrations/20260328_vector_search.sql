-- ============================================
-- Semantic Vector Search — pgvector Extension
-- ============================================
-- Supabase has pgvector built-in. Enable it:

CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- Content Embeddings Table
-- Stores vector representations of all searchable content
-- ============================================

CREATE TABLE IF NOT EXISTS content_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Content reference
  content_type TEXT NOT NULL CHECK (content_type IN ('article', 'supplement', 'herb', 'doctor', 'tool', 'condition')),
  content_id TEXT NOT NULL,           -- reference ID in source table
  title TEXT NOT NULL,                -- display title
  title_tr TEXT,                      -- Turkish title
  description TEXT,                   -- short description for display
  description_tr TEXT,
  href TEXT NOT NULL,                 -- link to content
  category TEXT,                      -- content category
  metadata JSONB DEFAULT '{}',        -- flexible metadata (author, dosage, specialty, etc.)

  -- Vector embedding (768 dimensions for Gemini embedding-001)
  embedding vector(768),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicates
  CONSTRAINT unique_content UNIQUE (content_type, content_id)
);

-- HNSW index for fast cosine similarity search
CREATE INDEX IF NOT EXISTS idx_embeddings_cosine ON content_embeddings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Index for content type filtering
CREATE INDEX IF NOT EXISTS idx_embeddings_type ON content_embeddings(content_type);

-- ============================================
-- Similarity Search Function
-- ============================================

CREATE OR REPLACE FUNCTION search_embeddings(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 10,
  filter_type text DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content_type TEXT,
  content_id TEXT,
  title TEXT,
  title_tr TEXT,
  description TEXT,
  description_tr TEXT,
  href TEXT,
  category TEXT,
  metadata JSONB,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ce.id,
    ce.content_type,
    ce.content_id,
    ce.title,
    ce.title_tr,
    ce.description,
    ce.description_tr,
    ce.href,
    ce.category,
    ce.metadata,
    1 - (ce.embedding <=> query_embedding) AS similarity
  FROM content_embeddings ce
  WHERE
    (filter_type IS NULL OR ce.content_type = filter_type)
    AND 1 - (ce.embedding <=> query_embedding) > match_threshold
  ORDER BY ce.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
