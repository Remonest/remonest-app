import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/require-admin";
import { getLearningModuleById } from "@/lib/learning/actions";
import { getLessonsByModuleId } from "@/features/learning-module/actions/lessons";
import { getSectionsByModuleId } from "@/features/learning-module/actions/sections";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import LearningFlowBuilder from "./builder-client";
import { getLessonWithContent } from "@/features/learning-module/actions/lessons";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LearningFlowBuilderPage({ params }: PageProps) {
  const admin = await requireAdmin();
  const { id } = await params;

  const mod = await getLearningModuleById(id);
  if (!mod) notFound();

  const [lessons, sections] = await Promise.all([
    getLessonsByModuleId(id),
    getSectionsByModuleId(id),
  ]);

  // Fetch materials and quizzes for linking
  const supabase = getSupabaseServiceClient();

  const [{ data: allMaterials }, { data: lessonLinks }, { data: quizzes }, { data: resources }] =
    await Promise.all([
      supabase
        .from("learning_materials")
        .select("id, title, source_url, source_type")
        .eq("module_id", id),
      supabase
        .from("module_lessons")
        .select("material_id")
        .eq("module_id", id)
        .not("material_id", "is", null),
      supabase
        .from("quiz_configs")
        .select("id, title")
        .eq("module_id", id)
        .eq("is_published", true),
      supabase
        .from("learning_resources")
        .select("id, title, resource_type")
        .eq("module_id", id),
    ]);

  // Filter out materials already linked to lessons (builder-managed)
  const linkedMaterialIds = new Set((lessonLinks ?? []).map((l: any) => l.material_id));
  const materials = (allMaterials ?? []).filter((m) => !linkedMaterialIds.has(m.id));

  // Fetch content for first lesson if exists
  let initialLessonContent: string | null = null;
  let initialVideoUrl: string | null = null;
  if (lessons.length > 0) {
    const lessonWithData = await getLessonWithContent(lessons[0].id);
    if (lessonWithData?.material) {
      initialLessonContent = lessonWithData.material.content;
      initialVideoUrl = lessonWithData.material.source_url ?? null;
    }
  }

  // Map sections to include their lessons
  const sectionsWithLessons = sections.map((section, index) => {
    // For first section, also include lessons with null sectionId
    const isFirstSection = index === 0;
    return {
      ...section,
      lessons: lessons.filter((l) => 
        isFirstSection 
          ? l.sectionId === null || l.sectionId === section.id
          : l.sectionId === section.id
      ),
    };
  });

  // If no sections exist, create a default one and assign all lessons to it
  const finalSections = sectionsWithLessons.length > 0
    ? sectionsWithLessons
    : [{
        id: "default",
        moduleId: id,
        title: "Getting Started",
        orderIndex: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lessons: lessons,
      }];

  return (
    <LearningFlowBuilder
      moduleId={id}
      moduleTitle={mod.title}
      moduleStatus={mod.status}
      lessons={lessons}
      initialSections={finalSections}
      admin={admin}
      materials={materials ?? []}
      quizzes={quizzes ?? []}
      resources={resources ?? []}
      initialLessonContent={initialLessonContent}
      initialVideoUrl={initialVideoUrl}
    />
  );
}
