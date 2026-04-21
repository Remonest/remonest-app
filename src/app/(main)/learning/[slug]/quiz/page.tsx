import { notFound, redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getLearningModuleBySlug } from "@/features/learning-module/actions/fetch-learning";
import { getModuleQuizzes, getQuizWithQuestions } from "@/features/learning-module/actions/quiz-actions";
import { getUserModuleProgress } from "@/features/learning-module/actions/enrollment";
import QuizTakingClient from "@/features/learning-module/components/QuizTakingClient";

interface QuizPageProps {
  params: Promise<{ slug: string }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { slug } = await params;
  
  const supabase = getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/learning/${slug}/quiz`);
  }

  // 1. Fetch module
  const mod = await getLearningModuleBySlug(slug);
  if (!mod) {
    notFound();
  }

  // 2. Verify enrollment
  const progress = await getUserModuleProgress(mod.id);
  if (!progress) {
    // User must be enrolled to take the quiz
    redirect(`/learning/${slug}`);
  }

  // 3. Fetch published quiz for this module
  const quizzes = await getModuleQuizzes(mod.id);
  const publishedQuiz = quizzes.find(q => q.isPublished);

  if (!publishedQuiz) {
    // No published quiz for this module
    notFound();
  }

  // 4. Fetch complete quiz with questions
  const quizData = await getQuizWithQuestions(publishedQuiz.id);
  if (!quizData || quizData.questions.length === 0) {
    notFound();
  }

  return (
    <QuizTakingClient 
      module={mod} 
      quiz={quizData.config} 
      questions={quizData.questions} 
    />
  );
}
