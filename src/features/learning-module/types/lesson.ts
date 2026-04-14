// ============================================================
// Module Lesson Types
// ============================================================

export type LessonType = "video" | "article" | "exercise" | "quiz" | "resource";

export interface ModuleLesson {
  id: string;
  moduleId: string;
  sectionId: string | null;
  title: string;
  description: string | null;
  orderIndex: number;
  lessonType: LessonType;
  materialId: string | null;
  resourceId: string | null;
  quizConfigId: string | null;
  durationMinutes: number;
  isPreview: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ModuleLessonRow {
  id: string;
  module_id: string;
  section_id: string | null;
  title: string;
  description: string | null;
  order_index: number;
  lesson_type: LessonType;
  material_id: string | null;
  resource_id: string | null;
  quiz_config_id: string | null;
  duration_minutes: number;
  is_preview: boolean;
  created_at: string;
  updated_at: string;
}

export interface ModuleLessonInput {
  moduleId: string;
  title: string;
  description?: string;
  orderIndex?: number;
  lessonType: LessonType;
  sectionId?: string | null;
  materialId?: string | null;
  resourceId?: string | null;
  quizConfigId?: string | null;
  durationMinutes?: number;
  isPreview?: boolean;
}
