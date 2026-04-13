"use client";

import {
  Play,
  FileText,
  Code,
  ClipboardCheck,
  FolderOpen,
  Check,
  Lock,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------
// Types
// ---------------------------------------------------------------

type LessonType = "video" | "article" | "exercise" | "quiz" | "resource";

type LessonState = "active" | "locked" | "completed" | "default";

interface CurriculumStepperProps {
  lessons: {
    id: string;
    title: string;
    description: string | null;
    lessonType: LessonType;
    durationMinutes: number;
    isPreview: boolean;
    orderIndex: number;
  }[];
  activeLessonId?: string;
  completedLessonIds: string[];
}

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------

const LESSON_TYPE_LABELS: Record<LessonType, string> = {
  video: "Video",
  article: "Article",
  exercise: "Exercise",
  quiz: "Quiz",
  resource: "Resource",
};

const LESSON_TYPE_BADGE_COLORS: Record<LessonType, string> = {
  video: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  article:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  exercise:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  quiz: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  resource:
    "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
};

function getLessonIcon(lessonType: LessonType) {
  switch (lessonType) {
    case "video":
      return Play;
    case "article":
      return FileText;
    case "exercise":
      return Code;
    case "quiz":
      return ClipboardCheck;
    case "resource":
      return FolderOpen;
  }
}

function getLessonState(
  lesson: CurriculumStepperProps["lessons"][number],
  activeLessonId?: string,
  completedLessonIds?: string[],
): LessonState {
  if (completedLessonIds?.includes(lesson.id)) return "completed";
  if (lesson.id === activeLessonId) return "active";
  // Lessons after the active one (or all if none active) are locked
  if (activeLessonId) {
    const activeLesson = completedLessonIds?.includes(activeLessonId!)
      ? null
      : null;
    // If no active lesson but some are completed, lessons after last completed are default
    if (activeLessonId) {
      const activeOrder =
        completedLessonIds?.includes(activeLessonId) ? -1 : 0;
      if (lesson.orderIndex <= activeOrder) return "default";
    }
  }
  // If lesson comes before active or completed lessons, mark as default
  if (completedLessonIds && completedLessonIds.length > 0) {
    return "default";
  }
  if (!activeLessonId) return "locked";
  return "locked";
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// ---------------------------------------------------------------
// StepIcon sub-component
// ---------------------------------------------------------------

interface StepIconProps {
  lessonType: LessonType;
  state: LessonState;
  size?: number;
}

function StepIcon({ lessonType, state, size = 40 }: StepIconProps) {
  const Icon = getLessonIcon(lessonType);

  if (state === "completed") {
    return (
      <div
        className="flex items-center justify-center rounded-full bg-emerald-500 shrink-0"
        style={{ width: size, height: size }}
      >
        <Check className="size-5 text-white" />
      </div>
    );
  }

  if (state === "active") {
    return (
      <div
        className="flex items-center justify-center rounded-full bg-primary shrink-0"
        style={{ width: size, height: size }}
      >
        <Icon className="size-4 text-primary-foreground" />
      </div>
    );
  }

  if (state === "locked") {
    return (
      <div
        className="flex items-center justify-center rounded-full bg-muted border-2 border-dashed border-border shrink-0"
        style={{ width: size, height: size }}
      >
        <Lock className="size-4 text-muted-foreground" />
      </div>
    );
  }

  // default
  return (
    <div
      className="flex items-center justify-center rounded-full bg-muted shrink-0"
      style={{ width: size, height: size }}
    >
      <Icon className="size-4 text-muted-foreground" />
    </div>
  );
}

// ---------------------------------------------------------------
// CurriculumStepper
// ---------------------------------------------------------------

export default function CurriculumStepper({
  lessons = [],
  activeLessonId,
  completedLessonIds = [],
}: CurriculumStepperProps) {
  if (!lessons || lessons.length === 0) {
    return (
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8">
        <p className="text-sm text-muted-foreground">
          No lessons available yet.
        </p>
      </div>
    );
  }

  const sortedLessons = [...lessons].sort(
    (a, b) => a.orderIndex - b.orderIndex,
  );

  return (
    <section>
      <div className="relative">
        {sortedLessons.map((lesson, index) => {
          const state = getLessonState(
            lesson,
            activeLessonId,
            completedLessonIds,
          );
          const isLast = index === sortedLessons.length - 1;

          return (
            <div key={lesson.id} className="relative flex gap-4">
              {/* Step column */}
              <div className="flex flex-col items-center">
                <StepIcon lessonType={lesson.lessonType} state={state} />

                {/* Connecting line */}
                {!isLast && (
                  <div className="w-px flex-1 bg-border my-2 min-h-[24px]" />
                )}
              </div>

              {/* Content column */}
              <div className="flex flex-col gap-1 pb-6 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <h3
                    className={cn(
                      "text-sm font-medium truncate",
                      state === "active" && "text-primary",
                      state === "completed" && "text-emerald-600 dark:text-emerald-400",
                      state === "locked" && "text-muted-foreground/60",
                      state === "default" && "text-foreground",
                    )}
                  >
                    {lesson.title}
                  </h3>

                  {/* Badges row */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Preview badge */}
                    {lesson.isPreview && (
                      <Badge
                        variant="outline"
                        className="text-[10px] h-5 px-1.5 gap-1 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800"
                      >
                        <Eye className="size-3" />
                        Preview
                      </Badge>
                    )}

                    {/* Lesson type badge */}
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] h-5 px-1.5",
                        LESSON_TYPE_BADGE_COLORS[lesson.lessonType],
                      )}
                    >
                      {LESSON_TYPE_LABELS[lesson.lessonType]}
                    </Badge>
                  </div>
                </div>

                {/* Description */}
                {lesson.description &&
                  state !== "locked" && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {lesson.description}
                    </p>
                  )}

                {/* Duration */}
                {lesson.durationMinutes > 0 && (
                  <span className="text-xs text-muted-foreground/70">
                    {formatDuration(lesson.durationMinutes)}
                  </span>
                )}

                {/* Locked message */}
                {state === "locked" && (
                  <p className="text-xs text-muted-foreground/50 italic">
                    Complete previous lessons to unlock
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
