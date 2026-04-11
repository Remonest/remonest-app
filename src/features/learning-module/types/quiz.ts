/**
 * Quiz Configuration & Question Types
 * 
 * Types for the quiz/assessment system within learning modules.
 * Quizzes are tied to specific learning modules and contain multiple-choice questions.
 */

// ============================================================
// Enums
// ============================================================

export type QuestionDifficulty = "easy" | "medium" | "hard";

// ============================================================
// Quiz Configuration
// ============================================================

/**
 * Quiz configuration - defines the quiz settings for a learning module
 * Snake_case version matches database columns
 */
export interface QuizConfigRow {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  duration_minutes: number | null;
  passing_grade: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Quiz configuration - camelCase version for application use
 */
export interface QuizConfig {
  id: string;
  moduleId: string;
  title: string;
  description: string | null;
  durationMinutes: number | null;
  passingGrade: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Questions
// ============================================================

/**
 * Question options stored as JSONB in database
 * Format: { "A": "Option text", "B": "Option text", ... }
 */
export interface QuestionOptions {
  A: string;
  B: string;
  C: string;
  D: string;
  E: string;
}

/**
 * Single question - snake_case version matching database columns
 * Options stored as JSONB column
 */
export interface QuestionRow {
  id: string;
  quiz_config_id: string;
  question_text: string;
  options: QuestionOptions;
  correct_answer: "A" | "B" | "C" | "D" | "E";
  explanation: string | null;
  difficulty: QuestionDifficulty;
  order_index: number;
  created_at: string;
  updated_at: string;
}

/**
 * Single question - camelCase version for application use
 */
export interface Question {
  id: string;
  quizConfigId: string;
  questionText: string;
  options: QuestionOptions;
  correctAnswer: "A" | "B" | "C" | "D" | "E";
  explanation: string | null;
  difficulty: QuestionDifficulty;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Form Input Types
// ============================================================

/**
 * Question input for form - before submission to database
 */
export interface QuestionInput {
  questionText: string;
  options: QuestionOptions;
  correctAnswer: "A" | "B" | "C" | "D" | "E" | "";
  explanation: string;
  difficulty: QuestionDifficulty;
}

/**
 * Quiz configuration input for form
 */
export interface QuizConfigInput {
  title: string;
  description: string;
  durationMinutes: number | "";
  passingGrade: number;
  isPublished: boolean;
}

/**
 * Complete quiz form data including config and questions
 */
export interface QuizFormData {
  config: QuizConfigInput;
  questions: QuestionInput[];
}

// ============================================================
// Result Types
// ============================================================

export interface QuizResult {
  success: boolean;
  error?: string;
  redirect?: string;
  quizConfigId?: string;
}

export interface QuizWithQuestions {
  config: QuizConfig;
  questions: Question[];
}
