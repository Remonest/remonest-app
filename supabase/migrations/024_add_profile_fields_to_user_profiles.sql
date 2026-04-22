-- ============================================================
-- Migration: 024_add_profile_fields_to_user_profiles
-- Created: April 22, 2026
-- Description: Add fields needed for public portfolio to user_profiles
--   - headline, bio, location, website, username
--   - Migrate data from user_settings to user_profiles
-- ============================================================

-- 1. Add columns to user_profiles
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS headline TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- 2. Migrate existing data from user_settings (if any)
UPDATE public.user_profiles up
SET 
  bio = us.bio,
  location = us.location
FROM public.user_settings us
WHERE up.id = us.user_id
  AND (up.bio IS NULL OR up.location IS NULL);

-- 3. Add comment
COMMENT ON COLUMN public.user_profiles.headline IS 'Professional headline for the user';
COMMENT ON COLUMN public.user_profiles.bio IS 'Biography or about me section';
COMMENT ON COLUMN public.user_profiles.location IS 'User location (city, country)';
COMMENT ON COLUMN public.user_profiles.website IS 'Personal or portfolio website URL';
COMMENT ON COLUMN public.user_profiles.username IS 'Custom slug for public portfolio URL';
