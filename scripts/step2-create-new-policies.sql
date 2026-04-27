-- ================================================================
-- STEP 2: Create New RLS Policies
-- Run this AFTER Step 1 (drop existing policies)
-- ================================================================

-- ================================================================
-- 1. USER_PROFILES TABLE RLS POLICIES
-- ================================================================

-- Policy: Users can only see their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Authenticated users can insert their own profile
CREATE POLICY "Authenticated users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ================================================================
-- 2. JOBS TABLE RLS POLICIES
-- ================================================================

-- Policy: Public users can read published jobs
CREATE POLICY "Public can read published jobs"
  ON jobs FOR SELECT
  USING (status = 'published');

-- Policy: Authenticated users can create jobs
CREATE POLICY "Users can create jobs"
  ON jobs FOR INSERT
  WITH CHECK (auth.uid() = posted_by_user_id);

-- Policy: Users can update own draft/pending jobs
CREATE POLICY "Users can update own jobs"
  ON jobs FOR UPDATE
  USING (auth.uid() = posted_by_user_id AND status IN ('draft', 'pending'))
  WITH CHECK (auth.uid() = posted_by_user_id AND status IN ('draft', 'pending'));

-- Policy: Admins can read all jobs
CREATE POLICY "Admins can read all jobs"
  ON jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Policy: Admins can update any job
CREATE POLICY "Admins can update any job"
  ON jobs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- ================================================================
-- 3. LEARNING_MODULES TABLE RLS POLICIES
-- ================================================================

-- Policy: Public users can read published learning modules
CREATE POLICY "Public can read published learning modules"
  ON learning_modules FOR SELECT
  USING (status = 'published');

-- Policy: Admins can read all learning modules
CREATE POLICY "Admins can read all learning modules"
  ON learning_modules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Policy: Admins can update learning modules
CREATE POLICY "Admins can update learning modules"
  ON learning_modules FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Policy: Admins can delete learning modules
CREATE POLICY "Admins can delete learning modules"
  ON learning_modules FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- ================================================================
-- 4. MODULE_LESSONS TABLE RLS POLICIES
-- ================================================================

-- Policy: Public can read lessons from published modules
CREATE POLICY "Public can read lessons from published modules"
  ON module_lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM learning_modules
      WHERE learning_modules.id = module_lessons.module_id
      AND learning_modules.status = 'published'
    )
  );

-- Policy: Admins can read all module lessons
CREATE POLICY "Admins can read all module lessons"
  ON module_lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Policy: Admins can insert module lessons
CREATE POLICY "Admins can insert module lessons"
  ON module_lessons FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Policy: Admins can update module lessons
CREATE POLICY "Admins can update module lessons"
  ON module_lessons FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Policy: Admins can delete module lessons
CREATE POLICY "Admins can delete module lessons"
  ON module_lessons FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- ================================================================
-- 5. QUIZ_CONFIGS TABLE RLS POLICIES
-- ================================================================

-- Policy: Public can read quizzes from published modules
CREATE POLICY "Public can read quizzes from published modules"
  ON quiz_configs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM learning_modules
      WHERE learning_modules.id = quiz_configs.module_id
      AND learning_modules.status = 'published'
    )
  );

-- Policy: Admins can read all quiz configs
CREATE POLICY "Admins can read all quiz configs"
  ON quiz_configs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Policy: Admins can insert quiz configs
CREATE POLICY "Admins can insert quiz configs"
  ON quiz_configs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Policy: Admins can update quiz configs
CREATE POLICY "Admins can update quiz configs"
  ON quiz_configs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Policy: Admins can delete quiz configs
CREATE POLICY "Admins can delete quiz configs"
  ON quiz_configs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- ================================================================
-- 6. USER_QUIZ_ATTEMPTS TABLE RLS POLICIES
-- ================================================================

-- Policy: Users can only see their own quiz attempts
CREATE POLICY "Users can view own quiz attempts"
  ON user_quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own quiz attempts
CREATE POLICY "Users can insert own quiz attempts"
  ON user_quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can read all quiz attempts
CREATE POLICY "Admins can read all quiz attempts"
  ON user_quiz_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- ================================================================
-- 7. USER_LEARNING_PROGRESS TABLE RLS POLICIES
-- ================================================================

-- Policy: Users can only see their own learning progress
CREATE POLICY "Users can view own learning progress"
  ON user_learning_progress FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own learning progress
CREATE POLICY "Users can insert own learning progress"
  ON user_learning_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own learning progress
CREATE POLICY "Users can update own learning progress"
  ON user_learning_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can read all learning progress
CREATE POLICY "Admins can read all learning progress"
  ON user_learning_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- ================================================================
-- 8. PORTFOLIO_ITEMS TABLE RLS POLICIES
-- ================================================================

-- Policy: Public can read published portfolio items
CREATE POLICY "Public can read published portfolio items"
  ON portfolio_items FOR SELECT
  USING (is_published = true);

-- Policy: Users can see their own portfolio items
CREATE POLICY "Users can view own portfolio items"
  ON portfolio_items FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own portfolio items
CREATE POLICY "Users can insert own portfolio items"
  ON portfolio_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own portfolio items
CREATE POLICY "Users can update own portfolio items"
  ON portfolio_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own portfolio items
CREATE POLICY "Users can delete own portfolio items"
  ON portfolio_items FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Admins can read all portfolio items
CREATE POLICY "Admins can read all portfolio items"
  ON portfolio_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- ================================================================
-- 9. USER_CVS TABLE RLS POLICIES
-- ================================================================

-- Policy: Public can read primary CVs
CREATE POLICY "Public can read primary CVs"
  ON user_cvs FOR SELECT
  USING (is_primary = true);

-- Policy: Users can see their own CVs
CREATE POLICY "Users can view own CVs"
  ON user_cvs FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own CVs
CREATE POLICY "Users can insert own CVs"
  ON user_cvs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own CVs
CREATE POLICY "Users can update own CVs"
  ON user_cvs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own CVs
CREATE POLICY "Users can delete own CVs"
  ON user_cvs FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Admins can read all CVs
CREATE POLICY "Admins can read all CVs"
  ON user_cvs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- ================================================================
-- STEP 2 COMPLETE: New RLS policies created
-- ================================================================
-- Your app is now secure for deployment
-- ================================================================