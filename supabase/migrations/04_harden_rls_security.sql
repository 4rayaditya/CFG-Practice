-- =============================================================================
-- Migration: 04_harden_rls_security.sql
-- Description: Harden Supabase Row-Level Security (RLS) policies:
--              1. Restrict student doubt updates to their own doubts (student_id = auth.uid())
--              2. Restrict admin tables/operations strictly to JWT app_metadata ->> 'role' = 'admin'
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. HARDEN DOUBTS UPDATE POLICIES
-- -----------------------------------------------------------------------------

-- Drop overly permissive update policy
DROP POLICY IF EXISTS "Users and mentors can update doubts" ON public.doubts;
DROP POLICY IF EXISTS "Students and assigned mentors can update doubts" ON public.doubts;
DROP POLICY IF EXISTS "Students can update own doubts" ON public.doubts;
DROP POLICY IF EXISTS "Assigned mentors can update doubts" ON public.doubts;
DROP POLICY IF EXISTS "Admins can update all doubts" ON public.doubts;

-- A) Students can only update doubts where student_id = auth.uid()
CREATE POLICY "Students can update own doubts"
    ON public.doubts FOR UPDATE
    TO authenticated
    USING (auth.uid() = student_id)
    WITH CHECK (auth.uid() = student_id);

-- B) Mentors can update doubts specifically assigned to them
CREATE POLICY "Assigned mentors can update doubts"
    ON public.doubts FOR UPDATE
    TO authenticated
    USING (auth.uid() = assigned_mentor_id)
    WITH CHECK (auth.uid() = assigned_mentor_id);

-- C) Admins strictly verified via JWT app_metadata can manage all doubts
CREATE POLICY "Admins can update all doubts"
    ON public.doubts FOR UPDATE
    TO authenticated
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- -----------------------------------------------------------------------------
-- 2. HARDEN ADMIN RESTRICTIONS VIA JWT APP_METADATA
-- -----------------------------------------------------------------------------

-- Admin Audit & Telemetry table (strictly accessible to admin role in app_metadata)
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin audit logs strictly restricted to admin role" ON public.admin_audit_logs;
CREATE POLICY "Admin audit logs strictly restricted to admin role"
    ON public.admin_audit_logs FOR ALL
    TO authenticated
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Profiles admin full management override
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
CREATE POLICY "Admins have full access to profiles"
    ON public.profiles FOR ALL
    TO authenticated
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- -----------------------------------------------------------------------------
-- 3. HARDEN ROADMAPS & MILESTONES WITH JWT APP_METADATA ADMIN CHECKS
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Students can view their own roadmaps" ON public.roadmaps;
CREATE POLICY "Students can view their own roadmaps"
    ON public.roadmaps FOR SELECT
    TO authenticated
    USING (
        auth.uid() = student_id 
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );

DROP POLICY IF EXISTS "Students can view milestones of their roadmaps" ON public.milestones;
CREATE POLICY "Students can view milestones of their roadmaps"
    ON public.milestones FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.roadmaps r 
            WHERE r.id = milestones.roadmap_id 
              AND (
                  r.student_id = auth.uid() 
                  OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
              )
        )
    );
