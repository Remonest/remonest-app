import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getPublishedLearningModules } from "@/features/learning-module/actions/fetch-learning";
import { getUserEnrollments } from "@/features/learning-module/actions/enrollment";
import LearningClient from "./learning-client";

export default async function LearningPage() {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/learning");
  }

  const modules = await getPublishedLearningModules();
  const enrollments = await getUserEnrollments();

  // Build a map: moduleId -> progress
  const progressMap = new Map<string, number>();
  const completedSet = new Set<string>();
  for (const enrollment of enrollments) {
    progressMap.set(enrollment.moduleId, enrollment.progress);
    if (enrollment.completedAt) {
      completedSet.add(enrollment.moduleId);
    }
  }

  return (
    <LearningClient
      initialModules={modules}
      progressMap={progressMap}
      completedSet={completedSet}
    />
  );
}
