-- ================================================================
-- Cleanup: Delete Demo Learning Module
-- ================================================================
-- Removes "Dasar-Dasar Remote Working" and ALL associated data:
--   - Module
--   - Lessons
--   - Materials
--   - Resources
--   - Quiz configs & questions
--   - User progress (and thus certificates)
--   - Reviews
--   - Quiz attempts
--
-- CASCADE handles most of this, but we explicitly clear
-- cross-table references (progress, attempts, reviews) first.
-- ================================================================

BEGIN;

-- 1. Get the module ID
DO $$
DECLARE
  v_module_id UUID;
BEGIN

  SELECT id INTO v_module_id
  FROM learning_modules
  WHERE slug = 'dasar-remote-working';

  IF v_module_id IS NULL THEN
    RAISE NOTICE 'Demo module "dasar-remote-working" not found — nothing to clean up.';
    RETURN;
  END IF;

  RAISE NOTICE 'Cleaning up demo module: % (%)', v_module_id, 'dasar-remote-working';

  -- 2. Delete user progress (removes certificate generation)
  DELETE FROM user_learning_progress
  WHERE module_id = v_module_id;

  -- 3. Delete quiz attempts
  DELETE FROM user_quiz_attempts
  WHERE quiz_config_id IN (
    SELECT id FROM quiz_configs WHERE module_id = v_module_id
  );

  -- 4. Delete reviews
  DELETE FROM module_reviews
  WHERE module_id = v_module_id;

  -- 5. Delete questions (FK → quiz_configs, cascade would handle but be explicit)
  DELETE FROM questions
  WHERE quiz_config_id IN (
    SELECT id FROM quiz_configs WHERE module_id = v_module_id
  );

  -- 6. Delete module lessons (FK → module, CASCADE)
  DELETE FROM module_lessons
  WHERE module_id = v_module_id;

  -- 7. Delete materials (FK → module, CASCADE)
  DELETE FROM learning_materials
  WHERE module_id = v_module_id;

  -- 8. Delete resources (FK → module, CASCADE)
  DELETE FROM learning_resources
  WHERE module_id = v_module_id;

  -- 9. Delete quiz configs (FK → module, CASCADE)
  DELETE FROM quiz_configs
  WHERE module_id = v_module_id;

  -- 10. Delete the module itself
  DELETE FROM learning_modules
  WHERE id = v_module_id;

  RAISE NOTICE 'Demo module and all associated data deleted successfully.';

END $$;

COMMIT;
