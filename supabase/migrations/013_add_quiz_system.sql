-- ============================================================
-- Migration: 013_add_quiz_system
-- Created: April 11, 2026
-- Description: Add quiz/assessment functionality to learning modules
-- Dependencies: 012 (requires quiz-related functions from previous migrations)
-- ============================================================

-- Quiz configurations table
CREATE TABLE IF NOT EXISTS public.quiz_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INT CHECK (duration_minutes IS NULL OR duration_minutes > 0),
  passing_grade INT NOT NULL DEFAULT 70 CHECK (passing_grade >= 0 AND passing_grade <= 100),
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Questions table with JSONB options
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_config_id UUID NOT NULL REFERENCES public.quiz_configs(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D', 'E')),
  explanation TEXT,
  difficulty TEXT NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_quiz_configs_module_id ON public.quiz_configs(module_id);
CREATE INDEX idx_questions_quiz_config_id ON public.questions(quiz_config_id);
CREATE INDEX idx_questions_difficulty ON public.questions(difficulty);

-- Auto-update trigger for updated_at
CREATE OR REPLACE FUNCTION update_quiz_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quiz_configs_updated_at
  BEFORE UPDATE ON public.quiz_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_updated_at();

CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_updated_at();

-- RLS Policies for quiz_configs
ALTER TABLE public.quiz_configs ENABLE ROW LEVEL SECURITY;

-- Anyone can view published quizzes for their modules
CREATE POLICY "Anyone can view published quizzes"
  ON public.quiz_configs
  FOR SELECT
  USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM public.learning_modules lm
      WHERE lm.id = quiz_configs.module_id
      AND lm.status = 'published'
    )
  );

-- Admins have full CRUD on quiz_configs
CREATE POLICY "Admins can manage quiz configs"
  ON public.quiz_configs
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid()
      AND up.role = 'admin'
    )
  );

-- RLS Policies for questions
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Anyone can view questions from published quizzes
CREATE POLICY "Anyone can view questions from published quizzes"
  ON public.questions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz_configs qc
      JOIN public.learning_modules lm ON lm.id = qc.module_id
      WHERE qc.id = questions.quiz_config_id
      AND qc.is_published = true
      AND lm.status = 'published'
    )
  );

-- Admins have full CRUD on questions
CREATE POLICY "Admins can manage questions"
  ON public.questions
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid()
      AND up.role = 'admin'
    )
  );

-- User quiz attempts tracking (for future implementation)
CREATE TABLE IF NOT EXISTS public.user_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_config_id UUID NOT NULL REFERENCES public.quiz_configs(id) ON DELETE CASCADE,
  score INT NOT NULL CHECK (score >= 0 AND score <= 100),
  passed BOOLEAN NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, quiz_config_id)
);

-- Index for user quiz attempts
CREATE INDEX idx_user_quiz_attempts_user_id ON public.user_quiz_attempts(user_id);
CREATE INDEX idx_user_quiz_attempts_quiz_id ON public.user_quiz_attempts(quiz_config_id);

-- RLS for user_quiz_attempts
ALTER TABLE public.user_quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Users can view their own attempts
CREATE POLICY "Users can view own quiz attempts"
  ON public.user_quiz_attempts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own attempts
CREATE POLICY "Users can create quiz attempts"
  ON public.user_quiz_attempts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all quiz attempts
CREATE POLICY "Admins can view all quiz attempts"
  ON public.user_quiz_attempts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid()
      AND up.role = 'admin'
    )
  );

-- Note: Admin action logging for quiz configs and questions
-- is handled at the application level in server actions (quiz-actions.ts)
-- This provides better context and user tracking than database triggers
