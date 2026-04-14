"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Plus,
  GripVertical,
  Play,
  FileText,
  Code,
  ClipboardCheck,
  FolderOpen,
  Pencil,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
} from "@/features/learning-module/actions/lessons";
import type {
  ModuleLesson,
  LessonType,
} from "@/features/learning-module/types/lesson";
import { requireAdmin } from "@/lib/admin/require-admin";
import type { AdminUser } from "@/lib/admin/require-admin";

// ─── Types ───────────────────────────────────────────────────

interface AdminLessonsPageProps {
  moduleId: string;
  moduleTitle: string;
  lessons: ModuleLesson[];
  admin: AdminUser;
  materials: { id: string; title: string }[];
  quizzes: { id: string; title: string }[];
}

const LESSON_TYPE_CONFIG: Record<
  LessonType,
  { label: string; icon: React.ElementType; color: string }
> = {
  video: { label: "Video", icon: Play, color: "text-blue-500" },
  article: { label: "Article", icon: FileText, color: "text-violet-500" },
  exercise: { label: "Exercise", icon: Code, color: "text-amber-500" },
  quiz: { label: "Quiz", icon: ClipboardCheck, color: "text-rose-500" },
  resource: { label: "Resource", icon: FolderOpen, color: "text-teal-500" },
};

// ─── Component ───────────────────────────────────────────────

export default function AdminLessonsPage({
  moduleId,
  moduleTitle,
  lessons: initialLessons,
  admin,
  materials,
  quizzes,
}: AdminLessonsPageProps) {
  const router = useRouter();
  const [lessons, setLessons] = useState(initialLessons);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<ModuleLesson | null>(null);
  const [isPending, setIsPending] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formLessonType, setFormLessonType] = useState<LessonType>("article");
  const [formDuration, setFormDuration] = useState(15);
  const [formPreview, setFormPreview] = useState(false);
  const [formMaterialId, setFormMaterialId] = useState("");
  const [formQuizId, setFormQuizId] = useState("");

  const resetForm = () => {
    setFormTitle("");
    setFormDescription("");
    setFormLessonType("article");
    setFormDuration(15);
    setFormPreview(false);
    setFormMaterialId("");
    setFormQuizId("");
    setEditingLesson(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (lesson: ModuleLesson) => {
    setEditingLesson(lesson);
    setFormTitle(lesson.title);
    setFormDescription(lesson.description ?? "");
    setFormLessonType(lesson.lessonType);
    setFormDuration(lesson.durationMinutes);
    setFormPreview(lesson.isPreview);
    setFormMaterialId(lesson.materialId ?? "");
    setFormQuizId(lesson.quizConfigId ?? "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsPending(true);

    try {
      const input = {
        moduleId,
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        lessonType: formLessonType,
        durationMinutes: formDuration,
        isPreview: formPreview,
        materialId: formMaterialId || null,
        quizConfigId: formQuizId || null,
      };

      let result;
      if (editingLesson) {
        result = await updateLesson(admin, editingLesson.id, input);
      } else {
        result = await createLesson(admin, input);
      }

      if (result.success) {
        toast.success(editingLesson ? "Lesson updated" : "Lesson created");
        setDialogOpen(false);
        resetForm();
        router.refresh();
      } else {
        toast.error("Failed", { description: result.error });
      }
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsPending(true);
    try {
      const result = await deleteLesson(admin, id);
      if (result.success) {
        toast.success("Lesson deleted");
        router.refresh();
      } else {
        toast.error("Failed", { description: result.error });
      }
    } finally {
      setIsPending(false);
    }
  };

  const togglePreview = async (lesson: ModuleLesson) => {
    setIsPending(true);
    try {
      await updateLesson(admin, lesson.id, { isPreview: !lesson.isPreview });
      toast.success(`Preview ${lesson.isPreview ? "disabled" : "enabled"}`);
      router.refresh();
    } finally {
      setIsPending(false);
    }
  };

  const moveLesson = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= lessons.length) return;

    const newLessons = [...lessons];
    [newLessons[index], newLessons[targetIndex]] = [
      newLessons[targetIndex],
      newLessons[index],
    ];

    // Update order indices
    const updatedLessons = newLessons.map((l, i) => ({ ...l, orderIndex: i }));
    setLessons(updatedLessons);

    setIsPending(true);
    try {
      const result = await reorderLessons(
        admin,
        moduleId,
        updatedLessons.map((l) => l.id),
      );
      if (result.success) {
        router.refresh();
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div>
      {/* Header without breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Lessons Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Order and manage the learning steps for this module.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Lesson
        </Button>
      </div>

      {/* Lessons List */}
      <div className="rounded-xl border bg-card">
        {lessons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <FileText className="mb-3 h-10 w-10 opacity-50" />
            <p className="text-sm">No lessons yet</p>
            <p className="text-xs">
              Click &quot;Add Lesson&quot; to get started.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {lessons.map((lesson, index) => {
              const config = LESSON_TYPE_CONFIG[lesson.lessonType];
              const Icon = config.icon;

              return (
                <div
                  key={lesson.id}
                  className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/20"
                >
                  {/* Order */}
                  <div className="flex flex-col items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground"
                      disabled={isPending}
                    >
                      <GripVertical className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Step number */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary ${config.color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold">
                        {lesson.title}
                      </span>
                      <Badge variant="outline" className="text-[11px]">
                        {config.label}
                      </Badge>
                      {lesson.isPreview && (
                        <Badge
                          variant="secondary"
                          className="text-[11px] bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        >
                          Preview
                        </Badge>
                      )}
                    </div>
                    {lesson.description && (
                      <p className="truncate text-xs text-muted-foreground">
                        {lesson.description}
                      </p>
                    )}
                  </div>

                  {/* Duration */}
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {lesson.durationMinutes} min
                  </span>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title={
                        lesson.isPreview ? "Disable preview" : "Enable preview"
                      }
                      onClick={() => togglePreview(lesson)}
                      disabled={isPending}
                    >
                      {lesson.isPreview ? (
                        <Eye className="h-4 w-4 text-blue-500" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(lesson)}
                      disabled={isPending}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDelete(lesson.id)}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? "Edit Lesson" : "Add Lesson"}
            </DialogTitle>
            <DialogDescription>
              {editingLesson
                ? "Update the lesson details."
                : "Add a new step to the learning module."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="mb-3">Title</Label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Lesson title"
              />
            </div>

            <div>
              <Label className="mb-3">Description</Label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Brief description (optional)"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-3">Type</Label>
                <Select
                  value={formLessonType}
                  onValueChange={(v) => setFormLessonType(v as LessonType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LESSON_TYPE_CONFIG).map(([key, cfg]) => (
                      <SelectItem key={key} value={key}>
                        {cfg.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-3">Duration (min)</Label>
                <Input
                  type="number"
                  min={0}
                  value={formDuration}
                  onChange={(e) =>
                    setFormDuration(parseInt(e.target.value) || 0)
                  }
                />
              </div>
            </div>

            {formLessonType === "article" && materials.length > 0 && (
              <div>
                <Label className="mb-3">Link to Material</Label>
                <Select
                  value={formMaterialId}
                  onValueChange={setFormMaterialId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a material" />
                  </SelectTrigger>
                  <SelectContent>
                    {materials.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formLessonType === "quiz" && quizzes.length > 0 && (
              <div>
                <Label>Link to Quiz</Label>
                <Select value={formQuizId} onValueChange={setFormQuizId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a quiz" />
                  </SelectTrigger>
                  <SelectContent>
                    {quizzes.map((q) => (
                      <SelectItem key={q.id} value={q.id}>
                        {q.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Switch
                checked={formPreview}
                onCheckedChange={setFormPreview}
                id="preview-toggle"
              />
              <Label htmlFor="preview-toggle">Free preview for visitors</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                resetForm();
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : editingLesson ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
