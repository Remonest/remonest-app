"use server";

import { requireAuth } from "@/features/auth/actions/guards";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// ============================================================
// Enrollment & Progress Actions
// ============================================================

export interface ProgressRecord {
  moduleId: string;
  progress: number;
  startedAt: string;
  completedAt: string | null;
  updatedAt: string;
}

export interface EnrollmentResult {
  success: boolean;
  error?: string;
  progress?: ProgressRecord;
}

// ============================================================
// Get user progress for a specific module
// ============================================================

export async function getUserModuleProgress(
  moduleId: string
): Promise<ProgressRecord | null> {
  const user = await requireAuth();
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("user_learning_progress")
    .select("module_id, progress, started_at, completed_at, updated_at")
    .eq("user_id", user.id)
    .eq("module_id", moduleId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    moduleId: data.module_id,
    progress: data.progress,
    startedAt: data.started_at,
    completedAt: data.completed_at,
    updatedAt: data.updated_at,
  };
}

// ============================================================
// Enroll user in a module (creates progress record)
// ============================================================

export async function enrollUserInModule(
  moduleId: string
): Promise<EnrollmentResult> {
  const user = await requireAuth();
  const supabase = getSupabaseServerClient();

  // Check if already enrolled
  const { data: existing } = await supabase
    .from("user_learning_progress")
    .select("module_id, progress, started_at, completed_at, updated_at")
    .eq("user_id", user.id)
    .eq("module_id", moduleId)
    .single();

  if (existing) {
    return {
      success: true,
      progress: {
        moduleId: existing.module_id,
        progress: existing.progress,
        startedAt: existing.started_at,
        completedAt: existing.completed_at,
        updatedAt: existing.updated_at,
      },
    };
  }

  // Verify module exists and is published
  const { data: module } = await supabase
    .from("learning_modules")
    .select("id, title, slug")
    .eq("id", moduleId)
    .eq("status", "published")
    .single();

  if (!module) {
    return { success: false, error: "Module not found" };
  }

  // Create progress record (enrollment)
  const { data, error } = await supabase
    .from("user_learning_progress")
    .insert({
      user_id: user.id,
      module_id: moduleId,
      progress: 0,
      started_at: new Date().toISOString(),
    })
    .select("module_id, progress, started_at, completed_at, updated_at")
    .single();

  if (error) {
    return { success: false, error: "Failed to enroll in module" };
  }

  // Log activity: module_started
  await supabase.from("activity_log").insert({
    user_id: user.id,
    action_type: "module_started",
    title: `Memulai modul "${module.title}"`,
    metadata: { module_id: moduleId, module_slug: module.slug },
  });

  return {
    success: true,
    progress: {
      moduleId: data.module_id,
      progress: data.progress,
      startedAt: data.started_at,
      completedAt: data.completed_at,
      updatedAt: data.updated_at,
    },
  };
}

// ============================================================
// Mark a module as complete (progress = 100, completed_at set)
// ============================================================

export async function completeModule(
  moduleId: string
): Promise<EnrollmentResult> {
  const user = await requireAuth();
  const supabase = getSupabaseServerClient();

  // Verify user is enrolled
  const { data: existing, error: fetchError } = await supabase
    .from("user_learning_progress")
    .select("module_id, progress, started_at, completed_at, updated_at")
    .eq("user_id", user.id)
    .eq("module_id", moduleId)
    .single();

  if (fetchError || !existing) {
    return { success: false, error: "Not enrolled in this module" };
  }

  if (existing.completed_at) {
    return {
      success: true,
      progress: {
        moduleId: existing.module_id,
        progress: existing.progress,
        startedAt: existing.started_at,
        completedAt: existing.completed_at,
        updatedAt: existing.updated_at,
      },
    };
  }

  // Verify module exists
  const { data: module } = await supabase
    .from("learning_modules")
    .select("id, title, slug")
    .eq("id", moduleId)
    .single();

  if (!module) {
    return { success: false, error: "Module not found" };
  }

  // Update progress to 100 and set completed_at
  const { data, error } = await supabase
    .from("user_learning_progress")
    .update({
      progress: 100,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("module_id", moduleId)
    .select("module_id, progress, started_at, completed_at, updated_at")
    .single();

  if (error) {
    return { success: false, error: "Failed to complete module" };
  }

  // Log activity: module_completed
  await supabase.from("activity_log").insert({
    user_id: user.id,
    action_type: "module_completed",
    title: `Menyelesaikan modul "${module.title}"`,
    metadata: { module_id: moduleId, module_slug: module.slug },
  });

  return {
    success: true,
    progress: {
      moduleId: data.module_id,
      progress: data.progress,
      startedAt: data.started_at,
      completedAt: data.completed_at,
      updatedAt: data.updated_at,
    },
  };
}

// ============================================================
// Update module progress (e.g. after reading a material)
// ============================================================

export async function updateModuleProgress(
  moduleId: string,
  progress: number
): Promise<EnrollmentResult> {
  const user = await requireAuth();
  const supabase = getSupabaseServerClient();

  const clampedProgress = Math.max(0, Math.min(100, progress));

  // Check if enrolled; if not, auto-enroll
  const { data: existing } = await supabase
    .from("user_learning_progress")
    .select("module_id, progress, started_at, completed_at, updated_at")
    .eq("user_id", user.id)
    .eq("module_id", moduleId)
    .single();

  if (!existing) {
    // Auto-enroll
    const enrollResult = await enrollUserInModule(moduleId);
    if (!enrollResult.success) return enrollResult;

    // Now update progress
    const { data, error } = await supabase
      .from("user_learning_progress")
      .update({
        progress: clampedProgress,
        completed_at: clampedProgress >= 100 ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("module_id", moduleId)
      .select("module_id, progress, started_at, completed_at, updated_at")
      .single();

    if (error) {
      return { success: false, error: "Failed to update progress" };
    }

    if (clampedProgress >= 100) {
      const { data: mod } = await supabase
        .from("learning_modules")
        .select("title, slug")
        .eq("id", moduleId)
        .single();

      if (mod) {
        await supabase.from("activity_log").insert({
          user_id: user.id,
          action_type: "module_completed",
          title: `Menyelesaikan modul "${mod.title}"`,
          metadata: { module_id: moduleId, module_slug: mod.slug },
        });
      }
    }

    return {
      success: true,
      progress: {
        moduleId: data.module_id,
        progress: data.progress,
        startedAt: data.started_at,
        completedAt: data.completed_at,
        updatedAt: data.updated_at,
      },
    };
  }

  // Already enrolled — update progress
  const { data, error } = await supabase
    .from("user_learning_progress")
    .update({
      progress: clampedProgress,
      completed_at:
        clampedProgress >= 100 ? new Date().toISOString() : existing.completed_at,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("module_id", moduleId)
    .select("module_id, progress, started_at, completed_at, updated_at")
    .single();

  if (error) {
    return { success: false, error: "Failed to update progress" };
  }

  if (clampedProgress >= 100 && !existing.completed_at) {
    const { data: mod } = await supabase
      .from("learning_modules")
      .select("title, slug")
      .eq("id", moduleId)
      .single();

    if (mod) {
      await supabase.from("activity_log").insert({
        user_id: user.id,
        action_type: "module_completed",
        title: `Menyelesaikan modul "${mod.title}"`,
        metadata: { module_id: moduleId, module_slug: mod.slug },
      });
    }
  }

  return {
    success: true,
    progress: {
      moduleId: data.module_id,
      progress: data.progress,
      startedAt: data.started_at,
      completedAt: data.completed_at,
      updatedAt: data.updated_at,
    },
  };
}

// ============================================================
// Get all user enrollments (for the listing page)
// ============================================================

export interface UserEnrollment {
  moduleId: string;
  progress: number;
  startedAt: string;
  completedAt: string | null;
}

export async function getUserEnrollments(): Promise<UserEnrollment[]> {
  const user = await requireAuth();
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("user_learning_progress")
    .select("module_id, progress, started_at, completed_at")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    moduleId: row.module_id,
    progress: row.progress,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  }));
}
