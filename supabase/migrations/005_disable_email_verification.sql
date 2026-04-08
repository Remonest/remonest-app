-- ============================================================
-- Migration: 005_disable_email_verification
-- Created: 2026-04-07
-- Description: Disable email verification requirement for existing users
-- ============================================================

-- Set email_confirmed_at to current timestamp for all existing users
-- Note: Cannot set default on auth.users table due to permission restrictions
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- ============================================================
-- Rollback (run manually if needed):
-- ============================================================
-- UPDATE auth.users SET email_confirmed_at = NULL WHERE email_confirmed_at IS NOT NULL;
