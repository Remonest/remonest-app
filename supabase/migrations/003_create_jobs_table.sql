-- Migration: Create jobs table with dual posting workflow
-- Version: 003
-- Date: 2026-04-07

-- Drop existing jobs table if exists (from previous migration)
DROP TABLE IF EXISTS public.jobs CASCADE;

-- Create enum for job types
CREATE TYPE public.job_type_enum AS ENUM (
  'full-time',
  'part-time',
  'project',
  'freelance'
);

-- Create enum for job status
CREATE TYPE public.job_status_enum AS ENUM (
  'draft',
  'pending',
  'approved',
  'rejected',
  'published',
  'expired'
);

-- Create enum for apply method
CREATE TYPE public.apply_method_enum AS ENUM (
  'url',
  'email'
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic job information
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  description_html TEXT NOT NULL,

  -- Job classification
  job_type job_type_enum NOT NULL,

  -- Salary information
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT DEFAULT 'IDR',

  -- Job details
  location TEXT NOT NULL DEFAULT 'Remote',
  apply_method apply_method_enum NOT NULL DEFAULT 'url',
  apply_url TEXT,
  apply_email TEXT,

  -- Timeline
  deadline DATE,
  duration_estimate TEXT, -- e.g., "3 bulan", "6 bulan", "Permanen"

  -- Status and verification
  status job_status_enum NOT NULL DEFAULT 'draft',
  is_verified_by_admin BOOLEAN DEFAULT false,
  rejection_reason TEXT,

  -- Tracking
  posted_by_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT salary_min_positive CHECK (salary_min IS NULL OR salary_min >= 0),
  CONSTRAINT salary_max_positive CHECK (salary_max IS NULL OR salary_max >= 0),
  CONSTRAINT salary_range_valid CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_max >= salary_min),
  CONSTRAINT apply_url_present CHECK (apply_method = 'url' AND apply_url IS NOT NULL OR apply_method = 'email'),
  CONSTRAINT apply_email_present CHECK (apply_method = 'email' AND apply_email IS NOT NULL OR apply_method = 'url'),
  CONSTRAINT deadline_future CHECK (deadline IS NULL OR deadline >= CURRENT_DATE)
);

-- Create indexes for efficient queries
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_job_type ON public.jobs(job_type);
CREATE INDEX idx_jobs_deadline ON public.jobs(deadline);
CREATE INDEX idx_jobs_posted_by ON public.jobs(posted_by_user_id);
CREATE INDEX idx_jobs_published_at ON public.jobs(published_at);
CREATE INDEX idx_jobs_company ON public.jobs(company);

-- Composite index for job board queries
CREATE INDEX idx_jobs_status_type ON public.jobs(status, job_type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_jobs_updated_at();

-- Row Level Security (RLS) Policies
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Policy: Public can read published jobs
CREATE POLICY "Public can read published jobs"
  ON public.jobs FOR SELECT
  USING (status = 'published');

-- Policy: Authenticated users can read their own jobs
CREATE POLICY "Users can read own jobs"
  ON public.jobs FOR SELECT
  USING (auth.uid() = posted_by_user_id);

-- Policy: Users can create jobs (will be draft or pending based on role)
CREATE POLICY "Users can create jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (auth.uid() = posted_by_user_id);

-- Policy: Users can update their own jobs (draft or pending only)
CREATE POLICY "Users can update own jobs"
  ON public.jobs FOR UPDATE
  USING (auth.uid() = posted_by_user_id AND status IN ('draft', 'pending'))
  WITH CHECK (auth.uid() = posted_by_user_id);

-- Policy: Users can delete their own jobs (draft or pending only)
CREATE POLICY "Users can delete own jobs"
  ON public.jobs FOR DELETE
  USING (auth.uid() = posted_by_user_id AND status IN ('draft', 'pending'));

-- Policy: Admins can read all jobs
CREATE POLICY "Admins can read all jobs"
  ON public.jobs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Policy: Admins can update any job
CREATE POLICY "Admins can update any job"
  ON public.jobs FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Policy: Admins can delete any job
CREATE POLICY "Admins can delete any job"
  ON public.jobs FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Function to automatically expire jobs past deadline
CREATE OR REPLACE FUNCTION public.expire_old_jobs()
RETURNS VOID AS $$
BEGIN
  UPDATE public.jobs
  SET
    status = 'expired',
    updated_at = NOW()
  WHERE
    status = 'published'
    AND deadline < CURRENT_DATE
    AND deadline IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: To enable auto-expiry, you would need to create a cron job or use pg_cron extension
-- Example cron job (if pg_cron is available):
-- SELECT cron.schedule('expire-jobs-daily', '0 0 * * *', 'SELECT public.expire_old_jobs();');

-- Insert sample jobs for testing
INSERT INTO public.jobs (
  title,
  company,
  description_html,
  job_type,
  salary_min,
  salary_max,
  salary_currency,
  location,
  apply_method,
  apply_url,
  deadline,
  duration_estimate,
  status,
  is_verified_by_admin,
  posted_by_user_id,
  published_at
) VALUES
-- Published job (verified)
(
  'Senior Frontend Developer',
  'TechCorp Indonesia',
  '<p>Looking for an experienced frontend developer to join our remote team. You will work with React, Next.js, and TypeScript to build modern web applications.</p>
   <h3>Requirements:</h3>
   <ul>
     <li>3+ years experience with React</li>
     <li>Strong TypeScript skills</li>
     <li>Experience with Next.js</li>
     <li>Good communication skills in Indonesian and English</li>
   </ul>
   <h3>Benefits:</h3>
   <ul>
     <li>Competitive salary</li>
     <li>Remote work</li>
     <li>Health insurance</li>
     <li>Annual bonus</li>
   </ul>',
  'full-time',
  12000000,
  20000000,
  'IDR',
  'Remote / WFH',
  'url',
  'https://example.com/apply/senior-frontend',
  '2026-06-01',
  'Permanen',
  'published',
  true,
  (SELECT id FROM auth.users LIMIT 1),
  NOW() - INTERVAL '7 days'
),
-- Pending job (awaiting approval)
(
  'Part-time React Developer',
  'Startup XYZ',
  '<p>We need a part-time React developer for 20 hours per week. Flexible schedule, great for students or freelancers.</p>
   <h3>Requirements:</h3>
   <ul>
     <li>1+ year React experience</li>
     <li>Available 20 hours/week</li>
     <li>Basic TypeScript knowledge</li>
   </ul>',
  'part-time',
  5000000,
  8000000,
  'IDR',
  'Remote',
  'url',
  'https://example.com/apply/parttime-react',
  '2026-05-30',
  '6 bulan',
  'pending',
  false,
  (SELECT id FROM auth.users LIMIT 1),
  NULL
),
-- Published freelance job
(
  'Website Design Project',
  'Creative Agency',
  '<p>Looking for a freelance web designer to create a modern, responsive website for our client. Project duration 4 weeks.</p>
   <h3>Requirements:</h3>
   <ul>
     <li>Strong UI/UX design skills</li>
     <li>Figma expertise</li>
     <li>Portfolio required</li>
   </ul>',
  'freelance',
  15000000,
  25000000,
  'IDR',
  'Remote',
  'email',
  'careers@creativeagency.com',
  '2026-04-30',
  '4 minggu',
  'published',
  true,
  (SELECT id FROM auth.users LIMIT 1),
  NOW() - INTERVAL '2 days'
),
-- Published project job
(
  'E-commerce Platform Development',
  'RetailCo Indonesia',
  '<p>Build a complete e-commerce platform from scratch using Next.js, Prisma, and PostgreSQL. Fixed-term project.</p>
   <h3>Requirements:</h3>
   <ul>
     <li>Full-stack development experience</li>
     <li>Next.js and Prisma knowledge</li>
     <li>Previous e-commerce projects</li>
   </ul>',
  'project',
  50000000,
  80000000,
  'IDR',
  'Remote / Jakarta hybrid',
  'url',
  'https://example.com/apply/ecommerce',
  '2026-07-15',
  '3 bulan',
  'published',
  true,
  (SELECT id FROM auth.users LIMIT 1),
  NOW() - INTERVAL '14 days'
);

-- Rollback instructions (commented out)
/*
-- Rollback this migration by running:
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TYPE IF EXISTS public.job_type_enum CASCADE;
DROP TYPE IF EXISTS public.job_status_enum CASCADE;
DROP TYPE IF EXISTS public.apply_method_enum CASCADE;
DROP FUNCTION IF EXISTS public.update_jobs_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.expire_old_jobs() CASCADE;
*/
