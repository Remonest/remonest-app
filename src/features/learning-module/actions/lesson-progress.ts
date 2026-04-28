"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Get user's completed lesson IDs for a module
 */
export async function getUserCompletedLessonIds(moduleId: string): Promise<string[]> {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .rpc("get_user_completed_lesson_ids", {
      p_user_id: user.id,
      p_module_id: moduleId,
    });

  if (error) {
    console.error("[getUserCompletedLessonIds] Error:", error);
    return [];
  }

  return data || [];
}

/**
 * Mark a lesson as completed for the current user
 */
export async function markLessonCompleted(lessonId: string, moduleId: string) {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase.from("user_lesson_progress").insert({
    user_id: user.id,
    lesson_id: lessonId,
    module_id: moduleId,
  });

  if (error) {
    // Check if it's a duplicate (already completed)
    if (error.code === "23505") {
      return { success: true, message: "Already completed" };
    }
    console.error("[markLessonCompleted] Error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Unmark a lesson as completed (undo completion)
 */
export async function unmarkLessonCompleted(lessonId: string, moduleId: string) {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("user_lesson_progress")
    .delete()
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .eq("module_id", moduleId);

  if (error) {
    console.error("[unmarkLessonCompleted] Error:", error);
    return { success: false, error: error.message };
  }

  // Recalculate module progress
  await supabase.rpc("update_module_progress_from_lessons");

  return { success: true };
}

/**
 * Get detailed user progress for a module
 */
export async function getUserModuleProgress(moduleId: string) {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("user_learning_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("module_id", moduleId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("[getUserModuleProgress] Error:", error);
    return null;
  }

  return data;
}
