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
} from "lucide-react";
import type { ModuleLesson } from "@/features/learning-module/types/lesson";

// ─── Types ───────────────────────────────────────────────────

interface EditorPanelProps {
  lesson: ModuleLesson | null;
  content: string;
  onContentChange: (content: string) => void;
  lastSaved: string | null;
}

// ─── Component ───────────────────────────────────────────────

export function EditorPanel({
  lesson,
  content,
  onContentChange,
  lastSaved,
}: EditorPanelProps) {
  const handleToolbarCommand = (command: string) => {
    const textarea = document.getElementById("wysiwyg-editor") as HTMLTextAreaElement;
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
              Edit the content for this step. Changes are saved automatically.
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
      <div className="flex-1 overflow-y-auto px-12 py-10">
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
            placeholder="Start writing your lesson content here... Use Markdown for formatting."
          />
        </div>
      </div>
    </main>
  );
}
