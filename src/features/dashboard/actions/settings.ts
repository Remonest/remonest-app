"use server";

import { requireAuth } from "@/features/auth/actions/guards";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { profileSchema } from "@/features/dashboard/schemas/profile";
import type { UserSettings, UserProfile } from "@/features/dashboard/types/dashboard";

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

  // If row doesn't exist, create it with defaults so future calls succeed
  if (error) {
    await supabase
      .from("user_settings")
      .insert({
        user_id: user.id,
        email_notifications: true,
        job_alerts: true,
        learning_reminders: false,
        marketing_emails: false,
      });

    return {
      location: null,
      role: null,
      bio: null,
      emailNotifications: true,
      jobAlerts: true,
      learningReminders: false,
      marketingEmails: false,
    };
  }

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

export async function getUserProfile(): Promise<UserProfile | null> {
  const user = await requireAuth();
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("user_profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  // If row doesn't exist, create it so future calls succeed
  if (error) {
    const fallbackName =
      user.user_metadata?.full_name ??
      user.email?.split("@")[0] ??
      "User";

    await supabase
      .from("user_profiles")
      .insert({
        id: user.id,
        full_name: fallbackName,
        role: "user",
      });

    return {
      fullName: fallbackName,
      avatarUrl: null,
      email: user.email ?? "",
    };
  }

  return {
    fullName: data.full_name ?? user.email?.split("@")[0] ?? "User",
    avatarUrl: data.avatar_url,
    email: user.email ?? "",
  };
}

// ============================================================
// Save Profile Settings
// ============================================================

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
