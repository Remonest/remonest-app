"use client";

import { useState, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Quote,
  List,
  ListOrdered,
  Link,
  Image,
  Code,
  Undo2,
  Redo2,
  FileText,
  CheckCircle2,
  Video,
  FileBox,
  HelpCircle,
  Play,
  ExternalLink,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ModuleLesson } from "@/features/learning-module/types/lesson";

// ─── Types ───────────────────────────────────────────────────

interface EditorPanelProps {
  lesson: ModuleLesson | null;
  content: string;
  onContentChange: (content: string) => void;
  lastSaved: string | null;
  materials: { id: string; title: string }[];
  quizzes: { id: string; title: string }[];
  resources: { id: string; title: string; resource_type: string }[];
  onQuizSelect?: (quizId: string) => void;
  initialVideoUrl?: string;
  onVideoUrlChange?: (url: string) => void;
  onMaterialLink?: (materialId: string) => void;
}

// ─── Component ───────────────────────────────────────────────

export function EditorPanel({
  lesson,
  content,
  onContentChange,
  lastSaved,
  materials,
  quizzes,
  resources,
  onQuizSelect,
  initialVideoUrl = "",
  onVideoUrlChange,
  onMaterialLink,
}: EditorPanelProps) {
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
  const [selectedQuizId, setSelectedQuizId] = useState(
    lesson?.quizConfigId ?? "",
  );
  const [selectedResourceId, setSelectedResourceId] = useState("");

  // Sync selectedQuizId when lesson changes
  useEffect(() => {
    if (lesson?.quizConfigId) {
      setSelectedQuizId(lesson.quizConfigId);
    }
  }, [lesson]);

  // Sync videoUrl when lesson changes
  useEffect(() => {
    setVideoUrl(initialVideoUrl ?? "");
  }, [initialVideoUrl]);

  const handleQuizSelect = (quizId: string) => {
    setSelectedQuizId(quizId);
    onQuizSelect?.(quizId);
  };

  const handleToolbarCommand = (command: string) => {
    const textarea = document.getElementById(
      "wysiwyg-editor",
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let replacement = "";

    switch (command) {
      case "bold":
        replacement = `**${selectedText || "bold text"}**`;
        break;
      case "italic":
        replacement = `*${selectedText || "italic text"}*`;
        break;
      case "underline":
        replacement = `<u>${selectedText || "underlined text"}</u>`;
        break;
      case "h1":
        replacement = `\n# ${selectedText || "Heading 1"}\n`;
        break;
      case "h2":
        replacement = `\n## ${selectedText || "Heading 2"}\n`;
        break;
      case "quote":
        replacement = `\n> ${selectedText || "Quote"}\n`;
        break;
      case "ul":
        replacement = `\n- ${selectedText || "List item"}\n`;
        break;
      case "ol":
        replacement = `\n1. ${selectedText || "List item"}\n`;
        break;
      case "link":
        replacement = `[${selectedText || "link text"}](url)`;
        break;
      case "image":
        replacement = `![${selectedText || "alt text"}](image-url)`;
        break;
      case "code":
        replacement = `\`\`\`\n${selectedText || "code block"}\n\`\`\``;
        break;
      default:
        return;
    }

    const newContent =
      content.substring(0, start) + replacement + content.substring(end);
    onContentChange(newContent);
  };

  if (!lesson) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center bg-card text-muted-foreground">
        <FileText className="mb-4 h-16 w-16 opacity-30" />
        <p className="text-lg font-medium">Select a step to start editing</p>
        <p className="text-sm">Choose a lesson from the curriculum panel</p>
      </main>
    );
  }

  // ─── Render Different UI Based on Lesson Type ────────────

  const renderEditor = () => {
    switch (lesson.lessonType) {
      case "article":
        return renderArticleEditor();
      case "video":
        return renderVideoEditor();
      case "exercise":
        return renderExerciseEditor();
      case "quiz":
        return renderQuizEditor();
      case "resource":
        return renderResourceEditor();
      default:
        return renderArticleEditor();
    }
  };

  // ─── Article Editor ───────────────────────────────────

  const renderArticleEditor = () => (
    <div className="mx-auto max-w-3xl">
      {/* WYSIWYG Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-1 rounded-t-lg border border-border bg-[#fafafa] px-3 py-2">
        <button
          onClick={() => handleToolbarCommand("bold")}
          className="flex h-8 w-8 items-center justify-center rounded hover:bg-secondary"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          onClick={() => handleToolbarCommand("italic")}
          className="flex h-8 w-8 items-center justify-center rounded hover:bg-secondary"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          onClick={() => handleToolbarCommand("underline")}
          className="flex h-8 w-8 items-center justify-center rounded hover:bg-secondary"
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-border" />

        <button
          onClick={() => handleToolbarCommand("h1")}
          className="flex h-8 w-8 items-center justify-center rounded hover:bg-secondary"
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </button>
        <button
          onClick={() => handleToolbarCommand("h2")}
          className="flex h-8 w-8 items-center justify-center rounded hover:bg-secondary"
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => handleToolbarCommand("quote")}
          className="flex h-8 w-8 items-center justify-center rounded hover:bg-secondary"
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-border" />

        <button
          onClick={() => handleToolbarCommand("ul")}
          className="flex h-8 w-8 items-center justify-center rounded hover:bg-secondary"
          title="Bulleted List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          onClick={() => handleToolbarCommand("ol")}
          className="flex h-8 w-8 items-center justify-center rounded hover:bg-secondary"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-border" />

        <button
          onClick={() => handleToolbarCommand("link")}
          className="flex h-8 w-8 items-center justify-center rounded hover:bg-secondary"
          title="Link"
        >
          <Link className="h-4 w-4" />
        </button>
        <button
          onClick={() => handleToolbarCommand("image")}
          className="flex h-8 w-8 items-center justify-center rounded hover:bg-secondary"
          title="Image"
        >
          <Image className="h-4 w-4" />
        </button>
        <button
          onClick={() => handleToolbarCommand("code")}
          className="flex h-8 w-8 items-center justify-center rounded hover:bg-secondary"
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </button>

        <div className="flex-1" />

        <button
          onClick={() => document.execCommand("undo")}
          className="flex h-8 w-8 items-center justify-center rounded hover:bg-secondary"
          title="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => document.execCommand("redo")}
          className="flex h-8 w-8 items-center justify-center rounded hover:bg-secondary"
          title="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </div>

      {/* Editor Area */}
      <textarea
        id="wysiwyg-editor"
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        className="min-h-[500px] w-full rounded-b-lg border border-border p-8 text-[15px] leading-relaxed text-[#27272a] outline-none resize-y bg-card"
        placeholder="Start writing your article content here... Use Markdown for formatting."
      />
    </div>
  );

  // ─── Video Editor ──────────────────────────────────────

  const renderVideoEditor = () => (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Link existing published material */}
      {materials.length > 0 && (
        <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
          <Label>Link Published Material (from Materials page)</Label>
          <Select
            value={lesson?.materialId ?? ""}
            onValueChange={(val) => onMaterialLink?.(val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an existing material..." />
            </SelectTrigger>
            <SelectContent>
              {materials.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Link a material you created on the Materials page. Its video URL and content will be used in the player.
          </p>
        </div>
      )}

      <div className="relative flex items-center gap-2">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">or enter URL directly</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="video-url">Video URL</Label>
        <Input
          id="video-url"
          value={videoUrl}
          onChange={(e) => {
            setVideoUrl(e.target.value);
            onVideoUrlChange?.(e.target.value);
          }}
          placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
        />
        <p className="text-xs text-muted-foreground">
          Enter a YouTube or Vimeo URL. The video will be embedded in the
          lesson.
        </p>
      </div>

      {/* Video Preview */}
      {videoUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
          {videoUrl.includes("youtube") || videoUrl.includes("youtu.be") ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Video className="mx-auto mb-2 h-12 w-12 opacity-30" />
                <p className="text-sm">YouTube video preview</p>
              </div>
            </div>
          ) : videoUrl.includes("vimeo") ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Play className="mx-auto mb-2 h-12 w-12 opacity-30" />
                <p className="text-sm">Vimeo video preview</p>
              </div>
            </div>
          ) : (
            <video
              key={videoUrl} // 🔥 important: prevents play/pause race issues
              src={videoUrl}
              controls
              className="h-full w-full object-cover"
              onError={() => console.error("Invalid video source")}
            />
          )}
        </div>
      )}

      {/* Additional Notes */}
      <div className="space-y-2">
        <Label htmlFor="video-notes">Additional Notes (Optional)</Label>
        <Textarea
          id="video-notes"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Add any notes or instructions for students..."
          className="min-h-[150px]"
        />
      </div>
    </div>
  );

  // ─── Exercise Editor ───────────────────────────────────

  const renderExerciseEditor = () => (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Exercise Instructions */}
      <div className="space-y-2">
        <Label htmlFor="exercise-instructions">Instructions</Label>
        <Textarea
          id="exercise-instructions"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Describe what the student needs to do..."
          className="min-h-[200px] resize-y"
        />
        <p className="text-xs text-muted-foreground">
          Provide clear instructions for this exercise.
        </p>
      </div>

      {/* Starter Code (optional) */}
      <div className="space-y-2">
        <Label htmlFor="starter-code">Starter Code (Optional)</Label>
        <Textarea
          id="starter-code"
          placeholder="```javascript\n// Student starter code here\n```"
          className="min-h-[150px] resize-y font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Provide starter code for students to build upon.
        </p>
      </div>

      {/* Expected Outcome */}
      <div className="space-y-2">
        <Label htmlFor="expected-outcome">Expected Outcome (Optional)</Label>
        <Textarea
          id="expected-outcome"
          placeholder="Describe what the final result should look like..."
          className="min-h-[100px]"
        />
      </div>
    </div>
  );

  // ─── Quiz Editor ───────────────────────────────────────

  const renderQuizEditor = () => (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Select Existing Quiz */}
      <div className="space-y-2">
        <Label>Select Quiz</Label>
        {quizzes.length > 0 ? (
          <Select value={selectedQuizId} onValueChange={handleQuizSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an existing quiz..." />
            </SelectTrigger>
            <SelectContent>
              {quizzes.map((quiz) => (
                <SelectItem key={quiz.id} value={quiz.id}>
                  {quiz.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="rounded-lg border border-border bg-muted p-6 text-center">
            <HelpCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No quizzes available yet.
            </p>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Select an existing quiz or create a new one.
        </p>
      </div>

      {/* Create New Quiz Button */}
      <div className="rounded-lg border border-dashed border-border p-6 text-center">
        <HelpCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
        <p className="mb-3 text-sm text-muted-foreground">
          Need a new quiz for this step?
        </p>
        <Button variant="outline" className="gap-2" asChild>
          <a
            href={`/admin/learning/${lesson?.moduleId}/quiz`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4" />
            Open Quiz Builder
          </a>
        </Button>
      </div>

      {/* Quiz Notes */}
      <div className="space-y-2">
        <Label htmlFor="quiz-notes">Notes (Optional)</Label>
        <Textarea
          id="quiz-notes"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Add instructions or tips for students before they take the quiz..."
          className="min-h-[100px]"
        />
      </div>
    </div>
  );

  // ─── Resource Editor ───────────────────────────────────

  const renderResourceEditor = () => (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Upload New Resource */}
      <div className="rounded-lg border border-dashed border-border p-8 text-center">
        <Upload className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <h3 className="mb-1 text-sm font-medium">Upload Resource File</h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Upload a PDF, template, checklist, or other file for students to
          download.
        </p>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Upload File
        </Button>
      </div>

      {/* Or Select Existing Resource */}
      <div className="space-y-2">
        <Label>Or Select Existing Resource</Label>
        {resources.length > 0 ? (
          <Select
            value={selectedResourceId}
            onValueChange={setSelectedResourceId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a resource..." />
            </SelectTrigger>
            <SelectContent>
              {resources.map((resource) => (
                <SelectItem key={resource.id} value={resource.id}>
                  {resource.title} ({resource.resource_type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="rounded-lg border border-border bg-muted p-6 text-center">
            <FileBox className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No resources available yet.
            </p>
          </div>
        )}
      </div>

      {/* Resource Description */}
      <div className="space-y-2">
        <Label htmlFor="resource-description">Description (Optional)</Label>
        <Textarea
          id="resource-description"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Describe what this resource contains and when students should use it..."
          className="min-h-[100px]"
        />
      </div>
    </div>
  );

  // ─── Main Render ───────────────────────────────────────

  return (
    <main className="flex flex-1 flex-col bg-card min-w-0 overflow-hidden">
      {/* Editor Header */}
      <div className="border-b border-border px-12 pt-10 pb-0">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1.5">
              {lesson.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {lesson.lessonType === "article" &&
                "Edit the article content. Changes are saved automatically."}
              {lesson.lessonType === "video" &&
                "Add a video URL and optional notes."}
              {lesson.lessonType === "exercise" &&
                "Provide exercise instructions and starter code."}
              {lesson.lessonType === "quiz" &&
                "Link an existing quiz or create a new one."}
              {lesson.lessonType === "resource" &&
                "Upload or link a downloadable resource."}
            </p>
          </div>

          {lastSaved && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              Saved {lastSaved}
            </div>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto px-12 py-10">{renderEditor()}</div>
    </main>
  );
}
