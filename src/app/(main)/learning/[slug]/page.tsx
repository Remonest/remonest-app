import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  ChevronLeft,
  FileText,
  ExternalLink,
  Tag,
  Play,
  Download,
  Video,
  File,
  Image as ImageIcon,
  CheckCircle2,
  PlayCircle,
  Star,
  Users,
} from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  getLearningModuleBySlug,
  getPublishedMaterialsForModule,
  getLessonsForModule,
  getRelatedModules,
} from "@/features/learning-module/actions/fetch-learning";
import {
  enrollUserInModule,
  getUserModuleProgress,
  getUserEnrollments,
} from "@/features/learning-module/actions/enrollment";
import {
  getModuleReviews,
  submitReview,
  getUserReview,
} from "@/features/learning-module/actions/reviews";
import {
  LEARNING_CATEGORY_LABELS,
  LEARNING_CATEGORY_COLORS,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
} from "@/features/learning-module/types/learning";
import { SAMPLE_QUIZ_DATA } from "@/features/learning-module/components/QuizPreview";
import PDFCanvasViewer from "@/features/learning-module/components/PDFCanvasViewer";
import EnrollButton from "@/features/learning-module/components/EnrollButton";
import ModuleHero from "@/features/learning-module/components/ModuleHero";
import CurriculumStepper from "@/features/learning-module/components/CurriculumStepper";
import { QuizPreview } from "@/features/learning-module/components/QuizPreview";
import { CertificatePreview } from "@/features/learning-module/components/CertificatePreview";
import ModuleCatalog from "@/features/learning-module/components/ModuleCatalog";
import { getModuleQuizzes } from "@/features/learning-module/actions/quiz-actions";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Simple Markdown → HTML renderer
function renderMarkdown(md: string): string {
  return (
    md
      // Code blocks
      .replace(
        /```([\s\S]*?)```/g,
        '<pre class="bg-muted rounded-md p-4 my-4 overflow-x-auto text-sm font-mono"><code>$1</code></pre>',
      )
      // Inline code
      .replace(
        /`([^`]+)`/g,
        '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>',
      )
      // H2
      .replace(
        /^## (.+)$/gm,
        '<h2 class="text-xl font-semibold mt-10 mb-4 text-foreground">$1</h2>',
      )
      // H3
      .replace(
        /^### (.+)$/gm,
        '<h3 class="text-lg font-medium mt-8 mb-3 text-foreground">$1</h3>',
      )
      // H4
      .replace(
        /^#### (.+)$/gm,
        '<h4 class="text-base font-medium mt-6 mb-2 text-foreground">$1</h4>',
      )
      // Bold + italic list items: - **term** — definition
      .replace(
        /^- \*\*(.+?)\*\*\s*[—-]\s*(.+)$/gm,
        '<li class="text-muted-foreground mb-2"><strong class="text-foreground">$1</strong> — $2</li>',
      )
      // Bold list items: - **item**
      .replace(
        /^- \*\*(.+?)\*\*$/gm,
        '<li class="text-muted-foreground mb-1"><strong class="text-foreground">$1</strong></li>',
      )
      // Regular list items
      .replace(/^- (.+)$/gm, '<li class="text-muted-foreground mb-1">$1</li>')
      // Numbered list items
      .replace(
        /^(\d+)\. (.+)$/gm,
        '<li class="text-muted-foreground mb-1" style="list-style-type:decimal">$2</li>',
      )
      // Tables: header row
      .replace(/^\|(.+?)\|$/gm, (match, content) => {
        const cells = content.split("|").map((c: string) => c.trim());
        if (cells.every((c: string) => /^[-]+$/.test(c))) return "";
        return `<div class="flex gap-4 py-2 border-b border-border/50">${cells.map((c: string) => `<span class="flex-1 text-sm text-muted-foreground">${c}</span>`).join("")}</div>`;
      })
      // Horizontal rule
      .replace(/^---$/gm, '<hr class="my-8 border-border/50" />')
      // Paragraphs (non-empty lines)
      .replace(
        /^(?!<[a-z])((?!<).+)$/gm,
        '<p class="text-muted-foreground leading-relaxed mb-2">$1</p>',
      )
  );
}

// Wrap list items in <ul>
function wrapLists(html: string): string {
  return html.replace(
    /(<li[^>]*>.*?<\/li>(?:\n|$))+/g,
    '<ul class="list-disc list-inside space-y-1 mb-4 ml-4">$&</ul>',
  );
}

export default async function ModuleDetailPage({ params }: PageProps) {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const { slug } = await params;
    redirect(`/login?next=/learning/${slug}`);
  }

  const { slug } = await params;
  const mod = await getLearningModuleBySlug(slug);

  if (!mod) {
    notFound();
  }

  // Fetch all data in parallel
  const [
    materials,
    lessons,
    relatedMods,
    enrollments,
    reviews,
    userReview,
    quizzes,
  ] = await Promise.all([
    getPublishedMaterialsForModule(mod.id),
    getLessonsForModule(mod.id),
    getRelatedModules(mod.id, mod.category, 6),
    getUserEnrollments(),
    getModuleReviews(mod.id),
    getUserReview(mod.id),
    getModuleQuizzes(mod.id),
  ]);

  const hasPublishedQuiz = quizzes.some((q) => q.isPublished);

  // Auto-enroll on first visit
  await enrollUserInModule(mod.id);

  // Get current progress
  const progressRecord = await getUserModuleProgress(mod.id);
  const progress = progressRecord?.progress ?? 0;
  const isCompleted = progressRecord?.completedAt != null;
  const isInProgress = progress > 0 && !isCompleted;

  // Enrollment state
  const userEnrollment = enrollments.find((e) => e.moduleId === mod.id);
  const enrollmentState: "not_enrolled" | "enrolled" | "completed" = isCompleted
    ? "completed"
    : userEnrollment
      ? "enrolled"
      : "not_enrolled";

  const categoryLabel = LEARNING_CATEGORY_LABELS[mod.category] || mod.category;
  const categoryColor =
    LEARNING_CATEGORY_COLORS[mod.category] || "bg-gray-100 text-gray-700";
  const difficultyLabel =
    DIFFICULTY_LABELS[mod.difficultyLevel] || mod.difficultyLevel;
  const difficultyColor =
    DIFFICULTY_COLORS[mod.difficultyLevel] || "bg-gray-100 text-gray-700";

  // Format enrollment count
  const formatEnrollment = (count: number) => {
    if (count >= 1000)
      return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}rb+ Terdaftar`;
    return `${count}+ Terdaftar`;
  };

  // Format rating
  const ratingDisplay =
    mod.averageRating > 0
      ? `${mod.averageRating.toFixed(1)} (${reviews.length} ulasan)`
      : "Belum ada ulasan";

  // Build learning outcomes from module description
  const outcomes = [
    "Memahami prinsip dasar komunikasi remote yang efektif",
    "Menerapkan praktik terbaik async di tim Anda",
    "Mengurangi ketergantungan pada meeting sinkron",
    "Membangun dokumentasi yang jelas dan terstruktur",
  ];

  // Build includes list
  const includes = [
    { icon: "monitor-play", text: `${mod.durationMin} jam video on-demand` },
    {
      icon: "file-text",
      text: `${materials.length} artikel & template detail`,
    },
    { icon: "award", text: "Sertifikat penyelesaian" },
    { icon: "infinity", text: "Akses seumur hidup" },
  ];

  // Completed lesson IDs (for now, all enrolled users have progress)
  const completedLessonIds: string[] =
    isInProgress || isCompleted
      ? lessons
          .slice(0, Math.floor((progress / 100) * lessons.length))
          .map((l) => l.id)
      : [];

  // User progress map for catalog
  const userProgressMap: Record<string, number> = {};
  enrollments.forEach((e) => {
    userProgressMap[e.moduleId] = e.progress;
  });

  // Extract video lessons for curriculum
  const videoLessons = lessons.filter((l) => l.lessonType === "video");
  const totalVideoHours = videoLessons.reduce(
    (acc, l) => acc + l.durationMinutes,
    0,
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section
        id="module-hero"
        className="border-b bg-gradient-to-b from-card to-background"
      >
        <div className="mx-auto w-full max-w-[1200px] px-4 md:px-8">
          <div className="grid grid-cols-1 gap-8 py-12 lg:grid-cols-[1fr_400px] lg:items-start lg:gap-16">
            {/* Left Content */}
            <div>
              {/* Breadcrumb */}
              <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/learning" className="hover:text-foreground">
                  Learning
                </Link>
                <ChevronLeft className="h-4 w-4 rotate-180" />
                <Link href="/learning" className="hover:text-foreground">
                  {categoryLabel}
                </Link>
                <ChevronLeft className="h-4 w-4 rotate-180" />
                <span className="text-foreground">{mod.title}</span>
              </nav>

              {/* Badges */}
              <div className="mb-4 flex items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${categoryColor}`}
                >
                  {categoryLabel}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${difficultyColor}`}
                >
                  {difficultyLabel}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl">
                {mod.title}
              </h1>

              {/* Meta */}
              <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Clock className="h-[18px] w-[18px]" />
                  {mod.durationMin > 0 ? `${mod.durationMin} Menit` : "—"}
                </span>
                <span className="flex items-center gap-2">
                  <FileText className="h-[18px] w-[18px]" />
                  {lessons.length > 0
                    ? `${lessons.length} Pelajaran`
                    : `${materials.length} Materi`}
                </span>
                <span className="flex items-center gap-2">
                  <Star
                    className="h-[18px] w-[18px]"
                    style={{ color: "#eab308" }}
                  />
                  {ratingDisplay}
                </span>
                <Link
                  href={`/learning/${mod.slug}/enrolled`}
                  className="flex items-center gap-2 hover:text-foreground transition-colors"
                >
                  <Users className="h-[18px] w-[18px]" />
                  {formatEnrollment(mod.enrollmentCount)}
                </Link>
              </div>

              {/* Description */}
              {mod.description && (
                <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                  {mod.description}
                </p>
              )}

              {/* Learning Outcomes */}
              <div className="mt-8 rounded-xl border bg-card p-6">
                <h3 className="mb-5 text-lg font-bold">
                  Yang Akan Anda Pelajari
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {outcomes.map((outcome, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-[18px] w-[18px] shrink-0 text-emerald-500" />
                      <span className="text-sm text-card-foreground">
                        {outcome}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sticky Card - Enrollment */}
            <div className="lg:sticky lg:top-28">
              <div className="overflow-hidden rounded-xl border bg-card shadow-lg">
                {/* Thumbnail */}
                {mod.thumbnailUrl ? (
                  <img
                    src={mod.thumbnailUrl}
                    alt={mod.title}
                    className="aspect-video w-full border-b object-cover"
                  />
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center border-b bg-muted">
                    <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}

                <div className="flex flex-col gap-6 p-6">
                  {/* Price */}
                  <div>
                    <span className="text-2xl font-extrabold text-foreground">
                      Free
                    </span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      untuk member Remonest
                    </span>
                  </div>

                  {/* Enroll Button */}
                  <EnrollButton
                    moduleId={mod.id}
                    moduleTitle={mod.title}
                    moduleSlug={mod.slug}
                    progress={progress}
                    isCompleted={isCompleted}
                    materialsCount={materials.length}
                    hasQuiz={hasPublishedQuiz}
                  />

                  {/* Includes */}
                  <div className="text-sm font-semibold">
                    Modul ini mencakup:
                  </div>
                  <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                    {includes.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <FileText className="h-4 w-4 shrink-0" />
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum & Features Section */}
      <section id="module-content" className="py-16">
        <div className="mx-auto w-full max-w-[1200px] px-4 md:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_400px] lg:items-start">
            {/* Left Col: Curriculum Timeline */}
            <div>
              <h2 className="mb-6 text-2xl font-bold">Kurikulum & Timeline</h2>

              {lessons.length > 0 ? (
                <CurriculumStepper
                  lessons={lessons}
                  activeLessonId={undefined}
                  completedLessonIds={completedLessonIds}
                />
              ) : (
                <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
                  <FileText className="mx-auto mb-3 h-10 w-10 opacity-50" />
                  <p className="text-sm">
                    Materi pembelajaran akan segera tersedia
                  </p>
                </div>
              )}

              {/* Module Content (Markdown) */}
              {mod.content && (
                <div className="prose prose-neutral dark:prose-invert mt-12 max-w-none">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: wrapLists(renderMarkdown(mod.content)),
                    }}
                  />
                </div>
              )}

              {/* Materials Section */}
              {materials.length > 0 && (
                <div data-materials className="mt-12 border-t pt-8">
                  <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-foreground">
                    <FileText className="h-5 w-5" />
                    Materi Pembelajaran
                  </h2>
                  <div className="space-y-6">
                    {materials.map((m) => (
                      <MaterialCard key={m.id} material={m} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Col: Quiz & Certificate Preview */}
            <div className="flex flex-col gap-6">
              {/* Quiz Preview */}
              <QuizPreview
                moduleSlug={mod.slug}
                question={SAMPLE_QUIZ_DATA.question}
                options={SAMPLE_QUIZ_DATA.options}
                passingGrade={70}
                totalQuestions={10}
              />

              {/* Certificate Preview */}
              <CertificatePreview
                userName={user.email?.split("@")[0] || "Peserta"}
                moduleTitle={mod.title}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Related Modules Catalog */}
      {relatedMods.length > 0 && (
        <section id="catalog-section" className="border-t bg-secondary">
          <div className="mx-auto w-full max-w-[1200px] px-4 md:px-8 py-16">
            <ModuleCatalog
              modules={relatedMods}
              userProgress={userProgressMap}
              category={categoryLabel}
              viewAllHref="/learning"
            />
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Material Card (reused from original) ─────────────────────

function MaterialCard({
  material,
}: {
  material: {
    id: string;
    title: string;
    content: string | null;
    summary: string | null;
    source_url: string | null;
    source_type: string | null;
    file_url: string | null;
    difficulty: string;
    language: string;
    reading_time_minutes: number | null;
    tags: string[] | null;
  };
}) {
  const isVideo = material.source_type === "video";
  const hasContent = !!material.content;
  const hasFile = !!material.file_url;

  const isImageFile =
    hasFile && /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(material.file_url!);
  const isPdfFile = hasFile && /\.(pdf)(\?.*)?$/i.test(material.file_url!);

  const embedUrl = isVideo ? extractVideoEmbedUrl(material.source_url) : null;

  const showFile = hasFile && !isVideo;

  return (
    <article className="overflow-hidden rounded-lg border bg-card">
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              {isVideo ? (
                <Video className="size-4 shrink-0 text-red-500" />
              ) : isPdfFile ? (
                <FileText className="size-4 shrink-0 text-red-500" />
              ) : isImageFile ? (
                <ImageIcon className="size-4 shrink-0 text-blue-500" />
              ) : (
                <File className="size-4 shrink-0 text-blue-500" />
              )}
              <h3 className="font-medium text-foreground">{material.title}</h3>
            </div>

            {material.summary && (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {material.summary}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {material.source_type && (
                <span className="capitalize">
                  {material.source_type === "article"
                    ? "Artikel"
                    : material.source_type === "video"
                      ? "Video"
                      : material.source_type === "documentation"
                        ? "Dokumentasi"
                        : material.source_type === "tutorial"
                          ? "Tutorial"
                          : material.source_type}
                </span>
              )}
              {isPdfFile && (
                <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  PDF
                </span>
              )}
              {isImageFile && (
                <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  Gambar
                </span>
              )}
              <span className="capitalize">{material.difficulty}</span>
              {material.reading_time_minutes && (
                <span>{material.reading_time_minutes} menit</span>
              )}
              <span>{material.language === "id" ? "🇮🇩" : "🇬🇧"}</span>
              {material.tags && material.tags.length > 0 && (
                <span className="flex items-center gap-1">
                  <Tag className="size-3" />
                  {material.tags.slice(0, 3).join(", ")}
                </span>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {material.source_url && (
              <a
                href={material.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground no-underline transition-opacity hover:opacity-90"
              >
                {isVideo ? (
                  <>
                    <Play className="size-3" />
                    Tonton
                  </>
                ) : isDownloadable(material.source_url) ? (
                  <>
                    <Download className="size-3" />
                    Unduh
                  </>
                ) : (
                  <>
                    <ExternalLink className="size-3" />
                    Sumber
                  </>
                )}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* File Preview */}
      {showFile && (
        <div className="border-t border-border/50">
          {isImageFile && (
            <div
              className="relative select-none bg-muted/20 p-4"
              onContextMenu={(e) => e.preventDefault()}
            >
              <img
                src={material.file_url!}
                alt={material.title}
                className="mx-auto max-h-[600px] w-full rounded-lg object-contain"
                draggable={false}
              />
              <div
                className="absolute inset-0 cursor-default"
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                style={{ userSelect: "none", WebkitUserSelect: "none" }}
              />
            </div>
          )}

          {isPdfFile && (
            <div className="border-t border-border/50">
              <PDFCanvasViewer
                fileUrl={material.file_url!}
                title={material.title}
              />
            </div>
          )}

          {!isImageFile && !isPdfFile && (
            <div className="flex items-center justify-center p-8 text-center text-muted-foreground">
              <div>
                <File className="mx-auto mb-3 size-12 opacity-50" />
                <p className="text-sm">Preview tidak tersedia</p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  File hanya dapat dilihat oleh admin
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Video Embed */}
      {isVideo && embedUrl && (
        <div className="border-t border-border/50">
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={embedUrl}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Markdown Content */}
      {hasContent && !isVideo && (
        <div className="border-t border-border/50 p-5 pt-4">
          <div
            className="space-y-2 text-sm text-muted-foreground"
            dangerouslySetInnerHTML={{
              __html: wrapLists(renderMarkdown(material.content!)),
            }}
          />
        </div>
      )}
    </article>
  );
}

function extractVideoEmbedUrl(url: string | null): string | null {
  if (!url) return null;

  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
  );
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  const gdriveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (gdriveMatch) {
    return `https://drive.google.com/file/d/${gdriveMatch[1]}/preview`;
  }

  return null;
}

function isDownloadable(url: string): boolean {
  return /\.(pdf|docx?|xlsx?|pptx?|zip|rar|png|jpg|jpeg)$/i.test(url);
}
