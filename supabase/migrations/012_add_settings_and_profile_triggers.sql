-- ============================================================
-- Migration 012: Add admin logging for settings and profile updates
-- ============================================================

-- 1. Extend admin_action_type_enum with new action types
-- ============================================================
ALTER TYPE public.admin_action_type_enum ADD VALUE IF NOT EXISTS 'update_user_settings';
ALTER TYPE public.admin_action_type_enum ADD VALUE IF NOT EXISTS 'update_user_profile';
ALTER TYPE public.admin_action_type_enum ADD VALUE IF NOT EXISTS 'create_user';
ALTER TYPE public.admin_action_type_enum ADD VALUE IF NOT EXISTS 'update_site_settings';

COMMENT ON TYPE public.admin_action_type_enum IS 'Audit trail action types for admin operations.';

-- ============================================================
-- 2. Trigger for user_settings table
-- ============================================================
CREATE OR REPLACE FUNCTION public.log_admin_user_settings_actions()
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

  -- Determine action type
  IF TG_OP = 'UPDATE' THEN
    v_action_type := 'update_user_settings';
    v_old_values := to_jsonb(OLD);
    v_new_values := to_jsonb(NEW);
  ELSIF TG_OP = 'INSERT' THEN
    v_action_type := 'update_user_settings';
    v_new_values := to_jsonb(NEW);
  END IF;

  -- Log the action
  PERFORM public.log_admin_action(
    p_admin_id := v_admin_id,
    p_action_type := v_action_type,
    p_table_name := 'user_settings',
    p_record_id := COALESCE(NEW.id, OLD.id),
    p_target_user_id := COALESCE(NEW.user_id, OLD.user_id),
    p_old_values := v_old_values,
    p_new_values := v_new_values,
    p_notes := CASE
      WHEN TG_OP = 'UPDATE' THEN
        'User settings updated for user_id: ' || COALESCE(NEW.user_id, OLD.user_id)::text
      ELSE
        'User settings created for user_id: ' || NEW.user_id::text
    END
  );

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.log_admin_user_settings_actions IS 'Automatically logs admin actions on user_settings table.';

-- Attach trigger to user_settings table
DROP TRIGGER IF EXISTS log_admin_user_settings_actions_trigger ON public.user_settings;
CREATE TRIGGER log_admin_user_settings_actions_trigger
  AFTER INSERT OR UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.log_admin_user_settings_actions();

-- ============================================================
-- 3. Trigger for user_profiles table (role/profile changes)
-- ============================================================
CREATE OR REPLACE FUNCTION public.log_admin_user_profile_actions()
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
  v_target_user_id UUID;
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

  v_target_user_id := COALESCE(NEW.id, OLD.id);

  -- Determine action type
  IF TG_OP = 'UPDATE' THEN
    -- Check if role changed
    IF OLD.role IS DISTINCT FROM NEW.role THEN
      v_action_type := 'update_user_role';
    ELSE
      v_action_type := 'update_user_profile';
    END IF;
    v_old_values := to_jsonb(OLD);
    v_new_values := to_jsonb(NEW);
  ELSIF TG_OP = 'INSERT' THEN
    v_action_type := 'create_user';
    v_new_values := to_jsonb(NEW);
  ELSIF TG_OP = 'DELETE' THEN
    v_action_type := 'delete_user';
    v_old_values := to_jsonb(OLD);
  END IF;

  -- Log the action
  PERFORM public.log_admin_action(
    p_admin_id := v_admin_id,
    p_action_type := v_action_type,
    p_table_name := 'user_profiles',
    p_record_id := v_target_user_id,
    p_target_user_id := v_target_user_id,
    p_old_values := v_old_values,
    p_new_values := v_new_values,
    p_notes := CASE
      WHEN TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role THEN
        'Role changed from ' || COALESCE(OLD.role, 'null') || ' to ' || COALESCE(NEW.role, 'null')
      WHEN TG_OP = 'UPDATE' THEN
        'User profile updated for user_id: ' || v_target_user_id::text
      WHEN TG_OP = 'INSERT' THEN
        'New user profile created for user_id: ' || v_target_user_id::text
      WHEN TG_OP = 'DELETE' THEN
        'User profile deleted for user_id: ' || v_target_user_id::text
      ELSE NULL
    END
  );

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.log_admin_user_profile_actions IS 'Automatically logs admin actions on user_profiles table.';

-- Attach trigger to user_profiles table
DROP TRIGGER IF EXISTS log_admin_user_profile_actions_trigger ON public.user_profiles;
CREATE TRIGGER log_admin_user_profile_actions_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_admin_user_profile_actions();

-- ============================================================
-- 4. Update recent_admin_actions view to ensure admin info is always included
-- ============================================================
CREATE OR REPLACE VIEW public.recent_admin_actions AS
SELECT 
  aa.id,
  aa.admin_id,
  aa.target_user_id,
  aa.action_type,
  aa.table_name,
  aa.record_id,
  aa.old_values,
  aa.new_values,
  aa.ip_address,
  aa.user_agent,
  aa.notes,
  aa.created_at,
  up.full_name AS admin_name,
  au.email AS admin_email,
  au.raw_user_meta_data->>'name' AS admin_name_metadata,
  tp.full_name AS target_user_name,
  tu.email AS target_user_email
FROM public.admin_actions aa
LEFT JOIN public.user_profiles up ON aa.admin_id = up.id
LEFT JOIN auth.users au ON aa.admin_id = au.id
LEFT JOIN public.user_profiles tp ON aa.target_user_id = tp.id
LEFT JOIN auth.users tu ON aa.target_user_id = tu.id
ORDER BY aa.created_at DESC
LIMIT 500;

COMMENT ON VIEW public.recent_admin_actions IS 'Recent admin actions with admin and target user details. Shows admin full_name and email.';

-- ============================================================
-- 5. Ensure service role can insert on user_settings and user_profiles
-- ============================================================
DROP POLICY IF EXISTS "Service role can insert user_settings" ON public.user_settings;
CREATE POLICY "Service role can insert user_settings"
  ON public.user_settings FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update user_settings" ON public.user_settings;
CREATE POLICY "Service role can update user_settings"
  ON public.user_settings FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Ensure admins can manage user_profiles (for role changes)
DROP POLICY IF EXISTS "Admins can update user_profiles" ON public.user_profiles;
CREATE POLICY "Admins can update user_profiles"
  ON public.user_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'admin'
    )
  )
  WITH CHECK (true);

-- ============================================================
-- Migration complete
-- ============================================================
COMMENT ON SCHEMA public IS 'Migration 012: Added admin logging for settings, profile updates, and role changes. Admin email/name now properly resolved in recent_admin_actions view.';
