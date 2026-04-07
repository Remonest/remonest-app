-- ============================================================
-- Migration: 002_create_dashboard_tables
-- Created: 2026-04-07
-- Description: Dashboard tables — jobs, applications, learning,
--              settings, activity log
-- ============================================================

-- ============================================================
-- 1. jobs — Job listings board
-- ============================================================
CREATE TABLE IF NOT EXISTS public.jobs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  company       TEXT NOT NULL,
  location      TEXT NOT NULL DEFAULT 'Remote',
  type          TEXT NOT NULL DEFAULT 'full-time'
                CHECK (type IN ('full-time', 'part-time', 'contract', 'freelance', 'internship')),
  salary_range  TEXT,
  description   TEXT,
  requirements  TEXT,
  benefits      TEXT,
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'closed', 'draft')),
  apply_url     TEXT,
  posted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.jobs IS 'Job listings available for application.';

CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs (status);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON public.jobs (posted_at DESC);

-- ============================================================
-- 2. job_applications — User job application tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS public.job_applications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id        UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'applied'
                CHECK (status IN ('applied', 'pending', 'viewed', 'interview', 'offered', 'rejected', 'withdrawn')),
  cover_letter  TEXT,
  resume_url    TEXT,
  notes         TEXT,
  applied_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.job_applications IS 'Tracks which jobs a user has applied to and their current status.';

CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON public.job_applications (user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON public.job_applications (job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications (status);
CREATE INDEX IF NOT EXISTS idx_job_applications_applied_at ON public.job_applications (applied_at DESC);

-- ============================================================
-- 3. learning_modules — Learning content
-- ============================================================
CREATE TABLE IF NOT EXISTS public.learning_modules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT NOT NULL UNIQUE,
  title         TEXT NOT NULL,
  description   TEXT,
  category      TEXT NOT NULL DEFAULT 'career'
                CHECK (category IN ('communication', 'mindset', 'career', 'design', 'productivity')),
  content       TEXT,
  thumbnail_url TEXT,
  duration_min  INT DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft', 'published', 'archived')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.learning_modules IS 'Educational modules for users to complete.';

CREATE INDEX IF NOT EXISTS idx_learning_modules_slug ON public.learning_modules (slug);
CREATE INDEX IF NOT EXISTS idx_learning_modules_category ON public.learning_modules (category);
CREATE INDEX IF NOT EXISTS idx_learning_modules_status ON public.learning_modules (status);

-- ============================================================
-- 4. user_learning_progress — Module completion tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_learning_progress (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id     UUID NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  progress      INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed_at  TIMESTAMPTZ,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

COMMENT ON TABLE public.user_learning_progress IS 'Tracks user progress through learning modules.';

CREATE INDEX IF NOT EXISTS idx_user_learning_progress_user_id ON public.user_learning_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_progress_module_id ON public.user_learning_progress (module_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_progress_completed ON public.user_learning_progress (completed_at) WHERE completed_at IS NOT NULL;

-- ============================================================
-- 5. user_settings — Extended user preferences & profile data
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_settings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  location              TEXT,
  role                  TEXT,
  bio                   TEXT,
  email_notifications   BOOLEAN NOT NULL DEFAULT true,
  job_alerts            BOOLEAN NOT NULL DEFAULT true,
  learning_reminders    BOOLEAN NOT NULL DEFAULT false,
  marketing_emails      BOOLEAN NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.user_settings IS 'Extended user settings and notification preferences.';

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings (user_id);

-- ============================================================
-- 6. activity_log — User activity feed
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activity_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type   TEXT NOT NULL
                CHECK (action_type IN ('job_applied', 'module_started', 'module_completed', 'profile_updated', 'cv_updated', 'portfolio_updated')),
  title         TEXT NOT NULL,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.activity_log IS 'Chronological activity feed for user dashboard.';

CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log (user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_action_type ON public.activity_log (action_type);

-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

-- 1. jobs — Anyone can read active jobs; only admins can write
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active jobs"         ON public.jobs;
DROP POLICY IF EXISTS "Admins can manage jobs"              ON public.jobs;

CREATE POLICY "Anyone can view active jobs"
  ON public.jobs FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admins can manage jobs"
  ON public.jobs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2. job_applications — Users manage own; admins read all
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own applications"     ON public.job_applications;
DROP POLICY IF EXISTS "Users can create own applications"    ON public.job_applications;
DROP POLICY IF EXISTS "Users can update own applications"    ON public.job_applications;
DROP POLICY IF EXISTS "Admins can view all applications"    ON public.job_applications;

CREATE POLICY "Users can view own applications"
  ON public.job_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own applications"
  ON public.job_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
  ON public.job_applications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications"
  ON public.job_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3. learning_modules — Anyone can read published; admins manage
ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published modules"   ON public.learning_modules;
DROP POLICY IF EXISTS "Admins can manage modules"           ON public.learning_modules;

CREATE POLICY "Anyone can view published modules"
  ON public.learning_modules FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can manage modules"
  ON public.learning_modules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. user_learning_progress — Users manage own; admins read all
ALTER TABLE public.user_learning_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own progress"         ON public.user_learning_progress;
DROP POLICY IF EXISTS "Users can upsert own progress"       ON public.user_learning_progress;
DROP POLICY IF EXISTS "Admins can view all progress"        ON public.user_learning_progress;

CREATE POLICY "Users can view own progress"
  ON public.user_learning_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own progress"
  ON public.user_learning_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.user_learning_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress"
  ON public.user_learning_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. user_settings — Users manage own; admins read all
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own settings"         ON public.user_settings;
DROP POLICY IF EXISTS "Users can update own settings"       ON public.user_settings;
DROP POLICY IF EXISTS "Service role can create settings"    ON public.user_settings;
DROP POLICY IF EXISTS "Admins can view all settings"        ON public.user_settings;

CREATE POLICY "Users can view own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can create settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all settings"
  ON public.user_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 6. activity_log — Users read own; service role writes; admins read all
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own activity"         ON public.activity_log;
DROP POLICY IF EXISTS "Service role can create activity"    ON public.activity_log;
DROP POLICY IF EXISTS "Admins can view all activity"        ON public.activity_log;

CREATE POLICY "Users can view own activity"
  ON public.activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can create activity"
  ON public.activity_log FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all activity"
  ON public.activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- Trigger: Auto-create user_settings on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_settings_created ON auth.users;
CREATE TRIGGER on_auth_user_settings_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_settings();

-- ============================================================
-- Helper function: Log user activity
-- ============================================================
CREATE OR REPLACE FUNCTION public.log_user_activity(
  p_user_id UUID,
  p_action_type TEXT,
  p_title TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO public.activity_log (user_id, action_type, title, metadata)
  VALUES (p_user_id, p_action_type, p_title, p_metadata)
  RETURNING id INTO v_activity_id;
  RETURN v_activity_id;
END;
$$;

-- ============================================================
-- Seed Data (for development/testing)
-- ============================================================

-- Sample jobs
INSERT INTO public.jobs (id, title, company, location, type, salary_range, description, requirements, benefits, status, posted_at)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Senior Frontend Developer', 'RemoteFirst Inc.', 'Worldwide', 'full-time', '$80k–$120k', 'Build and maintain our core product UI using React and TypeScript.', '5+ years React experience, TypeScript proficiency, remote work experience.', 'Health insurance, unlimited PTO, home office stipend.', 'active', NOW() - INTERVAL '7 days'),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Product Designer', 'DesignLab', 'US/Canada', 'full-time', '$70k–$100k', 'Design intuitive user experiences for our SaaS platform.', '3+ years product design, Figma expertise, portfolio required.', 'Flexible hours, equity, conference budget.', 'active', NOW() - INTERVAL '14 days'),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Full Stack Engineer', 'CloudNative Co.', 'Europe', 'contract', '$90k–$130k', 'Develop and deploy microservices with Node.js and Go.', 'Experience with Kubernetes, Docker, CI/CD pipelines.', 'Remote-first, async culture, annual retreat.', 'active', NOW() - INTERVAL '3 days'),
  ('d4e5f6a7-b8c9-0123-defa-234567890123', 'Digital Marketing Specialist', 'GrowthHQ', 'Worldwide', 'part-time', '$40k–$60k', 'Drive growth through SEO, content marketing, and paid ads.', '2+ years digital marketing, analytics experience.', 'Flexible schedule, performance bonuses.', 'active', NOW() - INTERVAL '21 days'),
  ('e5f6a7b8-c9d0-1234-efab-345678901234', 'DevOps Engineer', 'InfraStack', 'Worldwide', 'full-time', '$100k–$140k', 'Manage cloud infrastructure and CI/CD pipelines.', 'AWS/GCP experience, Terraform, monitoring tools.', 'Top-tier equipment budget, learning stipend.', 'active', NOW() - INTERVAL '1 day'),
  ('f6a7b8c9-d0e1-2345-fabc-456789012345', 'Technical Writer', 'DocuTech', 'Worldwide', 'freelance', '$50–$80/hr', 'Create developer documentation and API guides.', 'Technical writing experience, Markdown/GitHub proficiency.', 'Flexible deadlines, long-term engagement.', 'active', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- Sample learning modules
INSERT INTO public.learning_modules (id, slug, title, description, category, content, thumbnail_url, duration_min, status)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'async-communication-basics', 'Async Communication Basics', 'Learn how to communicate effectively in a remote, asynchronous environment.', 'communication', '# Async Communication Basics\n\nIn this module, you will learn:\n\n- When to use async vs sync communication\n- Writing clear, actionable messages\n- Setting expectations for response times\n- Tools for async collaboration\n\n## Best Practices\n\n1. **Be explicit** — Include all context in your message\n2. **Use threads** — Keep related discussions organized\n3. **Set status** — Let your team know your availability\n4. **Summarize** — End discussions with actionable takeaways', NULL, 30, 'published'),
  ('22222222-2222-2222-2222-222222222222', 'remote-mindset', 'Remote Work Mindset', 'Develop the right mindset for sustainable remote work.', 'mindset', '# Remote Work Mindset\n\nBuilding habits for long-term remote success.\n\n## Topics Covered\n\n- Separating work and personal life\n- Creating a dedicated workspace\n- Managing energy, not just time\n- Dealing with isolation', NULL, 45, 'published'),
  ('33333333-3333-3333-3333-333333333333', 'career-growth-remote', 'Career Growth in Remote Teams', 'How to advance your career when working remotely.', 'career', '# Career Growth in Remote Teams\n\nStrategies for visibility and advancement.\n\n## Key Strategies\n\n- Proactive communication\n- Document your impact\n- Seek feedback regularly\n- Build relationships intentionally', NULL, 60, 'published')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Rollback (run manually if needed):
-- ============================================================
-- DROP TRIGGER IF EXISTS on_auth_user_settings_created ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user_settings();
-- DROP FUNCTION IF EXISTS public.log_user_activity(UUID, TEXT, TEXT, JSONB);
-- DROP TABLE IF EXISTS public.activity_log CASCADE;
-- DROP TABLE IF EXISTS public.user_settings CASCADE;
-- DROP TABLE IF EXISTS public.user_learning_progress CASCADE;
-- DROP TABLE IF EXISTS public.learning_modules CASCADE;
-- DROP TABLE IF EXISTS public.job_applications CASCADE;
-- DROP TABLE IF EXISTS public.jobs CASCADE;
