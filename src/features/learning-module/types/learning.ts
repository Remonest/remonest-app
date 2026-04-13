// ============================================================
// Learning Module Types
// ============================================================

export type LearningCategory =
  | "communication"
  | "mindset"
  | "career"
  | "design"
  | "productivity";

export type LearningStatus = "draft" | "published" | "archived";
export type ModuleDifficulty = "beginner" | "intermediate" | "advanced";

export interface LearningModule {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content: string | null;
  category: LearningCategory;
  difficultyLevel: ModuleDifficulty;
  thumbnailUrl: string | null;
  durationMin: number;
  enrollmentCount: number;
  averageRating: number;
  status: LearningStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LearningModuleRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content: string | null;
  category: LearningCategory;
  difficulty_level: ModuleDifficulty;
  thumbnail_url: string | null;
  duration_min: number;
  enrollment_count: number;
  average_rating: number;
  status: LearningStatus;
  created_at: string;
  updated_at: string;
}

export interface LearningModuleWithContent extends LearningModule {
  content: string | null;
}

export const LEARNING_CATEGORY_LABELS: Record<LearningCategory, string> = {
  communication: "Communication",
  mindset: "Mindset",
  career: "Career",
  design: "Design",
  productivity: "Productivity",
};

export const LEARNING_CATEGORY_COLORS: Record<LearningCategory, string> = {
  communication: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  mindset: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  career: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  design: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
  productivity: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
};

export const DIFFICULTY_LABELS: Record<ModuleDifficulty, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const DIFFICULTY_COLORS: Record<ModuleDifficulty, string> = {
  beginner: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  advanced: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};
