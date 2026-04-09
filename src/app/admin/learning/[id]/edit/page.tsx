import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLearningModuleById } from "@/lib/learning/actions";
import { EditLearningModuleForm } from "./form";

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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild className="gap-1">
          <Link href="/admin/learning">
            <ArrowLeft className="size-4" />
            Kembali ke Learning
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Edit Learning Module
        </h1>
        <p className="text-sm text-muted-foreground">
          Edit modul &quot;{module.title}&quot; di katalog Remonest.
        </p>
      </div>

      <EditLearningModuleForm module={module} />
    </div>
  );
}
