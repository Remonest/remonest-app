export type SourceType = "article" | "video" | "documentation" | "tutorial";
export type ResourceFileType = "tool" | "template" | "ebook" | "checklist" | "cheatsheet" | "pdf";
export type MaterialDifficulty = "beginner" | "intermediate" | "advanced";

export interface LearningMaterial {
  id: string;
  module_id: string;
  title: string;
  content: string | null;
  summary: string | null;
  source_url: string | null;
  source_type: SourceType | null;
  file_url: string | null;
  language: string;
  reading_time_minutes: number | null;
  difficulty: MaterialDifficulty;
  tags: string[] | null;
  orderIndex: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface LearningMaterialRow {
  id: string;
  module_id: string;
  title: string;
  content: string | null;
  summary: string | null;
  source_url: string | null;
  source_type: SourceType | null;
  file_url: string | null;
  language: string;
  reading_time_minutes: number | null;
  difficulty: MaterialDifficulty;
  tags: string[] | null;
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface LearningResource {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  url: string;
  resource_type: ResourceFileType | null;
  is_free: boolean;
  created_at: string;
}

export interface LearningMaterialInput {
  title: string;
  content: string;
  summary: string;
  sourceUrl: string;
  sourceType: SourceType | "";
  fileUrl: string;
  language: string;
  readingTimeMinutes: number | "";
  difficulty: MaterialDifficulty;
  tags: string;
  isPublished: boolean;
}

export interface LearningResourceInput {
  title: string;
  description: string;
  url: string;
  resourceType: ResourceFileType | "";
  isFree: boolean;
}

export interface ActionResult {
  success: boolean;
  error?: string;
  redirect?: string;
  id?: string;
}
