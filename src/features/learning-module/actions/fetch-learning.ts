"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { LearningModule, LearningModuleWithContent, LearningModuleRow } from "@/features/learning-module/types/learning";

// ============================================================
// Fetch Published Learning Modules (Public)
// ============================================================

export async function getPublishedLearningModules(): Promise<LearningModule[]> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("learning_modules")
    .select("id, slug, title, description, category, thumbnail_url, duration_min, status, created_at, updated_at")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
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
    .select("id, slug, title, description, content, category, thumbnail_url, duration_min, status, created_at, updated_at")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) {
    // Only log actual errors, not "not found" cases
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
}

export async function getPublishedMaterialsForModule(moduleId: string): Promise<LearningMaterial[]> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("learning_materials")
    .select("id, title, content, summary, source_url, source_type, file_url, difficulty, language, reading_time_minutes, tags")
    .eq("module_id", moduleId)
    .eq("is_published", true)
    .order("created_at", { ascending: true });

  if (error) {
    return [];
  }

  return (data ?? []) as LearningMaterial[];
}

// ============================================================
// Helper: Map DB row to LearningModule type
// ============================================================

function mapRowToModule(row: Partial<LearningModuleRow> & Pick<LearningModuleRow, "id" | "slug" | "title" | "category" | "status" | "created_at" | "updated_at">): LearningModule {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? null,
    content: row.content ?? null,
    category: row.category,
    thumbnailUrl: row.thumbnail_url ?? null,
    durationMin: row.duration_min ?? 0,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
