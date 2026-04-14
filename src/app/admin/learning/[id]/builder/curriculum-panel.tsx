"use client";

import { useState } from "react";
import {
  Plus,
  GripVertical,
  FileText,
  Video,
  FileBox,
  HelpCircle,
  Code,
  MoreVertical,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { ModuleLesson } from "@/features/learning-module/types/lesson";
import type { LessonType, Section } from "./builder-client";

// ─── Types ───────────────────────────────────────────────────

interface CurriculumPanelProps {
  sections: Section[];
  selectedLessonId: string | null;
  onLessonSelect: (lessonId: string) => void;
  onLessonCreate: (data: {
    title: string;
    description?: string;
    lessonType: LessonType;
    durationMinutes?: number;
    isPreview?: boolean;
  }) => void;
  onAddStep: () => void;
  onLessonUpdate: (
    lessonId: string,
    data: {
      title?: string;
      description?: string;
      lessonType?: LessonType;
      durationMinutes?: number;
      isPreview?: boolean;
    }
  ) => void;
  onLessonDelete: (lessonId: string) => void;
  onReorder: (sectionId: string, lessonIds: string[]) => void;
}

const LESSON_TYPE_CONFIG: Record<
  LessonType,
  { label: string; icon: React.ElementType; color: string }
> = {
  video: { label: "Video", icon: Video, color: "text-blue-500" },
  article: { label: "Article", icon: FileText, color: "text-violet-500" },
  exercise: { label: "Exercise", icon: Code, color: "text-amber-500" },
  quiz: { label: "Quiz", icon: HelpCircle, color: "text-rose-500" },
  resource: { label: "Resource", icon: FileBox, color: "text-teal-500" },
};

// ─── Component ───────────────────────────────────────────────

export function CurriculumPanel({
  sections,
  selectedLessonId,
  onLessonSelect,
  onLessonCreate,
  onAddStep,
  onLessonUpdate,
  onLessonDelete,
  onReorder,
}: CurriculumPanelProps) {
  const [draggedLessonId, setDraggedLessonId] = useState<string | null>(null);

  const handleDragStart = (lessonId: string) => {
    setDraggedLessonId(lessonId);
  };

  const handleDragOver = (e: React.DragEvent, targetLessonId: string) => {
    e.preventDefault();
    if (!draggedLessonId || draggedLessonId === targetLessonId) return;

    // Find the section and reorder
    sections.forEach((section) => {
      const lessonIndex = section.lessons.findIndex(
        (l) => l.id === draggedLessonId
      );
      const targetIndex = section.lessons.findIndex(
        (l) => l.id === targetLessonId
      );

      if (lessonIndex !== -1 && targetIndex !== -1) {
        const newLessons = [...section.lessons];
        const [dragged] = newLessons.splice(lessonIndex, 1);
        newLessons.splice(targetIndex, 0, dragged);

        onReorder(section.id, newLessons.map((l) => l.id));
      }
    });
  };

  const handleDragEnd = () => {
    setDraggedLessonId(null);
  };

  return (
    <aside className="w-80 shrink-0 border-r border-border bg-[#fafafa] flex flex-col overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-border bg-card px-5 py-4">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <FileText className="h-4 w-4 text-muted-foreground" />
          Curriculum
        </span>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Curriculum List */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        {sections.map((section, sectionIndex) => (
          <div key={section.id} className="mb-4">
            {/* Section Header */}
            <div className="mb-2 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold cursor-pointer hover:bg-secondary">
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                {sectionIndex + 1}. {section.title}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto h-6 w-6"
                  >
                    <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Rename Section</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    Delete Section
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Lessons */}
            <div className="space-y-2">
              {section.lessons.map((lesson, lessonIndex) => {
                const config = LESSON_TYPE_CONFIG[lesson.lessonType];
                const Icon = config.icon;
                const isActive = lesson.id === selectedLessonId;

                return (
                  <div
                    key={lesson.id}
                    className={`group flex items-center gap-3 rounded-lg border p-3 text-sm cursor-pointer transition-colors ${
                      isActive
                        ? "border-blue-500 bg-blue-50 text-blue-600 font-medium dark:bg-blue-900/20 dark:text-blue-400"
                        : "border-border bg-card hover:border-border/80"
                    }`}
                    onClick={() => onLessonSelect(lesson.id)}
                    draggable
                    onDragStart={() => handleDragStart(lesson.id)}
                    onDragOver={(e) => handleDragOver(e, lesson.id)}
                    onDragEnd={handleDragEnd}
                  >
                    {/* Drag Handle */}
                    <div className="cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      <GripVertical className="h-4 w-4" />
                    </div>

                    {/* Icon */}
                    <div className={`flex shrink-0 ${config.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Title */}
                    <div className="min-w-0 flex-1 truncate">
                      {lesson.title}
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-auto h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Open edit dialog
                          toast.info("Edit lesson - coming soon");
                        }}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Duplicate lesson
                          toast.info("Duplicate lesson - coming soon");
                        }}>
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete "${lesson.title}"?`)) {
                              onLessonDelete(lesson.id);
                            }
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}

              {/* Add Step Button */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-muted-foreground font-medium"
                onClick={onAddStep}
              >
                <Plus className="h-4 w-4" />
                Add Step
              </Button>
            </div>
          </div>
        ))}

        {/* Add Section Button */}
        <Button
          variant="outline"
          size="sm"
          className="mt-4 w-full border-dashed gap-2 text-muted-foreground"
        >
          <Plus className="h-4 w-4" />
          Add Section
        </Button>
      </div>
    </aside>
  );
}
