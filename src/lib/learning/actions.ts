"use server";

import { learningModuleSchema } from "@/lib/learning/schemas";
import type { LearningModuleResult } from "@/lib/learning/schemas";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function saveLearningModule(
  _prevState: LearningModuleResult,
  formData: FormData
): Promise<LearningModuleResult> {
  const parsed = learningModuleSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    level: formData.get("level"),
    description: formData.get("description"),
    passingScore: parseInt(formData.get("passingScore") as string, 10) || 70,
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstError =
      fieldErrors.title?.[0] ||
      fieldErrors.category?.[0] ||
      fieldErrors.level?.[0] ||
      fieldErrors.description?.[0] ||
      fieldErrors.passingScore?.[0] ||
      "Invalid input";

    return { success: false, error: firstError };
  }

  const { title, category, level, description, passingScore } = parsed.data;

  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from("learning_modules")
    .insert({
      title,
      category,
      level,
      description,
      passing_score: passingScore,
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

  redirect(`/admin/learning?success=created`);
}

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

  return { success: true };
}
