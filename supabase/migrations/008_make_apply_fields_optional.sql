-- ============================================================
-- Migration: 008_make_apply_fields_optional
-- Created: 2026-04-08
-- Description: Remove strict constraints on apply fields to allow drafts
-- ============================================================

-- Problem: The constraints require apply_url when apply_method = 'url'
-- and apply_email when apply_method = 'email', preventing draft saves
-- when these fields are empty.

-- Solution: Remove the strict constraints and rely on application-level validation
-- only when the user tries to publish/submit the job.

-- Drop strict constraints
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS apply_url_present;
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS apply_email_present;

-- Add more flexible constraints - only require that if a field is set,
-- it matches the appropriate method
ALTER TABLE public.jobs ADD CONSTRAINT apply_fields_consistency
CHECK (
  (apply_method = 'url' AND apply_url IS NOT NULL) OR
  (apply_method = 'email' AND apply_email IS NOT NULL) OR
  apply_method IS NULL
);

-- ============================================================
-- Rollback (run manually if needed):
-- ============================================================
-- ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS apply_fields_consistency;
-- ALTER TABLE public.jobs ADD CONSTRAINT apply_url_present
-- CHECK (apply_method = 'url' AND apply_url IS NOT NULL OR apply_method = 'email');
-- ALTER TABLE public.jobs ADD CONSTRAINT apply_email_present
-- CHECK (apply_method = 'email' AND apply_email IS NOT NULL OR apply_method = 'url');
