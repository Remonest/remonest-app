import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/require-admin";
import { getLearningModuleById } from "@/lib/learning/actions";
import { getLessonsByModuleId } from "@/features/learning-module/actions/lessons";
import AdminLessonsPage from "./lessons-client";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { LearningBreadcrumb } from "@/components/admin/learning-breadcrumb";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminLessonsServerPage({ params }: PageProps) {
  const admin = await requireAdmin();
  const { id } = await params;

  const mod = await getLearningModuleById(id);
  if (!mod) notFound();

  const lessons = await getLessonsByModuleId(id);

  // Fetch materials and quizzes for linking
  const supabase = getSupabaseServiceClient();

  const [{ data: materials }, { data: quizzes }] = await Promise.all([
    supabase
      .from("learning_materials")
      .select("id, title")
      .eq("module_id", id)
      .eq("is_published", true),
    supabase
      .from("quiz_configs")
      .select("id, title")
      .eq("module_id", id)
      .eq("is_published", true),
  ]);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <LearningBreadcrumb
        moduleId={id}
        moduleTitle={mod.title}
        currentPage="Lessons (Legacy)"
      />
      
      <AdminLessonsPage
        moduleId={id}
        moduleTitle={mod.title}
        lessons={lessons}
        admin={admin}
        materials={materials ?? []}
        quizzes={quizzes ?? []}
      />
    </div>
  );
}
