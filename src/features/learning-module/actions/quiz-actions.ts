"use server";

import { getSupabaseServiceClient, getSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/features/auth/actions/guards";
import type {
  QuizConfigInput,
  QuestionInput,
  QuizResult,
  QuizWithQuestions,
  QuizConfig,
  QuizConfigRow,
  Question,
  QuestionRow,
  QuizAttemptResult,
} from "@/features/learning-module/types/quiz";
import { updateModuleProgress } from "./enrollment";

// ============================================================
// Quiz Configuration Actions
// ============================================================

/**
 * Create a new quiz configuration with questions
 * Inserts quiz config first, then bulk inserts all questions
 */
export async function createQuizWithQuestions(
  moduleId: string,
  config: QuizConfigInput,
  questions: QuestionInput[]
): Promise<QuizResult> {
  const supabase = getSupabaseServiceClient();

  // Validate minimum 1 question
  if (questions.length === 0) {
    return {
      success: false,
      error: "Quiz harus memiliki minimal 1 pertanyaan",
    };
  }

  // Validate all questions have required fields
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q.questionText.trim()) {
      return {
        success: false,
        error: `Pertanyaan #${i + 1} tidak boleh kosong`,
      };
    }
    if (!q.correctAnswer) {
      return {
        success: false,
        error: `Pertanyaan #${i + 1} harus memiliki jawaban yang benar`,
      };
    }
    // Validate all options are filled
    const options = ["A", "B", "C", "D", "E"] as const;
    for (const opt of options) {
      if (!q.options[opt]?.trim()) {
        return {
          success: false,
          error: `Pertanyaan #${i + 1}, opsi ${opt} tidak boleh kosong`,
        };
      }
    }
  }

  try {
    // Insert quiz configuration
    const { data: quizConfig, error: configError } = await supabase
      .from("quiz_configs")
      .insert({
        module_id: moduleId,
        title: config.title.trim(),
        description: config.description.trim() || null,
        duration_minutes: config.durationMinutes || null,
        passing_grade: config.passingGrade,
        is_published: config.isPublished,
      })
      .select()
      .single();

    if (configError) {
      return {
        success: false,
        error: `Gagal membuat quiz: ${configError.message}`,
      };
    }

    // Prepare questions for bulk insert
    const questionsToInsert = questions.map((q, index) => ({
      quiz_config_id: quizConfig.id,
      question_text: q.questionText.trim(),
      options: q.options,
      correct_answer: q.correctAnswer,
      explanation: q.explanation.trim() || null,
      difficulty: q.difficulty,
      order_index: index,
    }));

    // Bulk insert questions
    const { error: questionsError } = await supabase
      .from("questions")
      .insert(questionsToInsert);

    if (questionsError) {
      // Rollback: delete the quiz config if questions insert fails
      await supabase.from("quiz_configs").delete().eq("id", quizConfig.id);
      
      return {
        success: false,
        error: `Gagal menyimpan pertanyaan: ${questionsError.message}`,
      };
    }

    // Revalidate the quiz list and module pages
    revalidatePath(`/admin/learning/${moduleId}/quiz`);
    revalidatePath(`/admin/learning`);

    return {
      success: true,
      redirect: `/admin/learning`,
      quizConfigId: quizConfig.id,
    };
  } catch (_error) {
    return {
      success: false,
      error: "Terjadi kesalahan saat menyimpan quiz",
    };
  }
}

/**
 * Get quiz configuration with all questions by quiz config ID
 */
export async function getQuizWithQuestions(
  quizConfigId: string
): Promise<QuizWithQuestions | null> {
  const supabase = getSupabaseServiceClient();

  // Fetch quiz configuration
  const { data: config, error: configError } = await supabase
    .from("quiz_configs")
    .select("*")
    .eq("id", quizConfigId)
    .single();

  if (configError || !config) {
    return null;
  }

  // Fetch questions
  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("*")
    .eq("quiz_config_id", quizConfigId)
    .order("order_index", { ascending: true });

  if (questionsError) {
    return null;
  }

  return {
    config: mapRowToQuizConfig(config),
    questions: (questions ?? []).map(mapRowToQuestion),
  };
}

/**
 * Get all quizzes for a specific learning module
 */
export async function getModuleQuizzes(moduleId: string): Promise<QuizConfig[]> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from("quiz_configs")
    .select("*")
    .eq("module_id", moduleId)
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return (data ?? []).map(mapRowToQuizConfig);
}

/**
 * Update quiz configuration
 */
export async function updateQuizConfig(
  quizConfigId: string,
  config: Partial<QuizConfigInput>
): Promise<QuizResult> {
  const supabase = getSupabaseServiceClient();

  try {
    const updateData: Record<string, unknown> = {};
    if (config.title !== undefined) updateData.title = config.title.trim();
    if (config.description !== undefined) updateData.description = config.description.trim() || null;
    if (config.durationMinutes !== undefined) updateData.duration_minutes = config.durationMinutes || null;
    if (config.passingGrade !== undefined) updateData.passing_grade = config.passingGrade;
    if (config.isPublished !== undefined) updateData.is_published = config.isPublished;

    const { error } = await supabase
      .from("quiz_configs")
      .update(updateData)
      .eq("id", quizConfigId);

    if (error) {
      return {
        success: false,
        error: `Gagal mengupdate quiz: ${error.message}`,
      };
    }

    revalidatePath(`/admin/learning`);

    return {
      success: true,
    };
  } catch (_error) {
    return {
      success: false,
      error: "Terjadi kesalahan saat mengupdate quiz",
    };
  }
}

/**
 * Delete quiz configuration and all its questions
 */
export async function deleteQuiz(quizConfigId: string): Promise<QuizResult> {
  const supabase = getSupabaseServiceClient();

  try {
    // Delete quiz config (questions will be deleted via CASCADE)
    const { error } = await supabase
      .from("quiz_configs")
      .delete()
      .eq("id", quizConfigId);

    if (error) {
      return {
        success: false,
        error: `Gagal menghapus quiz: ${error.message}`,
      };
    }

    revalidatePath(`/admin/learning`);

    return {
      success: true,
    };
  } catch (_error) {
    return {
      success: false,
      error: "Terjadi kesalahan saat menghapus quiz",
    };
  }
}

/**
 * Update a single question
 */
export async function updateQuestion(
  questionId: string,
  question: Partial<QuestionInput>
): Promise<QuizResult> {
  const supabase = getSupabaseServiceClient();

  try {
    const updateData: Record<string, unknown> = {};
    if (question.questionText !== undefined) updateData.question_text = question.questionText.trim();
    if (question.options !== undefined) updateData.options = question.options;
    if (question.correctAnswer !== undefined) updateData.correct_answer = question.correctAnswer;
    if (question.explanation !== undefined) updateData.explanation = question.explanation.trim() || null;
    if (question.difficulty !== undefined) updateData.difficulty = question.difficulty;

    const { error } = await supabase
      .from("questions")
      .update(updateData)
      .eq("id", questionId);

    if (error) {
      return {
        success: false,
        error: `Gagal mengupdate pertanyaan: ${error.message}`,
      };
    }

    revalidatePath(`/admin/learning`);

    return {
      success: true,
    };
  } catch (_error) {
    return {
      success: false,
      error: "Terjadi kesalahan saat mengupdate pertanyaan",
    };
  }
}

/**
 * Add a new question to existing quiz
 */
export async function addQuestionToQuiz(
  quizConfigId: string,
  question: QuestionInput
): Promise<QuizResult> {
  const supabase = getSupabaseServiceClient();

  try {
    // Get current max order_index
    const { data: maxOrder } = await supabase
      .from("questions")
      .select("order_index")
      .eq("quiz_config_id", quizConfigId)
      .order("order_index", { ascending: false })
      .limit(1)
      .single();

    const nextOrderIndex = (maxOrder?.order_index ?? -1) + 1;

    const { error } = await supabase
      .from("questions")
      .insert({
        quiz_config_id: quizConfigId,
        question_text: question.questionText.trim(),
        options: question.options,
        correct_answer: question.correctAnswer,
        explanation: question.explanation.trim() || null,
        difficulty: question.difficulty,
        order_index: nextOrderIndex,
      });

    if (error) {
      return {
        success: false,
        error: `Gagal menambahkan pertanyaan: ${error.message}`,
      };
    }

    revalidatePath(`/admin/learning`);

    return {
      success: true,
    };
  } catch (_error) {
    return {
      success: false,
      error: "Terjadi kesalahan saat menambahkan pertanyaan",
    };
  }
}

/**
 * Delete a single question
 */
export async function deleteQuestion(questionId: string): Promise<QuizResult> {
  const supabase = getSupabaseServiceClient();

  try {
    const { error } = await supabase
      .from("questions")
      .delete()
      .eq("id", questionId);

    if (error) {
      return {
        success: false,
        error: `Gagal menghapus pertanyaan: ${error.message}`,
      };
    }

    revalidatePath(`/admin/learning`);

    return {
      success: true,
    };
  } catch (_error) {
    return {
      success: false,
      error: "Terjadi kesalahan saat menghapus pertanyaan",
    };
  }
}

// ============================================================
// Helper Functions
// ============================================================

function mapRowToQuizConfig(row: QuizConfigRow): QuizConfig {
  return {
    id: row.id,
    moduleId: row.module_id,
    title: row.title,
    description: row.description,
    durationMinutes: row.duration_minutes,
    passingGrade: row.passing_grade,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRowToQuestion(row: QuestionRow): Question {
  return {
    id: row.id,
    quizConfigId: row.quiz_config_id,
    questionText: row.question_text,
    options: row.options,
    correctAnswer: row.correct_answer,
    explanation: row.explanation,
    difficulty: row.difficulty,
    orderIndex: row.order_index,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================================
// User Quiz Actions
// ============================================================

/**
 * Submit a quiz attempt, calculate score, and update progress
 */
export async function submitQuizAttempt(
  quizConfigId: string,
  answers: Record<string, string>, // questionId -> selectedOption
  startedAt: string
): Promise<QuizAttemptResult> {
  const user = await requireAuth();
  const supabase = getSupabaseServerClient();

  try {
    // 1. Fetch quiz config and questions for scoring
    const quizData = await getQuizWithQuestions(quizConfigId);
    if (!quizData) {
      return { success: false, error: "Quiz tidak ditemukan" };
    }

    const { config, questions } = quizData;
    const totalQuestions = questions.length;
    
    if (totalQuestions === 0) {
      return { success: false, error: "Quiz tidak memiliki pertanyaan" };
    }

    // 2. Calculate score
    let correctCount = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= config.passingGrade;

    // 3. Save attempt to database
    const { data: attempt, error: attemptError } = await supabase
      .from("user_quiz_attempts")
      .upsert({
        user_id: user.id,
        quiz_config_id: quizConfigId,
        score,
        passed,
        answers,
        started_at: startedAt,
        completed_at: new Date().toISOString(),
      }, {
        onConflict: "user_id, quiz_config_id"
      })
      .select()
      .single();

    if (attemptError) {
      console.error("Failed to save quiz attempt:", attemptError);
      return { success: false, error: "Gagal menyimpan hasil quiz" };
    }

    // 4. Update module progress if passed
    if (passed) {
      // If they passed the quiz, we mark the module as 100% complete
      // (Assuming the quiz is the final step)
      await updateModuleProgress(config.moduleId, 100);
    }

    // Log activity
    await supabase.from("activity_log").insert({
      user_id: user.id,
      action_type: passed ? "module_completed" : "quiz_failed",
      title: passed 
        ? `Lulus quiz "${config.title}" dengan skor ${score}%` 
        : `Gagal quiz "${config.title}" dengan skor ${score}%`,
      metadata: { 
        quiz_config_id: quizConfigId, 
        score, 
        passed,
        module_id: config.moduleId 
      },
    });

    return {
      success: true,
      score,
      passed,
      correctCount,
      totalQuestions,
      attemptId: attempt.id,
    };
  } catch (error) {
    console.error("Unexpected error in submitQuizAttempt:", error);
    return { success: false, error: "Terjadi kesalahan saat memproses quiz" };
  }
}
