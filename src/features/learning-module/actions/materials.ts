"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseServiceClient, requireAdmin } from "@/lib/supabase/server";
import type {
  LearningMaterial,
  LearningResource,
  LearningMaterialInput,
  LearningResourceInput,
  ActionResult,
} from "@/features/learning-module/types/materials";

// ============================================================
// SCHEMAS
// ============================================================

const materialSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  content: z.string().optional(),
  summary: z.string().optional(),
  sourceUrl: z.string().url("URL tidak valid").optional().or(z.literal("")),
  sourceType: z.enum(["article", "video", "documentation", "tutorial"]).optional().or(z.literal("")),
  language: z.string().default("id"),
  readingTimeMinutes: z.number().optional().or(z.literal("")),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  tags: z.string().optional(),
  isPublished: z.boolean().default(false),
});

const resourceSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  description: z.string().optional(),
  url: z.string().url("URL tidak valid"),
  resourceType: z.enum(["tool", "template", "ebook", "checklist", "cheatsheet", "pdf"]).optional().or(z.literal("")),
  isFree: z.boolean().default(true),
});

// ============================================================
// LEARNING MATERIALS
// ============================================================

export async function getMaterialsByModuleId(moduleId: string): Promise<LearningMaterial[]> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("learning_materials")
    .select("*")
    .eq("module_id", moduleId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching materials:", error);
    return [];
  }

  return data || [];
}

export async function getMaterialById(id: string): Promise<LearningMaterial | null> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("learning_materials")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function createLearningMaterial(
  moduleId: string,
  input: LearningMaterialInput
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = materialSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { success: false, error: firstError || "Validasi gagal" };
  }

  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.from("learning_materials").insert({
    module_id: moduleId,
    title: parsed.data.title,
    content: parsed.data.content || null,
    summary: parsed.data.summary || null,
    source_url: parsed.data.sourceUrl || null,
    source_type: parsed.data.sourceType || null,
    language: parsed.data.language,
    reading_time_minutes: parsed.data.readingTimeMinutes || null,
    difficulty: parsed.data.difficulty,
    tags: parsed.data.tags ? parsed.data.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : null,
    is_published: parsed.data.isPublished,
  });

  if (error) {
    console.error("Error creating material:", error);
    return { success: false, error: "Gagal membuat materi" };
  }

  revalidatePath(`/admin/learning/${moduleId}`);
  revalidatePath(`/admin/learning/${moduleId}/materials`);
  return { success: true };
}

export async function updateLearningMaterial(
  id: string,
  input: Partial<LearningMaterialInput>
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  const supabase = getSupabaseServiceClient();
  const updateData: Record<string, unknown> = {};

  if (input.title !== undefined) updateData.title = input.title;
  if (input.content !== undefined) updateData.content = input.content;
  if (input.summary !== undefined) updateData.summary = input.summary;
  if (input.sourceUrl !== undefined) updateData.source_url = input.sourceUrl || null;
  if (input.sourceType !== undefined) updateData.source_type = input.sourceType || null;
  if (input.language !== undefined) updateData.language = input.language;
  if (input.readingTimeMinutes !== undefined) updateData.reading_time_minutes = input.readingTimeMinutes || null;
  if (input.difficulty !== undefined) updateData.difficulty = input.difficulty;
  if (input.tags !== undefined) updateData.tags = input.tags ? input.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : null;
  if (input.isPublished !== undefined) updateData.is_published = input.isPublished;

  const { error } = await supabase
    .from("learning_materials")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Error updating material:", error);
    return { success: false, error: "Gagal mengupdate materi" };
  }

  // Revalidate paths — we need the module_id, so fetch it first
  const { data: material } = await supabase
    .from("learning_materials")
    .select("module_id")
    .eq("id", id)
    .single();

  if (material) {
    revalidatePath(`/admin/learning/${material.module_id}`);
    revalidatePath(`/admin/learning/${material.module_id}/materials`);
  }

  return { success: true };
}

export async function deleteLearningMaterial(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.from("learning_materials").delete().eq("id", id);

  if (error) {
    console.error("Error deleting material:", error);
    return { success: false, error: "Gagal menghapus materi" };
  }

  return { success: true };
}

// ============================================================
// LEARNING RESOURCES
// ============================================================

export async function getResourcesByModuleId(moduleId: string): Promise<LearningResource[]> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("learning_resources")
    .select("*")
    .eq("module_id", moduleId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching resources:", error);
    return [];
  }

  return data || [];
}

export async function getResourceById(id: string): Promise<LearningResource | null> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("learning_resources")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function createLearningResource(
  moduleId: string,
  input: LearningResourceInput
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = resourceSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { success: false, error: firstError || "Validasi gagal" };
  }

  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.from("learning_resources").insert({
    module_id: moduleId,
    title: parsed.data.title,
    description: parsed.data.description || null,
    url: parsed.data.url,
    resource_type: parsed.data.resourceType || null,
    is_free: parsed.data.isFree,
  });

  if (error) {
    console.error("Error creating resource:", error);
    return { success: false, error: "Gagal membuat resource" };
  }

  revalidatePath(`/admin/learning/${moduleId}`);
  revalidatePath(`/admin/learning/${moduleId}/resources`);
  return { success: true };
}

export async function updateLearningResource(
  id: string,
  input: Partial<LearningResourceInput>
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  const supabase = getSupabaseServiceClient();
  const updateData: Record<string, unknown> = {};

  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description || null;
  if (input.url !== undefined) updateData.url = input.url;
  if (input.resourceType !== undefined) updateData.resource_type = input.resourceType || null;
  if (input.isFree !== undefined) updateData.is_free = input.isFree;

  const { error } = await supabase
    .from("learning_resources")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Error updating resource:", error);
    return { success: false, error: "Gagal mengupdate resource" };
  }

  const { data: resource } = await supabase
    .from("learning_resources")
    .select("module_id")
    .eq("id", id)
    .single();

  if (resource) {
    revalidatePath(`/admin/learning/${resource.module_id}`);
    revalidatePath(`/admin/learning/${resource.module_id}/resources`);
  }

  return { success: true };
}

export async function deleteLearningResource(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.from("learning_resources").delete().eq("id", id);

  if (error) {
    console.error("Error deleting resource:", error);
    return { success: false, error: "Gagal menghapus resource" };
  }

  return { success: true };
}
