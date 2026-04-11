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
    return [];
  }

  return (data || []) as Job[];
});

export const getAllJobsQuery = cache(async (): Promise<Job[]> => {
  const supabase = getSupabaseServerClient();
  
  // Fetch all jobs first
  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });

  if (jobsError) {
    return [];
  }

  if (!jobs || jobs.length === 0) {
    return [];
  }

  // Get unique user IDs from jobs
  const userIds = [...new Set(jobs.map(job => job.posted_by_user_id).filter(Boolean))];

  if (userIds.length === 0) {
    // No user IDs, just return jobs with Unknown author
    return jobs.map(job => ({
      ...job,
      author_name: "Unknown",
    })) as Job[];
  }

  // Fetch user profiles for these IDs
  const { data: profiles, error: profilesError } = await supabase
    .from("user_profiles")
    .select("id, full_name")
    .in("id", userIds);

  if (profilesError) {
    // Return jobs without author names
    return jobs.map(job => ({
      ...job,
      author_name: "Unknown",
    })) as Job[];
  }

  // Create a map of user ID to full name
  const profileMap = new Map();
  profiles?.forEach(profile => {
    profileMap.set(profile.id, profile.full_name);
  });

  // Add author_name to each job
  return jobs.map(job => ({
    ...job,
    author_name: profileMap.get(job.posted_by_user_id) || "Unknown",
  })) as Job[];
});
