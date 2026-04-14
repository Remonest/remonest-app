"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Eye,
  Save,
  Rocket,
  BookOpen,
  ListTree,
  FileText,
  CheckCircle2,
  Plus,
  MoreVertical,
  ChevronDown,
  GripVertical,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { ModuleLesson } from "@/features/learning-module/types/lesson";
import type { AdminUser } from "@/lib/admin/require-admin";
import { CurriculumPanel } from "./curriculum-panel";
import { EditorPanel } from "./editor-panel";
import { PropertiesPanel } from "./properties-panel";
import {
  updateLesson,
  reorderLessons,
  createLesson,
  deleteLesson,
} from "@/features/learning-module/actions/lessons";
import { saveStepContent, publishModule } from "./flow-builder-actions";
import { LearningBreadcrumb } from "@/components/admin/learning-breadcrumb";

// ─── Types ───────────────────────────────────────────────────

interface LearningFlowBuilderProps {
  moduleId: string;
  moduleTitle: string;
  moduleStatus: string;
  lessons: ModuleLesson[];
  admin: AdminUser;
  materials: { id: string; title: string }[];
  quizzes: { id: string; title: string }[];
  resources: { id: string; title: string; resource_type: string }[];
  initialLessonContent?: string | null;
}

export type LessonType = "video" | "article" | "exercise" | "quiz" | "resource";

export interface Section {
  id: string;
  title: string;
  lessons: ModuleLesson[];
}

// ─── Component ───────────────────────────────────────────────

export default function LearningFlowBuilder({
  moduleId,
  moduleTitle,
  moduleStatus,
  lessons: initialLessons,
  admin,
  materials,
  quizzes,
  resources,
  initialLessonContent,
}: LearningFlowBuilderProps) {
  const router = useRouter();
  const [lessons, setLessons] = useState(initialLessons);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(
    initialLessons.length > 0 ? initialLessons[0].id : null,
  );
  const [editorContent, setEditorContent] = useState(
    initialLessonContent ?? "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [propertiesOpen, setPropertiesOpen] = useState(true);

  // Group lessons into sections (for now, single section)
  const [sections, setSections] = useState<Section[]>([
    {
      id: "section-1",
      title: "Getting Started",
      lessons: lessons,
    },
  ]);

  const selectedLesson = lessons.find((l) => l.id === selectedLessonId) ?? null;

  // Auto-save debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedLessonId && editorContent) {
        handleAutoSave();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [editorContent, selectedLessonId]);

  const handleAutoSave = useCallback(async () => {
    if (!selectedLessonId || !editorContent.trim()) return;

    try {
      const result = await saveStepContent(
        admin,
        selectedLessonId,
        editorContent,
      );

      if (result.success) {
        setLastSaved(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  }, [selectedLessonId, editorContent, admin]);

  const handleLessonSelect = useCallback(
    async (lessonId: string) => {
      setSelectedLessonId(lessonId);
      const lesson = lessons.find((l) => l.id === lessonId);

      // Fetch lesson content
      if (lesson?.materialId) {
        const response = await fetch(
          `/api/learning/materials/${lesson.materialId}`,
        );
        if (response.ok) {
          const data = await response.json();
          setEditorContent(data.content ?? "");
        }
      } else {
        setEditorContent("");
      }
    },
    [lessons],
  );

  const handleLessonCreate = useCallback(
    async (lessonData: {
      title: string;
      description?: string;
      lessonType: LessonType;
      durationMinutes?: number;
      isPreview?: boolean;
    }) => {
      const result = await createLesson(admin, {
        moduleId,
        title: lessonData.title,
        description: lessonData.description,
        lessonType: lessonData.lessonType,
        durationMinutes: lessonData.durationMinutes ?? 15,
        isPreview: lessonData.isPreview ?? false,
      });

      if (result.success) {
        toast.success("Step created");
        router.refresh();
      } else {
        toast.error("Failed to create step", { description: result.error });
      }
    },
    [admin, moduleId, router],
  );

  const handleAddStep = useCallback(() => {
    // Create a simple prompt for lesson title
    const title = prompt("Enter step title:");
    if (!title || !title.trim()) return;

    handleLessonCreate({
      title: title.trim(),
      lessonType: "article",
      durationMinutes: 15,
    });
  }, [handleLessonCreate]);

  const handleLessonUpdate = useCallback(
    async (
      lessonId: string,
      data: {
        title?: string;
        description?: string;
        lessonType?: LessonType;
        durationMinutes?: number;
        isPreview?: boolean;
      },
    ) => {
      const result = await updateLesson(admin, lessonId, data);

      if (result.success) {
        toast.success("Step updated");
        router.refresh();
      } else {
        toast.error("Failed to update step", { description: result.error });
      }
    },
    [admin, router],
  );

  const handleLessonDelete = useCallback(
    async (lessonId: string) => {
      const result = await deleteLesson(admin, lessonId);

      if (result.success) {
        toast.success("Step deleted");
        router.refresh();
      } else {
        toast.error("Failed to delete step", { description: result.error });
      }
    },
    [admin, router],
  );

  const handleReorderLessons = useCallback(
    async (sectionId: string, lessonIds: string[]) => {
      const result = await reorderLessons(admin, moduleId, lessonIds);

      if (result.success) {
        toast.success("Steps reordered");
        router.refresh();
      } else {
        toast.error("Failed to reorder", { description: result.error });
      }
    },
    [admin, moduleId, router],
  );

  const handlePublish = useCallback(async () => {
    if (!confirm("Are you sure you want to publish this module?")) return;
    
    setIsSaving(true);
    try {
      const result = await publishModule(admin, moduleId);
      if (result.success) {
        toast.success("Module published successfully");
        router.refresh();
      } else {
        toast.error("Failed to publish module", { description: result.error });
      }
    } finally {
      setIsSaving(false);
    }
  }, [admin, moduleId, router]);

  const handleSaveDraft = useCallback(async () => {
    setIsSaving(true);
    try {
      await handleAutoSave();
      toast.success("Draft saved");
      setLastSaved(new Date().toLocaleTimeString());
    } finally {
      setIsSaving(false);
    }
  }, [handleAutoSave]);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-background">
      {/* Top Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-6">
        <div className="flex items-center gap-4">
          <LearningBreadcrumb
            moduleId={moduleId}
            moduleTitle={moduleTitle}
            currentPage="Flow Builder"
          />
          <Badge
            variant="outline"
            className="rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
          >
            {moduleStatus}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" asChild>
            <Link href={`/learning/${moduleId}`} target="_blank" rel="noopener noreferrer">
              <Eye className="h-3.5 w-3.5" />
              Preview
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleSaveDraft}
            disabled={isSaving}
          >
            <Save className="h-3.5 w-3.5" />
            Save Draft
          </Button>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={handlePublish}
            disabled={isSaving}
          >
            <Rocket className="h-3.5 w-3.5" />
            Publish
          </Button>
        </div>
      </header>

      {/* Builder Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Curriculum Panel */}
        <CurriculumPanel
          sections={sections}
          selectedLessonId={selectedLessonId}
          onLessonSelect={handleLessonSelect}
          onLessonCreate={handleLessonCreate}
          onAddStep={handleAddStep}
          onLessonUpdate={handleLessonUpdate}
          onLessonDelete={handleLessonDelete}
          onReorder={handleReorderLessons}
        />

        {/* Editor Panel */}
        <EditorPanel
          lesson={selectedLesson}
          content={editorContent}
          onContentChange={setEditorContent}
          lastSaved={lastSaved}
        />

        {/* Properties Panel */}
        <PropertiesPanel
          lesson={selectedLesson}
          onUpdate={handleLessonUpdate}
          onDelete={handleLessonDelete}
          isOpen={propertiesOpen}
          onToggle={() => setPropertiesOpen(!propertiesOpen)}
          materials={materials}
          quizzes={quizzes}
          resources={resources}
        />
      </div>
    </div>
  );
}
