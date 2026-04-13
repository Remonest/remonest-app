"use server";

import { learningModuleSchema } from "@/lib/learning/schemas";
import type { LearningModuleResult } from "@/lib/learning/schemas";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// ─── Types ───────────────────────────────────────────────────
export type LearningModuleRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string;
  difficulty_level: "beginner" | "intermediate" | "advanced";
  content: string | null;
  thumbnail_url: string | null;
  duration_min: number;
  enrollment_count: number;
  average_rating: number;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
};

export type LearningModuleStats = {
  total: number;
  published: number;
  draft: number;
  archived: number;
};

// ─── Helper: Log Admin Action ────────────────────────────────

/**
 * Manually log an admin action for learning module operations.
 * This is needed because database triggers can't get auth.uid() 
 * when using service role key.
 */
async function logLearningModuleAction(
  actionType: "create_learning_module" | "update_learning_module" | "delete_learning_module",
  recordId: string,
  oldValues: Record<string, any> | null = null,
  newValues: Record<string, any> | null = null,
  notes: string | null = null
) {
  try {
    const admin = await requireAdmin();
    const supabase = getSupabaseServiceClient();

    await supabase.from("admin_actions").insert({
      admin_id: admin.id,
      action_type: actionType,
      table_name: "learning_modules",
      record_id: recordId,
      old_values: oldValues || {},
      new_values: newValues || {},
      notes,
    });
  } catch (error) {
    // Log error but don't fail the operation
    console.error("Failed to log admin action:", error);
  }
}

// ─── Read ────────────────────────────────────────────────────

export async function getAllLearningModules(): Promise<LearningModuleRow[]> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from("learning_modules")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return (data ?? []) as LearningModuleRow[];
}

export async function getLearningModuleStats(): Promise<LearningModuleStats> {
  const modules = await getAllLearningModules();

  return {
    total: modules.length,
    published: modules.filter((m) => m.status === "published").length,
    draft: modules.filter((m) => m.status === "draft").length,
    archived: modules.filter((m) => m.status === "archived").length,
  };
}

export async function getLearningModuleById(
  id: string
): Promise<LearningModuleRow | null> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from("learning_modules")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as LearningModuleRow;
}

// ─── Update ──────────────────────────────────────────────────

export async function updateLearningModule(
  _prevState: LearningModuleResult,
  formData: FormData
): Promise<LearningModuleResult> {
  const id = formData.get("id") as string;
  if (!id) {
    return { success: false, error: "Module ID is required." };
  }

  const title = (formData.get("title") as string)?.trim();
  const category = formData.get("category") as string;
  const description = (formData.get("description") as string)?.trim();
  const content = (formData.get("content") as string)?.trim() || null;
  const durationMin =
    parseInt(formData.get("duration_min") as string, 10) || 0;
  const status =
    (formData.get("status") as "draft" | "published" | "archived") || "draft";
  const difficultyLevel =
    (formData.get("difficulty_level") as "beginner" | "intermediate" | "advanced") || "beginner";
  const thumbnailUrl = (formData.get("thumbnail_url") as string)?.trim() || null;

  if (!title || title.length < 3) {
    return {
      success: false,
      error: "Judul harus minimal 3 karakter.",
    };
  }

  if (!description || description.length < 10) {
    return {
      success: false,
      error: "Deskripsi harus minimal 10 karakter.",
    };
  }

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const supabase = getSupabaseServiceClient();

  // Fetch old values for logging
  const { data: oldModule } = await supabase
    .from("learning_modules")
    .select("*")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("learning_modules")
    .update({
      title,
      slug,
      category,
      description,
      content,
      duration_min: durationMin,
      status,
      difficulty_level: difficultyLevel,
      thumbnail_url: thumbnailUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  // Log admin action
  const newValues = {
    title,
    slug,
    category,
    description,
    content,
    duration_min: durationMin,
    status,
    difficulty_level: difficultyLevel,
    thumbnail_url: thumbnailUrl,
  };

  let notes = `Updated module: ${title}`;
  if (oldModule && oldModule.status !== status) {
    notes = `Status changed from ${oldModule.status} to ${status}`;
  }

  await logLearningModuleAction(
    "update_learning_module",
    id,
    oldModule,
    newValues,
    notes
  );

  revalidatePath("/admin/learning");
  return { success: true };
}

// ─── Create ──────────────────────────────────────────────────

export async function saveLearningModule(
  _prevState: LearningModuleResult,
  formData: FormData
): Promise<LearningModuleResult> {
  const parsed = learningModuleSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstError =
      fieldErrors.title?.[0] ||
      fieldErrors.category?.[0] ||
      fieldErrors.description?.[0] ||
      "Invalid input";

    return { success: false, error: firstError };
  }

  const { title, category, description } = parsed.data;

  const supabase = getSupabaseServiceClient();

  // Generate slug from title
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const { data, error } = await supabase
    .from("learning_modules")
    .insert({
      title,
      slug,
      category,
      description,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data?.id) {
    return {
      success: false,
      error: "Failed to create learning module. Please try again.",
    };
  }

  // Log admin action
  await logLearningModuleAction(
    "create_learning_module",
    data.id,
    null,
    { title, slug, category, description, status: "draft" },
    `Created new module: ${title}`
  );

  revalidatePath("/admin/learning");
  return { success: true, id: data.id };
}

// ─── Update Status ───────────────────────────────────────────

export async function updateLearningModuleStatus(
  id: string,
  status: "draft" | "published" | "archived"
): Promise<LearningModuleResult> {
  const supabase = getSupabaseServiceClient();

  // Fetch old values for logging
  const { data: oldModule } = await supabase
    .from("learning_modules")
    .select("*")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("learning_modules")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  // Log admin action
  if (oldModule) {
    await logLearningModuleAction(
      "update_learning_module",
      id,
      oldModule,
      { ...oldModule, status },
      `Status changed from ${oldModule.status} to ${status}`
    );
  }

  revalidatePath("/admin/learning");
  return { success: true };
}

// ─── Delete ──────────────────────────────────────────────────

export async function deleteLearningModule(
  id: string
): Promise<LearningModuleResult> {
  const supabase = getSupabaseServiceClient();

  // Fetch module before deletion for logging
  const { data: deletedModule } = await supabase
    .from("learning_modules")
    .select("*")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("learning_modules")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  // Log admin action
  if (deletedModule) {
    await logLearningModuleAction(
      "delete_learning_module",
      id,
      deletedModule,
      null,
      `Deleted module: ${deletedModule.title}`
    );
  }

  revalidatePath("/admin/learning");
  return { success: true };
}

// ─── Module Completions ──────────────────────────────────────

export interface ModuleCompletion {
  userId: string;
  fullName: string | null;
  email: string | null;
  avatarUrl: string | null;
  startedAt: string;
  completedAt: string;
}

/**
 * Get all users who have completed a specific module
 */
export async function getModuleCompletions(
  moduleId: string
): Promise<ModuleCompletion[]> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from("user_learning_progress")
    .select("user_id, started_at, completed_at")
    .eq("module_id", moduleId)
    .eq("progress", 100)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });

  if (error?.code) {
    console.error("[getModuleCompletions] Error:", error);
    return [];
  }

  if (!data || data.length === 0) return [];

  // Fetch user profiles separately
  const userIds = data.map((d) => d.user_id);
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id, full_name, email, avatar_url")
    .in("id", userIds);

  const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

  // Fallback: fetch emails from Supabase Auth admin for users without profiles
  const missingIds = userIds.filter((id) => !profileMap.has(id));
  const authEmailMap = new Map<string, string>();
  if (missingIds.length > 0) {
    for (const uid of missingIds) {
      try {
        const { data: authUser } = await supabase.auth.admin.getUserById(uid);
        if (authUser?.user?.email) {
          authEmailMap.set(uid, authUser.user.email);
        }
      } catch {
        // ignore auth lookup failures
      }
    }
  }

  return data.map((row) => {
    const profile = profileMap.get(row.user_id);
    const authEmail = authEmailMap.get(row.user_id);
    const displayName = profile?.full_name ?? authEmail?.split("@")[0] ?? "Unknown User";
    return {
      userId: row.user_id,
      fullName: displayName,
      email: profile?.email ?? authEmail ?? null,
      avatarUrl: profile?.avatar_url ?? null,
      startedAt: row.started_at,
      completedAt: row.completed_at,
    };
  });
}

// ─── Module Enrollments ──────────────────────────────────────

export interface ModuleEnrollment {
  userId: string;
  fullName: string | null;
  email: string | null;
  avatarUrl: string | null;
  progress: number;
  startedAt: string;
  completedAt: string | null;
}

/**
 * Get all users enrolled in a specific module (completed + in-progress)
 */
export async function getModuleEnrollments(
  moduleId: string
): Promise<ModuleEnrollment[]> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from("user_learning_progress")
    .select("user_id, progress, started_at, completed_at")
    .eq("module_id", moduleId)
    .order("started_at", { ascending: false });

  if (error?.code) {
    console.error("[getModuleEnrollments] Error:", error);
    return [];
  }

  if (!data || data.length === 0) return [];

  // Fetch user profiles separately (no FK relationship in schema)
  const userIds = data.map((d) => d.user_id);
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id, full_name, email, avatar_url")
    .in("id", userIds);

  const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

  // Fallback: fetch emails from Supabase Auth admin for users without profiles
  const missingIds = userIds.filter((id) => !profileMap.has(id));
  const authEmailMap = new Map<string, string>();
  if (missingIds.length > 0) {
    for (const uid of missingIds) {
      try {
        const { data: authUser } = await supabase.auth.admin.getUserById(uid);
        if (authUser?.user?.email) {
          authEmailMap.set(uid, authUser.user.email);
        }
      } catch {
        // ignore auth lookup failures
      }
    }
  }

  return data.map((row) => {
    const profile = profileMap.get(row.user_id);
    const authEmail = authEmailMap.get(row.user_id);
    const displayName = profile?.full_name ?? authEmail?.split("@")[0] ?? "Unknown User";
    return {
      userId: row.user_id,
      fullName: displayName,
      email: profile?.email ?? authEmail ?? null,
      avatarUrl: profile?.avatar_url ?? null,
      progress: row.progress ?? 0,
      startedAt: row.started_at,
      completedAt: row.completed_at,
    };
  });
}
