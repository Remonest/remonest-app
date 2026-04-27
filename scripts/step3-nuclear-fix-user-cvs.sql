-- ================================================================
-- STEP 3: NUCLEAR RESET for user_cvs Table
-- This will drop ALL policies and create only essential ones
-- ================================================================

-- ================================================================
-- 1. DROP EVERY SINGLE POLICY on user_cvs
-- ================================================================

DROP POLICY IF EXISTS "Users can view own CVs" ON user_cvs;
DROP POLICY IF EXISTS "Users can insert own CVs" ON user_cvs;
DROP POLICY IF EXISTS "Users can update own CVs" ON user_cvs;
DROP POLICY IF EXISTS "Users can delete own CVs" ON user_cvs;
DROP POLICY IF EXISTS "Public can read primary CVs" ON user_cvs;
DROP POLICY IF EXISTS "Admins can read all CVs" ON user_cvs;

-- ================================================================
-- 2. CREATE ONLY ESSENTIAL POLICIES
-- ================================================================

-- Essential Policy 1: Users can view own CVs
CREATE POLICY "Users can view own CVs"
  ON user_cvs FOR SELECT
  USING (auth.uid() = user_id);

-- Essential Policy 2: Public can read primary CVs
CREATE POLICY "Public can read primary CVs"
  ON user_cvs FOR SELECT
  USING (is_primary = true);

-- ================================================================
-- 3. VERIFICATION
-- ================================================================

-- Verify only essential policies exist
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'user_cvs';

-- ================================================================
-- STEP 3 COMPLETE: user_cvs policies reset
-- ================================================================
-- Only 2 essential policies created for user_cvs table
-- ================================================================