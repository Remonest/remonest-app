import { notFound } from "next/navigation";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLearningModuleById } from "@/lib/learning/actions";
import { EditLearningModuleForm } from "./form";
import { LearningBreadcrumb } from "@/components/admin/learning-breadcrumb";

interface EditLearningModulePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditLearningModulePage({
  params,
}: EditLearningModulePageProps) {
  const { id } = await params;
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
        currentPage="Edit Metadata"
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit Module Metadata
          </h1>
          <p className="text-sm text-muted-foreground">
            Update title, category, status, and description for this module.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href={`/admin/learning/${id}/builder`}>
            <BookOpen className="size-4" />
            Open Flow Builder
          </Link>
        </Button>
      </div>

      <EditLearningModuleForm module={module} />
    </div>
  );
}
