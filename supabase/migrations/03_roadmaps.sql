-- =============================================================================
-- Migration: 03_roadmaps.sql
-- Description: Create roadmaps and milestones tables for persisting AI-generated
--              career pathways linked to public.students(id) with RLS policies.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ROADMAPS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    goal TEXT NOT NULL,
    track_title TEXT NOT NULL,
    summary TEXT,
    total_estimated_hours INTEGER NOT NULL DEFAULT 0 CHECK (total_estimated_hours >= 0),
    skill_level TEXT NOT NULL DEFAULT 'Beginner',
    target_timeline TEXT NOT NULL DEFAULT '3 months',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    progress_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (progress_percentage >= 0.00 AND progress_percentage <= 100.00),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- -----------------------------------------------------------------------------
-- 2. MILESTONES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL CHECK (step_number > 0),
    title TEXT NOT NULL,
    description TEXT,
    estimated_hours INTEGER NOT NULL DEFAULT 0 CHECK (estimated_hours >= 0),
    subtasks JSONB NOT NULL DEFAULT '[]'::jsonb,
    resources JSONB NOT NULL DEFAULT '[]'::jsonb,
    checkpoint_project TEXT,
    key_skills TEXT[] DEFAULT '{}',
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- -----------------------------------------------------------------------------
-- 3. AUTOMATED UPDATED_AT TRIGGERS
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS set_roadmaps_updated_at ON public.roadmaps;
CREATE TRIGGER set_roadmaps_updated_at
    BEFORE UPDATE ON public.roadmaps
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_milestones_updated_at ON public.milestones;
CREATE TRIGGER set_milestones_updated_at
    BEFORE UPDATE ON public.milestones
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- 4. PERFORMANCE & RELATIONAL INDEXES
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_roadmaps_student_id ON public.roadmaps(student_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_created_at ON public.roadmaps(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_roadmaps_is_active ON public.roadmaps(is_active);
CREATE INDEX IF NOT EXISTS idx_milestones_roadmap_id ON public.milestones(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_milestones_step_number ON public.milestones(step_number);

-- -----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- 5.1 Roadmaps Policies
CREATE POLICY "Students can view their own roadmaps"
    ON public.roadmaps FOR SELECT
    TO authenticated
    USING (
        auth.uid() = student_id 
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Students can create their own roadmaps"
    ON public.roadmaps FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own roadmaps"
    ON public.roadmaps FOR UPDATE
    TO authenticated
    USING (auth.uid() = student_id)
    WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can delete their own roadmaps"
    ON public.roadmaps FOR DELETE
    TO authenticated
    USING (auth.uid() = student_id);

-- 5.2 Milestones Policies
CREATE POLICY "Students can view milestones of their roadmaps"
    ON public.milestones FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.roadmaps r 
            WHERE r.id = milestones.roadmap_id 
              AND (
                  r.student_id = auth.uid() 
                  OR EXISTS (
                      SELECT 1 FROM public.profiles p 
                      WHERE p.id = auth.uid() AND p.role = 'admin'
                  )
              )
        )
    );

CREATE POLICY "Students can insert milestones into their roadmaps"
    ON public.milestones FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.roadmaps r 
            WHERE r.id = milestones.roadmap_id 
              AND r.student_id = auth.uid()
        )
    );

CREATE POLICY "Students can update milestones in their roadmaps"
    ON public.milestones FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.roadmaps r 
            WHERE r.id = milestones.roadmap_id 
              AND r.student_id = auth.uid()
        )
    );

CREATE POLICY "Students can delete milestones from their roadmaps"
    ON public.milestones FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.roadmaps r 
            WHERE r.id = milestones.roadmap_id 
              AND r.student_id = auth.uid()
        )
    );
