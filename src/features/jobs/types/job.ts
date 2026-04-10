// ============================================================
// Centralized Job Types
// ============================================================

export type JobType = "full-time" | "part-time" | "project" | "freelance";

export type JobStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "published"
  | "expired";

export type ApplyMethod = "url" | "email";

export interface Job {
  id: string;
  title: string;
  company: string;
  description_html?: string | null;
  job_type: JobType | null;
  status: JobStatus;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string | null;
  location: string;
  apply_method: ApplyMethod | null;
  apply_url?: string | null;
  apply_email?: string | null;
  deadline?: string | null;
  duration_estimate?: string | null;
  posted_by_user_id: string;
  is_verified_by_admin: boolean | null;
  published_at?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
}
