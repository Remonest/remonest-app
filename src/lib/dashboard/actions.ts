"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { z } from "zod";

// ============================================================
// Types
// ============================================================

export interface DashboardStats {
  applicationsSent: number;
  modulesCompleted: number;
  profileViews: number;
  cvDownloads: number;
  applicationsChange: string;
  modulesChange: string;
  profileViewsChange: string;
  cvDownloadsChange: string;
}

export interface ActivityEntry {
  id: string;
  actionType: string;
  title: string;
  company: string;
  time: string;
  status: string;
}

export interface ApplicationEntry {
  id: string;
  title: string;
  company: string;
  appliedAt: string;
  status: string;
  coverLetter: string | null;
  notes: string | null;
}

export interface UserSettings {
  location: string | null;
  role: string | null;
  bio: string | null;
  emailNotifications: boolean;
  jobAlerts: boolean;
  learningReminders: boolean;
  marketingEmails: boolean;
}

// ============================================================
// Dashboard Stats
// ============================================================

export async function getDashboardStats(): Promise<DashboardStats> {
  const user = await requireAuth();
  const supabase = getSupabaseServerClient();

  // Applications count
  const { count: appCount } = await supabase
    .from("job_applications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Modules completed
  const { count: moduleCount } = await supabase
    .from("user_learning_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .not("completed_at", "is", null);

  // Recent applications (this week)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const { count: recentApps } = await supabase
    .from("job_applications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("applied_at", oneWeekAgo.toISOString());

  // Modules in progress
  const { count: inProgress } = await supabase
    .from("user_learning_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gt("progress", 0)
    .is("completed_at", null);

  return {
    applicationsSent: appCount ?? 0,
    modulesCompleted: moduleCount ?? 0,
    profileViews: 47, // TODO: Track profile views in a separate table
    cvDownloads: 3,   // TODO: Track CV downloads when CV builder is implemented
    applicationsChange: `+${recentApps ?? 0} this week`,
    modulesChange: `${inProgress ?? 0} in progress`,
    profileViewsChange: "+12% vs last week",
    cvDownloadsChange: "ATS-ready",
  };
}

// ============================================================
// Recent Activity
// ============================================================

export async function getRecentActivity(limit = 10): Promise<ActivityEntry[]> {
  const user = await requireAuth();
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("activity_log")
    .select("id, action_type, title, metadata, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((entry) => ({
    id: entry.id,
    actionType: entry.action_type,
    title: entry.title,
    company: (entry.metadata as Record<string, unknown>)?.company as string ?? "",
    time: timeAgo(entry.created_at),
    status: mapActionToStatus(entry.action_type),
  }));
}

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
// User Settings
// ============================================================

export async function getUserSettings(): Promise<UserSettings | null> {
  const user = await requireAuth();
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("user_settings")
    .select("location, role, bio, email_notifications, job_alerts, learning_reminders, marketing_emails")
    .eq("user_id", user.id)
    .single();

  if (error) return null;

  return {
    location: data.location,
    role: data.role,
    bio: data.bio,
    emailNotifications: data.email_notifications ?? true,
    jobAlerts: data.job_alerts ?? true,
    learningReminders: data.learning_reminders ?? false,
    marketingEmails: data.marketing_emails ?? false,
  };
}

// ============================================================
// User Profile (from user_profiles)
// ============================================================

export async function getUserProfile() {
  const user = await requireAuth();
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("user_profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  if (error) return null;

  return {
    fullName: data.full_name,
    avatarUrl: data.avatar_url,
    email: user.email,
  };
}

// ============================================================
// Save Profile Settings
// ============================================================

const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  location: z.string().max(200).optional(),
  role: z.string().max(100).optional(),
  bio: z.string().max(1000).optional(),
});

export async function saveProfileSettings(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();
  const supabase = getSupabaseServerClient();

  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    location: formData.get("location"),
    role: formData.get("role"),
    bio: formData.get("bio"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors.fullName?.[0] || "Invalid input" };
  }

  const { fullName, location, role, bio } = parsed.data;

  // Update user_profiles
  const { error: profileError } = await supabase
    .from("user_profiles")
    .update({ full_name: fullName, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (profileError) return { success: false, error: profileError.message };

  // Upsert user_settings
  const { error: settingsError } = await supabase
    .from("user_settings")
    .upsert(
      {
        user_id: user.id,
        location,
        role,
        bio,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (settingsError) return { success: false, error: settingsError.message };

  // Log activity
  await supabase
    .from("activity_log")
    .insert({
      user_id: user.id,
      action_type: "profile_updated",
      title: "Updated profile information",
      metadata: {},
    });

  return { success: true };
}

// ============================================================
// Save Notification Preferences
// ============================================================

export async function saveNotificationPreferences(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();
  const supabase = getSupabaseServerClient();

  const { error } = await supabase
    .from("user_settings")
    .upsert(
      {
        user_id: user.id,
        email_notifications: formData.get("emailNotifications") === "on" || formData.get("emailNotifications") === "true",
        job_alerts: formData.get("jobAlerts") === "on" || formData.get("jobAlerts") === "true",
        learning_reminders: formData.get("learningReminders") === "on" || formData.get("learningReminders") === "true",
        marketing_emails: formData.get("marketingEmails") === "on" || formData.get("marketingEmails") === "true",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (error) return { success: false, error: error.message };

  return { success: true };
}

// ============================================================
// Update Password
// ============================================================

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .refine((pw) => /[A-Z]/.test(pw), "Must contain at least one uppercase letter")
    .refine((pw) => /[a-z]/.test(pw), "Must contain at least one lowercase letter")
    .refine((pw) => /[0-9]/.test(pw), "Must contain at least one number"),
});

export async function updatePassword(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();
  const supabase = getSupabaseServerClient();

  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.flatten().fieldErrors.newPassword?.[0] || "Invalid input";
    return { success: false, error: firstError };
  }

  const { currentPassword, newPassword } = parsed.data;

  // Re-authenticate with current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  });

  if (signInError) {
    return { success: false, error: "Current password is incorrect" };
  }

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) return { success: false, error: updateError.message };

  return { success: true };
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
// Helpers
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

function mapActionToStatus(actionType: string): string {
  const map: Record<string, string> = {
    job_applied: "pending",
    module_started: "in-progress",
    module_completed: "completed",
    profile_updated: "completed",
    cv_updated: "completed",
    portfolio_updated: "completed",
  };
  return map[actionType] ?? "pending";
}
