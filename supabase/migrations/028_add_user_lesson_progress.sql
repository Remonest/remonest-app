-- ============================================================
-- Migration: 028_add_user_lesson_progress
-- Created: April 28, 2026
-- Description: Add lesson-level progress tracking for learning modules
--   - Add user_lesson_progress table to track individual lesson completion
--   - Add trigger to update module progress based on completed lessons
--   - Add helper function to calculate module progress from lessons
-- Dependencies: 018 (requires module_lessons table)
-- ============================================================

-- ============================================================
-- 1. TABLE: user_lesson_progress — Track individual lesson completion
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id     UUID NOT NULL REFERENCES public.module_lessons(id) ON DELETE CASCADE,
  module_id     UUID NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  completed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One completion record per user per lesson
  UNIQUE(user_id, lesson_id)
);

COMMENT ON TABLE public.user_lesson_progress IS 'Tracks individual lesson completion for users. Each row represents a completed lesson.';

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_id ON public.user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_lesson_id ON public.user_lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_module_id ON public.user_lesson_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_completed_at ON public.user_lesson_progress(completed_at DESC);

-- Composite index for user's progress in a module
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_module ON public.user_lesson_progress(user_id, module_id);


-- ============================================================
-- 2. FUNCTION: Calculate module progress from completed lessons
-- ============================================================

CREATE OR REPLACE FUNCTION public.calculate_module_progress(p_user_id UUID, p_module_id UUID)
RETURNS INT AS $$
DECLARE
  total_lessons INT;
  completed_lessons INT;
  progress INT;
BEGIN
  -- Count total lessons in the module
  SELECT COUNT(*) INTO total_lessons
  FROM public.module_lessons
  WHERE module_id = p_module_id;

  -- Count completed lessons for the user
  SELECT COUNT(*) INTO completed_lessons
  FROM public.user_lesson_progress
  WHERE user_id = p_user_id AND module_id = p_module_id;

  -- Calculate progress percentage
  IF total_lessons = 0 THEN
    progress := 0;
  ELSE
    progress := (completed_lessons * 100) / total_lessons;
  END IF;

  RETURN progress;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 3. FUNCTION: Update module progress when lesson is completed
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_module_progress_from_lessons()
RETURNS TRIGGER AS $$
DECLARE
  new_progress INT;
  module_completed BOOLEAN;
BEGIN
  -- Calculate new progress based on completed lessons
  new_progress := public.calculate_module_progress(NEW.user_id, NEW.module_id);

  -- Update user_learning_progress
  INSERT INTO public.user_learning_progress (user_id, module_id, progress, started_at, updated_at)
  VALUES (NEW.user_id, NEW.module_id, new_progress, NOW(), NOW())
  ON CONFLICT (user_id, module_id)
  DO UPDATE SET
    progress = EXCLUDED.progress,
    updated_at = NOW(),
    completed_at = CASE
      WHEN EXCLUDED.progress = 100 AND EXCLUDED.completed_at IS NULL THEN NOW()
      ELSE EXCLUDED.completed_at
    END;

  -- Log activity if this was the first lesson completion (module started)
  IF NOT EXISTS (
    SELECT 1 FROM public.user_learning_progress
    WHERE user_id = NEW.user_id AND module_id = NEW.module_id AND progress > 0
  ) THEN
    -- Module already started, no need to log again
    NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for lesson completion
DROP TRIGGER IF EXISTS trg_update_module_progress_on_lesson_complete ON public.user_lesson_progress;
CREATE TRIGGER trg_update_module_progress_on_lesson_complete
  AFTER INSERT ON public.user_lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_module_progress_from_lessons();


-- ============================================================
-- 4. FUNCTION: Get user's completed lesson IDs for a module
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_completed_lesson_ids(p_user_id UUID, p_module_id UUID)
RETURNS UUID[] AS $$
DECLARE
  lesson_ids UUID[];
BEGIN
  SELECT ARRAY_AGG(lesson_id) INTO lesson_ids
  FROM public.user_lesson_progress
  WHERE user_id = p_user_id AND module_id = p_module_id;

  RETURN COALESCE(lesson_ids, ARRAY[]::UUID[]);
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 5. RLS Policies for user_lesson_progress
-- ============================================================

ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own lesson progress
DROP POLICY IF EXISTS "Users can view own lesson progress" ON public.user_lesson_progress;
CREATE POLICY "Users can view own lesson progress"
  ON public.user_lesson_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own lesson progress
DROP POLICY IF EXISTS "Users can insert own lesson progress" ON public.user_lesson_progress;
CREATE POLICY "Users can insert own lesson progress"
  ON public.user_lesson_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own lesson progress (for undo functionality)
DROP POLICY IF EXISTS "Users can delete own lesson progress" ON public.user_lesson_progress;
CREATE POLICY "Users can delete own lesson progress"
  ON public.user_lesson_progress
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all lesson progress
DROP POLICY IF EXISTS "Admins can view all lesson progress" ON public.user_lesson_progress;
CREATE POLICY "Admins can view all lesson progress"
  ON public.user_lesson_progress
  FOR SELECT
  USING (public.is_admin());

-- Admins can manage all lesson progress
DROP POLICY IF EXISTS "Admins can manage all lesson progress" ON public.user_lesson_progress;
CREATE POLICY "Admins can manage all lesson progress"
  ON public.user_lesson_progress
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ============================================================
-- 6. ROLLBACK INSTRUCTIONS
-- ============================================================

-- Rollback: Reverse this migration
-- Uncomment to rollback:

-- DROP TRIGGER IF EXISTS trg_update_module_progress_on_lesson_complete ON public.user_lesson_progress;
-- DROP FUNCTION IF EXISTS public.update_module_progress_from_lessons();
-- DROP FUNCTION IF EXISTS public.calculate_module_progress();
-- DROP FUNCTION IF EXISTS public.get_user_completed_lesson_ids();
-- DROP TABLE IF EXISTS public.user_lesson_progress CASCADE;
-- DELETE FROM supabase_migrations.schema_migrations WHERE version = '028';
