-- ================================================================
-- STEP 1: Drop ALL Existing RLS Policies
-- Run this FIRST before the main RLS fix
-- ================================================================

-- Drop all policies for user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on id check" ON user_profiles;

-- Drop all policies for jobs
DROP POLICY IF EXISTS "Public can read published jobs" ON jobs;
DROP POLICY IF EXISTS "Users can create jobs" ON jobs;
DROP POLICY IF EXISTS "Users can update own jobs" ON jobs;
DROP POLICY IF EXISTS "Admins can read all jobs" ON jobs;
DROP POLICY IF EXISTS "Admins can update any job" ON jobs;

-- Drop all policies for learning_modules
DROP POLICY IF EXISTS "Public can read published learning modules" ON learning_modules;
DROP POLICY IF EXISTS "Admins can read all learning modules" ON learning_modules;
DROP POLICY IF EXISTS "Admins can update learning modules" ON learning_modules;
DROP POLICY IF EXISTS "Admins can delete learning modules" ON learning_modules;

-- Drop all policies for module_lessons
DROP POLICY IF EXISTS "Public can read lessons from published modules" ON module_lessons;
DROP POLICY IF EXISTS "Admins can read all module lessons" ON module_lessons;
DROP POLICY IF EXISTS "Admins can insert module lessons" ON module_lessons;
DROP POLICY IF EXISTS "Admins can update module lessons" ON module_lessons;
DROP POLICY IF EXISTS "Admins can delete module lessons" ON module_lessons;

-- Drop all policies for quiz_configs
DROP POLICY IF EXISTS "Public can read quizzes from published modules" ON quiz_configs;
DROP POLICY IF EXISTS "Admins can read all quiz configs" ON quiz_configs;
DROP POLICY IF EXISTS "Admins can insert quiz configs" ON quiz_configs;
DROP POLICY IF EXISTS "Admins can update quiz configs" ON quiz_configs;
DROP POLICY IF EXISTS "Admins can delete quiz configs" ON quiz_configs;

-- Drop all policies for user_quiz_attempts
DROP POLICY IF EXISTS "Users can view own quiz attempts" ON user_quiz_attempts;
DROP POLICY IF EXISTS "Users can insert own quiz attempts" ON user_quiz_attempts;
DROP POLICY IF EXISTS "Admins can read all quiz attempts" ON user_quiz_attempts;

-- Drop all policies for user_learning_progress
DROP POLICY IF EXISTS "Users can view own learning progress" ON user_learning_progress;
DROP POLICY IF EXISTS "Users can insert own learning progress" ON user_learning_progress;
DROP POLICY IF EXISTS "Users can update own learning progress" ON user_learning_progress;
DROP POLICY IF EXISTS "Admins can read all learning progress" ON user_learning_progress;

-- Drop all policies for portfolio_items
DROP POLICY IF EXISTS "Public can read published portfolio items" ON portfolio_items;
DROP POLICY IF EXISTS "Users can view own portfolio items" ON portfolio_items;
DROP POLICY IF EXISTS "Users can insert own portfolio items" ON portfolio_items;
DROP POLICY IF EXISTS "Users can update own portfolio items" ON portfolio_items;
DROP POLICY IF EXISTS "Users can delete own portfolio items" ON portfolio_items;
DROP POLICY IF EXISTS "Admins can read all portfolio items" ON portfolio_items;

-- Drop all policies for user_cvs
DROP POLICY IF EXISTS "Public can read primary CVs" ON user_cvs;
DROP POLICY IF EXISTS "Users can view own CVs" ON user_cvs;
DROP POLICY IF EXISTS "Users can insert own CVs" ON user_cvs;
DROP POLICY IF EXISTS "Users can update own CVs" ON user_cvs;
DROP POLICY IF EXISTS "Users can delete own CVs" ON user_cvs;
DROP POLICY IF EXISTS "Admins can read all CVs" ON user_cvs;

-- ================================================================
-- STEP 1 COMPLETE: All existing policies dropped
-- ================================================================
-- Now run the main RLS fix script to create new policies
-- ================================================================