-- =============================================================================
-- Migration: 02_resize_vectors.sql
-- Description: Resize vector columns from 1536 to 384 dimensions for zero-cost
--              local embeddings (e.g. all-MiniLM-L6-v2 / BAAI/bge-small-en-v1.5),
--              rebuild HNSW cosine distance indexes, and update match_mentors RPC.
-- =============================================================================

-- Ensure pgvector extension is enabled
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- -----------------------------------------------------------------------------
-- 1. DROP DEPENDENT INDEXES & LEGACY FUNCTIONS
-- -----------------------------------------------------------------------------

-- Drop old HNSW vector indexes before modifying column dimensions
DROP INDEX IF EXISTS public.idx_mentors_skill_embedding;
DROP INDEX IF EXISTS public.idx_doubts_embedding;

-- Drop legacy match_mentors function signatures
DROP FUNCTION IF EXISTS public.match_mentors(vector(1536), float, int);
DROP FUNCTION IF EXISTS public.match_mentors(vector, float, int);
DROP FUNCTION IF EXISTS public.match_mentors(vector(384), float, int);
DROP FUNCTION IF EXISTS public.match_mentors(vector(384), float, int, text);

-- -----------------------------------------------------------------------------
-- 2. ALTER COLUMN TYPES TO VECTOR(384)
-- -----------------------------------------------------------------------------

-- Alter mentors skill_embedding to 384 dimensions
ALTER TABLE public.mentors 
    ALTER COLUMN skill_embedding TYPE vector(384) USING NULL;

-- Alter doubts embedding to 384 dimensions
ALTER TABLE public.doubts 
    ALTER COLUMN embedding TYPE vector(384) USING NULL;

-- -----------------------------------------------------------------------------
-- 3. RECREATE HNSW COSINE SIMILARITY INDEXES
-- -----------------------------------------------------------------------------

-- Recreate HNSW index on mentors skill_embedding for fast approximate nearest neighbor search
CREATE INDEX idx_mentors_skill_embedding 
    ON public.mentors 
    USING hnsw (skill_embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- Recreate HNSW index on doubts embedding for fast question deduplication & similarity search
CREATE INDEX idx_doubts_embedding 
    ON public.doubts 
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- -----------------------------------------------------------------------------
-- 4. REFINED MATCH_MENTORS POSTGRESQL RPC FUNCTION
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.match_mentors(
    query_embedding vector(384),
    match_threshold float DEFAULT 0.50,
    match_count int DEFAULT 5,
    filter_category text DEFAULT NULL
)
RETURNS TABLE (
    mentor_id uuid,
    full_name text,
    headline text,
    bio text,
    expertise_tags text[],
    rating numeric,
    similarity float
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id AS mentor_id,
        p.full_name,
        m.headline,
        m.bio,
        m.expertise_tags,
        m.rating,
        (1 - (m.skill_embedding <=> query_embedding))::float AS similarity
    FROM public.mentors m
    JOIN public.profiles p ON p.id = m.id
    WHERE m.is_available = TRUE
      AND m.skill_embedding IS NOT NULL
      AND (1 - (m.skill_embedding <=> query_embedding)) >= match_threshold
      AND (
          filter_category IS NULL 
          OR filter_category = '' 
          OR filter_category = ANY(m.expertise_tags)
      )
    ORDER BY m.skill_embedding <=> query_embedding ASC
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execution permissions on match_mentors RPC
GRANT EXECUTE ON FUNCTION public.match_mentors(vector(384), float, int, text) TO authenticated, anon, service_role;
