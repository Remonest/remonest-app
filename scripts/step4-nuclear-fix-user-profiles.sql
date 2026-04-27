-- ================================================================
-- STEP 4: NUCLEAR RESET for user_profiles Table
-- This will drop ALL policies and create only essential ones
-- ================================================================

-- ================================================================
-- 1. DROP EVERY SINGLE POLICY on user_profiles
-- ================================================================

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on id check" ON user_profiles;

-- ================================================================
-- 2. CREATE ONLY ESSENTIAL POLICIES
-- ================================================================

-- Essential Policy 1: Users can view own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Essential Policy 2: Users can update own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Essential Policy 3: Authenticated users can insert own profile
CREATE POLICY "Authenticated users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

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
WHERE schemaname = 'public' AND tablename = 'user_profiles';

-- ================================================================
-- STEP 4 COMPLETE: user_profiles policies reset
-- ================================================================
-- Only 3 essential policies created for user_profiles table
-- ================================================================