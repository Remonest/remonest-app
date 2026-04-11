import { notFound } from "next/navigation";
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
} from "lucide-react";
import { getLearningModuleBySlug, getPublishedMaterialsForModule } from "@/features/learning-module/actions/fetch-learning";
import { LEARNING_CATEGORY_LABELS, LEARNING_CATEGORY_COLORS } from "@/features/learning-module/types/learning";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Simple Markdown → HTML renderer
function renderMarkdown(md: string): string {
  return md
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted rounded-md p-4 my-4 overflow-x-auto text-sm font-mono"><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    // H2
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-10 mb-4 text-foreground">$1</h2>')
    // H3
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-medium mt-8 mb-3 text-foreground">$1</h3>')
    // H4
    .replace(/^#### (.+)$/gm, '<h4 class="text-base font-medium mt-6 mb-2 text-foreground">$1</h4>')
    // Bold + italic list items: - **term** — definition
    .replace(/^- \*\*(.+?)\*\*\s*[—-]\s*(.+)$/gm, '<li class="text-muted-foreground mb-2"><strong class="text-foreground">$1</strong> — $2</li>')
    // Bold list items: - **item**
    .replace(/^- \*\*(.+?)\*\*$/gm, '<li class="text-muted-foreground mb-1"><strong class="text-foreground">$1</strong></li>')
    // Regular list items
    .replace(/^- (.+)$/gm, '<li class="text-muted-foreground mb-1">$1</li>')
    // Numbered list items
    .replace(/^(\d+)\. (.+)$/gm, '<li class="text-muted-foreground mb-1" style="list-style-type:decimal">$2</li>')
    // Tables: header row
    .replace(/^\|(.+?)\|$/gm, (match, content) => {
      const cells = content.split('|').map((c: string) => c.trim());
      if (cells.every((c: string) => /^[-]+$/.test(c))) return '';
      return `<div class="flex gap-4 py-2 border-b border-border/50">${cells.map((c: string) => `<span class="flex-1 text-sm text-muted-foreground">${c}</span>`).join('')}</div>`;
    })
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="my-8 border-border/50" />')
    // Paragraphs (non-empty lines)
    .replace(/^(?!<[a-z])((?!<).+)$/gm, '<p class="text-muted-foreground leading-relaxed mb-2">$1</p>');
}

// Wrap list items in <ul>
function wrapLists(html: string): string {
  return html.replace(/(<li[^>]*>.*?<\/li>(?:\n|$))+/g, '<ul class="list-disc list-inside space-y-1 mb-4 ml-4">$&</ul>');
}

export default async function ModuleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const mod = await getLearningModuleBySlug(slug);
  const materials = mod ? await getPublishedMaterialsForModule(mod.id) : [];

  if (!mod) {
    notFound();
  }

  const categoryLabel = LEARNING_CATEGORY_LABELS[mod.category] || mod.category;
  const categoryColor = LEARNING_CATEGORY_COLORS[mod.category] || "bg-gray-100 text-gray-700";

  return (
    <div className="py-8">
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8">
        {/* Back link */}
        <Link
          href="/learning"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 no-underline transition-colors"
        >
          <ChevronLeft className="size-4" />
          Kembali ke Katalog
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <BookOpen className="size-5" />
            </div>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${categoryColor}`}
            >
              {categoryLabel}
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {mod.title}
          </h1>

          {mod.description && (
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {mod.description}
            </p>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-6 mt-5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" />
              {mod.durationMin > 0 ? `${mod.durationMin} menit` : "—"}
            </span>
            {materials.length > 0 && (
              <span className="flex items-center gap-1.5">
                <FileText className="size-4" />
                {materials.length} materi
              </span>
            )}
          </div>
        </div>

        {/* Module content */}
        {mod.content && (
          <div className="prose prose-neutral dark:prose-invert max-w-none mb-12">
            <div
              dangerouslySetInnerHTML={{
                __html: wrapLists(renderMarkdown(mod.content)),
              }}
            />
          </div>
        )}

        {/* Materials section */}
        {materials.length > 0 && (
          <div className="mt-12 border-t pt-8">
            <h2 className="text-xl font-semibold mb-6 text-foreground flex items-center gap-2">
              <FileText className="size-5" />
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
    </div>
  );
}

// ─── Material Card with Read / Video / Download ──────────────

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

  // Detect file type from proxy URL
  const isImageFile =
    hasFile && /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(material.file_url!);
  const isPdfFile =
    hasFile && /\.(pdf)(\?.*)?$/i.test(material.file_url!);

  // Extract video embed URL
  const embedUrl = isVideo
    ? extractVideoEmbedUrl(material.source_url)
    : null;

  // Primary display: uploaded file takes priority over markdown content
  const showFile = hasFile && !isVideo;

  return (
    <article className="rounded-lg border bg-card overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {isVideo ? (
                <Video className="size-4 text-red-500 shrink-0" />
              ) : isPdfFile ? (
                <FileText className="size-4 text-red-500 shrink-0" />
              ) : isImageFile ? (
                <ImageIcon className="size-4 text-blue-500 shrink-0" />
              ) : (
                <File className="size-4 text-blue-500 shrink-0" />
              )}
              <h3 className="font-medium text-foreground">{material.title}</h3>
            </div>

            {material.summary && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {material.summary}
              </p>
            )}

            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground flex-wrap">
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
                <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-medium">
                  PDF
                </span>
              )}
              {isImageFile && (
                <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-medium">
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

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {material.source_url && (
              <a
                href={material.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 no-underline"
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

      {/* ===== FILE PREVIEW ===== */}
      {showFile && (
        <div className="border-t border-border/50">
          {/* Image display */}
          {isImageFile && (
            <div className="p-4 bg-muted/20">
              <img
                src={material.file_url!}
                alt={material.title}
                className="w-full rounded-lg max-h-[600px] object-contain mx-auto"
              />
            </div>
          )}

          {/* PDF viewer - read only via proxy (no Supabase URL exposed) */}
          {isPdfFile && (
            <div className="relative">
              <iframe
                src={material.file_url!}
                className="w-full h-[600px] border-0"
                title={material.title}
              />
              <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-2 rounded-md bg-muted/90 backdrop-blur text-xs text-muted-foreground">
                <FileText className="size-3" />
                Baca saja — unduh tidak tersedia
              </div>
            </div>
          )}

          {/* Generic file (no preview) */}
          {!isImageFile && !isPdfFile && (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              <div className="text-center">
                <File className="size-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Preview tidak tersedia</p>
                <a
                  href={material.file_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-2 text-xs text-blue-600 hover:underline"
                >
                  <Download className="size-3" />
                  Unduh file
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== VIDEO EMBED ===== */}
      {isVideo && embedUrl && (
        <div className="border-t border-border/50">
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* ===== MARKDOWN CONTENT ===== */}
      {hasContent && !isVideo && (
        <div className="border-t border-border/50 p-5 pt-4">
          <div
            className="text-sm text-muted-foreground space-y-2"
            dangerouslySetInnerHTML={{
              __html: wrapLists(renderMarkdown(material.content!)),
            }}
          />
        </div>
      )}
    </article>
  );
}

// Extract embeddable video URL from source
function extractVideoEmbedUrl(url: string | null): string | null {
  if (!url) return null;

  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/
  );
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // Google Drive
  const gdriveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (gdriveMatch) {
    return `https://drive.google.com/file/d/${gdriveMatch[1]}/preview`;
  }

  return null;
}

// Check if URL points to a downloadable file
function isDownloadable(url: string): boolean {
  return /\.(pdf|docx?|xlsx?|pptx?|zip|rar|png|jpg|jpeg)$/i.test(url);
}
