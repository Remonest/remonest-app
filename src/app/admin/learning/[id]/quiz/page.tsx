import { notFound } from "next/navigation";
import Link from "next/link";
import { getLearningModuleById } from "@/lib/learning/actions";
import QuizBuilder from "./quiz-builder";
import { LearningBreadcrumb } from "@/components/admin/learning-breadcrumb";

interface QuizPageProps {
  params: Promise<{ id: string }>;
}

export default async function QuizBuilderPage({ params }: QuizPageProps) {
  const { id } = await params;

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
        currentPage="Quiz Builder"
      />

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Quiz Builder
        </h1>
        <p className="text-sm text-muted-foreground">
          Create and manage quizzes for "{module.title}"
        </p>
      </div>

      {/* Quiz Builder */}
      <QuizBuilder
        moduleId={id}
        moduleTitle={module.title}
      />
    </div>
  );
}
