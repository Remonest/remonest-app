"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import type { AdminUser } from "@/lib/admin/require-admin";

// ============================================================
// SAVE STEP CONTENT
// ============================================================

export async function saveStepContent(
  admin: AdminUser,
  lessonId: string,
  content: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const supabase = getSupabaseServiceClient();

    // Get existing lesson to find module_id
    const { data: existingLesson } = await supabase
      .from("module_lessons")
      .select("module_id, material_id")
      .eq("id", lessonId)
      .single();

    if (!existingLesson) {
      return { success: false, error: "Lesson not found" };
    }

    // If lesson has a material_id, update the material content
    if (existingLesson.material_id) {
      const { error } = await supabase
        .from("learning_materials")
        .update({
          content: content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingLesson.material_id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Log admin action
      await supabase.from("admin_actions").insert({
        admin_id: admin.id,
        action_type: "update_learning_module",
        table_name: "learning_materials",
        record_id: existingLesson.material_id,
        new_values: { content_updated: true },
      });
    } else {
      // Create a new material for this lesson
      const { data: newMaterial, error } = await supabase
        .from("learning_materials")
        .insert({
          module_id: existingLesson.module_id,
          title: "Lesson Content",
          content: content,
          source_type: "article",
          is_published: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Link the lesson to the new material
      await supabase
        .from("module_lessons")
        .update({ material_id: newMaterial.id })
        .eq("id", lessonId);

      // Log admin action
      await supabase.from("admin_actions").insert({
        admin_id: admin.id,
        action_type: "create_learning_material",
        table_name: "learning_materials",
        record_id: newMaterial.id,
        new_values: { title: newMaterial.title },
      });
    }

    revalidatePath(`/admin/learning/${existingLesson.module_id}/builder`);

    return { success: true };
  } catch (error: any) {
    console.error("[saveStepContent] Unexpected error:", error);
    return { success: false, error: "Failed to save step content" };
  }
}

// ============================================================
// UPDATE LESSON SETTINGS
// ============================================================

export async function updateLessonSettings(
  admin: AdminUser,
  lessonId: string,
  settings: {
    title?: string;
    durationMinutes?: number;
    isPreview?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const supabase = getSupabaseServiceClient();

    const updateData: any = {};
    if (settings.title !== undefined) updateData.title = settings.title;
    if (settings.durationMinutes !== undefined)
      updateData.duration_minutes = settings.durationMinutes;
    if (settings.isPreview !== undefined)
      updateData.is_preview = settings.isPreview;

    const { data: existing } = await supabase
      .from("module_lessons")
      .select("*")
      .eq("id", lessonId)
      .single();

    if (!existing) {
      return { success: false, error: "Lesson not found" };
    }

    const { error } = await supabase
      .from("module_lessons")
      .update(updateData)
      .eq("id", lessonId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Log admin action
    await supabase.from("admin_actions").insert({
      admin_id: admin.id,
      action_type: "update_learning_module",
      table_name: "module_lessons",
      record_id: lessonId,
      old_values: {
        title: existing.title,
        duration_minutes: existing.duration_minutes,
      },
      new_values: updateData,
    });

    revalidatePath(`/admin/learning/${existing.module_id}/builder`);

    return { success: true };
  } catch (error: any) {
    console.error("[updateLessonSettings] Unexpected error:", error);
    return { success: false, error: "Failed to update lesson settings" };
  }
}

// ============================================================
// PUBLISH MODULE
// ============================================================

export async function publishModule(
  admin: AdminUser,
  moduleId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const supabase = getSupabaseServiceClient();

    const { error } = await supabase
      .from("learning_modules")
      .update({
        status: "published",
        updated_at: new Date().toISOString(),
      })
      .eq("id", moduleId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Log admin action
    await supabase.from("admin_actions").insert({
      admin_id: admin.id,
      action_type: "update_learning_module",
      table_name: "learning_modules",
      record_id: moduleId,
      new_values: { status: "published" },
    });

    revalidatePath(`/admin/learning/${moduleId}/builder`);
    revalidatePath("/admin/learning");

    return { success: true };
  } catch (error: any) {
    console.error("[publishModule] Unexpected error:", error);
    return { success: false, error: "Failed to publish module" };
  }
}
