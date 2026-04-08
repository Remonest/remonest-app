-- ============================================================
-- Migration: 010_make_is_verified_by_admin_nullable
-- Created: 2026-04-08
-- Description: Allow is_verified_by_admin to be NULL for client-posted jobs
--              Admin posts → true
--              Client posts → null (pending verification)
-- ============================================================

-- 1. Drop the DEFAULT constraint first
ALTER TABLE public.jobs
  ALTER COLUMN is_verified_by_admin DROP DEFAULT;

-- 2. Change column to allow NULL and remove default
ALTER TABLE public.jobs
  ALTER COLUMN is_verified_by_admin DROP NOT NULL;

-- 3. Set existing pending jobs to NULL (not yet verified)
UPDATE public.jobs
SET is_verified_by_admin = NULL
WHERE status = 'pending' AND is_verified_by_admin = false;

-- 4. Add comment
COMMENT ON COLUMN public.jobs.is_verified_by_admin IS 'NULL = not yet reviewed, true = admin verified, false = rejected or unverified';

-- ============================================================
-- Rollback (run manually if needed):
-- ============================================================
-- UPDATE public.jobs SET is_verified_by_admin = false WHERE is_verified_by_admin IS NULL;
-- ALTER TABLE public.jobs ALTER COLUMN is_verified_by_admin SET DEFAULT false;
-- ALTER TABLE public.jobs ALTER COLUMN is_verified_by_admin SET NOT NULL;
