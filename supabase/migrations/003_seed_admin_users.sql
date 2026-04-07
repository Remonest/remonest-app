-- ============================================================
-- Migration: 003_seed_admin_users
-- Created: 2026-04-07
-- Description: Promote specific users to admin role by email
-- ============================================================

-- Update role to 'admin' for the users below.
-- Add or remove email lines as needed.

DO $$
DECLARE
  target_emails TEXT[] := ARRAY[
    'admin@remonest.com'  -- TODO: Replace with actual admin email(s)
  ];
  email TEXT;
BEGIN
  FOREACH email IN ARRAY target_emails LOOP
    UPDATE public.user_profiles
    SET role = 'admin',
        updated_at = NOW()
    WHERE id = (SELECT id FROM auth.users WHERE auth.users.email = email);

    IF NOT FOUND THEN
      RAISE NOTICE 'No user found with email: %', email;
    ELSE
      RAISE NOTICE 'Promoted % to admin', email;
    END IF;
  END LOOP;
END $$;

-- ============================================================
-- Rollback (run manually if needed):
-- ============================================================
-- UPDATE public.user_profiles SET role = 'user' WHERE id IN (SELECT id FROM auth.users WHERE email = 'admin@remonest.com');
