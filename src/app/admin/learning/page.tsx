import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminLearningList from "@/components/admin/admin-learning-list";
import {
  getAllLearningModules,
  getLearningModuleById,
  getModuleCompletions,
  getModuleEnrollments,
} from "@/lib/learning/actions";
import { getLessonsByModuleId } from "@/features/learning-module/actions/lessons";
import { getModuleQuizzes } from "@/features/learning-module/actions/quiz-actions";

// ─── Server Component ────────────────────────────────────────

export default async function AdminLearningPage() {
  const modules = await getAllLearningModules();

  // Fetch lesson counts, completion counts, and enrollments in parallel
  const modulesWithData = await Promise.all(
    modules.map(async (mod) => {
      const [lessons, completions, enrollments, quizzes] = await Promise.all([
        getLessonsByModuleId(mod.id),
        getModuleCompletions(mod.id),
        getModuleEnrollments(mod.id),
        getModuleQuizzes(mod.id),
      ]);
      return {
        ...mod,
        lessonCount: lessons.length,
        completionCount: completions.length,
        enrollmentCount: enrollments.length,
        completions,
        enrollments,
        quizzes,
      };
    })
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Learning Modules
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage educational content for Remonest users
          </p>
        </div>
        <Link href="/admin/learning/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Module
          </Button>
        </Link>
      </div>

      {/* List */}
      <AdminLearningList modules={modulesWithData} />
    </div>
  );
}
