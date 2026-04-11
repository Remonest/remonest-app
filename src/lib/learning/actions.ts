"use server";

import { learningModuleSchema } from "@/lib/learning/schemas";
import type { LearningModuleResult } from "@/lib/learning/schemas";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// ─── Types ───────────────────────────────────────────────────
export type LearningModuleRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string;
  content: string | null;
  thumbnail_url: string | null;
  duration_min: number;
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
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

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

  revalidatePath("/admin/learning");
  return { success: true, id: data.id };
}

// ─── Update Status ───────────────────────────────────────────

export async function updateLearningModuleStatus(
  id: string,
  status: "draft" | "published" | "archived"
): Promise<LearningModuleResult> {
  const supabase = getSupabaseServiceClient();

  const { error } = await supabase
    .from("learning_modules")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/learning");
  return { success: true };
}

// ─── Delete ──────────────────────────────────────────────────

export async function deleteLearningModule(
  id: string
): Promise<LearningModuleResult> {
  const supabase = getSupabaseServiceClient();

  const { error } = await supabase
    .from("learning_modules")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/learning");
  return { success: true };
}
