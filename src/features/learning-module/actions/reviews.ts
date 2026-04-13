"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseServiceClient, getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAuth } from "@/features/auth/actions/guards";
import type {
  ModuleReview,
  ModuleReviewRow,
  ModuleReviewWithUser,
  ModuleReviewInput,
  ModuleStats,
} from "@/features/learning-module/types/review";

// ============================================================
// SCHEMAS
// ============================================================

const reviewSchema = z.object({
  moduleId: z.string().uuid("Module ID tidak valid"),
  rating: z.number().int().min(1).max(5, "Rating maksimal 5"),
  comment: z.string().max(1000, "Komentar maksimal 1000 karakter").optional(),
});

// ============================================================
// TYPE HELPERS
// ============================================================

function mapRowToReview(row: ModuleReviewRow): ModuleReview {
  return {
    id: row.id,
    moduleId: row.module_id,
    userId: row.user_id,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================================
// FETCH REVIEWS
// ============================================================

export async function getModuleReviews(moduleId: string): Promise<ModuleReviewWithUser[]> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from("module_reviews")
    .select(`
      *,
      user_profiles:user_id (full_name, avatar_url)
    `)
    .eq("module_id", moduleId)
    .order("created_at", { ascending: false });

  if (error) {
    // Table may not exist yet (pre-migration 018)
    return [];
  }

  return (data || []).map((row: any) => ({
    ...mapRowToReview(row),
    userFullName: row.user_profiles?.full_name || null,
    userAvatar: row.user_profiles?.avatar_url || null,
  }));
}

export async function getUserReview(moduleId: string): Promise<ModuleReview | null> {
  const userId = await requireAuth();
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("module_reviews")
    .select("*")
    .eq("module_id", moduleId)
    .eq("user_id", userId)
    .single();

  if (error) {
    return null;
  }

  return mapRowToReview(data);
}

// ============================================================
// MODULE STATS
// ============================================================

export async function getModuleStats(moduleId: string): Promise<ModuleStats | null> {
  const supabase = getSupabaseServiceClient();

  // Get module stats (handle columns that may not exist yet)
  const { data: moduleData, error: moduleError } = await supabase
    .from("learning_modules")
    .select("enrollment_count, average_rating")
    .eq("id", moduleId)
    .single();

  if (moduleError) {
    return null;
  }

  // Count reviews (table may not exist)
  const { count: reviewCount, error: reviewError } = await supabase
    .from("module_reviews")
    .select("*", { count: "exact", head: true })
    .eq("module_id", moduleId);

  // Count lessons (table may not exist)
  const { count: lessonCount, error: lessonError } = await supabase
    .from("module_lessons")
    .select("*", { count: "exact", head: true })
    .eq("module_id", moduleId);

  // Count materials
  const { count: materialCount, error: materialError } = await supabase
    .from("learning_materials")
    .select("*", { count: "exact", head: true })
    .eq("module_id", moduleId)
    .eq("is_published", true);

  return {
    enrollmentCount: moduleData?.enrollment_count ?? 0,
    averageRating: Number(moduleData?.average_rating) ?? 0,
    reviewCount: reviewError ? 0 : (reviewCount ?? 0),
    lessonCount: lessonError ? 0 : (lessonCount ?? 0),
    materialCount: materialError ? 0 : (materialCount ?? 0),
  };
}

// ============================================================
// CREATE/UPDATE REVIEW
// ============================================================

export async function submitReview(input: ModuleReviewInput): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await requireAuth();

    const validated = reviewSchema.parse(input);

    const supabase = getSupabaseServiceClient();

    // Check if user is enrolled
    const { data: enrollment } = await supabase
      .from("user_learning_progress")
      .select("id")
      .eq("user_id", userId)
      .eq("module_id", validated.moduleId)
      .single();

    if (!enrollment) {
      return { success: false, error: "Anda harus terdaftar di modul ini untuk memberi ulasan" };
    }

    // Check if review already exists (update instead)
    const { data: existing } = await supabase
      .from("module_reviews")
      .select("id")
      .eq("module_id", validated.moduleId)
      .eq("user_id", userId)
      .single();

    let error: any;

    if (existing) {
      // Update existing review
      const result = await supabase
        .from("module_reviews")
        .update({
          rating: validated.rating,
          comment: validated.comment || null,
        })
        .eq("id", existing.id);

      error = result.error;
    } else {
      // Create new review
      const result = await supabase
        .from("module_reviews")
        .insert({
          module_id: validated.moduleId,
          user_id: userId,
          rating: validated.rating,
          comment: validated.comment || null,
        });

      error = result.error;
    }

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/learning");
    revalidatePath(`/learning/[slug]`, "page");

    return { success: true };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("[submitReview] Unexpected error:", error);
    return { success: false, error: "Gagal mengirim ulasan" };
  }
}

// ============================================================
// DELETE REVIEW
// ============================================================

export async function deleteReview(moduleId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await requireAuth();
    const supabase = getSupabaseServiceClient();

    const { error } = await supabase
      .from("module_reviews")
      .delete()
      .eq("module_id", moduleId)
      .eq("user_id", userId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/learning");
    revalidatePath(`/learning/[slug]`, "page");

    return { success: true };
  } catch (error: any) {
    console.error("[deleteReview] Unexpected error:", error);
    return { success: false, error: "Gagal menghapus ulasan" };
  }
}
