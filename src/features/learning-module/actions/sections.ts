"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import type { AdminUser } from "@/lib/admin/require-admin";

// ============================================================
// TYPES
// ============================================================

export interface ModuleSection {
  id: string;
  moduleId: string;
  title: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface ModuleSectionRow {
  id: string;
  module_id: string;
  title: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// ============================================================
// FETCH SECTIONS
// ============================================================

export async function getSectionsByModuleId(moduleId: string): Promise<ModuleSection[]> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from("module_sections")
    .select("*")
    .eq("module_id", moduleId)
    .order("order_index", { ascending: true });

  if (error) {
    console.error("[getSectionsByModuleId] Error:", error);
    return [];
  }

  return (data || []).map(mapRowToSection);
}

// ============================================================
// CREATE SECTION
// ============================================================

export async function createSection(
  admin: AdminUser,
  moduleId: string,
  title: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    await requireAdmin();

    const supabase = getSupabaseServiceClient();

    // Get max order_index
    const { data: maxData } = await supabase
      .from("module_sections")
      .select("order_index")
      .eq("module_id", moduleId)
      .order("order_index", { ascending: false })
      .limit(1)
      .single();

    const orderIndex = maxData ? maxData.order_index + 1 : 0;

    const { data, error } = await supabase
      .from("module_sections")
      .insert({
        module_id: moduleId,
        title: title.trim(),
        order_index: orderIndex,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Log admin action
    await supabase.from("admin_actions").insert({
      admin_id: admin.id,
      action_type: "create_learning_module",
      table_name: "module_sections",
      record_id: data.id,
      new_values: { title: data.title, module_id: data.module_id },
    });

    revalidatePath(`/admin/learning/${moduleId}/builder`);

    return { success: true, id: data.id };
  } catch (error: any) {
    console.error("[createSection] Unexpected error:", error);
    return { success: false, error: "Failed to create section" };
  }
}

// ============================================================
// UPDATE SECTION
// ============================================================

export async function updateSection(
  admin: AdminUser,
  sectionId: string,
  data: { title?: string; orderIndex?: number }
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const supabase = getSupabaseServiceClient();

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.orderIndex !== undefined) updateData.order_index = data.orderIndex;

    const { error } = await supabase
      .from("module_sections")
      .update(updateData)
      .eq("id", sectionId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Log admin action
    await supabase.from("admin_actions").insert({
      admin_id: admin.id,
      action_type: "update_learning_module",
      table_name: "module_sections",
      record_id: sectionId,
      new_values: updateData,
    });

    return { success: true };
  } catch (error: any) {
    console.error("[updateSection] Unexpected error:", error);
    return { success: false, error: "Failed to update section" };
  }
}

// ============================================================
// DELETE SECTION
// ============================================================

export async function deleteSection(
  admin: AdminUser,
  sectionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const supabase = getSupabaseServiceClient();

    // Get section info for logging
    const { data: existing } = await supabase
      .from("module_sections")
      .select("*")
      .eq("id", sectionId)
      .single();

    if (!existing) {
      return { success: false, error: "Section not found" };
    }

    const { error } = await supabase
      .from("module_sections")
      .delete()
      .eq("id", sectionId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Log admin action
    await supabase.from("admin_actions").insert({
      admin_id: admin.id,
      action_type: "delete_learning_module",
      table_name: "module_sections",
      record_id: sectionId,
      old_values: { title: existing.title },
    });

    return { success: true };
  } catch (error: any) {
    console.error("[deleteSection] Unexpected error:", error);
    return { success: false, error: "Failed to delete section" };
  }
}

// ============================================================
// MOVE LESSON TO SECTION
// ============================================================

export async function moveLessonToSection(
  admin: AdminUser,
  lessonId: string,
  sectionId: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const supabase = getSupabaseServiceClient();

    const { error } = await supabase
      .from("module_lessons")
      .update({ section_id: sectionId })
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
      new_values: { section_id: sectionId },
    });

    return { success: true };
  } catch (error: any) {
    console.error("[moveLessonToSection] Unexpected error:", error);
    return { success: false, error: "Failed to move lesson" };
  }
}

// ============================================================
// HELPER
// ============================================================

function mapRowToSection(row: ModuleSectionRow): ModuleSection {
  return {
    id: row.id,
    moduleId: row.module_id,
    title: row.title,
    orderIndex: row.order_index,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
