-- =============================================================================
-- MentorMatch AI - Core Supabase PostgreSQL Database Schema
-- Architecture Owner: Person 1 (Database & Auth Engineering)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. EXTENSIONS
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- -----------------------------------------------------------------------------
-- 2. CUSTOM TYPES & ENUMS
-- -----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'mentor', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE doubt_status AS ENUM ('pending', 'matched', 'resolved', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- -----------------------------------------------------------------------------
-- 3. CORE TABLES
-- -----------------------------------------------------------------------------

-- 3.1 Profiles Table (Linked 1:1 to Supabase Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'student',
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 3.2 Students Profile Table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    education_level TEXT,
    learning_goals TEXT,
    learning_interests TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 3.3 Mentors Profile Table (with pgvector skill embeddings)
CREATE TABLE IF NOT EXISTS public.mentors (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    headline TEXT,
    bio TEXT,
    expertise_tags TEXT[] DEFAULT '{}',
    skill_embedding VECTOR(1536), -- OpenAI text-embedding-3-small / Ada-002
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    rating NUMERIC(3, 2) DEFAULT 5.00 CHECK (rating >= 0.00 AND rating <= 5.00),
    resolved_count INTEGER NOT NULL DEFAULT 0 CHECK (resolved_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 3.4 Doubts Table (Voice intake, Whisper transcripts & pgvector embeddings)
CREATE TABLE IF NOT EXISTS public.doubts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    audio_url TEXT,
    transcript TEXT,
    category TEXT NOT NULL DEFAULT 'General',
    tags TEXT[] DEFAULT '{}',
    status doubt_status NOT NULL DEFAULT 'pending',
    urgency TEXT DEFAULT 'Standard',
    embedding VECTOR(1536), -- Vector representation of question for matching
    matched_mentor_ids UUID[] DEFAULT '{}',
    assigned_mentor_id UUID REFERENCES public.mentors(id) ON DELETE SET NULL,
    answer TEXT,
    answered_by_name TEXT,
    answered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- -----------------------------------------------------------------------------
-- 4. AUTOMATED UPDATED_AT TRIGGER FUNCTION
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all core tables
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_students_updated_at ON public.students;
CREATE TRIGGER set_students_updated_at
    BEFORE UPDATE ON public.students
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_mentors_updated_at ON public.mentors;
CREATE TRIGGER set_mentors_updated_at
    BEFORE UPDATE ON public.mentors
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_doubts_updated_at ON public.doubts;
CREATE TRIGGER set_doubts_updated_at
    BEFORE UPDATE ON public.doubts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- 5. AUTH USER PROVISIONING TRIGGER
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    raw_role TEXT;
    assigned_role user_role;
    user_full_name TEXT;
BEGIN
    -- Extract role string and normalize to lowercase
    raw_role := LOWER(COALESCE(NEW.raw_user_meta_data->>'role', 'student'));

    -- Map UI role terms ('volunteer' -> 'mentor', 'director' -> 'admin') safely to valid user_role enum
    IF raw_role = 'volunteer' OR raw_role = 'mentor' THEN
        assigned_role := 'mentor'::user_role;
    ELSIF raw_role = 'director' OR raw_role = 'admin' THEN
        assigned_role := 'admin'::user_role;
    ELSE
        assigned_role := 'student'::user_role;
    END IF;

    user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);

    -- Insert into profiles
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        user_full_name,
        NEW.raw_user_meta_data->>'avatar_url',
        assigned_role
    );

    -- Insert child record according to assigned role
    IF assigned_role = 'student' THEN
        INSERT INTO public.students (id, education_level, learning_goals)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'education_level', 'General Student'),
            COALESCE(NEW.raw_user_meta_data->>'learning_goals', '')
        );
    ELSIF assigned_role = 'mentor' THEN
        INSERT INTO public.mentors (id, headline, bio, is_available)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'headline', 'Volunteer Mentor'),
            COALESCE(NEW.raw_user_meta_data->>'bio', ''),
            TRUE
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute automatically on Supabase Auth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 6. PGVECTOR COSINE SIMILARITY MATCHING RPC FUNCTION
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.match_mentors(
    query_embedding VECTOR(1536),
    match_threshold FLOAT DEFAULT 0.70,
    match_count INT DEFAULT 3
)
RETURNS TABLE (
    mentor_id UUID,
    full_name TEXT,
    headline TEXT,
    expertise_tags TEXT[],
    rating NUMERIC,
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id AS mentor_id,
        p.full_name,
        m.headline,
        m.expertise_tags,
        m.rating,
        1 - (m.skill_embedding <=> query_embedding) AS similarity
    FROM public.mentors m
    JOIN public.profiles p ON p.id = m.id
    WHERE m.is_available = TRUE
      AND m.skill_embedding IS NOT NULL
      AND 1 - (m.skill_embedding <=> query_embedding) > match_threshold
    ORDER BY m.skill_embedding <=> query_embedding ASC
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- -----------------------------------------------------------------------------
-- 7. PERFORMANCE & VECTOR INDEXES
-- -----------------------------------------------------------------------------
-- B-Tree Indexes for relational lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_doubts_student_id ON public.doubts(student_id);
CREATE INDEX IF NOT EXISTS idx_doubts_assigned_mentor_id ON public.doubts(assigned_mentor_id);
CREATE INDEX IF NOT EXISTS idx_doubts_status ON public.doubts(status);
CREATE INDEX IF NOT EXISTS idx_doubts_created_at ON public.doubts(created_at DESC);

-- HNSW Vector Indexes for Fast Cosine Distance Lookups
CREATE INDEX IF NOT EXISTS idx_mentors_skill_embedding 
    ON public.mentors 
    USING hnsw (skill_embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_doubts_embedding 
    ON public.doubts 
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- -----------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doubts ENABLE ROW LEVEL SECURITY;

-- 8.1 Profiles Policies
CREATE POLICY "Public profiles are viewable by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- 8.2 Students Policies
CREATE POLICY "Students records viewable by authenticated users"
    ON public.students FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Students can update their own student profile"
    ON public.students FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- 8.3 Mentors Policies
CREATE POLICY "Mentor profiles are publicly viewable"
    ON public.mentors FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Mentors can update their own mentor record"
    ON public.mentors FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- 8.4 Doubts Policies
CREATE POLICY "Students can view their own doubts"
    ON public.doubts FOR SELECT
    TO authenticated
    USING (
        auth.uid() = student_id 
        OR auth.uid() = assigned_mentor_id
        OR auth.uid() = ANY(matched_mentor_ids)
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('mentor', 'admin')
        )
    );

CREATE POLICY "Students can insert their own doubts"
    ON public.doubts FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students and assigned mentors can update doubts"
    ON public.doubts FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = student_id 
        OR auth.uid() = assigned_mentor_id
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('mentor', 'admin')
        )
    );
