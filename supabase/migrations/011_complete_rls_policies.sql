-- ============================================================
-- Migration: 011_complete_rls_policies
-- Created: 2026-04-10
-- Description: Complete RLS policies for all tables and admin action logging
-- ============================================================

-- ============================================================
-- 1. Create admin_actions table for audit trail
-- ============================================================

-- Create enum for admin action types
CREATE TYPE public.admin_action_type_enum AS ENUM (
  'approve_job',
  'reject_job',
  'delete_job',
  'publish_job',
  'republish_job',
  'update_job',
  'create_learning_module',
  'update_learning_module',
  'delete_learning_module',
  'update_user_role',
  'delete_user',
  'other'
);

-- Create admin_actions table
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type public.admin_action_type_enum NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB DEFAULT '{}',
  new_values JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.admin_actions IS 'Audit trail of all admin actions in the system.';
COMMENT ON COLUMN public.admin_actions.admin_id IS 'The admin who performed the action.';
COMMENT ON COLUMN public.admin_actions.target_user_id IS 'The user affected by the action (if applicable).';
COMMENT ON COLUMN public.admin_actions.table_name IS 'The table that was modified.';
COMMENT ON COLUMN public.admin_actions.record_id IS 'The specific record that was modified.';
COMMENT ON COLUMN public.admin_actions.old_values IS 'State before the change.';
COMMENT ON COLUMN public.admin_actions.new_values IS 'State after the change.';

-- Create indexes for efficient queries
CREATE INDEX idx_admin_actions_admin_id ON public.admin_actions (admin_id);
CREATE INDEX idx_admin_actions_target_user_id ON public.admin_actions (target_user_id);
CREATE INDEX idx_admin_actions_action_type ON public.admin_actions (action_type);
CREATE INDEX idx_admin_actions_table_name ON public.admin_actions (table_name);
CREATE INDEX idx_admin_actions_created_at ON public.admin_actions (created_at DESC);
CREATE INDEX idx_admin_actions_record_id ON public.admin_actions (record_id);

-- Enable RLS on admin_actions
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all admin actions
CREATE POLICY "Admins can view all admin actions"
  ON public.admin_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Service role can insert admin actions (for logging)
CREATE POLICY "Service role can insert admin actions"
  ON public.admin_actions FOR INSERT
  WITH CHECK (true);

-- Policy: No one can update or delete admin actions (immutable audit trail)
-- No UPDATE or DELETE policies created - this is intentional for security

-- ============================================================
-- 2. Helper function: Log admin action
-- ============================================================

CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_admin_id UUID,
  p_action_type public.admin_action_type_enum,
  p_table_name TEXT,
  p_record_id UUID DEFAULT NULL,
  p_target_user_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT '{}',
  p_new_values JSONB DEFAULT '{}',
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action_id UUID;
BEGIN
  INSERT INTO public.admin_actions (
    admin_id,
    action_type,
    table_name,
    record_id,
    target_user_id,
    old_values,
    new_values,
    notes
  )
  VALUES (
    p_admin_id,
    p_action_type,
    p_table_name,
    p_record_id,
    p_target_user_id,
    p_old_values,
    p_new_values,
    p_notes
  )
  RETURNING id INTO v_action_id;
  
  RETURN v_action_id;
END;
$$;

COMMENT ON FUNCTION public.log_admin_action IS 'Helper function to log admin actions. Automatically called by triggers.';

-- ============================================================
-- 3. Triggers for automatic admin action logging
-- ============================================================

-- Trigger function for logging job changes by admins
CREATE OR REPLACE FUNCTION public.log_admin_job_actions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action_type public.admin_action_type_enum;
  v_admin_id UUID;
  v_old_values JSONB := '{}';
  v_new_values JSONB := '{}';
BEGIN
  -- Get the current admin user ID
  v_admin_id := auth.uid();

  -- Only log if user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = v_admin_id AND role = 'admin'
  ) THEN
    RETURN NEW;
  END IF;

  -- Determine action type based on TG_OP
  IF TG_OP = 'DELETE' THEN
    v_action_type := 'delete_job';
    v_old_values := to_jsonb(OLD);
  ELSIF TG_OP = 'UPDATE' THEN
    -- Determine if this is an approval/rejection or regular update
    IF OLD.status = 'pending' AND NEW.status = 'published' THEN
      v_action_type := 'approve_job';
    ELSIF OLD.status = 'pending' AND NEW.status = 'rejected' THEN
      v_action_type := 'reject_job';
    ELSIF OLD.status != 'published' AND NEW.status = 'published' THEN
      v_action_type := 'publish_job';
    ELSIF OLD.status = 'expired' AND NEW.status = 'published' THEN
      v_action_type := 'republish_job';
    ELSE
      v_action_type := 'update_job';
    END IF;
    v_old_values := to_jsonb(OLD);
    v_new_values := to_jsonb(NEW);
  ELSIF TG_OP = 'INSERT' THEN
    v_action_type := 'update_job'; -- Admin creating a job
    v_new_values := to_jsonb(NEW);
  END IF;
  
  -- Log the action
  PERFORM public.log_admin_action(
    p_admin_id := v_admin_id,
    p_action_type := v_action_type,
    p_table_name := 'jobs',
    p_record_id := COALESCE(NEW.id, OLD.id),
    p_target_user_id := COALESCE(NEW.posted_by_user_id, OLD.posted_by_user_id),
    p_old_values := v_old_values,
    p_new_values := v_new_values,
    p_notes := CASE 
      WHEN TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN 
        'Status changed from ' || OLD.status || ' to ' || NEW.status
      ELSE NULL
    END
  );
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.log_admin_job_actions IS 'Automatically logs admin actions on jobs table.';

-- Attach trigger to jobs table
DROP TRIGGER IF EXISTS log_admin_job_actions_trigger ON public.jobs;
CREATE TRIGGER log_admin_job_actions_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.log_admin_job_actions();

-- Trigger function for logging learning module changes by admins
CREATE OR REPLACE FUNCTION public.log_admin_learning_module_actions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action_type public.admin_action_type_enum;
  v_admin_id UUID;
  v_old_values JSONB := '{}';
  v_new_values JSONB := '{}';
BEGIN
  -- Get the current admin user ID
  v_admin_id := auth.uid();

  -- Only log if user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = v_admin_id AND role = 'admin'
  ) THEN
    RETURN NEW;
  END IF;

  -- Determine action type based on TG_OP
  IF TG_OP = 'DELETE' THEN
    v_action_type := 'delete_learning_module';
    v_old_values := to_jsonb(OLD);
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'draft' AND NEW.status = 'published' THEN
      v_action_type := 'create_learning_module';
    ELSE
      v_action_type := 'update_learning_module';
    END IF;
    v_old_values := to_jsonb(OLD);
    v_new_values := to_jsonb(NEW);
  ELSIF TG_OP = 'INSERT' THEN
    v_action_type := 'create_learning_module';
    v_new_values := to_jsonb(NEW);
  END IF;
  
  -- Log the action
  PERFORM public.log_admin_action(
    p_admin_id := v_admin_id,
    p_action_type := v_action_type,
    p_table_name := 'learning_modules',
    p_record_id := COALESCE(NEW.id, OLD.id),
    p_old_values := v_old_values,
    p_new_values := v_new_values,
    p_notes := CASE 
      WHEN TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN 
        'Status changed from ' || OLD.status || ' to ' || NEW.status
      ELSE NULL
    END
  );
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.log_admin_learning_module_actions IS 'Automatically logs admin actions on learning_modules table.';

-- Attach trigger to learning_modules table
DROP TRIGGER IF EXISTS log_admin_learning_module_actions_trigger ON public.learning_modules;
CREATE TRIGGER log_admin_learning_module_actions_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.learning_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.log_admin_learning_module_actions();

-- ============================================================
-- 4. Complete RLS policies for all tables
-- ============================================================

-- ------------------------------------------------------------
-- 4.1 user_profiles - Enhanced policies for all 3 roles
-- ------------------------------------------------------------

-- Drop any existing policies for clean slate
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Clients can view all profiles" ON public.user_profiles;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile (but cannot change role)
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.user_profiles WHERE id = auth.uid())
  );

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'admin'
    )
  );

-- Policy: Admins can update all profiles (including role changes)
CREATE POLICY "Admins can update all profiles"
  ON public.user_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'admin'
    )
  );

-- Policy: Service role can insert profiles (for auto-create trigger)
CREATE POLICY "Service role can insert profiles"
  ON public.user_profiles FOR INSERT
  WITH CHECK (true);

-- Policy: Clients can view all profiles (for networking/job context)
CREATE POLICY "Clients can view all profiles"
  ON public.user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'client'
    )
  );

-- ------------------------------------------------------------
-- 4.2 jobs - Enhanced policies with client role support
-- ------------------------------------------------------------

-- Drop existing policies for clean slate
DROP POLICY IF EXISTS "Public can read published jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can read own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can create jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can update own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can delete own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can read all jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can update any job" ON public.jobs;
DROP POLICY IF EXISTS "Admins can delete any job" ON public.jobs;

-- Policy: Public can read published jobs
CREATE POLICY "Public can read published jobs"
  ON public.jobs FOR SELECT
  USING (status = 'published');

-- Policy: Authenticated users can read their own jobs (any status)
CREATE POLICY "Users can read own jobs"
  ON public.jobs FOR SELECT
  USING (auth.uid() = posted_by_user_id);

-- Policy: Users (including clients) can create jobs
CREATE POLICY "Users can create jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (auth.uid() = posted_by_user_id);

-- Policy: Users can update their own jobs (draft or pending only)
CREATE POLICY "Users can update own jobs"
  ON public.jobs FOR UPDATE
  USING (
    auth.uid() = posted_by_user_id 
    AND status IN ('draft', 'pending')
  )
  WITH CHECK (auth.uid() = posted_by_user_id);

-- Policy: Users can delete their own jobs (draft or pending only)
CREATE POLICY "Users can delete own jobs"
  ON public.jobs FOR DELETE
  USING (auth.uid() = posted_by_user_id AND status IN ('draft', 'pending'));

-- Policy: Admins can read all jobs
CREATE POLICY "Admins can read all jobs"
  ON public.jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can update any job
CREATE POLICY "Admins can update any job"
  ON public.jobs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can delete any job
CREATE POLICY "Admins can delete any job"
  ON public.jobs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ------------------------------------------------------------
-- 4.3 job_applications - Complete policies
-- ------------------------------------------------------------

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own applications" ON public.job_applications;
DROP POLICY IF EXISTS "Users can create own applications" ON public.job_applications;
DROP POLICY IF EXISTS "Users can update own applications" ON public.job_applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON public.job_applications;
DROP POLICY IF EXISTS "Admins can update all applications" ON public.job_applications;

-- Policy: Users can view their own applications
CREATE POLICY "Users can view own applications"
  ON public.job_applications FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create their own applications
CREATE POLICY "Users can create own applications"
  ON public.job_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own applications
CREATE POLICY "Users can update own applications"
  ON public.job_applications FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own applications
CREATE POLICY "Users can delete own applications"
  ON public.job_applications FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Admins can view all applications
CREATE POLICY "Admins can view all applications"
  ON public.job_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can update all applications
CREATE POLICY "Admins can update all applications"
  ON public.job_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ------------------------------------------------------------
-- 4.4 learning_modules - Complete policies
-- ------------------------------------------------------------

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view published modules" ON public.learning_modules;
DROP POLICY IF EXISTS "Admins can manage modules" ON public.learning_modules;

-- Policy: Anyone can view published modules
CREATE POLICY "Anyone can view published modules"
  ON public.learning_modules FOR SELECT
  USING (status = 'published');

-- Policy: Admins can manage modules (all operations)
CREATE POLICY "Admins can manage modules"
  ON public.learning_modules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ------------------------------------------------------------
-- 4.5 user_learning_progress - Complete policies
-- ------------------------------------------------------------

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_learning_progress;
DROP POLICY IF EXISTS "Users can upsert own progress" ON public.user_learning_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.user_learning_progress;
DROP POLICY IF EXISTS "Admins can view all progress" ON public.user_learning_progress;

-- Policy: Users can view their own progress
CREATE POLICY "Users can view own progress"
  ON public.user_learning_progress FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own progress
CREATE POLICY "Users can upsert own progress"
  ON public.user_learning_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own progress
CREATE POLICY "Users can update own progress"
  ON public.user_learning_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Admins can view all progress
CREATE POLICY "Admins can view all progress"
  ON public.user_learning_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ------------------------------------------------------------
-- 4.6 user_settings - Complete policies
-- ------------------------------------------------------------

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Service role can create settings" ON public.user_settings;
DROP POLICY IF EXISTS "Admins can view all settings" ON public.user_settings;

-- Policy: Users can view their own settings
CREATE POLICY "Users can view own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own settings
CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Service role can create settings (for auto-create trigger)
CREATE POLICY "Service role can create settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (true);

-- Policy: Admins can view all settings
CREATE POLICY "Admins can view all settings"
  ON public.user_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ------------------------------------------------------------
-- 4.7 activity_log - Complete policies
-- ------------------------------------------------------------

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own activity" ON public.activity_log;
DROP POLICY IF EXISTS "Service role can create activity" ON public.activity_log;
DROP POLICY IF EXISTS "Admins can view all activity" ON public.activity_log;

-- Policy: Users can view their own activity
CREATE POLICY "Users can view own activity"
  ON public.activity_log FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can create activity (for logging)
CREATE POLICY "Service role can create activity"
  ON public.activity_log FOR INSERT
  WITH CHECK (true);

-- Policy: Admins can view all activity
CREATE POLICY "Admins can view all activity"
  ON public.activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- 5. Helper views for common queries
-- ============================================================

-- View: Recent admin actions (last 100)
CREATE OR REPLACE VIEW public.recent_admin_actions AS
SELECT 
  aa.id,
  aa.admin_id,
  up.full_name AS admin_name,
  au.email AS admin_email,
  aa.action_type,
  aa.table_name,
  aa.record_id,
  aa.target_user_id,
  tp.full_name AS target_user_name,
  tu.email AS target_user_email,
  aa.old_values,
  aa.new_values,
  aa.notes,
  aa.created_at
FROM public.admin_actions aa
LEFT JOIN public.user_profiles up ON aa.admin_id = up.id
LEFT JOIN auth.users au ON aa.admin_id = au.id
LEFT JOIN public.user_profiles tp ON aa.target_user_id = tp.id
LEFT JOIN auth.users tu ON aa.target_user_id = tu.id
ORDER BY aa.created_at DESC
LIMIT 100;

COMMENT ON VIEW public.recent_admin_actions IS 'Convenience view showing the 100 most recent admin actions with user details.';

-- View: Admin action summary by type
CREATE OR REPLACE VIEW public.admin_action_summary AS
SELECT 
  action_type,
  COUNT(*) AS action_count,
  MIN(created_at) AS first_action,
  MAX(created_at) AS last_action
FROM public.admin_actions
GROUP BY action_type
ORDER BY action_count DESC;

COMMENT ON VIEW public.admin_action_summary IS 'Summary view showing count and date range for each admin action type.';

-- ============================================================
-- 6. Grant permissions (for service role usage)
-- ============================================================

-- Grant SELECT on views to authenticated users (for admin dashboard)
GRANT SELECT ON public.recent_admin_actions TO authenticated;
GRANT SELECT ON public.admin_action_summary TO authenticated;

-- ============================================================
-- Rollback instructions
-- ============================================================
-- Run these commands to rollback this migration:
-- 
-- DROP VIEW IF EXISTS public.admin_action_summary CASCADE;
-- DROP VIEW IF EXISTS public.recent_admin_actions CASCADE;
-- DROP TRIGGER IF EXISTS log_admin_learning_module_actions_trigger ON public.learning_modules;
-- DROP TRIGGER IF EXISTS log_admin_job_actions_trigger ON public.jobs;
-- DROP FUNCTION IF EXISTS public.log_admin_learning_module_actions() CASCADE;
-- DROP FUNCTION IF EXISTS public.log_admin_job_actions() CASCADE;
-- DROP FUNCTION IF EXISTS public.log_admin_action(UUID, public.admin_action_type_enum, TEXT, UUID, UUID, JSONB, JSONB, TEXT) CASCADE;
-- DROP TABLE IF EXISTS public.admin_actions CASCADE;
-- DROP TYPE IF EXISTS public.admin_action_type_enum CASCADE;
-- 
-- Note: RLS policies will be automatically restored on re-run
