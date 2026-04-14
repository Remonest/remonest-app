"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ModuleLesson } from "@/features/learning-module/types/lesson";
import type { LessonType } from "./builder-client";

// ─── Types ───────────────────────────────────────────────────

interface PropertiesPanelProps {
  lesson: ModuleLesson | null;
  onUpdate: (
    lessonId: string,
    data: {
      title?: string;
      description?: string;
      lessonType?: LessonType;
      durationMinutes?: number;
      isPreview?: boolean;
    }
  ) => void;
  onDelete?: (lessonId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  materials: { id: string; title: string }[];
  quizzes: { id: string; title: string }[];
  resources: { id: string; title: string; resource_type: string }[];
}

// ─── Component ───────────────────────────────────────────────

export function PropertiesPanel({
  lesson,
  onUpdate,
  onDelete,
  isOpen,
  onToggle,
  materials,
  quizzes,
  resources,
}: PropertiesPanelProps) {
  const [formTitle, setFormTitle] = useState(lesson?.title ?? "");
  const [formDuration, setFormDuration] = useState(
    lesson?.durationMinutes ?? 15
  );
  const [formPreview, setFormPreview] = useState(lesson?.isPreview ?? false);
  const [formRequired, setFormRequired] = useState(true);
  const [formAllowComments, setFormAllowComments] = useState(false);

  // Update form when lesson changes (FIXED: useEffect instead of useState)
  useEffect(() => {
    if (lesson) {
      setFormTitle(lesson.title);
      setFormDuration(lesson.durationMinutes);
      setFormPreview(lesson.isPreview);
    }
  }, [lesson]);

  if (!lesson) {
    return (
      <aside className="w-72 shrink-0 border-l border-border bg-[#fafafa] flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b border-border">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          Step Settings
        </div>
        <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
          Select a step to view settings
        </div>
      </aside>
    );
  }

  const handleSave = () => {
    onUpdate(lesson.id, {
      title: formTitle,
      durationMinutes: formDuration,
      isPreview: formPreview,
    });
  };

  const handleDelete = () => {
    onDelete?.(lesson.id);
  };

  return (
    <aside className="w-72 shrink-0 border-l border-border bg-[#fafafa] flex flex-col overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          Step Settings
        </span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggle}>
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Properties Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Step Title */}
        <div>
          <Label className="text-sm font-semibold mb-1.5 block">Step Title</Label>
          <Input
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            onBlur={handleSave}
            className="h-9"
          />
        </div>

        {/* Estimated Time */}
        <div>
          <Label className="text-sm font-semibold mb-1.5 block">Estimated Time</Label>
          <p className="text-xs text-muted-foreground mb-3">
            How long should this take to complete?
          </p>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min={0}
              value={formDuration}
              onChange={(e) => setFormDuration(parseInt(e.target.value) || 0)}
              onBlur={handleSave}
              className="h-9 w-20"
            />
            <span className="text-sm text-muted-foreground">minutes</span>
          </div>
        </div>

        {/* Content Access */}
        <div>
          <Label className="text-sm font-semibold mb-1.5 block">Content Access</Label>
          <p className="text-xs text-muted-foreground mb-3">
            Who can view this step?
          </p>
          <Select defaultValue={lesson.isPreview ? "preview" : "enrolled"}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select access level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="enrolled">Enrolled Students Only</SelectItem>
              <SelectItem value="preview">Free Preview (Public)</SelectItem>
              <SelectItem value="locked">
                Locked (Requires prerequisites)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-border" />

        {/* Required Step Toggle */}
        <div className="flex items-start justify-between">
          <div>
            <span className="text-sm font-semibold">Required Step</span>
            <p className="text-xs text-muted-foreground mt-0.5">
              Must complete to progress
            </p>
          </div>
          <Switch
            checked={formRequired}
            onCheckedChange={setFormRequired}
          />
        </div>

        {/* Allow Comments Toggle */}
        <div className="flex items-start justify-between">
          <div>
            <span className="text-sm font-semibold">Allow Comments</span>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enable discussion board
            </p>
          </div>
          <Switch
            checked={formAllowComments}
            onCheckedChange={setFormAllowComments}
          />
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-border" />

        {/* Delete Step Button */}
        <Button
          variant="outline"
          className="w-full text-destructive border-red-200 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:hover:bg-red-900/30 gap-2"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
          Delete Step
        </Button>
      </div>
    </aside>
  );
}
