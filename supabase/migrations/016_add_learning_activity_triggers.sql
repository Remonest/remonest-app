-- ============================================================
-- Migration: 016_add_learning_activity_triggers
-- Created: April 12, 2026
-- Description: Add admin activity log triggers for learning
--              materials and resources tables. Also adds new
--              action types to admin_action_type_enum.
-- Dependencies: 015 (requires learning_materials, learning_resources,
--                    and admin_action_type_enum from previous migrations)
-- Rollback: See bottom of file
-- ============================================================

-- ============================================================
-- Add new action types to the enum
-- ============================================================
ALTER TYPE public.admin_action_type_enum ADD VALUE IF NOT EXISTS 'create_learning_material';
ALTER TYPE public.admin_action_type_enum ADD VALUE IF NOT EXISTS 'update_learning_material';
ALTER TYPE public.admin_action_type_enum ADD VALUE IF NOT EXISTS 'delete_learning_material';
ALTER TYPE public.admin_action_type_enum ADD VALUE IF NOT EXISTS 'create_learning_resource';
ALTER TYPE public.admin_action_type_enum ADD VALUE IF NOT EXISTS 'delete_learning_resource';

-- ============================================================
-- Trigger: learning_materials
-- ============================================================
CREATE OR REPLACE FUNCTION public.log_admin_learning_material_actions()
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
  v_admin_id := auth.uid();

  -- Only log if user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = v_admin_id AND role = 'admin'
  ) THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    v_action_type := 'delete_learning_material';
    v_old_values := to_jsonb(OLD);
  ELSIF TG_OP = 'UPDATE' THEN
    v_action_type := 'update_learning_material';
    v_old_values := to_jsonb(OLD);
    v_new_values := to_jsonb(NEW);
  ELSIF TG_OP = 'INSERT' THEN
    v_action_type := 'create_learning_material';
    v_new_values := to_jsonb(NEW);
  END IF;

  PERFORM public.log_admin_action(
    p_admin_id := v_admin_id,
    p_action_type := v_action_type,
    p_table_name := 'learning_materials',
    p_record_id := COALESCE(NEW.id, OLD.id),
    p_old_values := v_old_values,
    p_new_values := v_new_values,
    p_notes := CASE
      WHEN TG_OP = 'UPDATE' AND OLD.is_published != NEW.is_published THEN
        'Publish status changed from ' || OLD.is_published::text || ' to ' || NEW.is_published::text
      ELSE NULL
    END
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS log_admin_learning_material_actions_trigger ON public.learning_materials;
CREATE TRIGGER log_admin_learning_material_actions_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.learning_materials
  FOR EACH ROW
  EXECUTE FUNCTION public.log_admin_learning_material_actions();

-- ============================================================
-- Trigger: learning_resources
-- ============================================================
CREATE OR REPLACE FUNCTION public.log_admin_learning_resource_actions()
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
  v_admin_id := auth.uid();

  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = v_admin_id AND role = 'admin'
  ) THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    v_action_type := 'delete_learning_resource';
    v_old_values := to_jsonb(OLD);
  ELSIF TG_OP = 'INSERT' THEN
    v_action_type := 'create_learning_resource';
    v_new_values := to_jsonb(NEW);
  END IF;

  -- No UPDATE trigger for resources (no update action exists)
  PERFORM public.log_admin_action(
    p_admin_id := v_admin_id,
    p_action_type := v_action_type,
    p_table_name := 'learning_resources',
    p_record_id := COALESCE(NEW.id, OLD.id),
    p_old_values := v_old_values,
    p_new_values := v_new_values
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS log_admin_learning_resource_actions_trigger ON public.learning_resources;
CREATE TRIGGER log_admin_learning_resource_actions_trigger
  AFTER INSERT OR DELETE ON public.learning_resources
  FOR EACH ROW
  EXECUTE FUNCTION public.log_admin_learning_resource_actions();

-- ============================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================
-- DROP TRIGGER IF EXISTS log_admin_learning_material_actions_trigger ON public.learning_materials;
-- DROP TRIGGER IF EXISTS log_admin_learning_resource_actions_trigger ON public.learning_resources;
-- DROP FUNCTION IF EXISTS public.log_admin_learning_material_actions() CASCADE;
-- DROP FUNCTION IF EXISTS public.log_admin_learning_resource_actions() CASCADE;
-- Note: Cannot remove enum values in PostgreSQL. If needed, recreate the enum:
-- CREATE TYPE public.admin_action_type_enum_new AS ENUM ('approve_job', 'reject_job', 'delete_job', 'publish_job', 'republish_job', 'update_job', 'create_learning_module', 'update_learning_module', 'delete_learning_module', 'update_user_role', 'delete_user', 'other');
-- ALTER TABLE public.admin_actions ALTER COLUMN action_type TYPE public.admin_action_type_enum_new USING action_type::text::public.admin_action_type_enum_new;
-- DROP TYPE public.admin_action_type_enum;
-- ALTER TYPE public.admin_action_type_enum_new RENAME TO admin_action_type_enum;
-- DELETE FROM supabase_migrations.schema_migrations WHERE version = '016';
