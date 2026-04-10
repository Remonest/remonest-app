"use server";

import { requireAuth } from "@/features/auth/actions/guards";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { ApplicationEntry } from "@/features/dashboard/types/dashboard";

// ============================================================
// Applications
// ============================================================

export async function getApplications(): Promise<ApplicationEntry[]> {
  const user = await requireAuth();
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("job_applications")
    .select(`
      id,
      status,
      cover_letter,
      notes,
      applied_at,
      jobs (
        title,
        company
      )
    `)
    .eq("user_id", user.id)
    .order("applied_at", { ascending: false });

  if (error || !data) return [];

  return data.map((entry) => {
    const job = (entry.jobs as Array<{ title: string; company: string }>)[0];
    return {
      id: entry.id,
      title: job?.title ?? "Unknown Position",
      company: job?.company ?? "Unknown Company",
      appliedAt: timeAgo(entry.applied_at),
      status: entry.status,
      coverLetter: entry.cover_letter,
      notes: entry.notes,
    };
  });
}

// ============================================================
// Apply to Job
// ============================================================

export async function applyToJob(jobId: string, coverLetter?: string): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();
  const supabase = getSupabaseServerClient();

  // Check if already applied
  const { data: existing } = await supabase
    .from("job_applications")
    .select("id")
    .eq("user_id", user.id)
    .eq("job_id", jobId)
    .single();

  if (existing) {
    return { success: false, error: "You have already applied to this job" };
  }

  const { error } = await supabase
    .from("job_applications")
    .insert({
      user_id: user.id,
      job_id: jobId,
      cover_letter: coverLetter ?? null,
      status: "applied",
    });

  if (error) return { success: false, error: error.message };

  // Get job title for activity log
  const { data: job } = await supabase
    .from("jobs")
    .select("title, company")
    .eq("id", jobId)
    .single();

  // Log activity
  await supabase
    .from("activity_log")
    .insert({
      user_id: user.id,
      action_type: "job_applied",
      title: `Applied to ${job?.title ?? "a position"}`,
      metadata: { company: job?.company },
    });

  return { success: true };
}

// ============================================================
// Helper (local to this file)
// ============================================================

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} week${Math.floor(diffDay / 7) > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}
