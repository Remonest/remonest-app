"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  CheckCircle2,
  CircleDot,
  Lock,
  FileText,
  PlayCircle,
  File,
  HelpCircle,
  Download,
  ExternalLink,
  Clock,
  ArrowLeft,
  ArrowRight,
  CloudOff,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { markLessonCompleted, unmarkLessonCompleted } from "@/features/learning-module/actions/lesson-progress";
import PDFCanvasViewer from "@/features/learning-module/components/PDFCanvasViewer";
import type { LearningModule } from "@/features/learning-module/types/learning";
import type { ModuleLesson } from "@/features/learning-module/types/lesson";
import type { LearningMaterial } from "@/features/learning-module/types/materials";

interface LearningPlayerClientProps {
  module: LearningModule;
  lessons: ModuleLesson[];
  materials: LearningMaterial[];
  completedLessonIds: string[];
  progress: { progress: number; completed_at: string | null } | null;
  activeLessonId: string;
}

type LessonType = "article" | "video" | "exercise" | "quiz" | "resource";

export default function LearningPlayerClient({
  module,
  lessons,
  materials,
  completedLessonIds,
  progress,
  activeLessonId: initialActiveLessonId,
}: LearningPlayerClientProps) {
  const router = useRouter();
  const [activeLessonId, setActiveLessonId] = useState(initialActiveLessonId);
  const [isLessonCompleted, setIsLessonCompleted] = useState(
    completedLessonIds.includes(initialActiveLessonId),
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const activeLesson = lessons.find((l) => l.id === activeLessonId);
  const activeIndex = lessons.findIndex((l) => l.id === activeLessonId);
  const currentProgress = progress?.progress || 0;
  const isModuleCompleted = progress?.completed_at !== null;

  // Calculate step display
  const stepDisplay = `Step ${activeIndex + 1} of ${lessons.length}`;

  // Get material for active lesson — also fall back to matching by lesson type if materialId is null
  const activeMaterial = useMemo(() => {
    if (!activeLesson) return null;
    if (activeLesson.materialId) {
      return materials.find((m) => m.id === activeLesson.materialId) ?? null;
    }
    // Fallback: find first material matching lesson type
    if (activeLesson.lessonType === "video") {
      return materials.find((m) => m.source_type === "video" || m.source_url) ?? null;
    }
    if (activeLesson.lessonType === "article" || activeLesson.lessonType === "exercise") {
      return materials.find((m) => m.content) ?? null;
    }
    return null;
  }, [activeLesson, materials]);

  // Sync completion state when active lesson changes
  useEffect(() => {
    setIsLessonCompleted(completedLessonIds.includes(activeLessonId));
  }, [activeLessonId, completedLessonIds]);

  // Handle lesson completion toggle
  const handleToggleComplete = async () => {
    if (!activeLesson) return;

    setIsProcessing(true);
    try {
      if (isLessonCompleted) {
        const result = await unmarkLessonCompleted(activeLesson.id, module.id);
        if (result.success) {
          setIsLessonCompleted(false);
          toast.success("Pelajaran ditandai belum selesai");
          router.refresh();
        } else {
          toast.error(result.error || "Gagal memperbarui status");
        }
      } else {
        const result = await markLessonCompleted(activeLesson.id, module.id);
        if (result.success) {
          setIsLessonCompleted(true);
          toast.success("Pelajaran ditandai selesai! 🎉");
          router.refresh();
        } else {
          toast.error(result.error || "Gagal menandai selesai");
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Navigate to previous lesson
  const goToPrevious = () => {
    if (activeIndex > 0) {
      const prevLesson = lessons[activeIndex - 1];
      setActiveLessonId(prevLesson.id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Navigate to next lesson
  const goToNext = () => {
    if (activeIndex < lessons.length - 1) {
      const nextLesson = lessons[activeIndex + 1];
      setActiveLessonId(nextLesson.id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Get lesson type icon
  const getLessonTypeIcon = (type: LessonType) => {
    switch (type) {
      case "video":
        return <PlayCircle className="h-4 w-4" />;
      case "quiz":
        return <HelpCircle className="h-4 w-4" />;
      case "resource":
        return <File className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Get lesson type label
  const getLessonTypeLabel = (type: LessonType) => {
    switch (type) {
      case "video":
        return "Video";
      case "quiz":
        return "Quiz";
      case "resource":
        return "Resource";
      case "exercise":
        return "Exercise";
      default:
        return "Article";
    }
  };

  // Render video embed
  const renderVideoEmbed = (url: string | null) => {
    if (!url) return null;

    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (ytMatch) {
      return (
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden my-6">
          <iframe
            src={`https://www.youtube.com/embed/${ytMatch[1]}`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return (
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden my-6">
          <iframe
            src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    // Google Drive
    const gdriveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    if (gdriveMatch) {
      return (
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden my-6">
          <iframe
            src={`https://drive.google.com/file/d/${gdriveMatch[1]}/preview`}
            className="absolute inset-0 w-full h-full"
            allow="autoplay"
            allowFullScreen
          />
        </div>
      );
    }

    // Direct video URL (MP4, WebM, OGG, etc.)
    const isDirectVideo = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url) || url.includes("/api/learning/file/");
    if (isDirectVideo) {
      return (
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden my-6">
          <video
            src={url}
            controls
            className="absolute inset-0 w-full h-full object-contain"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    return null;
  };

  // Render material content
  const renderMaterialContent = () => {
    if (!activeMaterial) return null;

    const lessonType = activeLesson?.lessonType;
    const isPdf = activeMaterial.file_url?.toLowerCase().endsWith(".pdf");
    const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(activeMaterial.file_url || "");

    // Video lesson: show embed + optional notes
    if (lessonType === "video") {
      return (
        <div className="space-y-6">
          {activeMaterial.source_url
            ? renderVideoEmbed(activeMaterial.source_url)
            : (
              <div className="flex items-center justify-center aspect-video bg-muted rounded-lg">
                <p className="text-muted-foreground text-sm">No video URL set for this lesson.</p>
              </div>
            )
          }
          {activeMaterial.content && (
            <div dangerouslySetInnerHTML={{ __html: renderMarkdown(activeMaterial.content) }} />
          )}
        </div>
      );
    }

    // Article / exercise lesson: show markdown content
    if (lessonType === "article" || lessonType === "exercise") {
      return (
        <div className="space-y-6">
          {isPdf && activeMaterial.file_url && (
            <div className="border rounded-lg overflow-hidden">
              <PDFCanvasViewer fileUrl={activeMaterial.file_url} title={activeMaterial.title} />
            </div>
          )}
          {isImage && activeMaterial.file_url && (
            <div className="border rounded-lg overflow-hidden bg-muted/20 p-4">
              <img src={activeMaterial.file_url} alt={activeMaterial.title} className="max-h-[600px] w-full object-contain mx-auto" />
            </div>
          )}
          {activeMaterial.content ? (
            <div dangerouslySetInnerHTML={{ __html: renderMarkdown(activeMaterial.content) }} />
          ) : (
            <p className="text-muted-foreground text-sm">No content added yet.</p>
          )}
        </div>
      );
    }

    // Resource lesson: show file/link
    if (lessonType === "resource") {
      return (
        <div className="space-y-6">
          {isPdf && activeMaterial.file_url && (
            <div className="border rounded-lg overflow-hidden">
              <PDFCanvasViewer fileUrl={activeMaterial.file_url} title={activeMaterial.title} />
            </div>
          )}
          {activeMaterial.source_url && (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
              <div>
                <h4 className="font-medium">Resource</h4>
                <p className="text-sm text-muted-foreground mt-1 break-all">{activeMaterial.source_url}</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <a href={activeMaterial.source_url} target="_blank" rel="noopener noreferrer" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Open
                </a>
              </Button>
            </div>
          )}
          {activeMaterial.content && (
            <div dangerouslySetInnerHTML={{ __html: renderMarkdown(activeMaterial.content) }} />
          )}
        </div>
      );
    }

    return null;
  };

  // Simple markdown renderer
  const renderMarkdown = (md: string): string => {
    return md
      // Code blocks (must be first)
      .replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre class="bg-muted rounded-md p-4 my-4 overflow-x-auto text-sm font-mono"><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
      // H1
      .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
      // H2
      .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')
      // H3
      .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
      // Blockquote
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-border pl-4 text-muted-foreground my-4">$1</blockquote>')
      // Unordered lists
      .replace(/^- (.+)$/gm, '<li class="ml-6 list-disc mb-1">$1</li>')
      // Ordered lists
      .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-6 list-decimal mb-1">$2</li>')
      // Horizontal rule
      .replace(/^---$/gm, '<hr class="my-6 border-border" />')
      // Links
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline">$1</a>')
      // Paragraphs (lines not already wrapped in HTML tags)
      .replace(/^(?!<[a-zA-Z/])((?!^\s*$).+)$/gm, '<p class="mb-4 leading-relaxed">$1</p>');
  };

  if (!activeLesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading lesson...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Header */}
      <header className="h-16 border-b bg-background sticky top-0 z-40 px-4 md:px-8">
        <div className="h-full flex items-center justify-between">
          {/* Left: Breadcrumbs / Mobile menu */}
          <div className="flex items-center gap-2 flex-1">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Desktop breadcrumbs */}
            <div className="hidden lg:flex items-center gap-2 text-sm">
              <Link
                href={`/learning/${module.slug}`}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                {module.title}
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="font-semibold text-foreground">{stepDisplay}</span>
            </div>

            {/* Mobile step indicator */}
            <span className="lg:hidden text-sm font-semibold">
              {stepDisplay}
            </span>
          </div>

          {/* Center: Progress */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-secondary rounded-full">
            <div className="relative w-5 h-5">
              <svg width="20" height="20" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted" />
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeDasharray="50.2"
                  strokeDashoffset={50.2 - (50.2 * currentProgress) / 100}
                  strokeLinecap="round"
                  transform="rotate(-90 10 10)"
                  className="text-green-500"
                />
              </svg>
            </div>
            <span className="text-sm font-bold">{currentProgress}% Complete</span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            {/* Desktop complete toggle */}
            <label className="hidden lg:flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isLessonCompleted}
                onChange={handleToggleComplete}
                disabled={isProcessing}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                isLessonCompleted
                  ? "bg-green-500 border-green-500 text-white"
                  : "border-border bg-background"
              }`}>
                {isLessonCompleted && <Check className="h-3 w-3" />}
              </div>
              <span className="text-sm font-medium">
                {isLessonCompleted ? "Completed" : "Mark as Complete"}
              </span>
            </label>

            {/* Back to module button */}
            <Button asChild variant="outline" size="sm" className="hidden lg:flex">
              <Link href={`/learning/${module.slug}`}>Back to Module</Link>
            </Button>

            {/* Mobile close button */}
            <Button asChild variant="ghost" size="sm" className="lg:hidden">
              <Link href={`/learning/${module.slug}`}>
                <X className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Lesson Navigation */}
        <aside
          className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-80 border-r bg-card overflow-y-auto z-50 transition-transform lg:z-30 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="p-4 border-b bg-background sticky top-0 z-10 flex items-center justify-between">
            <h3 className="font-bold text-sm">Module Contents</h3>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-2">
            {lessons.map((lesson, index) => {
              const isCompleted = completedLessonIds.includes(lesson.id);
              const isActive = lesson.id === activeLessonId;
              const isLocked = index > 0 && !completedLessonIds.includes(lessons[index - 1].id);

              return (
                <button
                  key={lesson.id}
                  onClick={() => {
                    if (!isLocked) {
                      setActiveLessonId(lesson.id);
                      setIsSidebarOpen(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  disabled={isLocked}
                  className={`w-full text-left p-3 rounded-lg border-b border-border/50 transition-colors ${
                    isActive ? "bg-secondary" : "hover:bg-muted/50"
                  } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : isActive ? (
                        <CircleDot className="h-5 w-5 text-primary" />
                      ) : isLocked ? (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-muted" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-medium line-clamp-2 ${
                          isActive ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {index + 1}. {lesson.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                          {getLessonTypeIcon(lesson.lessonType as LessonType)}
                          {getLessonTypeLabel(lesson.lessonType as LessonType)}
                        </span>
                        {lesson.durationMinutes > 0 && (
                          <span className="text-[10px] text-muted-foreground">
                            {lesson.durationMinutes}m
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
            {/* Lesson header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Clock className="h-4 w-4" />
                <span>Est. {activeLesson.durationMinutes || 10} mins</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{activeLesson.title}</h1>
              {activeLesson.description && (
                <p className="text-lg text-muted-foreground">{activeLesson.description}</p>
              )}
            </div>

            {/* DEBUG PANEL - remove after fixing */}
            <details className="mb-6 border border-yellow-400 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-xs">
              <summary className="p-3 font-mono font-bold cursor-pointer text-yellow-800 dark:text-yellow-300">🐛 Debug Info (click to expand)</summary>
              <pre className="p-3 overflow-auto text-yellow-900 dark:text-yellow-200 whitespace-pre-wrap break-all">
{JSON.stringify({
  lessonId: activeLesson.id,
  lessonType: activeLesson.lessonType,
  materialId: activeLesson.materialId,
  activeMaterial: activeMaterial ? {
    id: activeMaterial.id,
    source_type: activeMaterial.source_type,
    source_url: activeMaterial.source_url,
    file_url: activeMaterial.file_url,
    content_length: activeMaterial.content?.length ?? 0,
    content_preview: activeMaterial.content?.slice(0, 100),
    is_published: activeMaterial.is_published,
    matched_via: activeLesson?.materialId ? "materialId" : "fallback",
  } : null,
  totalMaterials: materials.length,
  materialIds: materials.map(m => m.id),
}, null, 2)}
              </pre>
            </details>

            {/* Lesson content */}
            {activeMaterial ? (
              renderMaterialContent()
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-muted/30">
                <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-40" />
                <p className="text-muted-foreground text-sm">
                  No content has been added to this lesson yet.
                </p>
              </div>
            )}

            {/* Lesson completion indicator */}
            {activeLesson.lessonType !== "quiz" && (
              <div className="mt-12 pt-8 border-t text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 mb-4">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {isLessonCompleted
                    ? "You've completed this step"
                    : "You've reached the end of this step"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {isLessonCompleted
                    ? "Great progress! Continue to the next step."
                    : "Mark it as complete to track your progress."}
                </p>
                {!isLessonCompleted && (
                  <Button
                    onClick={handleToggleComplete}
                    disabled={isProcessing}
                    className="gap-2"
                  >
                    {isProcessing ? (
                      "Processing..."
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Mark as Complete
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

            {/* Quiz lesson */}
            {activeLesson.lessonType === "quiz" && activeLesson.quizConfigId && (
              <div className="mt-8 pt-8 border-t">
                <div className="text-center p-8 border rounded-lg bg-card">
                  <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Knowledge Check</h3>
                  <p className="text-muted-foreground mb-6">
                    Test your understanding of the material with this quiz.
                  </p>
                  <Button asChild className="gap-2">
                    <Link href={`/learning/${module.slug}/quiz`}>
                      Start Quiz
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Footer - Navigation */}
      <footer className="h-18 border-t bg-background sticky bottom-0 z-40 px-4 md:px-8">
        <div className="h-full flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goToPrevious}
            disabled={activeIndex === 0}
            className="gap-2 min-w-[140px] justify-center"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden md:inline">Previous</span>
            <span className="md:hidden">Back</span>
          </Button>

          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <CloudOff className="h-4 w-4" />
            All progress saved
          </div>

          <Button
            onClick={goToNext}
            disabled={activeIndex === lessons.length - 1}
            className="gap-2 min-w-[140px] justify-center"
          >
            <span className="hidden md:inline">Next</span>
            <span className="md:hidden">Next</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
