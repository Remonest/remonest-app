import { cache } from "react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Job } from "@/features/jobs/types/job";

// ============================================================
// Cached Supabase Query Builders for Jobs
// These wrap the base queries with React cache for deduplication
// within a single request.
// ============================================================

export const getPublishedJobsQuery = cache(
  async (filters?: {
    job_type?: Job["job_type"];
    search?: string;
    location?: string;
  }): Promise<Job[]> => {
    const supabase = getSupabaseServerClient();

    let query = supabase
      .from("jobs")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (filters?.job_type) {
      query = query.eq("job_type", filters.job_type);
    }

    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,company.ilike.%${filters.search}%`,
      );
    }

    if (filters?.location) {
      query = query.ilike("location", `%${filters.location}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching published jobs:", error);
      return [];
    }

    return (data || []) as Job[];
  },
);

export const getJobByIdQuery = cache(async (id: string): Promise<Job | null> => {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching job by ID:", error);
    return null;
  }

  return data as Job | null;
});

export const getUserJobsQuery = cache(async (userId: string): Promise<Job[]> => {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("posted_by_user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user jobs:", error);
    return [];
  }

  return (data || []) as Job[];
});

export const getPendingJobsQuery = cache(async (): Promise<Job[]> => {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching pending jobs:", error);
    return [];
  }

  return (data || []) as Job[];
});

export const getAllJobsQuery = cache(async (): Promise<Job[]> => {
  const supabase = getSupabaseServerClient();
  
  // Fetch jobs with author info using join
  const { data, error } = await supabase
    .from("jobs")
    .select(`
      *,
      author:user_profiles!jobs_posted_by_user_id_fkey(full_name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all jobs:", error);
    return [];
  }

  // Add author_name to each job
  const jobsWithAuthor = (data || []).map((job: any) => ({
    ...job,
    author_name: job.author?.full_name || "Unknown",
  }));

  return jobsWithAuthor as Job[];
});
