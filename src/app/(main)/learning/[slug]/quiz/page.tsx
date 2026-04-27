import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getLearningModuleBySlug } from "@/features/learning-module/actions/fetch-learning";
import {
  getModuleQuizzes,
  getQuizWithQuestions,
} from "@/features/learning-module/actions/quiz-actions";
import QuizTakingClient from "@/features/learning-module/components/QuizTakingClient";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function QuizPlayPage({ params }: PageProps) {
  const { slug } = await params;
  const mod = await getLearningModuleBySlug(slug);

  if (!mod) notFound();

  const quizzes = await getModuleQuizzes(mod.id);
  const publishedQuiz = quizzes.find((q) => q.isPublished);

  if (!publishedQuiz) notFound();

  const quizData = await getQuizWithQuestions(publishedQuiz.id);
  if (!quizData) notFound();

  return (
    <QuizTakingClient
      module={{
        id: mod.id,
        title: mod.title,
        slug: mod.slug,
      }}
      quiz={quizData.config}
      questions={quizData.questions}
    />
  );
}
