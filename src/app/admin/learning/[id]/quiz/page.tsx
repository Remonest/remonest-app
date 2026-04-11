import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLearningModuleById } from "@/lib/learning/actions";
import QuizBuilder from "./quiz-builder";

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" asChild>
              <Link href={`/admin/learning/${id}/edit`}>
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Buat Quiz Baru
              </h1>
              <p className="text-sm text-muted-foreground">
                Modul: {module.title}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Builder */}
      <QuizBuilder
        moduleId={id}
        moduleTitle={module.title}
      />
    </div>
  );
}
