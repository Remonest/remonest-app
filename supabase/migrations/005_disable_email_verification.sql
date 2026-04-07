-- ============================================================
-- Migration: 005_disable_email_verification
-- Created: 2026-04-07
-- Description: Disable email verification requirement for all users
-- ============================================================

-- Set email_confirmed_at to current timestamp for all existing users
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Set default so new users auto-confirm their email
ALTER TABLE auth.users
ALTER COLUMN email_confirmed_at SET DEFAULT NOW();

-- ============================================================
-- Rollback (run manually if needed):
-- ============================================================
-- ALTER TABLE auth.users ALTER COLUMN email_confirmed_at DROP DEFAULT;
-- UPDATE auth.users SET email_confirmed_at = NULL WHERE email_confirmed_at IS NOT NULL;
