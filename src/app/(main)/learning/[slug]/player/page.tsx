import { notFound, redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getLearningModuleBySlug } from "@/features/learning-module/actions/fetch-learning";
import {
  getLessonsForModule,
  getMaterialsByModuleId,
} from "@/features/learning-module/actions/fetch-learning";
import {
  getUserCompletedLessonIds,
  getUserModuleProgress,
} from "@/features/learning-module/actions/lesson-progress";
import LearningPlayerClient from "./player-client";

interface PlayerPageProps {
  params: Promise<{ slug: string }>;
}

export default async function LearningPlayerPage({ params }: PlayerPageProps) {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const { slug } = await params;
    redirect(`/login?next=/learning/${slug}/player`);
  }

  const { slug } = await params;
  const mod = await getLearningModuleBySlug(slug);

  if (!mod) {
    notFound();
  }

  // Fetch lessons and materials in parallel
  const [lessons, materials, completedLessonIds, progress] = await Promise.all([
    getLessonsForModule(mod.id),
    getMaterialsByModuleId(mod.id),
    getUserCompletedLessonIds(mod.id),
    getUserModuleProgress(mod.id),
  ]);

  if (lessons.length === 0) {
    // Redirect to module detail page if no lessons exist
    redirect(`/learning/${slug}`);
  }

  // Determine first lesson to show (first incomplete, or first lesson if all complete)
  const firstIncompleteLesson = lessons.find(
    (l) => !completedLessonIds.includes(l.id),
  );
  const activeLessonId = firstIncompleteLesson?.id || lessons[0]?.id;

  return (
    <LearningPlayerClient
      module={mod}
      lessons={lessons}
      materials={materials}
      completedLessonIds={completedLessonIds}
      progress={progress}
      activeLessonId={activeLessonId}
    />
  );
}
