import { notFound } from "next/navigation";
import Link from "next/link";
import { getLearningModuleById } from "@/lib/learning/actions";
import QuizBuilder from "./quiz-builder";
import { LearningBreadcrumb } from "@/components/admin/learning-breadcrumb";

interface QuizPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ quizId?: string }>;
}

export default async function QuizBuilderPage({ params, searchParams }: QuizPageProps) {
  const { id } = await params;
  const { quizId } = await searchParams;

  // Fetch module to verify it exists
  const module = await getLearningModuleById(id);

  if (!module) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <LearningBreadcrumb
        moduleId={id}
        moduleTitle={module.title}
        currentPage={quizId ? "Edit Quiz" : "Quiz Builder"}
      />

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {quizId ? "Edit Quiz" : "Quiz Builder"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {quizId ? "Modify existing quiz" : "Create new quiz"} for "{module.title}"
        </p>
      </div>

      {/* Quiz Builder */}
      <QuizBuilder
        moduleId={id}
        moduleTitle={module.title}
        initialQuizId={quizId}
      />
    </div>
  );
}
