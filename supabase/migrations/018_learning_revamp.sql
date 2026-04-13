-- ============================================================
-- Migration: 018_learning_revamp
-- Created: April 13, 2026
-- Description: Major learning module revamp
--   - Add module_lessons table for ordered step-based learning
--   - Add module_reviews table for user ratings & reviews
--   - Add order_index to learning_materials for manual ordering
--   - Add difficulty_level, enrollment_count, average_rating to learning_modules
-- Dependencies: 017 (requires all previous migrations)
-- ============================================================

-- ============================================================
-- 0. CLEANUP: Remove orphaned rows from failed previous attempts
-- ============================================================

-- Remove orphaned module_lessons rows
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'module_lessons'
  ) THEN
    DELETE FROM public.module_lessons
    WHERE module_id NOT IN (SELECT id FROM public.learning_modules);

    DELETE FROM public.module_lessons
    WHERE material_id IS NOT NULL
      AND material_id NOT IN (SELECT id FROM public.learning_materials);

    DELETE FROM public.module_lessons
    WHERE quiz_config_id IS NOT NULL
      AND quiz_config_id NOT IN (SELECT id FROM public.quiz_configs);
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'module_reviews'
  ) THEN
    DELETE FROM public.module_reviews
    WHERE module_id NOT IN (SELECT id FROM public.learning_modules);
  END IF;
END $$;

-- Remove orphaned learning_materials (module was deleted)
DELETE FROM public.learning_materials
WHERE module_id NOT IN (SELECT id FROM public.learning_modules);

-- ============================================================
-- 1. ALTER learning_modules — Add new fields for rich display
-- ============================================================

-- Difficulty level for module categorization (beginner/intermediate/advanced)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'learning_modules' AND column_name = 'difficulty_level'
  ) THEN
    ALTER TABLE public.learning_modules
      ADD COLUMN difficulty_level TEXT DEFAULT 'beginner'
        CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced'));
  END IF;
END $$;

-- Enrollment count (denormalized for performance, updated by trigger)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'learning_modules' AND column_name = 'enrollment_count'
  ) THEN
    ALTER TABLE public.learning_modules
      ADD COLUMN enrollment_count INT NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Average rating (denormalized, updated by trigger)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'learning_modules' AND column_name = 'average_rating'
  ) THEN
    ALTER TABLE public.learning_modules
      ADD COLUMN average_rating DECIMAL(3, 2) DEFAULT 0.00
        CHECK (average_rating >= 0 AND average_rating <= 5);
  END IF;
END $$;

-- Index for difficulty filtering
CREATE INDEX IF NOT EXISTS idx_learning_modules_difficulty ON public.learning_modules(difficulty_level);


-- ============================================================
-- 2. ALTER learning_materials — Add order_index for manual ordering
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'learning_materials' AND column_name = 'order_index'
  ) THEN
    ALTER TABLE public.learning_materials
      ADD COLUMN order_index INT NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Index for ordered retrieval
CREATE INDEX IF NOT EXISTS idx_learning_materials_order ON public.learning_materials(module_id, order_index);


-- ============================================================
-- 3. TABLE: module_lessons — Ordered steps within a module
-- ============================================================

CREATE TABLE IF NOT EXISTS public.module_lessons (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id         UUID NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  description       TEXT,
  order_index       INT NOT NULL DEFAULT 0,
  lesson_type       TEXT NOT NULL DEFAULT 'article'
    CHECK (lesson_type IN ('video', 'article', 'exercise', 'quiz', 'resource')),
  material_id       UUID REFERENCES public.learning_materials(id) ON DELETE SET NULL,
  resource_id       UUID REFERENCES public.learning_resources(id) ON DELETE SET NULL,
  quiz_config_id    UUID REFERENCES public.quiz_configs(id) ON DELETE SET NULL,
  duration_minutes  INT DEFAULT 0 CHECK (duration_minutes >= 0),
  is_preview        BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- A lesson can link to ONE content type
  CONSTRAINT lesson_content_check CHECK (
    (material_id IS NOT NULL AND resource_id IS NULL AND quiz_config_id IS NULL) OR
    (material_id IS NULL AND resource_id IS NOT NULL AND quiz_config_id IS NULL) OR
    (material_id IS NULL AND resource_id IS NULL AND quiz_config_id IS NOT NULL) OR
    (material_id IS NULL AND resource_id IS NULL AND quiz_config_id IS NULL)
  )
);

COMMENT ON TABLE public.module_lessons IS 'Ordered lessons/steps within a learning module. Each lesson links to a material, resource, or quiz.';

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_module_lessons_module_id ON public.module_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_module_lessons_order ON public.module_lessons(module_id, order_index);
CREATE INDEX IF NOT EXISTS idx_module_lessons_type ON public.module_lessons(lesson_type);
CREATE INDEX IF NOT EXISTS idx_module_lessons_material ON public.module_lessons(material_id);
CREATE INDEX IF NOT EXISTS idx_module_lessons_quiz ON public.module_lessons(quiz_config_id);

-- Auto-update trigger for updated_at
DROP TRIGGER IF EXISTS update_module_lessons_updated_at ON public.module_lessons;
CREATE TRIGGER update_module_lessons_updated_at
  BEFORE UPDATE ON public.module_lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_quiz_updated_at();

-- RLS for module_lessons
ALTER TABLE public.module_lessons ENABLE ROW LEVEL SECURITY;

-- Anyone can view lessons from published modules
DROP POLICY IF EXISTS "Anyone can view lessons from published modules" ON public.module_lessons;
CREATE POLICY "Anyone can view lessons from published modules"
  ON public.module_lessons
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.learning_modules lm
      WHERE lm.id = module_lessons.module_id
      AND lm.status = 'published'
    )
  );

-- Admins have full CRUD
DROP POLICY IF EXISTS "Admins can manage module lessons" ON public.module_lessons;
CREATE POLICY "Admins can manage module lessons"
  ON public.module_lessons
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ============================================================
-- 4. TABLE: module_reviews — User ratings & reviews
-- ============================================================

CREATE TABLE IF NOT EXISTS public.module_reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id     UUID NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating        INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One review per user per module
  UNIQUE(user_id, module_id)
);

COMMENT ON TABLE public.module_reviews IS 'User reviews and ratings for learning modules.';

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_module_reviews_module_id ON public.module_reviews(module_id);
CREATE INDEX IF NOT EXISTS idx_module_reviews_user_id ON public.module_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_module_reviews_rating ON public.module_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_module_reviews_created_at ON public.module_reviews(created_at DESC);

-- Auto-update trigger for updated_at
DROP TRIGGER IF EXISTS update_module_reviews_updated_at ON public.module_reviews;
CREATE TRIGGER update_module_reviews_updated_at
  BEFORE UPDATE ON public.module_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_quiz_updated_at();

-- RLS for module_reviews
ALTER TABLE public.module_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews for published modules
DROP POLICY IF EXISTS "Anyone can view reviews for published modules" ON public.module_reviews;
CREATE POLICY "Anyone can view reviews for published modules"
  ON public.module_reviews
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.learning_modules lm
      WHERE lm.id = module_reviews.module_id
      AND lm.status = 'published'
    )
  );

-- Users can create their own review (only if enrolled)
DROP POLICY IF EXISTS "Users can create own review" ON public.module_reviews;
CREATE POLICY "Users can create own review"
  ON public.module_reviews
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.user_learning_progress ulp
      WHERE ulp.user_id = auth.uid()
      AND ulp.module_id = module_reviews.module_id
    )
  );

-- Users can update their own review
DROP POLICY IF EXISTS "Users can update own review" ON public.module_reviews;
CREATE POLICY "Users can update own review"
  ON public.module_reviews
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own review
DROP POLICY IF EXISTS "Users can delete own review" ON public.module_reviews;
CREATE POLICY "Users can delete own review"
  ON public.module_reviews
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins have full CRUD
DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.module_reviews;
CREATE POLICY "Admins can manage all reviews"
  ON public.module_reviews
  FOR ALL
  USING (public.is_admin());


-- ============================================================
-- 5. FUNCTION: Update module enrollment count
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_module_enrollment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.learning_modules
    SET enrollment_count = enrollment_count + 1
    WHERE id = NEW.module_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.learning_modules
    SET enrollment_count = GREATEST(enrollment_count - 1, 0)
    WHERE id = OLD.module_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_enrollment_count ON public.user_learning_progress;
CREATE TRIGGER trg_update_enrollment_count
  AFTER INSERT OR DELETE ON public.user_learning_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_module_enrollment_count();


-- ============================================================
-- 6. FUNCTION: Update module average rating
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_module_average_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.learning_modules
    SET average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.module_reviews
      WHERE module_id = NEW.module_id
    )
    WHERE id = NEW.module_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.learning_modules
    SET average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.module_reviews
      WHERE module_id = NEW.module_id
    )
    WHERE id = NEW.module_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.learning_modules
    SET average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.module_reviews
      WHERE module_id = OLD.module_id
    )
    WHERE id = OLD.module_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_average_rating ON public.module_reviews;
CREATE TRIGGER trg_update_average_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.module_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_module_average_rating();


-- ============================================================
-- 7. SEED: Create lessons from existing materials
-- ============================================================

-- For existing modules, create a lesson for each published material
-- Map source_type to valid lesson_type (documentation → article)
INSERT INTO public.module_lessons (module_id, title, description, order_index, lesson_type, material_id, duration_minutes, is_preview)
SELECT
  lm.module_id AS module_id,   -- FIX: use module_id, not id
  lm.title AS title,
  lm.summary AS description,
  ROW_NUMBER() OVER (PARTITION BY lm.module_id ORDER BY lm.created_at) - 1 AS order_index,
  CASE
    WHEN lm.source_type = 'video' THEN 'video'
    WHEN lm.source_type = 'documentation' THEN 'article'
    WHEN lm.source_type = 'tutorial' THEN 'article'
    WHEN lm.source_type = 'article' THEN 'article'
    ELSE 'article'
  END AS lesson_type,
  lm.id AS material_id,
  COALESCE(lm.reading_time_minutes, 15) AS duration_minutes,
  false AS is_preview
FROM public.learning_materials lm
WHERE lm.is_published = true
  -- Don't duplicate if lesson already exists for this material
  AND NOT EXISTS (
    SELECT 1 FROM public.module_lessons ml
    WHERE ml.material_id = lm.id
  )
ON CONFLICT DO NOTHING;


-- ============================================================
-- 8. ROLLBACK INSTRUCTIONS
-- ============================================================

-- Rollback: Reverse this migration
-- Uncomment to rollback:

-- DROP TRIGGER IF EXISTS trg_update_average_rating ON public.module_reviews;
-- DROP TRIGGER IF EXISTS trg_update_enrollment_count ON public.user_learning_progress;
-- DROP FUNCTION IF EXISTS public.update_module_average_rating();
-- DROP FUNCTION IF EXISTS public.update_module_enrollment_count();

-- DROP TABLE IF EXISTS public.module_reviews CASCADE;
-- DROP TABLE IF EXISTS public.module_lessons CASCADE;

-- ALTER TABLE public.learning_materials DROP COLUMN IF EXISTS order_index;

-- ALTER TABLE public.learning_modules DROP COLUMN IF EXISTS average_rating;
-- ALTER TABLE public.learning_modules DROP COLUMN IF EXISTS enrollment_count;
-- ALTER TABLE public.learning_modules DROP COLUMN IF EXISTS difficulty_level;

-- DELETE FROM supabase_migrations.schema_migrations WHERE version = '018';
