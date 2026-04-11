"use server";

import { getCurrentUser } from "@/features/auth/actions/guards";
import {
  getSupabaseServerClient,
  getSupabaseServiceClient,
} from "@/lib/supabase/server";
import {
  getPublishedJobsQuery,
  getJobByIdQuery,
  getUserJobsQuery,
  getPendingJobsQuery,
  getAllJobsQuery,
} from "@/features/jobs/utils/queries";
import type { Job } from "@/features/jobs/types/job";

// ============================================================
// Helper: Check if user is admin (uses service role to bypass RLS)
// ============================================================

async function isAdmin(userId: string): Promise<boolean> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return false;
  }
  return data.role === "admin";
}

// ============================================================
// Get all published jobs (public)
// ============================================================

export async function getJobs(filters?: {
  job_type?: Job["job_type"];
  search?: string;
  location?: string;
}): Promise<Job[]> {
  return getPublishedJobsQuery(filters);
}

// ============================================================
// Get job by ID (public)
// ============================================================

export async function getJobById(id: string): Promise<Job | null> {
  return getJobByIdQuery(id);
}

// ============================================================
// Get jobs posted by current user
// ============================================================

export async function getUserJobs(): Promise<Job[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  return getUserJobsQuery(user.id);
}

// ============================================================
// Get pending jobs for admin approval
// ============================================================

export async function getPendingJobs(): Promise<Job[]> {
  const user = await getCurrentUser();
  if (!user || !(await isAdmin(user.id))) {
    return [];
  }

  return getPendingJobsQuery();
}

// ============================================================
// Get all jobs for admin (all statuses)
// ============================================================

export async function getAllJobs(): Promise<Job[]> {
  const user = await getCurrentUser();
  if (!user || !(await isAdmin(user.id))) {
    return [];
  }

  return getAllJobsQuery();
}

// ============================================================
// Test function to check jobs in database (debug only)
// ============================================================

export async function testJobsQuery() {
  const user = await getCurrentUser();
  if (!user) {
    return { authenticated: false };
  }

  const supabase = getSupabaseServerClient();

  const { data: allData, error: allError } = await supabase
    .from("jobs")
    .select("id, title, status")
    .order("created_at", { ascending: false });

  if (allError) {
    // Error occurred during test query
  }

  return {
    authenticated: true,
    totalJobs: allData?.length || 0,
    byStatus: {
      draft: allData?.filter((j) => j.status === "draft")?.length || 0,
      pending: allData?.filter((j) => j.status === "pending")?.length || 0,
      published: allData?.filter((j) => j.status === "published")?.length || 0,
    },
  };
}

// ============================================================
// Re-export for backward compatibility during transition
// ============================================================

export type { Job } from "@/features/jobs/types/job";
