"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/features/auth/actions/guards";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { CVData, cvDataSchema, UserCV } from "../types/cv";

/**
 * Fetch the current user's primary CV
 */
export async function getUserCV(): Promise<UserCV | null> {
  try {
    const user = await requireAuth();
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from("user_cvs")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_primary", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // No data found
      throw error;
    }

    return data as UserCV;
  } catch (error) {
    console.error("[getUserCV] Error:", error);
    return null;
  }
}

/**
 * Update or create user CV with full validation
 */
export async function updateCVAction(cvData: CVData) {
  try {
    const user = await requireAuth();
    const supabase = getSupabaseServerClient();

    // Validate data against schema
    const validated = cvDataSchema.safeParse(cvData);
    if (!validated.success) {
      console.warn("[updateCVAction] Validation failed:", validated.error.format());
      
      // Return structured errors for mapping to UI
      const errorMap: Record<string, string> = {};
      let firstMessage = "Validasi gagal";
      
      validated.error.issues.forEach((issue, index) => {
        const path = issue.path.join(".");
        errorMap[path] = issue.message;
        if (index === 0) firstMessage = issue.message;
      });
      
      return {
        success: false,
        error: firstMessage,
        validationErrors: errorMap
      };
    }

    // Check if CV exists
    const existingCV = await getUserCV();

    if (existingCV) {
      const { error } = await supabase
        .from("user_cvs")
        .update({
          data: validated.data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingCV.id)
        .eq("user_id", user.id);

      if (error) throw error;
    } else {
      const { error } = await supabase.from("user_cvs").insert({
        user_id: user.id,
        data: validated.data,
        is_primary: true,
      });

      if (error) throw error;
    }

    revalidatePath("/cv-builder");
    return { success: true };
  } catch (error: any) {
    console.error("[updateCVAction] Error:", error);
    return { 
      success: false, 
      error: error.message || "Terjadi kesalahan saat menyimpan CV" 
    };
  }
}

/**
 * Silent auto-save for drafts (skips strict validation for better UX)
 */
export async function saveCVDraftAction(cvData: Partial<CVData>) {
  try {
    const user = await requireAuth();
    const supabase = getSupabaseServerClient();

    const existingCV = await getUserCV();

    if (existingCV) {
      const updatedData = { ...existingCV.data, ...cvData };
      
      const { error } = await supabase
        .from("user_cvs")
        .update({
          data: updatedData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingCV.id)
        .eq("user_id", user.id);

      if (error) throw error;
    } else {
      // For new CV, use partial data as initial
      const { error } = await supabase.from("user_cvs").insert({
        user_id: user.id,
        data: cvData,
        is_primary: true,
      });

      if (error) throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("[saveCVDraftAction] Error:", error);
    return { success: false };
  }
}

/**
 * Delete user CV
 */
export async function deleteCVAction() {
  try {
    const user = await requireAuth();
    const supabase = getSupabaseServerClient();

    const { error } = await supabase
      .from("user_cvs")
      .delete()
      .eq("user_id", user.id);

    if (error) throw error;

    revalidatePath("/cv-builder");
    return { success: true };
  } catch (error: any) {
    console.error("[deleteCVAction] Error:", error);
    return { 
      success: false, 
      error: error.message || "Gagal menghapus CV" 
    };
  }
}
