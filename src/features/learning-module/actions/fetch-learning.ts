"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { LearningModule, LearningModuleRow } from "@/features/learning-module/types/learning";

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
    console.error("getPublishedLearningModules error:", error.message);
    return [];
  }

  return (data ?? []).map(mapRowToModule);
}

// ============================================================
// Fetch Single Learning Module by Slug (Public)
// ============================================================

export async function getLearningModuleBySlug(slug: string): Promise<LearningModule | null> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("learning_modules")
    .select("id, slug, title, description, category, thumbnail_url, duration_min, status, created_at, updated_at")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) {
    console.error("getLearningModuleBySlug error:", error?.message);
    return null;
  }

  return mapRowToModule(data);
}

// ============================================================
// Helper: Map DB row to LearningModule type
// ============================================================

function mapRowToModule(row: LearningModuleRow): LearningModule {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    thumbnailUrl: row.thumbnail_url,
    durationMin: row.duration_min,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
