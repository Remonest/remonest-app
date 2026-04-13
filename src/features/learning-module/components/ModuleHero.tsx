import {
  Clock,
  FileText,
  Star,
  Users,
  CheckCircle2,
  Video,
  Award,
  InfinityIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  LEARNING_CATEGORY_LABELS,
  LEARNING_CATEGORY_COLORS,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  type ModuleDifficulty,
  type LearningCategory,
} from "@/features/learning-module/types/learning";

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------

function formatEnrollment(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M siswa`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K siswa`;
  return `${count} siswa`;
}

function renderStars(rating: number): React.ReactNode {
  const clamped = Math.min(Math.max(rating, 0), 5);
  const full = Math.floor(clamped);
  const hasHalf = clamped - full >= 0.25 && clamped - full < 0.75;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${clamped.toFixed(1)} dari 5 bintang`}>
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f-${i}`} className="size-4 fill-amber-400 text-amber-400" />
      ))}
      {hasHalf && (
        <Star key="half" className="size-4 fill-amber-400/50 text-amber-400" />
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e-${i}`} className="size-4 text-muted-foreground/40" />
      ))}
    </span>
  );
}

// ---------------------------------------------------------------
// Props
// ---------------------------------------------------------------

interface ModuleHeroProps {
  module: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    category: string;
    difficultyLevel: string;
    thumbnailUrl: string | null;
    durationMin: number;
    enrollmentCount: number;
    averageRating: number;
  };
  lessonCount: number;
  outcomes: string[];
  includes: { icon: string; text: string }[];
  enrollmentState: "not_enrolled" | "enrolled" | "completed";
  progress: number;
  onEnroll: () => void;
}

// ---------------------------------------------------------------
// Component (Server-friendly — no "use client")
// ---------------------------------------------------------------

export default function ModuleHero({
  module,
  lessonCount,
  outcomes,
  includes,
  enrollmentState,
  progress,
  onEnroll,
}: ModuleHeroProps) {
  const categoryLabel =
    LEARNING_CATEGORY_LABELS[module.category as LearningCategory] ??
    module.category;
  const categoryColor =
    LEARNING_CATEGORY_COLORS[module.category as LearningCategory] ??
    "bg-gray-100 text-gray-700";

  const difficultyLabel =
    DIFFICULTY_LABELS[module.difficultyLevel as ModuleDifficulty] ??
    module.difficultyLevel;
  const difficultyColor =
    DIFFICULTY_COLORS[module.difficultyLevel as ModuleDifficulty] ??
    "bg-gray-100 text-gray-700";

  const buttonConfig = {
    not_enrolled: {
      label: "Enroll Now",
      className:
        "w-full inline-flex items-center justify-center gap-2 h-10 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors",
    },
    enrolled: {
      label: progress > 0 ? "Lanjutkan" : "Mulai Belajar",
      className:
        "w-full inline-flex items-center justify-center gap-2 h-10 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors",
    },
    completed: {
      label: "Selesai",
      className:
        "w-full inline-flex items-center justify-center gap-2 h-10 rounded-lg bg-emerald-600 text-white font-medium text-sm cursor-default",
    },
  }[enrollmentState];

  const defaultIncludes = [
    { icon: "video", text: `${Math.round(module.durationMin / 60)}+ jam video` },
    { icon: "article", text: `${lessonCount} materi pembelajaran` },
    { icon: "certificate", text: "Sertifikat kelulusan" },
    { icon: "access", text: "Akses selamanya" },
  ];

  const displayIncludes = includes.length > 0 ? includes : defaultIncludes;

  const iconMap: Record<string, React.ReactNode> = {
    video: <Video className="size-4 text-muted-foreground" />,
    article: <FileText className="size-4 text-muted-foreground" />,
    certificate: <Award className="size-4 text-muted-foreground" />,
    access: <InfinityIcon className="size-4 text-muted-foreground" />,
  };

  return (
    <section className="py-8">
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
          <a href="/learning" className="no-underline hover:text-foreground transition-colors">
            Learning
          </a>
          <span className="text-muted-foreground/50">/</span>
          <span className="no-underline hover:text-foreground transition-colors">
            {categoryLabel}
          </span>
          <span className="text-muted-foreground/50">/</span>
          <span className="text-foreground font-medium truncate">
            {module.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 lg:gap-12">
          {/* ── Left column ─────────────────────────────── */}
          <div className="flex flex-col gap-6">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={cn("text-xs", categoryColor)}>
                {categoryLabel}
              </Badge>
              <Badge variant="outline" className={cn("text-xs", difficultyColor)}>
                {difficultyLabel}
              </Badge>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              {module.title}
            </h1>

            {/* Meta info */}
            <div className="flex items-center gap-5 text-sm text-muted-foreground flex-wrap">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4" />
                {module.durationMin > 0 ? `${module.durationMin} menit` : "—"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FileText className="size-4" />
                {lessonCount} materi
              </span>
              <span className="inline-flex items-center gap-1.5">
                {renderStars(module.averageRating)}
                <span className="ml-0.5 text-muted-foreground">
                  ({module.averageRating.toFixed(1)})
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-4" />
                {formatEnrollment(module.enrollmentCount)}
              </span>
            </div>

            {/* Description */}
            {module.description && (
              <p className="text-muted-foreground leading-relaxed text-base">
                {module.description}
              </p>
            )}

            {/* Learning outcomes */}
            {outcomes.length > 0 && (
              <div className="mt-2">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Yang akan kamu pelajari
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {outcomes.map((outcome, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="size-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right column — sticky enrollment card ───── */}
          <div className="lg:order-2">
            <div
              className="sticky top-[104px] rounded-xl border bg-card p-5 shadow-sm"
            >
              {/* Thumbnail */}
              {module.thumbnailUrl ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted mb-5">
                  <img
                    src={module.thumbnailUrl}
                    alt={module.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted mb-5 flex items-center justify-center">
                  <FileText className="size-10 text-muted-foreground/40" />
                </div>
              )}

              {/* Price */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-foreground">
                  Free untuk member Remonest
                </p>
              </div>

              {/* CTA button */}
              <form
                action={enrollmentState !== "completed" ? onEnroll : undefined}
              >
                <button
                  type={enrollmentState === "completed" ? "button" : "submit"}
                  disabled={enrollmentState === "completed"}
                  className={buttonConfig.className}
                >
                  {enrollmentState === "completed" && (
                    <CheckCircle2 className="size-4" />
                  )}
                  {buttonConfig.label}
                </button>
              </form>

              {/* This module includes */}
              <div className="mt-5 pt-5 border-t border-border/50">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Modul ini mencakup
                </p>
                <ul className="space-y-2.5">
                  {displayIncludes.map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      {iconMap[item.icon] ?? (
                        <CheckCircle2 className="size-4 text-muted-foreground" />
                      )}
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
