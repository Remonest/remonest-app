"use server";

import { getSupabaseServerClient, getSupabaseServiceClient } from "@/lib/supabase/server";
import type { LearningModule, LearningModuleWithContent, LearningModuleRow, ModuleDifficulty } from "@/features/learning-module/types/learning";
import type { ModuleLesson } from "@/features/learning-module/types/lesson";

// ============================================================
// Fetch Published Learning Modules (Public)
// ============================================================

export async function getPublishedLearningModules(): Promise<LearningModule[]> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("learning_modules")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getPublishedLearningModules] Error:", error);
    return [];
  }

  return (data ?? []).map(mapRowToModule);
}

// ============================================================
// Fetch Single Learning Module by Slug (Public, with content)
// ============================================================

export async function getLearningModuleBySlug(slug: string): Promise<LearningModuleWithContent | null> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("learning_modules")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) {
    return null;
  }

  return {
    ...mapRowToModule(data as LearningModuleRow),
    content: data.content,
  };
}

// ============================================================
// Fetch Published Materials for a Module (Public)
// ============================================================

export interface LearningMaterial {
  id: string;
  title: string;
  content: string | null;
  summary: string | null;
  source_url: string | null;
  source_type: string | null;
  file_url: string | null;
  difficulty: string;
  language: string;
  reading_time_minutes: number | null;
  tags: string[] | null;
  order_index: number;
}

export async function getPublishedMaterialsForModule(moduleId: string): Promise<LearningMaterial[]> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("learning_materials")
    .select("*")
    .eq("module_id", moduleId)
    .eq("is_published", true)
    .order("order_index", { ascending: true, nullsFirst: false });

  if (error) {
    // Fallback: try without order_index (pre-migration 018)
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("learning_materials")
      .select("*")
      .eq("module_id", moduleId)
      .eq("is_published", true)
      .order("created_at", { ascending: true });

    if (fallbackError) {
      console.error("[getPublishedMaterialsForModule] Error:", fallbackError);
      return [];
    }

    return (fallbackData ?? []).map((m: any) => ({
      ...m,
      order_index: 0,
    }));
  }

  return (data ?? []) as LearningMaterial[];
}

// ============================================================
// Fetch Lessons for a Module (Public)
// ============================================================

export async function getLessonsForModule(moduleId: string): Promise<ModuleLesson[]> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from("module_lessons")
    .select("*")
    .eq("module_id", moduleId)
    .order("order_index", { ascending: true });

  if (error) {
    // Table may not exist yet (pre-migration 018)
    return [];
  }

  return (data || []).map(mapRowToLesson);
}

// ============================================================
// Fetch Related Modules (Public)
// ============================================================

export async function getRelatedModules(
  moduleId: string,
  category: string,
  limit: number = 6
): Promise<LearningModule[]> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("learning_modules")
    .select("*")
    .eq("status", "published")
    .eq("category", category)
    .neq("id", moduleId)
    .limit(limit);

  if (error) {
    console.error("[getRelatedModules] Error:", error);
    return [];
  }

  return (data ?? []).map(mapRowToModule);
}

// ============================================================
// Fetch All Modules (Admin)
// ============================================================

export async function getAllLearningModules(): Promise<LearningModule[]> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from("learning_modules")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getAllLearningModules] Error:", error);
    return [];
  }

  return (data ?? []).map(mapRowToModule);
}

// ============================================================
// Fetch Modules by Status (Admin)
// ============================================================

export async function getModulesByStatus(status: string): Promise<LearningModule[]> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from("learning_modules")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getModulesByStatus] Error:", error);
    return [];
  }

  return (data ?? []).map(mapRowToModule);
}

// ============================================================
// Helper: Map DB row to LearningModule type
// ============================================================

function mapRowToModule(row: Record<string, any>): LearningModule {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? null,
    content: row.content ?? null,
    category: row.category,
    difficultyLevel: (row.difficulty_level as ModuleDifficulty) ?? "beginner",
    thumbnailUrl: row.thumbnail_url ?? null,
    durationMin: row.duration_min ?? 0,
    enrollmentCount: row.enrollment_count ?? 0,
    averageRating: Number(row.average_rating) ?? 0,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRowToLesson(row: any): ModuleLesson {
  return {
    id: row.id,
    moduleId: row.module_id,
    title: row.title,
    description: row.description,
    orderIndex: row.order_index,
    lessonType: row.lesson_type,
    materialId: row.material_id,
    resourceId: row.resource_id,
    quizConfigId: row.quiz_config_id,
    durationMinutes: row.duration_minutes,
    isPreview: row.is_preview,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
