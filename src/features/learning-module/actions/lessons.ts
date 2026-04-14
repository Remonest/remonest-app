"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import type { AdminUser } from "@/lib/admin/require-admin";
import type {
  ModuleLesson,
  ModuleLessonRow,
  ModuleLessonInput,
} from "@/features/learning-module/types/lesson";
import type { ActionResult } from "@/features/learning-module/types/materials";

// ============================================================
// SCHEMAS
// ============================================================

const lessonSchema = z.object({
  moduleId: z.string().uuid("Module ID tidak valid"),
  title: z.string().min(1, "Judul wajib diisi"),
  description: z.string().optional(),
  orderIndex: z.number().int().min(0).default(0),
  lessonType: z.enum(["video", "article", "exercise", "quiz", "resource"]),
  sectionId: z.string().uuid().nullable().optional(),
  materialId: z.string().uuid().nullable().optional(),
  resourceId: z.string().uuid().nullable().optional(),
  quizConfigId: z.string().uuid().nullable().optional(),
  durationMinutes: z.number().int().min(0).default(0),
  isPreview: z.boolean().default(false),
});

// ============================================================
// TYPE HELPERS
// ============================================================

function mapRowToLesson(row: ModuleLessonRow): ModuleLesson {
  return {
    id: row.id,
    moduleId: row.module_id,
    sectionId: row.section_id,
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

// ============================================================
// FETCH LESSONS
// ============================================================

export async function getLessonsByModuleId(moduleId: string): Promise<ModuleLesson[]> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from("module_lessons")
    .select("*")
    .eq("module_id", moduleId)
    .order("order_index", { ascending: true });

  if (error) {
    console.error("[getLessonsByModuleId] Error:", error);
    return [];
  }

  return (data || []).map(mapRowToLesson);
}

export async function getLessonById(lessonId: string): Promise<ModuleLesson | null> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from("module_lessons")
    .select("*")
    .eq("id", lessonId)
    .single();

  if (error) {
    console.error("[getLessonById] Error:", error);
    return null;
  }

  return mapRowToLesson(data);
}

// Get lesson with linked content (material/resource/quiz)
export async function getLessonWithContent(lessonId: string): Promise<{
  lesson: ModuleLesson | null;
  material: any | null;
  resource: any | null;
  quizConfig: any | null;
} | null> {
  const supabase = getSupabaseServiceClient();

  // Fetch the lesson
  const { data: lessonData, error: lessonError } = await supabase
    .from("module_lessons")
    .select("*")
    .eq("id", lessonId)
    .single();

  if (lessonError) {
    console.error("[getLessonWithContent] Lesson fetch error:", lessonError);
    return null;
  }

  const lesson = mapRowToLesson(lessonData);
  let material = null;
  let resource = null;
  let quizConfig = null;

  // Fetch linked content
  if (lesson.materialId) {
    const { data } = await supabase
      .from("learning_materials")
      .select("*")
      .eq("id", lesson.materialId)
      .eq("is_published", true)
      .single();
    material = data;
  }

  if (lesson.resourceId) {
    const { data } = await supabase
      .from("learning_resources")
      .select("*")
      .eq("id", lesson.resourceId)
      .single();
    resource = data;
  }

  if (lesson.quizConfigId) {
    const { data } = await supabase
      .from("quiz_configs")
      .select("*, questions(*)")
      .eq("id", lesson.quizConfigId)
      .eq("is_published", true)
      .single();
    quizConfig = data;
  }

  return { lesson, material, resource, quizConfig };
}

// ============================================================
// CREATE LESSON
// ============================================================

export async function createLesson(
  admin: AdminUser,
  input: ModuleLessonInput
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const validated = lessonSchema.parse(input);

    const supabase = getSupabaseServiceClient();

    // If no orderIndex provided, get the max + 1
    let orderIndex = validated.orderIndex;
    if (orderIndex === 0 && !input.orderIndex) {
      const { data: maxData } = await supabase
        .from("module_lessons")
        .select("order_index")
        .eq("module_id", validated.moduleId)
        .order("order_index", { ascending: false })
        .limit(1)
        .single();

      orderIndex = maxData ? maxData.order_index + 1 : 0;
    }

    const { data, error } = await supabase
      .from("module_lessons")
      .insert({
        module_id: validated.moduleId,
        title: validated.title,
        description: validated.description || null,
        order_index: orderIndex,
        section_id: validated.sectionId || null,
        lesson_type: validated.lessonType,
        material_id: validated.materialId || null,
        resource_id: validated.resourceId || null,
        quiz_config_id: validated.quizConfigId || null,
        duration_minutes: validated.durationMinutes,
        is_preview: validated.isPreview,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Log admin action
    await supabase.from("admin_actions").insert({
      admin_id: admin.id,
      action_type: "create_learning_material",
      table_name: "module_lessons",
      record_id: data.id,
      new_values: { title: data.title, lesson_type: data.lesson_type },
    });

    revalidatePath("/admin/learning");
    revalidatePath(`/admin/learning/${validated.moduleId}/lessons`);

    return {
      success: true,
      id: data.id,
      redirect: `/admin/learning/${validated.moduleId}/lessons`,
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("[createLesson] Unexpected error:", error);
    return { success: false, error: "Gagal membuat lesson" };
  }
}

// ============================================================
// UPDATE LESSON
// ============================================================

export async function updateLesson(
  admin: AdminUser,
  lessonId: string,
  input: Partial<ModuleLessonInput>
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const supabase = getSupabaseServiceClient();

    // Get existing lesson
    const { data: existing } = await supabase
      .from("module_lessons")
      .select("*")
      .eq("id", lessonId)
      .single();

    if (!existing) {
      return { success: false, error: "Lesson tidak ditemukan" };
    }

    const updateData: any = {};

    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.orderIndex !== undefined) updateData.order_index = input.orderIndex;
    if (input.lessonType !== undefined) updateData.lesson_type = input.lessonType;
    if (input.materialId !== undefined) updateData.material_id = input.materialId;
    if (input.resourceId !== undefined) updateData.resource_id = input.resourceId;
    if (input.quizConfigId !== undefined) updateData.quiz_config_id = input.quizConfigId;
    if (input.durationMinutes !== undefined) updateData.duration_minutes = input.durationMinutes;
    if (input.isPreview !== undefined) updateData.is_preview = input.isPreview;

    const { data, error } = await supabase
      .from("module_lessons")
      .update(updateData)
      .eq("id", lessonId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Log admin action
    await supabase.from("admin_actions").insert({
      admin_id: admin.id,
      action_type: "update_learning_module",
      table_name: "module_lessons",
      record_id: lessonId,
      old_values: { title: existing.title, lesson_type: existing.lesson_type },
      new_values: { title: data.title, lesson_type: data.lesson_type },
    });

    revalidatePath("/admin/learning");
    revalidatePath(`/admin/learning/${existing.module_id}/lessons`);

    return { success: true };
  } catch (error: any) {
    console.error("[updateLesson] Unexpected error:", error);
    return { success: false, error: "Gagal memperbarui lesson" };
  }
}

// ============================================================
// DELETE LESSON
// ============================================================

export async function deleteLesson(
  admin: AdminUser,
  lessonId: string
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const supabase = getSupabaseServiceClient();

    // Get existing lesson
    const { data: existing } = await supabase
      .from("module_lessons")
      .select("*")
      .eq("id", lessonId)
      .single();

    if (!existing) {
      return { success: false, error: "Lesson tidak ditemukan" };
    }

    const { error } = await supabase
      .from("module_lessons")
      .delete()
      .eq("id", lessonId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Log admin action
    await supabase.from("admin_actions").insert({
      admin_id: admin.id,
      action_type: "delete_learning_module",
      table_name: "module_lessons",
      record_id: lessonId,
      old_values: { title: existing.title, lesson_type: existing.lesson_type },
    });

    revalidatePath("/admin/learning");
    revalidatePath(`/admin/learning/${existing.module_id}/lessons`);

    return { success: true };
  } catch (error: any) {
    console.error("[deleteLesson] Unexpected error:", error);
    return { success: false, error: "Gagal menghapus lesson" };
  }
}

// ============================================================
// REORDER LESSONS
// ============================================================

export async function reorderLessons(
  admin: AdminUser,
  moduleId: string,
  lessonIds: string[]
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const supabase = getSupabaseServiceClient();

    // Update order_index for each lesson
    const updates = lessonIds.map((lessonId, index) =>
      supabase
        .from("module_lessons")
        .update({ order_index: index })
        .eq("id", lessonId)
        .eq("module_id", moduleId)
    );

    const results = await Promise.all(updates);

    for (const result of results) {
      if (result.error) {
        return { success: false, error: result.error.message };
      }
    }

    // Log admin action
    await supabase.from("admin_actions").insert({
      admin_id: admin.id,
      action_type: "update_learning_module",
      table_name: "module_lessons",
      record_id: moduleId,
      new_values: { reordered: true, lesson_count: lessonIds.length },
    });

    revalidatePath("/admin/learning");
    revalidatePath(`/admin/learning/${moduleId}/lessons`);

    return { success: true };
  } catch (error: any) {
    console.error("[reorderLessons] Unexpected error:", error);
    return { success: false, error: "Gagal mengurutkan ulang lesson" };
  }
}
