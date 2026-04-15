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
  onAddStep: (sectionId: string) => void;
  onEditStep: (lesson: ModuleLesson) => void;
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
  onAddSection: () => void;
  onEditSection: (sectionId: string, currentTitle: string) => void;
  onDeleteSection: (sectionId: string) => void;
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
  onAddStep,
  onEditStep,
  onLessonUpdate,
  onLessonDelete,
  onReorder,
  onAddSection,
  onEditSection,
  onDeleteSection,
}: CurriculumPanelProps) {
  const [draggedLessonId, setDraggedLessonId] = useState<string | null>(null);
  const [dragOverLessonId, setDragOverLessonId] = useState<string | null>(null);

  const handleDragStart = (lessonId: string) => {
    setDraggedLessonId(lessonId);
  };

  const handleDragOver = (e: React.DragEvent, targetLessonId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedLessonId || draggedLessonId === targetLessonId) return;
    
    // Visual feedback only - highlight the target
    setDragOverLessonId(targetLessonId);
  };

  const handleDropOnLesson = (e: React.DragEvent, targetLessonId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedLessonId || draggedLessonId === targetLessonId) {
      setDragOverLessonId(null);
      return;
    }

    // Find source and target sections
    let sourceSectionId = "";
    let targetSectionId = "";

    sections.forEach((section) => {
      if (section.lessons.some((l) => l.id === draggedLessonId)) {
        sourceSectionId = section.id;
      }
      if (section.lessons.some((l) => l.id === targetLessonId)) {
        targetSectionId = section.id;
      }
    });

    if (!sourceSectionId || !targetSectionId) {
      setDragOverLessonId(null);
      return;
    }

    // If same section, reorder within section
    if (sourceSectionId === targetSectionId) {
      const section = sections.find((s) => s.id === sourceSectionId);
      if (!section) return;

      const lessonIds = section.lessons.map((l) => l.id);
      const draggedIndex = lessonIds.indexOf(draggedLessonId);
      const targetIndex = lessonIds.indexOf(targetLessonId);

      const [draggedId] = lessonIds.splice(draggedIndex, 1);
      lessonIds.splice(targetIndex, 0, draggedId);

      onReorder(sourceSectionId, lessonIds);
    } else {
      // Moving between sections - for now, just reorder in target section
      // Full cross-section move would require additional backend support
      const targetSection = sections.find((s) => s.id === targetSectionId);
      if (!targetSection) return;

      // Add to end of target section (simplified)
      toast.info("Drag lesson to end of section to move between sections");
    }

    setDraggedLessonId(null);
    setDragOverLessonId(null);
  };

  const handleDragEnd = () => {
    setDraggedLessonId(null);
    setDragOverLessonId(null);
  };

  return (
    <aside className="w-80 shrink-0 border-r border-border bg-[#fafafa] flex flex-col overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-border bg-card px-5 py-4">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <FileText className="h-4 w-4 text-muted-foreground" />
          Curriculum
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onAddStep("")}
          title="Add new step"
        >
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
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onEditSection(section.id, section.title);
                  }}>Rename Section</DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete section "${section.title}"? Lessons in this section will not be deleted.`)) {
                        onDeleteSection(section.id);
                      }
                    }}
                  >
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
                const isDragOver = dragOverLessonId === lesson.id;

                return (
                  <div
                    key={lesson.id}
                    className={`group flex items-center gap-3 rounded-lg border p-3 text-sm cursor-pointer transition-all ${
                      isActive
                        ? "border-blue-500 bg-blue-50 text-blue-600 font-medium dark:bg-blue-900/20 dark:text-blue-400"
                        : isDragOver
                        ? "border-primary bg-primary/5 border-2 border-dashed"
                        : "border-border bg-card hover:border-border/80"
                    }`}
                    onClick={() => onLessonSelect(lesson.id)}
                    draggable
                    onDragStart={() => handleDragStart(lesson.id)}
                    onDragOver={(e) => handleDragOver(e, lesson.id)}
                    onDrop={(e) => handleDropOnLesson(e, lesson.id)}
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
                          onEditStep(lesson);
                        }}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          toast.info("Duplicate lesson - coming soon");
                        }}>
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            onLessonDelete(lesson.id);
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
                onClick={() => onAddStep(section.id)}
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
          onClick={onAddSection}
        >
          <Plus className="h-4 w-4" />
          Add Section
        </Button>
      </div>
    </aside>
  );
}
