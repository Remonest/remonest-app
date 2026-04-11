import { notFound } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  ChevronLeft,
  FileText,
  ExternalLink,
  Tag,
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

            <div className="space-y-4">
              {materials.map((m) => (
                <article
                  key={m.id}
                  className="rounded-lg border bg-card p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">
                        {m.title}
                      </h3>

                      {m.summary && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {m.summary}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground flex-wrap">
                        {m.source_type && (
                          <span className="capitalize">
                            {m.source_type === "article" ? "Artikel" : m.source_type}
                          </span>
                        )}
                        <span className="capitalize">{m.difficulty}</span>
                        {m.reading_time_minutes && (
                          <span>{m.reading_time_minutes} menit</span>
                        )}
                        <span>{m.language === "id" ? "🇮🇩" : "🇬🇧"}</span>
                        {m.tags && m.tags.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Tag className="size-3" />
                            {m.tags.slice(0, 3).join(", ")}
                          </span>
                        )}
                      </div>
                    </div>

                    {m.source_url && (
                      <a
                        href={m.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 no-underline shrink-0"
                      >
                        Sumber
                        <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>

                  {/* Material content */}
                  {m.content && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <div
                        className="text-sm text-muted-foreground space-y-2"
                        dangerouslySetInnerHTML={{
                          __html: wrapLists(renderMarkdown(m.content)),
                        }}
                      />
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
