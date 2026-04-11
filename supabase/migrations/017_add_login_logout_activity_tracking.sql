-- Migration: 017_add_login_logout_activity_tracking.sql
-- Purpose: Add login/logout activity tracking for all users
-- Date: 2026-04-11

-- ============================================================
-- 1. Add new enum values for login/logout
-- ============================================================

ALTER TYPE public.admin_action_type_enum ADD VALUE IF NOT EXISTS 'login';
ALTER TYPE public.admin_action_type_enum ADD VALUE IF NOT EXISTS 'logout';

COMMENT ON TYPE public.admin_action_type_enum IS 'Audit trail action types for admin operations including user login/logout tracking.';

-- ============================================================
-- 2. Update log_admin_action() to support ip_address and user_agent
-- ============================================================

-- Drop ALL overloaded versions of the function
-- We need to drop all versions before creating the new one
DROP FUNCTION IF EXISTS public.log_admin_action CASCADE;

CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_admin_id UUID,
  p_action_type public.admin_action_type_enum,
  p_table_name TEXT,
  p_record_id UUID DEFAULT NULL,
  p_target_user_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT '{}',
  p_new_values JSONB DEFAULT '{}',
  p_notes TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
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
    notes,
    ip_address,
    user_agent
  )
  VALUES (
    p_admin_id,
    p_action_type,
    p_table_name,
    p_record_id,
    p_target_user_id,
    p_old_values,
    p_new_values,
    p_notes,
    p_ip_address,
    p_user_agent
  )
  RETURNING id INTO v_action_id;

  RETURN v_action_id;
END;
$$;

COMMENT ON FUNCTION public.log_admin_action IS 'Helper function to log admin actions. Automatically called by triggers. Now supports ip_address and user_agent for login/logout tracking.';

-- ============================================================
-- 3. Create helper functions for login/logout logging
-- ============================================================

CREATE OR REPLACE FUNCTION public.log_user_login(
  p_user_id UUID,
  p_email TEXT,
  p_role TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action_id UUID;
  v_new_values JSONB;
BEGIN
  v_new_values := jsonb_build_object(
    'email', p_email,
    'role', p_role,
    'login_method', CASE 
      WHEN p_ip_address IS NOT NULL THEN 'email/password'
      ELSE 'oauth'
    END
  );

  SELECT public.log_admin_action(
    p_admin_id := p_user_id,
    p_action_type := 'login',
    p_table_name := 'auth_users',
    p_record_id := p_user_id,
    p_target_user_id := p_user_id,
    p_new_values := v_new_values,
    p_notes := 'User logged in',
    p_ip_address := p_ip_address,
    p_user_agent := p_user_agent
  ) INTO v_action_id;

  RETURN v_action_id;
END;
$$;

COMMENT ON FUNCTION public.log_user_login IS 'Logs user login activity to admin_actions table. Can be called from server actions.';

CREATE OR REPLACE FUNCTION public.log_user_logout(
  p_user_id UUID,
  p_email TEXT,
  p_role TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action_id UUID;
  v_old_values JSONB;
BEGIN
  v_old_values := jsonb_build_object(
    'email', p_email,
    'role', p_role
  );

  SELECT public.log_admin_action(
    p_admin_id := p_user_id,
    p_action_type := 'logout',
    p_table_name := 'auth_users',
    p_record_id := p_user_id,
    p_target_user_id := p_user_id,
    p_old_values := v_old_values,
    p_notes := 'User logged out',
    p_ip_address := p_ip_address,
    p_user_agent := p_user_agent
  ) INTO v_action_id;

  RETURN v_action_id;
END;
$$;

COMMENT ON FUNCTION public.log_user_logout IS 'Logs user logout activity to admin_actions table. Can be called from server actions.';
