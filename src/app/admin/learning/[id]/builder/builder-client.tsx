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
  Video,
  FileBox,
  HelpCircle,
  Code,
  CheckCircle2,
  Plus,
  MoreVertical,
  ChevronDown,
  GripVertical,
  SlidersHorizontal,
  Loader2,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { createSection, deleteSection, updateSection } from "@/features/learning-module/actions/sections";
import { saveStepContent, publishModule } from "./flow-builder-actions";
import { LearningBreadcrumb } from "@/components/admin/learning-breadcrumb";

// ─── Types ───────────────────────────────────────────────────

interface LearningFlowBuilderProps {
  moduleId: string;
  moduleTitle: string;
  moduleStatus: string;
  lessons: ModuleLesson[];
  initialSections: Section[];
  admin: AdminUser;
  materials: { id: string; title: string }[];
  quizzes: { id: string; title: string }[];
  resources: { id: string; title: string; resource_type: string }[];
  initialLessonContent?: string | null;
}

export type LessonType = "video" | "article" | "exercise" | "quiz" | "resource";

export interface Section {
  id: string;
  moduleId?: string;
  title: string;
  orderIndex?: number;
  lessons: ModuleLesson[];
}

// ─── Component ───────────────────────────────────────────────

export default function LearningFlowBuilder({
  moduleId,
  moduleTitle,
  moduleStatus,
  lessons: initialLessons,
  initialSections,
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

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add Section Dialog state
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [isCreatingSection, setIsCreatingSection] = useState(false);

  const openAddSection = useCallback(() => {
    setNewSectionTitle("");
    setAddSectionOpen(true);
  }, []);

  const handleAddSection = useCallback(async () => {
    if (!newSectionTitle.trim()) {
      toast.error("Section title is required");
      return;
    }

    setIsCreatingSection(true);
    try {
      const result = await createSection(admin, moduleId, newSectionTitle.trim());

      if (result.success) {
        const newSectionId = result.id!;
        
        // Add to local state immediately
        setSections((prev) => [
          ...prev,
          {
            id: newSectionId,
            moduleId,
            title: newSectionTitle.trim(),
            lessons: [],
          },
        ]);

        toast.success("Section added");
        setAddSectionOpen(false);
        setNewSectionTitle("");
      } else {
        toast.error("Failed to add section", { description: result.error });
      }
    } finally {
      setIsCreatingSection(false);
    }
  }, [admin, moduleId, newSectionTitle]);

  // Edit Section Dialog state
  const [editSectionOpen, setEditSectionOpen] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string>("");
  const [editSectionTitle, setEditSectionTitle] = useState("");
  const [isUpdatingSection, setIsUpdatingSection] = useState(false);

  const openEditSection = useCallback((sectionId: string, currentTitle: string) => {
    if (sectionId === "default") {
      toast.error("Cannot edit the default section");
      return;
    }
    setEditingSectionId(sectionId);
    setEditSectionTitle(currentTitle);
    setEditSectionOpen(true);
  }, []);

  const handleEditSection = useCallback(async () => {
    if (!editSectionTitle.trim()) {
      toast.error("Section title is required");
      return;
    }

    setIsUpdatingSection(true);
    try {
      const result = await updateSection(admin, editingSectionId, {
        title: editSectionTitle.trim(),
      });

      if (result.success) {
        // Update local state immediately
        setSections((prev) =>
          prev.map((s) =>
            s.id === editingSectionId
              ? { ...s, title: editSectionTitle.trim() }
              : s
          )
        );

        toast.success("Section updated");
        setEditSectionOpen(false);
        setEditingSectionId("");
        setEditSectionTitle("");
        router.refresh();
      } else {
        toast.error("Failed to update section", { description: result.error });
      }
    } finally {
      setIsUpdatingSection(false);
    }
  }, [admin, editingSectionId, editSectionTitle, router]);

  // Group lessons into sections (from server data)
  const [sections, setSections] = useState<Section[]>(initialSections);

  const handleDeleteSection = useCallback(async (sectionId: string) => {
    if (sectionId === "default") {
      toast.error("Cannot delete the default section");
      return;
    }

    const result = await deleteSection(admin, sectionId);

    if (result.success) {
      // Remove from local state immediately
      setSections((prev) => {
        const section = prev.find((s) => s.id === sectionId);
        if (section && section.lessons.length > 0) {
          toast.error("Cannot delete section with lessons. Move lessons to another section first.");
          return prev;
        }
        toast.success("Section deleted");
        return prev.filter((s) => s.id !== sectionId);
      });
    } else {
      toast.error("Failed to delete section", { description: result.error });
    }
  }, [admin]);

  // Add Step Dialog state
  const [addStepOpen, setAddStepOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newStepTitle, setNewStepTitle] = useState("");
  const [newStepDescription, setNewStepDescription] = useState("");
  const [newStepType, setNewStepType] = useState<LessonType>("article");
  const [newStepDuration, setNewStepDuration] = useState(15);
  const [newStepSectionId, setNewStepSectionId] = useState<string>("");

  // Edit Step Dialog state
  const [editStepOpen, setEditStepOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<ModuleLesson | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editStepTitle, setEditStepTitle] = useState("");
  const [editStepDescription, setEditStepDescription] = useState("");
  const [editStepType, setEditStepType] = useState<LessonType>("article");
  const [editStepDuration, setEditStepDuration] = useState(15);

  const resetAddStepForm = useCallback((defaultSectionId?: string) => {
    setNewStepTitle("");
    setNewStepDescription("");
    setNewStepType("article");
    setNewStepDuration(15);
    setNewStepSectionId(defaultSectionId || (sections.length > 0 ? sections[0].id : ""));
  }, [sections]);

  const openAddStep = useCallback((sectionId: string) => {
    resetAddStepForm(sectionId);
    setAddStepOpen(true);
  }, [resetAddStepForm]);

  const openEditStep = useCallback((lesson: ModuleLesson) => {
    setEditingLesson(lesson);
    setEditStepTitle(lesson.title);
    setEditStepDescription(lesson.description ?? "");
    setEditStepType(lesson.lessonType);
    setEditStepDuration(lesson.durationMinutes);
    setEditStepOpen(true);
  }, []);

  const handleEditStep = useCallback(async () => {
    if (!editingLesson || !editStepTitle.trim()) {
      toast.error("Step title is required");
      return;
    }

    setIsUpdating(true);
    try {
      const result = await updateLesson(admin, editingLesson.id, {
        title: editStepTitle.trim(),
        description: editStepDescription.trim() || undefined,
        lessonType: editStepType,
        durationMinutes: editStepDuration,
      });

      if (result.success) {
        // Update local state immediately
        setLessons((prev) =>
          prev.map((lesson) =>
            lesson.id === editingLesson.id
              ? {
                  ...lesson,
                  title: editStepTitle.trim(),
                  description: editStepDescription.trim() || null,
                  lessonType: editStepType,
                  durationMinutes: editStepDuration,
                }
              : lesson
          )
        );

        toast.success("Step updated successfully");
        setEditStepOpen(false);
        setEditingLesson(null);
        
        // Also refresh to get server data
        router.refresh();
      } else {
        toast.error("Failed to update step", { description: result.error });
      }
    } finally {
      setIsUpdating(false);
    }
  }, [admin, editingLesson, editStepTitle, editStepDescription, editStepType, editStepDuration, router]);

  // Sync sections when lessons change (from router.refresh)
  useEffect(() => {
    setSections((prev) => {
      if (prev.length === 0) return prev;
      
      return prev.map((section, index) => {
        // For first section (index 0) OR default section, also show lessons with null sectionId
        const isFirstSection = index === 0 || section.id === "default";
        const matchingLessons = isFirstSection
          ? lessons.filter((l) => l.sectionId === null || l.sectionId === section.id)
          : lessons.filter((l) => l.sectionId === section.id);
        
        return {
          ...section,
          lessons: matchingLessons,
        };
      });
    });
  }, [lessons]);

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

      // Fetch lesson content based on type
      if (!lesson) return;

      if (lesson.lessonType === "article" || lesson.lessonType === "exercise") {
        // Load markdown content from material
        if (lesson.materialId) {
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
      } else if (lesson.lessonType === "video") {
        // Load video URL and notes
        if (lesson.materialId) {
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
      } else {
        // Quiz, Resource - load description if exists
        setEditorContent("");
      }
    },
    [lessons],
  );

  const handleAddStep = useCallback(async () => {
    if (!newStepTitle.trim()) {
      toast.error("Step title is required");
      return;
    }

    setIsCreating(true);
    try {
      const result = await createLesson(admin, {
        moduleId,
        title: newStepTitle.trim(),
        description: newStepDescription.trim() || undefined,
        lessonType: newStepType,
        durationMinutes: newStepDuration,
        isPreview: false,
        sectionId: (newStepSectionId && newStepSectionId !== "default") ? newStepSectionId : null,
      });

      if (result.success) {
        // Fetch the newly created lesson to get full data
        try {
          const { getLessonById } = await import("@/features/learning-module/actions/lessons");
          const newLesson = await getLessonById(result.id!);

          if (newLesson) {
            // Update local state immediately
            setLessons((prev) => [...prev, newLesson]);
          }
        } catch (fetchError) {
          console.error("[handleAddStep] Failed to fetch new lesson:", fetchError);
          // Still show success toast, router.refresh() will sync data
        }

        toast.success("Step created successfully");
        setAddStepOpen(false);
        resetAddStepForm();

        // Also refresh to ensure server data is in sync
        router.refresh();
      } else {
        console.error("[handleAddStep] createLesson failed:", result.error);
        toast.error("Failed to create step", { description: result.error });
      }
    } catch (error) {
      console.error("[handleAddStep] Unexpected error:", error);
      toast.error("Failed to create step", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsCreating(false);
    }
  }, [admin, moduleId, newStepTitle, newStepDescription, newStepType, newStepDuration, newStepSectionId, router, resetAddStepForm]);

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
        // Update local state immediately
        setLessons((prev) =>
          prev.map((lesson) =>
            lesson.id === lessonId ? { ...lesson, ...data } : lesson
          )
        );

        toast.success("Step updated");
      } else {
        toast.error("Failed to update step", { description: result.error });
      }
    },
    [admin],
  );

  const openDeleteConfirm = useCallback((lessonId: string) => {
    setLessonToDelete(lessonId);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!lessonToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteLesson(admin, lessonToDelete);

      if (result.success) {
        // Update local state immediately
        setLessons((prev) => prev.filter((l) => l.id !== lessonToDelete));
        
        // If deleted lesson was selected, select first available
        if (selectedLessonId === lessonToDelete) {
          setSelectedLessonId(null);
          setEditorContent("");
        }

        toast.success("Step deleted");
      } else {
        toast.error("Failed to delete step", { description: result.error });
      }

      setDeleteDialogOpen(false);
      setLessonToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  }, [admin, lessonToDelete, selectedLessonId]);

  const handleReorderLessons = useCallback(
    async (sectionId: string, lessonIds: string[]) => {
      // Update local state immediately for visual feedback
      setSections((prev) =>
        prev.map((section) => {
          if (section.id === sectionId) {
            // Reorder lessons based on new IDs
            const reorderedLessons = lessonIds
              .map((id) => section.lessons.find((l) => l.id === id))
              .filter((l): l is ModuleLesson => l !== undefined);
            return { ...section, lessons: reorderedLessons };
          }
          return section;
        })
      );

      // Then call API to persist
      const result = await reorderLessons(admin, moduleId, lessonIds);

      if (result.success) {
        toast.success("Steps reordered");
      } else {
        toast.error("Failed to reorder", { description: result.error });
        // Revert on error
        router.refresh();
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
          onAddStep={openAddStep}
          onEditStep={openEditStep}
          onLessonUpdate={handleLessonUpdate}
          onLessonDelete={openDeleteConfirm}
          onReorder={handleReorderLessons}
          onAddSection={openAddSection}
          onEditSection={openEditSection}
          onDeleteSection={handleDeleteSection}
        />

        {/* Editor Panel */}
        <EditorPanel
          lesson={selectedLesson}
          content={editorContent}
          onContentChange={setEditorContent}
          lastSaved={lastSaved}
          materials={materials}
          quizzes={quizzes}
          resources={resources}
          onQuizSelect={async (quizId) => {
            if (selectedLessonId) {
              await updateLesson(admin, selectedLessonId, {
                quizConfigId: quizId,
              });
              // Update local state
              setLessons((prev) =>
                prev.map((l) =>
                  l.id === selectedLessonId ? { ...l, quizConfigId: quizId } : l
                )
              );
              toast.success("Quiz linked to lesson");
            }
          }}
        />

        {/* Properties Panel */}
        <PropertiesPanel
          lesson={selectedLesson}
          onUpdate={handleLessonUpdate}
          onDelete={openDeleteConfirm}
          isOpen={propertiesOpen}
          onToggle={() => setPropertiesOpen(!propertiesOpen)}
          materials={materials}
          quizzes={quizzes}
          resources={resources}
        />
      </div>

      {/* Add Step Dialog */}
      <Dialog open={addStepOpen} onOpenChange={setAddStepOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Step</DialogTitle>
            <DialogDescription>
              Create a new lesson step in your module.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Step Title */}
            <div className="space-y-2">
              <Label htmlFor="step-title">Step Title</Label>
              <Input
                id="step-title"
                value={newStepTitle}
                onChange={(e) => setNewStepTitle(e.target.value)}
                placeholder="e.g., Introduction to Remote Work"
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="step-description">Description (Optional)</Label>
              <Textarea
                id="step-description"
                value={newStepDescription}
                onChange={(e) => setNewStepDescription(e.target.value)}
                placeholder="Brief description of this step..."
                rows={2}
              />
            </div>

            {/* Section Selector */}
            {sections.length > 1 && (
              <div className="space-y-2">
                <Label htmlFor="step-section">Section</Label>
                <Select
                  value={newStepSectionId}
                  onValueChange={setNewStepSectionId}
                >
                  <SelectTrigger id="step-section">
                    <SelectValue placeholder="Select a section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Lesson Type & Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="step-type">Lesson Type</Label>
                <Select
                  value={newStepType}
                  onValueChange={(v) => setNewStepType(v as LessonType)}
                >
                  <SelectTrigger id="step-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>Article</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="video">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        <span>Video</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="exercise">
                      <div className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        <span>Exercise</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="quiz">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4" />
                        <span>Quiz</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="resource">
                      <div className="flex items-center gap-2">
                        <FileBox className="h-4 w-4" />
                        <span>Resource</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="step-duration">Duration (min)</Label>
                <Input
                  id="step-duration"
                  type="number"
                  min={1}
                  max={120}
                  value={newStepDuration}
                  onChange={(e) =>
                    setNewStepDuration(parseInt(e.target.value) || 15)
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddStepOpen(false);
                resetAddStepForm();
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button onClick={handleAddStep} disabled={isCreating || !newStepTitle.trim()}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Step
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Step Dialog */}
      <Dialog open={editStepOpen} onOpenChange={setEditStepOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Step</DialogTitle>
            <DialogDescription>
              Update the lesson details.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Step Title */}
            <div className="space-y-2">
              <Label htmlFor="edit-step-title">Step Title</Label>
              <Input
                id="edit-step-title"
                value={editStepTitle}
                onChange={(e) => setEditStepTitle(e.target.value)}
                placeholder="e.g., Introduction to Remote Work"
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="edit-step-description">Description (Optional)</Label>
              <Textarea
                id="edit-step-description"
                value={editStepDescription}
                onChange={(e) => setEditStepDescription(e.target.value)}
                placeholder="Brief description of this step..."
                rows={2}
              />
            </div>

            {/* Lesson Type & Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-step-type">Lesson Type</Label>
                <Select
                  value={editStepType}
                  onValueChange={(v) => setEditStepType(v as LessonType)}
                >
                  <SelectTrigger id="edit-step-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>Article</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="video">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        <span>Video</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="exercise">
                      <div className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        <span>Exercise</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="quiz">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4" />
                        <span>Quiz</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="resource">
                      <div className="flex items-center gap-2">
                        <FileBox className="h-4 w-4" />
                        <span>Resource</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-step-duration">Duration (min)</Label>
                <Input
                  id="edit-step-duration"
                  type="number"
                  min={1}
                  max={120}
                  value={editStepDuration}
                  onChange={(e) =>
                    setEditStepDuration(parseInt(e.target.value) || 15)
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditStepOpen(false);
                setEditingLesson(null);
              }}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleEditStep} disabled={isUpdating || !editStepTitle.trim()}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Step
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <DialogTitle>Delete Step</DialogTitle>
                <DialogDescription>
                  This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this step? All content associated with it will be permanently removed.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setLessonToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Step
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Section Dialog */}
      <Dialog open={addSectionOpen} onOpenChange={setAddSectionOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Section</DialogTitle>
            <DialogDescription>
              Create a new section to organize your lessons.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="section-title">Section Title</Label>
              <Input
                id="section-title"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                placeholder="e.g., Advanced Topics, Final Project"
                autoFocus
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddSectionOpen(false)}
              disabled={isCreatingSection}
            >
              Cancel
            </Button>
            <Button onClick={handleAddSection} disabled={isCreatingSection || !newSectionTitle.trim()}>
              {isCreatingSection ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Section
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Section Dialog */}
      <Dialog open={editSectionOpen} onOpenChange={setEditSectionOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
            <DialogDescription>
              Rename this section to better organize your lessons.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-section-title">Section Title</Label>
              <Input
                id="edit-section-title"
                value={editSectionTitle}
                onChange={(e) => setEditSectionTitle(e.target.value)}
                placeholder="e.g., Advanced Topics"
                autoFocus
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditSectionOpen(false);
                setEditingSectionId("");
                setEditSectionTitle("");
              }}
              disabled={isUpdatingSection}
            >
              Cancel
            </Button>
            <Button onClick={handleEditSection} disabled={isUpdatingSection || !editSectionTitle.trim()}>
              {isUpdatingSection ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
